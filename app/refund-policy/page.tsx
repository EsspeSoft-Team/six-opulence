import "./refund-policy.css";
import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <main className="refund-page">
      {/* HERO */}
      <section className="refund-hero">
        <div className="refund-hero-inner">
          <span className="refund-eyebrow">OPULENCE</span>

          <h1>Refund Policy</h1>

          <p>
            Everything you need to know about refunds, returns, exchanges, and
            eligible purchases at OPULENCE.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="refund-content">
        <div className="refund-container">
          <p className="refund-updated">Last updated: October 8, 2026</p>

          <div className="refund-section">
            <h2>1. Refund Eligibility</h2>

            <p>
              Eligible products may be returned within 15 days of delivery,
              subject to the conditions mentioned in this Refund Policy.
            </p>

            <p>
              To be eligible for a refund, the product must be unused, unwashed,
              and in its original condition with all original tags and packaging
              intact.
            </p>
          </div>

          <div className="refund-section">
            <h2>2. Return Conditions</h2>

            <p>
              Before requesting a return, please make sure that the product
              meets the following conditions:
            </p>

            <ul>
              <li>The product must be unused and unwashed.</li>
              <li>The original tags must remain attached.</li>
              <li>The original packaging should be intact.</li>
              <li>The product must not show signs of wear or damage.</li>
              <li>
                The return request must be submitted within 15 days of delivery.
              </li>
            </ul>
          </div>

          <div className="refund-section">
            <h2>3. Non-Returnable Products</h2>

            <p>
              Products that have been used, washed, altered, damaged after
              delivery, or returned without their original tags and packaging
              may not be eligible for a refund.
            </p>

            <p>
              Products specifically marked as non-returnable or final sale may
              also be excluded from return and refund eligibility.
            </p>
          </div>

          <div className="refund-section">
            <h2>4. Damaged or Incorrect Products</h2>

            <p>
              If you receive a damaged, defective, or incorrect product, please
              contact our customer support team as soon as possible.
            </p>

            <p>
              We may request photographs or other information to verify the
              issue and determine the appropriate resolution.
            </p>
          </div>

          <div className="refund-section">
            <h2>5. Refund Process</h2>

            <p>
              Once your returned product is received and inspected, we will
              review the return request and determine whether it qualifies for a
              refund.
            </p>

            <p>
              If approved, the applicable refund will be processed to the
              original payment method used for the purchase.
            </p>
          </div>

          <div className="refund-section">
            <h2>6. Refund Processing Time</h2>

            <p>
              Refund processing times may vary depending on the payment method
              and financial institution involved.
            </p>

            <p>
              After a refund is initiated by OPULENCE, the time taken for the
              amount to appear in your account may depend on the applicable
              payment provider or bank.
            </p>
          </div>

          <div className="refund-section">
            <h2>7. Exchanges</h2>

            <p>
              Exchanges may be available within 15 days of delivery for eligible
              products, subject to size, availability, and applicable product
              conditions.
            </p>

            <p>
              Products submitted for exchange must be unused, unwashed, and
              returned with their original tags and packaging intact.
            </p>
          </div>

          <div className="refund-section">
            <h2>8. Shipping Charges</h2>

            <p>
              Original shipping charges, if applicable, may not be refundable
              unless the return is due to a damaged, defective, or incorrect
              product.
            </p>

            <p>
              Any applicable return shipping charges will be handled according
              to the circumstances of the return and the applicable OPULENCE
              policy.
            </p>
          </div>

          <div className="refund-section">
            <h2>9. Cancellation</h2>

            <p>
              If you wish to cancel an order, please contact us as soon as
              possible after placing the order.
            </p>

            <p>
              Cancellation may not be possible once an order has been processed,
              packed, or shipped.
            </p>
          </div>

          <div className="refund-section">
            <h2>10. Refunds for Promotional Orders</h2>

            <p>
              Orders placed using promotional offers, discount codes, or special
              pricing may be subject to specific refund or return conditions.
            </p>

            <p>
              Please check the applicable promotional terms before placing an
              order.
            </p>
          </div>

          <div className="refund-section">
            <h2>11. How to Request a Return or Refund</h2>

            <p>
              To request a return or refund, please contact our customer support
              team with your order details and the reason for your request.
            </p>

            <p>
              Our team will provide the applicable instructions for completing
              the return process.
            </p>
          </div>

          <div className="refund-section">
            <h2>12. Contact Us</h2>

            <p>
              If you have any questions regarding returns, exchanges, or
              refunds, please contact us.
            </p>

            <div className="refund-contact">
              <strong>OPULENCE</strong>
              <span>Email: support@opulence.com</span>
            </div>
          </div>

          {/* BACK */}
          <div className="refund-back">
            <Link href="/">Back to Home</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
