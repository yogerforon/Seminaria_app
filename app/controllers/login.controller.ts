import { Request, Response } from 'express';
import { loginService, registerService, forgotPasswordService, resetPasswordService, logoutService } from '../services/auth.service';
import { createSession, destroySession } from '../services/session.service';

// Контроллер для входа в систему
export async function loginController(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const user = await loginService(email, password);
    if (user) {
      const session = await createSession(user.id);
      res.cookie('session_id', session.id, { httpOnly: true });
      res.status(200).json({ message: 'Login successful', user });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Контроллер для регистрации
export async function registerController(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const newUser = await registerService(email, password);
    if (newUser) {
      const session = await createSession(newUser.id);
      res.cookie('session_id', session.id, { httpOnly: true });
      res.status(201).json({ message: 'Registration successful', user: newUser });
    } else {
      res.status(400).json({ message: 'Registration failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Контроллер для сброса пароля
export async function forgotPasswordController(req: Request, res: Response) {
  const { email } = req.body;
  try {
    const result = await forgotPasswordService(email);
    res.status(200).json({ message: 'Password reset email sent', result });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Контроллер для сброса пароля
export async function resetPasswordController(req: Request, res: Response) {
  const { token, newPassword } = req.body;
  try {
    const result = await resetPasswordService(token, newPassword);
    if (result) {
      res.status(200).json({ message: 'Password reset successful' });
    } else {
      res.status(400).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Контроллер для выхода из системы
export async function logoutController(req: Request, res: Response) {
  const sessionId = req.cookies.session_id;
  try {
    await destroySession(sessionId);
    res.clearCookie('session_id');
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
