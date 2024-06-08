import { Form, useNavigation, useActionData } from '@remix-run/react';
import { useLoaderData } from "@remix-run/react";
import type {
    ActionFunctionArgs,
    LoaderFunctionArgs,
  } from "@remix-run/node"; 

interface LoginFormProps {
  error?: string
}

interface ActionData {
    error?: string; // Свойство error может быть строкой или не существовать вообще
    // Другие свойства, которые могут быть в actionData
  }

  export async function loader({
    request,
}: LoaderFunctionArgs) {}

  //const LoginForm: React.FC<LoginFormProps> = ({ error }) => {
    export default  function LoginForm() {
    const { error } = useLoaderData<typeof loader>();   
  const transition = useNavigation();
  const actionData = useActionData<ActionData>();

  return (
    <Form method="post">
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {actionData?.error && <p style={{ color: 'red' }}>{actionData.error}</p>}
      <div>
        <label htmlFor="email">Email:</label>
        <input type="email" name="email" id="email" required />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input type="password" name="password" id="password" autoComplete="current-password" required />
      </div>
      <div>
        <button type="submit" disabled={transition.state === 'submitting'}>
          {transition.state === 'submitting' ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </Form>
  );
};

//export default LoginForm;