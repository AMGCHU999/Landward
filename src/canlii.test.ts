import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  browseCases,
  findLitigationByName,
  getCaseMetadata,
  listCaseDatabases,
  resolveLtbDatabaseId,
} from './canlii';

const API_KEY = 'test-key';

function mockFetch(routes: Record<string, unknown>): { urls: string[]; restore: () => void } {
  const urls: string[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string) => {
    urls.push(url);
    const path = url.split('?')[0].replace('https://api.canlii.org', '');
    if (!(path in routes)) {
      return { ok: false, status: 404, text: async () => 'not found' };
    }
    return { ok: true, json: async () => routes[path] };
  }) as unknown as typeof fetch;
  return { urls, restore: () => { globalThis.fetch = realFetch; } };
}

test('listCaseDatabases hits the caseBrowse root and returns databases', async () => {
  const { urls, restore } = mockFetch({
    '/v1/caseBrowse/en/': { caseDatabases: [{ databaseId: 'onltb', jurisdiction: 'on', name: 'Landlord and Tenant Board' }] },
  });
  try {
    const dbs = await listCaseDatabases({ apiKey: API_KEY });
    assert.equal(urls[0].split('?')[0], 'https://api.canlii.org/v1/caseBrowse/en/');
    assert.ok(urls[0].includes('api_key=test-key'));
    assert.deepEqual(dbs, [{ databaseId: 'onltb', jurisdiction: 'on', name: 'Landlord and Tenant Board' }]);
  } finally {
    restore();
  }
});

test('browseCases defaults to the LTB database with date filters', async () => {
  delete process.env.CANLII_LTB_DATABASE_ID;
  const { urls, restore } = mockFetch({
    '/v1/caseBrowse/en/onltb/': { cases: [] },
  });
  try {
    const cases = await browseCases({ apiKey: API_KEY, decisionDateAfter: '2020-01-01', resultCount: 50 });
    assert.equal(cases.length, 0);
    const url = urls[0];
    assert.ok(url.startsWith('https://api.canlii.org/v1/caseBrowse/en/onltb/'));
    assert.ok(url.includes('decisionDateAfter=2020-01-01'));
    assert.ok(url.includes('resultCount=50'));
    assert.ok(url.includes('offset=0'));
  } finally {
    restore();
  }
});

test('resolveLtbDatabaseId honors the env override', () => {
  process.env.CANLII_LTB_DATABASE_ID = 'onltb-custom';
  assert.equal(resolveLtbDatabaseId(), 'onltb-custom');
  delete process.env.CANLII_LTB_DATABASE_ID;
  assert.equal(resolveLtbDatabaseId(), 'onltb');
});

test('getCaseMetadata fetches one decision', async () => {
  const { urls, restore } = mockFetch({
    '/v1/caseBrowse/en/onltb/2024onltb123/': {
      databaseId: 'onltb',
      caseId: '2024onltb123',
      title: 'Smith v Jones',
      citation: '2024 ONLTB 123',
      url: 'https://www.canlii.org/en/on/onltb/doc/2024/2024onltb123/2024onltb123.html',
      decisionDate: '2024-03-15',
      docketNumber: 'LTB-L-12345-24',
    },
  });
  try {
    const meta = await getCaseMetadata('onltb', '2024onltb123', { apiKey: API_KEY });
    assert.equal(meta.title, 'Smith v Jones');
    assert.equal(meta.docketNumber, 'LTB-L-12345-24');
    assert.ok(urls[0].endsWith('/v1/caseBrowse/en/onltb/2024onltb123/') || urls[0].includes('/2024onltb123/'));
  } finally {
    restore();
  }
});

test('findLitigationByName matches titles client-side and maps to litigation records', async () => {
  const { restore } = mockFetch({
    '/v1/caseBrowse/en/onltb/': {
      cases: [
        { databaseId: 'onltb', caseId: '2024onltb1', title: 'Landlord Corp v Jane Doe', citation: '2024 ONLTB 1' },
        { databaseId: 'onltb', caseId: '2024onltb2', title: 'Someone v Someone Else', citation: '2024 ONLTB 2' },
      ],
    },
    '/v1/caseBrowse/en/onltb/2024onltb1/': {
      databaseId: 'onltb',
      caseId: '2024onltb1',
      title: 'Landlord Corp v Jane Doe',
      citation: '2024 ONLTB 1',
      url: 'https://www.canlii.org/en/on/onltb/doc/2024/2024onltb1/2024onltb1.html',
      decisionDate: '2024-05-01',
      docketNumber: 'LTB-L-00001-24',
    },
  });
  try {
    const records = await findLitigationByName('Jane Doe', {
      apiKey: API_KEY,
      maxCases: 100,
      decisionDateAfter: '2020-01-01',
    });
    assert.equal(records.length, 1);
    assert.equal(records[0].source, 'LTB');
    assert.equal(records[0].case_number, 'LTB-L-00001-24');
    assert.equal(records[0].date, '2024-05-01');
    assert.ok(records[0].narrative.includes('Landlord Corp v Jane Doe'));
  } finally {
    restore();
  }
});

test('findLitigationByName requires a name and an API key', async () => {
  await assert.rejects(() => findLitigationByName('   ', { apiKey: API_KEY }), /name is required/);
  delete process.env.CANLII_API_KEY;
  await assert.rejects(() => listCaseDatabases(), /Missing CanLII API key/);
});
