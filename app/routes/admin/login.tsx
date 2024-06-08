import { ActionFunction, json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";

import AdminLoginPage from "~/components/admin/AdminLoginPage";
import { login } from "~/services/admin.service";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (typeof email !== "string" || typeof password !== "string") {
    return json({ error: "Invalid form data" }, { status: 400 });
  }

  try {
    const { token, admin } = await login({ email, password })
    return redirect("/admin/dashboard", { headers: { 'Set-Cookie': `token=${token}; HttpOnly; Path=/`,} });
    if (!admin ) {
      return json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Redirect to the admin dashboard after successful login
    return redirect("/admin/dashboard", { headers: {} });
  } catch (error) {
    console.error("Error during admin login:", error);
    return json({ error: "Login failed" }, { status: 500 });
  }
};

export default function AdminLoginRoute() {
  const actionData = useActionData<{ isAdminLoggedIn: boolean; error?: string }>();
  return <AdminLoginPage error={actionData?.error} />;
}



// import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
// import { useActionData } from '@remix-run/react';
// import { useTranslation } from 'react-i18next'; // Импортируем хук для локализации

// import AdminLoginPage from '~/components/admin/AdminLoginPage'
// //import { authenticateAdmin } from '~/services/admin.service';


// export let loader: LoaderFunction = async ({ context }) => {
//    // Add any loader logic here if necessary
//   // Логика загрузки данных, если необходимо
//   // Проверка, если администратор уже вошел в систему, перенаправляем его на главную страницу администратора
//   const isAdminLoggedIn = true; // Предположим, что мы получили это значение из базы данных или другого источника
//   return {
//     data: { isAdminLoggedIn },
//   }
// };


// export let action: ActionFunction = async ({ request }) => {
//   const { t } = useTranslation()

//   const formData = await request.formData();
//   const email = formData.get('email');
//   const password = formData.get('password');

//   if (typeof email !== 'string' || typeof password !== 'string') {
//     return json({ error: 'Invalid form data' }, { status: 400 });
//   }

//   const admin = await authenticateAdmin(email, password);
//   if (!admin) {
//     return json({ error: 'Invalid email or password' }, { status: 401 });
//   }

//   // Redirect to the admin dashboard after successful login
//   return redirect('/admin/dashboard');
// };

// export default function AdminLoginRoute() {
//   const actionData = useActionData();
//   return <AdminLoginPage error={actionData?.error} isAdminLoggedIn={actionData?.isAdminLoggedIn} />;
// }