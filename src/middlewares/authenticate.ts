import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { type IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

export async function authenticate(req:Request, res:Response, next:NextFunction): Promise<void> {
  const token = req.cookies.token;

  if(!token) {
    const error = new Error('No autorizado');
    res.status(401).json({error: error.message})
    return;
  };

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    if (typeof decoded === 'object' && decoded.id) {
      const user = await User.findById(decoded.id).select('_id name email')

      if (user) {
        req.user = user;

        next();
      } else {
        res.status(500).json({error: 'No autorizado'})
      }
    }
  } catch (error) {
    res.status(500).json({error: 'Error al autenticar'})
  }
}