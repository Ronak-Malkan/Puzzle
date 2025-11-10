import { query } from '../config/database';

export interface User {
  id: number;
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}

export const createUser = async (userData: CreateUserDTO): Promise<User> => {
  const { email, password, firstname, lastname } = userData;

  const result = await query(
    `INSERT INTO users (email, password, firstname, lastname)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, firstname, lastname, created_at, updated_at`,
    [email, password, firstname, lastname]
  );

  return result.rows[0];
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  return result.rows[0] || null;
};

export const getUserById = async (id: number): Promise<User | null> => {
  const result = await query(
    'SELECT id, email, firstname, lastname, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );

  return result.rows[0] || null;
};

export const emailExists = async (email: string): Promise<boolean> => {
  const result = await query(
    'SELECT COUNT(*) as count FROM users WHERE email = $1',
    [email]
  );

  return parseInt(result.rows[0].count) > 0;
};

export const updateUser = async (
  id: number,
  updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
): Promise<User> => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

  const result = await query(
    `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );

  return result.rows[0];
};
