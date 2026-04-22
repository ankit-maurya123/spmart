import { useState } from "react";
import { useCategoryStats, useAddCategory, useDeleteCategory } from "../../hooks/useAdmin";

const CATEGORY_META = {
  Oil: { icon: "🫒" },
  Spices: { icon: "🌶️" },
  Flour: { icon: "🌾" },
  Dairy: { icon: "🥛" },
  Snacks: { icon: "🍿" },
  Vegetables: { icon: "🥦" },
  Noodles: { icon: "🍜" },
  Essentials: { icon: "🧂" },
  Beverages: { icon: "☕" },
  Fruits: { icon: "🍎" },
  Bakery: { icon: "🍞" },
  Frozen: { icon: "🧊" },
  "Personal Care": { icon: "🧴" },
  Cleaning: { icon: "🧹" },
};

const DEFAULT_ICON = "📦";

function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-4 h-4 ${s <= Math.round(rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

export default function AdminCategories() {
  const { data: categories, isLoading } = useCategoryStats();
  const addCategory = useAddCategory();
  const deleteCategory = useDeleteCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [error, setError] = useState("");

  const openModal = () => {
    setCatName("");
    setError("");
    setModalOpen(true);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    setError("");

    const trimmed = catName.trim();
    if (!trimmed) {
      setError("Category name is required.");
      return;
    }

    addCategory.mutate(trimmed, {
      onSuccess: () => setModalOpen(false),
      onError: (err) => {
        setError(err?.response?.data?.error || "Failed to add category.");
      },
    });
  };

  const handleDelete = (name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;

    deleteCategory.mutate(name, {
      onError: (err) => {
        alert(err?.response?.data?.error || "Failed to delete category.");
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isLoading ? "Loading..." : `${categories?.length || 0} categories`}
        </p>
        <button
          onClick={openModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <CategorySkeleton key={i} />)
          : categories?.map((cat) => (
              <div
                key={cat.name}
                className="group relative rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Delete button — only for empty categories */}
                {cat.count === 0 && (
                  <button
                    onClick={() => handleDelete(cat.name)}
                    disabled={deleteCategory.isPending}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50"
                    title="Delete category"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-xl">
                    {CATEGORY_META[cat.name]?.icon || DEFAULT_ICON}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{cat.name}</h3>
                    {cat.count === 0 && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">No products yet</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Products</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{cat.count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Avg Rating</span>
                    <div className="flex items-center gap-1.5">
                      <StarDisplay rating={cat.avgRating} />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{cat.avgRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {!isLoading && (!categories || categories.length === 0) && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-white/[0.06] mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No categories yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first category to get started.</p>
        </div>
      )}

      {/* Add Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0e0e24] border border-gray-200/60 dark:border-white/[0.06] shadow-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Category</h2>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Category Name <span className="text-red-400">*</span>
                </label>
                <input
                  autoFocus
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Fruits, Bakery, Frozen..."
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addCategory.isPending}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 disabled:opacity-60"
                >
                  {addCategory.isPending ? "Adding..." : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
