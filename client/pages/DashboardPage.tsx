import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
  UserCheck,
  Upload,
  AlertCircle,
} from "lucide-react";
import {
  dataService,
  type RecruiterData,
  type PerformanceData,
  type GoogleSheetsConfig,
} from "@/services/dataService";
import { useGlobalContext } from "@/context/GlobalContext";

// Google Sheets Import Dialog Component
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ConnectSheetsBar({ onConnect }: { onConnect: (config: any) => void }) {
  const [sheetLink, setSheetLink] = useState("");

  const connect = async () => {
    const idMatch =
      sheetLink.match(/spreadsheets\/d\/([-_a-zA-Z0-9]+)|[&?]id=([-_a-zA-Z0-9]+)/) ||
      sheetLink.match(/^[-_a-zA-Z0-9]+$/);

    let spreadsheetId = "";
    if (Array.isArray(idMatch)) {
      spreadsheetId = idMatch[1] || idMatch[2] || (typeof idMatch[0] === "string" ? idMatch[0] : "");
    }

    if (!spreadsheetId) {
      alert("Invalid Google Sheet link or ID.");
      return;
    }

    // Optional: extract gid for public CSV endpoints
    const gidMatch = sheetLink.match(/[?&]gid=([0-9]+)/);
    const gid = gidMatch && gidMatch[1] ? gidMatch[1] : undefined;

    const cfg: any = {
      spreadsheetId,
      sheetLink,
      gid,
      ranges: {
        recruiters: "Recruiters!A:J",
        candidates: "Candidates!A:L",
        clients: "Clients!A:J",
        performance: "Performance!A:D",
      },
      // silently save config server-side and enable server auto-refresh by default
      saveConfig: true,
      autoRefresh: true,
      refreshIntervalMinutes: 60,
    };

    onConnect(cfg);
    setSheetLink("");
  };

  return (
    <div className="flex items-center gap-2 w-full max-w-xl">
      <Input
        value={sheetLink}
        onChange={(e) => setSheetLink(e.target.value)}
        placeholder="Paste Google Sheets link or ID"
        className="bg-slate-800 border-slate-600 text-white"
      />

      <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={connect}>
        <span className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          <span>Connect</span>
        </span>
      </Button>
    </div>
  );
}

