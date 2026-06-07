import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useProducts, useCategories } from "../../hooks/useProducts";
import usePageMeta from "../../hooks/usePageMeta";
import ProductCard from "../ui/ProductCard";

const SORT_OPTIONS = [
  { value: "",           label: "Default (Newest)" },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating",     label: "Top Rated" },
  { value: "name",       label: "Name: A → Z" },
];

const Store = () => {
  // URL is the source of truth — filters survive refresh, back/forward, and shared links
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filter state from URL
  const search = searchParams.get("search") || "";
  const sort   = searchParams.get("sort") || "";
  const minPrice = searchParams.get("min") || "";
  const maxPrice = searchParams.get("max") || "";
  // Read every `category` param. Using getAll (vs a single comma-joined
  // string) is critical because some category names contain commas
  // themselves, e.g. "Atta, Sooji & Flours" — splitting on "," would
  // shred them and cause duplicate chips on every click.
  const selectedCategories = useMemo(() => {
    return searchParams.getAll("category").filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Local search input state (debounced into the URL so typing doesn't churn history)
  const [searchInput, setSearchInput] = useState(search);

  // Keep local input in sync if URL changes externally (back button, link click)
  useEffect(() => { setSearchInput(search); }, [search]);

  // Debounce search → URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput === search) return;
      updateParams({ search: searchInput || null });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  const { data: products, isLoading, isError } = useProducts();
  const { data: categories } = useCategories();

  // Product counts per category — for badges in the filter list
  const categoryCounts = useMemo(() => {
    const m = new Map();
    (products || []).forEach((p) => {
      m.set(p.category, (m.get(p.category) || 0) + 1);
    });
    return m;
  }, [products]);

  // Categories ordered: SELECTED first, then by product count desc, alpha tie-break.
  // Filtered by the category search box so the user can jump to one quickly.
  const orderedCategories = useMemo(() => {
    if (!categories) return [];
    const q = categorySearch.trim().toLowerCase();
    const visible = q
      ? categories.filter((c) => c.toLowerCase().includes(q))
      : categories;
    return [...visible].sort((a, b) => {
      const aSel = selectedCategories.includes(a) ? 1 : 0;
      const bSel = selectedCategories.includes(b) ? 1 : 0;
      if (aSel !== bSel) return bSel - aSel;
      const aCount = categoryCounts.get(a) || 0;
      const bCount = categoryCounts.get(b) || 0;
      if (aCount !== bCount) return bCount - aCount;
      return a.localeCompare(b);
    });
  }, [categories, selectedCategories, categorySearch, categoryCounts]);

  // Price quick-pick presets — chip is active when its bounds match the URL state.
  const PRICE_PRESETS = [
    { label: "Under ₹100", min: "",   max: "100" },
    { label: "₹100 – 300", min: "100", max: "300" },
    { label: "₹300 – 500", min: "300", max: "500" },
    { label: "₹500+",      min: "500", max: ""   },
  ];
  const applyPricePreset = (p) =>
    updateParams({ min: p.min || null, max: p.max || null });
  const isPricePresetActive = (p) =>
    (minPrice || "") === p.min && (maxPrice || "") === p.max;

  /** Merge a partial change into the URL params. Pass `null`/`""` to delete.
      Array values are written as multiple identical-key params (the URL
      spec way), so values containing commas survive a round-trip. */
  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) {
        next.delete(k);
      } else if (Array.isArray(v)) {
        next.delete(k);
        v.forEach((val) => next.append(k, val));
      } else {
        next.set(k, String(v));
      }
    }
    setSearchParams(next, { replace: true });
  };

  const toggleCategory = (cat) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    updateParams({ category: next });
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const hasActiveFilters =
    !!(search || sort || selectedCategories.length > 0 || minPrice || maxPrice);

  // Dynamic SEO title — reflects active category / search filter
  const metaTitle =
    selectedCategories.length === 1
      ? `${selectedCategories[0]} — Buy Online`
      : search
      ? `Search "${search}" — Store`
      : "Online Grocery Store";
  const metaDesc =
    selectedCategories.length === 1
      ? `Shop ${selectedCategories[0]} online at SPMart. Fast 10-minute delivery, lowest prices, top brands.`
      : "Browse the full SPMart catalog — fresh vegetables, oils, spices, dairy, snacks and more, all delivered in 10 minutes.";
  usePageMeta({ title: metaTitle, description: metaDesc });

  // Client-side filtering + sorting
  const filtered = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => {
        const fields = [
          p.name,
          p.description,
          p.brand,
          p.category,
          ...(p.tags || []),
        ];
        return fields.some(
          (f) => typeof f === "string" && f.toLowerCase().includes(q)
        );
      });
    }

    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    if (minPrice !== "") result = result.filter((p) => p.price >= Number(minPrice));
    if (maxPrice !== "") result = result.filter((p) => p.price <= Number(maxPrice));

    if (sort === "price_asc")  result.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") result.sort((a, b) => b.price - a.price);
    else if (sort === "rating")     result.sort((a, b) => b.rating - a.rating);
    else if (sort === "name")       result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [products, search, selectedCategories, minPrice, maxPrice, sort]);

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="bg-gray-200 aspect-square" />
      <div className="p-3 space-y-2.5">
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  );

  /**
   * Filter content — shared between desktop sidebar and the mobile drawer.
   * No nested overflow scrolling: the parent (sidebar or drawer body) handles
   * scroll so we never get double scrollbars on tight viewports.
   */
  const FilterContent = () => (
    <div className="space-y-5">
      {/* ── Categories ── */}
      <section>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-extrabold text-gray-900">Categories</h3>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => updateParams({ category: null })}
              className="text-[11px] font-bold text-rose-500 hover:text-rose-600"
            >
              Clear ({selectedCategories.length})
            </button>
          )}
        </div>

        {/* Search inside categories — invaluable when there are 15+ */}
        {(categories?.length || 0) > 6 && (
          <div className="relative mb-2.5">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Search category…"
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors"
            />
            {categorySearch && (
              <button
                onClick={() => setCategorySearch("")}
                aria-label="Clear category search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        <ul className="space-y-0.5">
          {orderedCategories.length === 0 ? (
            <li className="text-xs text-gray-400 italic py-2">No categories match "{categorySearch}".</li>
          ) : (
            orderedCategories.map((cat) => {
              const checked = selectedCategories.includes(cat);
              const count = categoryCounts.get(cat) || 0;
              return (
                <li key={cat}>
                  <label
                    className={`flex items-center gap-2.5 cursor-pointer rounded-lg px-2 py-1.5 transition-colors ${
                      checked ? "bg-violet-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(cat)}
                      className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 bg-white"
                    />
                    <span
                      className={`flex-1 text-sm leading-tight ${
                        checked ? "text-violet-700 font-extrabold" : "text-gray-700"
                      }`}
                    >
                      {cat}
                    </span>
                    {count > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        checked
                          ? "bg-violet-200 text-violet-800"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {count}
                      </span>
                    )}
                  </label>
                </li>
              );
            })
          )}
        </ul>
      </section>

      {/* ── Price Range ── */}
      <section>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-extrabold text-gray-900">Price Range</h3>
          {(minPrice || maxPrice) && (
            <button
              onClick={() => updateParams({ min: null, max: null })}
              className="text-[11px] font-bold text-rose-500 hover:text-rose-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick-pick chips */}
        <div className="grid grid-cols-2 gap-1.5 mb-2.5">
          {PRICE_PRESETS.map((p) => {
            const active = isPricePresetActive(p);
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPricePreset(p)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-colors ${
                  active
                    ? "bg-violet-600 text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Custom range */}
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Custom range</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => updateParams({ min: e.target.value || null })}
            className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors"
          />
          <span className="text-gray-400 text-xs">–</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => updateParams({ max: e.target.value || null })}
            className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors"
          />
        </div>
      </section>
    </div>
  );

  const activeFilterCount =
    selectedCategories.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  return (
    <div className="pb-12 min-h-screen">
      {/* ─ Compact Hero ────────────────────────────────────────────
         One gradient strip combines: breadcrumb + heading + product
         count + search + sort + (mobile) filter button.
         Replaces the previous three separate stacked rows. */}
      <section className="relative overflow-hidden border-b border-violet-100/70 bg-gradient-to-br from-violet-50/80 via-white to-rose-50/60">
        <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-violet-200/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-rose-200/25 blur-2xl" />

        <div className="relative max-w-[1280px] mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-500 mb-1">
            <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
            <svg className="w-2.5 h-2.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-700 font-semibold">Store</span>
            {selectedCategories.length === 1 && (
              <>
                <svg className="w-2.5 h-2.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-violet-700 font-semibold truncate">{selectedCategories[0]}</span>
              </>
            )}
          </nav>

          {/* Title row + live product count */}
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 leading-tight truncate">
              {selectedCategories.length === 1 ? (
                selectedCategories[0]
              ) : (
                <>Our <span className="text-violet-600">Store</span></>
              )}
            </h1>
            {!isLoading && (
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium whitespace-nowrap flex-shrink-0">
                <span className="font-extrabold text-violet-600">{filtered.length}</span>
                {" "}{filtered.length === 1 ? "product" : "products"}
              </p>
            )}
          </div>

          {/* Search + Sort + (mobile) Filters — single row, scales to width */}
          <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 sm:gap-2">
            <div className="relative flex-1 min-w-0">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products by name, brand, tag…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-8 py-2 sm:py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 text-xs sm:text-sm placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value || null })}
              aria-label="Sort products"
              className="flex-shrink-0 max-w-[120px] sm:max-w-none px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs sm:text-sm font-bold focus:outline-none focus:border-violet-400 cursor-pointer truncate"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex-shrink-0 inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-violet-600 text-white text-xs sm:text-sm font-extrabold hover:bg-violet-700 transition-colors shadow-sm shadow-violet-500/20"
              aria-label="Open filters"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-white text-violet-700 text-[10px] font-extrabold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 pt-3 sm:pt-4">

        {/* ─ Active filter chips — compact, single scrollable row on mobile ─ */}
        {hasActiveFilters && (
          <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1 sm:flex-wrap sm:overflow-visible">
            {selectedCategories.map((cat) => (
              <span
                key={cat}
                className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-violet-100 text-violet-700 text-[11px] sm:text-xs font-semibold rounded-full"
              >
                {cat}
                <button onClick={() => toggleCategory(cat)} className="hover:text-violet-900" aria-label={`Remove ${cat}`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            {search && (
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-cyan-100 text-cyan-700 text-[11px] sm:text-xs font-semibold rounded-full">
                "{search}"
                <button onClick={() => setSearchInput("")} aria-label="Clear search">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-green-100 text-green-700 text-[11px] sm:text-xs font-semibold rounded-full">
                ₹{minPrice || "0"} – ₹{maxPrice || "∞"}
                <button onClick={() => updateParams({ min: null, max: null })} aria-label="Clear price range">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="flex-shrink-0 text-[11px] sm:text-xs text-rose-500 hover:text-rose-600 font-bold ml-0.5"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Main layout: sidebar + grid */}
        <div className="flex gap-5 sm:gap-6">
          {/* Desktop sidebar — sticky + capped at viewport so the inside
              can scroll independently of the page. */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-32 bg-white rounded-2xl border border-gray-200 flex flex-col max-h-[calc(100vh-9rem)]">
              <h2 className="flex-shrink-0 text-base font-extrabold text-gray-900 px-5 pt-5 pb-3 border-b border-gray-100">
                Filters
              </h2>
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 no-scrollbar">
                <FilterContent />
              </div>
            </div>
          </aside>

          {/* Product grid area */}
          <div className="flex-1 min-w-0">
            {/* Loading */}
            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Error */}
            {isError && (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                <p className="text-rose-500 text-sm font-bold mb-2">Failed to load products.</p>
                <p className="text-gray-400 text-xs">Make sure the backend server is running on port 5000.</p>
              </div>
            )}

            {/* Products grid */}
            {!isLoading && !isError && filtered.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
                {filtered.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !isError && filtered.length === 0 && (
              <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-50 mb-4">
                  <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">No products found</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Try adjusting your search or filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-full transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter overlay */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setMobileFiltersOpen(false)}
        />
      )}

      {/* ─── Mobile filter panel — proper flex column ─── */}
      <aside
        aria-hidden={!mobileFiltersOpen}
        className={`fixed top-0 right-0 h-full w-[88vw] max-w-[360px] bg-white shadow-2xl flex flex-col transform ${
          mobileFiltersOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out lg:hidden z-[70] border-l border-gray-200`}
      >
        {/* Sticky header — flex-shrink-0 so it stays put */}
        <header className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-base font-extrabold text-gray-900">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-violet-600 text-white text-[10px] font-extrabold">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {hasActiveFilters && (
              <button
                onClick={() => { clearFilters(); setCategorySearch(""); }}
                className="text-[11px] font-extrabold text-rose-500 hover:text-rose-600 px-2 py-1"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
              aria-label="Close filters"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Scrollable body — single scrollbar, no nested overflow */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 no-scrollbar">
          <FilterContent />
        </div>

        {/* Sticky footer CTA — flex-shrink-0 with safe-area support */}
        <div className="flex-shrink-0 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)] bg-white border-t border-gray-200">
          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-extrabold rounded-full shadow-md shadow-violet-500/20 transition-colors"
          >
            View {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Store;
