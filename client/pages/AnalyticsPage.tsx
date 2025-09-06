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

const hiringTrends: any[] = [];

const salaryDistribution: any[] = [];

const experienceVsSalary: any[] = [];

const skillDemand: any[] = [];

const regionData: any[] = [];

const performanceRadar: any[] = [];

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
