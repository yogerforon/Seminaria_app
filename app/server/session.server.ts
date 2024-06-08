/*
1. createSession: Создает новую сессию.
2. getSessionCustomer: Получает текущую сессию клиента.
3. killSession: Уничтожает сессию клиента.
4. updateSession: Обновляет сессию клиента.

1. register: Регистрирует нового клиента.
2. login: Аутентифицирует клиента.
3. getCustomer: Получает данные клиента.
4. requireCustomer: Проверяет и получает данные клиента.
5. logout: Выходит из системы.
6. resetPassword: Сброс пароля
7. updateCustomerData: Изменение данных пользователя
*/

import * as bcrypt from "bcrypt"
import { createCookieSessionStorage, redirect } from "@remix-run/node"
import { Customer } from '@prisma/client';

import { db } from "../utils/db.server"
import { Session } from "../types"

export type LoginForm = {
  email: string
  password: string
}


/**
 * 1.
 * Регистрирует нового клиента.
 * @param loginForm Данные для входа (email и пароль)
 * @returns Новый клиент или ошибка
 */

export async function register({ email, password }: LoginForm) {
  try {
    const hashedPasword = await bcrypt.hash(password, 10);
    return await db.customer.create({
      data: { email, password: hashedPasword },
    })
  } catch (error) {
    console.error('Error during registration:', error);
    throw new Error('Registration failed');
  }
}

/**
 * 5.
 * Аутентифицирует клиента.
 * @param loginForm Данные для входа (email и пароль)
 * @returns Клиент или null, если аутентификация не удалась
 */

export async function login({ email, password }: LoginForm) {
  try {
    const customer = await db.customer.findUnique({ where: { email } });
    if (!customer) return null
    
    
    const isCorrectPassword = await bcrypt.compare(password, customer.password);
    if (!isCorrectPassword) return null

    return customer
  } catch (error) {
    console.error('Error during login:', error);
    throw new Error('Login failed');
}
}

/**
 * 6.
* Получает данные клиента.
* @param request HTTP запрос
* @returns Данные клиента или null
*/

export async function getCustomer(request: Request) {
  try {
    const session = await getSessionCustomer(request)
    if (!session) return null

    return db.customer.findUnique({ where: { id: session.customerId } })
  } catch (error) {
    console.error('Error getting customer:', error);
    throw new Error('Failed to retrieve customer data');
  }
}

/**
 * 7.
 * Проверяет и получает данные клиента.
 * @param request HTTP запрос
 * @returns Данные клиента или перенаправление на страницу входа
 */

export async function requireCustomer(request: Request) {
  try {
    const session = await getSessionCustomer(request)
    if (!session) throw redirect("/login")

    const customer = await db.customer.findUnique({ where: { id: session.customerId } })
    if (!customer) throw redirect("/login")

    return customer
  } catch (error) {
    console.error('Error requiring customer:', error);
    throw new Error('Customer authentication failed');
  }
}

/**
 * 8.
 * Выходит из системы.
 * @param request HTTP запрос
 * @returns Перенаправление на страницу входа с удаленной куки сессии
 */

export async function logout(request: Request) {
  try {
    const cookie = request.headers.get("Cookie");
    const session = await sessionStorage.getSession(cookie);
    return redirect("/login", {
      headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
    })
  } catch (error) {
    console.error('Error during logout:', error);
    throw new Error('Logout failed');
  }
}

/**
 * 9.
* Сбрасывает пароль.
* @param email E-mail клиента
* @param newPassword Новый пароль
*/
export async function resetPassword(email: string, newPassword: string): Promise<void> {
  try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.customer.update({
          where: { email },
          data: { password: hashedPassword }
      });
  } catch (error) {
      console.error('Error resetting password:', error);
      throw new Error('Password reset failed');
  }
}

/**
 * 10.
* Изменяет данные пользователя.
* @param customerId Идентификатор клиента
* @param newData Новые данные клиента
*/
export async function updateCustomerData(customerId: number, newData: Partial<Customer>): Promise<void> {
  try {
      await db.customer.update({
          where: { id: customerId },
          data: newData
      });
  } catch (error) {
      console.error('Error updating customer data:', error);
      throw new Error('Failed to update customer data');
  }
}