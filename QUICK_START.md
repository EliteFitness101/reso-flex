# RESOFLEX™ SOVEREIGN OS v4.2 - Quick Start Guide

## Installation

```bash
cd /vercel/share/v0-project
pnpm install
```

## Development

```bash
pnpm dev
# Server runs at http://localhost:8080
```

## Building

```bash
pnpm build
pnpm preview  # Preview production build
```

---

## Environment Variables

Create `.env.development.local` with:

```env
# Paystack (get from Paystack dashboard)
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key
VITE_PAYSTACK_SECRET_KEY=sk_live_your_secret_key

# WhatsApp (optional - for message sending)
VITE_WHATSAPP_API_URL=https://graph.instagram.com/v18.0
VITE_WHATSAPP_PHONE_NUMBER_ID=your_phone_id
VITE_WHATSAPP_BUSINESS_ACCOUNT_ID=your_account_id
VITE_WHATSAPP_ACCESS_TOKEN=your_access_token

# Security
VITE_TOKEN_SECRET=your-secure-random-key-here
```

---

## Key API Endpoints

### Payment Processing
- **POST** `/api/paystack-webhook` - Webhook handler for payment confirmations
- **GET** `/api/access?reference=PAYMENT_REF` - Get access token
- **POST** `/api/access/validate` - Validate existing token

### Analytics
- **POST** `/api/track` - Track analytics event
- **GET** `/api/track?report=summary` - Get analytics summary

### WhatsApp
- **POST** `/api/whatsapp-send` - Send WhatsApp message

### System
- **GET** `/api/health` - Health check
- **GET** `/api/sitemap` - Dynamic XML sitemap

---

## Key Services

### PaystackService
```typescript
import PaystackService from '@/services/paystack.service';

// Initialize payment
const response = await PaystackService.initializePayment({
  email: 'user@example.com',
  amount: 250000, // in kobo
  productId: 'rf-expansion-blue',
  productName: 'ResoFlex Expansion Module - Blue'
});

// Verify payment
const verification = await PaystackService.verifyPayment(reference);
```

### TokenService
```typescript
import TokenService from '@/services/token.service';

// Generate token
const token = TokenService.generateToken(productId, email, reference);

// Store and retrieve
TokenService.storeToken(token, productId);
const storedToken = TokenService.getTokenForProduct(productId);

// Validate
const isValid = TokenService.hasAccessToProduct(productId);
```

### AnalyticsStorageService
```typescript
import AnalyticsStorageService from '@/services/analytics-storage.service';

// Track event
AnalyticsStorageService.trackEvent({
  event: 'payment_success',
  productId: 'rf-expansion-blue',
  amount: 250000,
});

// Get report
const report = AnalyticsStorageService.generateReport();
```

### WhatsAppService
```typescript
import WhatsAppService from '@/services/whatsapp.service';

// Send message
await WhatsAppService.sendMessage({
  recipient: '+2348132255842',
  templateName: 'order_confirmation',
  parameters: {
    productName: 'ResoFlex Expansion Module - Blue',
    amount: '₦25,000.00',
  }
});

// Format phone
const phone = WhatsAppService.formatNigerianPhone('08132255842');
```

### AnalyticsEngine
```typescript
import AnalyticsEngine from '@/funnel/analytics.engine.ts';

// Get dashboard metrics
const metrics = AnalyticsEngine.getDashboardMetrics();
// { totalRevenue, totalOrders, conversionRate, topProducts, ... }

// Get funnel analysis
const funnel = AnalyticsEngine.getFunnelAnalysis();

// Export CSV
const csv = AnalyticsEngine.exportAsCSV();
```

---

## Event Tracking

Events are automatically tracked with UTM parameters. Common events:

```typescript
import { track } from '@/funnel/tracking';

track('landing');              // User lands on site
track('assessment');           // User completes assessment
track('product_view', {
  productId: 'rf-expansion-blue'
});
track('checkout', {
  productId: 'rf-expansion-blue',
  amount: 250000
});
track('payment_success', {
  productId: 'rf-expansion-blue',
  amount: 250000,
  reference: 'ref_xxx'
});
```

