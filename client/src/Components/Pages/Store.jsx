import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProducts, useCategories } from "../../hooks/useProducts";
import ProductCard from "../ui/ProductCard";

const SORT_OPTIONS = [
  { value: "", label: "Default (Newest)" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
  { value: "name", label: "Name: A → Z" },
];

const Store = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: products, isLoading, isError } = useProducts();
  const { data: categories } = useCategories();

  // Client-side filtering + sorting
  const filtered = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Price range
    if (minPrice !== "") {
      result = result.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice !== "") {
      result = result.filter((p) => p.price <= Number(maxPrice));
    }

    // Sort
    if (sort === "price_asc") result.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") result.sort((a, b) => b.price - a.price);
    else if (sort === "rating") result.sort((a, b) => b.rating - a.rating);
    else if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [products, search, selectedCategories, minPrice, maxPrice, sort]);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSort("");
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
  };

  const hasActiveFilters =
    search || sort || selectedCategories.length > 0 || minPrice || maxPrice;

  // Skeleton cards for loading state
  const SkeletonCard = () => (
    <div className="bg-white/80 dark:bg-white/[0.04] rounded-2xl border border-gray-200/60 dark:border-white/[0.06] overflow-hidden animate-pulse">
      <div className="bg-gray-200 dark:bg-gray-700/50 h-36 sm:h-44 md:h-52" />
      <div className="p-3 sm:p-4 space-y-2.5">
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );

  // Filter sidebar content (shared between desktop & mobile)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">
          Categories
        </h3>
        <div className="space-y-2">
          {categories?.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2.5 cursor-pointer group/cat"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-yellow-500 focus:ring-yellow-400 bg-white dark:bg-gray-800"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300 group-hover/cat:text-gray-900 dark:group-hover/cat:text-white transition-colors">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">
          Price Range
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
          />
          <span className="text-gray-400 text-xs">to</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>
      </div>

      {/* Clear All */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            clearFilters();
            setMobileFiltersOpen(false);
          }}
          className="w-full py-2 text-sm font-semibold text-red-500 hover:text-red-600 border border-red-200 dark:border-red-500/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="pt-20 md:pt-24 pb-12 min-h-screen">
      {/* Page Header */}
      <div className="max-w-[1200px] mx-auto px-4 mb-6 sm:mb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-3">
          <Link
            to="/"
            className="hover:text-yellow-500 transition-colors"
          >
            Home
          </Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-600 dark:text-gray-300">Store</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
          Our <span className="section-heading">Store</span>
        </h1>
      </div>

      <div className="max-w-[1200px] mx-auto px-4">
        {/* Search + Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm text-gray-800 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400 transition-colors"
            />
          </div>

          {/* Sort + Mobile filter button */}
          <div className="flex gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-yellow-400 transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden px-4 py-2.5 rounded-xl border border-gray-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm text-gray-700 dark:text-gray-300 text-sm hover:border-yellow-400 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
          </div>
        </div>

        {/* Active filters chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {selectedCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 text-xs font-semibold rounded-full"
              >
                {cat}
                <button
                  onClick={() => toggleCategory(cat)}
                  className="hover:text-yellow-900 dark:hover:text-yellow-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-100 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-400 text-xs font-semibold rounded-full">
                "{search}"
                <button onClick={() => setSearch("")}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                ₹{minPrice || "0"} – ₹{maxPrice || "..."}
                <button onClick={() => { setMinPrice(""); setMaxPrice(""); }}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-red-500 hover:text-red-600 font-semibold ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Main layout: sidebar + grid */}
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-24 bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5">
              <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">
                Filters
              </h2>
              <FilterContent />
            </div>
          </aside>

          {/* Product grid area */}
          <div className="flex-1 min-w-0">
            {/* Results count */}
            {!isLoading && (
              <p className="text-xs sm:text-sm text-gray-400 mb-4">
                Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              </p>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 md:gap-5">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Error */}
            {isError && (
              <div className="text-center py-20">
                <p className="text-red-500 text-sm mb-2">Failed to load products.</p>
                <p className="text-gray-400 text-xs">Make sure the backend server is running on port 5000.</p>
              </div>
            )}

            {/* Products grid */}
            {!isLoading && !isError && filtered.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 md:gap-5">
                {filtered.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !isError && filtered.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-1">
                  No products found
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Try adjusting your search or filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-sm font-bold rounded-full hover:scale-105 transition-all"
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
        className={`fixed top-0 right-0 h-full w-[80vw] max-w-[320px] bg-white dark:bg-gray-900/95 backdrop-blur-xl p-5 transform ${
          mobileFiltersOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out lg:hidden z-[70] border-l border-gray-200 dark:border-white/10 overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Filters
          </h2>
          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-gray-600 dark:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <FilterContent />
      </div>
    </div>
  );
};

export default Store;
