/*
Преимущества использования middleware
 - Централизованная аутентификация и авторизация: Логика проверки сессий и аутентификации находится в одном месте.
 - Повторное использование: Легко использовать в любом контроллере, где требуется аутентификация.
 - Чистота кода: Контроллеры становятся проще, так как не содержат повторяющийся код проверки сессий.
*/

import { LoaderFunction, ActionFunction, redirect } from '@remix-run/node';
import { verifySession, getSession } from '../services/session.service';
import { db } from '../utils/db.server';
import type { Customer } from '../types';

interface CustomRequest extends Request {
  user: Customer;
}

// Middleware для проверки аутентификации
export const requireAuth: LoaderFunction | ActionFunction = async ({ request }) => {
  const cookie = request.headers.get('Cookie');
  const session = await getSession(cookie);
  const token = session.get('sessionToken');

  if (!token) {
    return redirect('/login');
  }

  const verifiedSession = await verifySession(token);

  if (!verifiedSession || !verifiedSession.isActive) {
    return redirect('/login');
  }
  const customRequest = request as CustomRequest;
  // Добавление пользователя в запрос для дальнейшего использования в контроллерах
  customRequest.user = await db.customer.findUnique({ where: { id: verifiedSession.customerId } }) as Customer;

  return null; // Если все проверки пройдены, продолжаем выполнение контроллера
};