import { Link } from '@remix-run/react'
import { ActionFunction, json } from '@remix-run/node'
import { db } from '~/utils/db.server'

export let loader = () => {
  return {};
};

export let action: ActionFunction = async ({ request }) => {
  const body = new URLSearchParams(await request.text());
  const email = body.get('email') || '';
  const password = body.get('password') || '';

  // Проверка, если пользователь уже существует
  const existingCustomer = await db.customer.findUnique({ where: { email } });
  if (existingCustomer) {
    return json({ error: 'Customer already exists' }, { status: 400 });
  }

  // Создание нового пользователя
  const newCustomer = await db.customer.create({
    data: {
      email,
      password,
    },
  });

  return json({ success: 'Customer registered successfully' });
};

export default function Register() {
  return (
    <div>
      <h2>Registration</h2>
      <form method="post">
        <label>
          Email:
          <input type="email" name="email" />
        </label>
        <label>
          Password:
          <input type="password" name="password" />
        </label>
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}