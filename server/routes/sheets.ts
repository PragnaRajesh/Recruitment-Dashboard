import { RequestHandler } from 'express';
import { importSheetsAndSave, fetchAll } from '../services/sheetsService';
import { saveSheetsConfig, getAllSheetsConfigs } from '../services/configService';

export const handleImportSheets: RequestHandler = async (req, res) => {
  try {
    const config = req.body || {};

    // Extract spreadsheetId from raw ID or from Google Sheets link
    let spreadsheetId = config.spreadsheetId || "";
    if (!spreadsheetId && config.sheetLink) {
      const match = String(config.sheetLink).match(/spreadsheets\/d\/([-_a-zA-Z0-9]+)/);
      if (match) spreadsheetId = match[1];
    }

    // Prefer request API key → fallback to env
    const apiKey = config.apiKey || process.env.GOOGLE_SHEETS_API_KEY || "";

    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Missing spreadsheetId or sheetLink' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'Missing Google Sheets API key. Set GOOGLE_SHEETS_API_KEY in .env or provide apiKey in the request.' });
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

    const data = await importSheetsAndSave(finalConfig);
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Import sheets error:', err);
    return res.status(500).json({ error: err.message || 'Import failed' });
  }
};

export const handleFetchData: RequestHandler = async (_req, res) => {
  try {
    const data = await fetchAll();
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Fetch data error:', err);
    return res.status(500).json({ error: err.message || 'Fetch failed' });
  }
};

export const handleSaveConfig: RequestHandler = async (req, res) => {
  try {
    const config = req.body;
    if (!config || !config.spreadsheetId || !config.apiKey) {
      return res.status(400).json({ error: 'Missing spreadsheetId or apiKey' });
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
