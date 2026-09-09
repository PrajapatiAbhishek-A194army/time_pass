const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { memoryUsers } = require('../services/authService');

/**
 * Protect route with JWT verification
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token missing.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'solesphere_fallback_secret_key_2026';
    const decoded = jwt.verify(token, secret);

    // Try finding user from Prisma if DB connected
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
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

      if (!user) {
        // Fallback for memory store or invalid id
        if (memoryUsers && memoryUsers[decoded.id]) {
          const memUser = memoryUsers[decoded.id];
          req.user = {
            id: memUser.id,
            name: memUser.name,
            email: memUser.email,
            role: memUser.role,
            phone: memUser.phone,
            avatar: memUser.avatar,
          };
          return next();
        }
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists.',
        });
      }

      req.user = user;
      next();
    } catch (dbError) {
      // If DB is offline, check fallback memory users
      if (memoryUsers && memoryUsers[decoded.id]) {
        const memUser = memoryUsers[decoded.id];
        req.user = {
          id: memUser.id,
          name: memUser.name,
          email: memUser.email,
          role: memUser.role,
          phone: memUser.phone,
          avatar: memUser.avatar,
        };
        return next();
      }
      return res.status(401).json({
        success: false,
        message: 'Unable to authenticate session at this moment.',
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};

/**
 * Restrict route to ADMIN role
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Forbidden. Administrator privileges required.',
    });
  }
};

module.exports = { protect, admin };
