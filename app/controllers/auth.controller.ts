/*
* 1. Вход пользователя: Обработка логина пользователя.
* 2. Выход пользователя: Обработка выхода пользователя.
*/


import { ActionFunction, redirect, json } from '@remix-run/node';
import * as bcrypt from 'bcrypt';
import { findUserByEmail } from '../models/user.model';
import { getClientInfo } from '../utils/clientInfo.server';
import { createToken, verifyToken } from '../utils/paseto.server';
import type { Session } from '../types';

// Контроллер для логина пользователя
export const login: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      return json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return json({ error: 'Invalid password' }, { status: 401 });
    }

    const clientInfo = getClientInfo(request);
    const sessionData: Omit<Session, 'id'> = {
      customerId: user.id,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      loginTime: new Date(),
      isActive: true,
      sessionType: 'regular', // Example session type
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day expiration
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const token = await createToken(sessionData);

    return redirect('/dashboard', {
      headers: {
        "Set-Cookie": `sessionToken=${token}; HttpOnly; Path=/;`,
      },
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

// Контроллер для выхода пользователя
export const logout: ActionFunction = async ({ request }) => {
  return redirect('/login', {
    headers: {
      "Set-Cookie": 'sessionToken=; HttpOnly; Path=/; Max-Age=0',
    },
  });
};

// Пример использования Paseto для проверки токена
export const getSessionData: ActionFunction = async ({ request }) => {
  try {
    const cookie = request.headers.get('Cookie');
    const token = cookie?.split('=')[1];

    if (!token) {
      return json({ error: 'No session found' }, { status: 400 });
    }

    const sessionData = await verifyToken(token);

    return json({ success: true, data: sessionData }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving session data:', error);
    return json({ error: 'Failed to retrieve session data' }, { status: 500 });
  }
};



// import { redirect, json } from '@remix-run/node';

// import { login } from "~/services/auth.service";

// // Обработка запроса на вход пользователя
// async function handleLoginRequest(request: Request) {
//   try {
//      // Получение IP-адреса из заголовка x-forwarded-for
//      const forwardedForHeader = request.headers.get("x-forwarded-for");
//      const ipAddress = forwardedForHeader ? forwardedForHeader.split(',')[0].trim() : '';
//      const userAgent = request.headers.get("user-agent") || '';
//      const clientInfo = { ipAddress, userAgent };

//     // const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || request.connection.remoteAddress;
    
//     // Получение данных из запроса, например, формы входа
//     const formData = await request.formData();
//     const email = formData.get('email') as string;
//     const password = formData.get('password') as string;
//     const credentials = { email, password };
//     //const credentials = await request.formData();

//     // Передача данных в функцию login для аутентификации
//     const result = await login(credentials, clientInfo);

//     // Обработка результата аутентификации
//     if (result) {
//       // Если успешно, выполните действия, например, перенаправление на главную страницу
//       return redirect("/");
//     } else {
//       // Если не успешно, выполните действия, например, отображение сообщения об ошибке
//       return json({ error: "Invalid credentials" }, { status: 401 }) || redirect('/login?error=invalid_credentials');
//       // Если вход не удался, показываем сообщение об ошибке
//       //return redirect('/login?error=invalid_credentials');
//     }
//   } catch (error) {
//     //Если произошла ошибка, показываем сообщение об ошибке
//     console.error("An error occurred during login:", error);
//     return json({ error: "An error occurred" }, { status: 500 }) || redirect('/login?error=unexpected_error');
//   }
// }

// export { handleLoginRequest };


// // export async function register(req: Request, res: Response) {
// //   try {
// //     const user = await authService.register(req.body);
// //     res.status(201).json(user);
// //   } catch (error) {
// //     res.status(400).json({ error: error.message });
// //   }
// // }

// // export async function login(req: Request, res: Response) {
// //   try {
// //     const user = await authService.login(req.body);
// //     if (user) {
// //       const session = await authService.createSession({ customerId: user.id, ...req.body });
// //       res.status(200).json({ user, session });
// //     } else {
// //       res.status(401).json({ error: 'Invalid credentials' });
// //     }
// //   } catch (error) {
// //     res.status(400).json({ error: error.message });
// //   }
// // }

// // export async function logout(req: Request, res: Response) {
// //   try {
// //     const headers = await authService.destroySession(req);
// //     res.writeHead(302, headers).end();
// //   } catch (error) {
// //     res.status(400).json({ error: error.message });
// //   }
// // }


// // ////////////////////////////////
// // export async function register({ request }: { request: Request }) {
// //   const formData = await request.formData();
// //   const email = formData.get('email') as string;
// //   const password = formData.get('password') as string;

// //   try {
// //     const user = await authService.register({ email, password });
// //     return redirect('/login');
// //   } catch (error) {
// //     return json({ error: error.message }, { status: 400 });
// //   }
// // }

// // export async function login({ request }: { request: Request }) {
// //   const formData = await request.formData();
// //   const email = formData.get('email') as string;
// //   const password = formData.get('password') as string;

// //   try {
// //     const user = await authService.login({ email, password });
// //     // set the user session and redirect to the dashboard
// //     return redirect('/dashboard');
// //   } catch (error) {
// //     return json({ error: error.message }, { status: 400 });
// //   }
// // }