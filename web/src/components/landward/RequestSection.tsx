import RequestForm from './RequestForm'

export default function RequestSection() {
  return (
    <section id="get-started" className="section-surface-sunk">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Request access</div>
          <h2>Tell us about your portfolio — we'll follow up directly.</h2>
          <p>
            Landward is pre-launch: bureau and CanLII integrations are still being connected (see the
            footer). Send us your details now and we'll reach out as soon as we can process your first
            applicant.
          </p>
        </div>
        <RequestForm />
      </div>
    </section>
  )
}
