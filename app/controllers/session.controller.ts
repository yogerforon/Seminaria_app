/*
*1. Обновление сеанса: Обновление информации о текущем сеансе пользователя.
*2. Создание сеанса: Создание нового сеанса для пользователя после успешного входа.
*3. Удаление сеанса: Завершение текущего сеанса пользователя.
*4. Получение данных сеанса: Получение информации о текущем сеансе пользователя.

* Зависимости и связи с другими частями проекта
* Маршруты: Эти контроллеры будут использоваться в соответствующих маршрутах для обновления и создания сессий.
* Сервисы: services/session.service.ts содержит функции createSession и updateSession, которые взаимодействуют * с базой данных.
* Утилиты: utils/clientInfo.server.ts содержит функцию getClientInfo, которая извлекает информацию о клиенте.
* Модели: models/user.model.ts содержит функцию findUserByEmail для поиска пользователя по email.
* Типы: Тип Session импортируется из types.ts и используется в типизации данных сессии.
*/

import { LoaderFunction, ActionFunction, redirect, json } from '@remix-run/node';
import * as bcrypt from "bcrypt"

import { createSession, updateSession, killSession, getSession, getSessionCustomer } from '../services/session.service';
import { getClientInfo } from '../utils/clientInfo.server';
import { findUserByEmail } from '../models/user.model';
import { requireAuth } from '../middlewares/auth.middleware';
import type { Session } from '../types';

// Helper function to validate session data
function validateSessionData(data: Omit<Session, 'id'>): Session | null {
  // Add validation logic here
  if (!data.customerId ||!data.ipAddress ||!data.userAgent ||!data.loginTime ||!data.isActive ||!data.sessionType ||!data.expiresAt ||!data.createdAt ||!data.updatedAt ||!data.token) {
    return null;
  }
  return data as Session;
}

// 1. Контроллер для обновления сессии
export const updateSessionLoader: LoaderFunction = async (args) => {
    try {
      const authResult = await requireAuth(args);
    if (authResult) {
      return authResult;
    }

    const { request } = args;
    const formData = await request.formData();
    const sessionData = validateSessionData({
      customerId: Number(formData.get("customerId")),
      ipAddress: formData.get("ipAddress")?.toString()?? '',
      userAgent: formData.get("userAgent")?.toString()?? '',
      loginTime: new Date(formData.get("loginTime")?.toString()?? ''),
      logoutTime: formData.get("logoutTime")? new Date(formData.get("logoutTime")?.toString()?? '') : undefined,
      duration: formData.get("duration")? Number(formData.get("duration")) : undefined,
      isActive: formData.get("isActive") === 'true',
      sessionType: formData.get("sessionType")?.toString()?? '',
      expiresAt: formData.get("expiresAt")? new Date(formData.get("expiresAt")?.toString()?? '') : undefined,
      createdAt: new Date(formData.get("createdAt")?.toString()?? ''),
      updatedAt: new Date(formData.get("updatedAt")?.toString()?? ''),
      token: formData.get("token")?.toString()?? '',
    });

    if (!sessionData) {
      return json({ error: 'Invalid session data' }, { status: 400 });
    }

    await updateSession(sessionData);

    return json({ success: true, message: 'Session updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating session:', error);
    return json({ success: false, error: 'Failed to update session' }, { status: 500 });
  }
};


// 2. Контроллер для создания сессии
export const action: ActionFunction = async ({ request }) => {
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

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return json({ error: 'Invalid password' }, { status: 401 });
    }
    
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return json({ error: 'Token not provided' }, { status: 401 });
    }

    const clientInfo = getClientInfo(request);
    const sessionData = {
      customerId: user.id,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      loginTime: new Date(),
      isActive: true,
      sessionType: 'regular', // Example session type
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day expiration
      createdAt: new Date(),
      updatedAt: new Date(),
      token: token,
    };

    const result = await createSession(sessionData);

    if (result) {
      return redirect('/dashboard', {
        headers: result.headers,
      });
    } else {
      return json({ error: 'Failed to create session' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating session:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

// Пример для маршрутизации, редирект на логин страницу
export const loader: LoaderFunction = async () => {
  return redirect('/login', { headers: { 'Cache-Control': 'no-store' } });
};

// 3. Контроллер для удаления сессии
export const deleteSessionAction: ActionFunction = async (args) => {
    try {
      const authResult = await requireAuth(args);
    if (authResult) {
      return authResult;
    }

    const { request } = args;
    const session = await getSession(request.headers.get('Cookie'));
    const sessionId = session.get('sessionId');

    if (!sessionId) {
      return json({ error: 'No session found' }, { status: 400 });
    }

    await killSession(sessionId);

    return redirect('/login', {
      headers: {
        "Set-Cookie": await sessionStorage.killSession(session),
      },
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    return json({ error: 'Failed to delete session' }, { status: 500 });
  }
};

// 4. Контроллер получения данных сессии

export const getSessionData: ActionFunction = async (args) => {
    try {
      const authResult = await requireAuth(args);
      if (authResult) {
        return authResult;
      }
      
      const { request } = args;
    // Получаем идентификатор сессии из заголовка Cookie
    const session = await getSession(request.headers.get('Cookie'));
    const sessionId = session.get('sessionId');

    // Если идентификатор сессии не найден, возвращаем ошибку
    if (!sessionId) {
      return json({ error: 'No session found' }, { status: 400 });
    }

    // Получаем данные сессии по идентификатору
    //const sessionData: Session | null = await getSessionCustomer(sessionId);
    const sessionData = await getSessionCustomer(sessionId);

    // Если данные сессии не найдены, возвращаем ошибку
    if (!sessionData) {
      return json({ error: 'Session not found' }, { status: 404 });
    }

  // Проверяем, если sessionData не равен null и содержит поле customerId
    if ('customerId' in sessionData) {
      // Возвращаем успешный результат с данными сессии
      return json({ success: true, data: sessionData }, { status: 200 });
    } else {
      // В случае, если sessionData не содержит поле customerId, возможно, там произошла ошибка
      return json({ error: 'Invalid session data' }, { status: 500 });
    }
  } catch (error) {
    // В случае ошибки возвращаем ошибку сервера
    console.error('Error retrieving session data:', error);
    return json({ error: 'Failed to retrieve session data' }, { status: 500 });
  }
};
