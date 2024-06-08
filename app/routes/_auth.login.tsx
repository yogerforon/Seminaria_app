// /router/auth/_login.login.tsx

import { ActionFunction, redirect } from '@remix-run/node';
import { json, Form, useActionData, useNavigation } from '@remix-run/react';

import { login } from '~/services/auth.service';
import { getSession, commitSession } from '~/services/session.service';
import { getClientInfo } from '~/utils/clientInfo.server';
import type { LoginForm } from '~/types';
import { validateEmail } from '~/models/user.model'; // Импортируем функцию валидации электронной почты

interface ActionData {
  error?: string;
}

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (typeof email !== 'string' || typeof password !== 'string') {
      return json<ActionData>({ error: "Email and password are required" }, { status: 400 });
    }

    // Проверяем валидность электронной почты
    if (!validateEmail(email)) {
      return json<ActionData>({ error: "Invalid email format" }, { status: 400 });
    }

    // Проверяем длину пароля
    if (password.length < 8) {
      return json<ActionData>({ error: "Password must be at least 8 characters long" }, { status: 400 });
    }
    
    // Аутентификация пользователя с использованием функции из auth.service.ts
    const credentials: LoginForm = { email, password };
    const clientInfo = getClientInfo(request);
    const result = await login(credentials, clientInfo);

    if (!result) {
      return json<ActionData>({ error: "Invalid email or password" }, { status: 400 });
    }
    
    // Создание сеанса для пользователя
    const session = await getSession(request.headers.get('Cookie'));
    session.set('token', result.token);
    if (!session) {
      return json({ error: "Failed to create session" }, { status: 500 });
    }

    return redirect('/dashboard', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return json({ error: "An error occurred" }, { status: 500 });
  }
};

export default function Login() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  return (
    <div>
      <h1>Login</h1>
      <Form method="post">
        {actionData?.error && <p style={{ color: 'red' }}>{actionData.error}</p>}
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" name="email" id="email" required />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" name="password" id="password" required />
        </div>
        <button type="submit" disabled={navigation.state === 'submitting'}>Login</button>
      </Form>
      <a href="/google">Login with Google</a>
    </div>
  );
}