import { RequestHandler } from 'express';
import { importSheetsAndSave, fetchAll, importPublishedAndSave } from '../services/sheetsService';
import { saveSheetsConfig, getAllSheetsConfigs } from '../services/configService';
import { Recruiter, Candidate, Client, Performance } from '../models';

export const handleLoadSample: RequestHandler = async (_req, res) => {
  try {
    // Clear existing data
    await Recruiter.deleteMany({}).exec();
    await Candidate.deleteMany({}).exec();
    await Client.deleteMany({}).exec();
    await Performance.deleteMany({}).exec();

    // Insert sample recruiters
    const recruiters = [
      { name: 'Aisha Patel', email: 'aisha@example.com', department: 'Engineering', territory: 'EMEA', hired: 12, status: 'active', trend: 'up', location: 'London' },
      { name: 'Carlos Mendes', email: 'carlos@example.com', department: 'Sales', territory: 'APAC', hired: 8, status: 'active', trend: 'up', location: 'Singapore' },
      { name: 'Meera Singh', email: 'meera@example.com', department: 'HR', territory: 'NA', hired: 5, status: 'inactive', trend: 'down', location: 'New York' },
    ];

    const candidates = [
      { name: 'John Doe', email: 'john@example.com', position: 'Frontend Engineer', experience: '3 years', skills: ['React','TypeScript'], status: 'interview', salary: 70000, recruiter: 'Aisha Patel', client: 'Acme Corp', appliedDate: '2024-04-01', location: 'London' },
      { name: 'Jane Smith', email: 'jane@example.com', position: 'Data Scientist', experience: '5 years', skills: ['Python','ML'], status: 'pending', salary: 90000, recruiter: 'Carlos Mendes', client: 'Beta LLC', appliedDate: '2024-03-15', location: 'Singapore' },
    ];

    const clients = [
      { name: 'Acme Corp', company: 'Acme', email: 'contact@acme.com', industry: 'Tech', totalHired: 10, avgDaysToFill: 30, status: 'active', location: 'London', lastActivity: '2024-05-01' },
      { name: 'Beta LLC', company: 'Beta', email: 'hello@beta.com', industry: 'Finance', totalHired: 6, avgDaysToFill: 45, status: 'active', location: 'Singapore', lastActivity: '2024-04-25' },
    ];

    const performance = [
      { month: '2024-01', recruiters: 3, hired: 6, target: 8 },
      { month: '2024-02', recruiters: 3, hired: 5, target: 8 },
      { month: '2024-03', recruiters: 3, hired: 7, target: 8 },
      { month: '2024-04', recruiters: 3, hired: 8, target: 8 },
    ];

    if (recruiters.length) await Recruiter.insertMany(recruiters);
    if (candidates.length) await Candidate.insertMany(candidates);
    if (clients.length) await Client.insertMany(clients);
    if (performance.length) await Performance.insertMany(performance);

    return res.status(200).json({ recruitersCount: recruiters.length, candidatesCount: candidates.length, clientsCount: clients.length, performanceCount: performance.length });
  } catch (err: any) {
    console.error('Load sample error:', err);
    return res.status(500).json({ error: err.message || 'Load sample failed' });
  }
};

export const handleImportSheets: RequestHandler = async (req, res) => {
  try {
    const config = req.body || {};

    // Extract spreadsheetId from raw ID or from Google Sheets link
    let spreadsheetId = config.spreadsheetId || "";
    if (!spreadsheetId && config.sheetLink) {
      const match = String(config.sheetLink).match(/spreadsheets\/d\/([-_a-zA-Z0-9]+)/);
      if (match) spreadsheetId = match[1];
    }

    // Prefer request API key → fallback to env (optional if service account is configured)
    const apiKey = config.apiKey || process.env.GOOGLE_SHEETS_API_KEY || undefined;

    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Missing spreadsheetId or sheetLink' });
    }


    const finalConfig = {
      spreadsheetId,
      apiKey,
      ranges: config.ranges || {
        recruiters: 'Recruiters!A:J',
        candidates: 'Candidates!A:L',
        clients: 'Clients!A:J',
        performance: 'Performance!A:D',
      },
    };

    try {
      const data = await importSheetsAndSave(finalConfig);
      return res.status(200).json(data);
    } catch (err: any) {
      console.error('Import sheets error:', err && err.message ? err.message : err);
      // If the server lacks Google API access, attempt published CSV fallback server-side
      const msg = err && err.message ? err.message : '';
      if (msg && msg.toLowerCase().includes('google sheets access not configured')) {
        try {
          const published = await importPublishedAndSave(spreadsheetId, finalConfig.ranges, (config as any).gid);
          return res.status(200).json(published);
        } catch (pubErr: any) {
          console.error('Published fallback failed:', pubErr && pubErr.message ? pubErr.message : pubErr);
          return res.status(500).json({ error: pubErr && pubErr.message ? pubErr.message : 'Import failed' });
        }
      }

      return res.status(500).json({ error: err.message || 'Import failed' });
    }
  } catch (err: any) {
    console.error('Import sheets error:', err);
    return res.status(500).json({ error: err.message || 'Import failed' });
  }
};