---

## SEO Utilities

```typescript
import { updateMetaTags, insertSchema } from '@/lib/seo';

// Update meta tags
updateMetaTags({
  title: 'ResoFlex Expansion Module - Blue',
  description: 'Premium expansion module...',
  image: 'https://...',
  url: window.location.href,
  type: 'product',
});

// Insert product schema
const schema = generateProductSchema({
  name: 'Product Name',
  description: 'Description',
  price: 250000,
  image: 'https://...',
  url: 'https://...',
});
insertSchema(schema, 'product-schema');
```

---

## Testing Payment Flow

1. Start dev server: `pnpm dev`
2. Go to homepage
3. Click "Buy" on a product
4. Fill in checkout form
5. With Paystack test keys, use test card:
   - Card: `4111 1111 1111 1111`
   - Expiry: `12/25`
   - CVV: `123`
6. Check browser console for analytics events
7. Check localStorage for access token: `resoflex_access_tokens`

---

## Checking Analytics

### In Browser Console
```javascript
// Get session ID
sessionStorage.getItem('resoflex_session_id');

// Get stored tokens
JSON.parse(localStorage.getItem('resoflex_access_tokens'));

// Get analytics events
JSON.parse(localStorage.getItem('resoflex_analytics_events'));
```

### Via API
```bash
# Get analytics summary
curl https://localhost:8080/api/track?report=summary

# Get sitemap
curl https://localhost:8080/api/sitemap
```

---

## Deployment Checklist

- [ ] Set all environment variables in Vercel
- [ ] Configure Paystack webhook URL
- [ ] Test payment flow in production
- [ ] Verify WhatsApp messages sending
- [ ] Check SEO meta tags render correctly
- [ ] Monitor API endpoints for errors
- [ ] Set up error logging (Sentry recommended)
- [ ] Configure caching headers
- [ ] Test CORS for cross-domain requests
- [ ] Verify robots.txt and sitemap are accessible

---

## Common Issues

### "Access token required" error
- Check that `VITE_PAYSTACK_SECRET_KEY` is set
- Verify payment completed successfully
- Check webhook was triggered

### WhatsApp messages not sending
- Verify `VITE_WHATSAPP_ACCESS_TOKEN` is configured
- Check phone number format (E.164)
- Verify WhatsApp Business Account is active

### Analytics not tracking
- Check browser console for errors
- Verify `/api/track` endpoint is accessible
- Check localStorage is not full
- Verify CORS headers are correct

### Payment initialization fails
- Check Paystack credentials are correct
- Verify amount is in kobo (NGN * 100)
- Check email format is valid
- Review Paystack dashboard for errors

---

## Support

For issues or questions:
1. Check `IMPLEMENTATION_SUMMARY.md` for detailed documentation
2. Review individual service files for JSDoc comments
3. Check browser console and network tab for errors
4. Review API endpoint implementations in `/api` directory

---

## File Structure Reference

```
src/
├── pages/              # React Router pages
├── components/         # React components
├── services/          # Business logic services
│   ├── paystack.service.ts
│   ├── token.service.ts
│   ├── analytics-storage.service.ts
│   └── whatsapp.service.ts
├── funnel/            # Funnel and analytics
│   ├── tracking.ts
│   └── analytics.engine.ts
├── core/              # Core utilities
│   └── payment-validator.ts
└── lib/               # Utilities
    └── seo.ts

api/                   # Vercel serverless functions
├── paystack-webhook.ts
├── access.ts
├── track.ts
├── whatsapp-send.ts
├── health.ts
└── sitemap.ts

public/
├── robots.txt         # SEO crawler directives
```

---

**Last Updated:** June 25, 2026  
**Version:** 4.2  
**Status:** Production Ready
