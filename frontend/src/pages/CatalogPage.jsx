import React, { useState, useEffect } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import {
  FiSliders,
  FiSearch,
  FiX,
  FiRotateCcw,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import {
  fetchProducts,
  fetchCategories,
  fetchFilterOptions,
} from '../services/catalogService';

export default function CatalogPage({ onAddToCart, onToggleWishlist }) {
  const context = useOutletContext();
  const handleAddToCart = onAddToCart || context?.onAddToCart;
  const handleToggleWishlist = onToggleWishlist || context?.onToggleWishlist;

  const [searchParams, setSearchParams] = useSearchParams();

  // State from URL or defaults
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [brand, setBrand] = useState(searchParams.get('brand') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [size, setSize] = useState(searchParams.get('size') || '');
  const [color, setColor] = useState(searchParams.get('color') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'featured');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state changes back into URL
  const updateUrl = (updates) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val && val !== 'All') {
        nextParams.set(key, val);
      } else {
        nextParams.delete(key);
      }
    });
    setSearchParams(nextParams);
  };

  // Fetch filter options and categories on mount
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [catsRes, optsRes] = await Promise.all([
          fetchCategories(),
          fetchFilterOptions(),
        ]);
        if (catsRes?.data) setCategories(catsRes.data);
        if (optsRes?.data) setFilterOptions(optsRes.data);
      } catch (err) {
        console.warn('Failed to load filter metadata:', err);
      }
    };
    loadMeta();
  }, []);

  // Fetch products whenever filters or search change
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const query = {
          search: searchQuery || undefined,
          category: category !== 'All' ? category : undefined,
          brand: brand !== 'All' ? brand : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          size: size || undefined,
          color: color || undefined,
          sort,
          page,
          limit: 12,
        };

        const res = await fetchProducts(query);
        if (res?.data) {
          setProducts(res.data);
          if (res.pagination) setPagination(res.pagination);
        }
      } catch (err) {
        console.warn('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [searchQuery, category, brand, minPrice, maxPrice, size, color, sort, page]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    if (key === 'category') setCategory(value);
    if (key === 'brand') setBrand(value);
    if (key === 'minPrice') setMinPrice(value);
    if (key === 'maxPrice') setMaxPrice(value);
    if (key === 'size') setSize(value);
    if (key === 'color') setColor(value);

    updateUrl({ [key]: value, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategory('All');
    setBrand('All');
    setMinPrice('');
    setMaxPrice('');
    setSize('');
    setColor('');
    setSort('featured');
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  // Calculate active filter count for mobile badge
  const activeCount = [
    category !== 'All',
    brand !== 'All',
    minPrice !== '',
    maxPrice !== '',
    size !== '',
    color !== '',
    searchQuery !== '',
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Banner & Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <span className="luxury-badge mb-2">SoleSphere Atelier Collection</span>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
              {category !== 'All' ? category : 'The Complete Footwear Archive'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore high-performance engineering, limited Italian drops, and heritage silhouettes.
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-900">{pagination.total}</strong> precision models
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Mobile Filter Toggle, Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by silhouette, model, technology..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
              updateUrl({ search: e.target.value, page: 1 });
            }}
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm transition"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                updateUrl({ search: '' });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Actions: Filter Drawer Toggle & Sort Dropdown */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition"
          >
            <FiSliders className="w-4 h-4 text-brand-700" />
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-900 text-white text-[10px] flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                updateUrl({ sort: e.target.value });
              }}
              aria-label="Sort products"
              className="appearance-none px-4 py-2.5 pr-9 rounded-2xl bg-white border border-slate-200/80 text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="featured">Featured Drops</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Latest Releases</option>
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            Active:
          </span>

          {category !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-900 border border-brand-200">
              Category: {category}
              <button onClick={() => handleFilterChange('category', 'All')}>
                <FiX className="w-3 h-3 hover:text-rose-500" />
              </button>
            </span>
          )}

          {brand !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-900 border border-brand-200">
              Brand: {brand}
              <button onClick={() => handleFilterChange('brand', 'All')}>
                <FiX className="w-3 h-3 hover:text-rose-500" />
              </button>
            </span>
          )}

          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-900 border border-brand-200">
              Price: ${minPrice || '0'} - ${maxPrice || '∞'}
              <button
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                  updateUrl({ minPrice: '', maxPrice: '' });
                }}
              >
                <FiX className="w-3 h-3 hover:text-rose-500" />
              </button>
            </span>
          )}

          {size && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-900 border border-brand-200">
              Size: US {size}
              <button onClick={() => handleFilterChange('size', '')}>
                <FiX className="w-3 h-3 hover:text-rose-500" />
              </button>
            </span>
          )}

          {color && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-900 border border-brand-200">
              Color: {color}
              <button onClick={() => handleFilterChange('color', '')}>
                <FiX className="w-3 h-3 hover:text-rose-500" />
              </button>
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-900 border border-brand-200">
              Search: "{searchQuery}"
              <button
                onClick={() => {
                  setSearchQuery('');
                  updateUrl({ search: '' });
                }}
              >
                <FiX className="w-3 h-3 hover:text-rose-500" />
              </button>
            </span>
          )}

          <button
            onClick={handleResetFilters}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-800 ml-auto transition"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Content Layout: Sidebar + Product Grid */}
      <div className="flex items-start gap-8">
        {/* Desktop & Mobile Filter Sidebar */}
        <FilterSidebar
          categories={categories}
          filterOptions={filterOptions}
          activeFilters={{ category, brand, minPrice, maxPrice, size, color }}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          isMobileOpen={mobileFilterOpen}
          onCloseMobile={() => setMobileFilterOpen(false)}
        />

        {/* Products Grid & Results Area */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-4 border border-slate-100 shadow-soft animate-pulse"
                >
                  <div className="w-full aspect-square bg-slate-100 rounded-2xl mb-4" />
                  <div className="h-4 bg-slate-100 rounded w-1/3 mb-2" />
                  <div className="h-5 bg-slate-100 rounded w-3/4 mb-3" />
                  <div className="h-6 bg-slate-100 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-soft">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mx-auto mb-4">
                <FiRotateCcw className="w-7 h-7" />
              </div>
              <h3 className="font-display font-black text-2xl text-slate-900 mb-2">
                No matching footwear found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
                We couldn't find any silhouettes matching your refined search criteria. Try removing some filters or search terms.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-3 rounded-full bg-brand-900 text-white font-bold text-xs hover:bg-brand-950 transition shadow-soft"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>

              {/* Pagination Controller */}
              {pagination.totalPages > 1 && (
                <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      const nextP = Math.max(1, page - 1);
                      setPage(nextP);
                      updateUrl({ page: nextP });
                    }}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50"
                  >
                    <FiChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(pagination.totalPages)].map((_, idx) => {
                      const pNum = idx + 1;
                      return (
                        <button
                          key={pNum}
                          onClick={() => {
                            setPage(pNum);
                            updateUrl({ page: pNum });
                          }}
                          className={`w-8 h-8 rounded-xl font-bold text-xs transition ${
                            page === pNum
                              ? 'bg-brand-900 text-white shadow-soft'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      const nextP = Math.min(pagination.totalPages, page + 1);
                      setPage(nextP);
                      updateUrl({ page: nextP });
                    }}
                    disabled={page >= pagination.totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50"
                  >
                    Next <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
