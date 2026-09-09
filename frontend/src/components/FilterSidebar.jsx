import React from 'react';
import { FiX, FiRotateCcw, FiCheck } from 'react-icons/fi';

export default function FilterSidebar({
  categories = [],
  filterOptions = {},
  activeFilters = {},
  onFilterChange,
  onResetFilters,
  isMobileOpen = false,
  onCloseMobile,
}) {
  const {
    category = 'All',
    brand = 'All',
    minPrice = '',
    maxPrice = '',
    size = '',
    color = '',
  } = activeFilters;

  const brands = filterOptions.brands || [];
  const sizes = filterOptions.sizes || [];
  const colors = filterOptions.colors || [];

  const handleCategorySelect = (catSlug) => {
    onFilterChange('category', catSlug);
  };

  const handleBrandSelect = (b) => {
    onFilterChange('brand', brand === b ? 'All' : b);
  };

  const handleSizeSelect = (s) => {
    onFilterChange('size', size === s ? '' : s);
  };

  const handleColorSelect = (c) => {
    onFilterChange('color', color === c ? '' : c);
  };

  const content = (
    <div className="space-y-8">
      {/* Header with Clear Button */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-display font-extrabold text-lg text-slate-900">Refine Search</h3>
          <p className="text-xs text-slate-400">Filter atelier collection</p>
        </div>
        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-700 transition"
        >
          <FiRotateCcw className="w-3.5 h-3.5" />
          <span>Reset All</span>
        </button>
      </div>

      {/* 1. Category Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          Disciplines & Categories
        </h4>
        <div className="space-y-1">
          <button
            onClick={() => handleCategorySelect('All')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition text-left ${
              category === 'All'
                ? 'bg-brand-900 text-white shadow-soft'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>All Disciplines</span>
            {category === 'All' && <FiCheck className="w-3.5 h-3.5" />}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id || cat.slug}
              onClick={() => handleCategorySelect(cat.slug || cat.name)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition text-left ${
                category === cat.slug || category === cat.name
                  ? 'bg-brand-900 text-white shadow-soft'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{cat.name}</span>
              {(category === cat.slug || category === cat.name) && (
                <FiCheck className="w-3.5 h-3.5" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Brand Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          Atelier Line
        </h4>
        <div className="space-y-1.5">
          {brands.map((b) => (
            <label
              key={b}
              className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer hover:text-brand-900 select-none py-1"
            >
              <input
                type="checkbox"
                checked={brand === b}
                onChange={() => handleBrandSelect(b)}
                className="rounded border-slate-300 text-brand-700 focus:ring-brand-500 w-4 h-4"
              />
              <span className={brand === b ? 'font-bold text-brand-900' : ''}>{b}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 3. Price Range Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          Price Range ($)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Min</label>
            <input
              type="number"
              placeholder="$0"
              value={minPrice}
              onChange={(e) => onFilterChange('minPrice', e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Max</label>
            <input
              type="number"
              placeholder="$300"
              value={maxPrice}
              onChange={(e) => onFilterChange('maxPrice', e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Sizes Filter Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            US Sizing
          </h4>
          {size && (
            <button
              onClick={() => onFilterChange('size', '')}
              className="text-[11px] font-bold text-brand-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => handleSizeSelect(s)}
              className={`py-2 rounded-xl text-xs font-bold border transition ${
                size === s
                  ? 'bg-brand-900 border-brand-900 text-white shadow-soft'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-brand-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Colors Filter Swatches */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Color Palette
          </h4>
          {color && (
            <button
              onClick={() => onFilterChange('color', '')}
              className="text-[11px] font-bold text-brand-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => handleColorSelect(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                color === c
                  ? 'bg-brand-900 text-white border-brand-900 shadow-soft'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-28 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto animate-slideLeft">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <span className="font-display font-extrabold text-lg text-slate-900">Filters</span>
                <button
                  onClick={onCloseMobile}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              {content}
            </div>

            <div className="pt-6 border-t border-slate-100 mt-8">
              <button
                onClick={onCloseMobile}
                className="w-full py-3 rounded-full bg-brand-900 text-white font-bold text-sm text-center shadow-soft hover:bg-brand-950"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
