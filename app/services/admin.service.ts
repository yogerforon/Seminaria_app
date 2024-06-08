import * as bcrypt from "bcrypt"

import { sessionStorage } from "./session.service"
import { db } from '../utils/db.server'
import { LoginForm, Session } from "../types"

export async function authenticateAdmin(email: string, password: string) {
  const admin = await db.customer.findUnique({ where: { email, role: 'ADMIN' } });
  if (!admin) return null;

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) return null;

  return admin;
}

export async function getDashboardData() {
  try {
    const userCount = await db.customer.count();
    const orderCount = await db.order.count();
    return { userCount, orderCount };
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    throw new Error('Failed to retrieve dashboard data');
  }
}

export async function getAllUsers() {
  try {
    return await db.customer.findMany();
  } catch (error) {
    console.error('Error getting users:', error);
    throw new Error('Failed to retrieve users');
  }
}

export async function updateSettings(settings: any) {
  try {
    // Implement settings update logic
    return { success: true };
  } catch (error) {
    console.error('Error updating settings:', error);
    throw new Error('Failed to update settings');
  }
}

export async function login({ email, password }: LoginForm) {
  try {
    const admin = await db.customer.findUnique({ where: { email, role: "ADMIN" } });
    if (!admin) return null;
    const isCorrectPassword = await bcrypt.compare(password, admin.password);
    if (!isCorrectPassword) return null;
    return admin;
  } catch (error) {
    console.error('Error during admin login:', error);
    throw new Error('Login failed');
  }
}

export async function createSession(sessionData: Omit<Session, 'id'>): Promise<{ headers: { "Set-Cookie": string } } | null> {
  try {
    const session = await sessionStorage.getSession();
    session.set("customerId", sessionData.customerId);
    session.set("role", sessionData.role);
    await db.session.create({ data: sessionData });
    return {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    };
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}