import "./shipping-policy.css";
import Link from "next/link";

export default function ShippingPolicyPage() {
  return (
    <main className="shipping-page">
      {/* HERO */}
      <section className="shipping-hero">
        <div className="shipping-hero-inner">
          <span className="shipping-eyebrow">OPULENCE</span>

          <h1>Shipping Policy</h1>

          <p>
            Everything you need to know about order processing, shipping,
            delivery, and tracking your OPULENCE order.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="shipping-content">
        <div className="shipping-container">
          <p className="shipping-updated">Last updated: October 8, 2026</p>

          <div className="shipping-section">
            <h2>1. Order Processing</h2>

            <p>
              Once your order is successfully placed and payment is confirmed,
              we begin processing your order for shipment.
            </p>

            <p>
              Orders are generally processed within 1–3 business days, excluding
              Sundays and public holidays.
            </p>

            <p>
              Processing times may be longer during sale periods, festive
              seasons, product launches, or periods of unusually high order
              volume.
            </p>
          </div>

          <div className="shipping-section">
            <h2>2. Shipping & Delivery</h2>

            <p>
              Once your order has been dispatched, it will be handed over to our
              designated delivery partner.
            </p>

            <p>
              Estimated delivery time may vary depending on your delivery
              location, courier availability, weather conditions, holidays, and
              other circumstances beyond our reasonable control.
            </p>

            <p>
              The estimated delivery timeline displayed during checkout or
              communicated after dispatch should be considered an estimate and
              not a guaranteed delivery date.
            </p>
          </div>

          <div className="shipping-section">
            <h2>3. Shipping Address</h2>

            <p>
              Orders will be delivered to the shipping address provided during
              checkout.
            </p>

            <p>
              Please make sure that your name, address, city, state, PIN code,
              and contact number are accurate before completing your order.
            </p>

            <p>
              OPULENCE may not be responsible for delays or failed deliveries
              caused by incorrect or incomplete shipping information provided by
              the customer.
            </p>
          </div>

          <div className="shipping-section">
            <h2>4. Shipping Charges</h2>

            <p>
              Shipping charges, if applicable, will be displayed during the
              checkout process before you complete your purchase.
            </p>

            <p>
              From time to time, OPULENCE may offer free shipping promotions or
              other shipping-related offers. Such offers may be subject to
              specific terms and conditions.
            </p>
          </div>

          <div className="shipping-section">
            <h2>5. Order Tracking</h2>

            <p>
              Once your order has been dispatched, tracking information may be
              provided through the contact details associated with your order.
            </p>

            <p>
              You can use the provided tracking information to check the current
              status of your shipment.
            </p>

            <p>
              Please note that tracking information may take some time to become
              active after the shipment has been handed over to the courier.
            </p>
          </div>

          <div className="shipping-section">
            <h2>6. Delivery Attempts</h2>

            <p>
              Our delivery partner may make multiple attempts to deliver your
              order.
            </p>

            <p>
              Please ensure that someone is available at the provided delivery
              address to receive the package.
            </p>

            <p>
              If delivery fails because the recipient is unavailable, the
              address is incorrect, or the customer refuses the delivery,
              additional delivery attempts or charges may apply depending on the
              circumstances.
            </p>
          </div>

          <div className="shipping-section">
            <h2>7. Delayed or Lost Shipments</h2>

            <p>
              While we work with reliable delivery partners, unforeseen
              circumstances may occasionally cause delays.
            </p>

            <p>
              If your order appears to be significantly delayed or is reported
              as lost in transit, please contact our customer support team. We
              will coordinate with the applicable delivery partner to
              investigate the shipment.
            </p>
          </div>

          <div className="shipping-section">
            <h2>8. Damaged Packages</h2>

            <p>
              If your package appears visibly damaged at the time of delivery,
              please document the condition of the package before opening it and
              contact our customer support team as soon as possible.
            </p>

            <p>
              Photographs or other supporting information may be requested to
              help us investigate the issue.
            </p>
          </div>

          <div className="shipping-section">
            <h2>9. Incorrect or Missing Items</h2>

            <p>
              If you receive an incorrect product or an item is missing from
              your order, please contact our customer support team promptly with
              your order details.
            </p>

            <p>
              We may request photographs or other information to verify the
              issue and provide an appropriate resolution.
            </p>
          </div>

          <div className="shipping-section">
            <h2>10. Delivery Restrictions</h2>

            <p>
              Certain locations may have limited delivery availability due to
              courier coverage, operational restrictions, or other logistical
              limitations.
            </p>

            <p>
              If delivery to a particular location is unavailable, we may
              contact you to discuss an appropriate resolution.
            </p>
          </div>

          <div className="shipping-section">
            <h2>11. Contact Us</h2>

            <p>
              If you have questions about shipping, delivery, or your order,
              please contact our customer support team.
            </p>

            <div className="shipping-contact">
              <strong>OPULENCE</strong>
              <span>Email: support@opulence.com</span>
            </div>
          </div>

          {/* BACK */}
          <div className="shipping-back">
            <Link href="/">Back to Home</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
