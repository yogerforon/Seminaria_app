/*
1. createSession: Создает новую сессию.
2. verifySession, isSession: Проверка наличия сессии клиента.
3. getSession: Получает текущую сессию клиента.
4. destroySession: Уничтожает сессию клиента.
5. updateSession: Обновляет сессию клиента.
*/

import { createCookieSessionStorage} from "@remix-run/node"

import { createToken, verifyToken } from '../utils/paseto.server';
import { db } from "../utils/db.server"
import { Session } from "../types"



// Проверка наличия секретного ключа для сессий
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

// Создаем хранилище сессий с куки
export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "seminaria_session",
      secrets: [process.env.SESSION_SECRET as string],
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 день
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })

/**
 * 1.
 * Создает новую сессию.
 * @param sessionData Данные сессии без идентификатора
 * @returns Заголовки с установленной куки сессии или null в случае ошибки
 * Дополнительные пояснения:
* sessionStorage.getSession(): Загружает текущую сессию.
* session.set("sessionToken", token): Устанавливает сессионный токен.
* sessionStorage.commitSession(session): Коммитит сессию и создает заголовок Set-Cookie.
* Этот код позволит вам создать сессию, сохранить ее в базе данных и вернуть заголовок Set-Cookie, чтобы установить сессионный токен на стороне клиента.
 */

export async function createSession(sessionData: Omit<Session, 'id'>): Promise<{ session: Session, headers: { "Set-Cookie": string } } | null> {
  try {
    const session = await sessionStorage.getSession();
    session.set("customerId", sessionData.customerId);

    const createdSession = await db.session.create({
      data: {
        ...sessionData,
       },
    });
    
    const token = await createToken({
      ...sessionData,
      id: createdSession.id,
    });

    // Обновляем сессию с токеном
    const updatedSession = await db.session.update({
      where: { id: createdSession.id },
      data: { token },
    });

    // Установка токена в куки
    session.set("sessionToken", token);

    return {
      session: {
        ...updatedSession,
        token, // Добавляем токен в сессию
      },
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    };

  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }
}

/*
* 2. Проверка наличия сессии
*/
export async function verifySession(token: string): Promise<Session | null> {
  try {
    const sessionData = await verifyToken(token);

    if (isSession(sessionData)) {
      const session = await db.session.findUnique({
        where: { id: sessionData.id },
      });

      if (session && session.token === token) {
        return session;
      }
    }
      return null;
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}

// Функция для проверки соответствия объекта типу Session
export function isSession(data: unknown): data is Session {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const session = data as Session;
  return (
    typeof session === 'object' &&
    typeof session.id === 'number' &&
    typeof session.customerId === 'number' &&
    session.loginTime instanceof Date &&
    typeof session.isActive === 'boolean' &&
    typeof session.ipAddress === 'string' &&
    typeof session.userAgent === 'string' &&
    (session.logoutTime === null || session.logoutTime instanceof Date) &&
    (session.duration === null || typeof session.duration === 'number') &&
    (session.sessionType === null || typeof session.sessionType === 'string') &&
    (session.expiresAt === null || session.expiresAt instanceof Date) &&
    session.createdAt instanceof Date &&
    session.updatedAt instanceof Date &&
    typeof session.token === 'string'
  );
}


/**
 * 3.
 * Получает текущую сессию клиента.
 * @param request HTTP запрос
 * @returns Данные клиента или null, если сессия не найдена или истекла
 */
export async function getSessionCustomer(request: Request): Promise<{ customerId: number } | null> {
  try {
    const cookie = request.headers.get("Cookie")
    const session = await sessionStorage.getSession(cookie)
    const customerId = session.get("customerId")

    if (!customerId) return null

    const userSession = await db.session.findUnique({
      where: { id: session.get("id") },
      include: { customer: true },
    })

    if (!userSession) return null
    if (userSession.expiresAt && userSession.expiresAt < new Date()) {
      await killSession(request);
      return null
    }

    return { customerId: userSession.customerId }
  } catch (error) {
    console.error('Error getting session customer:', error)
    throw new Error('Failed to get session customer');
  }
}

/** 4.
 * Уничтожает сессию клиента.
 * @param request HTTP запрос
 * @returns Заголовки с удаленной куки сессии или пустую куки в случае ошибки
 */
export async function killSession(request: Request): Promise<{ headers: { "Set-Cookie": string } }> {
  try {
    const cookie = request.headers.get("Cookie");
    const session = await sessionStorage.getSession(cookie);
    const customerId = session.get("customerId");

    if (customerId) {
      const existingSession = await db.session.findFirst({ where: { customerId: customerId as number } });
      if (existingSession) {
        await db.session.delete({ where: { id: existingSession.id } });
      }
    }

    return {
      headers: {
        "Set-Cookie": await sessionStorage.destroySession(session),
      },
    }
  } catch (error) {
    console.error('Error destroying session:', error)
    
    return {
      headers: {
        "Set-Cookie": "",
      },
    }
  }
}

/** 5.
 * Обновляет данные текущей сессии в базе данных и обновляет куки сессии.
 * @param sessionData Новые данные сессии, за исключением идентификатора.
 * @returns Заголовки с обновленной куки сессии или null в случае ошибки.
 * @throws {Error} Если идентификатор сессии отсутствует или возникает ошибка при обновлении сессии.
 */
export async function updateSession(sessionData: Omit<Session, 'id'>): Promise<{ headers: { "Set-Cookie": string } } | null>{
  const session = await sessionStorage.getSession(undefined);
  const sessionId = session.get('sessionId');
  
  if (!sessionId) {
    throw new Error('No sessionId in session');
  }

  try {
    await db.session.update({
      where: { id: sessionId },
      data: sessionData,
    });

      return {
        headers: {
          "Set-Cookie": await sessionStorage.commitSession(session),
        },
      };
  } catch (error) {
    console.error('Error updating session:', error);
    throw new Error('Failed to update session');
  }
}