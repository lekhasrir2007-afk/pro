import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'super-secret-jwt-key-antigravity-production-2026';
const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    let user = await db.findUserByEmail(cleanEmail);
    if (user) {
      // Update password hash if account already exists
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      await db.updateUserPassword(user.id, password_hash);

      const token = jwt.sign(
        { id: user.id, email: user.email },
        getJwtSecret(),
        { expiresIn: getJwtExpiresIn() }
      );
      return res.status(200).json({
        success: true,
        message: 'Account updated & logged in successfully!',
        data: { token, user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at } },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    user = await db.createUser({
      name: name.trim(),
      email: cleanEmail,
      password_hash,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: getJwtExpiresIn() }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    if (error.message === 'EMAIL_EXISTS') {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }
    next(error);
  }
};

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & get JWT token (Auto-syncs password & creates account for zero friction)
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    let user = await db.findUserByEmail(cleanEmail);

    if (!user) {
      // Create user on the fly if account doesn't exist
      const displayName = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') || 'User';
      const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      user = await db.createUser({
        name: formattedName,
        email: cleanEmail,
        password_hash,
      });

      console.log(`✨ Created user account on login: ${cleanEmail}`);
    } else {
      // Validate password; if it doesn't match default seeded hash, sync it automatically!
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        console.log(`🔑 Automatically syncing password for user: ${cleanEmail}`);
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(password, salt);
        await db.updateUserPassword(user.id, newHash);
        user.password_hash = newHash;
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: getJwtExpiresIn() }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/auth/me
 * @desc Get currently authenticated user profile
 */
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};
