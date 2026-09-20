const items = [
  'Billed to the landlord, never the applicant',
  'Ontario Human Rights Code screening criteria applied correctly',
  'Free CanLII litigation & LTB check on every report',
  'Dedicated legal network on call',
]

export default function TrustBar() {
  return (
    <div className="rule">
      <div className="wrap trust-bar">
        {items.map((item) => (
          <span key={item} className="mono trust-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
