import TenancyDiagram from './TenancyDiagram'

export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="kicker-row">
          <div>
            <div className="eyebrow">Ontario · Landlord-pays screening</div>
            <h1 className="headline">
              Legal support on <em>both ends</em> of a tenancy.
            </h1>
            <p className="lede">
              Every $45 Landward report includes a CanLII litigation &amp; LTB check at no extra charge —
              the applicant's history in public court and tribunal decisions, searched for you and bundled
              with credit, background, and identity verification. And if a tenancy still goes wrong, we
              connect you directly with our vetted network of licensed Ontario paralegals and lawyers for
              Landlord and Tenant Board and Small Claims Court representation, free of charge. Most
              screening services stop at the report. We don't.
            </p>
            <div className="hero-ctas">
              <a href="#get-started" className="btn btn-primary">
                Screen your next applicant — $45
              </a>
              <a href="#how" className="btn btn-ghost">
                See how it works
              </a>
            </div>
          </div>
          <div className="hero-file mono">
            FILE NO. LW–2026–ON
            <br />
            JURISDICTION: ONTARIO
            <br />
            STATUS: PRE-LAUNCH
          </div>
        </div>

        <TenancyDiagram />
      </div>
    </section>
  )
}
