import React, { useState } from 'react';
import { json, LoaderFunction, redirect } from '@remix-run/node';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from '@remix-run/react';
import { useActionData } from '@remix-run/react';

import { LoginForm } from '~/types';

const AdminLoginPage: React.FC<{ error?: string }> = ({ error: initialError }) => {
  const { t } = useTranslation();
  const actionData = useActionData<{ error?: string}>();
  const { isAdminLoggedIn } = useLoaderData() as { isAdminLoggedIn: boolean };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData: LoginForm = { email, password };

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        window.location.href = '/admin/dashboard';
      } else {
        const data = await response.json();
        setFormError(data.error || t('admin.login.error'));
      }
    } catch (error) {
      console.error(t('admin.login.error2'), error);
      setFormError(t('admin.login.error3'));
    }
  };

  if (isAdminLoggedIn) {
    return <p>You are already logged in as an admin.</p>;
  }

  return (
    <div>
      <h1>{t('admin.login.title')}</h1>
      {formError && <p style={{ color: 'red' }}>{formError}</p>}
      <form onSubmit={handleLogin} method="post">
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>{t('admin.login.passwordLaber')}</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">{t('admin.login.submitButton')}</button>
      </form>
    </div>
  );
};

export default AdminLoginPage;


// import React, { useState } from 'react';
// import { json, LoaderFunction, redirect } from '@remix-run/node';
// import { useTranslation } from 'react-i18next'
// import { useLoaderData } from '@remix-run/react';

// import { AdminLoginPageProps } from "~/types"


// export const loader: LoaderFunction = async ({ request }) => {
//   // Проверка, если администратор уже вошел в систему, перенаправляем его на главную страницу администратора

//   if (request.locals.isAdminLoggedIn) {
//     return redirect('/admin/dashboard');
//   }

//   return json({ isAdminLoggedIn: false });
// };

// const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ error, isAdminLoggedIn }) => {
//   const { t } = useTranslation()

//   //const { isAdminLoggedIn } = useLoaderData() as { isAdminLoggedIn: boolean };
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [errorMessage, setErrorMessage] = useState<string | null>( error || null);

//   const handleLogin = async () => {
//     try {
//       // Здесь должен быть код для отправки запроса на сервер для аутентификации администратора
//       // После успешной аутентификации, перенаправляем администратора на главную страницу администратора
//       // Предположим, что мы используем fetch API для отправки запроса на сервер
//       const response = await fetch('/api/admin/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       if (response.ok) {
//         // Администратор успешно аутентифицирован, перенаправляем его на главную страницу администратора
//         window.location.href = '/admin/dashboard';
//       } else {
//         // Если запрос не удался, показываем ошибку
//         setErrorMessage(t('admin.login.error'));
//       }
//     } catch (error) {
//       console.error(t('admin.login.error2'), error);
//       setErrorMessage(t('admin.login.error3'));
//     }
//   };

//   return (
//     <div>
//       <h1>{t('admin.login.title')}</h1>
//       {error && <p style={{ color: 'red' }}>{errorMessage}</p>}
//       <form onSubmit={(e) => { e.preventDefault(); handleLogin() }} method="post">
//         <div>
//           <label>Email:</label>
//           <input 
//             type="email"
//             name="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//            />
//         </div>
//         <div>
//           <label>{t('admin.login.passwordLaber')}</label>
//           <input 
//             type="password"
//             name="password" 
//             value={password} 
//             onChange={(e) => setPassword(e.target.value)}
//           />
//         </div>
//         <button type="submit">{t('admin.login.submitButton')}</button>
//       </form>
//     </div>
//   );
// };

// export default AdminLoginPage;
