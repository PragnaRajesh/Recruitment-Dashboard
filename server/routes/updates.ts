import { RequestHandler } from 'express';
import { registerSse } from '../services/updatesService';

export const handleUpdates: RequestHandler = (req, res) => {
  // Register SSE connection
  registerSse(res);
};
