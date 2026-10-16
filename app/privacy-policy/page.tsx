import Link from "next/link";
import "./privacy-policy.css";

export default function PrivacyPolicyPage() {
  return (
    <main className="policy-page">
      {/* HERO */}
      <section className="policy-hero">
        <div className="policy-hero-inner">
          <span className="policy-eyebrow">OPULENCE</span>

          <h1>Privacy Policy</h1>

          <p>
            Your privacy matters to us. Learn how OPULENCE collects, uses,
            protects, and handles your information.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="policy-content">
        <div className="policy-container">
          <p className="policy-updated">Last updated: October 7, 2026</p>

          <div className="policy-section">
            <h2>1. Introduction</h2>

            <p>
              Welcome to OPULENCE. We respect your privacy and are committed to
              protecting the personal information you share with us when you
              visit our website, create an account, place an order, or interact
              with our services.
            </p>

            <p>
              This Privacy Policy explains what information we collect, how we
              use it, how we protect it, and the choices available to you.
            </p>
          </div>

          <div className="policy-section">
            <h2>2. Information We Collect</h2>

            <p>
              We may collect information that you provide directly to us,
              including:
            </p>

            <ul>
              <li>Your name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Billing and shipping address</li>
              <li>Account information</li>
              <li>Order and purchase information</li>
              <li>Product preferences and interactions</li>
              <li>Information you provide when contacting customer support</li>
            </ul>

            <p>
              We may also automatically collect certain technical information
              when you use our website, such as your IP address, browser type,
              device information, pages visited, and general website usage
              information.
            </p>
          </div>

          <div className="policy-section">
            <h2>3. How We Use Your Information</h2>

            <p>We may use your information to:</p>

            <ul>
              <li>Process and fulfill your orders</li>
              <li>Manage your customer account</li>
              <li>Provide order and delivery updates</li>
              <li>Process payments and related transactions</li>
              <li>Provide customer support</li>
              <li>Improve our products, services, and website</li>
              <li>Personalize your shopping experience</li>
              <li>Prevent fraud and protect our website</li>
              <li>Comply with applicable legal requirements</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>4. Payment Information</h2>

            <p>
              Payments made through our website may be processed by third-party
              payment providers. We do not necessarily store complete payment
              card details on our own servers.
            </p>

            <p>
              Payment information is handled according to the privacy and
              security practices of the applicable payment provider.
            </p>
          </div>

          <div className="policy-section">
            <h2>5. Cookies and Similar Technologies</h2>

            <p>
              We may use cookies and similar technologies to help operate our
              website, remember preferences, understand website usage, and
              improve your shopping experience.
            </p>

            <p>
              You can control or disable cookies through your browser settings.
              However, disabling certain cookies may affect some website
              functionality.
            </p>
          </div>

          <div className="policy-section">
            <h2>6. Sharing of Information</h2>

            <p>We do not sell your personal information.</p>

            <p>
              We may share necessary information with trusted service providers
              who help us operate our business, including payment processors,
              shipping and delivery partners, website technology providers,
              analytics providers, and customer support services.
            </p>

            <p>
              These providers receive only the information reasonably necessary
              to perform their services.
            </p>
          </div>

          <div className="policy-section">
            <h2>7. Data Security</h2>

            <p>
              We take reasonable technical and organizational measures to
              protect your personal information against unauthorized access,
              loss, misuse, alteration, or disclosure.
            </p>

            <p>
              However, no method of transmission or electronic storage can be
              guaranteed to be completely secure.
            </p>
          </div>

          <div className="policy-section">
            <h2>8. Account Information</h2>

            <p>
              If you create an OPULENCE account, you are responsible for keeping
              your account credentials confidential and for notifying us if you
              believe your account has been accessed without authorization.
            </p>
          </div>

          <div className="policy-section">
            <h2>9. Your Privacy Choices</h2>

            <p>
              Depending on applicable law, you may have rights relating to your
              personal information, including the ability to request access,
              correction, or deletion of certain information.
            </p>

            <p>
              You may also contact us if you wish to update your personal
              information or have questions about how your information is
              handled.
            </p>
          </div>

          <div className="policy-section">
            <h2>10. Third-Party Links</h2>

            <p>
              Our website may contain links to third-party websites or services.
              We are not responsible for the privacy practices, security, or
              content of third-party websites.
            </p>

            <p>
              We recommend reviewing the privacy policies of those websites
              before providing them with your personal information.
            </p>
          </div>

          <div className="policy-section">
            <h2>11. Children's Privacy</h2>

            <p>
              Our services are not intended for children who are not legally
              permitted to make purchases or provide personal information under
              applicable law.
            </p>
          </div>

          <div className="policy-section">
            <h2>12. Changes to This Privacy Policy</h2>

            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our services, business practices, or applicable
              requirements.
            </p>

            <p>
              Any updated version will be posted on this page with a revised
              effective date.
            </p>
          </div>

          <div className="policy-section">
            <h2>13. Contact Us</h2>

            <p>
              If you have questions about this Privacy Policy or how your
              personal information is handled, please contact us.
            </p>

            <div className="policy-contact">
              <strong>OPULENCE</strong>
              <span>Email: support@opulence.com</span>
            </div>
          </div>

          {/* BACK */}
          <div className="policy-back">
            <Link href="/">Back to Home</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
