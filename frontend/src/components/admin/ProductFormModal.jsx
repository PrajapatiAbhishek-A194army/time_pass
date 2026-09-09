import React, { useState, useEffect } from 'react';
import {
  FiX,
  FiUploadCloud,
  FiImage,
  FiDollarSign,
  FiTag,
  FiLayers,
  FiCheck,
  FiAlertCircle,
  FiTrash2,
  FiPlus,
} from 'react-icons/fi';

const STANDARD_SIZES = ['6', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'];

const CATEGORY_OPTIONS = [
  'Performance Running',
  'Court Classics',
  'Streetwear & High-Tops',
  'Trail & Outdoor',
  'Lifestyle & Heritage',
  'Atelier Luxury',
];

const BRAND_OPTIONS = [
  'SoleSphere Lab',
  'SoleSphere Studio',
  'SoleSphere Originals',
  'SoleSphere Heritage',
  'SoleSphere Performance',
  'SoleSphere Mountain',
];

const BADGE_OPTIONS = [
  'None',
  'New Arrival',
  'Limited Drop',
  'Best Seller',
  'Trending',
  'Atelier Exclusive',
];

export default function ProductFormModal({ isOpen, onClose, onSave, initialProduct = null }) {
  const isEdit = Boolean(initialProduct);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brand: 'SoleSphere Lab',
    category: 'Performance Running',
    price: '',
    originalPrice: '',
    badge: 'New Arrival',
    description: '',
    image: '',
    gallery: ['', '', ''],
    isFeatured: false,
    isTrending: false,
    isActive: true,
  });

  // Size variant stock map: { [size]: { enabled: boolean, stock: number } }
  const [sizeMatrix, setSizeMatrix] = useState({});
  const [bulkStockVal, setBulkStockVal] = useState(12);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name || '',
        slug: initialProduct.slug || '',
        brand: initialProduct.brand || 'SoleSphere Lab',
        category: initialProduct.category || 'Performance Running',
        price: initialProduct.price || '',
        originalPrice: initialProduct.originalPrice || '',
        badge: initialProduct.badge || 'None',
        description: initialProduct.description || '',
        image: initialProduct.image || '',
        gallery: [
          initialProduct.gallery?.[1] || '',
          initialProduct.gallery?.[2] || '',
          initialProduct.gallery?.[3] || '',
        ],
        isFeatured: Boolean(initialProduct.isFeatured),
        isTrending: Boolean(initialProduct.isTrending),
        isActive: typeof initialProduct.isActive === 'boolean' ? initialProduct.isActive : true,
      });

      // Populate size matrix
      const matrix = {};
      const activeVariants = initialProduct.variants || [];
      STANDARD_SIZES.forEach((s) => {
        const found = activeVariants.find((v) => String(v.size) === String(s));
        matrix[s] = {
          enabled: Boolean(found) || (initialProduct.sizes && initialProduct.sizes.includes(s)),
          stock: found ? found.stock : 10,
        };
      });
      setSizeMatrix(matrix);
    } else {
      // Defaults for brand new shoe
      setFormData({
        name: '',
        slug: '',
        brand: 'SoleSphere Lab',
        category: 'Performance Running',
        price: '',
        originalPrice: '',
        badge: 'New Arrival',
        description: '',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80',
          '',
        ],
        isFeatured: false,
        isTrending: true,
        isActive: true,
      });

      const matrix = {};
      STANDARD_SIZES.forEach((s) => {
        // Default select typical sizes 8 to 11
        const isCore = ['8', '8.5', '9', '9.5', '10', '10.5', '11'].includes(s);
        matrix[s] = {
          enabled: isCore,
          stock: isCore ? 15 : 8,
        };
      });
      setSizeMatrix(matrix);
    }
    setErrors({});
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (e) => {
    const val = e.target.value;
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: !isEdit || !prev.slug ? autoSlug : prev.slug,
    }));
  };

  const handleSizeToggle = (size) => {
    setSizeMatrix((prev) => ({
      ...prev,
      [size]: {
        ...prev[size],
        enabled: !prev[size]?.enabled,
      },
    }));
  };

  const handleStockChange = (size, stockVal) => {
    const num = Math.max(0, parseInt(stockVal, 10) || 0);
    setSizeMatrix((prev) => ({
      ...prev,
      [size]: {
        ...prev[size],
        stock: num,
      },
    }));
  };

  const applyBulkStock = () => {
    setSizeMatrix((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((s) => {
        if (next[s].enabled) {
          next[s].stock = Math.max(0, parseInt(bulkStockVal, 10) || 0);
        }
      });
      return next;
    });
  };

  const handleGalleryChange = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.gallery];
      updated[index] = value;
      return { ...prev, gallery: updated };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Silhouette name is required.';
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = 'Valid retail price is required.';
    }
    if (!formData.image.trim()) newErrors.image = 'Primary product image URL is required.';

    const enabledSizes = Object.keys(sizeMatrix).filter((s) => sizeMatrix[s]?.enabled);
    if (enabledSizes.length === 0) {
      newErrors.sizes = 'Select at least one shoe size for inventory.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const enabledSizes = Object.keys(sizeMatrix).filter((s) => sizeMatrix[s]?.enabled);
      const prefix = (formData.slug || formData.name || 'SHOE')
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 4)
        .toUpperCase();

      const variants = enabledSizes.map((size) => ({
        size,
        stock: sizeMatrix[size].stock,
        color: 'Core Edition',
        sku: `SS-${prefix}-US${size.replace('.', '_')}`,
      }));

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        brand: formData.brand,
        category: formData.category,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        badge: formData.badge === 'None' ? null : formData.badge,
        description: formData.description.trim(),
        image: formData.image.trim(),
        gallery: [formData.image.trim(), ...formData.gallery.filter((g) => g.trim().length > 0)],
        sizes: enabledSizes,
        variants,
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        isActive: formData.isActive,
      };

      await onSave(payload, initialProduct?.id);
      onClose();
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message || 'Failed to save product.' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-900/90 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {isEdit ? 'Catalog Revision' : 'New Footwear Addition'}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isEdit ? `Edit Silhouette: ${initialProduct.name}` : 'Create Luxury Silhouette'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errors.submit && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <FiAlertCircle />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-emerald-400">1. Silhouette Identity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Apex Carbon Velocity Pro"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. apex-carbon-velocity-pro"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-400 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Brand / Division</label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {BRAND_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Editorial Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Engineered for high propulsion with dual carbon fiber stabilizers..."
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Section 2: Pricing & Badges */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <h3 className="text-xs font-mono uppercase tracking-widest text-emerald-400">2. Pricing & Market Badges</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Retail Price ($ USD) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3.5 top-3 text-neutral-500" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="219.99"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Original / Strikethrough Price ($)
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3.5 top-3 text-neutral-500" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="269.99"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-400 text-sm font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Badge Callout</label>
                <select
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {BADGE_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Visual Media Gallery */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <h3 className="text-xs font-mono uppercase tracking-widest text-emerald-400">3. Media Assets</h3>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Primary Silhouette Image URL <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-emerald-500"
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-11 h-11 rounded-xl object-cover border border-neutral-750 shrink-0 bg-neutral-950"
                  />
                )}
              </div>
              {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {formData.gallery.map((url, i) => (
                <div key={i}>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">Angle #{i + 2} URL</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleGalleryChange(i, e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Size Variants & Inventory Matrix */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                  4. Size Inventory Matrix & SKUs
                </h3>
                <p className="text-xs text-neutral-400">
                  Toggle available sizes and specify localized warehouse stock per variant.
                </p>
              </div>

              {/* Bulk Stock tool */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-mono">Fill All:</span>
                <input
                  type="number"
                  value={bulkStockVal}
                  onChange={(e) => setBulkStockVal(e.target.value)}
                  className="w-16 px-2 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-center text-white"
                />
                <button
                  type="button"
                  onClick={applyBulkStock}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200"
                >
                  Apply
                </button>
              </div>
            </div>

            {errors.sizes && <p className="text-red-400 text-xs">{errors.sizes}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {STANDARD_SIZES.map((size) => {
                const item = sizeMatrix[size] || { enabled: false, stock: 0 };
                const prefix = (formData.slug || formData.name || 'SHOE').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
                const sku = `SS-${prefix}-US${size.replace('.', '_')}`;

                return (
                  <div
                    key={size}
                    className={`p-2.5 rounded-xl border transition-all ${
                      item.enabled
                        ? 'bg-neutral-950 border-emerald-500/40'
                        : 'bg-neutral-950/40 border-neutral-850 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => handleSizeToggle(size)}
                          className="accent-emerald-500 rounded"
                        />
                        <span className="text-xs font-bold text-white font-mono">US {size}</span>
                      </label>
                    </div>
                    {item.enabled && (
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-neutral-400 font-mono">Pairs:</span>
                          <input
                            type="number"
                            min="0"
                            value={item.stock}
                            onChange={(e) => handleStockChange(size, e.target.value)}
                            className="w-full px-2 py-1 bg-neutral-900 border border-neutral-750 rounded-lg text-xs font-mono text-white text-right focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <p className="text-[9px] font-mono text-neutral-400 truncate mt-1">{sku}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: Catalog Visibility & Attributes */}
          <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="accent-emerald-500 rounded"
                />
                <span className="text-xs font-semibold text-white">Active (Live in Store)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="accent-emerald-500 rounded"
                />
                <span className="text-xs font-semibold text-white">Featured Showcase</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                  className="accent-emerald-500 rounded"
                />
                <span className="text-xs font-semibold text-white">Trending Drop</span>
              </label>
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiCheck className="text-sm" />
                  <span>{isEdit ? 'Save Silhouette Changes' : 'Publish Silhouette'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
