import express from 'express';
import cors from 'cors';
import characterRouter from './routes/character.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/characters', characterRouter);

// Error handling
app.use(errorHandler);

export default app;
