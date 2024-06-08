import { LoaderFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useTranslation } from 'react-i18next';
import { getSession } from '@remix-run/session'
import { JwtPayload } from 'jsonwebtoken'


import { authMiddleware } from '~/middlewares/authMiddleware'
import Dashboard from '~/components/admin/Dashboard'
import { db } from '~/utils/db.server'
import { verifyToken } from '~/utils/jwt.server';

import withTranslation from '~/hoc/withTranslation';

export const loader: LoaderFunction = async (args) => {
  //const session = await getSession(request.headers.get('Cookie'));
  //const userId = session.get('userId');
  const authResult = await authMiddleware(args);
  if (authResult instanceof Response) {
    return authResult; // Редирект, если не авторизован
  }

  // Если авторизован, возвращаем данные
  return json({ user: authResult });
};
  
  //const token = request.headers.get('Cookie')?.split('token=')[1];

  //if (!userId) {
  //  return redirect('/admin/login');
 // }

  // const user = await db.customer.findUnique({ where: { id: userId } });

  // if (!user || user.role !== 'ADMIN') {
  //   return redirect('/admin/login');
  // }

  // if (!token) {
  //   return redirect('/admin/login');
  // }
  // const decoded = verifyToken(token);
  // if (!decoded || (decoded as JwtPayload).role!== 'ADMIN') {
  //   return redirect('/admin/login');
  // }

  // return json({});
// };

export default function AdminDashboardRoute() {
  const data = useLoaderData();
  return <Dashboard />;
}

// const AdminDashboard = () => {
//   const { t } = useTranslation()

//   return (
//     <div>
//       <h1>{t('adminDashboard.title')}</h1>
//       {/* Add more administrative components and data visualizations here */}
//     </div>
//   );
// };

// export default withTranslation(AdminDashboard);
