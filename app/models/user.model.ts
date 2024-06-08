import bcrypt from 'bcrypt';
import { db } from '../utils/db.server';
import { Customer } from '@prisma/client';

export async function findUserByEmail(email: string): Promise<Customer | null> {
  try {
    return await db.customer.findUnique({
      where: { email },
      include: { sessions: true }
    });
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

export async function createUser(data: {
  email: string
  password: string
  ipAddress?: string
  userAgent?: string
}): Promise<Customer | null> {
  const { email, password, ipAddress, userAgent } = data

  // Валидация email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Валидация пароля
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    return await db.customer.create({
      data: {
        email,
        password: hashedPassword,
        role: 'USER',
        phoneVerified: false,
        sessions: {
            create: {
                ipAddress,
                userAgent,
                loginTime: new Date(),
                isActive: true,
            }
        },
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export function generateRandomPassword(length: number): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
}

export interface UserRegistrationData {
    email: string;
    password: string;
  }
  
  export interface UserLoginData {
    email: string;
    password: string;
  }
  
  export interface UserProfile {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }
  
  export interface UserUpdateData {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }