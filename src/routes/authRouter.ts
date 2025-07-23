import { Router } from "express";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validationResult";
import { AuthController } from "../controllers/AuthController";
import { authenticate } from "../middlewares/authenticate";
const router = Router();

router.post(
  "/create-account",
  [
    body("name").notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("El correo electrónico no es válido"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("La contraseña debe tener al menos 8 caracteres"),
    body("password_repeat").custom((value, { req }) => {
      if (req.body.password !== value) {
        throw new Error("Las contraseñas no son iguales");
      }
      return true;
    }),
  ],
  handleInputErrors,
  AuthController.createAccount
);

router.post(
  "/confirm-account",
  [body("token").notEmpty().withMessage("No puede ir vació")],
  handleInputErrors,
  AuthController.confirmAccount
);

router.post(
  "/resend-code",
  [body("email").isEmail().withMessage("Email no valido")],
  handleInputErrors,
  AuthController.resendCode
);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Email no valido")],
  handleInputErrors,
  AuthController.forgotPassword
);

router.post(
  "/forgot-password/confirm-code",
  [body("token").notEmpty().withMessage("El token no puede ir vació")],
  handleInputErrors,
  AuthController.forgotPasswordCode
);

router.patch(
  "/forgot-password/change-password/:token",
  [
    param("token").notEmpty().withMessage("token no valido"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("La contraseña debe tener al menos 8 caracteres"),
    body("password_repeat").custom((value, { req }) => {
      if (req.body.password !== value) {
        throw new Error("Las contraseñas no son iguales");
      }
      return true;
    }),
  ],
  handleInputErrors,
  AuthController.changePassword
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email no valido"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("La contraseña debe tener al menos 8 caracteres"),
  ],
  handleInputErrors,
  AuthController.login
);

router.get("/authorization", authenticate, AuthController.auth);

router.post("/logout", AuthController.logout);

export default router;
