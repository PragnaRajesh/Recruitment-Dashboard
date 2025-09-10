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
  const header = (response.values[0] as any[]).map((h) => String(h ?? '').trim().toLowerCase());
  const rows = response.values.slice(1);
  const parseNum = (v?: string) => (v ? Number(String(v).replace(/[^0-9.-]+/g, '')) || 0 : 0);
  return rows.map((row: any[]) => {
    const byName: Record<string, string> = {};
    header.forEach((h, i) => (byName[h] = row[i] !== undefined ? String(row[i]) : ''));
    return {
      name: byName['name'] || byName['full name'] || byName['recruiter'] || (row[0] || ''),
      email: byName['email'] || byName['email id'] || (row[1] || ''),
      phone: byName['phone'] || byName['contact number'] || (row[2] || ''),
      department: byName['department'] || (row[3] || ''),
      territory: byName['territory'] || byName['locations'] || (row[4] || ''),
      hired: parseNum(byName['hired'] || byName['total hired'] || byName['hires'] || String(row[5] || '0')),
      joinDate: byName['joindate'] || byName['join date'] || byName['start date'] || byName['doj'] || (row[6] || ''),
      reportingManager: byName['reporting manager'] || byName['reportingmanager'] || '',
      remarks: byName['remarks'] || '',
      backendCallingsRemarks: byName['backend callings remarks'] || byName['backendcallingsremarks'] || '',
      recruiterBackendCallings: byName['recruiter backend callings'] || byName['recruiterbackendcallings'] || '',
      status: (byName['status'] as any) || ((row[7] as any) || 'active'),
      trend: (byName['trend'] as any) || ((row[8] as any) || 'up'),
      location: byName['location'] || (row[9] || ''),
    };
  });
}

function parseCandidates(response: any) {
  if (!response.values || response.values.length < 2) return [];
  const header = (response.values[0] as any[]).map((h) => String(h ?? '').trim().toLowerCase());
  const rows = response.values.slice(1);
  const parseNum = (v?: string) => (v ? Number(String(v).replace(/[^0-9.-]+/g, '')) || 0 : 0);
  return rows.map((row: any[]) => {
    const byName: Record<string, string> = {};
    header.forEach((h, i) => (byName[h] = row[i] !== undefined ? String(row[i]) : ''));
    const skills = (byName['skills'] || String(row[5] || '')).split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
    return {
      name: byName['name'] || (row[0] || ''),
      email: byName['email'] || byName['email id'] || (row[1] || ''),
      phone: byName['phone'] || byName['contact number'] || (row[2] || ''),
      position: byName['position'] || byName['role'] || (row[3] || ''),
      experience: byName['experience'] || (row[4] || ''),
      skills,
      status: (byName['status'] as any) || ((row[6] as any) || 'pending'),
      salary: parseNum(byName['salary'] || byName['salary details'] || String(row[7] || '0')),
      recruiter: byName['recruiter'] || (row[8] || ''),
      reportingManager: byName['reporting manager'] || '',
      client: byName['client'] || (row[9] || ''),
      appliedDate: byName['applieddate'] || byName['applied date'] || byName['doj'] || (row[10] || ''),
      doj: byName['doj'] || '',
      salaryDetails: byName['salary details'] || '',
      location: byName['location'] || (row[11] || ''),
      remarks: byName['remarks'] || '',
      backendCallingsRemarks: byName['backend callings remarks'] || '',
    };
  });
}

function parseClients(response: any) {
  if (!response.values || response.values.length < 2) return [];
  const header = (response.values[0] as any[]).map((h) => String(h ?? '').trim().toLowerCase());
  const rows = response.values.slice(1);
  const parseNum = (v?: string) => (v ? Number(String(v).replace(/[^0-9.-]+/g, '')) || 0 : 0);
  return rows.map((row: any[]) => {
    const byName: Record<string, string> = {};
    header.forEach((h, i) => (byName[h] = row[i] !== undefined ? String(row[i]) : ''));
    return {
      name: byName['name'] || (row[0] || ''),
      company: byName['company'] || (row[1] || ''),
      email: byName['email'] || byName['email id'] || (row[2] || ''),
      phone: byName['phone'] || byName['contact number'] || (row[3] || ''),
      industry: byName['industry'] || (row[4] || ''),
      totalHired: parseNum(byName['total hired'] || byName['totalhired'] || byName['hires'] || String(row[5] || '0')),
      avgDaysToFill: parseNum(byName['avg daystofill'] || byName['avgdays'] || String(row[6] || '0')),
      status: (byName['status'] as any) || ((row[7] as any) || 'active'),
      location: byName['location'] || byName['locations'] || (row[8] || ''),
      contactNumber: byName['contact number'] || '',
      lastActivity: byName['lastactivity'] || byName['last activity'] || (row[9] || ''),
      remarks: byName['remarks'] || '',
      backendCallingsRemarks: byName['backend callings remarks'] || '',
    };
  });
}

