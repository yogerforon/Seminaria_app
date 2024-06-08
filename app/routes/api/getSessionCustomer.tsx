import { LoaderFunction, json } from "@remix-run/node"

import { db } from "~/utils/db.server"
import { sessionStorage } from "~/services/session.service"

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const cookie = request.headers.get("Cookie");
    const session = await sessionStorage.getSession(cookie);
    const customerId = session.get("customerId");

    if (!customerId) return json(null);

    const userSession = await db.session.findUnique({
      where: { id: session.get("id") },
      include: { customer: true },
    });

    if (!userSession || (userSession.expiresAt && userSession.expiresAt < new Date())) {
      if (userSession) {
        await db.session.delete({ where: { id: userSession.id } });
      }
      return json(null);
    }

    return json({ customerId: userSession.customerId });
  } catch (error) {
    console.error('Error getting session customer:', error);
    return json(null, { status: 500 });
  }
};
