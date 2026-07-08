import type { ColumnSpec } from "./exports";

export const ORDERS_COLUMNS: ColumnSpec[] = [
  { key: "reference", header: "Reference", kind: "text" },
  { key: "status", header: "Status", kind: "text" },
  { key: "fulfillment_status", header: "Fulfillment", kind: "text" },
  { key: "amount", header: "Amount (NGN)", kind: "currency_ngn" },
  { key: "currency", header: "Currency", kind: "text" },
  { key: "customer_email", header: "Email", kind: "text" },
  { key: "customer_name", header: "Name", kind: "text" },
  { key: "campaign", header: "Campaign", kind: "text", get: (r) => r.attribution?.utm_campaign ?? r.attribution?.campaign ?? "" },
  { key: "rsid", header: "RSID", kind: "text", get: (r) => r.attribution?.rsid ?? "" },
  { key: "paid_at", header: "Paid At", kind: "date" },
  { key: "created_at", header: "Created At", kind: "date" },
];

export const PAYMENTS_COLUMNS: ColumnSpec[] = [
  { key: "paystack_reference", header: "Reference", kind: "text" },
  { key: "paystack_event_id", header: "Event ID", kind: "text" },
  { key: "status", header: "Status", kind: "text" },
  { key: "amount", header: "Amount (NGN)", kind: "currency_ngn" },
  { key: "currency", header: "Currency", kind: "text" },
  { key: "order_id", header: "Order ID", kind: "text" },
  { key: "created_at", header: "Created At", kind: "date" },
];

export const RESELLERS_COLUMNS: ColumnSpec[] = [
  { key: "lead_name", header: "Lead Name", kind: "text" },
  { key: "lead_email", header: "Email", kind: "text" },
  { key: "lead_phone", header: "Phone", kind: "text" },
  { key: "campaign", header: "Campaign", kind: "text" },
  { key: "funnel_stage", header: "Stage", kind: "text" },
  { key: "conversion_status", header: "Conversion", kind: "text" },
  { key: "commission_status", header: "Commission", kind: "text" },
  { key: "revenue_generated", header: "Revenue (NGN)", kind: "currency_ngn" },
  { key: "created_at", header: "Created At", kind: "date" },
];
