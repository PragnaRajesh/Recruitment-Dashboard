// Data Service for managing API calls and data fetching
export interface RecruiterData {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  territory: string;
  hired: number;
  joinDate?: string;
  reportingManager?: string;
  remarks?: string;
  backendCallingsRemarks?: string;
  recruiterBackendCallings?: string;
  status: "active" | "inactive" | "pending";
  trend: "up" | "down";
  location: string;
}

export interface ClientData {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  industry: string;
  totalHired: number;
  avgDaysToFill: number;
  status: "active" | "pending" | "inactive";
  location: string;
  contactNumber?: string;
  lastActivity: string;
  remarks?: string;
  backendCallingsRemarks?: string;
}

export interface CandidateData {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  skills: string[];
  status: "hired" | "interview" | "pending" | "rejected";
  salary: number;
  salaryDetails?: string;
  recruiter: string;
  reportingManager?: string;
  client: string;
  appliedDate?: string;
  doj?: string;
  location: string;
  remarks?: string;
  backendCallingsRemarks?: string;
}

export interface PerformanceData {
  month: string;
  recruiters: number;
  hired: number;
  target: number;
}

// Store for imported data
let importedRecruiters: RecruiterData[] = [];
let importedClients: ClientData[] = [];
let importedCandidates: CandidateData[] = [];
let importedPerformanceData: PerformanceData[] = [];

// Google Sheets configuration
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

let sheetsConfig: GoogleSheetsConfig | null = null;

// CSV parser helper (reused by multiple import methods)
const parseCsvToObjects = (csv: string): Record<string, string>[] => {
  const lines: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (ch === '"') {
      if (i + 1 < csv.length && csv[i + 1] === '"') {
        // escaped quote
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === '\r') {
      // ignore CR, handle LF only
    } else if (ch === '\n' && !inQuotes) {
      lines.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
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
        if (inside && i + 1 < line.length && line[i + 1] === '"') {
          field += '"';
          i++; // skip escaped quote
        } else {
          inside = !inside;
        }
      } else if (c === ',' && !inside) {
        cols.push(field);
        field = '';
      } else {
        field += c;
      }
    }
    cols.push(field);
    return cols.map((s) => s.replace(/^"|"$/g, '').trim());
  };

  const header = splitCsv(lines[0]).map((h) => h.trim());
  const out: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = splitCsv(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = cols[j] !== undefined ? cols[j] : '';
    }
    out.push(row);
  }
  return out;
};


// API Service Class
class DataService {
  private baseUrl = "/api";

