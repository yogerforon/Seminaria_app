import { Request } from "express";
import { db } from "../utils/db.server";
import { getSessionCustomer } from "./auth.service";

export async function getCustomer(request: Request) {
  try {
    const session = await getSessionCustomer(request);
    if (!session) return null;
    return db.customer.findUnique({ where: { id: session.customerId } });
  } catch (error) {
    console.error('Error getting customer:', error);
    throw new Error('Failed to retrieve customer data');
  }
}

export async function requireCustomer(request: Request) {
  try {
    const session = await getSessionCustomer(request);
    if (!session) throw new Error('Unauthorized');
    const customer = await db.customer.findUnique({ where: { id: session.customerId } });
    if (!customer) throw new Error('Unauthorized');
    return customer;
  } catch (error) {
    console.error('Error requiring customer:', error);
    throw new Error('Customer authentication failed');
  }
}


///
import bcrypt from "bcrypt";
import { db } from "~/utils/db.server";
import { Customer } from "@prisma/client";

export async function getCustomerById(id: Customer["id"]) {
  return db.customer.findUnique({ where: { id } });
}

export async function getCustomerByEmail(email: Customer["email"]) {
  return db.customer.findUnique({ where: { email } });
}

export async function createCustomer(email: Customer["email"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return db.customer.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function deleteCustomerByEmail(email: Customer["email"]) {
  return db.customer.delete({ where: { email } });
}