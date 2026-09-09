import React, { useState } from 'react';
import { FiInfo, FiX, FiCheck } from 'react-icons/fi';

export default function SizeSelector({
  sizes = [],
  selectedSize,
  onSelectSize,
  inventory = [],
  selectedColor,
}) {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Helper to look up inventory stock for a size + color combination
  const getStockForSize = (sizeVal) => {
    if (!inventory || inventory.length === 0) return 5; // Default healthy stock
    const item = inventory.find(
      (inv) => inv.size === sizeVal && (!selectedColor || inv.color === selectedColor)
    );
    return item ? item.stock : 4;
  };

  const sizeTable = [
    { us: '7', uk: '6.5', eu: '40', cm: '25.0' },
    { us: '8', uk: '7.5', eu: '41', cm: '26.0' },
    { us: '8.5', uk: '8.0', eu: '42', cm: '26.5' },
    { us: '9', uk: '8.5', eu: '42.5', cm: '27.0' },
    { us: '9.5', uk: '9.0', eu: '43', cm: '27.5' },
    { us: '10', uk: '9.5', eu: '44', cm: '28.0' },
    { us: '10.5', uk: '10.0', eu: '44.5', cm: '28.5' },
    { us: '11', uk: '10.5', eu: '45', cm: '29.0' },
    { us: '12', uk: '11.5', eu: '46', cm: '30.0' },
  ];

  return (
    <div>
      {/* Header with Size Guide Modal Trigger */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Select US Size
          </span>
          {selectedSize && (
            <span className="text-xs font-bold text-brand-700">
              (US {selectedSize})
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSizeGuideOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-800 transition"
        >
          <FiInfo className="w-3.5 h-3.5" />
          <span className="underline">Size Guide</span>
        </button>
      </div>

      {/* Sizing Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {sizes.map((s) => {
          const stock = getStockForSize(s);
          const isOutOfStock = stock === 0;
          const isLowStock = stock > 0 && stock <= 2;
          const isSelected = selectedSize === s;

          return (
            <button
              key={s}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectSize(s)}
              className={`relative py-3 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center border ${
                isSelected
                  ? 'bg-brand-900 text-white border-brand-900 shadow-soft ring-2 ring-brand-300'
                  : isOutOfStock
                  ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed line-through'
                  : 'bg-white text-slate-800 border-slate-200/80 hover:border-brand-500 hover:bg-slate-50'
              }`}
            >
              <span>US {s}</span>

              {/* Stock Indicator Pill */}
              {isLowStock && !isSelected && (
                <span className="text-[9px] text-amber-600 font-bold leading-none mt-0.5">
                  Only {stock} left
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSizeGuideOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full z-10 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="font-display font-black text-xl text-slate-900">
                SoleSphere Size Chart
              </h3>
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-brand-50 text-brand-900 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5 rounded-l-xl">US Men</th>
                    <th className="p-2.5">UK</th>
                    <th className="p-2.5">EU</th>
                    <th className="p-2.5 rounded-r-xl">Foot Length (CM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {sizeTable.map((row) => (
                    <tr key={row.us} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 font-bold text-slate-900">{row.us}</td>
                      <td className="p-2.5">{row.uk}</td>
                      <td className="p-2.5">{row.eu}</td>
                      <td className="p-2.5">{row.cm} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
              * SoleSphere performance running silhouettes fit true to size. For runners with wider forefeet, we advise selecting a half-size larger.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
