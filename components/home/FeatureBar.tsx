import "./FeatureBar.css";

const features = [
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M16 27C16 27 4 21.8 4 13.2C4 9.8 6.5 7 9.7 7C12.2 7 14.2 8.5 16 10.5C17.8 8.5 19.8 7 22.3 7C25.5 7 28 9.8 28 13.2C28 21.8 16 27 16 27Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 7C9.4 4.8 10.8 3 13 3.8C14.5 4.3 15.4 6.2 16 10.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M22 7C22.6 4.8 21.2 3 19 3.8C17.5 4.3 16.6 6.2 16 10.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Premium Fabrics",
    desc: "Carefully selected for quality and comfort.",
  },

  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M5 24L11 18L14 21L27 8"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 8H27V14"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 27L12 23"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M4 20L8 24"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Built to Last",
    desc: "Durable stitching and everyday resilience.",
  },

  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M10 7L16 4L22 7L27 12L23 16L21 14V27H11V14L9 16L5 12L10 7Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 7L13 12H19L22 7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Modern Fits",
    desc: "Perfect balance of comfort and style.",
  },

  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M9 8H23C25.2 8 27 9.8 27 12V24C27 26.2 25.2 28 23 28H9C6.8 28 5 26.2 5 24V12C5 9.8 6.8 8 9 8Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M9 8L13 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M13 4L16 8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 18H9L12 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 18C9 20.2 10.8 22 13 22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Easy Returns",
    desc: "Hassle-free returns within 7 days.",
  },
];

export default function FeatureBar() {
  return (
    <section className="feature-bar">
      <div className="feature-bar-inner">
        {features.map((feature, index) => (
          <div className="feature-bar-item" key={feature.title}>
            <div className="feature-bar-icon">{feature.icon}</div>

            <div className="feature-bar-content">
              <p className="feature-bar-title">{feature.title}</p>
              <p className="feature-bar-desc">{feature.desc}</p>
            </div>

            {index !== features.length - 1 && (
              <span className="feature-bar-divider" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
