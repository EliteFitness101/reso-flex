// FILE: src/pages/ProductPage.tsx

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductBySlug, getCheckoutUrl } from "@/core/product.resolver";
import { setSeo, setJsonLd, productJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import ProductImageGrid from "@/components/product/ProductImageGrid";
import { getVerifiedMedia, getVerifiedMediaBySlug } from "@/core/media/imagekit.media";
import { ikOg, ikUrl } from "@/lib/imagekit";
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
      const verified = getVerifiedMedia(product.sku);
      const verifiedImages = verified
        ? ["hero", "gallery_01", "gallery_02", "gallery_03", "lifestyle", "detail"]
            .map((role) => verified.assets[role as keyof typeof verified.assets])
            .filter(Boolean)
            .map((asset) => ikUrl(asset!.path, { w: 1200 }))
        : [];
      const heroPath = verified?.assets.hero?.path ?? null;
      const image = heroPath ? ikOg(heroPath) : (product.image ?? null);
      setSeo({ title: product.seo.title || `${product.name} — ResoFlex`, description: product.seo.description || product.description, path, image, type: "product" });
      const removeProduct = setJsonLd("product", productJsonLd({
        sku: product.sku,
        name: product.name,
        description: product.description || product.tagline,
        image,
        images: verifiedImages,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        currency: product.currency,
        path,
        brand: "ResoFlex",
        category: product.category,
        inStock: true,
      }));
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
      const removeProduct = setJsonLd("product", productJsonLd({
        sku: paystackProduct.slug,
        name: paystackProduct.title,
        description: paystackProduct.title,
        image,
        images: paystackProduct.images,
        price: paystackProduct.priceNgn,
        currency: "NGN",
        path,
        brand: "ResoFlex",
        inStock: true,
      }));
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
