import mongoose, { Schema, Document } from 'mongoose';

export interface IRecruiter extends Document {
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  territory?: string;
  hired: number;
  joinDate?: string;
  status: 'active' | 'inactive' | 'pending';
  trend: 'up' | 'down';
  location?: string;
}

export const RecruiterSchema = new Schema<IRecruiter>({
  name: { type: String, required: true },
  email: String,
  phone: String,
  department: String,
  territory: String,
  hired: { type: Number, default: 0 },
  joinDate: String,
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  trend: { type: String, enum: ['up', 'down'], default: 'up' },
  location: String,
});

export interface ICandidate extends Document {
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  experience?: string;
  skills: string[];
  status: 'hired' | 'interview' | 'pending' | 'rejected';
  salary?: number;
  recruiter?: string;
  client?: string;
  appliedDate?: string;
  location?: string;
}

export const CandidateSchema = new Schema<ICandidate>({
  name: { type: String, required: true },
  email: String,
  phone: String,
  position: String,
  experience: String,
  skills: { type: [String], default: [] },
  status: { type: String, enum: ['hired','interview','pending','rejected'], default: 'pending' },
  salary: Number,
  recruiter: String,
  client: String,
  appliedDate: String,
  location: String,
});

export interface IClient extends Document {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  industry?: string;
  totalHired?: number;
  avgDaysToFill?: number;
  status?: 'active' | 'pending' | 'inactive';
  location?: string;
  lastActivity?: string;
}

export const ClientSchema = new Schema<IClient>({
  name: { type: String, required: true },
  company: String,
  email: String,
  phone: String,
  industry: String,
  totalHired: Number,
  avgDaysToFill: Number,
  status: { type: String, enum: ['active','pending','inactive'], default: 'active' },
  location: String,
  lastActivity: String,
});

export interface IPerformance extends Document {
  month: string;
  recruiters: number;
  hired: number;
  target: number;
}

export const PerformanceSchema = new Schema<IPerformance>({
  month: { type: String, required: true },
  recruiters: { type: Number, default: 0 },
  hired: { type: Number, default: 0 },
  target: { type: Number, default: 0 },
});

export const Recruiter = mongoose.models.Recruiter || mongoose.model<IRecruiter>('Recruiter', RecruiterSchema);
export const Candidate = mongoose.models.Candidate || mongoose.model<ICandidate>('Candidate', CandidateSchema);
export const Client = mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
export const Performance = mongoose.models.Performance || mongoose.model<IPerformance>('Performance', PerformanceSchema);

// Sheets config schema
export interface ISheetsConfig extends Document {
  spreadsheetId: string;
  apiKey?: string;
  ranges: {
    recruiters: string;
    candidates: string;
    clients: string;
    performance: string;
  };
  autoRefresh: boolean;
  refreshIntervalMinutes: number;
  lastRunAt?: Date;
}

export const SheetsConfigSchema = new Schema<ISheetsConfig>({
  spreadsheetId: { type: String, required: true, unique: true },
  apiKey: { type: String, required: false },
  ranges: {
    recruiters: String,
    candidates: String,
    clients: String,
    performance: String,
  },
  autoRefresh: { type: Boolean, default: false },
  refreshIntervalMinutes: { type: Number, default: 60 },
  lastRunAt: Date,
}, { timestamps: true });

export const SheetsConfig = mongoose.models.SheetsConfig || mongoose.model<ISheetsConfig>('SheetsConfig', SheetsConfigSchema);
