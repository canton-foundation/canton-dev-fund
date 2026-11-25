# Harmonia executable workflow POC

This POC demonstrates a small, typed workflow and event model shared by independently compiled Daml application packages. It uses SDK `3.4.0-rc2`. It models a deliberately bounded event palette and does not claim full BPMN support.

## Package graph

```text
harmonia-core
   ^       ^
   |       |
 app-a   app-b
    \       /
     harmonia-test
```

`harmonia-core` is one stable shared package split into focused modules:

- `Harmonia.Core`: task input/result types, role bindings, and authority helpers;
- `Harmonia.Task`: the shared `WorkflowTask` interface;
- `Harmonia.DSL`: events, workflow nodes, outgoing `SequenceFlow` edges, and predecessor derivation;
- `Harmonia.Definition`: event configuration, graph, gateway compatibility, degree, and route validation;
- `Harmonia.Instance`: workflow state and the executable task-to-end slice;
- `Harmonia.ExecutionEvidence`: append-only traversal events and typed selected routes;
- `Harmonia.Gateway`: executable gateway checks and typed exclusive outcome routing.

Keeping these modules in one DAR avoids adding a fifth package and another generated-DAR dependency while retaining clear source boundaries. `app-a` and `app-b` depend on the Core DAR but not on each other. Their application-specific templates and review behavior remain in their own packages, where they implement `WorkflowTask` directly and statically. `harmonia-test` depends on all three DARs.

## Modeled event and graph DSL

`EventPosition` is `Start | Intermediate | End`. Event behavior belongs to `EventDefinition` as `NoDefinition`, `Catch EventTrigger`, or `Throw EventResult`.

The exact modeled palette is:

- Start: plain, timer catch, conditional catch, signal catch, message catch;
- Intermediate: plain; message, timer, conditional, and link catch; generic, escalation, and link throw;
- End: plain; message, escalation, error, compensation, signal, and terminate throw.

Definitions may contain multiple event nodes. Graph connectivity is represented only by outgoing `SequenceFlow` edges. Predecessors are derived by selecting flows whose target is the requested node and are never stored on nodes.

Gateways use the same typed-node composition: `GatewayNode` holds its `stepId`, `GatewayRole`, and `GatewayDefinition`. Roles are `Unspecified | Split | Join | Mixed`; definitions are `Exclusive | Parallel | Inclusive | EventBased | Complex`. All named values are representable. Event-based gateways are compatible only with the split role. Degree validation requires one incoming and one outgoing flow for unspecified gateways, one incoming and at least two outgoing flows for splits, at least two incoming and one outgoing flow for joins, and at least two flows in each direction for mixed gateways.

Definition creation validates unique node and flow IDs, valid event position/definition combinations, existing flow endpoints, gateway role/type compatibility, node degree constraints, predecessor presence outside the start node, and a plain start as the initial node. Exclusive, inclusive, and complex split or mixed routes require unique outcome labels. Other gateway routes and all non-gateway outgoing edges must be unlabeled.

## Executable slice

The only executable event path is:

```text
plain Start -> existing WorkflowTask -> generic Intermediate Throw
  -> exclusive outcome gateway -> approved or rejected plain End
```

`WorkflowInstance.ExecuteStep` is the sole public progression authority. It consumes the current instance, validates the supplied task's interface view against the definition, scalar current step, role binding, controller authority, and immutable signatory snapshot, then exercises `WorkflowTask.ExecuteTask`. It validates the resulting typed application state and processes the generic throw, exclusive gateway route, and plain end atomically before creating the successor instance. The same transaction creates one immutable `WorkflowExecutionEvent` for each traversed task, generic intermediate throw, exclusive gateway, and selected end. There is no public `ApplyTaskResult`, `ExecuteGateway`, or event choice progression bypass.

Only `Split + Exclusive` gateways are executable. Every other valid gateway role/type configuration is representable but aborts explicitly if reached at runtime; parallel paths and joins are not partially executed through the scalar `currentStepId`. Every other modeled event palette variant is likewise explicitly deferred and non-executable. The POC does not execute timer, condition, signal, message, link, escalation, error, compensation, or termination semantics. It also does not execute plain intermediate events or throw end behavior.

## Execution and authority

An application task returns a typed result contract. Its static `WorkflowResultState.routeDecision` implementation reads the concrete application state, such as `AppAReviewedTask.reviewOutcome`, to select a declared gateway route without a Core dependency on either application package or dynamic dispatch. The route helper returns a typed selection containing only execution data: decision, flow ID, and target ID. Runtime bindings represent UI-selected role-to-party assignments. Authority categories are:

- `InstanceStakeholder`: contributes the workflow owner/stakeholder parties to the `WorkflowInstance` signatory snapshot;
- `ObserverAuthority`: contributes only to the observer list;
- `TaskController`: authorizes a party as the controller for a role's task implementation;
- `AutomationDelegate`: marks the task implementation's declared controller as explicitly delegated for workflow binding validation.

The signatory snapshot is derived dynamically when an instance is created from exactly the assigned `InstanceStakeholder`, `TaskController`, and `AutomationDelegate` binding parties, with duplicates removed. The template invariant requires the stored snapshot to equal that derivation. Daml signatories cannot be changed in place: progression archives the old contract and creates a successor carrying the same bindings and snapshot. The successor stores the next deterministic evidence sequence and the typed selected route, but no evidence contract IDs.

