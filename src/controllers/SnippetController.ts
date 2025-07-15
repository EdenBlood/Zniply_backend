import { Response, Request } from "express";
import Snippet from "../models/Snippet";
import { sanitizeInput, sanitizeCodeInput } from "../utils/sanitize";
import User from "../models/User";
import Like from "../models/Like";

interface TipTapEntries {
  title: string;
  description: string;
  code: string;
  language: string;
}

export class SnippetController {
  static searchSnippets = async (
    req: Request<{}, {}, {}, { query: string }>,
    res: Response
  ) => {
    const raw = req.query.query;

    if (!raw || typeof raw !== "string") {
      res.status(400).json({ msg: "Parámetro de búsqueda inválido" });
      return;
    }

    const searchTerm = raw.trim();

    try {
      const snippet = await Snippet.find({
        title: { $regex: searchTerm, $options: "i" },
      }).limit(10);

      res.json(snippet);
    } catch (error) {
      res.status(500).json({ msg: "Error Buscando" });
    }
  };

  static getAllUserSnippets = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
      const user = await User.findById(userId).select("_id name email");

      if (!user) {
        const error = new Error("El usuario no existe");
        res.status(404).json({ error: error.message });
        return;
      }

      const snippets = await Snippet.find({ user: userId });

      res.json({
        msg: "Se cargaron los snippets correctamente",
        snippet: snippets,
        user,
      });
    } catch (error) {
      res.status(500).json({ msg: "Error al Traer los Snippets del usuario" });
    }
  };

  static createSnippet = async (
    req: Request<{}, {}, TipTapEntries>,
    res: Response
  ) => {
    //* Sanetizar la entrada de código de los Snippets.
    const title = sanitizeInput(req.body.title);
    const description = sanitizeInput(req.body.description);
    const code = sanitizeCodeInput(req.body.code);
    const language = sanitizeCodeInput(req.body.language);

    try {
      //* Crea snippet
      const snippet = new Snippet({ title, description, code, language });

      //* Asigna el usuario que lo creó
      snippet.user = req.user._id;

      //* Guarda snippet
      await snippet.save();
      res.status(201).json({ msg: "Snippet creado correctamente", snippet });
    } catch (error) {
      res.status(500).json({ msg: "Error al crear el snippet" });
    }
  };

  static getAllSnippets = async (req: Request, res: Response) => {
    try {
      //* Traemos los snippets del usuario
      const snippet = await Snippet.find({ user: req.user._id }).sort({
        createdAt: -1,
      });

      //* Devuelve los snippets
      res.status(200).json({ snippet });
    } catch (error) {
      res.status(500).json({ msg: "Error al Traer los snippets" });
    }
  };

  static getSnippetById = async (req: Request, res: Response) => {
    try {
      //* Envía el snippet
      res.status(200).json({ snippet: req.snippet });
    } catch (error) {
      res.status(500).json({ msg: "Error fetching snippet" });
    }
  };

  static updateSnippet = async (
    req: Request<{}, {}, TipTapEntries>,
    res: Response
  ) => {
    //* Sanitiza los inputs
    const title = sanitizeInput(req.body.title);
    const description = sanitizeInput(req.body.description);
    const code = sanitizeCodeInput(req.body.code);
    const language = sanitizeCodeInput(req.body.language);
    try {
      //* Reemplaza los cambios
      req.snippet.title = title || req.snippet.title;
      req.snippet.description = description || req.snippet.description;
      req.snippet.code = code || req.snippet.code;
      req.snippet.language = language || req.snippet.language;

      //* Save
      await req.snippet.save();
      res.json({
        msg: "Snippet actualizado correctamente",
        snippet: req.snippet,
      });
    } catch (error) {
      res.status(500).json({ msg: "Error actualizando el snippet" });
    }
  };

  static deleteSnippet = async (req: Request, res: Response) => {
    try {
      await Promise.all([
        Like.deleteMany({ snippet: req.snippet._id }),
        req.snippet.deleteOne(),
      ]);
      res.json({ msg: "Snippet eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ msg: "Error eliminado el snippet" });
    }
  };

  static likeSnippet = async (req: Request, res: Response) => {
    try {
      // Revisamos si ya dio like el usuario al snippet
      const existing = await Like.findOne({
        user: req.user._id,
        snippet: req.snippet._id,
      });

      // Si ya dio like, lo quitamos
      if (existing) {
        req.snippet.likeCount -= 1;

        await Promise.all([existing.deleteOne(), req.snippet.save()]);

        res.json({
          msg: `Le quitaste tu Bombilla a ${req.snippet.title}`,
          liked: false,
        });
        return;
      }

      // Si no dio like, lo damos
      req.snippet.likeCount += 1;

      await Promise.all([
        new Like({ user: req.user._id, snippet: req.snippet._id }).save(),
        req.snippet.save(),
      ]);

      res.json({
        msg: `Le diste una Bombilla a ${req.snippet.title}`,
        liked: true,
      });
    } catch (error) {
      // Este es el truco: atrapar el error por clave duplicada
      if (error.code === 11000) {
        res
          .status(409)
          .json({ message: "Ya diste una Bombilla a este Snippet" });
      } else {
        res.status(500).json({ msg: "Error al dar Bombilla" });
      }
    }
  };

  static getLikeStatus = async (req: Request, res: Response) => {
    try {
      const liked = await Like.exists({
        user: req.user._id,
        snippet: req.snippet._id,
      });

      res.json({ liked: !!liked });
    } catch (error) {
      res.status(500).json({ msg: "Error al obtener el like" });
    }
  };
}
