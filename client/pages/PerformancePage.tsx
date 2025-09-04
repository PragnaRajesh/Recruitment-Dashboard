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
  IndianRupee,
  Award,
} from "lucide-react";
import { dataService } from "@/services/dataService";

// Sample performance data for different time periods
const performanceData = [
  {
    month: "Jan",
    hired: 123,
    target: 150,
    revenue: 6150000,
    recruiters: 45,
    arpu: 50000,
  },
  {
    month: "Feb",
    hired: 145,
    target: 150,
    revenue: 7250000,
    recruiters: 52,
    arpu: 50000,
  },
  {
    month: "Mar",
    hired: 132,
    target: 150,
    revenue: 6600000,
    recruiters: 48,
    arpu: 50000,
  },
  {
    month: "Apr",
    hired: 168,
    target: 150,
    revenue: 8400000,
    recruiters: 61,
    arpu: 50000,
  },
  {
    month: "May",
    hired: 155,
    target: 150,
    revenue: 7750000,
    recruiters: 55,
    arpu: 50000,
  },
  {
    month: "Jun",
    hired: 172,
    target: 150,
    revenue: 8600000,
    recruiters: 58,
    arpu: 50000,
  },
];

const departmentPerformance = [
  { department: "Technology", hired: 45, target: 50, achievement: 90 },
  { department: "Banking", hired: 38, target: 40, achievement: 95 },
  { department: "Healthcare", hired: 32, target: 35, achievement: 91 },
  { department: "Manufacturing", hired: 28, target: 30, achievement: 93 },
  { department: "IT Services", hired: 42, target: 45, achievement: 93 },
  { department: "Consulting", hired: 25, target: 25, achievement: 100 },
];

const regionPerformance = [
  { region: "Mumbai", hired: 78, revenue: 3900000, arpu: 50000 },
  { region: "Bangalore", hired: 65, revenue: 3250000, arpu: 50000 },
  { region: "Delhi", hired: 58, revenue: 2900000, arpu: 50000 },
  { region: "Hyderabad", hired: 52, revenue: 2600000, arpu: 50000 },
  { region: "Pune", hired: 45, revenue: 2250000, arpu: 50000 },
  { region: "Chennai", hired: 42, revenue: 2100000, arpu: 50000 },
];

export default function PerformancePage() {
  const [timeRange, setTimeRange] = useState("6m");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("hired");

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Performance data refreshed");
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    const csvData = performanceData
      .map(
        (item) =>
          `${item.month},${item.hired},${item.target},${item.revenue},${item.recruiters},${item.arpu}`,
      )
      .join("\n");

    const blob = new Blob(
      [`Month,Hired,Target,Revenue,Recruiters,ARPU\n${csvData}`],
      { type: "text/csv" },
    );
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
  const totalRevenue = performanceData.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );
  const overallAchievement = Math.round((totalHired / totalTarget) * 100);
  const avgARPU = dataService.calculateARPU(totalRevenue, totalHired);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                  <span className="text-emerald-400 text-xs">+15.2%</span>
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
                  <span className="text-blue-400 text-xs">+5.8%</span>
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
                <p className="text-purple-200 text-sm font-medium">Revenue</p>
                <p className="text-2xl font-bold text-white">
                  ₹{(totalRevenue / 10000000).toFixed(1)}Cr
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-purple-400 mr-1" />
                  <span className="text-purple-400 text-xs">+12.4%</span>
                </div>
              </div>
              <IndianRupee className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm font-medium">ARPU</p>
                <p className="text-2xl font-bold text-white">
                  ₹{(avgARPU / 1000).toFixed(0)}K
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-orange-400 mr-1" />
                  <span className="text-orange-400 text-xs">+3.2%</span>
                </div>
              </div>
              <Target className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm font-medium">Avg/Month</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(totalHired / 6)}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="text-yellow-400 text-xs">+8.1%</span>
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
          </CardContent>
        </Card>

        {/* Revenue Trend Chart */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Revenue & ARPU Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                  name="Revenue (₹)"
                />
              </AreaChart>
            </ResponsiveContainer>
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
                      ₹{(region.revenue / 100000).toFixed(1)}L
                    </p>
                    <p className="text-slate-400 text-sm">
                      ARPU: ₹{(region.arpu / 1000).toFixed(0)}K
                    </p>
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
