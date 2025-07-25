import type { Request, Response } from "express";
import User, { IUser, Provider } from "../models/User";
import Token, { IToken } from "../models/Token";
import { comparePassword, hashPassword } from "../utils/auth";
import { createToken } from "../utils/token";
import { Types } from "mongoose";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";
import { sanitizeInput } from "../utils/sanitize";

interface CreateAccountBody extends Pick<IUser, "name" | "password" | "email"> {
  password_repeat: IUser["password"];
}

interface ConfirmAccountBody {
  token: IToken["token"];
}

interface resendCodeBody {
  email: IUser["email"];
}

interface forgotPasswordBody {
  email: IUser["email"];
}

interface changePasswordBody {
  password: IUser["password"];
  password_repeat: IUser["password"];
}

interface forgotPasswordCodeBody {
  token: IToken["token"];
}

interface changePasswordParams {
  token: IToken["token"];
}

interface loginBody {
  email: IUser["email"];
  password: IUser["password"];
}

export class AuthController {
  static createAccount = async (
    req: Request<{}, {}, CreateAccountBody>,
    res: Response
  ) => {
    const { password, name, email } = req.body;
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedName = sanitizeInput(name);

    try {
      const userExist = await User.findOne({ email: sanitizedEmail });

      if (userExist && userExist.confirmed === false) {
        const error = new Error(
          "El email ya existe pero el usuario no esta confirmado, solicita un código de verificación"
        );
        res.status(409).json({ error: error.message });
        return;
      }

      if (userExist) {
        const error = new Error("El email ya esta registrado");
        res.status(403).json({ error: error.message });
        return;
      }

      //* hash password
      const passwordHashed = await hashPassword(password);
      const user = new User({
        password: passwordHashed,
        email: sanitizedEmail,
        name: sanitizedName,
        provider: Provider.CREDENTIALS,
      });

      //* create Token
      const token = new Token();
      token.token = createToken();
      token.user = user._id as Types.ObjectId;

      //* send mail
      await AuthEmail.sendConfirmationEmail({
        email: sanitizedEmail,
        name: sanitizedName,
        token: token.token,
      });

      //* Save data
      await Promise.all([user.save(), token.save()]);
      res.json({
        msg: "Hemos enviado un email con instrucciones para confirmar tu cuenta",
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  };

  static confirmAccount = async (
    req: Request<{}, {}, ConfirmAccountBody>,
    res: Response
  ) => {
    const { token } = req.body;
    const sanitizedToken = sanitizeInput(token);

    try {
      const tokenExist = await Token.findOne({ token: sanitizedToken });

      if (!tokenExist) {
        const error = new Error("Token no valido");
        res.status(404).json({ error: error.message });
        return;
      }

      const user = await User.findById(tokenExist.user);

      if (!user) {
        const error = new Error("Usuario no encontrado");
        res.status(404).json({ error: error.message });
        return;
      }

      if (user.confirmed) {
        const error = new Error("El usuario ya esta confirmado");
        res.status(403).json({ error: error.message });
        return;
      }

      user.confirmed = true;

      await Promise.all([user.save(), tokenExist.deleteOne()]);
      res.json({
        msg: "La cuenta ha sido confirmada, ya puedes iniciar sesión",
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  };

  static resendCode = async (
    req: Request<{}, {}, resendCodeBody>,
    res: Response
  ) => {
    const { email } = req.body;
    const sanitizedEmail = sanitizeInput(email);

    try {
      const userExist = await User.findOne({ email: sanitizedEmail });

      if (!userExist) {
        const error = new Error("Usuario no encontrado");
        res.status(404).json({ error: error.message });
        return;
      }

      if (userExist.confirmed) {
        const error = new Error("El usuario ya esta confirmado");
        res.status(403).json({ error: error.message });
        return;
      }

      const tokenExist = await Token.findOne({ user: userExist._id });

      if (tokenExist) {
        await tokenExist.deleteOne();
      }

      const token = new Token();
      token.token = createToken();
      token.user = userExist._id;

      await token.save();

      //* Send mail
      await AuthEmail.sendConfirmationEmail({
        email: sanitizedEmail,
        name: userExist.name,
        token: token.token,
      });

      res.json({
        msg: "Hemos enviado un email con instrucciones para confirmar tu cuenta",
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  };

  static forgotPassword = async (
    req: Request<{}, {}, forgotPasswordBody>,
    res: Response
  ) => {
    const { email } = req.body;
    const sanitizedEmail = sanitizeInput(email);
    try {
      const user = await User.findOne({ email: sanitizedEmail });

      if (!user) {
        const error = new Error("Usuario no encontrado");
        res.status(404).json({ error: error.message });
        return;
      }

      if (!user.confirmed) {
        const error = new Error(
          "El usuario no esta confirmado, Solicite un código de confirmación"
        );
        res.status(403).json({ error: error.message });
        return;
      }

      const tokenExist = await Token.findOne({ user: user._id });

      if (tokenExist) {
        await tokenExist.deleteOne();
      }

      //* creamos el token
      const token = new Token();
      token.token = createToken();
      token.user = user._id as Types.ObjectId;

      //* send mail
      await AuthEmail.sendPasswordResetToken({
        email: sanitizedEmail,
        name: user.name,
        token: token.token,
      });

      await token.save();
      res.json({
        msg: "Enviamos un email con instrucciones para cambiar el password",
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  };

  static forgotPasswordCode = async (
    req: Request<{}, {}, forgotPasswordCodeBody>,
    res: Response
  ) => {
    const { token } = req.body;
    const sanitizedToken = sanitizeInput(token);
    try {
      const tokenExist = await Token.findOne({ token: sanitizedToken });

      if (!tokenExist) {
        const error = new Error("El token expiro solicite uno nuevo");
        res.status(404).json({ error: error.message });
        return;
      }

      const user = await User.findById(tokenExist.user);

      if (!user) {
        const error = new Error("El usuario no existe");
        res.status(404).json({ error: error.message });
        return;
      }

      if (!user.confirmed) {
        const error = new Error(
          "El usuario no esta confirmado, Solicite un código de confirmación"
        );
        res.status(403).json({ error: error.message });
        return;
      }

      res.json({ msg: "Token Valido, cambie su password" });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  };

  static changePassword = async (
    req: Request<changePasswordParams, {}, changePasswordBody>,
    res: Response
  ) => {
    const { password } = req.body;
    try {
      const token = await Token.findOne({ token: req.params.token });

      if (!token) {
        const error = new Error("El token expiro solicite uno nuevo");
        res.status(404).json({ error: error.message });
        return;
      }

      const user = await User.findById(token.user);

      if (!user) {
        const error = new Error("El usuario no existe");
        res.status(404).json({ error: error.message });
        return;
      }

      if (!user.confirmed) {
        const error = new Error(
          "El usuario no esta confirmado, Solicite un código de confirmación"
        );
        res.status(403).json({ error: error.message });
        return;
      }

      const passwordHashed = await hashPassword(password);
      user.password = passwordHashed;

      const jwt = generateJWT({ id: user._id.toString() });

      await Promise.all([user.save(), token.deleteOne()]);

      res
        .cookie("token", jwt, {
          httpOnly: true,
          secure: process.env.LOCAL === "true" ? false : true, // true en producción con HTTPS
          sameSite: process.env.LOCAL === "true" ? "lax" : "none", // o 'none' si usás subdominios distintos con HTTPS
          maxAge: 1000 * 60 * 60 * 24 * 365,
        })
        .json({
          msg: "Password actualizado correctamente",
          userId: user._id.toString(),
        });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  };

  static login = async (req: Request<{}, {}, loginBody>, res: Response) => {
    const { email, password } = req.body;
    const sanitizedEmail = sanitizeInput(email);
    try {
      const user = await User.findOne({ email: sanitizedEmail });

      console.log(user, !!user);
      if (!user) {
        const error = new Error("El usuario no existe");
        res.status(404).json({ error: error.message });
        return;
      }

      console.log(user.confirmed);
      if (!user.confirmed) {
        const error = new Error(
          "El usuario no esta confirmado, Solicite un código de confirmación"
        );
        res.status(403).json({ error: error.message });
        return;
      }

      console.log(
        await comparePassword(password, user.password),
        password,
        user.password
      );
      const compare = await comparePassword(password, user.password);
      if (!compare) {
        const error = new Error("Password incorrecto");
        res.status(403).json({ error: error.message });
        return;
      }

      //* Crear jwt
      const jwt = generateJWT({ id: user._id.toString() });
      console.log(jwt);

      res
        .cookie("token", jwt, {
          httpOnly: true,
          secure: process.env.LOCAL === "true" ? false : true, // true en producción con HTTPS
          sameSite: process.env.LOCAL === "true" ? "lax" : "none", // o 'none' si usás subdominios distintos con HTTPS
          maxAge: 1000 * 60 * 60 * 24 * 365,
        })
        .json({
          msg: "Sesión iniciada correctamente",
          userId: user._id.toString(),
        });
    } catch (error) {
      const err = new Error("Ocurrió un Error");
      res.status(500).json({ error: err.message });
    }
  };

  static auth = (req: Request, res: Response) => {
    res.json(req.user);
    return;
  };

  static logout = (req: Request, res: Response) => {
    res
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.LOCAL === "true" ? false : true,
        sameSite: process.env.LOCAL === "true" ? "lax" : "none",
      })
      .json({ msg: "Sesión cerrada correctamente" });
    return;
  };
}
