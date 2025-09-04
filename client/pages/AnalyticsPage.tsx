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
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  Download,
  Filter,
  IndianRupee,
  Clock,
  Users,
  Target,
} from "lucide-react";

// Sample analytics data
const hiringTrends = [
  {
    month: "Jan",
    technology: 45,
    banking: 32,
    healthcare: 28,
    manufacturing: 22,
  },
  {
    month: "Feb",
    technology: 52,
    banking: 38,
    healthcare: 31,
    manufacturing: 25,
  },
  {
    month: "Mar",
    technology: 48,
    banking: 35,
    healthcare: 29,
    manufacturing: 23,
  },
  {
    month: "Apr",
    technology: 61,
    banking: 42,
    healthcare: 35,
    manufacturing: 28,
  },
  {
    month: "May",
    technology: 55,
    banking: 39,
    healthcare: 32,
    manufacturing: 26,
  },
  {
    month: "Jun",
    technology: 58,
    banking: 41,
    healthcare: 34,
    manufacturing: 29,
  },
];

const salaryDistribution = [
  { range: "2-5L", count: 45, percentage: 25 },
  { range: "5-8L", count: 68, percentage: 38 },
  { range: "8-12L", count: 42, percentage: 23 },
  { range: "12-18L", count: 18, percentage: 10 },
  { range: "18L+", count: 7, percentage: 4 },
];

const experienceVsSalary = [
  { experience: 1, salary: 350000, count: 12 },
  { experience: 2, salary: 450000, count: 18 },
  { experience: 3, salary: 650000, count: 25 },
  { experience: 4, salary: 750000, count: 22 },
  { experience: 5, salary: 950000, count: 20 },
  { experience: 6, salary: 1200000, count: 15 },
  { experience: 7, salary: 1450000, count: 12 },
  { experience: 8, salary: 1650000, count: 8 },
  { experience: 10, salary: 2200000, count: 5 },
];

const skillDemand = [
  { skill: "React", demand: 95, supply: 70, gap: 25 },
  { skill: "Python", demand: 90, supply: 80, gap: 10 },
  { skill: "Java", demand: 85, supply: 85, gap: 0 },
  { skill: "Node.js", demand: 80, supply: 60, gap: 20 },
  { skill: "AWS", demand: 88, supply: 55, gap: 33 },
  { skill: "Angular", demand: 75, supply: 65, gap: 10 },
];

const regionData = [
  { name: "Mumbai", value: 28, color: "#10b981" },
  { name: "Bangalore", value: 24, color: "#3b82f6" },
  { name: "Delhi", value: 18, color: "#8b5cf6" },
  { name: "Hyderabad", value: 15, color: "#f59e0b" },
  { name: "Pune", value: 10, color: "#ef4444" },
  { name: "Others", value: 5, color: "#6b7280" },
];

const performanceRadar = [
  { metric: "Hiring Speed", value: 85, fullMark: 100 },
  { metric: "Quality", value: 92, fullMark: 100 },
  { metric: "Cost Efficiency", value: 78, fullMark: 100 },
  { metric: "Client Satisfaction", value: 88, fullMark: 100 },
  { metric: "Retention", value: 90, fullMark: 100 },
  { metric: "Time to Fill", value: 82, fullMark: 100 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6m");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState("overview");

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Analytics data refreshed");
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    const csvData = hiringTrends
      .map(
        (item) =>
          `${item.month},${item.technology},${item.banking},${item.healthcare},${item.manufacturing}`,
      )
      .join("\n");

    const blob = new Blob(
      [`Month,Technology,Banking,Healthcare,Manufacturing\n${csvData}`],
      { type: "text/csv" },
    );
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics-report.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-400">
            Deep insights and data-driven recruitment analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="trends">Trends</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="insights">Insights</SelectItem>
            </SelectContent>
          </Select>

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
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-sm font-medium">
                  Avg. Time to Hire
                </p>
                <p className="text-2xl font-bold text-white">18 days</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400 mr-1" />
                  <span className="text-emerald-400 text-xs">-2 days</span>
                </div>
              </div>
              <Clock className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-white">94.2%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-blue-400 mr-1" />
                  <span className="text-blue-400 text-xs">+2.1%</span>
                </div>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">
                  Cost Per Hire
                </p>
                <p className="text-2xl font-bold text-white">₹12.5K</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-purple-400 mr-1" />
                  <span className="text-purple-400 text-xs">-₹1.2K</span>
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
                <p className="text-orange-200 text-sm font-medium">
                  Quality Score
                </p>
                <p className="text-2xl font-bold text-white">8.7/10</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-orange-400 mr-1" />
                  <span className="text-orange-400 text-xs">+0.3</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Industry Hiring Trends */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Industry Hiring Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hiringTrends}>
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
                <Line
                  type="monotone"
                  dataKey="technology"
                  stroke="#10b981"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="banking"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="healthcare"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="manufacturing"
                  stroke="#f59e0b"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional Distribution */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Regional Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                >
                  {regionData.map((entry, index) => (
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
              {regionData.map((item) => (
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

      {/* Secondary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary Distribution */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Salary Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salaryDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="range" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Radar */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceRadar}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <PolarRadiusAxis tick={{ fill: "#9ca3af", fontSize: 10 }} />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Skill Gap Analysis */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">
            Skill Demand vs Supply Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillDemand.map((skill) => (
              <div key={skill.skill} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{skill.skill}</span>
                  <span className="text-slate-400 text-sm">
                    Gap: {skill.gap}%
                  </span>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <div className="text-xs text-slate-400 mb-1">Demand</div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${skill.demand}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {skill.demand}%
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-400 mb-1">Supply</div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${skill.supply}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {skill.supply}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
