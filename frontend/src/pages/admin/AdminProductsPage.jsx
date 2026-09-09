import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiPlus,
  FiFilter,
  FiDownload,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiLayers,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
} from 'react-icons/fi';
import * as adminService from '../../services/adminService';
import ProductFormModal from '../../components/admin/ProductFormModal';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [stockStatus, setStockStatus] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [meta, setMeta] = useState(null);

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Expand size breakdown per product ID
  const [expandedSizes, setExpandedSizes] = useState({});

  // Toast feedback
  const [feedback, setFeedback] = useState(null);
  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await adminService.fetchAdminProducts({
        search,
        category: category !== 'All' ? category : undefined,
        stockStatus: stockStatus !== 'All' ? stockStatus : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      if (res.success) {
        setProducts(res.data);
        setMeta(res.meta);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [category, stockStatus, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProducts();
  };

  // Toggle single product status (Active / Draft)
  const handleToggleStatus = async (id, name) => {
    try {
      const res = await adminService.toggleAdminProductStatus(id);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: res.data.isActive } : p))
        );
        showFeedback(`${name} is now ${res.data.isActive ? 'Active (Live)' : 'Draft (Hidden)'}`);
      }
    } catch (err) {
      alert(err.message || 'Could not toggle status.');
    }
  };

  // Quick inline stock adjustment
  const handleQuickStock = async (productId, size, delta) => {
    try {
      const res = await adminService.updateAdminProductStock(productId, { size, delta });
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === productId) {
              const updatedVariants = p.variants.map((v) =>
                v.size === String(size) ? { ...v, stock: res.data.variant.stock } : v
              );
              return {
                ...p,
                variants: updatedVariants,
                totalStock: res.data.totalStock,
                lowStock: res.data.totalStock > 0 && res.data.totalStock <= 15,
                outOfStock: res.data.totalStock === 0,
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
    }
  };

  // Delete product
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the catalog?`)) return;
    try {
      const res = await adminService.deleteAdminProduct(id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        showFeedback(`Removed ${name} from inventory.`);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete product.');
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    if (action === 'DELETE' && !window.confirm(`Delete ${selectedIds.length} selected silhouettes?`)) return;

    try {
      const res = await adminService.bulkAdminProducts(action, selectedIds);
      if (res.success) {
        showFeedback(`Bulk ${action.toLowerCase()} applied to ${res.data.affectedCount} silhouettes.`);
        setSelectedIds([]);
        loadProducts();
      }
    } catch (err) {
      alert(err.message || 'Bulk action failed.');
    }
  };

  // Select all / toggle row
  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Save from modal (Create or Update)
  const handleSaveProduct = async (payload, id) => {
    if (id) {
      const res = await adminService.updateAdminProduct(id, payload);
      if (res.success) {
        showFeedback(`Updated ${res.data.name}`);
        loadProducts();
      }
    } else {
      const res = await adminService.createAdminProduct(payload);
      if (res.success) {
        showFeedback(`Created ${res.data.name}`);
        loadProducts();
      }
    }
  };

  // Export catalog to CSV
  const handleExportCSV = () => {
    if (products.length === 0) return;
    const headers = ['ID', 'Name', 'Slug', 'Brand', 'Category', 'Price', 'Original Price', 'Total Stock', 'Status', 'SKU Prefix'];
    const rows = products.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.slug,
      `"${p.brand}"`,
      `"${p.category}"`,
      p.price,
      p.originalPrice || '',
      p.totalStock,
      p.isActive ? 'Active' : 'Draft',
      p.variants?.[0]?.sku?.split('-').slice(0, 2).join('-') || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SoleSphere_Catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback('Exported catalog CSV successfully.');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast feedback */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-neutral-950 px-5 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-2 text-sm border border-emerald-400">
          <FiCheckCircle className="text-lg" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Inventory & Catalog Management
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Footwear Inventory</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Configure luxury silhouettes, manage per-size stock allocations, and control pricing tiers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold tracking-wide transition-all shadow-sm"
          >
            <FiDownload className="text-sm text-neutral-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold tracking-wide transition-all shadow-lg shadow-emerald-500/20"
          >
            <FiPlus className="text-base" />
            <span>New Silhouette</span>
          </button>
        </div>
      </div>

      {/* Metric Quick Stats */}
      {meta && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4">
            <span className="text-[11px] font-mono uppercase text-neutral-400">Total Models</span>
            <p className="text-2xl font-black text-white font-mono mt-1">{meta.totalProducts}</p>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4">
            <span className="text-[11px] font-mono uppercase text-neutral-400">Live Active</span>
            <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{meta.activeCount}</p>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4">
            <span className="text-[11px] font-mono uppercase text-neutral-400">Draft Silhouettes</span>
            <p className="text-2xl font-black text-amber-400 font-mono mt-1">{meta.draftCount}</p>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4">
            <span className="text-[11px] font-mono uppercase text-neutral-400">Low Stock Alerts</span>
            <p className="text-2xl font-black text-rose-400 font-mono mt-1">{meta.lowStockCount}</p>
          </div>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-4 backdrop-blur-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <FiSearch className="absolute left-3.5 top-3 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by silhouette name, brand, category, or SKU..."
              className="w-full pl-10 pr-20 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors"
            >
              Filter
            </button>
          </form>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full md:w-44 px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-medium text-neutral-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Performance Running">Performance Running</option>
              <option value="Court Classics">Court Classics</option>
              <option value="Streetwear & High-Tops">Streetwear</option>
              <option value="Trail & Outdoor">Trail & Outdoor</option>
              <option value="Lifestyle & Heritage">Lifestyle & Heritage</option>
            </select>

            {/* Stock Level Dropdown */}
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="w-full md:w-36 px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-medium text-neutral-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">All Stock Levels</option>
              <option value="In Stock">In Stock (&gt; 0)</option>
              <option value="Low Stock">Low Stock (&le; 15)</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-32 px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-medium text-neutral-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">All Visibility</option>
              <option value="Active">Live Active</option>
              <option value="Draft">Draft Only</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-950 border border-emerald-500/40 rounded-2xl animate-fadeIn">
            <div className="flex items-center gap-2 text-xs text-neutral-200">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-neutral-950 font-bold flex items-center justify-center text-[10px]">
                {selectedIds.length}
              </span>
              <span className="font-semibold">Silhouettes Selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('ACTIVATE')}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-750 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <FiEye className="text-xs" /> Set Live
              </button>
              <button
                onClick={() => handleBulkAction('DRAFT')}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-750 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <FiEyeOff className="text-xs" /> Set Draft
              </button>
              <button
                onClick={() => handleBulkAction('DELETE')}
                className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-800/80 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <FiTrash2 className="text-xs" /> Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Product Table */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Retrieving Catalog Inventory...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-neutral-800/60 text-neutral-400 flex items-center justify-center mx-auto mb-3 text-2xl">
              <FiLayers />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Silhouettes Found</h3>
            <p className="text-neutral-400 text-xs max-w-sm mx-auto mb-4">
              No products match the selected filters or search parameters. Clear filters or add a new model.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
                setStockStatus('All');
                setStatusFilter('All');
              }}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-mono text-xs uppercase tracking-wider bg-neutral-950/40">
                  <th className="py-3.5 pl-6 pr-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === products.length && products.length > 0}
                      onChange={toggleSelectAll}
                      className="accent-emerald-500 rounded"
                    />
                  </th>
                  <th className="py-3.5 px-3 font-semibold">Silhouette & Details</th>
                  <th className="py-3.5 px-3 font-semibold">Category</th>
                  <th className="py-3.5 px-3 font-semibold">Price</th>
                  <th className="py-3.5 px-3 font-semibold">Total Stock</th>
                  <th className="py-3.5 px-3 font-semibold">Status</th>
                  <th className="py-3.5 pr-6 pl-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {products.map((p) => {
                  const isExpanded = Boolean(expandedSizes[p.id]);
                  const isSelected = selectedIds.includes(p.id);

                  return (
                    <React.Fragment key={p.id}>
                      <tr
                        className={`transition-colors ${
                          isSelected ? 'bg-emerald-950/15' : 'hover:bg-neutral-850/40'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-4 pl-6 pr-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(p.id)}
                            className="accent-emerald-500 rounded"
                          />
                        </td>

                        {/* Silhouette & Details */}
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-12 h-12 rounded-xl object-cover bg-neutral-950 border border-neutral-800 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white tracking-tight">{p.name}</span>
                                {p.badge && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-neutral-800 text-neutral-300 border border-neutral-750">
                                    {p.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-400 mt-0.5">
                                <span className="text-emerald-400 font-semibold">{p.brand}</span>
                                {p.variants?.[0]?.sku && (
                                  <span className="font-mono text-[11px] text-neutral-400 ml-2">
                                    SKU: {p.variants[0].sku.split('-').slice(0, 2).join('-')}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-3">
                          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300">
                            {p.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-3 font-mono">
                          <div className="font-bold text-white text-sm">
                            ${Number(p.price).toFixed(2)}
                          </div>
                          {p.originalPrice && (
                            <div className="text-xs text-neutral-400 line-through">
                              ${Number(p.originalPrice).toFixed(2)}
                            </div>
                          )}
                        </td>

                        {/* Total Stock */}
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setExpandedSizes((prev) => ({ ...prev, [p.id]: !prev[p.id] }))
                              }
                              className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold inline-flex items-center gap-1.5 transition-all ${
                                p.outOfStock
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                  : p.lowStock
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              <span>{p.totalStock} pairs</span>
                              {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                            </button>
                            {p.lowStock && (
                              <span className="text-[10px] font-mono text-amber-400 uppercase">
                                Low
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Switch */}
                        <td className="py-4 px-3">
                          <button
                            onClick={() => handleToggleStatus(p.id, p.name)}
                            className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider transition-all inline-flex items-center gap-1.5 ${
                              p.isActive
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/25'
                                : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-750'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{p.isActive ? 'LIVE' : 'DRAFT'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 pr-6 pl-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setModalOpen(true);
                              }}
                              className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                              title="Edit Silhouette"
                            >
                              <FiEdit2 className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-2 rounded-xl bg-neutral-800/80 hover:bg-red-950 hover:text-red-400 text-neutral-400 transition-colors"
                              title="Delete Silhouette"
                            >
                              <FiTrash2 className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Per-Size Variant Stock Matrix Row */}
                      {isExpanded && (
                        <tr className="bg-neutral-950/80 border-b border-neutral-800/60 animate-fadeIn">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="rounded-2xl bg-neutral-900/90 border border-neutral-800 p-4">
                              <div className="flex items-center justify-between mb-3 text-xs font-mono">
                                <span className="text-neutral-400">
                                  Size Inventory Allocations for <span className="text-white font-bold">{p.name}</span>
                                </span>
                                <span className="text-neutral-400">Inline Stock Adjustment</span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                {p.variants?.map((v) => (
                                  <div
                                    key={v.id || v.size}
                                    className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between text-center"
                                  >
                                    <span className="text-xs font-mono font-bold text-white">US {v.size}</span>
                                    <span
                                      className={`text-sm font-mono font-black my-1 ${
                                        v.stock <= 3
                                          ? 'text-red-400'
                                          : v.stock <= 8
                                          ? 'text-amber-400'
                                          : 'text-emerald-400'
                                      }`}
                                    >
                                      {v.stock}
                                    </span>
                                    <div className="flex items-center justify-center gap-1 mt-1">
                                      <button
                                        onClick={() => handleQuickStock(p.id, v.size, -1)}
                                        disabled={v.stock <= 0}
                                        className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs disabled:opacity-30"
                                      >
                                        -
                                      </button>
                                      <button
                                        onClick={() => handleQuickStock(p.id, v.size, 1)}
                                        className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Create/Edit Modal */}
      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
      />
    </div>
  );
}
