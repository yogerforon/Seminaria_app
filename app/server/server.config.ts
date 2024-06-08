import { createCookieSessionStorage } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import express from 'express';
import { SERVER_PORT, SERVER_HOST, db, sessionStorage } from './server.config';
import * as dotenv from 'dotenv';
import { DATABASE_CONFIG, SESSION_CONFIG, AUTH_CONFIG, MAIL_CONFIG } from './server.config';

dotenv.config();

// Конфигурация базы данных
export const db = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Уровни логирования
});

// Секреты для сессий и JWT
export const SESSION_SECRET = process.env.SESSION_SECRET || "default_session_secret";
export const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be set");
}

// Конфигурация сессий
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: [SESSION_SECRET],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 неделя
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
});

// Параметры сервера
export const SERVER_PORT = process.env.PORT || 3000;
export const SERVER_HOST = process.env.HOST || "localhost";

// Логирование
export const LOG_LEVEL = process.env.LOG_LEVEL || "info";

// Другие конфигурации
export const ENABLE_CACHE = process.env.ENABLE_CACHE === "true";
export const CACHE_TTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL, 10) : 3600; // В секундах

export const OAUTH_CONFIG = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID || "",
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
  },
  // Другие OAuth провайдеры...
};

const app = express();

app.listen(SERVER_PORT, () => {
  console.log(`Server is running at http://${SERVER_HOST}:${SERVER_PORT}`);
});

// Использование Prisma клиент
db.customer.findMany().then(customers => {
  console.log(customers);
});


// Параметры конфигурации для базы данных
const DATABASE_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'mydatabase',
  };
  
  // Параметры конфигурации для сессий
  const SESSION_CONFIG = {
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    cookieName: 'session_cookie',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  };
  
  // Параметры конфигурации для аутентификации
  const AUTH_CONFIG = {
    saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10),
    jwtSecret: process.env.JWT_SECRET || 'jwtsecret',
    tokenExpiry: '1h',
  };
  
  // Параметры конфигурации для почты (например, для отправки писем при сбросе пароля)
  const MAIL_CONFIG = {
    host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.MAIL_PORT || '2525', 10),
    user: process.env.MAIL_USER || 'user',
    pass: process.env.MAIL_PASS || 'password',
    from: process.env.MAIL_FROM || 'no-reply@example.com',
  };
  
  export {
    DATABASE_CONFIG,
    SESSION_CONFIG,
    AUTH_CONFIG,
    MAIL_CONFIG,
  };

  console.log('Database Host:', DATABASE_CONFIG.host);
console.log('Session Secret:', SESSION_CONFIG.secret);
console.log('JWT Secret:', AUTH_CONFIG.jwtSecret);
console.log('Mail Host:', MAIL_CONFIG.host);