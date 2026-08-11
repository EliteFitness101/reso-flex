// FILE: src/pages/ProductPage.tsx

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductBySlug, getCheckoutUrl } from "@/core/product.resolver";
import { setSeo, setJsonLd, productJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import ProductImageGrid from "@/components/product/ProductImageGrid";
import { getVerifiedMedia } from "@/core/media/imagekit.media";
import { ikOg } from "@/lib/imagekit";


export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const product = slug ? getProductBySlug(slug) : null;

  useEffect(() => {
    if (!product) return;
    const path = `/product/${product.handle}`;
    setSeo({
      title: `${product.name} — ResoFlex`,
      description: product.tagline ?? product.name,
      path,
      image: (product as any).image ?? null,
      type: "product",
    });
    const removeProduct = setJsonLd(
      "product",
      productJsonLd({
        sku: product.sku,
        name: product.name,
        description: product.tagline,
        image: (product as any).image ?? null,
        price: product.now,
        path,
      }),
    );
    const removeCrumbs = setJsonLd(
      "breadcrumb",
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
        { name: product.name, path },
      ]),
    );
    return () => { removeProduct(); removeCrumbs(); };
  }, [product]);

  if (!product) {
    return <div>Product not found</div>;
  }

  const checkout = () => {
    const url = getCheckoutUrl(product.handle);

    if (!url) {
      // No direct Paystack link — route through CheckoutModal on the storefront.
      navigate("/");
      return;
    }

    window.location.href = url;
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>{product.name}</h1>
      <p>Price: {product.priceLabel}</p>

      <button onClick={checkout}>
        Buy Now
      </button>
    </div>
  );
}
