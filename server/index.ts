import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleUpdates } from './routes/updates';
import { handleImportSheets, handleFetchData, handleSaveConfig, handleGetConfigs } from './routes/sheets';
import { handleClearData } from './routes/maintenance';

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // SSE updates stream
  app.get('/api/updates', handleUpdates);

  // Import and fetch Google Sheets data (persisted in MongoDB)
  app.post('/api/import-sheets', handleImportSheets);
  app.get('/api/data', handleFetchData);
  app.post('/api/save-sheets-config', handleSaveConfig);
  app.get('/api/sheets-configs', handleGetConfigs);

  // Sample data loader
  app.post('/api/load-sample', (req, res) => {
    // dynamic import handler to avoid circular requires
    import('./routes/sheets').then((mod) => mod.handleLoadSample(req, res)).catch((err) => {
      console.error('Load sample route error', err);
      res.status(500).json({ error: err?.message || 'Load sample failed' });
    });
  });

  // Maintenance: clear all recruitment data and sheet configs
  app.post('/api/clear-data', handleClearData);

  // Connect to MongoDB (supports MONGODB_URI or MONGO_URI)
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/recruitment';
  // Dynamic import to avoid build-time dependency resolution during Vite prebundle
  import('mongoose').then((mongoose) => {
    const m = (mongoose as any).default ?? mongoose;
    m.connect(mongoUri).then(async () => {
      console.log('Connected to MongoDB');
      // Start scheduled jobs after models are ready
      try {
        const cfgService = await import('./services/configService');
        if (cfgService && typeof cfgService.startScheduledJobs === 'function') {
          cfgService.startScheduledJobs().catch((err: any) => console.warn('startScheduledJobs error', err));
        }
      } catch (err) {
        console.warn('Could not start scheduled jobs:', (err as any)?.message ?? err);
      }

      // Graceful shutdown for Mongo connection
      const cleanup = async (signal: string) => {
        try {
          await m.connection.close();
          console.log(`MongoDB connection closed on ${signal}`);
        } catch (e) {
          console.warn('Error closing MongoDB connection:', (e as any)?.message ?? e);
        } finally {
          process.exit(0);
        }
      };
      process.on('SIGINT', () => cleanup('SIGINT'));
      process.on('SIGTERM', () => cleanup('SIGTERM'));
    }).catch((err: any) => {
      console.warn('MongoDB connection failed:', err?.message ?? err);
    });
  }).catch((err) => {
    console.warn('Could not load mongoose:', (err as any)?.message ?? err);
  });

  return app;
}
