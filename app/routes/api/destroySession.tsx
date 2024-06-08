import { ActionFunction, json } from "@remix-run/node"

import { db } from "~/utils/db.server";
import { sessionStorage } from "~/services/session.service";

export const action: ActionFunction = async ({ request }) => {
  try {
    const cookie = request.headers.get("Cookie");
    const session = await sessionStorage.getSession(cookie);
    const customerId = session.get("customerId");

    if (customerId) {
      await db.session.updateMany({
        where: { customerId, isActive: true },
        data: { isActive: false, logoutTime: new Date() },
      });
    }

    const setCookie = await sessionStorage.destroySession(session);
    return json({ setCookie });
  } catch (error) {
    console.error('Error destroying session:', error);
    return json({ setCookie: "" }, { status: 500 });
  }
};
