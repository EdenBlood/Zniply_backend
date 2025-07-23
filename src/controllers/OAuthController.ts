import { Request, Response } from "express";
import { generateJWT } from "../utils/jwt";

export default class OAuthController {
  static getGoogleCallback = async (req: Request, res: Response) => {
    const token = generateJWT({ id: req.user._id.toString() });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false, // true en producción con HTTPS
        sameSite: "lax", // o 'none' si usás subdominios distintos con HTTPS
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .redirect(`${process.env.FRONTEND_URL2}/oauth-callback`);
  };

  static getGithubCallback = async (req: Request, res: Response) => {
    const token = generateJWT({ id: req.user._id.toString() });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false, // true en producción con HTTPS
        sameSite: "lax", // o 'none' si usás subdominios distintos con HTTPS
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .redirect(`${process.env.FRONTEND_URL2}/oauth-callback`);
  };
}
