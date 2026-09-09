const prisma = require('../config/db');

// Expanded default catalog dataset for database seeding or resilient dev fallback
const initialCatalog = [
  {
    id: 'prod-1',
    name: 'Apex Carbon Velocity Pro',
    slug: 'apex-carbon-velocity-pro',
    brand: 'SoleSphere Lab',
    category: 'Performance Running',
    categorySlug: 'performance-running',
    price: 219.99,
    originalPrice: 269.99,
    rating: 4.9,
    reviewCount: 148,
    isFeatured: true,
    isTrending: true,
    badge: 'Limited Drop',
    colors: ['Emerald / White', 'Obsidian / Mint', 'Ghost White'],
    sizes: ['7', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
    description: 'Engineered with twin-curved full-length carbon plates and nitrogen-infused AeroFoam for maximum energy return.',
    createdAt: new Date('2026-03-01'),
  },
  {
    id: 'prod-2',
    name: 'Vanguard Retro Mid High',
    slug: 'vanguard-retro-mid-high',
    brand: 'SoleSphere Originals',
    category: 'Streetwear & High-Tops',
    categorySlug: 'streetwear',
    price: 189.99,
    originalPrice: 220.00,
    rating: 4.8,
    reviewCount: 94,
    isFeatured: true,
    isTrending: false,
    badge: 'Trending',
    colors: ['Forest Suede', 'Chalk / Pine', 'Pure White'],
    sizes: ['8', '9', '9.5', '10', '11'],
    image: 'https://images.unsplash.com/photo-1512374382149-233c42b661ac?auto=format&fit=crop&w=800&q=80',
    description: 'Italian tumbled leather meets padded collars and textured rubber cupsoles for timeless streetwear presence.',
    createdAt: new Date('2026-02-15'),
  },
  {
    id: 'prod-3',
    name: 'AeroGlide Ultra Minimalist',
    slug: 'aeroglide-ultra-minimalist',
    brand: 'SoleSphere Studio',
    category: 'Court Classics',
    categorySlug: 'court-classics',
    price: 159.99,
    originalPrice: null,
    rating: 4.9,
    reviewCount: 210,
    isFeatured: true,
    isTrending: true,
    badge: 'Best Seller',
    colors: ['Off-White / Mint', 'Raw Natural', 'Monochrome'],
    sizes: ['6', '7', '8', '9', '10', '11'],
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
    description: 'Monolithic clean lines crafted from eco-certified calfskin leather with orthotic memory cushioning.',
    createdAt: new Date('2026-02-20'),
  },
  {
    id: 'prod-4',
    name: 'TerraGrip All-Weather Trail',
    slug: 'terragrip-all-weather-trail',
    brand: 'SoleSphere Explorer',
    category: 'Trail & Outdoor Explorer',
    categorySlug: 'trail-outdoor',
    price: 199.99,
    originalPrice: 239.99,
    rating: 4.7,
    reviewCount: 82,
    isFeatured: true,
    isTrending: false,
    badge: 'Waterproof',
    colors: ['Deep Moss / Sage', 'Graphite / Neon', 'Khaki Sand'],
    sizes: ['8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    description: 'Sealed waterproof bootie construction fused to aggressive multidirectional lugs for Alpine ascents.',
    createdAt: new Date('2026-01-10'),
  },
  {
    id: 'prod-5',
    name: 'Chronos Heritage Court 88',
    slug: 'chronos-heritage-court-88',
    brand: 'SoleSphere Originals',
    category: 'Court Classics',
    categorySlug: 'court-classics',
    price: 145.00,
    originalPrice: 175.00,
    rating: 4.9,
    reviewCount: 312,
    isFeatured: true,
    isTrending: true,
    badge: 'Classic',
    colors: ['White / Forest Green', 'White / Navy', 'Triple White'],
    sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '11', '12'],
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
    description: 'An ode to vintage championship tennis with gold foil branding and organic cotton terry lining.',
    createdAt: new Date('2026-01-25'),
  },
  {
    id: 'prod-6',
    name: 'PulseWave Quantum Speed',
    slug: 'pulsewave-quantum-speed',
    brand: 'SoleSphere Lab',
    category: 'Performance Running',
    categorySlug: 'performance-running',
    price: 235.00,
    originalPrice: null,
    rating: 5.0,
    reviewCount: 67,
    isFeatured: true,
    isTrending: true,
    badge: 'New Innovation',
    colors: ['Mint Glow / Ghost Grey', 'Glacier Cyan', 'Triple Black'],
    sizes: ['8', '8.5', '9', '9.5', '10', '10.5', '11'],
    image: 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=800&q=80',
    description: 'Seamless 3D knit upper providing adaptive dynamic lockdown with featherlight 190-gram chassis weight.',
    createdAt: new Date('2026-03-05'),
  },
  {
    id: 'prod-7',
    name: 'Sovereign Suede Low-Profile',
    slug: 'sovereign-suede-low-profile',
    brand: 'SoleSphere Studio',
    category: 'Streetwear & High-Tops',
    categorySlug: 'streetwear',
    price: 169.00,
    originalPrice: 195.00,
    rating: 4.8,
    reviewCount: 120,
    isFeatured: false,
    isTrending: true,
    badge: 'Premium Leather',
    colors: ['Olive / Bone', 'Charcoal', 'Caramel'],
    sizes: ['7', '8', '9', '10', '11'],
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    description: 'Silky nap Italian suede layered with gum soles and debossed brand detailing.',
    createdAt: new Date('2026-02-05'),
  },
  {
    id: 'prod-8',
    name: 'Strata Cushion Marathons',
    slug: 'strata-cushion-marathons',
    brand: 'SoleSphere Lab',
    category: 'Performance Running',
    categorySlug: 'performance-running',
    price: 205.00,
    originalPrice: 240.00,
    rating: 4.9,
    reviewCount: 88,
    isFeatured: false,
    isTrending: false,
    badge: 'Endurance Pick',
    colors: ['White / Mint Whisper', 'Sonic Lime', 'Navy'],
    sizes: ['8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
    image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80',
    description: 'Engineered specifically for marathon distances with anti-fatigue rocker geometry and dual-density heel pods.',
    createdAt: new Date('2026-01-18'),
  },
  {
    id: 'prod-9',
    name: 'Apex Carbon Elite Track',
    slug: 'apex-carbon-elite-track',
    brand: 'SoleSphere Lab',
    category: 'Performance Running',
    categorySlug: 'performance-running',
    price: 249.99,
    originalPrice: 289.99,
    rating: 5.0,
    reviewCount: 52,
    isFeatured: true,
    isTrending: true,
    badge: 'Pro Athlete',
    colors: ['Laser Mint', 'Blackout Carbon'],
    sizes: ['8', '9', '9.5', '10', '11'],
    image: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=800&q=80',
    description: 'World Athletics compliant competition shoe engineered for sub-2 hour marathon aspirations.',
    createdAt: new Date('2026-03-08'),
  },
  {
    id: 'prod-10',
    name: 'Ascent Vibram Highland Trail',
    slug: 'ascent-vibram-highland-trail',
    brand: 'SoleSphere Explorer',
    category: 'Trail & Outdoor Explorer',
    categorySlug: 'trail-outdoor',
    price: 185.00,
    originalPrice: null,
    rating: 4.8,
    reviewCount: 64,
    isFeatured: false,
    isTrending: false,
    badge: 'Vibram Outsole',
    colors: ['Earth Ochre', 'Pine Needle', 'Obsidian'],
    sizes: ['7.5', '8', '8.5', '9', '9.5', '10', '11', '12'],
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
    description: 'Reinforced rock protection plate paired with deep multi-angle lugs for technical mountain ascents.',
    createdAt: new Date('2026-01-30'),
  },
];

const initialCategories = [
  {
    id: 'cat-performance',
    name: 'Performance Running',
    slug: 'performance-running',
    description: 'Carbon-infused propulsion for elite road and track athletes.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-streetwear',
    name: 'Streetwear & High-Tops',
    slug: 'streetwear',
    description: 'Iconic silhouettes inspired by luxury runway and urban culture.',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-court',
    name: 'Court Classics',
    slug: 'court-classics',
    description: 'Heritage tennis and basketball profiles handcrafted in premium leather.',
    image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-trail',
    name: 'Trail & Outdoor Explorer',
    slug: 'trail-outdoor',
    description: 'Vibram all-terrain traction engineered for unforgiving elements.',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
  },
];

/**
 * Get products with search, filtering, sorting, and pagination
 */
const getAllProducts = async (query = {}) => {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    size,
    color,
    sort = 'featured',
    page = 1,
    limit = 12,
  } = query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));

  // Attempt database query first
  try {
    const where = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = {
        OR: [
          { slug: category },
          { name: category },
        ],
      };
    }

    if (brand) {
      where.brand = brand;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy = {};
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };
    else orderBy = { isFeatured: 'desc' };

    const [dbProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: true,
          inventory: true,
        },
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    if (dbProducts && dbProducts.length > 0) {
      const formatted = dbProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        category: p.category?.name || 'Footwear',
        categorySlug: p.category?.slug || 'footwear',
        price: Number(p.price),
        originalPrice: p.discountPrice ? Number(p.discountPrice) : null,
        description: p.description,
        isFeatured: p.isFeatured,
        isTrending: p.isTrending,
        badge: p.isFeatured ? 'Featured' : null,
        rating: 4.9,
        reviewCount: 42,
        image: p.images?.[0]?.url || 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
        colors: p.inventory ? [...new Set(p.inventory.map((i) => i.color))] : [],
        sizes: p.inventory ? [...new Set(p.inventory.map((i) => i.size))] : [],
      }));

      return {
        products: formatted,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      };
    }
  } catch (err) {
    // Database offline or tables unseeded, use fallback dataset
  }

  // Fallback in-memory catalog filtering & sorting
  let filtered = [...initialCatalog];

  // Search filter
  if (search && search.trim()) {
    const s = search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s)
    );
  }

  // Category filter
  if (category && category !== 'All') {
    const cat = category.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.categorySlug === cat ||
        p.category.toLowerCase() === cat
    );
  }

  // Brand filter
  if (brand && brand !== 'All') {
    filtered = filtered.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  }

  // Price Range
  if (minPrice) {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) filtered = filtered.filter((p) => p.price >= min);
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) filtered = filtered.filter((p) => p.price <= max);
  }

  // Size filter
  if (size) {
    filtered = filtered.filter((p) => p.sizes && p.sizes.includes(size));
  }

  // Color filter
  if (color) {
    filtered = filtered.filter(
      (p) =>
        p.colors &&
        p.colors.some((c) => c.toLowerCase().includes(color.toLowerCase()))
    );
  }

  // Sorting
  if (sort === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    // 'featured' / default
    filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

  const total = filtered.length;
  const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return {
    products: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Get single product by slug
 */
const getProductBySlug = async (slug) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
        inventory: true,
        reviews: true,
      },
    });
    if (product) return product;
  } catch (err) {
    // Fallback
  }

  const found = initialCatalog.find((p) => p.slug === slug);
  if (found) return found;

  const error = new Error(`Product not found for slug: ${slug}`);
  error.statusCode = 404;
  throw error;
};

