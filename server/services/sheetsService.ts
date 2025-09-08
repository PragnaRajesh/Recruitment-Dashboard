import { Recruiter, Candidate, Client, Performance } from '../models';
import { google } from 'googleapis';

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  apiKey?: string;
  ranges: {
    recruiters: string;
    candidates: string;
    clients: string;
    performance: string;
  };
}

async function getServiceAccountClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!clientEmail || !privateKey) return null;
  // Handle escaped newlines
  if (privateKey.includes('\\n')) privateKey = privateKey.replace(/\\n/g, '\n');
  try {
    const jwt = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    await jwt.authorize();
    return jwt;
  } catch {
    return null;
  }
}

async function fetchSheetViaServiceAccount(spreadsheetId: string, range: string) {
  const auth = await getServiceAccountClient();
  if (!auth) return null;
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const values = res.data.values || [];
  return { values };
}

async function fetchSheetViaApiKey(spreadsheetId: string, range: string, apiKey: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sheet ${range}: ${res.status} ${res.statusText}`);
  return res.json();
}

async function fetchSheet(spreadsheetId: string, range: string, apiKey?: string) {
  // Try service account first (supports private sheets when shared with the service account)
  const sa = await fetchSheetViaServiceAccount(spreadsheetId, range).catch(() => null);
  if (sa && sa.values) return sa;
  // Fallback to API key (public/anyone-with-link sheets)
  const key = apiKey || process.env.GOOGLE_SHEETS_API_KEY || '';
  if (!key) {
    throw new Error('Google Sheets access not configured. Add service account env vars or set GOOGLE_SHEETS_API_KEY.');
  }
  return fetchSheetViaApiKey(spreadsheetId, range, key);
}

function parseRecruiters(response: any) {
  if (!response.values || response.values.length < 2) return [];
  const rows = response.values.slice(1);
  return rows.map((row: any[]) => ({
    name: row[0] || '',
    email: row[1] || '',
    phone: row[2] || '',
    department: row[3] || '',
    territory: row[4] || '',
    hired: parseInt(row[5]) || 0,
    joinDate: row[6] || '',
    status: (row[7] as any) || 'active',
    trend: (row[8] as any) || 'up',
    location: row[9] || '',
  }));
}

function parseCandidates(response: any) {
  if (!response.values || response.values.length < 2) return [];
  const rows = response.values.slice(1);
  return rows.map((row: any[]) => ({
    name: row[0] || '',
    email: row[1] || '',
    phone: row[2] || '',
    position: row[3] || '',
    experience: row[4] || '',
    skills: row[5] ? row[5].split(',').map((s: string) => s.trim()) : [],
    status: (row[6] as any) || 'pending',
    salary: parseInt(row[7]) || 0,
    recruiter: row[8] || '',
    client: row[9] || '',
    appliedDate: row[10] || '',
    location: row[11] || '',
  }));
}

function parseClients(response: any) {
  if (!response.values || response.values.length < 2) return [];
  const rows = response.values.slice(1);
  return rows.map((row: any[]) => ({
    name: row[0] || '',
    company: row[1] || '',
    email: row[2] || '',
    phone: row[3] || '',
    industry: row[4] || '',
    totalHired: parseInt(row[5]) || 0,
    avgDaysToFill: parseInt(row[6]) || 0,
    status: (row[7] as any) || 'active',
    location: row[8] || '',
    lastActivity: row[9] || '',
  }));
}

function parsePerformance(response: any) {
  if (!response.values || response.values.length < 2) return [];
  const rows = response.values.slice(1);
  return rows.map((row: any[]) => ({
    month: row[0] || '',
    recruiters: parseInt(row[1]) || 0,
    hired: parseInt(row[2]) || 0,
    target: parseInt(row[3]) || 0,
  }));
}

export async function importSheetsAndSave(config: GoogleSheetsConfig) {
  const { spreadsheetId, apiKey, ranges } = config;

  const [rRes, cRes, clientsRes, perfRes] = await Promise.all([
    fetchSheet(spreadsheetId, ranges.recruiters, apiKey),
    fetchSheet(spreadsheetId, ranges.candidates, apiKey),
    fetchSheet(spreadsheetId, ranges.clients, apiKey),
    fetchSheet(spreadsheetId, ranges.performance, apiKey),
  ]);

  const recruiters = parseRecruiters(rRes);
  const candidates = parseCandidates(cRes);
  const clients = parseClients(clientsRes);
  const performance = parsePerformance(perfRes);

  await Recruiter.deleteMany({});
  await Candidate.deleteMany({});
  await Client.deleteMany({});
  await Performance.deleteMany({});

  await Recruiter.insertMany(recruiters.map((r: any) => ({ ...r })));
  await Candidate.insertMany(candidates.map((c: any) => ({ ...c })));
  await Client.insertMany(clients.map((c: any) => ({ ...c })));
  await Performance.insertMany(performance.map((p: any) => ({ ...p })));

  return { recruiters, candidates, clients, performance };
}

// Fallback: import from published CSV endpoints (server-side) when service account / API key not available
export async function importPublishedAndSave(spreadsheetId: string, ranges: { recruiters: string; candidates: string; clients: string; performance: string; }, gid?: string) {
  // Helper to try multiple CSV endpoints for a given sheet name
  const tryFetchCsv = async (sheetName: string): Promise<string | null> => {
    const tryUrls: string[] = [];
    if (gid) tryUrls.push(`https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/export?format=csv&gid=${encodeURIComponent(gid)}`);
    tryUrls.push(`https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/export?format=csv&sheet=${encodeURIComponent(sheetName)}`);
    tryUrls.push(`https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`);
    tryUrls.push(`https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/export?format=csv`);

    for (const url of tryUrls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const text = await res.text();
        if (text && (text.indexOf(',') >= 0 || text.indexOf('\n') >= 0)) return text;
      } catch (err) {
        // try next
      }
    }
    return null;
  };

  // CSV parser (robust)
  const parseCsvToObjects = (csv: string): Record<string,string>[] => {
    const lines: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < csv.length; i++) {
      const ch = csv[i];
      if (ch === '"') {
        if (i + 1 < csv.length && csv[i+1] === '"') { cur += '"'; i++; }
        else { inQuotes = !inQuotes; cur += ch; }
      } else if (ch === '\r') {
        // ignore
      } else if (ch === '\n' && !inQuotes) { lines.push(cur); cur = ''; }
      else { cur += ch; }
    }
    if (cur) lines.push(cur);
    if (lines.length === 0) return [];
    const splitCsv = (line: string) => {
      const cols: string[] = [];
      let field = '';
      let inside = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inside && i + 1 < line.length && line[i+1] === '"') { field += '"'; i++; }
          else { inside = !inside; }
        } else if (c === ',' && !inside) { cols.push(field); field = ''; }
        else { field += c; }
      }
      cols.push(field);
      return cols.map(s => s.replace(/^"|"$/g,'').trim());
    };

    const header = splitCsv(lines[0]).map(h => h.trim());
    const out: Record<string,string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols = splitCsv(lines[i]);
      const row: Record<string,string> = {};
      for (let j = 0; j < header.length; j++) row[header[j]] = cols[j] !== undefined ? cols[j] : '';
      out.push(row);
    }
    return out;
  };

  // mapping helpers (reuse logic similar to client)
  const mapRecruiters = (rows: Record<string,string>[]) => {
    return rows.map((r, idx) => {
      const lower: Record<string,string> = {};
      Object.keys(r).forEach(k => (lower[k.toLowerCase()] = r[k] || ''));
      const parseNum = (v?: string) => (v ? Number(String(v).replace(/[^0-9.-]+/g, '')) || 0 : 0);
      return {
        name: lower['name'] || lower['full name'] || lower['recruiter'] || '',
        email: lower['email'] || '',
        phone: lower['phone'] || '',
        department: lower['department'] || '',
        territory: lower['territory'] || '',
        hired: parseNum(lower['hired'] || lower['total hired'] || lower['hires']),
        joinDate: lower['joindate'] || lower['join date'] || lower['start date'] || '',
        status: (lower['status'] as any) || 'active',
        trend: (lower['trend'] as any) || 'up',
        location: lower['location'] || '',
      };
    });
  };

  const mapClients = (rows: Record<string,string>[]) => {
    return rows.map((r, idx) => {
      const lower: Record<string,string> = {};
      Object.keys(r).forEach(k => (lower[k.toLowerCase()] = r[k] || ''));
      const parseNum = (v?: string) => (v ? Number(String(v).replace(/[^0-9.-]+/g, '')) || 0 : 0);
      return {
        name: lower['name'] || '',
        company: lower['company'] || '',
        email: lower['email'] || '',
        phone: lower['phone'] || '',
        industry: lower['industry'] || '',
        totalHired: parseNum(lower['total hired'] || lower['totalhired'] || lower['hires']),
        avgDaysToFill: parseNum(lower['avg daystofill'] || lower['avgdays'] || lower['avgdays']) || 0,
        status: (lower['status'] as any) || 'active',
        location: lower['location'] || '',
        lastActivity: lower['lastactivity'] || lower['last activity'] || '',
      };
    });
  };

  const mapCandidates = (rows: Record<string,string>[]) => {
    return rows.map((r, idx) => {
      const lower: Record<string,string> = {};
      Object.keys(r).forEach(k => (lower[k.toLowerCase()] = r[k] || ''));
      const parseNum = (v?: string) => (v ? Number(String(v).replace(/[^0-9.-]+/g, '')) || 0 : 0);
      const skills = (lower['skills'] || '').split(/[,;|]/).map(s => s.trim()).filter(Boolean);
      return {
        name: lower['name'] || '',
        email: lower['email'] || '',
        phone: lower['phone'] || '',
        position: lower['position'] || lower['role'] || '',
        experience: lower['experience'] || '',
        skills,
        status: (lower['status'] as any) || 'pending',
        salary: parseNum(lower['salary'] || '0'),
        recruiter: lower['recruiter'] || '',
        client: lower['client'] || '',
        appliedDate: lower['applieddate'] || lower['applied date'] || '',
        location: lower['location'] || '',
      };
    });
  };

  const mapPerformance = (rows: Record<string,string>[]) => {
    return rows.map((r) => {
      const lower: Record<string,string> = {};
      Object.keys(r).forEach((k) => (lower[k.toLowerCase()] = r[k] || ''));
      const parseNum = (v?: string) => (v ? Number(String(v).replace(/[^0-9.-]+/g, '')) || 0 : 0);
      return {
        month: lower['month'] || lower['date'] || '',
        recruiters: parseNum(lower['recruiters'] || '0'),
        hired: parseNum(lower['hired'] || '0'),
        target: parseNum(lower['target'] || '0'),
      };
    });
  };

  // Sheet names (assume default tab names exist)
  const sheetNames = {
    recruiters: 'Recruiters',
    candidates: 'Candidates',
    clients: 'Clients',
    performance: 'Performance',
  };

  const [recCsv, candCsv, clientCsv, perfCsv] = await Promise.all([
    tryFetchCsv(sheetNames.recruiters),
    tryFetchCsv(sheetNames.candidates),
    tryFetchCsv(sheetNames.clients),
    tryFetchCsv(sheetNames.performance),
  ]);

  const recRows = recCsv ? parseCsvToObjects(recCsv) : [];
  const candRows = candCsv ? parseCsvToObjects(candCsv) : [];
  const clientRows = clientCsv ? parseCsvToObjects(clientCsv) : [];
  const perfRows = perfCsv ? parseCsvToObjects(perfCsv) : [];

  const recruiters = mapRecruiters(recRows);
  const candidates = mapCandidates(candRows);
  const clients = mapClients(clientRows);
  const performance = mapPerformance(perfRows);

  // Persist to DB (replace existing data)
  await Recruiter.deleteMany({});
  await Candidate.deleteMany({});
  await Client.deleteMany({});
  await Performance.deleteMany({});

  if (recruiters.length) await Recruiter.insertMany(recruiters.map((r: any) => ({ ...r })));
  if (candidates.length) await Candidate.insertMany(candidates.map((c: any) => ({ ...c })));
  if (clients.length) await Client.insertMany(clients.map((c: any) => ({ ...c })));
  if (performance.length) await Performance.insertMany(performance.map((p: any) => ({ ...p })));

  return { recruiters, candidates, clients, performance };
}

export async function fetchAll() {
  const recruiters = await Recruiter.find().lean();
  const candidates = await Candidate.find().lean();
  const clients = await Client.find().lean();
  const performance = await Performance.find().lean();
  return { recruiters, candidates, clients, performance };
}
