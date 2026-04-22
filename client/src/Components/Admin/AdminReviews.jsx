import { useState } from "react";
import { useAllReviews, useDeleteReview } from "../../hooks/useAdmin";
import { resolveProductImage } from "../../lib/imageMap";

function StarDisplay({ rating, size = "w-3.5 h-3.5" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`${size} ${s <= Math.round(rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewModal({ review, onClose, onDelete, deleting }) {
  if (!review) return null;

  const product = review.productId;
  const productImage = product ? resolveProductImage(product) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#0e0e24] border border-gray-200/60 dark:border-white/[0.06] shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200/60 dark:border-white/[0.06]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Review Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Reviewer info */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-base font-bold flex-shrink-0">
              {review.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{review.name}</p>
              <p className="text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <StarDisplay rating={review.rating} size="w-5 h-5" />
            <span className="px-2.5 py-1 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 text-xs font-bold">
              {review.rating}/5
            </span>
            <span className="text-xs text-gray-400">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][review.rating]}
            </span>
          </div>

          {/* Comment */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Comment</p>
            <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04] p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {review.comment}
              </p>
            </div>
          </div>

          {/* Product info */}
          {product && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Product</p>
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04] p-3">
                {productImage && (
                  <img
                    src={productImage}
                    alt={product.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-gray-200 dark:border-white/10"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                  {product.category && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                      {product.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200/60 dark:border-white/[0.06]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => onDelete(review._id)}
            disabled={deleting}
            className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {deleting ? "Deleting..." : "Delete Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReviews() {
  const { data: reviews, isLoading } = useAllReviews();
  const deleteReview = useDeleteReview();
  const [search, setSearch] = useState("");
  const [viewReview, setViewReview] = useState(null);

  const filtered = reviews?.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.productId?.name?.toLowerCase().includes(q)
    );
  }) ?? [];

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this review? The product rating will be recalculated.")) {
      deleteReview.mutate(id, {
        onSuccess: () => setViewReview(null),
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by reviewer or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>
        {!isLoading && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} review{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200/60 dark:border-white/[0.06]">
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Reviewer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Rating</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Comment</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden lg:table-cell">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/60 dark:divide-white/[0.06]">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" /><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" /></div></td>
                      <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded ml-auto" /></td>
                    </tr>
                  ))
                : filtered.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {r.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{r.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-600 dark:text-gray-400 truncate max-w-[160px]">
                        {r.productId?.name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StarDisplay rating={r.rating} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                        {r.comment}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-400 dark:text-gray-500 text-xs">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewReview(r)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors"
                            title="View review"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(r._id)}
                            disabled={deleteReview.isPending}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            title="Delete review"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!isLoading && filtered.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No reviews found.</p>
        )}
      </div>

      {/* View Review Modal */}
      {viewReview && (
        <ReviewModal
          review={viewReview}
          onClose={() => setViewReview(null)}
          onDelete={handleDelete}
          deleting={deleteReview.isPending}
        />
      )}
    </div>
  );
}
