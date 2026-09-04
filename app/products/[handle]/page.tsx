import "./product-detail.css";
import Image from "next/image";
import { getProductByHandle } from "@/lib/shopify";
import AddToCartButton from "@/components/AddToCartButton";
import RelatedProducts from "@/components/RelatedProducts";

export default async function ProductPage({
  params,
}: {
  params: { handle: string };
}) {
  const product = await getProductByHandle(params.handle);

  if (!product) {
    return <p>Product not found.</p>;
  }

  const firstVariant = product.variants.edges[0]?.node;

  return (
    <div className="container">
      <div className="pdp">
        <div className="pdp-images">
          {product.images.edges.map((edge: any, i: number) => (
            <div key={i} className="pdp-image">
              <Image
                src={edge.node.url}
                alt={edge.node.altText || product.title}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          ))}
        </div>

        <div>
          <h1 className="pdp-title">{product.title}</h1>
          <p className="pdp-price">
            {firstVariant?.price.currencyCode} {firstVariant?.price.amount}
          </p>

          <div
            className="pdp-description"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />

          <AddToCartButton variants={product.variants.edges} />
        </div>
      </div>

      <RelatedProducts productId={product.id} />
    </div>
  );
}
