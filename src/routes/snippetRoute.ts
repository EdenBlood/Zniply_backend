import { Router } from "express";
import { SnippetController } from "../controllers/SnippetController";
import { body, param, query } from "express-validator";

import { handleInputErrors } from "../middlewares/validationResult";
import { findSnippetById, isOwnerOfSnippet } from "../middlewares/snippet";
import { sanitizeInput } from "../utils/sanitize";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

//* Buscador
router.get(
  "/search",
  [
    query("query")
      .trim()
      .notEmpty()
      .withMessage("El término de búsqueda no puede estar vacío")
      .isLength({ min: 2 })
      .withMessage("Debe tener al menos 2 caracteres"),
  ],
  handleInputErrors,
  SnippetController.searchSnippets
);

//* External User Snippets
router.get(
  "/user/:userId",
  [
    param("userId")
      .trim()
      .notEmpty()
      .withMessage("Usuario no encontrado")
      .isMongoId()
      .withMessage("Usuario no encontrado"),
  ],
  handleInputErrors,
  SnippetController.getAllUserSnippets
);

//* Crud
router.post(
  "/",
  authenticate,
  [
    body("title").trim().notEmpty().withMessage("El titulo es obligatorio"),
    body("title")
      .isLength({ max: 48 })
      .withMessage("El titulo tiene un máximo de 48 caracteres"),
    body("description")
      .custom((value) => sanitizeInput(value).length > 0)
      .withMessage("La Descripción es obligatoria"),
    body("code")
      .custom((value) => sanitizeInput(value).length > 0)
      .withMessage("El código es obligatorio"),
    body("language")
      .custom((value) => sanitizeInput(value).length > 0)
      .withMessage("El lenguaje es obligatorio"),
  ],
  handleInputErrors,
  SnippetController.createSnippet
);

router.get("/", authenticate, SnippetController.getAllSnippets);

router.use("/:snippetId", findSnippetById);

router.get(
  "/:snippetId",
  [param("snippetId").isMongoId().withMessage("ID no valido")],
  handleInputErrors,
  SnippetController.getSnippetById
);

router.put(
  "/:snippetId",
  authenticate,
  [
    body("title").trim().notEmpty().withMessage("El titulo es obligatorio"),
    body("title")
      .isLength({ max: 48 })
      .withMessage("El titulo tiene un máximo de 48 caracteres"),
    body("description")
      .custom((value) => sanitizeInput(value).length > 0)
      .withMessage("La Descripción es obligatoria"),
    body("code")
      .custom((value) => sanitizeInput(value).length > 0)
      .withMessage("El código es obligatorio"),
    body("language")
      .custom((value) => sanitizeInput(value).length > 0)
      .withMessage("El lenguaje es obligatorio"),
  ],
  handleInputErrors,
  isOwnerOfSnippet,
  SnippetController.updateSnippet
);

router.delete(
  "/:snippetId",
  authenticate,
  [param("snippetId").isMongoId().withMessage("ID no valido")],
  handleInputErrors,
  isOwnerOfSnippet,
  SnippetController.deleteSnippet
);

export default router;
