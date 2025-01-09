import { Request, Response, NextFunction } from 'express';
import CustomResponse from '../responder';

export default (msg: CustomResponse, req: Request, res: Response, next: NextFunction) => {  // Change `CustomError` to `any`
    if (res.headersSent) {
        return next();
    }
    const statusCode = msg.status || 200;
    const message = msg.message || 'Success';
  
    res.status(statusCode).json({
      success: true,
      mesage: message,
    });
  }