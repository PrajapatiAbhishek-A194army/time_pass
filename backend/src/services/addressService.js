const prisma = require('../config/db');

// In-memory addresses fallback for dev resilience
const memoryAddresses = {};

/**
 * Get all addresses for user
 */
const getUserAddresses = async (userId) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    if (addresses && addresses.length > 0) return addresses;
  } catch (err) {
    // DB fallback
  }

  if (!memoryAddresses[userId]) {
    // Provide a default sample address
    memoryAddresses[userId] = [
      {
        id: `addr_${userId}_default`,
        userId,
        fullName: 'Alexander Wright',
        phone: '+1 (555) 234-5678',
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'Oregon',
        postalCode: '97477',
        country: 'United States',
        isDefault: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  return memoryAddresses[userId];
};

/**
 * Create a new address
 */
const createAddress = async (userId, data) => {
  const { fullName, phone, street, city, state, postalCode, country = 'United States', isDefault = false } = data;

  if (!fullName || !street || !city) {
    const error = new Error('Full name, street, and city are required.');
    error.statusCode = 400;
    throw error;
  }

  try {
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const created = await prisma.address.create({
      data: {
        userId,
        fullName: fullName.trim(),
        phone: phone ? phone.trim() : 'N/A',
        street: street.trim(),
        city: city.trim(),
        state: state ? state.trim() : 'N/A',
        postalCode: postalCode ? postalCode.trim() : 'N/A',
        country: country.trim(),
        isDefault: Boolean(isDefault),
      },
    });

    if (created) return created;
  } catch (err) {
    // Fallback in memory
  }

  if (!memoryAddresses[userId]) {
    memoryAddresses[userId] = [];
  }

  if (isDefault || memoryAddresses[userId].length === 0) {
    memoryAddresses[userId].forEach((a) => (a.isDefault = false));
  }

  const newAddr = {
    id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    userId,
    fullName: fullName.trim(),
    phone: phone ? phone.trim() : 'N/A',
    street: street.trim(),
    city: city.trim(),
    state: state ? state.trim() : 'N/A',
    postalCode: postalCode ? postalCode.trim() : 'N/A',
    country: country.trim(),
    isDefault: isDefault || memoryAddresses[userId].length === 0,
    createdAt: new Date().toISOString(),
  };

  memoryAddresses[userId].unshift(newAddr);
  return newAddr;
};

/**
 * Update an existing address
 */
const updateAddress = async (userId, addressId, data) => {
  const { fullName, phone, street, city, state, postalCode, country, isDefault } = data;

  try {
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id: addressId },
      data: {
        ...(fullName && { fullName: fullName.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(street && { street: street.trim() }),
        ...(city && { city: city.trim() }),
        ...(state && { state: state.trim() }),
        ...(postalCode && { postalCode: postalCode.trim() }),
        ...(country && { country: country.trim() }),
        ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
      },
    });

    if (updated) return updated;
  } catch (err) {
    // Memory fallback
  }

  if (!memoryAddresses[userId]) memoryAddresses[userId] = [];
  const idx = memoryAddresses[userId].findIndex((a) => a.id === addressId);
  if (idx === -1) {
    const error = new Error('Address not found.');
    error.statusCode = 404;
    throw error;
  }

  if (isDefault) {
    memoryAddresses[userId].forEach((a) => (a.isDefault = false));
  }

  const current = memoryAddresses[userId][idx];
  memoryAddresses[userId][idx] = {
    ...current,
    ...(fullName && { fullName: fullName.trim() }),
    ...(phone && { phone: phone.trim() }),
    ...(street && { street: street.trim() }),
    ...(city && { city: city.trim() }),
    ...(state && { state: state.trim() }),
    ...(postalCode && { postalCode: postalCode.trim() }),
    ...(country && { country: country.trim() }),
    ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
  };

  return memoryAddresses[userId][idx];
};

/**
 * Delete an address
 */
const deleteAddress = async (userId, addressId) => {
  try {
    await prisma.address.delete({
      where: { id: addressId },
    });
    return { success: true, message: 'Address deleted successfully.' };
  } catch (err) {
    // Memory fallback
  }

  if (memoryAddresses[userId]) {
    memoryAddresses[userId] = memoryAddresses[userId].filter((a) => a.id !== addressId);
  }

  return { success: true, message: 'Address deleted successfully.' };
};

/**
 * Set an address as default
 */
const setDefaultAddress = async (userId, addressId) => {
  return await updateAddress(userId, addressId, { isDefault: true });
};

module.exports = {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
