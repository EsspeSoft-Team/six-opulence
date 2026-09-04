const trustPoints = [
  { icon: "🚚", title: "Free Shipping", desc: "On all prepaid orders" },
  { icon: "🔒", title: "Secure Payments", desc: "100% encrypted checkout" },
  { icon: "↩️", title: "Easy Returns", desc: "7-day return window" },
  { icon: "✅", title: "Authenticity Guaranteed", desc: "Limited edition, verified" },
];

export default function TrustBar() {
  return (
    <section className="trust-bar">
      {trustPoints.map((point) => (
        <div key={point.title}>
          <div className="trust-icon">{point.icon}</div>
          <p className="trust-title">{point.title}</p>
          <p className="trust-desc">{point.desc}</p>
        </div>
      ))}
    </section>
  );
}
