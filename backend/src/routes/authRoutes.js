const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require('../middleware/validator');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);
router.post('/logout', protect, authController.logout);

module.exports = router;
