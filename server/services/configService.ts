import { SheetsConfig } from '../models';
import { importSheetsAndSave } from './sheetsService';

type ConfigDoc = any;

const intervals: Map<string, NodeJS.Timeout> = new Map();

export async function saveSheetsConfig(config: ConfigDoc) {
  // upsert by spreadsheetId
  const doc = await SheetsConfig.findOneAndUpdate(
    { spreadsheetId: config.spreadsheetId },
    {
      spreadsheetId: config.spreadsheetId,
      apiKey: config.apiKey,
      ranges: config.ranges,
      autoRefresh: !!config.autoRefresh,
      refreshIntervalMinutes: config.refreshIntervalMinutes || 60,
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

  const minutes = doc.refreshIntervalMinutes || 60;
  const ms = Math.max(1, minutes) * 60 * 1000;

  const run = async () => {
    try {
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
}

export async function startScheduledJobs() {
  // find all configs with autoRefresh true and start jobs
  const docs = await SheetsConfig.find({ autoRefresh: true }).lean().exec();
  docs.forEach((doc) => startJobForConfig(doc));
}

export function stopAllJobs() {
  intervals.forEach((t) => clearInterval(t));
  intervals.clear();
}
