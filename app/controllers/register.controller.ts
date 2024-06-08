import { Request, Response } from 'express';
import { registerService } from '../services/auth.service';
import { createSession } from '../services/session.service';

// Контроллер для регистрации нового пользователя
export async function registerController(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    // Вызываем сервис для регистрации пользователя
    const newUser = await registerService(email, password);
    
    // Если регистрация успешна, создаем сессию для нового пользователя
    if (newUser) {
      const session = await createSession(newUser.id);
      
      // Отправляем куку с идентификатором сессии
      res.cookie('session_id', session.id, { httpOnly: true });
      
      // Возвращаем успешный ответ и информацию о пользователе
      res.status(201).json({ message: 'Registration successful', user: newUser });
    } else {
      // В случае неудачи отправляем сообщение об ошибке
      res.status(400).json({ message: 'Registration failed' });
    }
  } catch (error) {
    // Обрабатываем ошибку сервера и отправляем соответствующий ответ
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
