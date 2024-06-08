import { LoaderFunction, redirect, useLoaderData } from "@remix-run/react";
import { getSessionCustomer } from "~/server/session.server";

export let loader: LoaderFunction = async ({ request }) => {
  const customer = await getSessionCustomer(request);
  if (!customer) return redirect("/login");
  return { customer };
};

export default function ProtectedRoute() {
  const { customer } = useLoaderData();
  return <div>Welcome, {customer.email}!</div>;
}