function parsePerformance(response: any) {
  if (!response.values || response.values.length < 2) return [];
  const header = (response.values[0] as any[]).map((h) => String(h ?? '').trim().toLowerCase());
  const rows = response.values.slice(1);
  const parseNum = (v?: string) => (v ? Number(String(v).replace(/[^0-9.-]+/g, '')) || 0 : 0);
  return rows.map((row: any[]) => {
    const byName: Record<string, string> = {};
    header.forEach((h, i) => (byName[h] = row[i] !== undefined ? String(row[i]) : ''));
    return {
      month: byName['month'] || byName['date'] || (row[0] || ''),
      recruiters: parseNum(byName['recruiters'] || String(row[1] || '0')),
      hired: parseNum(byName['hired'] || String(row[2] || '0')),
      target: parseNum(byName['target'] || String(row[3] || '0')),
    };
  });
}

export async function importSheetsAndSave(config: GoogleSheetsConfig) {
  const { spreadsheetId, apiKey, ranges } = config;

  const results = await Promise.allSettled([
    fetchSheet(spreadsheetId, ranges.recruiters, apiKey).catch((e) => { throw new Error(`Recruiters fetch failed: ${e?.message || e}`); }),
    fetchSheet(spreadsheetId, ranges.candidates, apiKey).catch((e) => { throw new Error(`Candidates fetch failed: ${e?.message || e}`); }),
    fetchSheet(spreadsheetId, ranges.clients, apiKey).catch((e) => { throw new Error(`Clients fetch failed: ${e?.message || e}`); }),
    fetchSheet(spreadsheetId, ranges.performance, apiKey).catch((e) => { throw new Error(`Performance fetch failed: ${e?.message || e}`); }),
  ]);

  const [rRes, cRes, clientsRes, perfRes] = results.map((r) => (r.status === 'fulfilled' ? (r.value as any) : null));

  // Helper to infer sheet type based on header row
  const inferType = (resp: any) => {
    if (!resp || !resp.values || resp.values.length === 0) return null;
    const header = (resp.values[0] as any[]).map((h) => String(h ?? '').trim().toLowerCase());
    const has = (keys: string[]) => keys.some((k) => header.includes(k));
    if (has(['position', 'role', 'applieddate', 'applied date', 'salary', 'doj', 'client'])) return 'candidates';
    if (has(['company', 'industry', 'total hired', 'avgdaystofill', 'last activity'])) return 'clients';
    if (has(['hired', 'territory', 'trend', 'join date', 'joindate', 'department'])) return 'recruiters';
    if (has(['month', 'target', 'hired'])) return 'performance';
    return null;
  };

  let recruiters: any[] = [];
  let candidates: any[] = [];
  let clients: any[] = [];
  let performance: any[] = [];

  // Infer types and parse accordingly — handle cases where tabs may contain different data than expected
  try {
    const rType = inferType(rRes);
    const cType = inferType(cRes);
    const clType = inferType(clientsRes);
    const pType = inferType(perfRes);

    if (rRes) {
      if (rType === 'candidates') candidates = parseCandidates(rRes);
      else if (rType === 'clients') clients = parseClients(rRes);
      else if (rType === 'performance') performance = parsePerformance(rRes);
      else recruiters = parseRecruiters(rRes);
    }

    if (cRes) {
      if (cType === 'recruiters') recruiters = parseRecruiters(cRes);
      else if (cType === 'clients') clients = parseClients(cRes);
      else if (cType === 'performance') performance = parsePerformance(cRes);
      else candidates = parseCandidates(cRes);
    }

    if (clientsRes) {
      if (clType === 'recruiters') recruiters = parseRecruiters(clientsRes);
      else if (clType === 'candidates') candidates = parseCandidates(clientsRes);
      else if (clType === 'performance') performance = parsePerformance(clientsRes);
      else clients = parseClients(clientsRes);
    }

    if (perfRes) {
      if (pType === 'recruiters') recruiters = parseRecruiters(perfRes);
      else if (pType === 'clients') clients = parseClients(perfRes);
      else if (pType === 'candidates') candidates = parseCandidates(perfRes);
      else performance = parsePerformance(perfRes);
    }
  } catch (e) {
    // fallback to best-effort parsing
    recruiters = rRes ? parseRecruiters(rRes) : [];
    candidates = cRes ? parseCandidates(cRes) : [];
    clients = clientsRes ? parseClients(clientsRes) : [];
    performance = perfRes ? parsePerformance(perfRes) : [];
  }

  // Best-effort DB persistence; return data even if DB is unavailable
  try {
    await Recruiter.deleteMany({});
    await Candidate.deleteMany({});
    await Client.deleteMany({});
    await Performance.deleteMany({});

    if (recruiters.length) await Recruiter.insertMany(recruiters.map((r: any) => ({ ...r })));
    if (candidates.length) await Candidate.insertMany(candidates.map((c: any) => ({ ...c })));
    if (clients.length) await Client.insertMany(clients.map((c: any) => ({ ...c })));
    if (performance.length) await Performance.insertMany(performance.map((p: any) => ({ ...p })));
  } catch (e) {
    console.warn('DB write failed, returning data without persisting', (e as any)?.message ?? e);
  }

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

  const inferRowsType = (rows: Record<string,string>[]) => {
    if (!rows || rows.length === 0) return null;
    const header = Object.keys(rows[0]).map(h => h.trim().toLowerCase());
    const has = (keys: string[]) => keys.some(k => header.includes(k));
    if (has(['position','role','applieddate','applied date','salary','doj','client'])) return 'candidates';
    if (has(['company','industry','total hired','avg daystofill','last activity'])) return 'clients';
    if (has(['hired','territory','trend','join date','joindate','department'])) return 'recruiters';
    if (has(['month','target','hired'])) return 'performance';
    return null;
  };

  let recruiters: any[] = [];
  let candidates: any[] = [];
  let clients: any[] = [];
  let performance: any[] = [];

  try {
    const tRec = inferRowsType(recRows);
    const tCand = inferRowsType(candRows);
    const tClient = inferRowsType(clientRows);
    const tPerf = inferRowsType(perfRows);

    if (tRec === 'candidates') candidates = mapCandidates(recRows);
    else if (tRec === 'clients') clients = mapClients(recRows);
    else if (tRec === 'performance') performance = mapPerformance(recRows);
    else recruiters = mapRecruiters(recRows);

    if (tCand === 'recruiters') recruiters = mapRecruiters(candRows);
    else if (tCand === 'clients') clients = mapClients(candRows);
    else if (tCand === 'performance') performance = mapPerformance(candRows);
    else candidates = mapCandidates(candRows);

    if (tClient === 'recruiters') recruiters = mapRecruiters(clientRows);
    else if (tClient === 'candidates') candidates = mapCandidates(clientRows);
    else if (tClient === 'performance') performance = mapPerformance(clientRows);
    else clients = mapClients(clientRows);

    if (tPerf === 'recruiters') recruiters = mapRecruiters(perfRows);
    else if (tPerf === 'clients') clients = mapClients(perfRows);
    else if (tPerf === 'candidates') candidates = mapCandidates(perfRows);
    else performance = mapPerformance(perfRows);
  } catch (e) {
    recruiters = mapRecruiters(recRows);
    candidates = mapCandidates(candRows);
    clients = mapClients(clientRows);
    performance = mapPerformance(perfRows);
  }

  // Persist to DB (best-effort); return data even if DB is unavailable
  try {
    await Recruiter.deleteMany({});
    await Candidate.deleteMany({});
    await Client.deleteMany({});
    await Performance.deleteMany({});

    if (recruiters.length) await Recruiter.insertMany(recruiters.map((r: any) => ({ ...r })));
    if (candidates.length) await Candidate.insertMany(candidates.map((c: any) => ({ ...c })));
    if (clients.length) await Client.insertMany(clients.map((c: any) => ({ ...c })));
    if (performance.length) await Performance.insertMany(performance.map((p: any) => ({ ...p })));
  } catch (e) {
    console.warn('DB write failed (published import), returning data without persisting', (e as any)?.message ?? e);
  }

  return { recruiters, candidates, clients, performance };
}

export async function fetchAll() {
  const recruiters = await Recruiter.find().lean();
  const candidates = await Candidate.find().lean();
  const clients = await Client.find().lean();
  const performance = await Performance.find().lean();
  return { recruiters, candidates, clients, performance };
}
