import * as UserModel from '../models/user.model';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { validateEmail } from '../utils/validation';
import { generateToken } from '../utils/jwt';
import { logger } from '../utils/logger';

export interface SignupRequest {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
  };
}

export const signup = async (data: SignupRequest): Promise<AuthResponse> => {
  const { email, password, firstname, lastname } = data;

  // Validate email format
  if (!validateEmail(email)) {
    throw new Error('Invalid email format. Please enter a valid email address.');
  }

  // Validate password strength
  if (!validatePasswordStrength(password)) {
    throw new Error(
      'Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.'
    );
  }

  // Check if email already exists
  const emailAlreadyExists = await UserModel.emailExists(email);
  if (emailAlreadyExists) {
    throw new Error('Email already exists. Please use a different email address.');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await UserModel.createUser({
    email,
    password: hashedPassword,
    firstname,
    lastname,
  });

  logger.info({ userId: user.id, email: user.email }, 'User created successfully');

  // Generate JWT token
  const token = generateToken({ id: user.id, email: user.email });

  return {
    message: 'User registered successfully',
    token,
    user: {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
    },
  };
};

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const { email, password } = data;

  // Get user by email
  const user = await UserModel.getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password.');
  }

  logger.info({ userId: user.id, email: user.email }, 'User logged in successfully');

  // Generate JWT token
  const token = generateToken({ id: user.id, email: user.email });

  return {
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
    },
  };
};

export const getUserInfo = async (userId: number) => {
  const user = await UserModel.getUserById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    created_at: user.created_at,
  };
};
