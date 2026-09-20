// Mirrors src/certn.ts (root project, CommonJS) so the Vite dev-server middleware can
// import it as a clean ESM module — the root src/ tree defaults to CommonJS module
// format under Node's package.json resolution, which conflicts with this project's
// nodenext + verbatimModuleSyntax settings when imported directly across the boundary.
const CERTN_API_BASE = 'https://api.certn.co'

export interface CertnAddress {
  address: string
  city: string
  province_state: string
  country: string
  postal_code: string
}

export interface CertnApplicantPayload {
  tag: string
  email: string
  phone_number: {
    country_code: string
    number: string
  }
  package_id: string
  information: {
    first_name: string
    last_name: string
    addresses: CertnAddress[]
  }
  position_or_property_location: CertnAddress
}

export interface CertnApplicantResponse {
  id: string
  [key: string]: unknown
}

export async function createApplicant(
  payload: CertnApplicantPayload,
  apiKey: string | undefined = process.env.CERTN_API_KEY,
): Promise<CertnApplicantResponse> {
  if (!apiKey) {
    throw new Error('Missing Certn API key. Set CERTN_API_KEY or pass apiKey explicitly.')
  }

  const response = await fetch(`${CERTN_API_BASE}/api/v1/hr/applicants/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Certn API error ${response.status}: ${body}`)
  }

  return response.json() as Promise<CertnApplicantResponse>
}
