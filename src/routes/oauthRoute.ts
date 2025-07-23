import { Router } from "express";
import passport from "../config/passport";
import OAuthController from "../controllers/OAuthController";

const router = Router();

// Inicio sesión login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Callback Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login?error=oauth",
    session: true,
  }),
  OAuthController.getGoogleCallback
);

// Igual para GitHub
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
  })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login?error=oauth",
    session: true,
  }),
  OAuthController.getGithubCallback
);

export default router;
