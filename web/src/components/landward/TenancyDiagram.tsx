export default function TenancyDiagram() {
  return (
    <figure className="diagram-shell ticked">
      <svg
        className="tenancy"
        viewBox="0 0 980 300"
        role="img"
        aria-label="Diagram of a tenancy timeline. Landward is involved at two points: a screening gate at the start, and, only on a dashed branch representing a dispute or default, a legal-representation gate at the Landlord and Tenant Board or Small Claims Court. The straight path with no dispute runs quietly to lease end without Landward's involvement."
      >
        <text x="4" y="16" className="lbl-tag mono">FIG. 01 — TENANCY TIMELINE</text>

        <line x1="40" y1="150" x2="930" y2="150" className="axis" strokeDasharray="1 4" />

        <circle cx="50" cy="150" r="4.5" className="node" />
        <text x="50" y="132" className="lbl" textAnchor="middle">Application</text>

        <rect x="110" y="128" width="140" height="44" className="gate" />
        <text x="180" y="154" className="lbl" textAnchor="middle" fontWeight="600">Screening</text>
        <text x="180" y="120" className="lbl-tag" textAnchor="middle">FRONT END</text>

        <line x1="250" y1="150" x2="330" y2="150" className="quiet" />
        <circle cx="330" cy="150" r="4.5" className="node" />
        <text x="330" y="132" className="lbl" textAnchor="middle">Approved · move-in</text>

        <line x1="330" y1="150" x2="560" y2="150" className="quiet" />
        <text x="445" y="176" className="lbl-soft" textAnchor="middle">tenancy in progress — Landward stays out of the way</text>

        <circle cx="560" cy="150" r="4" className="node" />

        <line x1="560" y1="150" x2="900" y2="150" className="main" />
        <text x="900" y="132" className="lbl" textAnchor="end" fontWeight="600">Lease ends</text>
        <text x="900" y="118" className="lbl-tag" textAnchor="end">MOST TENANCIES</text>

        <path d="M560,150 C600,150 610,225 650,225 L690,225" className="branch" />
        <circle cx="690" cy="225" r="4.5" className="node-branch" />
        <text x="690" y="207" className="lbl" textAnchor="middle">Dispute or default</text>

        <line x1="690" y1="225" x2="750" y2="225" className="branch" />
        <rect x="750" y="203" width="150" height="44" className="gate-branch" />
        <text x="825" y="229" className="lbl" textAnchor="middle" fontWeight="600">LTB · Small Claims</text>
        <text x="825" y="195" className="lbl-tag-brass" textAnchor="middle">BACK END</text>
      </svg>
      <figcaption>
        Landward touches the tenancy twice, on purpose: once at <strong>screening</strong>, before an
        applicant is approved, and again — only if a tenant defaults or a dispute comes up — through a{' '}
        <strong>free, direct referral</strong> to licensed Ontario paralegals and lawyers for LTB and Small
        Claims Court representation. Everything in between is the landlord's to run.
      </figcaption>
    </figure>
  )
}
