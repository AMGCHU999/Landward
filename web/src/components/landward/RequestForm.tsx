import { useState, type FormEvent } from 'react'

export default function RequestForm() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return

    const data = new FormData(form)
    const name = (data.get('name') || '').toString()
    const lines = [
      `Name: ${name}`,
      `Email: ${data.get('email') || ''}`,
      `Portfolio size: ${data.get('size') || ''}`,
      `City / region: ${data.get('region') || '(not provided)'}`,
      '',
      'Message:',
      (data.get('message') || '(none)').toString(),
    ]
    const subject = encodeURIComponent(`Landward early access request${name ? ` — ${name}` : ''}`)
    const body = encodeURIComponent(lines.join('\n'))
    window.location.href = `mailto:hello@landward.ca?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  return (
    <form id="request-form" className="request-form" noValidate onSubmit={handleSubmit}>
      <div className="form-row">
        <label className="form-field">
          <span>Name</span>
          <input type="text" name="name" required autoComplete="name" />
        </label>
        <label className="form-field">
          <span>Email</span>
          <input type="email" name="email" required autoComplete="email" />
        </label>
      </div>
      <div className="form-row">
        <label className="form-field">
          <span>Portfolio size</span>
          <select name="size" defaultValue="2-15 units">
            <option value="1 unit">1 unit</option>
            <option value="2-15 units">2–15 units</option>
            <option value="50+ units / property management company">
              50+ units / property management company
            </option>
          </select>
        </label>
        <label className="form-field">
          <span>City / region</span>
          <input type="text" name="region" autoComplete="address-level2" placeholder="e.g. Ottawa, ON" />
        </label>
      </div>
      <label className="form-field">
        <span>Anything else? (optional)</span>
        <textarea
          name="message"
          rows={3}
          placeholder="How many applicants a year, current screening process, questions..."
        />
      </label>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Send request
        </button>
        <span className="form-note">
          Opens your email client, addressed to <span className="mono">hello@landward.ca</span> — nothing
          is sent anywhere else.
        </span>
      </div>
      {submitted && (
        <p className="form-confirm">
          Thanks — your email client should have opened with your details filled in. If it didn't, email us
          directly at <span className="mono">hello@landward.ca</span>.
        </p>
      )}
    </form>
  )
}
