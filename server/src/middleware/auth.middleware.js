import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'super-secret-jwt-key-antigravity-production-2026';

    const decoded = jwt.verify(token, secret);
    
    // Fetch user details from database
    const user = await db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token. User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid or corrupted authorization token.' });
  }
};

export default authMiddleware;
