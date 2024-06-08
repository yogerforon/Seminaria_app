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