  // Try multiple candidate origins if a relative request fails (useful during dev
  // when the frontend may be served from a different port than the embedded API).
  private async request(path: string, options?: RequestInit) {
    const candidates = [
      // relative (best option when server middleware is attached to same origin)
      `${this.baseUrl}${path}`,
      // common dev ports
      `http://localhost:5173${this.baseUrl}${path}`,
      `http://localhost:8080${this.baseUrl}${path}`,
      // current origin
      `${typeof window !== 'undefined' ? window.location.origin : ''}${this.baseUrl}${path}`,
    ];

    let lastError: any = null;
    for (const url of candidates) {
      try {
        const res = await fetch(url, options);
        // If the server responded (even with 4xx/5xx), return the response so
        // the caller can handle non-ok statuses. Only network errors fall through.
        return res;
      } catch (err) {
        lastError = err;
        // try next candidate
      }
    }

    // All attempts failed — return a non-ok Response so callers can handle failures
    try {
      return new Response(JSON.stringify({ error: 'Network request failed' }), {
        status: 0,
        statusText: 'Network request failed',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      // If Response constructor isn't available, return an object matching what callers expect
      return {
        ok: false,
        status: 0,
        statusText: 'Network request failed',
        json: async () => ({ error: 'Network request failed' }),
        text: async () => '',
      } as unknown as Response;
    }
  }

  // Public wrapper for request so other modules can call the API without accessing a private method
  async requestApi(path: string, options?: RequestInit) {
    return this.request(path, options);
  }

  // Set Google Sheets configuration (client stores it temporarily)
  setGoogleSheetsConfig(config: GoogleSheetsConfig) {
    sheetsConfig = config;
  }

  // Import data via server (server will fetch Sheets and save to MongoDB)
  async importFromGoogleSheets(): Promise<{
    recruiters: RecruiterData[];
    candidates: CandidateData[];
    clients: ClientData[];
    performance: PerformanceData[];
  }> {
    if (!sheetsConfig) throw new Error("Google Sheets configuration not set");

    const res = await this.request('/import-sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sheetsConfig),
    });

    if (!res.ok) {
      // Try to get JSON error message, otherwise text
      let msg = 'Import failed';
      try {
        const body = await res.json().catch(() => null);
        if (body && body.error) msg = body.error;
        else if (body && typeof body === 'string') msg = body;
      } catch (e) {
        try {
          const text = await res.text();
          if (text) msg = text;
        } catch (e2) {
          // ignore
        }
      }
      throw new Error(msg);
    }

    const data = await res.json();

    // update local cache
    importedRecruiters = data.recruiters || [];
    importedCandidates = data.candidates || [];
    importedClients = data.clients || [];
    importedPerformanceData = data.performance || [];

    return { recruiters: importedRecruiters, candidates: importedCandidates, clients: importedClients, performance: importedPerformanceData };
  }

  // New: Import from published sheet CSVs (no Google API key required)
  // Expects the spreadsheet to be accessible (published or shared viewable).
  async importFromPublishedSheets(spreadsheetId: string, gid?: string): Promise<{
    recruiters: RecruiterData[];
    candidates: CandidateData[];
    clients: ClientData[];
    performance: PerformanceData[];
  }> {
    // Helper: fetch CSV for a given sheet name or gid using public endpoints
    const fetchCsv = async (sheetName: string): Promise<string | null> => {
      const tryUrls: string[] = [];

      // If a gid is provided, try the export endpoint by gid first (commonly works):
      if (gid) {
        tryUrls.push(`https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/export?format=csv&gid=${encodeURIComponent(gid)}`);
      }

      // Try export by sheet name (may or may not be supported / CORS-allowed)
      tryUrls.push(`https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/export?format=csv&sheet=${encodeURIComponent(sheetName)}`);

      // gviz/tq endpoint as a fallback
      tryUrls.push(`https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`);

      for (const url of tryUrls) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const text = await res.text();
          // basic validation: must contain at least one comma or newline
          if (text && (text.indexOf(',') >= 0 || text.indexOf('\n') >= 0)) return text;
        } catch (err) {
          // try next url
        }
      }
      return null;
    };

