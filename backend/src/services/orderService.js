const prisma = require('../config/db');
const { sendOrderConfirmationEmail } = require('./emailService');
const cartService = require('./cartService');

// Resilient dev in-memory order repository
const memoryOrders = [];

/**
 * Generate unique luxury order number
 */
const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `SS-${year}-${randomSuffix}`;
};

/**
 * Generate unique courier tracking code
 */
const generateTrackingNumber = () => {
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
  return `TRK-SS-${randomDigits}`;
};

/**
 * Create a new order
 */
const createOrder = async ({
  userId = null,
  shippingAddress,
  items,
  paymentMethod = 'CARD',
  paymentId = null,
  promoCode = null,
  notes = null,
}) => {
  if (!items || items.length === 0) {
    throw new Error('Cannot create an order with an empty bag.');
  }

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
    throw new Error('Complete shipping address is required.');
  }

  // Calculate pricing breakdown
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  // Discount calculation
  let discountAmount = 0;
  if (promoCode === 'SOLEDROP15') {
    discountAmount = subtotal * 0.15;
  } else if (promoCode === 'WELCOME10') {
    discountAmount = subtotal * 0.10;
  }

  // Shipping fee: Free over $150, else $15
  const shippingFee = (subtotal - discountAmount) >= 150 ? 0 : 15;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = taxableAmount * 0.08; // 8% estimated tax
  const totalAmount = parseFloat((taxableAmount + shippingFee + tax).toFixed(2));

  const orderNumber = generateOrderNumber();
  const trackingNumber = generateTrackingNumber();

  let orderRecord = null;

  try {
    // Attempt database creation if user is authenticated and DB is reachable
    if (userId) {
      let addressId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (user) {
        // Create or find address
        const address = await prisma.address.create({
          data: {
            userId,
            fullName: shippingAddress.fullName,
            phone: shippingAddress.phone || 'N/A',
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state || 'N/A',
            postalCode: shippingAddress.postalCode || 'N/A',
            country: shippingAddress.country || 'India',
          },
        });
        addressId = address.id;

        // Create Order in PostgreSQL
        orderRecord = await prisma.order.create({
          data: {
            orderNumber,
            userId,
            shippingAddressId: addressId,
            status: 'PROCESSING',
            paymentStatus: 'PAID',
            paymentMethod: paymentMethod === 'COD' ? 'CASH_ON_DELIVERY' : 'CARD',
            paymentId: paymentId || `pay_sim_${Date.now()}`,
            subtotal,
            shippingFee,
            tax,
            totalAmount,
            trackingNumber,
            notes,
            items: {
              create: items.map((i) => ({
                productId: i.productId || i.id,
                productName: i.name,
                productImage: i.image,
                size: i.size || 'US 9',
                color: i.color || 'Default',
                price: Number(i.price),
                quantity: i.quantity || 1,
              })),
            },
          },
          include: {
            items: true,
            shippingAddress: true,
          },
        });

        // Clear cart for authenticated user
        await cartService.clearCart(userId).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('[OrderService Database Fallback Note]:', err.message);
  }

  // If DB was offline or not reachable, store in memory
  if (!orderRecord) {
    orderRecord = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      orderNumber,
      userId,
      trackingNumber,
      status: 'PROCESSING',
      paymentStatus: 'PAID',
      paymentMethod,
      paymentId: paymentId || `pay_sim_${Date.now()}`,
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      shippingFee,
      tax: parseFloat(tax.toFixed(2)),
      totalAmount,
      promoCode,
      notes,
      shippingAddress: {
        ...shippingAddress,
      },
      items: items.map((i) => ({
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        productId: i.productId || i.id,
        name: i.name,
        productName: i.name,
        image: i.image,
        productImage: i.image,
        size: i.size || 'US 9',
        color: i.color || 'Default',
        price: Number(i.price),
        quantity: i.quantity || 1,
      })),
      createdAt: new Date().toISOString(),
    };

    memoryOrders.unshift(orderRecord);
    if (userId) {
      await cartService.clearCart(userId).catch(() => {});
    }
  } else {
    // Add computed fields for email and UI
    orderRecord.discountAmount = parseFloat(discountAmount.toFixed(2));
    orderRecord.promoCode = promoCode;
    orderRecord.shippingAddress = shippingAddress;
  }

  // Trigger Brevo SMTP Confirmation Email asynchronously
  sendOrderConfirmationEmail(orderRecord, {
    name: shippingAddress.fullName,
    email: shippingAddress.email || (userId ? `${userId}@example.com` : 'shopper@solesphere.com'),
  }).catch((err) => {
    console.warn('[Brevo SMTP Email Trigger Note]:', err.message);
  });

  return orderRecord;
};

/**
 * Get all orders for a specific user
 */
const getUserOrders = async (userId) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (orders && orders.length > 0) return orders;
  } catch (err) {
    // DB fallback
  }

  return memoryOrders.filter((o) => o.userId === userId);
};

/**
 * Get single order by orderNumber or ID
 */
const getOrderByNumber = async (orderNumber) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber }, { id: orderNumber }],
      },
      include: {
        items: true,
        shippingAddress: true,
      },
    });
    if (order) return order;
  } catch (err) {
    // DB fallback
  }

  const found = memoryOrders.find(
    (o) => o.orderNumber === orderNumber || o.id === orderNumber
  );

  return found || null;
};

/**
 * Cancel order if status is PENDING or PROCESSING
 */
const cancelOrder = async (userId, orderNumber) => {
  const order = await getOrderByNumber(orderNumber);
  if (!order) {
    const error = new Error(`Order #${orderNumber} not found.`);
    error.statusCode = 404;
    throw error;
  }

  if (order.userId && userId && order.userId !== userId) {
    const error = new Error('You are not authorized to cancel this order.');
    error.statusCode = 403;
    throw error;
  }

  const cancellableStatuses = ['PENDING', 'PROCESSING'];
  if (!cancellableStatuses.includes(order.status)) {
    const error = new Error(
      `Order cannot be cancelled because its current status is ${order.status}. Only Pending or Processing orders can be cancelled.`
    );
    error.statusCode = 400;
    throw error;
  }

  try {
    const updated = await prisma.order.update({
      where: { orderNumber: order.orderNumber },
      data: { status: 'CANCELLED' },
      include: {
        items: true,
        shippingAddress: true,
      },
    });
    if (updated) return updated;
  } catch (err) {
    // Fallback in-memory
  }

  order.status = 'CANCELLED';
  return order;
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderByNumber,
  cancelOrder,
  generateOrderNumber,
  generateTrackingNumber,
};

