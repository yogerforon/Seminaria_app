import { LoaderFunction } from "@remix-run/node";
import { setupAuthenticator, setupGoogleOAuth } from "~/services/auth.service"; // Подключаем наш passport

export const loader: LoaderFunction = async ({ request }) => {
    setupGoogleOAuth(); // Настройка Google OAuth стратегии
    let authenticator = setupAuthenticator();
    return authenticator.authenticate("google", request, {
    successRedirect: "/dashboard", // Успешная аутентификация перенаправит на /dashboard
    failureRedirect: "/login",     // При неудачной аутентификации перенаправит на /login
  });
};