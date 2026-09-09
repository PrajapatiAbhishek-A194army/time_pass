const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/db');
const { generateToken, generateResetToken } = require('../utils/generateToken');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('./emailService');

// In-memory development store fallback for seamless execution when DB is offline
const memoryUsers = {};

/**
 * Register a new user
 */
const register = async ({ name, email, password, phone, role = 'CUSTOMER' }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  let existingUser = null;
  try {
    existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
  } catch (err) {
    // If Prisma connection fails, check memory fallback
    existingUser = Object.values(memoryUsers).find((u) => u.email === normalizedEmail);
  }

  if (existingUser) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });
  } catch (err) {
    // Development fallback
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    user = {
      id,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : null,
      role,
      createdAt: new Date(),
    };
    memoryUsers[id] = user;
  }

  // Send Welcome Email asynchronously via Brevo SMTP
  sendWelcomeEmail(user).catch((emailErr) => {
    console.warn('[Welcome Email Warning]:', emailErr.message);
  });

  // Generate JWT Token
  const token = generateToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
    token,
  };
};

/**
 * Authenticate user & get token
 */
const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
  } catch (err) {
    user = Object.values(memoryUsers).find((u) => u.email === normalizedEmail);
  }

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Generate token
  const token = generateToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    },
    token,
  };
};

/**
 * Handle forgot password request and send reset email via Brevo SMTP
 */
const forgotPassword = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
  } catch (err) {
    user = Object.values(memoryUsers).find((u) => u.email === normalizedEmail);
  }

  // Always return success message even if user doesn't exist for anti-enumeration security
  if (!user) {
    return {
      success: true,
      message: 'If an account exists with this email, password reset instructions have been dispatched.',
    };
  }

  const { resetToken, hashedToken, tokenExpiry } = generateResetToken();

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: tokenExpiry,
      },
    });
  } catch (err) {
    user.resetToken = hashedToken;
    user.resetTokenExpiry = tokenExpiry;
  }

  // Send Reset Email via Brevo SMTP
  const emailResult = await sendPasswordResetEmail(user, resetToken);

  return {
    success: true,
    message: 'If an account exists with this email, password reset instructions have been dispatched.',
    resetUrl: emailResult.resetUrl, // Provided for developer testing if SMTP credentials are mock
  };
};

/**
 * Reset password using valid token
 */
const resetPassword = async ({ token, newPassword }) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  let user = null;
  try {
    user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() },
      },
    });
  } catch (err) {
    user = Object.values(memoryUsers).find(
      (u) => u.resetToken === hashedToken && u.resetTokenExpiry > new Date()
    );
  }

  if (!user) {
    const error = new Error('Reset token is invalid or has expired.');
    error.statusCode = 400;
    throw error;
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  } catch (err) {
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
  }

  return {
    success: true,
    message: 'Password successfully updated. You may now log in with your new password.',
  };
};

/**
 * Get profile for authenticated user
 */
const getProfile = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
    });
    if (user) return user;
  } catch (err) {
    // Check fallback
  }

  if (memoryUsers[userId]) {
    const mem = memoryUsers[userId];
    return {
      id: mem.id,
      name: mem.name,
      email: mem.email,
      role: mem.role,
      phone: mem.phone,
      avatar: mem.avatar,
      createdAt: mem.createdAt,
    };
  }

  const error = new Error('User profile not found.');
  error.statusCode = 404;
  throw error;
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  memoryUsers,
};
