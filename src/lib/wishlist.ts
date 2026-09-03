const KEY = "resoflex:wishlist:v1";
const RECENT_KEY = "resoflex:recently-bought:v1";

type WishlistItem = { sku: string; handle: string; name: string; image?: string; price?: number };

function read(key: string): WishlistItem[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]") as WishlistItem[]; } catch { return []; }
}
function write(key: string, items: WishlistItem[]) { try { localStorage.setItem(key, JSON.stringify(items.slice(0, 100))); window.dispatchEvent(new Event("resoflex:commerce-state")); } catch {} }

export const getWishlist = () => read(KEY);
export const isWishlisted = (sku: string) => getWishlist().some((x) => x.sku === sku);
export const toggleWishlist = (item: WishlistItem) => {
  const current = getWishlist();
  const next = current.some((x) => x.sku === item.sku) ? current.filter((x) => x.sku !== item.sku) : [item, ...current];
  write(KEY, next);
  return next.some((x) => x.sku === item.sku);
};
export const clearWishlist = () => write(KEY, []);
export const rememberPurchase = (item: WishlistItem) => write(RECENT_KEY, [item, ...read(RECENT_KEY).filter((x) => x.sku !== item.sku)]);
export const getRecentlyBought = () => read(RECENT_KEY);