Every evidence contract has one `DefinitionNodeRef` containing the versioned definition ID, the `ContractId WorkflowDefinition`, and the complete resolved `WorkflowStep` copied from that fetched immutable definition. `ExecuteStep` resolves each ref from the fetched `definition.steps` rather than constructing one from loose definition or node strings. The source node therefore identifies its category and all typed attributes without duplicating them in the action. A reached plain end remains an `EventStep` whose `EventNode` has `position = End`, `definition = NoDefinition`, and its terminal status. There is no separate end-node type.

Evidence actions contain execution data only: task completion records the task controller and typed result-state contract; event thrown and end reached are markers; gateway route selection records the decision, flow, and target without repeating gateway ID or type. Evidence contracts carry the same signatory snapshot and instance observers and declare no domain or progression choices. They are append-only products of the supported `ExecuteStep` path; as ordinary Daml templates they retain the platform's implicit archival behavior for signatories. Creating an instance requires authorization from every derived signatory.

The controller declared by an application template remains the actual controller of `ExecuteTask` and its concrete domain choice. Automation/delegate authority does not impersonate another party or bypass controllers on application/domain contracts. Because the consuming instance choice and nested interface/domain choices require different controllers, execution uses a multi-party command authorized by the instance signatory snapshot. This is the smallest faithful Daml authorization model; the workflow instance remains the only public progression choice. Application task contracts make the workflow owner an observer so the owner can validate the interface view while progressing an instance. They may also disclose the task to explicit observers without granting choice authority.

`ExecuteTask` is nonconsuming. Its fixed task view validates both the workflow instance and step, then fetches the supplied interface contract ID and requires its complete task view to match the exercised task before the static interface implementation converts that ID back to its concrete task contract ID and delegates. AppA delegates to the consuming `Review` choice, which consumes `AppAReviewTask`, creates `AppAReviewedTask`, and returns its concrete contract ID. AppB separately delegates to the consuming `PublishListing` choice, which consumes `AppBListingPublicationTask`, creates `AppBPublishedListingTask` under role `listing-publisher`, and returns its concrete contract ID. Only the concrete domain choice creates application state, so each interface execution performs exactly one task consumption and one state transition. Each static `WorkflowTask` implementation converts the concrete result ID to `ContractId WorkflowResultState` and wraps it in the Core `TaskResult`; concrete choices never construct or return Core routing results. `WorkflowInstance` therefore fetches and validates a real typed state contract before routing. The result interface standardizes validation fields while the concrete domain state and transition remain in each application package.

This model does not dynamically invoke arbitrary named Daml choices. Application templates implement the known `WorkflowTask` interface at compile time. Neither application package depends on the other.

## Build and test

From this directory:

```sh
daml build --package-root harmonia-core
daml build --package-root app-a
daml build --package-root app-b
daml build --package-root harmonia-test
daml test --package-root harmonia-test
```

The focused script covers:

- approved and rejected `Split + Exclusive` outcomes through the executable event path;
- representation of every gateway role and definition, compatibility and degree validation, and explicit runtime rejection of a valid deferred gateway;
- representation and explicit deferral of the complete event palette;
- predecessor derivation from sequence flows;
- invalid event configuration, dangling graph edge, and duplicate gateway route rejection;
- direct execution of the consuming AppA `Review` and AppB `PublishListing` choices, asserting their concrete domain contract IDs and state;
- atomic progression through consuming `WorkflowInstance.ExecuteStep`, which delegates through nonconsuming `ExecuteTask` on `ContractId WorkflowTask`, leaves the concrete AppA/AppB source task inactive, archives the old instance, and creates its successor;
- exactly four ordered append-only evidence events for approved and rejected AppA runs, including complete typed definition-node refs for the task, intermediate throw, gateway, and plain end, plus separate action data, identity, and stakeholder snapshots;
- concrete-state gateway decisions and typed selected-route persistence without evidence IDs on the successor;
- creation and typed linkage of `AppAReviewedTask` and the distinct `AppBPublishedListingTask` domain states;
- failed atomic progression for wrong task instance, step, role, role authority, and signatory snapshot, with both source task and old instance preserved;
- absence of a public `ApplyTaskResult` choice, preventing result-only progression bypass;
- instance signatories derived only from the exact assigned stakeholder and task-authority bindings, never from a role catalog;
- an observer-only party rejected when attempting either interface or concrete task execution, without consuming the source;
- an app task whose controller does not match the role binding rejected during instance progression.

## Deliberate limitations

This is a closed, minimal executable DSL, not a generic BPMN engine and not a claim of full BPMN support. It has no BPMN XML parsing and no runtime support for parallel paths, joins, inclusive, event-based, or complex gateway behavior, subprocesses, loops, multi-task continuation, event subscriptions, correlation, boundary events, or runtime event delivery. Representability in the palette does not imply execution.

It does not prove Canton deployment topology, participant administration, synchronizer behavior, production identity setup, privacy guarantees, recovery, performance, or package upgrades. Static Daml interface implementations do not retrofit interfaces onto templates in already compiled foreign DARs.
