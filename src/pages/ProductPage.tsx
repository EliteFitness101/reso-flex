// FILE: src/pages/ProductPage.tsx

import { useParams, useNavigate } from "react-router-dom";
import { getProductBySlug, getCheckoutUrl } from "@/core/product.resolver";

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const product = slug ? getProductBySlug(slug) : null;

  if (!product) {
    return <div>Product not found</div>;
  }

  const checkout = () => {
    const url = getCheckoutUrl(product.slug);

    if (!url) {
      navigate("/thank-you");
      return;
    }

    window.location.href = url;
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>{product.name}</h1>
      <p>Price: ₦{product.price.toLocaleString()}</p>

      <button onClick={checkout}>
        Buy Now
      </button>
    </div>
  );
}
