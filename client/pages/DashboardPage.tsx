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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ImportDialog = ({ onImport }: { onImport: (config: GoogleSheetsConfig) => void }) => {
  const [config, setConfig] = useState<GoogleSheetsConfig>({
    spreadsheetId: "",
    apiKey: "",
    ranges: {
      recruiters: "Recruiters!A:J",
      candidates: "Candidates!A:L",
      clients: "Clients!A:J",
      performance: "Performance!A:D",
    },
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleImport = () => {
    onImport(config);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Upload className="w-4 h-4 mr-2" />
          Import from Google Sheets
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Import from Google Sheets</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="spreadsheetId" className="text-slate-300">Spreadsheet ID</Label>
            <Input
              id="spreadsheetId"
              value={config.spreadsheetId}
              onChange={(e) => setConfig({ ...config, spreadsheetId: e.target.value })}
              placeholder="Enter Google Sheets ID"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="apiKey" className="text-slate-300">API Key</Label>
            <Input
              id="apiKey"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="Enter Google Sheets API Key"
              className="bg-slate-700 border-slate-600 text-white"
              type="password"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recruitersRange" className="text-slate-300">Recruiters Range</Label>
              <Input
                id="recruitersRange"
                value={config.ranges.recruiters}
                onChange={(e) => setConfig({ 
                  ...config, 
                  ranges: { ...config.ranges, recruiters: e.target.value }
                })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="candidatesRange" className="text-slate-300">Candidates Range</Label>
              <Input
                id="candidatesRange"
                value={config.ranges.candidates}
                onChange={(e) => setConfig({ 
                  ...config, 
                  ranges: { ...config.ranges, candidates: e.target.value }
                })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          <Button onClick={handleImport} className="w-full bg-emerald-600 hover:bg-emerald-700">
            Import Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function DashboardPage() {
  const { selectedRecruiter, setSelectedRecruiter, hasImportedData, setHasImportedData } = useGlobalContext();
  const [timeRange, setTimeRange] = useState("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [recruiters, setRecruiters] = useState<RecruiterData[]>([]);
  const [performanceDataState, setPerformanceDataState] = useState<PerformanceData[]>([]);
  const [hasData, setHasData] = useState(false);

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const recruitersData = await dataService.fetchRecruiters();
      const performanceData = await dataService.fetchPerformanceData();
      setRecruiters(recruitersData);
      setPerformanceDataState(performanceData);
      const dataImported = dataService.hasImportedData();
      setHasData(dataImported);
      setHasImportedData(dataImported);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleImport = async (config: GoogleSheetsConfig) => {
    setIsImporting(true);
    try {
      dataService.setGoogleSheetsConfig(config);
      await dataService.importFromGoogleSheets();
      await fetchData();
      // Reset recruiter filter when new data is imported
      setSelectedRecruiter("all");
    } catch (error) {
      console.error("Error importing data:", error);
      alert("Failed to import data. Please check your configuration.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = () => {
    if (!hasData) {
      alert("No data to export. Please import data first.");
      return;
    }

    const csvData = performanceDataState
      .map((item) => `${item.month},${item.recruiters},${item.hired},${item.target}`)
      .join("\n");

    const blob = new Blob(
      [`Month,Recruiters,Hired,Target\n${csvData}`],
      { type: "text/csv" },
    );
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
  const achievement = totalTarget > 0 ? Math.round((totalHired / totalTarget) * 100) : 0;

  // Filter data by selected recruiter
  const filteredRecruiters = selectedRecruiter === "all" 
    ? recruiters 
    : recruiters.filter((r) => r.name === selectedRecruiter);

  // Get top performers
  const topPerformers = [...recruiters]
    .sort((a, b) => b.hired - a.hired)
    .slice(0, 4);

  // Sample pie data for hiring status
  const pieData = [
    { name: "Hired", value: 68, color: "#10b981" },
    { name: "In Process", value: 22, color: "#f59e0b" },
    { name: "Pending", value: 10, color: "#ef4444" },
  ];

  // Sample recent activity
  const recentActivity = [
    {
      id: 1,
      recruiter: "Latest hire",
      action: "Candidate hired",
      client: "Client",
      time: "Recently",
    },
    {
      id: 2,
      recruiter: "Recent interview",
      action: "Interview scheduled",
      client: "Client",
      time: "Recently",
    },
  ];

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
            <ImportDialog onImport={handleImport} />
          </div>
        </div>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
            <p className="text-slate-400 mb-6">
              Connect your Google Sheets to import recruitment data and start tracking performance.
            </p>
            <ImportDialog onImport={handleImport} />
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
              {recruiters.map((recruiter) => (
                <SelectItem key={recruiter.id} value={recruiter.name}>
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

          <ImportDialog onImport={handleImport} />

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

      {/* KPI Cards */}
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
                <p className="text-3xl font-bold text-white">
                  {achievement}%
                </p>
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
                <p className="text-orange-200 text-sm font-medium">Monthly Avg</p>
                <p className="text-3xl font-bold text-white">
                  {performanceDataState.length > 0 
                    ? Math.round(totalHired / performanceDataState.length)
                    : 0}
                </p>
                <p className="text-orange-200 text-xs">
                  Average per month
                </p>
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
              {pieData.map((item) => (
                <div
                  key={item.name}
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
              Top Performers{" "}
              {selectedRecruiter !== "all" && `- ${selectedRecruiter}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.length > 0 ? (
                topPerformers.map((performer, index) => (
                  <div
                    key={performer.name}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{performer.name}</p>
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
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 bg-slate-700/30 rounded-lg"
                >
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      <span className="font-medium">{activity.recruiter}</span>{" "}
                      {activity.action}
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
