import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString: connectionString || 'postgresql://postgres:postgres@localhost:5432/fullstack_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 2000,
});

let isPgConnected = false;

const LOCAL_DB_PATH = path.resolve('uploads', 'local_users_db.json');

const loadLocalUsers = () => {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      const map = new Map(JSON.parse(data));
      if (map.size > 0) return map;
    }
  } catch (err) {
    console.error('Error loading local users file:', err.message);
  }

  const initialMap = new Map();
  const defaultPasswordHash = bcrypt.hashSync('123456', 10);
  
  const seedEmails = [
    { name: 'Ramanaboina Lekhasri', email: 'ramanaboinalekhasri2007@gmail.com' },
    { name: 'Lekhasri', email: 'lekhasrir2007@gmail.com' },
  ];

  seedEmails.forEach((item, index) => {
    const id = String(index + 1);
    initialMap.set(id, {
      id,
      name: item.name,
      email: item.email,
      password_hash: defaultPasswordHash,
      created_at: new Date().toISOString(),
    });
  });

  return initialMap;
};

export const inMemoryUsers = loadLocalUsers();

const saveLocalUsers = () => {
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(Array.from(inMemoryUsers.entries()), null, 2));
  } catch (err) {
    console.error('Error saving local users file:', err.message);
  }
};

saveLocalUsers();

export const initDb = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database successfully.');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Database schema verified (users table ready).');
    isPgConnected = true;
    client.release();
  } catch (error) {
    isPgConnected = false;
    console.warn('⚠️ PostgreSQL not reachable:', error.message);
    console.warn(`⚠️ Running with persistent local database fallback (${inMemoryUsers.size} users stored).`);
  }
};

export const db = {
  async findUserByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    if (isPgConnected) {
      try {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
        if (res.rows[0]) return res.rows[0];
      } catch (err) {
        console.warn('Postgres query failed, using local fallback:', err.message);
      }
    }
    for (const user of inMemoryUsers.values()) {
      if (user.email === cleanEmail) return user;
    }
    return null;
  },

  async findUserById(id) {
    if (isPgConnected) {
      try {
        const res = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [id]);
        if (res.rows[0]) return res.rows[0];
      } catch (err) {
        console.warn('Postgres query failed, using local fallback:', err.message);
      }
    }
    const user = inMemoryUsers.get(String(id));
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  async createUser({ name, email, password_hash }) {
    const cleanEmail = email.toLowerCase().trim();
    
    if (isPgConnected) {
      try {
        const res = await pool.query(
          'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
          [name, cleanEmail, password_hash]
        );
        return res.rows[0];
      } catch (error) {
        if (error.code === '23505') {
          throw new Error('EMAIL_EXISTS');
        }
        console.warn('Postgres insert failed, saving to local fallback:', error.message);
      }
    }

    for (const u of inMemoryUsers.values()) {
      if (u.email === cleanEmail) throw new Error('EMAIL_EXISTS');
    }
    const newId = String(Date.now());
    const newUser = { id: newId, name, email: cleanEmail, password_hash, created_at: new Date().toISOString() };
    inMemoryUsers.set(newId, newUser);
    saveLocalUsers();
    
    const { password_hash: _, ...safeUser } = newUser;
    return safeUser;
  },

  async updateUserPassword(id, password_hash) {
    if (isPgConnected) {
      try {
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, id]);
      } catch (err) {
        console.warn('Postgres update failed:', err.message);
      }
    }
    const user = inMemoryUsers.get(String(id));
    if (user) {
      user.password_hash = password_hash;
      saveLocalUsers();
    }
  }
};

export default db;
