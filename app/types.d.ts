import { Session } from './types';

// Расширение интерфейса Request для добавления session
declare module '@remix-run/node' {
  interface Request {
    session?: Session;
  }
}