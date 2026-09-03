import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductBySlug, getCheckoutUrl } from "@/core/product.resolver";
import { setSeo, setJsonLd, productJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import ProductImageGrid from "@/components/product/ProductImageGrid";
import ProductVisualFallback from "@/components/product/ProductVisualFallback";
import { getVerifiedMedia, getVerifiedMediaBySlug } from "@/core/media/imagekit.media";
import { ikOg, ikUrl } from "@/lib/imagekit";
import { getResoFlexPaystackPage } from "@/data/resoflex-paystack-pages";

function PaystackImage({ src, alt, role }: { src: string; alt: string; role: "hero" | "lifestyle" | "detail" }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <ProductVisualFallback name={alt} role={role} className="aspect-[4/3]" />;
  return (
    <img
      src={src}
      alt={alt}
      loading={role === "hero" ? "eager" : "lazy"}
      fetchPriority={role === "hero" ? "high" : "auto"}
      decoding="async"
      style={{ width: "100%", height: "auto", display: "block" }}
      onError={() => setFailed(true)}
    />
  );
}

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
    const hasVerifiedMedia = Boolean(media?.assets.hero || media?.assets.lifestyle || media?.assets.detail);
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <section aria-label={`${paystackProduct.title} product visuals`}>
            {hasVerifiedMedia && media ? (
              <ProductImageGrid sku={media.sku} name={media.name} />
            ) : paystackProduct.images.length > 0 ? (
              <div className="grid gap-3">
                <PaystackImage src={paystackProduct.images[0]} alt={paystackProduct.title} role="hero" />
                {paystackProduct.images.slice(1, 4).map((image, index) => (
                  <PaystackImage key={image} src={image} alt={`${paystackProduct.title} detail ${index + 1}`} role={index === 0 ? "lifestyle" : "detail"} />
                ))}
              </div>
            ) : (
              <ProductVisualFallback name={paystackProduct.title} role="hero" className="aspect-[4/3]" />
            )}
          </section>
          <section className="space-y-5 lg:sticky lg:top-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-gold/70">ResoFlex Signature Commerce</p>
              <h1 className="mt-2 text-2xl font-semibold leading-tight text-white md:text-4xl">{paystackProduct.title}</h1>
            </div>
            <p className="text-xl font-semibold text-white">NGN {paystackProduct.priceNgn.toLocaleString("en-NG")}</p>
            <button
              className="w-full rounded-xl border border-gold/40 bg-gold px-5 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-gold/90"
              onClick={() => { window.location.href = paystackProduct.checkoutUrl; }}
            >
              Buy Now
            </button>
          </section>
        </div>
      </main>
    );
  }

  if (!product) {
    if (media) {
      return (
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:py-10">
          <h1 className="mb-6 text-2xl font-semibold text-white md:text-4xl">{media.name}</h1>
          <ProductImageGrid sku={media.sku} name={media.name} />
          <button className="mt-6 rounded-xl border border-gold/40 bg-gold px-5 py-3 font-semibold text-black" onClick={() => navigate("/#products")}>Enquire / Order</button>
        </main>
      );
    }
    return <ProductVisualFallback name="ResoFlex Product" role="hero" className="min-h-screen" />;
  }

  const checkout = () => {
    const url = getCheckoutUrl(product.handle);
    if (url) window.location.href = url;
    else navigate("/");
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:py-10">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <ProductImageGrid sku={product.sku} name={product.name} />
        <section className="space-y-5 lg:sticky lg:top-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-gold/70">ResoFlex Signature Commerce</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight text-white md:text-4xl">{product.name}</h1>
          </div>
          <p className="text-xl font-semibold text-white">{product.priceLabel}</p>
          <button className="w-full rounded-xl border border-gold/40 bg-gold px-5 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-gold/90" onClick={checkout}>Buy Now</button>
        </section>
      </div>
    </main>
  );
}
