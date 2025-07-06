import { Request, Response, NextFunction } from 'express';
import Snippet, { ISnippet } from '../models/Snippet';

declare global {
  namespace Express {
    interface Request {
      snippet: ISnippet
    }
  }
}
export async function findSnippetById(req: Request, res: Response, next: NextFunction) {
    const { snippetId } = req.params;
  try {
    const snippet = await Snippet.findById(snippetId);

    if (!snippet) {
      const error = new Error('Snippet not found');
      res.status(404).json({error: error.message });
      return;
    }

    req.snippet = snippet;
    
    next();
    } catch (error) {
      res.status(500).json({ msg: 'Error fetching snippet' });
  }
}

//* Verifica que el usuario sea el creador
export async function isOwnerOfSnippet(req:Request, res:Response, next:NextFunction) {
  if (req.snippet.user.toString() !== req.user._id.toString()) {
    const error = new Error('No autorizado');
    res.status(401).json({error: error.message});
    return;
  };

  next()
}