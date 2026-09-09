import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import {
  FiHeart,
  FiShoppingBag,
  FiStar,
  FiTruck,
  FiRotateCcw,
  FiShield,
  FiCheck,
  FiArrowRight,
  FiMinus,
  FiPlus,
  FiLayers,
  FiFeather,
  FiCompass,
} from 'react-icons/fi';
import ProductGallery from '../components/ProductGallery';
import SizeSelector from '../components/SizeSelector';
import ReviewList from '../components/ReviewList';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { fetchProductBySlug, fetchProducts } from '../services/catalogService';

export default function ProductDetailsPage({ onAddToCart, onToggleWishlist }) {
  const { slug } = useParams();
  const context = useOutletContext();
  const handleAddToCart = onAddToCart || context?.onAddToCart;
  const handleToggleWishlist = onToggleWishlist || context?.onToggleWishlist;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected purchase options
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('specs');

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadDetail = async () => {
      setLoading(true);
      try {
        const res = await fetchProductBySlug(slug);
        if (res?.data) {
          setProduct(res.data);
          if (res.data.colors?.length > 0) setSelectedColor(res.data.colors[0]);
          if (res.data.sizes?.length > 0) setSelectedSize(res.data.sizes[2] || res.data.sizes[0]);

          // Fetch related shoes from same category
          const relRes = await fetchProducts({
            category: res.data.categorySlug,
            limit: 4,
          });
          if (relRes?.data) {
            setRelatedProducts(relRes.data.filter((p) => p.slug !== slug).slice(0, 3));
          }
        }
      } catch (err) {
        console.warn('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 aspect-square bg-slate-100 rounded-3xl" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-10 bg-slate-200 rounded w-3/4" />
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            <div className="h-32 bg-slate-100 rounded-2xl" />
            <div className="h-12 bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Silhouettes Not Found</h2>
        <p className="text-slate-500 mb-6">The requested footwear model could not be located in the atelier archive.</p>
        <Link to="/catalog">
          <Button variant="luxury" size="md">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // Selected size stock check
  const currentInv = product.inventory?.find(
    (inv) => inv.size === selectedSize && inv.color === selectedColor
  );
  const currentStock = currentInv ? currentInv.stock : 5;

  const handleAdd = () => {
    setAdded(true);
    if (handleAddToCart) {
      handleAddToCart({
        ...product,
        selectedSize,
        selectedColor,
        quantity,
      });
    }
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlistToggle = () => {
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    if (handleToggleWishlist) {
      handleToggleWishlist(product, nextState);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-brand-800 transition">Home</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-brand-800 transition">Footwear Archive</Link>
        <span>/</span>
        <Link to={`/catalog?category=${product.categorySlug}`} className="hover:text-brand-800 transition">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{product.name}</span>
      </nav>

      {/* Main Showcase Grid: Left Gallery, Right Purchasing Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 mb-16">
        {/* Left: Interactive Multi-Angle Gallery */}
        <div className="lg:col-span-7">
          <ProductGallery
            images={product.images || [product.image]}
            productName={product.name}
            badge={product.badge}
            discountPercent={discountPercent}
          />
        </div>

        {/* Right: Purchasing Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            {/* Brand & Reviews Anchor */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-800">
                {product.brand}
              </span>
              <a
                href="#reviews"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-800 transition"
              >
                <div className="flex items-center text-amber-500">
                  <FiStar className="w-3.5 h-3.5 fill-current" />
                </div>
                <span>{product.rating}</span>
                <span className="text-slate-400 font-normal">({product.reviewCount} reviews)</span>
              </a>
            </div>

            {/* Product Title */}
            <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight leading-tight mb-4">
              {product.name}
            </h1>

            {/* Pricing Box */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                ${product.price?.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-base text-slate-400 line-through">
                  ${product.originalPrice?.toFixed(2)}
                </span>
              )}
              {discountPercent && (
                <Badge variant="accent" size="sm">
                  Save {discountPercent}%
                </Badge>
              )}
            </div>

            {/* Description Excerpt */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* 1. Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Selected Color:
                  </span>
                  <span className="text-xs font-bold text-brand-700">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`px-4 py-2 rounded-full text-xs font-bold border transition ${
                        selectedColor === col
                          ? 'bg-brand-900 text-white border-brand-900 shadow-soft ring-2 ring-brand-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Size Selection with Stock Feedback */}
            <div className="mb-6">
              <SizeSelector
                sizes={product.sizes || []}
                selectedSize={selectedSize}
                onSelectSize={setSelectedSize}
                inventory={product.inventory || []}
                selectedColor={selectedColor}
              />
            </div>

            {/* Stock Level Banner */}
            <div className="mb-6 p-3 rounded-2xl bg-brand-50/80 border border-brand-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${currentStock > 2 ? 'bg-emerald-500' : currentStock > 0 ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className="font-bold text-slate-800">
                  {currentStock > 2
                    ? 'In Stock — Dispatches within 24 hours'
                    : currentStock > 0
                    ? `Low Stock: Only ${currentStock} pair(s) remaining in this size`
                    : 'Currently Out of Stock'}
                </span>
              </div>
            </div>

            {/* 3. Quantity & Action Buttons */}
            <div className="flex items-center gap-3 mb-6">
              {/* Quantity Selector */}
              <div className="flex items-center border border-slate-200 rounded-full bg-white px-2 py-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 active:scale-95"
                >
                  <FiMinus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(currentStock || 5, quantity + 1))}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 active:scale-95"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                type="button"
                disabled={currentStock === 0}
                onClick={handleAdd}
                className={`flex-1 py-3.5 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-soft hover:shadow-premium transition-all duration-200 active:scale-98 ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-900 hover:bg-brand-950 text-white'
                }`}
              >
                {added ? (
                  <>
                    <FiCheck className="w-4 h-4" /> Added to Shopping Bag
                  </>
                ) : (
                  <>
                    <FiShoppingBag className="w-4 h-4" /> Add to Shopping Bag
                  </>
                )}
              </button>

              {/* Wishlist Toggle Button */}
              <button
                type="button"
                onClick={handleWishlistToggle}
                aria-label="Add to Wishlist"
                className={`p-3.5 rounded-full border transition-all active:scale-95 ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-soft'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-rose-500 hover:border-slate-300 shadow-sm'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Delivery & Authenticity Perks */}
          <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-600">
            <div className="flex flex-col items-center gap-1 p-2 bg-[#F8FAF9] rounded-2xl">
              <FiTruck className="w-4 h-4 text-brand-700" />
              <span className="font-bold text-slate-900">Free Express</span>
              <span className="text-[10px] text-slate-400">Over $150</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 bg-[#F8FAF9] rounded-2xl">
              <FiRotateCcw className="w-4 h-4 text-brand-700" />
              <span className="font-bold text-slate-900">30-Day Trial</span>
              <span className="text-[10px] text-slate-400">Wear test guarantee</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 bg-[#F8FAF9] rounded-2xl">
              <FiShield className="w-4 h-4 text-brand-700" />
              <span className="font-bold text-slate-900">100% Authentic</span>
              <span className="text-[10px] text-slate-400">Atelier seal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Craftsmanship & Tech Specs Tabs */}
      <div className="mb-16 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-soft">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-2 text-xs sm:text-sm font-bold transition relative ${
              activeTab === 'specs'
                ? 'text-brand-900 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-700'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('craft')}
            className={`pb-2 text-xs sm:text-sm font-bold transition relative ${
              activeTab === 'craft'
                ? 'text-brand-900 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-700'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Atelier Craftsmanship
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`pb-2 text-xs sm:text-sm font-bold transition relative ${
              activeTab === 'care'
                ? 'text-brand-900 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-700'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Care & Maintenance
          </button>
        </div>

        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.specs?.map((spec, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF9] border border-slate-100 text-xs"
              >
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                  {spec.label}
                </span>
                <span className="font-bold text-slate-900 text-right">{spec.value}</span>
              </div>
            )) || <p className="text-xs text-slate-500">Premium athletic specifications.</p>}
          </div>
        )}

        {activeTab === 'craft' && (
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
            <p>
              SoleSphere silhouettes are conceived and developed in our Northern Italian research atelier. 
              Each pair undergoes over 120 precision assembly steps, fusing hand-skived full-grain leathers 
              with autoclave-cured aerospace composite plates.
            </p>
            <p>
              The result is a hybrid of heritage bespoke lasting and Olympic-level kinetic propulsion.
            </p>
          </div>
        )}

        {activeTab === 'care' && (
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
            <p>• Spot clean upper mono-mesh with soft bristle brush and warm soapy water.</p>
            <p>• Do not machine wash or tumble dry to preserve carbon plate rigidity.</p>
            <p>• Allow to air dry at room temperature away from direct intense heat.</p>
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      <div id="reviews">
        <ReviewList
          reviews={product.reviews || []}
          rating={product.rating || 4.9}
          reviewCount={product.reviewCount || 48}
          ratingBreakdown={product.ratingBreakdown || { 5: 112, 4: 28, 3: 6, 2: 2, 1: 0 }}
        />
      </div>

      {/* Related Silhouettes Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-12 border-t border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="luxury-badge mb-2">Curated Recommendations</span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-900">
                You May Also Admire
              </h3>
            </div>
            <Link
              to={`/catalog?category=${product.categorySlug}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900 transition"
            >
              <span>View All {product.category}</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
