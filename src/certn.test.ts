import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildScreeningChecks, orderScreeningCase } from './certn';

const TEMPLATE_ID = 'd3d32896-ac49-43fa-8291-3f0f7a398668';

function captureOrder(): { sent: { url: string; body: any }[]; restore: () => void } {
  const sent: { url: string; body: any }[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string, init: { body: string }) => {
    sent.push({ url, body: JSON.parse(init.body) });
    return { ok: true, json: async () => ({ id: 'case-1' }) };
  }) as unknown as typeof fetch;
  return { sent, restore: () => { globalThis.fetch = realFetch; } };
}

test('with a template, credit is ordered MULTI_REGION using that template', () => {
  const credit = buildScreeningChecks(TEMPLATE_ID).CREDIT_REPORT_1;
  assert.equal(credit.ordering_type, 'MULTI_REGION');
  assert.equal(credit.template_id, TEMPLATE_ID);
  assert.equal('umbrella_client_permitted_child_check_types' in credit, false);
});

test('without a template, credit falls back to a single Canadian report', () => {
  const credit = buildScreeningChecks().CREDIT_REPORT_1;
  assert.equal(credit.ordering_type, 'SINGLE_REGION');
  assert.deepEqual(credit.umbrella_client_permitted_child_check_types, ['CANADIAN_CREDIT_REPORT_1']);
  assert.equal('template_id' in credit, false);
});

test('template ID comes from the variable for the selected environment only', async () => {
  process.env.CERTN_PRODUCTION_CREDIT_TEMPLATE_ID = TEMPLATE_ID;
  delete process.env.CERTN_SANDBOX_CREDIT_TEMPLATE_ID;
  const { sent, restore } = captureOrder();
  try {
    await orderScreeningCase({ email: 'a@b.ca' }, { environment: 'production', apiKey: 'k' });
    await orderScreeningCase({ email: 'a@b.ca' }, { environment: 'sandbox', apiKey: 'k' });
  } finally {
    restore();
    delete process.env.CERTN_PRODUCTION_CREDIT_TEMPLATE_ID;
  }
  assert.equal(sent[0].url, 'https://api.ca.certn.co/api/public/cases/order/');
  assert.equal(sent[0].body.check_types_with_arguments.CREDIT_REPORT_1.template_id, TEMPLATE_ID);
  assert.equal(sent[1].url, 'https://api.sandbox.certn.co/api/public/cases/order/');
  assert.equal(sent[1].body.check_types_with_arguments.CREDIT_REPORT_1.ordering_type, 'SINGLE_REGION');
});
