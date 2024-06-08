import { ActionFunction, json } from "@remix-run/node";
import bcrypt from "bcrypt";
import { db } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  const { email, password } = await request.json();

  try {
    const customer = await db.customer.findUnique({ where: { email } });
    if (!customer) {
      return json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const isCorrectPassword = await bcrypt.compare(password, customer.password);
    if (!isCorrectPassword) {
      return json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    return json({ success: true, customer });
  } catch (error) {
    console.error('Error during login:', error);
    return json({ success: false, message: 'Login failed' }, { status: 500 });
  }
};