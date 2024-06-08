import { V3 } from 'paseto';
import { createPrivateKey, createPublicKey } from 'crypto';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Загрузка ключей из файлов
const privateKeyPath = process.env.PRIVATE_KEY_PATH;
const publicKeyPath = process.env.PUBLIC_KEY_PATH;

if (!privateKeyPath || !publicKeyPath) {
  throw new Error('Key paths must be defined in .env file');
}

const privateKey = createPrivateKey({
  key: fs.readFileSync(path.resolve(privateKeyPath), 'utf-8'),
  format: 'pem',
});

const publicKey = createPublicKey({
  key: fs.readFileSync(path.resolve(publicKeyPath), 'utf-8'),
  format: 'pem',
});

// Создание токена
export async function createToken(payload: Record<string, unknown>): Promise<string> {
  return await V3.sign(payload, privateKey);
}

// Проверка токена
export async function verifyToken(token: string): Promise<Record<string, unknown>> {
  try {
    const payload = await V3.verify(token, publicKey);
    return payload as Record<string, unknown>;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
