import { LoaderFunction, redirect } from '@remix-run/node';
import { verifyToken } from '~/utils/jwt.server';

export const authMiddleware: LoaderFunction = async ({ request }) => {
  const token = request.headers.get('Cookie')?.split('token=')[1];

  if (!token) {
    return redirect('/admin/login');
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') {
    return redirect('/admin/login');
  }

  return decoded; // Возвращаем декодированные данные токена, если все ок
};