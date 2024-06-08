import { ActionFunction, json } from "@remix-run/node"

import { db } from "~/utils/db.server"
import { sessionStorage } from "~/services/session.service"

export const action: ActionFunction = async ({ request }) => {
  const sessionData = await request.json()

  try {
    const session = await sessionStorage.getSession()
    session.set("customerId", sessionData.customerId)
    await db.session.create({ data: sessionData })

    const setCookie = await sessionStorage.commitSession(session)
    return json({ setCookie })
  } catch (error) {
    console.error('Error creating session:', error)
    return json({ success: false }, { status: 500 })
  }
}