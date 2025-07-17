import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { param } from "express-validator";
import { handleInputErrors } from "../middlewares/validationResult";
import { findSnippetById } from "../middlewares/snippet";
import { LikeController } from "../controllers/LikeController";

const router = Router();

//Likes
router.post(
  "/:snippetId",
  authenticate,
  [param("snippetId").isMongoId().withMessage("ID no valido")],
  handleInputErrors,
  findSnippetById,
  LikeController.likeSnippet
);

router.get(
  "/:snippetId",
  authenticate,
  [param("snippetId").isMongoId().withMessage("ID no valido")],
  handleInputErrors,
  findSnippetById,
  LikeController.getLikeStatus
);

// Obtener los snippets Liked
router.get("/", authenticate, LikeController.getAllSnippetLiked);

export default router;
