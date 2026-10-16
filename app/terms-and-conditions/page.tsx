import "./terms-and-conditions.css";
import Link from "next/link";

export default function TermsAndConditionsPage() {
  return (
    <main className="terms-page">
      {/* HERO */}
      <section className="terms-hero">
        <div className="terms-hero-inner">
          <span className="terms-eyebrow">OPULENCE</span>

          <h1>Terms & Conditions</h1>

          <p>
            Please read these terms carefully before using the OPULENCE website
            or placing an order.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="terms-content">
        <div className="terms-container">
          <p className="terms-updated">Last updated: October 7, 2026</p>

          <div className="terms-section">
            <h2>1. Introduction</h2>

            <p>
              These Terms & Conditions govern your use of the OPULENCE website
              and the purchase of products available through our online store.
            </p>

            <p>
              By accessing or using our website, you agree to be bound by these
              Terms & Conditions. If you do not agree with any part of these
              terms, please do not use our website.
            </p>
          </div>

          <div className="terms-section">
            <h2>2. About OPULENCE</h2>

            <p>
              OPULENCE is an online fashion and lifestyle store offering curated
              products through its website.
            </p>

            <p>
              Product information, pricing, availability, images, and other
              details displayed on the website may be updated from time to time.
            </p>
          </div>

          <div className="terms-section">
            <h2>3. Eligibility</h2>

            <p>
              By using this website, you confirm that you are legally capable of
              entering into a binding agreement under applicable law.
            </p>

            <p>
              If you are purchasing on behalf of another person or entity, you
              confirm that you have the authority to do so.
            </p>
          </div>

          <div className="terms-section">
            <h2>4. Product Information</h2>

            <p>
              We make reasonable efforts to ensure that product descriptions,
              images, colours, sizes, prices, and other information displayed on
              the website are accurate.
            </p>

            <p>
              However, colours may appear slightly different depending on your
              device, screen settings, lighting, or display configuration.
            </p>

            <p>
              We reserve the right to correct errors, update product
              information, or modify product availability at any time.
            </p>
          </div>

          <div className="terms-section">
            <h2>5. Pricing</h2>

            <p>
              All product prices displayed on the website are shown in Indian
              Rupees unless otherwise stated.
            </p>

            <p>
              Prices, discounts, promotional offers, and availability may change
              without prior notice.
            </p>

            <p>
              If an incorrect price is displayed due to a technical or
              administrative error, we reserve the right to cancel the affected
              order and provide an appropriate resolution.
            </p>
          </div>

          <div className="terms-section">
            <h2>6. Orders</h2>

            <p>
              When you place an order through our website, you are making a
              request to purchase the selected products.
            </p>

            <p>
              An order is considered accepted only after the order has been
              successfully processed and confirmed by OPULENCE.
            </p>

            <p>
              We reserve the right to refuse or cancel an order in cases
              including product unavailability, pricing errors, suspected
              fraudulent activity, or other circumstances that prevent us from
              fulfilling the order.
            </p>
          </div>

          <div className="terms-section">
            <h2>7. Payments</h2>

            <p>
              Payments are processed through the payment methods and payment
              providers made available during checkout.
            </p>

            <p>
              You agree to provide accurate and complete payment and billing
              information when placing an order.
            </p>

            <p>
              An order may be cancelled or placed on hold if payment cannot be
              successfully verified or completed.
            </p>
          </div>

          <div className="terms-section">
            <h2>8. Shipping & Delivery</h2>

            <p>
              Orders are shipped to the address provided during checkout.
              Customers are responsible for ensuring that the shipping
              information provided is accurate and complete.
            </p>

            <p>
              Delivery timelines may vary depending on the destination,
              availability, courier operations, weather, holidays, or other
              circumstances beyond our reasonable control.
            </p>

            <p>
              For complete information, please refer to our Shipping Policy.
            </p>
          </div>

          <div className="terms-section">
            <h2>9. Returns & Exchanges</h2>

            <p>
              Returns and exchanges are subject to the return and exchange
              conditions applicable to the purchased product.
            </p>

            <p>
              Products must meet the applicable eligibility requirements,
              including condition, packaging, tags, and return window.
            </p>

            <p>
              Please review our Refund Policy and the Return & Exchange
              information provided on the relevant product page before
              initiating a return or exchange.
            </p>
          </div>

          <div className="terms-section">
            <h2>10. Promotional Offers & Discount Codes</h2>

            <p>
              OPULENCE may offer promotional discounts, coupon codes, or special
              offers from time to time.
            </p>

            <p>
              Promotional codes may be subject to specific conditions,
              eligibility requirements, validity periods, minimum order values,
              or product exclusions.
            </p>

            <p>
              Unless specifically stated otherwise, promotional offers cannot be
              combined with other offers.
            </p>
          </div>

          <div className="terms-section">
            <h2>11. User Accounts</h2>

            <p>
              If you create an account on our website, you are responsible for
              maintaining the confidentiality of your account information and
              login credentials.
            </p>

            <p>
              You agree to provide accurate information and to notify us if you
              become aware of any unauthorized use of your account.
            </p>
          </div>

          <div className="terms-section">
            <h2>12. Prohibited Use</h2>

            <p>You agree not to use our website to:</p>

            <ul>
              <li>Violate any applicable law or regulation</li>
              <li>Engage in fraudulent or deceptive activities</li>
              <li>Attempt unauthorized access to our website or systems</li>
              <li>Interfere with the operation or security of the website</li>
              <li>
                Copy or misuse our content, branding, or intellectual property
              </li>
              <li>
                Transmit harmful code, malware, or other malicious material
              </li>
            </ul>
          </div>

          <div className="terms-section">
            <h2>13. Intellectual Property</h2>

            <p>
              All content available on the OPULENCE website, including logos,
              branding, product images, photographs, graphics, text, design
              elements, and other materials, is owned by or licensed to OPULENCE
              unless otherwise stated.
            </p>

            <p>
              You may not reproduce, distribute, modify, publish, sell, or
              commercially exploit our content without prior written permission.
            </p>
          </div>

          <div className="terms-section">
            <h2>14. Third-Party Services</h2>

            <p>
              Our website may use third-party services for payments, shipping,
              analytics, authentication, customer support, or other
              functionality.
            </p>

            <p>
              Your use of third-party services may also be subject to the
              respective terms and policies of those providers.
            </p>
          </div>

          <div className="terms-section">
            <h2>15. Website Availability</h2>

            <p>
              We aim to keep our website available and functioning properly, but
              we do not guarantee uninterrupted or error-free access at all
              times.
            </p>

            <p>
              Website availability may be affected by maintenance, technical
              problems, security issues, service-provider outages, or other
              circumstances beyond our reasonable control.
            </p>
          </div>

          <div className="terms-section">
            <h2>16. Limitation of Liability</h2>

            <p>
              To the extent permitted by applicable law, OPULENCE shall not be
              responsible for indirect, incidental, special, or consequential
              losses arising from the use of our website or products.
            </p>

            <p>
              Nothing in these terms is intended to exclude or limit any
              liability that cannot legally be excluded or limited under
              applicable law.
            </p>
          </div>

          <div className="terms-section">
            <h2>17. Changes to These Terms</h2>

            <p>
              We may update these Terms & Conditions from time to time to
              reflect changes to our services, business practices, or applicable
              requirements.
            </p>

            <p>
              Updated terms will be published on this page with a revised
              effective date.
            </p>
          </div>

          <div className="terms-section">
            <h2>18. Governing Law</h2>

            <p>
              These Terms & Conditions shall be governed by and interpreted in
              accordance with the applicable laws of India.
            </p>

            <p>
              Any disputes arising in connection with these terms shall be
              subject to the jurisdiction of the appropriate courts, subject to
              applicable law.
            </p>
          </div>

          <div className="terms-section">
            <h2>19. Contact Us</h2>

            <p>
              If you have any questions regarding these Terms & Conditions,
              please contact us.
            </p>

            <div className="terms-contact">
              <strong>OPULENCE</strong>
              <span>Email: support@opulence.com</span>
            </div>
          </div>

          {/* BACK */}
          <div className="terms-back">
            <Link href="/">Back to Home</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
