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
  const selectedCategories = useMemo(() => {
    const raw = searchParams.get("category");
    return raw ? raw.split(",").filter(Boolean) : [];
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

  const { data: products, isLoading, isError } = useProducts();
  const { data: categories } = useCategories();

  /** Merge a partial change into the URL params. Pass `null`/`""` to delete. */
  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) {
        next.delete(k);
      } else if (Array.isArray(v)) {
        next.set(k, v.join(","));
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

  // Filter sidebar content (shared between desktop & mobile)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3">Categories</h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {categories?.map((cat) => {
            const checked = selectedCategories.includes(cat);
            return (
              <label
                key={cat}
                className="flex items-center gap-2.5 cursor-pointer group/cat"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(cat)}
                  className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 bg-white"
                />
                <span
                  className={`text-sm transition-colors ${
                    checked
                      ? "text-violet-700 font-bold"
                      : "text-gray-600 group-hover/cat:text-gray-900"
                  }`}
                >
                  {cat}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => updateParams({ min: e.target.value || null })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors"
          />
          <span className="text-gray-400 text-xs">to</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => updateParams({ max: e.target.value || null })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors"
          />
        </div>
      </div>

      {/* Clear All */}
      {hasActiveFilters && (
        <button
          onClick={() => { clearFilters(); setMobileFiltersOpen(false); }}
          className="w-full py-2 text-sm font-semibold text-rose-500 hover:text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-all"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="pt-6 md:pt-8 pb-12 min-h-screen">
      {/* Page Header */}
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 mb-5 sm:mb-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-3">
          <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-600">Store</span>
          {selectedCategories.length === 1 && (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-semibold">{selectedCategories[0]}</span>
            </>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
          {selectedCategories.length === 1 ? (
            <>
              {selectedCategories[0]} <span className="text-violet-600">Store</span>
            </>
          ) : (
            <>
              Our <span className="text-violet-600">Store</span>
            </>
          )}
        </h1>
      </div>

      <div className="max-w-[1280px] mx-auto px-3 sm:px-4">
        {/* Search + Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products by name, brand, tag…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors"
            />
          </div>

          {/* Sort + Mobile filter button */}
          <div className="flex gap-2">
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value || null })}
              className="px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none focus:border-violet-400 transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:border-violet-400 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {selectedCategories.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-violet-600 text-white text-[10px] font-bold">
                  {selectedCategories.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {selectedCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full"
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
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-semibold rounded-full">
                "{search}"
                <button onClick={() => setSearchInput("")} aria-label="Clear search">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
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
              className="text-xs text-rose-500 hover:text-rose-600 font-bold ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Main layout: sidebar + grid */}
        <div className="flex gap-5 sm:gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-32 bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-base font-extrabold text-gray-900 mb-4">Filters</h2>
              <FilterContent />
            </div>
          </aside>

          {/* Product grid area */}
          <div className="flex-1 min-w-0">
            {/* Results count */}
            {!isLoading && (
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                Showing <span className="font-bold text-gray-900">{filtered.length}</span>{" "}
                product{filtered.length !== 1 ? "s" : ""}
                {selectedCategories.length === 1 && (
                  <> in <span className="font-bold text-violet-600">{selectedCategories[0]}</span></>
                )}
              </p>
            )}

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

      {/* Mobile filter panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[85vw] max-w-[340px] bg-white p-5 transform ${
          mobileFiltersOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out lg:hidden z-[70] border-l border-gray-200 overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-extrabold text-gray-900">Filters</h2>
          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all text-gray-600"
            aria-label="Close filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <FilterContent />

        {/* Apply / view results CTA on mobile */}
        <div className="sticky bottom-0 -mx-5 px-5 pt-4 pb-3 mt-6 bg-white border-t border-gray-200">
          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-extrabold rounded-full transition-colors"
          >
            View {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Store;
