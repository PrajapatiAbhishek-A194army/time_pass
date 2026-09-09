const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('[SoleSphere Database Seeder] Initializing sample data feed...');

  // 1. Clean existing records in reverse dependency order
  console.log('-> Clearing existing database tables...');
  await prisma.review.deleteMany().catch(() => {});
  await prisma.orderItem.deleteMany().catch(() => {});
  await prisma.order.deleteMany().catch(() => {});
  await prisma.cartItem.deleteMany().catch(() => {});
  await prisma.cart.deleteMany().catch(() => {});
  await prisma.wishlistItem.deleteMany().catch(() => {});
  await prisma.wishlist.deleteMany().catch(() => {});
  await prisma.inventory.deleteMany().catch(() => {});
  await prisma.productImage.deleteMany().catch(() => {});
  await prisma.product.deleteMany().catch(() => {});
  await prisma.category.deleteMany().catch(() => {});
  await prisma.address.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  // 2. Seed Users
  console.log('-> Seeding administrator and collector users...');
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@2026!', salt);
  const userPasswordHash = await bcrypt.hash('Collector@2026!', salt);

  const admin = await prisma.user.create({
    data: {
      name: 'Atelier Director',
      email: 'admin@solesphere.com',
      password: adminPasswordHash,
      role: 'ADMIN',
      phone: '+1 (800) 555-0199',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
  });

  const userMarcus = await prisma.user.create({
    data: {
      name: 'Marcus Aurelius Sterling',
      email: 'marcus.sterling@example.com',
      password: userPasswordHash,
      role: 'CUSTOMER',
      phone: '+1 (555) 234-5678',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
  });

  const userElena = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena.rostova@marathon.org',
      password: userPasswordHash,
      role: 'CUSTOMER',
      phone: '+1 (555) 876-5432',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    },
  });

  const userJulian = await prisma.user.create({
    data: {
      name: 'Julian Thorne',
      email: 'julian.thorne@design.co',
      password: userPasswordHash,
      role: 'CUSTOMER',
      phone: '+44 20 7946 0912',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
  });

  const userChloe = await prisma.user.create({
    data: {
      name: 'Chloe Bennett',
      email: 'chloe.bennett@atelier.com',
      password: userPasswordHash,
      role: 'CUSTOMER',
      phone: '+1 (555) 345-6789',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    },
  });

  // 3. Seed Addresses
  console.log('-> Seeding collector delivery addresses...');
  const addrMarcus = await prisma.address.create({
    data: {
      userId: userMarcus.id,
      fullName: 'Marcus Aurelius Sterling',
      phone: '+1 (555) 234-5678',
      street: '742 Evergreen Terrace, Suite 4B',
      city: 'Beverly Hills',
      state: 'CA',
      postalCode: '90210',
      country: 'United States',
      isDefault: true,
    },
  });

  const addrElena = await prisma.address.create({
    data: {
      userId: userElena.id,
      fullName: 'Elena Rostova',
      phone: '+1 (555) 876-5432',
      street: '124 Ocean Drive, Penthouse 8',
      city: 'Miami',
      state: 'FL',
      postalCode: '33139',
      country: 'United States',
      isDefault: true,
    },
  });

  const addrJulian = await prisma.address.create({
    data: {
      userId: userJulian.id,
      fullName: 'Julian Thorne',
      phone: '+44 20 7946 0912',
      street: '18 Kensington Palace Gardens',
      city: 'London',
      state: 'Greater London',
      postalCode: 'W8 4QP',
      country: 'United Kingdom',
      isDefault: true,
    },
  });

  const addrChloe = await prisma.address.create({
    data: {
      userId: userChloe.id,
      fullName: 'Chloe Bennett',
      phone: '+1 (555) 345-6789',
      street: '450 West 33rd Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
      isDefault: true,
    },
  });

  // 4. Seed Categories
  console.log('-> Seeding luxury footwear categories...');
  const categoriesData = [
    { name: 'Performance Running', slug: 'performance-running', description: 'Engineered carbon-plated footwear designed for marathon velocity.' },
    { name: 'Court Classics', slug: 'court-classics', description: 'Minimalist leather silhouettes rooted in historic tennis heritage.' },
    { name: 'Streetwear & High-Tops', slug: 'streetwear', description: 'Architectural silhouettes, padded collars, and structured vulcanized soles.' },
    { name: 'Trail & Outdoor', slug: 'trail-outdoor', description: 'Vibram lugged grip outsoles and water-repellent ripstop membranes.' },
    { name: 'Lifestyle & Heritage', slug: 'lifestyle-heritage', description: 'Timeless lifestyle footwear crafted with supple calfskin and suedes.' },
    { name: 'Atelier Luxury', slug: 'atelier-luxury', description: 'Bespoke limited editions handcrafted in Northern Italy.' },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.name] = created;
    categoryMap[cat.slug] = created;
  }

  // 5. Seed Products with Images and Sized Inventories
  console.log('-> Seeding footwear silhouettes and size variant matrices...');
  const catalogSeeds = [
    {
      name: 'Apex Carbon Velocity Pro',
      slug: 'apex-carbon-velocity-pro',
      brand: 'SoleSphere Lab',
      category: 'Performance Running',
      price: 219.99,
      discountPrice: 269.99,
      isFeatured: true,
      isTrending: true,
      description: 'Engineered with twin-curved full-length carbon plates and nitrogen-infused AeroFoam for maximum energy return and marathon propulsion.',
      details: 'Dual-density carbon fiber plate. Breathable monomesh upper. Molded heel counter. Weight: 185g (US 9).',
      image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      ],
      sizes: ['7', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
      color: 'Emerald / White',
    },
    {
      name: 'Vanguard Retro Mid High',
      slug: 'vanguard-retro-mid-high',
      brand: 'SoleSphere Originals',
      category: 'Streetwear & High-Tops',
      price: 189.99,
      discountPrice: 220.00,
      isFeatured: true,
      isTrending: false,
      description: 'Italian tumbled leather meets padded collars and textured rubber cupsoles for timeless streetwear presence.',
      details: 'Tumbled nappa leather upper. Reinforced vulcanized cupsole. Perforated toe box. Hand-stitched sidewall.',
      image: 'https://images.unsplash.com/photo-1512374382149-233c42b661ac?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1512374382149-233c42b661ac?auto=format&fit=crop&w=800&q=80',
      ],
      sizes: ['8', '9', '9.5', '10', '11'],
      color: 'Forest Suede',
    },
    {
      name: 'AeroGlide Ultra Minimalist',
      slug: 'aeroglide-ultra-minimalist',
      brand: 'SoleSphere Studio',
      category: 'Court Classics',
      price: 159.99,
      discountPrice: null,
      isFeatured: true,
      isTrending: true,
      description: 'Monochromatic architectural low-top featuring seamless microfiber construction and memory foam footbeds.',
      details: 'Seamless Japanese microfiber upper. OrthoLite memory foam footbed. Margom rubber sole.',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      ],
      sizes: ['7', '8', '9', '10', '11'],
      color: 'Off-White / Mint',
    },
    {
      name: 'Court Legacy Atelier 88',
      slug: 'court-legacy-atelier-88',
      brand: 'SoleSphere Heritage',
      category: 'Court Classics',
      price: 179.99,
      discountPrice: 210.00,
      isFeatured: true,
      isTrending: false,
      description: 'Inspired by 1988 grand slam finals, constructed from full-grain nappa leather with archival gold foil branding.',
      details: 'Aniline nappa leather. Gold foil model numbering. Herringbone traction outsole.',
      image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80',
      ],
      sizes: ['7.5', '8', '8.5', '9', '10', '10.5', '11'],
      color: 'White / Forest',
    },
    {
      name: 'TerraTrack Alpine Explorer',
      slug: 'terratrack-alpine-explorer',
      brand: 'SoleSphere Mountain',
      category: 'Trail & Outdoor',
      price: 249.99,
      discountPrice: 289.99,
      isFeatured: false,
      isTrending: true,
      description: 'Built for untamed wilderness with Vibram Megagrip traction lugs, Cordura ripstop, and quick-cinch speed lacing.',
      details: 'Vibram Megagrip lugged outsole. Cordura 1000D abrasion-resistant upper. Kevlar speed lacing.',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      ],
      sizes: ['8', '9', '10', '11', '12'],
      color: 'Obsidian Black',
    },
    {
      name: 'Strata Tech-Knit Slipstream',
      slug: 'strata-tech-knit-slipstream',
      brand: 'SoleSphere Performance',
      category: 'Performance Running',
      price: 199.99,
      discountPrice: null,
      isFeatured: false,
      isTrending: true,
      description: 'Zero-seam circular knit upper with targeted compression zones and decoupled responsive cushioning pods.',
      details: 'Circular seamless engineered knit. Decoupled heel cushioning pods. Sock-like adaptive collar.',
      image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
      ],
      sizes: ['8', '8.5', '9', '9.5', '10', '10.5', '11'],
      color: 'Slate / Emerald',
    },
    {
      name: 'Zenith Monochrome Runner',
      slug: 'zenith-monochrome-runner',
      brand: 'SoleSphere Studio',
      category: 'Lifestyle & Heritage',
      price: 169.99,
      discountPrice: 199.99,
      isFeatured: false,
      isTrending: false,
      description: 'Ultra-light daily trainer combining minimalist Scandinavian aesthetics with resilient EVA midsole geometry.',
      details: 'Scandinavian minimalist silhouette. Sculpted dual-density EVA midsole. Breathable knit vamp.',
      image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80',
      ],
      sizes: ['7', '8', '9', '10', '11'],
      color: 'Pure White',
    },
    {
      name: 'Equinox Suede Low Atelier',
      slug: 'equinox-suede-low-atelier',
      brand: 'SoleSphere Atelier',
      category: 'Atelier Luxury',
      price: 289.99,
      discountPrice: 340.00,
      isFeatured: true,
      isTrending: false,
      description: 'Hand-dyed French calfskin suede with waxed cotton laces, hand-stitched welt, and natural crepe outsoles.',
      details: 'French calfskin suede. Goodyear welted crepe sole. Vegetable-tanned leather lining.',
      image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
      ],
      sizes: ['8', '9', '9.5', '10', '10.5', '11'],
      color: 'Forest Moss',
    },
  ];

  const createdProducts = [];
  for (const item of catalogSeeds) {
    const cat = categoryMap[item.category] || Object.values(categoryMap)[0];
    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        brand: item.brand,
        categoryId: cat.id,
        price: item.price,
        discountPrice: item.discountPrice,
        description: item.description,
        details: item.details,
        isFeatured: item.isFeatured,
        isTrending: item.isTrending,
        isActive: true,
      },
    });

    // Seed images
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: item.image,
        isPrimary: true,
      },
    });

    for (const gUrl of item.gallery) {
      if (gUrl !== item.image) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: gUrl,
            isPrimary: false,
          },
        });
      }
    }

    // Seed inventory sizes
    const prefix = item.slug.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
    for (let i = 0; i < item.sizes.length; i++) {
      const s = item.sizes[i];
      await prisma.inventory.create({
        data: {
          productId: product.id,
          size: s,
          color: item.color,
          stock: i === 0 ? 4 : (i % 2 === 0 ? 14 : 22),
          sku: `SS-${prefix}-US${s.replace('.', '_')}`,
        },
      });
    }

    createdProducts.push({ ...product, sizes: item.sizes, color: item.color, image: item.image });
  }

  // 6. Seed Orders with Order Items
  console.log('-> Seeding verified order consignments across fulfillment stages...');
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'SS-2026-928174',
      userId: userMarcus.id,
      shippingAddressId: addrMarcus.id,
      status: 'PROCESSING',
      paymentStatus: 'PAID',
      paymentMethod: 'CARD',
      paymentId: 'pi_3MtwBwLkdIwHu7ix28A35VnZ',
      subtotal: 439.98,
      shippingFee: 0.00,
      tax: 0.00,
      totalAmount: 439.98,
      trackingNumber: 'SS-FEDEX-918239',
      notes: 'Please double-box packaging for collector pristine condition.',
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            productName: createdProducts[0].name,
            productImage: createdProducts[0].image,
            size: 'US 10.5',
            color: 'Emerald / White',
            price: createdProducts[0].price,
            quantity: 2,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'SS-2026-881923',
      userId: userElena.id,
      shippingAddressId: addrElena.id,
      status: 'SHIPPED',
      paymentStatus: 'PAID',
      paymentMethod: 'CARD',
      paymentId: 'pi_3MtwBwLkdIwHu7ix28A35VnX',
      subtotal: 189.99,
      shippingFee: 15.00,
      tax: 19.92,
      totalAmount: 224.91,
      trackingNumber: 'TRK-SS-91823901',
      notes: 'Leave at front desk with doorman.',
      items: {
        create: [
          {
            productId: createdProducts[2].id,
            productName: createdProducts[2].name,
            productImage: createdProducts[2].image,
            size: 'US 8',
            color: 'Off-White / Mint',
            price: createdProducts[2].price,
            quantity: 1,
          },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'SS-2026-771239',
      userId: userJulian.id,
      shippingAddressId: addrJulian.id,
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      paymentMethod: 'CARD',
      paymentId: 'pi_3MtwBwLkdIwHu7ix28A35VnY',
      subtotal: 249.99,
      shippingFee: 0.00,
      tax: 0.00,
      totalAmount: 249.99,
      trackingNumber: 'TRK-SS-48192034',
      items: {
        create: [
          {
            productId: createdProducts[4].id,
            productName: createdProducts[4].name,
            productImage: createdProducts[4].image,
            size: 'US 11',
            color: 'Obsidian Black',
            price: createdProducts[4].price,
            quantity: 1,
          },
        ],
      },
    },
  });

  const order4 = await prisma.order.create({
    data: {
      orderNumber: 'SS-2026-619284',
      userId: userChloe.id,
      shippingAddressId: addrChloe.id,
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      paymentMethod: 'CARD',
      paymentId: 'pi_3MtwBwLkdIwHu7ix28A35VnW',
      subtotal: 179.99,
      shippingFee: 0.00,
      tax: 0.00,
      totalAmount: 179.99,
      trackingNumber: 'TRK-SS-11827394',
      items: {
        create: [
          {
            productId: createdProducts[3].id,
            productName: createdProducts[3].name,
            productImage: createdProducts[3].image,
            size: 'US 7.5',
            color: 'White / Forest',
            price: createdProducts[3].price,
            quantity: 1,
          },
        ],
      },
    },
  });

  // 7. Seed Reviews
  console.log('-> Seeding verified collector reviews and ratings...');
  await prisma.review.create({
    data: {
      userId: userMarcus.id,
      productId: createdProducts[0].id,
      rating: 5,
      title: 'Unmatched Propulsion & Arch Stabilization',
      comment: 'Ran my first sub-3 marathon in these. The carbon plate geometry paired with the dual nitrogen foam provides unbelievable energy return without straining calves.',
    },
  });

  await prisma.review.create({
    data: {
      userId: userElena.id,
      productId: createdProducts[2].id,
      rating: 5,
      title: 'Flawless Minimalist Craftsmanship',
      comment: 'The leather quality is top tier. Zero break-in period required and the green accents add just the right amount of distinction.',
    },
  });

  await prisma.review.create({
    data: {
      userId: userJulian.id,
      productId: createdProducts[4].id,
      rating: 5,
      title: 'Alpine Grip That Never Fails',
      comment: 'Tested these across wet highland granite and scree. The Vibram compound locks on like crampons while maintaining sneaker ergonomics.',
    },
  });

  console.log('[SoleSphere Database Seeder] All sample data successfully seeded into PostgreSQL!');
  console.log('--------------------------------------------------');
  console.log('Admin Account:    admin@solesphere.com / Admin@2026!');
  console.log('Customer Account: marcus.sterling@example.com / Collector@2026!');
  console.log('Database Status:  Active & Synchronized with Prisma');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
