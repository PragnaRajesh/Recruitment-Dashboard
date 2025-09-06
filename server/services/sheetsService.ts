import { Recruiter, Candidate, Client, Performance } from '../models';

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  apiKey: string;
  ranges: {
    recruiters: string;
    candidates: string;
    clients: string;
    performance: string;
  };
}

async function fetchSheet(spreadsheetId: string, range: string, apiKey: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sheet ${range}: ${res.status} ${res.statusText}`);
  return res.json();
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

  // Replace collections with new data (simple strategy)
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

export async function fetchAll() {
  const recruiters = await Recruiter.find().lean();
  const candidates = await Candidate.find().lean();
  const clients = await Client.find().lean();
  const performance = await Performance.find().lean();
  return { recruiters, candidates, clients, performance };
}
