// Data Service for managing API calls and data fetching
export interface RecruiterData {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  territory: string;
  hired: number;
  joinDate: string;
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
  lastActivity: string;
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
  recruiter: string;
  client: string;
  appliedDate: string;
  location: string;
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
  apiKey: string;
  ranges: {
    recruiters: string;
    candidates: string;
    clients: string;
    performance: string;
  };
}

let sheetsConfig: GoogleSheetsConfig | null = null;

// API Service Class
class DataService {
  private baseUrl = "/api";

  // Set Google Sheets configuration
  setGoogleSheetsConfig(config: GoogleSheetsConfig) {
    sheetsConfig = config;
  }

  // Import data from Google Sheets
  async importFromGoogleSheets(): Promise<{
    recruiters: RecruiterData[];
    candidates: CandidateData[];
    clients: ClientData[];
    performance: PerformanceData[];
  }> {
    if (!sheetsConfig) {
      throw new Error("Google Sheets configuration not set");
    }

    try {
      const { spreadsheetId, apiKey, ranges } = sheetsConfig;
      
      // Fetch data from Google Sheets API
      const responses = await Promise.all([
        this.fetchSheetRange(spreadsheetId, ranges.recruiters, apiKey),
        this.fetchSheetRange(spreadsheetId, ranges.candidates, apiKey),
        this.fetchSheetRange(spreadsheetId, ranges.clients, apiKey),
        this.fetchSheetRange(spreadsheetId, ranges.performance, apiKey),
      ]);

      // Parse the data
      const recruiters = this.parseRecruitersData(responses[0]);
      const candidates = this.parseCandidatesData(responses[1]);
      const clients = this.parseClientsData(responses[2]);
      const performance = this.parsePerformanceData(responses[3]);

      // Store imported data
      importedRecruiters = recruiters;
      importedCandidates = candidates;
      importedClients = clients;
      importedPerformanceData = performance;

      return { recruiters, candidates, clients, performance };
    } catch (error) {
      console.error("Error importing from Google Sheets:", error);
      throw error;
    }
  }

  private async fetchSheetRange(spreadsheetId: string, range: string, apiKey: string) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet data: ${response.statusText}`);
    }
    
    return await response.json();
  }

  private parseRecruitersData(response: any): RecruiterData[] {
    if (!response.values || response.values.length < 2) return [];
    
    const headers = response.values[0];
    const rows = response.values.slice(1);
    
    return rows.map((row: any[], index: number) => ({
      id: index + 1,
      name: row[0] || "",
      email: row[1] || "",
      phone: row[2] || "",
      department: row[3] || "",
      territory: row[4] || "",
      hired: parseInt(row[5]) || 0,
      joinDate: row[6] || "",
      status: (row[7] as "active" | "inactive" | "pending") || "active",
      trend: (row[8] as "up" | "down") || "up",
      location: row[9] || "",
    }));
  }

  private parseCandidatesData(response: any): CandidateData[] {
    if (!response.values || response.values.length < 2) return [];
    
    const rows = response.values.slice(1);
    
    return rows.map((row: any[], index: number) => ({
      id: index + 1,
      name: row[0] || "",
      email: row[1] || "",
      phone: row[2] || "",
      position: row[3] || "",
      experience: row[4] || "",
      skills: row[5] ? row[5].split(",").map((s: string) => s.trim()) : [],
      status: (row[6] as "hired" | "interview" | "pending" | "rejected") || "pending",
      salary: parseInt(row[7]) || 0,
      recruiter: row[8] || "",
      client: row[9] || "",
      appliedDate: row[10] || "",
      location: row[11] || "",
    }));
  }

  private parseClientsData(response: any): ClientData[] {
    if (!response.values || response.values.length < 2) return [];
    
    const rows = response.values.slice(1);
    
    return rows.map((row: any[], index: number) => ({
      id: index + 1,
      name: row[0] || "",
      company: row[1] || "",
      email: row[2] || "",
      phone: row[3] || "",
      industry: row[4] || "",
      totalHired: parseInt(row[5]) || 0,
      avgDaysToFill: parseInt(row[6]) || 0,
      status: (row[7] as "active" | "pending" | "inactive") || "active",
      location: row[8] || "",
      lastActivity: row[9] || "",
    }));
  }

  private parsePerformanceData(response: any): PerformanceData[] {
    if (!response.values || response.values.length < 2) return [];
    
    const rows = response.values.slice(1);
    
    return rows.map((row: any[]) => ({
      month: row[0] || "",
      recruiters: parseInt(row[1]) || 0,
      hired: parseInt(row[2]) || 0,
      target: parseInt(row[3]) || 0,
    }));
  }

  async fetchRecruiters(): Promise<RecruiterData[]> {
    // Return imported data, empty array if no data imported
    return importedRecruiters;
  }

  async fetchClients(): Promise<ClientData[]> {
    // Return imported data, empty array if no data imported
    return importedClients;
  }

  async fetchCandidates(): Promise<CandidateData[]> {
    // Return imported data, empty array if no data imported
    return importedCandidates;
  }

  async fetchPerformanceData(): Promise<PerformanceData[]> {
    // Return imported data, empty array if no data imported
    return importedPerformanceData;
  }

  // Check if data has been imported
  hasImportedData(): boolean {
    return importedRecruiters.length > 0 || 
           importedCandidates.length > 0 || 
           importedClients.length > 0 || 
           importedPerformanceData.length > 0;
  }

  // Clear all imported data
  clearData(): void {
    importedRecruiters = [];
    importedClients = [];
    importedCandidates = [];
    importedPerformanceData = [];
  }

  // Get filtered recruiters by various criteria
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
