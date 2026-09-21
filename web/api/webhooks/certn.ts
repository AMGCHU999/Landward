// Vercel serverless receiver for Certn Centric webhooks (CASE_REPORT_READY).
// Register https://<your-domain>/api/webhooks/certn in the Certn Client Portal
// (Integrations > Webhooks), once for sandbox and once for production.
import { createHmac, timingSafeEqual } from 'node:crypto';

type CertnEnvironment = 'sandbox' | 'production';

interface CertnWebhookEvent {
  created: string;
  event_id: string;
  event_type: string;
  object_id: string;
  object_type: string;
  case_status?: string;
}

// Each Certn environment issues its own signing key when the webhook is created.
const SIGNING_SECRET_VARS: Record<CertnEnvironment, string> = {
  sandbox: 'CERTN_SANDBOX_WEBHOOK_SECRET',
  production: 'CERTN_PRODUCTION_WEBHOOK_SECRET',
};

// Returns the environment whose signing key produced this signature, or null.
// Certn signs the raw body with HMAC-SHA256 and sends the hex digest in X-Signature.
function identifySender(rawBody: string, signature: string | null): CertnEnvironment | null {
  if (!signature) return null;
  const received = Buffer.from(signature.trim(), 'utf8');

  for (const environment of Object.keys(SIGNING_SECRET_VARS) as CertnEnvironment[]) {
    const secret = process.env[SIGNING_SECRET_VARS[environment]];
    if (!secret) continue; // fail closed: an unset secret never matches
    const expected = Buffer.from(createHmac('sha256', secret).update(rawBody).digest('hex'), 'utf8');
    if (received.length === expected.length && timingSafeEqual(received, expected)) {
      return environment;
    }
  }
  return null;
}

async function handleCaseReportReady(event: CertnWebhookEvent, environment: CertnEnvironment) {
  // object_id is the Certn case ID. Fetch the report and run it through the risk
  // evaluator here; keep this fast, Certn expects a response within 10 seconds.
  console.log(
    `[certn:${environment}] CASE_REPORT_READY event=${event.event_id} case=${event.object_id} status=${event.case_status}`
  );
}

// Endpoint verification: Certn sends GET ?challenge=... when a webhook URL is added
// (and periodically after) and requires the value echoed back within 10 seconds.
export async function GET(request: Request): Promise<Response> {
  const challenge = new URL(request.url).searchParams.get('challenge');
  if (challenge === null) {
    return new Response('Missing challenge', { status: 400 });
  }
  return new Response(challenge, {
    status: 200,
    headers: { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' },
  });
}

export async function POST(request: Request): Promise<Response> {
  // The signature covers the exact bytes sent, so read the raw text before parsing.
  const rawBody = await request.text();

  const environment = identifySender(rawBody, request.headers.get('x-signature'));
  if (!environment) {
    return new Response('Invalid signature', { status: 403 });
  }

  let event: CertnWebhookEvent;
  try {
    event = JSON.parse(rawBody) as CertnWebhookEvent;
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // Other event types are acknowledged so Certn does not retry them.
  if (event.event_type !== 'CASE_REPORT_READY') {
    return new Response(null, { status: 200 });
  }

  try {
    await handleCaseReportReady(event, environment);
  } catch (error) {
    // A non-2xx makes Certn retry with backoff for about 2 hours.
    console.error(`[certn:${environment}] failed to handle event ${event.event_id}`, error);
    return new Response('Handler failed', { status: 500 });
  }

  return new Response(null, { status: 200 });
}
