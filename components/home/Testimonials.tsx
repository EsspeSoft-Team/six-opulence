const testimonials = [
  { name: "Arjun M.", text: "Fabric quality onek bhalo, fit-o perfect. Worth every rupee." },
  { name: "Rohan S.", text: "Limited edition mane serious limited — amar size sold out hoye gechilo dui din-e." },
  { name: "Kabir D.", text: "Design ta unique, market-e ei rokom kichu dekhini age." },
];

export default function Testimonials() {
  return (
    <section className="section">
      <h2 className="section-title">What Customers Say</h2>
      <div className="grid grid-3">
        {testimonials.map((t, i) => (
          <div key={i} className="testimonial-card">
            <p className="testimonial-text">"{t.text}"</p>
            <p className="testimonial-name">— {t.name}</p>
          </div>
        ))}
      </div>
      <p className="note">
        Placeholder content — real reviews-r jonno ekta review app (Judge.me
        / Loox) integrate korte hobe.
      </p>
    </section>
  );
}
