import { Request, Response } from 'express';
import { generateResetToken, updatePassword } from '../services/resetPassword.service';

// Контроллер для запроса на сброс пароля
export async function requestResetController(req: Request, res: Response) {
  const { email } = req.body;
  try {
    // Генерируем токен для сброса пароля и отправляем его по электронной почте
    await generateResetToken(email);
    // Возвращаем успешный ответ
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    // Обрабатываем ошибку сервера и отправляем соответствующий ответ
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Контроллер для сброса пароля
export async function resetPasswordController(req: Request, res: Response) {
  const { token, newPassword } = req.body;
  try {
    // Обновляем пароль с использованием предоставленного токена сброса пароля
    await updatePassword(token, newPassword);
    // Возвращаем успешный ответ
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    // Обрабатываем ошибку сервера и отправляем соответствующий ответ
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
