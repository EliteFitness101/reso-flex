// FILE: src/pages/ProductPage.tsx

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductBySlug, getCheckoutUrl } from "@/core/product.resolver";
import { setSeo, setJsonLd, productJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import ProductImageGrid from "@/components/product/ProductImageGrid";
import { getVerifiedMedia, getVerifiedMediaBySlug } from "@/core/media/imagekit.media";
import { ikOg } from "@/lib/imagekit";
import { getResoFlexPaystackPage } from "@/data/resoflex-paystack-pages";

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const product = slug ? getProductBySlug(slug) : null;
  const paystackProduct = slug ? getResoFlexPaystackPage(slug) : null;
  const media = !product ? getVerifiedMediaBySlug(slug) : null;

  useEffect(() => {
    if (product) {
      const path = `/product/${product.handle}`;
      const heroPath = getVerifiedMedia(product.sku)?.assets.hero?.path ?? null;
      const image = heroPath ? ikOg(heroPath) : ((product as any).image ?? null);
      setSeo({ title: `${product.name} — ResoFlex`, description: product.tagline ?? product.name, path, image, type: "product" });
      const removeProduct = setJsonLd("product", productJsonLd({ sku: product.sku, name: product.name, description: product.tagline, image, price: product.now, path }));
      const removeCrumbs = setJsonLd("breadcrumb", breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
        { name: product.name, path },
      ]));
      return () => { removeProduct(); removeCrumbs(); };
    }

    if (paystackProduct) {
      const path = `/product/${paystackProduct.slug}`;
      const image = paystackProduct.images[0] ?? null;
      setSeo({ title: `${paystackProduct.title} — ResoFlex`, description: paystackProduct.title, path, image, type: "product" });
      const removeProduct = setJsonLd("product", productJsonLd({ sku: paystackProduct.slug, name: paystackProduct.title, description: paystackProduct.title, image, price: paystackProduct.priceNgn, path }));
      const removeCrumbs = setJsonLd("breadcrumb", breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
        { name: paystackProduct.title, path },
      ]));
      return () => { removeProduct(); removeCrumbs(); };
    }
  }, [product, paystackProduct]);

  if (!product && paystackProduct) {
    return (
      <main style={{ padding: 20 }}>
        <h1>{paystackProduct.title}</h1>
        {paystackProduct.images.length > 0 ? (
          <div style={{ display: "grid", gap: 12 }}>
            {paystackProduct.images.map((image) => (
              <img key={image} src={image} alt={paystackProduct.title} loading="lazy" style={{ width: "100%", height: "auto" }} />
            ))}
          </div>
        ) : null}
        <p>Price: NGN {paystackProduct.priceNgn.toLocaleString("en-NG")}</p>
        <button onClick={() => { window.location.href = paystackProduct.checkoutUrl; }}>
          Buy Now
        </button>
      </main>
    );
  }

  if (!product) {
    if (media) {
      return (
        <div style={{ padding: 20 }}>
          <h1>{media.name}</h1>
          <ProductImageGrid sku={media.sku} name={media.name} />
          <button onClick={() => navigate("/#products")}>Enquire / Order</button>
        </div>
      );
    }
    return <div>Product not found</div>;
  }

  const checkout = () => {
    const url = getCheckoutUrl(product.handle);
    if (url) window.location.href = url;
    else navigate("/");
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>{product.name}</h1>
      <ProductImageGrid sku={product.sku} name={product.name} />
      <p>Price: {product.priceLabel}</p>
      <button onClick={checkout}>Buy Now</button>
    </main>
  );
}
