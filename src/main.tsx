import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Recover from stale lazy chunks after a redeploy: if a dynamic import fails
// because the hashed chunk no longer exists, force a single hard reload.
const RELOAD_KEY = "__chunk_reloaded__";
const isChunkError = (msg: string) =>
  /Importing a module script failed|Failed to fetch dynamically imported module|Loading chunk [\d]+ failed|ChunkLoadError/i.test(
    msg || "",
  );
const tryReload = () => {
  if (sessionStorage.getItem(RELOAD_KEY)) return;
  sessionStorage.setItem(RELOAD_KEY, "1");
  window.location.reload();
};
window.addEventListener("error", (e) => {
  if (isChunkError(e.message)) tryReload();
});
window.addEventListener("unhandledrejection", (e) => {
  const msg = (e.reason && (e.reason.message || String(e.reason))) || "";
  if (isChunkError(msg)) tryReload();
});
// Clear the guard once the app boots successfully.
window.addEventListener("load", () => {
  setTimeout(() => sessionStorage.removeItem(RELOAD_KEY), 2000);
});

createRoot(document.getElementById("root")!).render(<App />);