/**
 * Get all categories with counts
 */
const getCategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    if (categories && categories.length > 0) return categories;
  } catch (err) {
    // Fallback
  }

  return initialCategories.map((c) => {
    const count = initialCatalog.filter((p) => p.categorySlug === c.slug).length;
    return {
      ...c,
      itemCount: `${count} Models`,
    };
  });
};

/**
 * Get filter options for sidebar (Brands, Sizes, Colors, Price min/max)
 */
const getFilterOptions = async () => {
  const brands = [...new Set(initialCatalog.map((p) => p.brand))];
  const allSizes = [...new Set(initialCatalog.flatMap((p) => p.sizes || []))].sort((a, b) => parseFloat(a) - parseFloat(b));
  const prices = initialCatalog.map((p) => p.price);
  const minPrice = Math.floor(Math.min(...prices));
  const maxPrice = Math.ceil(Math.max(...prices));

  return {
    brands,
    sizes: allSizes,
    colors: ['Emerald', 'White', 'Forest', 'Mint', 'Obsidian', 'Moss', 'Bone', 'Charcoal'],
    priceBounds: { min: minPrice, max: maxPrice },
  };
};

module.exports = {
  getAllProducts,
  getProductBySlug,
  getCategories,
  getFilterOptions,
  initialCatalog,
};
