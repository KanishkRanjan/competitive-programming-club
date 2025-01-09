import { Request, Response, NextFunction } from 'express';
import CustomError from '../error/custom.error';

export default (err: CustomError, req: Request, res: Response, next: NextFunction) => {  // Change `CustomError` to `any`
    console.error(err.stack);  // Log the error for debugging
  
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';
  
    res.status(statusCode).json({
      success: false,
      message: message,
    });
  }