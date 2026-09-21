// Mirrors src/certn.ts (root project, CommonJS) so the Vite dev-server middleware can
// import it as a clean ESM module — the root src/ tree defaults to CommonJS module
// format under Node's package.json resolution, which conflicts with this project's
// nodenext + verbatimModuleSyntax settings when imported directly across the boundary.
export type CertnEnvironment = 'sandbox' | 'production'

// Production is the Canada region (Landward screens Ontario tenants).
const CERTN_BASE_URLS: Record<CertnEnvironment, string> = {
  sandbox: 'https://api.sandbox.certn.co',
  production: 'https://api.ca.certn.co',
}

const CERTN_API_KEY_VARS: Record<CertnEnvironment, string> = {
  sandbox: 'CERTN_SANDBOX_API_KEY',
  production: 'CERTN_PRODUCTION_API_KEY',
}

export type CertnCheckArguments = Record<string, Record<string, unknown>>

export const LANDWARD_SCREENING_CHECKS: CertnCheckArguments = {
  IDENTITY_VERIFICATION_1: {},
  CREDIT_REPORT_1: {
    ordering_type: 'SINGLE_REGION',
    umbrella_client_permitted_child_check_types: ['CANADIAN_CREDIT_REPORT_1'],
    INCLUDE_PREVIOUS_NAMES: true,
  },
}

export interface CertnScreeningRequest {
  email: string
  sendInviteEmail?: boolean
}

export interface CertnCaseResponse {
  id: string
  invite_link?: string
  [key: string]: unknown
}

export interface CertnClientOptions {
  environment?: CertnEnvironment
  apiKey?: string
}

export function resolveCertnEnvironment(
  value: string | undefined = process.env.CERTN_ENV,
): CertnEnvironment {
  if (!value) return 'sandbox'
  if (value === 'sandbox' || value === 'production') return value
  throw new Error(`Invalid CERTN_ENV "${value}". Use "sandbox" or "production".`)
}

export async function orderScreeningCase(
  request: CertnScreeningRequest,
  options: CertnClientOptions = {},
): Promise<CertnCaseResponse> {
  const environment = options.environment ?? resolveCertnEnvironment()
  const keyVar = CERTN_API_KEY_VARS[environment]
  const apiKey = options.apiKey ?? process.env[keyVar]
  if (!apiKey) {
    throw new Error(`Missing Certn ${environment} API key. Set ${keyVar} or pass apiKey explicitly.`)
  }
  if (!request.email || !request.email.includes('@')) {
    throw new Error('A valid applicant email is required.')
  }

  const sendInviteEmail = request.sendInviteEmail ?? true
  const response = await fetch(`${CERTN_BASE_URLS[environment]}/api/public/cases/order/`, {
    method: 'POST',
    headers: {
      Authorization: `Api-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: request.email,
      send_invite_email: sendInviteEmail,
      return_invite_link: !sendInviteEmail,
      check_types_with_arguments: LANDWARD_SCREENING_CHECKS,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Certn ${environment} API error ${response.status}: ${body}`)
  }

  return response.json() as Promise<CertnCaseResponse>
}
