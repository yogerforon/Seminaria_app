import { ActionFunction, json } from "@remix-run/node";
import bcrypt from "bcrypt";
import { db } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  const { email, password } = await request.json();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = await db.customer.create({
      data: { email, password: hashedPassword, role: 'USER' },
    });
    return json({ success: true, customer });
  } catch (error) {
    console.error('Error during registration:', error);
    return json({ success: false, message: 'Registration failed' }, { status: 500 });
  }
};