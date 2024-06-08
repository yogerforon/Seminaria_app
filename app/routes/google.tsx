// routes/auth/google.tsx
import { LoaderFunction } from '@remix-run/node';
import { setupGoogleOAuth } from '~/services/auth.service';
import { redirect } from '@remix-run/node';

export const loader: LoaderFunction = async ({ request }) => {
  setupGoogleOAuth();
  return redirect('/google/callback');
};
