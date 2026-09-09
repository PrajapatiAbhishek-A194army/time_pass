const addressService = require('../services/addressService');

/**
 * Get all addresses for logged in user
 * GET /api/addresses
 */
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await addressService.getUserAddresses(req.user.id);
    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new address
 * POST /api/addresses
 */
const createAddress = async (req, res, next) => {
  try {
    const address = await addressService.createAddress(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Address added successfully.',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing address
 * PUT /api/addresses/:id
 */
const updateAddress = async (req, res, next) => {
  try {
    const address = await addressService.updateAddress(req.user.id, req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Address updated successfully.',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an address
 * DELETE /api/addresses/:id
 */
const deleteAddress = async (req, res, next) => {
  try {
    await addressService.deleteAddress(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Address removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set an address as default
 * PATCH /api/addresses/:id/default
 */
const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await addressService.setDefaultAddress(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Default address updated.',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
