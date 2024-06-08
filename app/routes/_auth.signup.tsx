import { Form } from '@remix-run/react';

const Register = () => {
  return (
    <div>
      <h1>Register</h1>
      <Form method="post" action="/auth/register">
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" name="email" id="email" required />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" name="password" id="password" required />
        </div>
        <button type="submit">Register</button>
      </Form>
      <a href="/google">Register with Google</a>
    </div>
  );
};

export default Register;

// import { ActionFunction, json, redirect } from '@remix-run/node';
// import { useActionData, Form } from '@remix-run/react';
// import * as authService from '../../services/auth.service';

// export let action: ActionFunction = async ({ request }) => {
//   let formData = await request.formData();
//   let email = formData.get("email");
//   let password = formData.get("password");

//   try {
//     await authService.register({ email, password });
//     return redirect('/login');
//   } catch (error) {
//     return json({ error: error.message }, { status: 400 });
//   }
// };

// export default function Register() {
//   let actionData = useActionData();
//   return (
//     <div>
//       <h1>Register</h1>
//       <Form method="post">
//         <div>
//           <label>Email: <input type="email" name="email" /></label>
//         </div>
//         <div>
//           <label>Password: <input type="password" name="password" /></label>
//         </div>
//         <button type="submit">Register</button>
//       </Form>
//       {actionData?.error && <p>{actionData.error}</p>}
//     </div>
//   );
// }