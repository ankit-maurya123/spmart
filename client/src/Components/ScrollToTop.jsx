import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scroll the window back to the top whenever the route changes.
 *
 * Without this, React Router preserves the previous page's scroll position,
 * so navigating from a long page (e.g. ProductDetails or a deep Store
 * filter view) into another route opens that route mid-scroll.
 *
 * Special cases handled:
 *   1. Anchor links (`/foo#reviews`) — we leave the browser to handle the
 *      hash scroll itself instead of forcing top.
 *   2. Back/forward navigation (POP) — we restore the original position so
 *      the user lands where they were, like every other site.
 *   3. Modal/dialog opens that change the URL with the same pathname —
 *      skipped because pathname didn't change.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Let the browser handle hash-anchor scrolling itself.
    if (hash) return;

    // Don't fight back/forward — let the browser restore.
    if (window.history.state?.idx !== undefined &&
        window.performance?.getEntriesByType?.("navigation")?.[0]?.type === "back_forward") {
      return;
    }

    // Jump to top — instant, not smooth, so it feels like a real page load.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}