export default function DashboardPage() {
  const {
    selectedRecruiter,
    setSelectedRecruiter,
    hasImportedData,
    setHasImportedData,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
  } = useGlobalContext();
  const [timeRange, setTimeRange] = useState("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [recruiters, setRecruiters] = useState<RecruiterData[]>([]);
  const [performanceDataState, setPerformanceDataState] = useState<
    PerformanceData[]
  >([]);
  const [hasData, setHasData] = useState(false);

  // Initialize without hitting the server automatically. If cached/imported data exists, use it.
  useEffect(() => {
    const imported = dataService.hasImportedData();
    setHasData(imported);
    setHasImportedData(imported);
    if (imported) {
      // attempt to populate UI from in-memory cache (no network)
      // call fetchRecruiters/fetchPerformanceData which will return cached data if server is unreachable
      (async () => {
        const recs = await dataService.fetchRecruiters();
        const perf = await dataService.fetchPerformanceData();
        setRecruiters(recs);
        setPerformanceDataState(perf);
      })();
    }
  }, []);


  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const filters: any = {};
      if (selectedMonth) filters.month = selectedMonth;
      if (selectedYear) filters.year = selectedYear;
      if (selectedRecruiter) filters.recruiter = selectedRecruiter;

      const recruitersData = await dataService.fetchRecruiters(filters);
      const performanceData = await dataService.fetchPerformanceData(filters);
      const clientsData = await dataService.fetchClients(filters);
      const candidatesData = await dataService.fetchCandidates(filters);

      setRecruiters(recruitersData);
      setPerformanceDataState(performanceData);
      // Note: components/pages fetch their own data; we update local caches as well
      const dataImported = dataService.hasImportedData();
      setHasData(dataImported);
      setHasImportedData(dataImported);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResync = async () => {
    setIsImporting(true);
    try {
      // fetch saved configs
      const cfgRes = await dataService.requestApi('/sheets-configs');
      if (!cfgRes || !cfgRes.ok) throw new Error('No saved config found');
      const cfgs = await cfgRes.json().catch(() => []);
      if (!cfgs || cfgs.length === 0) throw new Error('No saved config found');
      const cfg = cfgs[0];
      const importRes = await dataService.requestApi('/import-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });
      if (!importRes || !importRes.ok) {
        const body = await importRes.json().catch(() => ({}));
        throw new Error(body && body.error ? body.error : 'Import failed');
      }
      const data = await importRes.json();
      setRecruiters(data.recruiters || []);
      setPerformanceDataState(data.performance || []);
      // refresh saved configs list (to get updated lastRunAt)
      // refresh configs metadata (not used in UI)
      try {
        const cfgsRes2 = await dataService.requestApi('/sheets-configs');
        // ignore response
      } catch (e) {
        // ignore
      }
      // update imported state
      const dataImported = dataService.hasImportedData();
      setHasData(dataImported);
      setHasImportedData(dataImported);
      
      alert('Resync completed');
    } catch (e: any) {
      console.error('Resync failed', e);
      alert('Resync failed: ' + (e?.message || e));
    } finally {
      setIsImporting(false);
    }
  };

  const handleImport = async (config: GoogleSheetsConfig) => {
    setIsImporting(true);

    const spreadsheetId = (config as any).spreadsheetId || String((config as any).sheetLink || '').match(/spreadsheets\/d\/([-_a-zA-Z0-9]+)/)?.[1] || '';
    const gid = (config as any).gid as string | undefined;

    // First, try server import (uses API key or service account and works around CORS).
    try {
      if ((config as any).saveConfig) {
        // Save config so server can auto-refresh even if immediate import fails
        try {
          const saveRes = await dataService.requestApi('/save-sheets-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              spreadsheetId: (config as any).spreadsheetId,
              apiKey: (config as any).apiKey,
              ranges: config.ranges,
              autoRefresh: !!(config as any).autoRefresh,
              refreshIntervalMinutes: Number((config as any).refreshIntervalMinutes) || 60,
            }),
          });
          if (saveRes && saveRes.ok) {
            // refresh saved configs state so UI hides import field
            // refresh configs metadata (not used in UI)
            try { await dataService.requestApi('/sheets-configs'); } catch (e) { /* ignore */ }
          }
        } catch (e) {
          console.warn('Saving sheets config failed before import', e);
        }
      }

      dataService.setGoogleSheetsConfig(config);
      const serverRes = await dataService.importFromGoogleSheets();
      if (serverRes && (serverRes.recruiters.length || serverRes.candidates.length || serverRes.clients.length || serverRes.performance.length)) {
        setRecruiters(serverRes.recruiters);
        setPerformanceDataState(serverRes.performance);
        const dataImported = dataService.hasImportedData();
        setHasData(dataImported);
        setHasImportedData(dataImported);
        setSelectedRecruiter('all');
        
        setIsImporting(false);
        return;
      }
    } catch (err: any) {
      console.warn('Server import failed, will attempt published CSV fallback if appropriate', err?.message || err);
      // if server error indicates Google Sheets access not configured, try published CSV fallback
      const msg = err && err.message ? String(err.message).toLowerCase() : '';
      if (!msg.includes('google sheets access not configured') && !msg.includes('network request failed')) {
        // If server failed for other reasons, rethrow to show error to user later
        console.error('Server import failed with unexpected error:', err);
      }
    }

    // If server import didn't yield data or failed due to access, try published CSV client-side
    try {
      if (spreadsheetId) {
        await handleImportPublished(spreadsheetId, gid);
        
        return;
      }
    } catch (fallbackErr) {
      console.error('Client-side published import failed:', fallbackErr);
      const msg = (fallbackErr && (fallbackErr as any).message) || String(fallbackErr) || 'Import failed';
      alert(`Import failed: ${msg}. You can try publishing the sheet to the web and ensure headers are named (e.g., Name, Email, Hired).`);
    } finally {
      setIsImporting(false);
    }
  };


  const handleImportPublished = async (spreadsheetId: string, gid?: string, singleSheet?: boolean) => {
    setIsImporting(true);
    try {
      let res;
      if (singleSheet) {
        res = await dataService.importSingleSheet(spreadsheetId, gid);
      } else {
        res = await dataService.importFromPublishedSheets(spreadsheetId, gid);
      }
      if (!res || (!res.recruiters.length && !res.performance.length && !res.clients.length && !res.candidates.length)) {
        // alert('No data found in the expected sheets. Ensure the sheet contains tabs named Recruiters, Candidates, Clients, or Performance, or publish the sheet to the web. If your sheet only has a single table, enable the "single-sheet import" option.');
          alert(res.error);
        return;
      }
      setRecruiters(res.recruiters);
      setPerformanceDataState(res.performance);
      const dataImported = dataService.hasImportedData();
      setHasData(dataImported);
      setHasImportedData(dataImported);
      setSelectedRecruiter("all");
    } catch (error) {
      console.error("Error importing published sheet:", error);
      alert("Failed to import data from published sheet. Ensure the sheet is viewable/published and that CORS allows fetching. If that doesn't work, try publishing the sheet (File → Publish to web) and use the generated CSV link.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleUploadCsv = async (file: File) => {
    setIsImporting(true);
    try {
      const res = await dataService.importFromCsvFile(file);
      if (!res || (!res.recruiters.length && !res.performance.length && !res.clients.length && !res.candidates.length)) {
        alert('Uploaded CSV did not contain usable data.');
        return;
      }
      setRecruiters(res.recruiters);
      setPerformanceDataState(res.performance);
      const dataImported = dataService.hasImportedData();
      setHasData(dataImported);
      setHasImportedData(dataImported);
      setSelectedRecruiter('all');
    } catch (err) {
      console.error('CSV import failed:', err);
      alert('Failed to import CSV file.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = () => {
    if (!hasImportedData) {
      alert("No data to export. Please import data first.");
      return;
    }

    const csvData = performanceDataState
      .map(
        (item) =>
          `${item.month},${item.recruiters},${item.hired},${item.target}`,
      )
      .join("\n");

    const blob = new Blob([`Month,Recruiters,Hired,Target\n${csvData}`], {
      type: "text/csv",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recruitment-dashboard-data.csv";
    a.click();
  };

  // Calculate metrics
  const totalHired = performanceDataState.reduce(
    (sum, item) => sum + item.hired,
    0,
  );
  const activeRecruiters = recruiters.filter(
    (r) => r.status === "active",
  ).length;
  const totalTarget = performanceDataState.reduce(
    (sum, item) => sum + item.target,
    0,
  );
  const achievement =
    totalTarget > 0 ? Math.round((totalHired / totalTarget) * 100) : 0;

  // Filter data by selected recruiter
  const filteredRecruiters =
    selectedRecruiter === "all"
      ? recruiters
      : recruiters.filter((r) => r.name === selectedRecruiter);

  // Get top performers
  const topPerformers = [...recruiters]
    .sort((a, b) => b.hired - a.hired)
    .slice(0, 4);

  const pieData: any[] = [];

  const recentActivity: any[] = [];

  // No data state
  if (!hasImportedData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Recruitment Dashboard
            </h1>
            <p className="text-slate-400">
              Import data from Google Sheets to get started
            </p>
          </div>
          <div className="flex items-center gap-3">
            
          </div>
        </div>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Data Available
            </h3>
            <p className="text-slate-400 mb-6">
              Connect your Google Sheets to import recruitment data and start
              tracking performance.
            </p>
            
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Recruitment Dashboard
          </h1>
          <p className="text-slate-400">
            Track performance, manage recruiters, and analyze hiring metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month & Year selectors */}
          <Select value={selectedMonth || ""} onValueChange={(v) => setSelectedMonth(v || undefined)}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Month (YYYY-MM)" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="">All Months</SelectItem>
              {/* Provide last 24 months options */}
              {Array.from({ length: 24 }).map((_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const val = d.toISOString().slice(0,7);
                return (
                  <SelectItem key={val} value={val}>
                    {val}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select value={selectedYear || ""} onValueChange={(v) => setSelectedYear(v || undefined)}>
            <SelectTrigger className="w-28 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="">All Years</SelectItem>
              {Array.from({ length: 6 }).map((_, i) => {
                const y = new Date().getFullYear() - i;
                return (
                  <SelectItem key={String(y)} value={String(y)}>
                    {y}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Recruiter Selection Dropdown */}
          <Select
            value={selectedRecruiter}
            onValueChange={setSelectedRecruiter}
          >
            <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Select Recruiter" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Recruiters</SelectItem>
              {recruiters.map((recruiter, index) => (
                <SelectItem key={`${recruiter.id ?? recruiter.email ?? recruiter.name ?? index}`} value={recruiter.name}>
                  {recruiter.name} - {recruiter.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
            onClick={fetchData}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Fetch Data
          </Button>

          
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-sm font-medium">
                  Total Hired
                </p>
                <p className="text-3xl font-bold text-white">
                  {totalHired.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400 mr-1" />
                  <span className="text-emerald-400 text-sm font-medium">
                    Performance
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">
                  Active Recruiters
                </p>
                <p className="text-3xl font-bold text-white">
                  {activeRecruiters}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-blue-400 mr-1" />
                  <span className="text-blue-400 text-sm font-medium">
                    Team
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">
                  Achievement
                </p>
                <p className="text-3xl font-bold text-white">{achievement}%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-purple-400 mr-1" />
                  <span className="text-purple-400 text-sm font-medium">
                    vs Target
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm font-medium">
                  Monthly Avg
                </p>
                <p className="text-3xl font-bold text-white">
                  {performanceDataState.length > 0
                    ? Math.round(totalHired / performanceDataState.length)
                    : 0}
                </p>
                <p className="text-orange-200 text-xs">Average per month</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-orange-400 mr-1" />
                  <span className="text-orange-400 text-sm font-medium">
                    Trend
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">
              Hiring Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {performanceDataState.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceDataState}>
                  <defs>
                    <linearGradient id="colorHired" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hired"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorHired)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-slate-400">
                No performance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hiring Status Pie Chart */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Hiring Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col space-y-2 mt-4">
              {pieData.map((item, index) => (
                <div
                  key={`${item.name || 'slice'}-${index}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-300 text-sm">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">
              Top Performers {selectedRecruiter !== "all" && `- ${selectedRecruiter}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.length > 0 ? (
                topPerformers.map((performer, index) => (
                  <div
                    key={`${performer.name || 'performer'}-${index}`}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {performer.name}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {performer.hired} hired • {performer.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold">
                        {performer.hired} hired
                      </p>
                      <div className="flex items-center justify-end">
                        {performer.trend === "up" ? (
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-8">
                  No performance data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={activity.id ?? `activity-${index}`}
                  className="flex items-start space-x-3 p-3 bg-slate-700/30 rounded-lg"
                >
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      <span className="font-medium">{activity.recruiter}</span> {activity.action}
                    </p>
                    <p className="text-emerald-400 text-sm">
                      {activity.client}
                    </p>
                    <p className="text-slate-400 text-xs">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
