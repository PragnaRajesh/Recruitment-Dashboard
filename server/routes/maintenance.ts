import { RequestHandler } from 'express';
import { Recruiter, Candidate, Client, Performance, SheetsConfig } from '../models';
import { stopAllJobs } from '../services/configService';

export const handleClearData: RequestHandler = async (_req, res) => {
  try {
    // Stop any scheduled jobs first
    try {
      stopAllJobs();
    } catch (err) {
      console.warn('stopAllJobs error', err);
    }

    // Delete all documents from collections
    const r = await Recruiter.deleteMany({}).exec();
    const c = await Candidate.deleteMany({}).exec();
    const cl = await Client.deleteMany({}).exec();
    const p = await Performance.deleteMany({}).exec();
    const cfg = await SheetsConfig.deleteMany({}).exec();

    return res.status(200).json({
      message: 'Cleared all recruitment data and sheet configs',
      deleted: {
        recruiters: r.deletedCount ?? r.ok ?? null,
        candidates: c.deletedCount ?? c.ok ?? null,
        clients: cl.deletedCount ?? cl.ok ?? null,
        performance: p.deletedCount ?? p.ok ?? null,
        sheetsConfigs: cfg.deletedCount ?? cfg.ok ?? null,
      },
    });
  } catch (err: any) {
    console.error('Clear data error', err);
    return res.status(500).json({ error: err.message || 'Clear data failed' });
  }
};
