const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const workflow = fs.readFileSync(
  path.join(__dirname, '../.github/workflows/rfp-category-check.yml'), 'utf8',
).replace(/\r\n/g, '\n');
const source = workflow.split('          script: |\n')[1]
  .split('\n').map(line => line.replace(/^ {12}/, '')).join('\n');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const checkCategory = new AsyncFunction('github', 'context', 'console', source);

function runCheck(getContent) {
  const mutations = [];
  const record = async args => { mutations.push(args); };
  const github = { rest: {
    pulls: {
      listFiles: async () => ({ data: [{ filename: 'proposals/example.md' }] }),
      update: record,
    },
    repos: { getContent },
    issues: { addLabels: record, createComment: record },
  } };
  const context = {
    repo: { owner: 'example', repo: 'dev-fund' },
    payload: { pull_request: {
      number: 1, body: '', labels: [], user: { login: 'contributor' },
      head: { ref: 'proposal', repo: { owner: { login: 'contributor' }, name: 'dev-fund' } },
    } },
  };
  return {
    mutations,
    result: checkCategory(github, context, { log() {} }),
  };
}

test('a failed proposal read fails the check without closing or labelling the PR', async () => {
  const { mutations, result } = runCheck(async () => { throw new Error('Service unavailable'); });
  await assert.rejects(result, /Service unavailable/);
  assert.deepEqual(mutations, []);
});

test('a successfully read proposal still receives its matching RFP label', async () => {
  const { mutations, result } = runCheck(async () => ({
    data: { content: Buffer.from('Responds to RFP-17.').toString('base64') },
  }));
  await result;
  assert.equal(mutations.length, 1);
  assert.deepEqual(mutations[0].labels, ['rfp-17:language-sdks']);
});

test('a successfully read proposal without an RFP still follows the existing closure policy', async () => {
  const { mutations, result } = runCheck(async () => ({
    data: { content: Buffer.from('No category is supplied.').toString('base64') },
  }));
  await result;
  assert.equal(mutations.length, 3);
  assert.equal(mutations[1].state, 'closed');
  assert.deepEqual(mutations[2].labels, ['needs-rfp-category']);
});
