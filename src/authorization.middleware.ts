import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    if (!token) {
      res.status(403).send();
    }
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log(decodedToken);
      if (decodedToken.type === 'admin') {
        next();
        return;
      }
      res.status(403).send();
    } catch (error) {
      res.status(403).send();
    }
  }
}
