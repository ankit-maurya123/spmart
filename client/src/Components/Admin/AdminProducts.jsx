import { useState, useRef, useEffect } from "react";
import { useProducts, useCategories } from "../../hooks/useProducts";
import { useAddProduct, useUpdateProduct, useDeleteProduct } from "../../hooks/useAdmin";
import { resolveProductImage } from "../../lib/imageMap";

const EMPTY_FORM = { name: "", description: "", price: "", oldPrice: "", category: "" };
const MAX_GALLERY = 10;

export default function AdminProducts() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [customCategory, setCustomCategory] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Gallery (extra images): existing URLs from server + freshly added local Files.
  const [existingImages, setExistingImages] = useState([]); // string[] — URLs to keep
  const [galleryFiles, setGalleryFiles] = useState([]);     // File[] — newly added
  const [galleryPreviews, setGalleryPreviews] = useState([]); // string[] — object URLs

  // Revoke object URLs on unmount / file change to avoid leaks
  useEffect(() => {
    return () => {
      galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [galleryPreviews]);

  const filtered = products?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const resetGallery = () => {
    galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setExistingImages([]);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setCustomCategory(false);
    setImageFile(null);
    setImagePreview("");
    setError("");
    resetGallery();
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      oldPrice: product.oldPrice || "",
      category: product.category,
    });
    setCustomCategory(!categories?.includes(product.category));
    setImageFile(null);
    setImagePreview(resolveProductImage(product));
    setError("");
    resetGallery();
    setExistingImages(Array.isArray(product.images) ? [...product.images] : []);
    setModalOpen(true);
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Gallery handlers ────────────────────────────────
  const addGalleryFiles = (filesList) => {
    const incoming = Array.from(filesList || []).filter((f) => f.type.startsWith("image/"));
    if (!incoming.length) return;

    const slotsLeft = MAX_GALLERY - (existingImages.length + galleryFiles.length);
    const accepted = incoming.slice(0, slotsLeft);
    if (!accepted.length) return;

    const previews = accepted.map((f) => URL.createObjectURL(f));
    setGalleryFiles((prev) => [...prev, ...accepted]);
    setGalleryPreviews((prev) => [...prev, ...previews]);

    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const removeExisting = (url) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  };

  const removeGalleryFile = (idx) => {
    URL.revokeObjectURL(galleryPreviews[idx]);
    setGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!editingId && !imageFile) {
      setError("Please select a product image.");
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name);
    if (form.description) fd.append("description", form.description);
    fd.append("price", Number(form.price));
    if (form.oldPrice) fd.append("oldPrice", Number(form.oldPrice));
    fd.append("category", form.category);

    if (imageFile) {
      fd.append("image", imageFile);
    }

    // Gallery: send each new file under "images" + JSON list of URLs to keep
    galleryFiles.forEach((f) => fd.append("images", f));
    if (editingId) {
      fd.append("existingImages", JSON.stringify(existingImages));
    }

    const callbacks = {
      onSuccess: () => setModalOpen(false),
      onError: (err) => {
        setError(err?.response?.data?.error || "Something went wrong. Please try again.");
      },
    };

    if (editingId) {
      updateProduct.mutate({ id: editingId, formData: fd }, callbacks);
    } else {
      addProduct.mutate(fd, callbacks);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate(id);
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
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200/60 dark:border-white/[0.06]">
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Image</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Price</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Old Price</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Rating</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/60 dark:divide-white/[0.06]">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3"><div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                      <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded ml-auto" /></td>
                    </tr>
                  ))
                : filtered.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <img
                          src={resolveProductImage(p)}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-800"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">{p.name}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">₹{p.price}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-400 line-through">{p.oldPrice ? `₹${p.oldPrice}` : "—"}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-700 dark:text-gray-300">{p.rating?.toFixed(1) ?? "0.0"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            title="Delete"
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
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No products found.</p>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#0e0e24] border border-gray-200/60 dark:border-white/[0.06] shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingId ? "Edit Product" : "Add Product"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-yellow-400 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                />
              </div>

              {/* Price + Old Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Price (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Old Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.oldPrice}
                    onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Product Image {!editingId && <span className="text-red-400">*</span>}
                </label>

                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-contain rounded-xl border border-gray-200 dark:border-white/[0.1] bg-gray-50 dark:bg-white/[0.03]"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white/90 text-gray-800 text-xs font-medium hover:bg-white transition-colors"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="px-3 py-1.5 rounded-lg bg-red-500/90 text-white text-xs font-medium hover:bg-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-40 rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors ${
                      dragOver
                        ? "border-cyan-400 bg-cyan-50/50 dark:bg-cyan-500/10"
                        : "border-gray-300 dark:border-white/[0.1] hover:border-cyan-400 dark:hover:border-cyan-400 bg-gray-50 dark:bg-white/[0.03]"
                    }`}
                  >
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="text-cyan-600 dark:text-cyan-400 font-medium">Click to upload</span> or drag & drop
                    </p>
                    <p className="text-[10px] text-gray-400">JPG, PNG, GIF, WEBP (max 5MB)</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                />
              </div>

              {/* Gallery (additional images) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Additional Images <span className="text-gray-400 font-normal">(optional, up to {MAX_GALLERY})</span>
                  </label>
                  <span className="text-[10px] text-gray-400">
                    {existingImages.length + galleryFiles.length} / {MAX_GALLERY}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {/* Existing (server) images */}
                  {existingImages.map((url) => (
                    <div key={`ex-${url}`} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-white/[0.1] bg-gray-50 dark:bg-white/[0.03]">
                      <img src={url} alt="Existing" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExisting(url)}
                        aria-label="Remove image"
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all flex items-center justify-center"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* Newly added (local File) previews */}
                  {galleryPreviews.map((url, i) => (
                    <div key={`new-${i}`} className="relative group aspect-square rounded-xl overflow-hidden border border-cyan-200 dark:border-cyan-500/30 bg-gray-50 dark:bg-white/[0.03]">
                      <img src={url} alt={`New ${i + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-cyan-600/90 text-white text-[9px] font-bold uppercase tracking-wide">New</span>
                      <button
                        type="button"
                        onClick={() => removeGalleryFile(i)}
                        aria-label="Remove image"
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all flex items-center justify-center"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* "Add" tile */}
                  {existingImages.length + galleryFiles.length < MAX_GALLERY && (
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-white/[0.1] hover:border-cyan-400 dark:hover:border-cyan-400 bg-gray-50 dark:bg-white/[0.03] flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-cyan-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-[10px] font-semibold">Add image</span>
                    </button>
                  )}
                </div>

                <input
                  ref={galleryInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => addGalleryFiles(e.target.files)}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category</label>
                {!customCategory ? (
                  <div className="space-y-2">
                    <select
                      required
                      value={form.category}
                      onChange={(e) => {
                        if (e.target.value === "__new__") {
                          setCustomCategory(true);
                          setForm({ ...form, category: "" });
                        } else {
                          setForm({ ...form, category: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-yellow-400 transition-colors"
                    >
                      <option value="">Select category</option>
                      {categories?.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="__new__">+ New category...</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      required
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-yellow-400 transition-colors"
                      placeholder="New category name"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomCategory(false)}
                      className="px-3 py-2.5 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-white/[0.1] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Error message */}
              {error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              {/* Buttons */}
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
                  disabled={addProduct.isPending || updateProduct.isPending}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 disabled:opacity-60"
                >
                  {addProduct.isPending || updateProduct.isPending ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
