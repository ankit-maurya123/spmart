import { useEffect } from "react";

const SITE_NAME = "SPMart";
const DEFAULT_DESC =
  "Order daily groceries, fresh vegetables, premium oils, spices and household essentials from SPMart. Free delivery on orders ₹499+, 10-minute doorstep delivery.";

/**
 * Set per-page <title> and <meta name="description"> imperatively.
 * Restores the previous values on unmount, so navigating between pages
 * always shows the right title in the browser tab.
 *
 * Usage:
 *   usePageMeta({ title: "Cart", description: "Review your items" });
 *
 * Pass `title: null` to use only the site name.
 */
export function usePageMeta({ title, description, noIndex = false } = {}) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} — ${SITE_NAME}`
      : `${SITE_NAME} — Daily Groceries Delivered in 10 Minutes`;

    const desc = description || DEFAULT_DESC;

    const prevTitle = document.title;
    document.title = fullTitle;

    const setMeta = (name, content, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      const prev = el.getAttribute("content");
      el.setAttribute("content", content);
      return [el, prev];
    };

    const [, prevDesc]    = setMeta("description", desc);
    const [, prevOgTitle] = setMeta("og:title", fullTitle, "property");
    const [, prevOgDesc]  = setMeta("og:description", desc, "property");
    const [, prevTwTitle] = setMeta("twitter:title", fullTitle);
    const [, prevTwDesc]  = setMeta("twitter:description", desc);

    // Canonical URL — points to the current page (strip query for cleaner canonicals
    // on filter/search pages so Google doesn't index every permutation).
    const canonicalHref = `${window.location.origin}${window.location.pathname}`;
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    const prevCanonical = canonicalEl?.getAttribute("href") ?? null;
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", canonicalHref);

    // og:url — match canonical
    const [, prevOgUrl] = setMeta("og:url", canonicalHref, "property");

    let robotsEl = null;
    let prevRobots = null;
    if (noIndex) {
      [robotsEl, prevRobots] = setMeta("robots", "noindex, nofollow");
    }

    return () => {
      document.title = prevTitle;
      const descEl    = document.querySelector('meta[name="description"]');
      const ogTitleEl = document.querySelector('meta[property="og:title"]');
      const ogDescEl  = document.querySelector('meta[property="og:description"]');
      const ogUrlEl   = document.querySelector('meta[property="og:url"]');
      const twTitleEl = document.querySelector('meta[name="twitter:title"]');
      const twDescEl  = document.querySelector('meta[name="twitter:description"]');
      if (descEl    && prevDesc    != null) descEl.setAttribute("content", prevDesc);
      if (ogTitleEl && prevOgTitle != null) ogTitleEl.setAttribute("content", prevOgTitle);
      if (ogDescEl  && prevOgDesc  != null) ogDescEl.setAttribute("content", prevOgDesc);
      if (ogUrlEl   && prevOgUrl   != null) ogUrlEl.setAttribute("content", prevOgUrl);
      if (twTitleEl && prevTwTitle != null) twTitleEl.setAttribute("content", prevTwTitle);
      if (twDescEl  && prevTwDesc  != null) twDescEl.setAttribute("content", prevTwDesc);
      if (canonicalEl && prevCanonical != null) canonicalEl.setAttribute("href", prevCanonical);
      if (robotsEl) {
        if (prevRobots != null) robotsEl.setAttribute("content", prevRobots);
        else robotsEl.remove();
      }
    };
  }, [title, description, noIndex]);
}

export default usePageMeta;
