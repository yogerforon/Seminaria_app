import { json, redirect } from "@remix-run/node";

import { generateToken } from "~/utils/jwt.server";
import * as adminService from "../services/admin.service";
import { Session } from "../types";

export const adminLogin = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const admin = await adminService.login({ email, password });
    if (!admin) {
      return json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = generateToken({ userId: admin.id, role: "ADMIN" });

    return redirect("/admin/dashboard", {
      headers: {
        'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60}` // 1 hour expiration
      }
    });
    // const sessionData: Omit<Session, "id"> = {
    //   customerId: admin.id,
    //   role: "ADMIN",
    //   loginTime: new Date(),
    //   isActive: true,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // };

    // const session = await adminService.createSession(sessionData);
    // if (!session) {
    //   return json({ error: "Session creation failed" }, { status: 500 });
    // }

    // return redirect("/admin/dashboard", { headers: session.headers });
  } catch (error) {
    console.error("Error during admin login:", error);
    return json({ error: "Login failed" }, { status: 500 });
  }
};



// import { Request, Response } from 'express';
// import * as adminService from '../services/admin.service';

// export async function getAdminDashboard(req: Request, res: Response) {
//   try {
//     const data = await adminService.getDashboardData();
//     res.status(200).json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }

// export async function manageUsers(req: Request, res: Response) {
//   try {
//     const users = await adminService.getAllUsers();
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }

// export async function updateSettings(req: Request, res: Response) {
//   try {
//     const updatedSettings = await adminService.updateSettings(req.body);
//     res.status(200).json(updatedSettings);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }
