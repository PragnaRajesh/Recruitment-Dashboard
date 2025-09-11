import { SheetsConfig } from '../models';
import { importSheetsAndSave } from './sheetsService';
import { SheetsConfig } from '../models';

type ConfigDoc = any;

const intervals: Map<string, NodeJS.Timeout> = new Map();
// rate limit history: timestamps of recent runs per spreadsheet
const runHistory: Map<string, number[]> = new Map();
const MAX_IMPORTS_PER_MINUTE = 20; // safety cap to protect API quota

export async function saveSheetsConfig(config: ConfigDoc) {
  // upsert by spreadsheetId
  const doc = await SheetsConfig.findOneAndUpdate(
    { spreadsheetId: config.spreadsheetId },
    {
      spreadsheetId: config.spreadsheetId,
      apiKey: config.apiKey,
      ranges: config.ranges,
      autoRefresh: !!config.autoRefresh,
      // preserve explicit numeric values (including sub-minute values)
      refreshIntervalMinutes: typeof config.refreshIntervalMinutes === 'number' ? config.refreshIntervalMinutes : 60,
    },
    { upsert: true, new: true }
  ).exec();

  // start/stop scheduler according to autoRefresh
  if (doc.autoRefresh) {
    startJobForConfig(doc);
  } else {
    stopJobForConfig(doc.spreadsheetId);
  }

  return doc;
}

export async function getAllSheetsConfigs() {
  return SheetsConfig.find().lean().exec();
}

function startJobForConfig(doc: any) {
  const key = doc.spreadsheetId;
  stopJobForConfig(key);

  const minutes = typeof doc.refreshIntervalMinutes === 'number' ? doc.refreshIntervalMinutes : 60;
  // Allow sub-minute intervals (minimum 0.05 minutes = 3s)
  const ms = Math.max(0.05, minutes) * 60 * 1000;

  const run = async () => {
    try {
      // Rate limiting: track runs in the last 60s
      const now = Date.now();
      const windowStart = now - 60_000;
      const hist = (runHistory.get(key) || []).filter((t) => t >= windowStart);
      if (hist.length >= MAX_IMPORTS_PER_MINUTE) {
        console.warn(`Rate limit hit for ${key}: ${hist.length} imports in last minute; skipping this run.`);
        runHistory.set(key, hist);
        return;
      }
      hist.push(now);
      runHistory.set(key, hist);

      // call import & save
      await importSheetsAndSave({
        spreadsheetId: doc.spreadsheetId,
        apiKey: doc.apiKey,
        ranges: doc.ranges,
      });
      await SheetsConfig.findOneAndUpdate({ spreadsheetId: key }, { lastRunAt: new Date() }).exec();
      console.log(`Auto-refreshed sheets for ${key} at ${new Date().toISOString()}`);
    } catch (err) {
      console.error('Scheduled import failed for', key, err && (err as any).message ? (err as any).message : err);
    }
  };

  // Run immediately then schedule
  run();
  const t = setInterval(run, ms);
  intervals.set(key, t);
}

function stopJobForConfig(spreadsheetId: string) {
  const t = intervals.get(spreadsheetId);
  if (t) {
    clearInterval(t);
    intervals.delete(spreadsheetId);
  }
  // clear history as well
  runHistory.delete(spreadsheetId);
}

export async function startScheduledJobs() {
  // find all configs with autoRefresh true and start jobs
  const docs = await SheetsConfig.find({ autoRefresh: true }).lean().exec();
  docs.forEach((doc) => startJobForConfig(doc));
}

export function stopAllJobs() {
  intervals.forEach((t) => clearInterval(t));
  intervals.clear();
  runHistory.clear();
}
