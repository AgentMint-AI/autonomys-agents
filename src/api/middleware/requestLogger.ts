import { NextFunction, Request, Response } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Add request ID for tracking
  req.id = Math.random().toString(36).substring(7);

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.warn(
      `[${new Date().toISOString()}] ${req.id} ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`,
    );
  });

  next();
};
