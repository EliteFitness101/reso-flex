import { IMAGEKIT_VERIFIED_MEDIA } from "@/core/media/imagekit.media";
import type { Product } from "@/data/products";

export type ImageKitCatalogProduct = {
  id: string;
  handle: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  variantSkus: string[];
  variantSizes: string[];
  collectionCodes: string[];
  featured: boolean;
  media?: (typeof IMAGEKIT_VERIFIED_MEDIA)[string];
};

const MASTER_CATALOG = [
  {"id":"rf-ftm-001","handle":"rf-ftm-001","sku":"RF-FTM-001","name":"ResoFlex Commercial Functional Trainer","category":"Gym Equipment","price":420000,"variantSkus":["RF-FTM-001-COMM"],"variantSizes":["Standard Heavy Unit"],"collectionCodes":["COL-001","COL-003","COL-004","COL-030","COL-034"],"featured":false},
  {"id":"rf-adj-bnc-005","handle":"rf-adj-bnc-005","sku":"RF-ADJ-BNC-005","name":"ResoFlex Adjustable Heavy Duty Workout Bench","category":"Gym Equipment","price":85000,"variantSkus":["RF-ADJ-BNC-005-STD"],"variantSizes":["Standard"],"collectionCodes":["COL-002","COL-004","COL-012","COL-033"],"featured":false},
  {"id":"rf-rub-plt-006","handle":"rf-rub-plt-006","sku":"RF-RUB-PLT-006","name":"ResoFlex Commercial Rubber Bumper Plates Set","category":"Gym Equipment","price":120000,"variantSkus":["RF-RUB-PLT-006-SET"],"variantSizes":["Set"],"collectionCodes":["COL-001","COL-012","COL-030"],"featured":false},
  {"id":"rf-hex-dmb-007","handle":"rf-hex-dmb-007","sku":"RF-HEX-DMB-007","name":"ResoFlex Studio Rubber Hex Dumbbells","category":"Gym Equipment","price":150000,"variantSkus":["RF-HEX-DMB-007-SET"],"variantSizes":["Set"],"collectionCodes":["COL-012","COL-029"],"featured":false},
  {"id":"rf-chr-50k-008","handle":"rf-chr-50k-008","sku":"RF-CHR-50K-008","name":"ResoFlex 50KG Chrome Dumbbell and Barbell Home Gym Set","category":"Gym Equipment","price":95000,"variantSkus":["RF-CHR-50K-008-STD"],"variantSizes":["Standard"],"collectionCodes":["COL-002","COL-004","COL-033"],"featured":false},
  {"id":"rf-chr-set-009","handle":"rf-chr-set-009","sku":"RF-CHR-SET-009","name":"ResoFlex Essentials Chrome Lifting Set","category":"Gym Equipment","price":65000,"variantSkus":["RF-CHR-SET-009-STD"],"variantSizes":["Standard"],"collectionCodes":["COL-002"],"featured":false},
  {"id":"rf-rub-hex-010","handle":"rf-rub-hex-010","sku":"RF-RUB-HEX-010","name":"ResoFlex Commercial Rubber Hex Dumbbell Tower","category":"Gym Equipment","price":250000,"variantSkus":["RF-RUB-HEX-010-SET"],"variantSizes":["Set"],"collectionCodes":["COL-001","COL-003","COL-012"],"featured":false},
  {"id":"resoflex-station-gym","handle":"resoflex-station-gym","sku":"resoflex-station-gym","name":"ResoFlex Commercial Station Gym Hub","category":"Gym Equipment","price":420000,"variantSkus":["resoflex-station-gym-COMM"],"variantSizes":["Standard Heavy Unit"],"collectionCodes":["COL-001","COL-012","COL-034"],"featured":false},
  {"id":"rf-box-001","handle":"rf-box-001","sku":"RF-BOX-001","name":"ResoFlex Combat Training Heavy Boxing Bag","category":"Gym Equipment","price":65000,"variantSkus":["RF-BOX-001-STD"],"variantSizes":["Standard"],"collectionCodes":["COL-013"],"featured":false},
  {"id":"rf-box-002","handle":"rf-box-002","sku":"RF-BOX-002","name":"ResoFlex Pro Combat Striking Boxing Gloves","category":"Gym Equipment","price":35000,"variantSkus":["RF-BOX-002-STD"],"variantSizes":["Standard"],"collectionCodes":["COL-013"],"featured":false},
  {"id":"rf-fit-001","handle":"rf-fit-001","sku":"RF-FIT-001","name":"ResoFlex Mobility and Strength Resistance Bands Set","category":"Gym Equipment","price":18000,"variantSkus":["RF-FIT-001-STD"],"variantSizes":["Standard"],"collectionCodes":["COL-012","COL-031"],"featured":false},
  {"id":"rf-run-001","handle":"rf-run-001","sku":"RF-RUN-001","name":"ResoFlex Lightweight Running Hydration Vest","category":"Apparel","price":25000,"variantSkus":["RF-RUN-001-STD"],"variantSizes":["Standard"],"collectionCodes":["COL-011"],"featured":false},
  {"id":"rf-run-002","handle":"rf-run-002","sku":"RF-RUN-002","name":"ResoFlex Speedwork Running Waist Belt","category":"Accessories","price":12000,"variantSkus":["RF-RUN-002-STD"],"variantSizes":["Standard"],"collectionCodes":["COL-011"],"featured":false},
  {"id":"rf-acc-001","handle":"rf-acc-001","sku":"RF-ACC-001","name":"ResoFlex Stainless Steel Gym Shaker Bottle","category":"Accessories","price":15000,"variantSkus":["RF-ACC-001-STD"],"variantSizes":["Standard"],"collectionCodes":["COL-016"],"featured":false},
  {"id":"rf-glv-mech-004","handle":"rf-glv-mech-004","sku":"RF-GLV-MECH-004","name":"ResoFlex Mechanical Padded Gym Weightlifting Gloves","category":"Accessories","price":15000,"variantSkus":["RF-GLV-MECH-004-M"],"variantSizes":["M"],"collectionCodes":["COL-014"],"featured":false},
  {"id":"rf-drq-bgr-01","handle":"rf-drq-bgr-01","sku":"RF-DRQ-BGR-01","name":"ResoFlex Duraq Blue Green Rose Gold","category":"Apparel","price":12000,"variantSkus":["RF-DRQ-BGR-01-BLU","RF-DRQ-BGR-01-GRN","RF-DRQ-BGR-01-ROS"],"variantSizes":["One Size"],"collectionCodes":["COL-003","COL-014","COL-016"],"featured":false},
  {"id":"rf-grp-mlt-01","handle":"rf-grp-mlt-01","sku":"RF-GRP-MLT-01","name":"Reso-Grip Pair Multi-Color","category":"Gym Equipment","price":12000,"variantSkus":["RF-GRP-MLT-01-PAIR"],"variantSizes":["Standard"],"collectionCodes":["COL-014"],"featured":false},
  {"id":"resoflex-mens-tank","handle":"resoflex-mens-tank","sku":"resoflex-mens-tank","name":"ResoFlex Men's Compression Tank","category":"Apparel","price":12000,"variantSkus":["resoflex-mens-tank-XS","resoflex-mens-tank-S","resoflex-mens-tank-M","resoflex-mens-tank-L","resoflex-mens-tank-XL","resoflex-mens-tank-XXL","resoflex-mens-tank-XXXL"],"variantSizes":["XS","S","M","L","XL","XXL","XXXL"],"collectionCodes":["COL-006","COL-010","COL-025"],"featured":false},
  {"id":"rf-tex-set-002","handle":"rf-tex-set-002","sku":"RF-TEX-SET-002","name":"ResoFlex Men Technical Performance Compression Set","category":"Apparel","price":22500,"variantSkus":["RF-TEX-SET-002-M"],"variantSizes":["M"],"collectionCodes":["COL-006","COL-010"],"featured":false},
  {"id":"rf-bal-trk-003","handle":"rf-bal-trk-003","sku":"RF-BAL-TRK-003","name":"ResoFlex Men Athletic Balaclava Tracksuit","category":"Apparel","price":30000,"variantSkus":["RF-BAL-TRK-003-M"],"variantSizes":["M"],"collectionCodes":["COL-006"],"featured":false},
  {"id":"rf-men-001","handle":"rf-men-001","sku":"RF-MEN-001","name":"ResoFlex Men Performance Training Shorts","category":"Apparel","price":15000,"variantSkus":["RF-MEN-001-M"],"variantSizes":["M"],"collectionCodes":["COL-006"],"featured":false},
  {"id":"rf-men-002","handle":"rf-men-002","sku":"RF-MEN-002","name":"ResoFlex Men Aero-Dry Running T-Shirt","category":"Apparel","price":15000,"variantSkus":["RF-MEN-002-M"],"variantSizes":["M"],"collectionCodes":["COL-006","COL-011"],"featured":false},
  {"id":"rf-men-003","handle":"rf-men-003","sku":"RF-MEN-003","name":"ResoFlex Men Heavyweight Sleeveless Gym Hoodie","category":"Apparel","price":25000,"variantSkus":["RF-MEN-003-M"],"variantSizes":["M"],"collectionCodes":["COL-006","COL-010"],"featured":false},
  {"id":"resoflex-ladies-2piece","handle":"resoflex-ladies-2piece","sku":"resoflex-ladies-2piece","name":"ResoFlex Ladies 2-Piece Ribbed Activewear Set","category":"Apparel","price":22500,"variantSkus":["resoflex-ladies-2piece-XS","resoflex-ladies-2piece-S","resoflex-ladies-2piece-M","resoflex-ladies-2piece-L","resoflex-ladies-2piece-XL","resoflex-ladies-2piece-XXL","resoflex-ladies-2piece-XXXL"],"variantSizes":["XS","S","M","L","XL","XXL","XXXL"],"collectionCodes":["COL-007","COL-010"],"featured":false},
  {"id":"rf-crv-blk-01","handle":"rf-crv-blk-01","sku":"RF-CRV-BLK-01","name":"ResoFlex Women Curvy Collection Obsidian Black","category":"Apparel","price":25000,"variantSkus":["RF-CRV-BLK-01-S","RF-CRV-BLK-01-M","RF-CRV-BLK-01-L"],"variantSizes":["S","M","L"],"collectionCodes":["COL-007","COL-008","COL-025"],"featured":false},
  {"id":"rf-sls-001","handle":"rf-sls-001","sku":"RF-SLS-001","name":"ResoFlex Sculpt Long-Sleeve Biker Set","category":"Apparel","price":22500,"variantSkus":[],"variantSizes":[],"collectionCodes":[],"featured":false},
  {"id":"rf-sls-002","handle":"rf-sls-002","sku":"RF-SLS-002","name":"ResoFlex Pro Zip Long-Sleeve Legging Set","category":"Apparel","price":22500,"variantSkus":[],"variantSizes":[],"collectionCodes":[],"featured":false},
  {"id":"rf-sls-003","handle":"rf-sls-003","sku":"RF-SLS-003","name":"ResoFlex Core Short-Sleeve Legging Set","category":"Apparel","price":22500,"variantSkus":[],"variantSizes":[],"collectionCodes":[],"featured":false},
  {"id":"25-steel-boned-latex-shaper","handle":"25-steel-boned-latex-shaper","sku":"25-steel-boned-latex-shaper","name":"25 Steel-Boned Latex Waist Shaper","category":"Apparel","price":25000,"variantSkus":[],"variantSizes":[],"collectionCodes":[],"featured":false},
  {"id":"rf-skin-001","handle":"rf-skin-001","sku":"RF-SKIN-001","name":"ResoFlex Athletic Muscle Recovery Lotion and Skin Balm","category":"Recovery","price":18000,"variantSkus":[],"variantSizes":[],"collectionCodes":[],"featured":false},
  {"id":"naijafit-7day-free","handle":"naijafit-7day-free","sku":"naijafit-7day-free","name":"NaijaFit 7-Day Free Starter Protocol","category":"Digital","price":0,"variantSkus":[],"variantSizes":[],"collectionCodes":[],"featured":false},
  {"id":"heritage-meal-plan","handle":"heritage-meal-plan","sku":"heritage-meal-plan","name":"Heritage Meal Plan","category":"Meal Plans","price":5000,"variantSkus":["heritage-meal-plan-DIG"],"variantSizes":["Digital"],"collectionCodes":["COL-017","COL-028","COL-035"],"featured":false},
  {"id":"enhanced-meal-move","handle":"enhanced-meal-move","sku":"enhanced-meal-move","name":"Enhanced Meal & Move Protocol","category":"Meal Plans","price":5000,"variantSkus":["enhanced-meal-move-DIG"],"variantSizes":["Digital"],"collectionCodes":["COL-018","COL-032"],"featured":false},
  {"id":"fitness-evolution","handle":"fitness-evolution","sku":"fitness-evolution","name":"Fitness Evolution Guide","category":"Digital","price":10000,"variantSkus":["fitness-evolution-DIG"],"variantSizes":["Digital"],"collectionCodes":["COL-017","COL-036"],"featured":false},
  {"id":"resoflex-kinetic","handle":"resoflex-kinetic","sku":"resoflex-kinetic","name":"Personalized Meal & Workout Exit Intent","category":"Digital","price":15000,"variantSkus":["resoflex-kinetic-DIG"],"variantSizes":["Digital"],"collectionCodes":["COL-017","COL-027","COL-036"],"featured":false},
  {"id":"resoflex-commander","handle":"resoflex-commander","sku":"resoflex-commander","name":"Premium Meal & Workout + BioSync Scale","category":"Digital","price":25000,"variantSkus":["resoflex-commander-DIG"],"variantSizes":["Digital + Hardware"],"collectionCodes":["COL-018","COL-027","COL-029","COL-037"],"featured":false},
  {"id":"b2k-004","handle":"b2k-004","sku":"B2K-004","name":"B2K-ELITE 90-Day VIP Bundle","category":"Subscriptions","price":120000,"variantSkus":["B2K-004-VIP"],"variantSizes":["90-Day Access"],"collectionCodes":["COL-019","COL-020","COL-021"],"featured":false},
  {"id":"resoflex-ascension-bundle","handle":"resoflex-ascension-bundle","sku":"resoflex-ascension-bundle","name":"The ResoFlex Ascension Bundle","category":"Subscriptions","price":85000,"variantSkus":["resoflex-ascension-bundle-VIP"],"variantSizes":["Full Bundle"],"collectionCodes":["COL-020","COL-037"],"featured":false},
  {"id":"res-dig-reset","handle":"res-dig-reset","sku":"res-dig-reset","name":"ResoFlex 7-Day Reset","category":"Digital","price":1000,"variantSkus":["res-dig-reset-DIG"],"variantSizes":["Digital"],"collectionCodes":["COL-017","COL-028","COL-035"],"featured":true},
  {"id":"res-dig-nut","handle":"res-dig-nut","sku":"res-dig-nut","name":"ResoFlex Nigerian Nutrition Protocol","category":"Meal Plans","price":5000,"variantSkus":["res-dig-nut-DIG"],"variantSizes":["Digital"],"collectionCodes":["COL-018","COL-028","COL-035"],"featured":true},
  {"id":"res-coach-01","handle":"res-coach-01","sku":"res-coach-01","name":"ResoFlex Premium Coaching","category":"Coaching","price":100000,"variantSkus":["res-coach-01-SVC"],"variantSizes":["Digital/service"],"collectionCodes":["COL-020","COL-021"],"featured":false},
  {"id":"res-iron-15","handle":"res-iron-15","sku":"res-iron-15","name":"ResoFlex 15kg Cast Iron Set + Dumbbell Extension + Travel Box","category":"Gym Equipment","price":60000,"variantSkus":["res-iron-15-DMB","res-iron-15-BOX"],"variantSizes":["Standard"],"collectionCodes":["COL-002","COL-012"],"featured":false},
  {"id":"res-iron-30","handle":"res-iron-30","sku":"res-iron-30","name":"ResoFlex 30kg Cast Iron Set + Dumbbell","category":"Gym Equipment","price":120000,"variantSkus":["res-iron-30-DMB"],"variantSizes":["Standard"],"collectionCodes":["COL-002","COL-012"],"featured":false},
  {"id":"res-iron-50","handle":"res-iron-50","sku":"res-iron-50","name":"ResoFlex 50kg Cast Iron Set","category":"Gym Equipment","price":220000,"variantSkus":["res-iron-50-STD"],"variantSizes":["Standard"],"collectionCodes":["COL-002","COL-012","COL-033"],"featured":true},
  {"id":"res-bundle-apex","handle":"res-bundle-apex","sku":"res-bundle-apex","name":"ResoFlex Buchi Power Apex Bundle","category":"Bundle","price":380000,"variantSkus":["res-bundle-apex-FULL"],"variantSizes":["Complete home bundle"],"collectionCodes":["COL-020","COL-037"],"featured":true}
];

