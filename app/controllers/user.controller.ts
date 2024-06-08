// app/controllers/user.controller.ts

import { Request, Response } from 'express';
import * as userService from '../services/user.service';

export async function getCustomer(req: Request, res: Response) {
  try {
    const customer = await userService.getCustomer(req);
    if (customer) {
      res.status(200).json(customer);
    } else {
      res.status(404).json({ error: 'Customer not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function requireCustomer(req: Request, res: Response) {
  try {
    const customer = await userService.requireCustomer(req);
    if (customer) {
      res.status(200).json(customer);
    }
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
