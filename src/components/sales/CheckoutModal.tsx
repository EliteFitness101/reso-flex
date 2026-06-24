import { type Product } from "@/data/products";
import { useState } from "react";
import { track } from "@/funnel/tracking";
import TokenService from "@/services/token.service";
import WhatsAppService from "@/services/whatsapp.service";
import PaystackService from "@/services/paystack.service";

type Props = {
  product: Product;
  onClose: () => void;
  onPaid: (p: Product) => void;
};

export const CheckoutModal = ({ product, onClose, onPaid }: Props) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      const fd = new FormData(e.currentTarget);
      if (fd.get("website")) return; // honeypot

      const email = fd.get("email") as string;
      const name = fd.get("name") as string;
      const phone = fd.get("phone") as string;
      const address = fd.get("address") as string;

      // Track checkout event
      track("checkout", {
        productId: product.id,
        productName: product.name,
        amount: product.now * 100,
        email,
      });

      // Initialize Paystack payment
      const paystackResponse = await PaystackService.initializePayment({
        email,
        amount: product.now * 100, // kobo
        productId: product.id,
        productName: product.name,
        customerPhone: phone,
        metadata: {
          handle: product.handle,
          sku: product.sku,
          name,
          address,
          phone,
        },
      });

      if (!paystackResponse.status || !paystackResponse.data) {
        throw new Error(paystackResponse.message || "Failed to initialize payment");
      }

      // Store checkout reference temporarily for success callback
      sessionStorage.setItem("paystack_reference", paystackResponse.data.reference);
      sessionStorage.setItem("paystack_email", email);
      sessionStorage.setItem("product_id", product.id);

      // Generate access token immediately (will be validated on webhook)
      const accessToken = TokenService.generateToken(product.id, email, paystackResponse.data.reference);
      TokenService.storeToken(accessToken, product.id);

      // Send WhatsApp notification if phone provided
      if (phone) {
        const formattedPhone = WhatsAppService.formatNigerianPhone(phone);
        if (formattedPhone) {
          try {
            await WhatsAppService.sendMessage({
              recipient: formattedPhone,
              templateName: "checkout_initiated",
              parameters: {
                productName: product.name,
                amount: `₦${(product.now).toLocaleString()}`,
              },
            }).catch(() => {
              // Silently fail WhatsApp notification
            });
          } catch (e) {
            // Ignore WhatsApp errors
          }
        }
      }

      // Track Google Analytics
      (window as any).dataLayer?.push({
        event: "begin_checkout",
        value: product.now,
        currency: "NGN",
        item: product.name,
        sku: product.sku,
        handle: product.handle,
      });

      // Open Paystack checkout
      if ((window as any).PaystackPop) {
        (window as any).PaystackPop.setup({
          key: "pk_live_fake_key", // Replace with VITE_PAYSTACK_PUBLIC_KEY
          email,
          amount: product.now * 100,
          ref: paystackResponse.data.reference,
          onClose: () => {
            setIsProcessing(false);
            track("checkout_abandoned", {
              productId: product.id,
              email,
              reference: paystackResponse.data.reference,
            });
          },
          onSuccess: (response: any) => {
            // Payment successful
            track("payment_success", {
              productId: product.id,
              productName: product.name,
              amount: product.now * 100,
              reference: response.reference || paystackResponse.data.reference,
              email,
            });

            // Clear session data
            sessionStorage.removeItem("paystack_reference");
            sessionStorage.removeItem("paystack_email");
            sessionStorage.removeItem("product_id");

            setIsProcessing(false);
            onClose();
            
            // Show welcome message after delay
            setTimeout(() => onPaid(product), 600);
          },
        });
        (window as any).PaystackPop.openIframe();
      } else {
        // Fallback: redirect to Paystack shop URL
        window.location.href = PaystackService.getCheckoutUrl(product.handle);
      }
    } catch (err) {
      console.error("[Checkout] Payment Error:", err);
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
      setIsProcessing(false);
      track("payment_error", {
        productId: product.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-noir-950/85 p-4 backdrop-blur-md sm:items-center" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-md border-gold/60 p-7 shadow-elevated animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.35em] text-gold">// Secure Checkout</div>
            <h3 className="mt-2 font-display text-lg font-bold leading-tight">{product.name}</h3>
            <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-foreground/45">SKU · {product.sku}</div>
          </div>
          <button onClick={onClose} className="text-foreground/50 hover:text-gold"><i className="fa-solid fa-xmark text-xl" /></button>
        </div>

        <div className="mt-5 flex items-end justify-between border border-gold/40 bg-noir-900/70 p-4">
          <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/55">Total</span>
          <span className="font-display text-xl font-bold gold-text">{product.priceLabel}</span>
        </div>

        {error && (
          <div className="mt-4 rounded border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
            <i className="fa-solid fa-circle-exclamation mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handlePay} className="mt-5 space-y-3">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] h-0 w-0" />
          <input type="hidden" name="variant_sku" value={product.sku} />
          <input type="hidden" name="product_handle" value={product.handle} />

          <input required name="name" placeholder="Full name" maxLength={120} disabled={isProcessing}
            className="w-full border border-border bg-noir-900/70 px-4 py-3 text-sm outline-none focus:border-gold/70 disabled:opacity-50" />
          <input required type="email" name="email" placeholder="Email" maxLength={255} disabled={isProcessing}
            className="w-full border border-border bg-noir-900/70 px-4 py-3 text-sm outline-none focus:border-gold/70 disabled:opacity-50" />
          <input required name="phone" placeholder="WhatsApp / phone" maxLength={20} disabled={isProcessing}
            className="w-full border border-border bg-noir-900/70 px-4 py-3 text-sm outline-none focus:border-gold/70 disabled:opacity-50" />
          <input required name="address" placeholder="Delivery address" maxLength={255} disabled={isProcessing}
            className="w-full border border-border bg-noir-900/70 px-4 py-3 text-sm outline-none focus:border-gold/70 disabled:opacity-50" />

          <button type="submit" disabled={isProcessing} className="luxury-button w-full py-3.5 text-[11px] disabled:opacity-50 disabled:cursor-not-allowed">
            {isProcessing ? (
              <>
                <i className="fa-solid fa-spinner mr-2 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <i className="fa-solid fa-lock mr-2" /> Pay with Paystack
              </>
            )}
          </button>
          <p className="flex items-center justify-center gap-3 pt-1 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
            <i className="fa-solid fa-shield-halved" /> 256-bit SSL · Encrypted metadata
          </p>
        </form>
      </div>
    </div>
  );
};