export const IMAGEKIT_CATALOG: ImageKitCatalogProduct[] = MASTER_CATALOG
  .filter((p) => Boolean(IMAGEKIT_VERIFIED_MEDIA[p.sku]))
  .map((p) => ({ ...p, media: IMAGEKIT_VERIFIED_MEDIA[p.sku] }));

export const IMAGEKIT_CATALOG_BY_SKU = Object.fromEntries(
  IMAGEKIT_CATALOG.map((p) => [p.sku, p])
) as Record<string, ImageKitCatalogProduct>;

export const IMAGEKIT_ENDPOINT = "https://ik.imagekit.io/resofit808";

export const imageKitAssetUrl = (path?: string) =>
  path ? `${IMAGEKIT_ENDPOINT}${path}` : undefined;

export const getImageKitHero = (sku: string) =>
  imageKitAssetUrl(IMAGEKIT_CATALOG_BY_SKU[sku]?.media?.assets.hero?.path);

export const IMAGEKIT_STORE_PRODUCTS: Product[] = IMAGEKIT_CATALOG.map((p) => {
  const hero = p.media?.assets.hero?.path;
  const image = imageKitAssetUrl(hero) ?? "/placeholder.svg";
  const variants = p.variantSizes.filter(Boolean);
  const tagline = [
    p.category,
    variants.length ? `Sizes: ${variants.join(", ")}` : "",
    p.collectionCodes.length ? `Collections: ${p.collectionCodes.join(", ")}` : "",
  ].filter(Boolean).join(" · ");

  return {
    id: p.id,
    handle: p.handle,
    sku: p.sku,
    name: p.name,
    tagline,
    priceLabel: `NGN ${p.price.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    was: p.price,
    now: p.price,
    features: [
      `Category: ${p.category}`,
      ...(variants.length ? [`Available: ${variants.join(", ")}`] : []),
      ...(p.variantSkus.filter(Boolean).length ? [`Variant SKUs: ${p.variantSkus.filter(Boolean).join(", ")}`] : []),
      ...(p.collectionCodes.length ? [`Collections: ${p.collectionCodes.join(", ")}`] : []),
      "ImageKit verified production media",
    ],
    popular: p.featured,
    icon: "fa-dumbbell",
    image,
  };
});