    // Simple CSV parser that returns array of objects keyed by header row
    const parseCsvToObjects = (csv: string): Record<string, string>[] => {
      const lines: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < csv.length; i++) {
        const ch = csv[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
          cur += ch;
        } else if (ch === '\n' && !inQuotes) {
          lines.push(cur);
          cur = '';
        } else {
          cur += ch;
        }
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
            if (inside && i + 1 < line.length && line[i + 1] === '"') {
              field += '"';
              i++; // skip escaped quote
            } else {
              inside = !inside;
            }
          } else if (c === ',' && !inside) {
            cols.push(field);
            field = '';
          } else {
            field += c;
          }
        }
        cols.push(field);
        return cols.map((s) => s.replace(/^"|"$/g, '').trim());
      };

      const header = splitCsv(lines[0]).map((h) => h.trim());
      const out: Record<string, string>[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = splitCsv(lines[i]);
        const row: Record<string, string> = {};
        for (let j = 0; j < header.length; j++) {
          row[header[j]] = cols[j] !== undefined ? cols[j] : '';
        }
        out.push(row);
      }
      return out;
    };

    // Mapping helpers - try to map common header names to fields
    const mapRecruiters = (rows: Record<string, string>[]): RecruiterData[] => {
      return rows.map((r, idx) => {
        const lower: Record<string, string> = {};
        Object.keys(r).forEach((k) => (lower[k.toLowerCase()] = r[k] || ''));
        const parseNum = (v?: string) => (v ? Number(String(v).replace(/[^0-9.-]+/g, '')) || 0 : 0);
        return {
          id: parseNum(lower['id']) || idx + 1,
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
        } as RecruiterData;
      });
    };

    const mapClients = (rows: Record<string, string>[]): ClientData[] => {
      return rows.map((r, idx) => {
        const lower: Record<string, string> = {};
        Object.keys(r).forEach((k) => (lower[k.toLowerCase()] = r[k] || ''));
        const parseNum = (v?: string) => (v ? Number(String(v).replace(/[^0-9.-]+/g, '')) || 0 : 0);
        return {
          id: parseNum(lower['id']) || idx + 1,
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
        } as ClientData;
      });
    };

    const mapCandidates = (rows: Record<string, string>[]): CandidateData[] => {
      return rows.map((r, idx) => {
        const lower: Record<string, string> = {};
        Object.keys(r).forEach((k) => (lower[k.toLowerCase()] = r[k] || ''));
        const parseNum = (v?: string) => (v ? Number(String(v).replace(/[^0-9.-]+/g, '')) || 0 : 0);
        const skills = (lower['skills'] || '').split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
        return {
          id: parseNum(lower['id']) || idx + 1,
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
        } as CandidateData;
      });
    };

    const mapPerformance = (rows: Record<string, string>[]): PerformanceData[] => {
      return rows.map((r) => {
        const lower: Record<string, string> = {};
        Object.keys(r).forEach((k) => (lower[k.toLowerCase()] = r[k] || ''));
        const parseNum = (v?: string) => (v ? Number(String(v).replace(/[^0-9.-]+/g, '')) || 0 : 0);
        return {
          month: lower['month'] || lower['date'] || '',
          recruiters: parseNum(lower['recruiters'] || '0'),
          hired: parseNum(lower['hired'] || '0'),
          target: parseNum(lower['target'] || '0'),
        } as PerformanceData;
      });
    };

    // Try to fetch each known sheet by name. If a sheet is missing, result will be empty.
    const sheetNames = {
      recruiters: 'Recruiters',
      candidates: 'Candidates',
      clients: 'Clients',
      performance: 'Performance',
    };

    const [recCsv, candCsv, clientCsv, perfCsv] = await Promise.all([
      fetchCsv(sheetNames.recruiters),
      fetchCsv(sheetNames.candidates),
      fetchCsv(sheetNames.clients),
      fetchCsv(sheetNames.performance),
    ]);

    const recRows = recCsv ? parseCsvToObjects(recCsv) : [];
    const candRows = candCsv ? parseCsvToObjects(candCsv) : [];
    const clientRows = clientCsv ? parseCsvToObjects(clientCsv) : [];
    const perfRows = perfCsv ? parseCsvToObjects(perfCsv) : [];

    importedRecruiters = mapRecruiters(recRows);
    importedCandidates = mapCandidates(candRows);
    importedClients = mapClients(clientRows);
    importedPerformanceData = mapPerformance(perfRows);

    return { recruiters: importedRecruiters, candidates: importedCandidates, clients: importedClients, performance: importedPerformanceData };
  }

  // Import CSV file uploaded by user (single-sheet CSV). Heuristically map to recruiters/performance.
  async importFromCsvFile(file: File): Promise<{
    recruiters: RecruiterData[];
    candidates: CandidateData[];
    clients: ClientData[];
    performance: PerformanceData[];
  }> {
    try {
      const text = await file.text();
      const rows = parseCsvToObjects(text);
      if (!rows || rows.length === 0) return { recruiters: [], candidates: [], clients: [], performance: [] };

      // Detect if it's performance data (has month/target/hired)
      const headers = Object.keys(rows[0]).map((h) => h.toLowerCase());
      const isPerformance = headers.includes('month') || (headers.includes('target') && headers.includes('hired'));

      if (isPerformance) {
        const perf = rows.map((r) => {
          const lower: Record<string, string> = {};
          Object.keys(r).forEach((k) => (lower[k.toLowerCase()] = r[k] || ''));
          const parseNum = (v?: string) => (v ? Number(String(v).replace(/[^0-9.-]+/g, '')) || 0 : 0);
          return {
            month: lower['month'] || lower['date'] || '',
            recruiters: parseNum(lower['recruiters'] || '0'),
            hired: parseNum(lower['hired'] || '0'),
            target: parseNum(lower['target'] || '0'),
          } as PerformanceData;
        });
        importedPerformanceData = perf;
        return { recruiters: [], candidates: [], clients: [], performance: importedPerformanceData };
      }

      // Fallback: treat as recruiters table
      const recs = rows.map((r, idx) => {
        const lower: Record<string, string> = {};
        Object.keys(r).forEach((k) => (lower[k.toLowerCase()] = r[k] || ''));
        const parseNum = (v?: string) => (v ? Number(String(v).replace(/[^0-9.-]+/g, '')) || 0 : 0);
        return {
          id: parseNum(lower['id']) || idx + 1,
          name: lower['name'] || lower['full name'] || lower['recruiter'] || '',
          email: lower['email'] || '',
          phone: lower['phone'] || '',
          department: lower['department'] || '',
          territory: lower['territory'] || '',
          hired: parseNum(lower['hired'] || lower['hires'] || lower['total hired']),
          joinDate: lower['joindate'] || lower['join date'] || '',
          status: (lower['status'] as any) || 'active',
          trend: (lower['trend'] as any) || 'up',
          location: lower['location'] || '',
        } as RecruiterData;
      });

      importedRecruiters = recs;
      importedCandidates = [];
      importedClients = [];
      importedPerformanceData = [];

      return { recruiters: importedRecruiters, candidates: importedCandidates, clients: importedClients, performance: importedPerformanceData };
    } catch (err) {
      return { recruiters: [], candidates: [], clients: [], performance: [] };
    }
  }

  // Import when the spreadsheet only contains one sheet (or user wants to import a single tab by gid)
  async importSingleSheet(spreadsheetId: string, gid?: string): Promise<{
    recruiters: RecruiterData[];
    candidates: CandidateData[];
    clients: ClientData[];
    performance: PerformanceData[];
  }> {
    const tryUrls: string[] = [];
    if (gid) tryUrls.push(`https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/export?format=csv&gid=${encodeURIComponent(gid)}`);
    // generic export (may return first sheet)
    tryUrls.push(`https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/export?format=csv`);
    tryUrls.push(`https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/gviz/tq?tqx=out:csv`);

    let csvText: string | null = null;
    for (const url of tryUrls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const text = await res.text();
        if (text && (text.indexOf(',') >= 0 || text.indexOf('\n') >= 0)) {
          csvText = text;
          break;
        }
      } catch (err) {
        // try next
      }
    }

    if (!csvText) {
      return { recruiters: [], candidates: [], clients: [], performance: [] };
    }

    const rows = ((): Record<string,string>[] => {
      // reuse parser
      const lines: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < csvText!.length; i++) {
        const ch = csvText![i];
        if (ch === '"') { inQuotes = !inQuotes; cur += ch; }
        else if (ch === '\n' && !inQuotes) { lines.push(cur); cur = ''; }
        else { cur += ch; }
      }
      if (cur) lines.push(cur);
      if (lines.length === 0) return [];
      const splitCsv = (line: string) => {
        const cols: string[] = []; let field = ''; let inside = false;
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
    })();

    // Heuristically map single-sheet rows to recruiters (best guess for single-sheet use-case)
    const recs = rows.map((r, idx) => {
      const lower: Record<string,string> = {};
      Object.keys(r).forEach(k => lower[k.toLowerCase()] = r[k] || '');
      const parseNum = (v?: string) => (v ? Number(String(v).replace(/[^0-9.-]+/g, '')) || 0 : 0);
      return {
        id: parseNum(lower['id']) || idx + 1,
        name: lower['name'] || lower['full name'] || lower['recruiter'] || '',
        email: lower['email'] || '',
        phone: lower['phone'] || '',
        department: lower['department'] || '',
        territory: lower['territory'] || '',
        hired: parseNum(lower['hired'] || lower['hires'] || lower['total hired']),
        joinDate: lower['joindate'] || lower['join date'] || '',
        status: (lower['status'] as any) || 'active',
        trend: (lower['trend'] as any) || 'up',
        location: lower['location'] || '',
      } as RecruiterData;
    });

    // For single-sheet import, populate recruiters and leave others empty
    importedRecruiters = recs;
    importedCandidates = [];
    importedClients = [];
    importedPerformanceData = [];

    return { recruiters: importedRecruiters, candidates: importedCandidates, clients: importedClients, performance: importedPerformanceData };
  }

  private buildQuery(filters?: { month?: string; year?: string; recruiter?: string }) {
    if (!filters) return '';
    const params = new URLSearchParams();
    if (filters.month) params.set('month', filters.month);
    if (filters.year) params.set('year', filters.year);
    if (filters.recruiter) params.set('recruiter', filters.recruiter);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  async fetchRecruiters(filters?: { month?: string; year?: string; recruiter?: string }): Promise<RecruiterData[]> {
    try {
      const qs = this.buildQuery(filters);
      const res = await this.request(`/data${qs}`);
      if (!res || !res.ok) return importedRecruiters;
      const json = await res.json();
      importedRecruiters = json.recruiters || [];
      return importedRecruiters;
    } catch (err) {
      // Network failure - return cached imported data
      return importedRecruiters;
    }
  }

  async fetchClients(filters?: { month?: string; year?: string; recruiter?: string }): Promise<ClientData[]> {
    try {
      const qs = this.buildQuery(filters);
      const res = await this.request(`/data${qs}`);
      if (!res || !res.ok) return importedClients;
      const json = await res.json();
      importedClients = json.clients || [];
      return importedClients;
    } catch (err) {
      return importedClients;
    }
  }

  async fetchCandidates(filters?: { month?: string; year?: string; recruiter?: string }): Promise<CandidateData[]> {
    try {
      const qs = this.buildQuery(filters);
      const res = await this.request(`/data${qs}`);
      if (!res || !res.ok) return importedCandidates;
      const json = await res.json();
      importedCandidates = json.candidates || [];
      return importedCandidates;
    } catch (err) {
      return importedCandidates;
    }
  }

  async fetchPerformanceData(filters?: { month?: string; year?: string; recruiter?: string }): Promise<PerformanceData[]> {
    try {
      const qs = this.buildQuery(filters);
      const res = await this.request(`/data${qs}`);
      if (!res || !res.ok) return importedPerformanceData;
      const json = await res.json();
      importedPerformanceData = json.performance || [];
      return importedPerformanceData;
    } catch (err) {
      return importedPerformanceData;
    }
  }

  hasImportedData(): boolean {
    return (
      importedRecruiters.length > 0 ||
      importedCandidates.length > 0 ||
      importedClients.length > 0 ||
      importedPerformanceData.length > 0
    );
  }

  clearData(): void {
    importedRecruiters = [];
    importedClients = [];
    importedCandidates = [];
    importedPerformanceData = [];
  }

  getFilteredRecruiters(filters: {
    department?: string;
    location?: string;
    status?: string;
  }): RecruiterData[] {
    let filtered = [...importedRecruiters];

    if (filters.department) {
      filtered = filtered.filter((r) =>
        r.department.toLowerCase().includes(filters.department!.toLowerCase()),
      );
    }

    if (filters.location) {
      filtered = filtered.filter((r) =>
        r.location.toLowerCase().includes(filters.location!.toLowerCase()),
      );
    }

    if (filters.status) {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    return filtered;
  }
}

export const dataService = new DataService();