export const handleFetchData: RequestHandler = async (req, res) => {
  try {
    const month = typeof req.query.month === 'string' ? req.query.month : undefined; // expected YYYY-MM
    const year = typeof req.query.year === 'string' ? req.query.year : undefined; // expected YYYY
    const recruiter = typeof req.query.recruiter === 'string' ? req.query.recruiter : undefined;

    // Build queries
    const perfQuery: any = {};
    if (month) perfQuery.month = month;
    else if (year) perfQuery.month = { $regex: `^${year}` };

    let performance: any[] = [];
    if (Object.keys(perfQuery).length) {
      performance = await Performance.find(perfQuery).lean();
    } else {
      performance = await Performance.find().lean();
    }

    const recruiterQuery: any = {};
    if (recruiter && recruiter !== 'all') recruiterQuery.name = recruiter;
    if (month) recruiterQuery.joinDate = { $regex: `^${month}` };
    else if (year) recruiterQuery.joinDate = { $regex: `^${year}` };
    const recruiters = await Recruiter.find(recruiterQuery).lean();

    // Candidates: filter by recruiter and appliedDate/doj
    const candQuery: any = {};
    if (recruiter && recruiter !== 'all') candQuery.recruiter = recruiter;
    if (month) candQuery.$or = [{ appliedDate: { $regex: `^${month}` } }, { doj: { $regex: `^${month}` } }];
    else if (year) candQuery.$or = [{ appliedDate: { $regex: `^${year}` } }, { doj: { $regex: `^${year}` } }];

    const candidates = Object.keys(candQuery).length ? await Candidate.find(candQuery).lean() : await Candidate.find().lean();

    // Clients: if recruiter filter applied, narrow clients to those referenced by candidates
    let clients: any[] = [];
    if (recruiter && recruiter !== 'all') {
      const clientNames = Array.from(new Set(candidates.map((c: any) => c.client).filter(Boolean)));
      if (clientNames.length) {
        const clientQuery: any = { name: { $in: clientNames } };
        if (month) clientQuery.lastActivity = { $regex: `^${month}` };
        else if (year) clientQuery.lastActivity = { $regex: `^${year}` };
        clients = await Client.find(clientQuery).lean();
      } else {
        clients = [];
      }
    } else {
      const clientQuery: any = {};
      if (month) clientQuery.lastActivity = { $regex: `^${month}` };
      else if (year) clientQuery.lastActivity = { $regex: `^${year}` };
      clients = Object.keys(clientQuery).length ? await Client.find(clientQuery).lean() : await Client.find().lean();
    }

    return res.status(200).json({ recruiters, candidates, clients, performance });
  } catch (err: any) {
    console.error('Fetch data error:', err);
    return res.status(500).json({ error: err.message || 'Fetch failed' });
  }
};

export const handleSaveConfig: RequestHandler = async (req, res) => {
  try {
    const config = req.body;
    if (!config || !config.spreadsheetId) {
      return res.status(400).json({ error: 'Missing spreadsheetId' });
    }

    const saved = await saveSheetsConfig(config);
    return res.status(200).json(saved);
  } catch (err: any) {
    console.error('Save config error:', err);
    return res.status(500).json({ error: err.message || 'Save failed' });
  }
};

export const handleGetConfigs: RequestHandler = async (_req, res) => {
  try {
    const configs = await getAllSheetsConfigs();
    return res.status(200).json(configs);
  } catch (err: any) {
    console.error('Get configs error:', err);
    return res.status(500).json({ error: err.message || 'Fetch failed' });
  }
};
