import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  RefreshCw,
  Download,
  Calendar,
  Award,
  AlertCircle,
} from "lucide-react";
import { dataService, type PerformanceData } from "@/services/dataService";

export default function PerformancePage() {
  const [timeRange, setTimeRange] = useState("6m");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("hired");
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [hasData, setHasData] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const data = await dataService.fetchPerformanceData();
      setPerformanceData(data);
      setHasData(dataService.hasImportedData());
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    if (!hasData) {
      alert("No data to export. Please import data first.");
      return;
    }

    const csvData = performanceData
      .map(
        (item) =>
          `${item.month},${item.hired},${item.target},${item.recruiters}`,
      )
      .join("\n");

    const blob = new Blob([`Month,Hired,Target,Recruiters\n${csvData}`], {
      type: "text/csv",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "performance-analysis.csv";
    a.click();
  };

  // Calculate key metrics
  const totalHired = performanceData.reduce((sum, item) => sum + item.hired, 0);
  const totalTarget = performanceData.reduce(
    (sum, item) => sum + item.target,
    0,
  );
  const overallAchievement =
    totalTarget > 0 ? Math.round((totalHired / totalTarget) * 100) : 0;
  const avgRecruiters =
    performanceData.length > 0
      ? Math.round(
          performanceData.reduce((sum, item) => sum + item.recruiters, 0) /
            performanceData.length,
        )
      : 0;

  // Sample department performance (would be calculated from actual data)
  const departmentPerformance = [
    { department: "Technology", hired: 45, target: 50, achievement: 90 },
    { department: "Banking", hired: 38, target: 40, achievement: 95 },
    { department: "Healthcare", hired: 32, target: 35, achievement: 91 },
    { department: "Manufacturing", hired: 28, target: 30, achievement: 93 },
    { department: "IT Services", hired: 42, target: 45, achievement: 93 },
    { department: "Consulting", hired: 25, target: 25, achievement: 100 },
  ];

  // Sample region performance (would be calculated from actual data)
  const regionPerformance = [
    { region: "Mumbai", hired: 78 },
    { region: "Bangalore", hired: 65 },
    { region: "Delhi", hired: 58 },
    { region: "Hyderabad", hired: 52 },
    { region: "Pune", hired: 45 },
    { region: "Chennai", hired: 42 },
  ];

  // No data state
  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Performance Analytics
            </h1>
            <p className="text-slate-400">
              Import data to view performance insights
            </p>
          </div>
        </div>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Performance Data
            </h3>
            <p className="text-slate-400 mb-6">
              Please import data from Google Sheets on the Dashboard to view
              performance analytics.
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
            Performance Analytics
          </h1>
          <p className="text-slate-400">
            Comprehensive performance tracking and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
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
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
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
                <p className="text-2xl font-bold text-white">{totalHired}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400 mr-1" />
                  <span className="text-emerald-400 text-xs">Performance</span>
                </div>
              </div>
              <Target className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Achievement</p>
                <p className="text-2xl font-bold text-white">
                  {overallAchievement}%
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-blue-400 mr-1" />
                  <span className="text-blue-400 text-xs">vs Target</span>
                </div>
              </div>
              <Award className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">
                  Avg Recruiters
                </p>
                <p className="text-2xl font-bold text-white">{avgRecruiters}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-purple-400 mr-1" />
                  <span className="text-purple-400 text-xs">Team Size</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm font-medium">Avg/Month</p>
                <p className="text-2xl font-bold text-white">
                  {performanceData.length > 0
                    ? Math.round(totalHired / performanceData.length)
                    : 0}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="text-yellow-400 text-xs">Monthly</span>
                </div>
              </div>
              <Calendar className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend Chart */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">
              Performance vs Target Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={performanceData}>
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
                  <Bar dataKey="hired" fill="#10b981" name="Hired" />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Target"
                    strokeDasharray="5 5"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-slate-400">
                No performance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recruiters Trend Chart */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">
              Recruiters & Hiring Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient
                      id="colorRecruiters"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
                    dataKey="recruiters"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorRecruiters)"
                    strokeWidth={2}
                    name="Recruiters"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-slate-400">
                No recruiter data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department and Region Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentPerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis
                  dataKey="department"
                  type="category"
                  stroke="#9ca3af"
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="hired" fill="#10b981" name="Hired" />
                <Bar dataKey="target" fill="#374151" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Region Performance */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Regional Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionPerformance.map((region, index) => (
                <div
                  key={region.region}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{region.region}</p>
                      <p className="text-slate-400 text-sm">
                        {region.hired} hired
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold">
                      {region.hired} hired
                    </p>
                    <div className="flex items-center justify-end">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
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
