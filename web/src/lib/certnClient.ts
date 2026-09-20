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

export async function submitScreeningApplicant(payload: CertnApplicantPayload) {
  const response = await fetch('/api/certn/applicants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const body = await response.json()
  if (!response.ok) {
    throw new Error(body.error || `Request failed with status ${response.status}`)
  }
  return body
}
