import Like from "../models/Like";
import { Request, Response } from "express";

export class LikeController {
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

  static getAllSnippetLiked = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        console.log("No hay usuario en req");
        res.status(401).json({ error: "No autorizado" });
        return;
      }

      const like = await Like.find({ user: req.user._id }).populate("snippet");

      const snippets = like.map((like) => like.snippet);

      if (!snippets) {
        const error = new Error("No tienes Snippets favoritos");
        res.status(404).json({ error: error.message });
        return;
      }

      res.json({ snippet: snippets });
    } catch (error) {
      res.status(500).json({ msg: "Error al obtener los snippets" });
    }
  };
}
