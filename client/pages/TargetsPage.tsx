import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  CircularProgressbar,
  buildStyles,
} from "recharts";
import {
  Target,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Award,
  RefreshCw,
  Plus,
  Edit,
  IndianRupee,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

// Sample targets data
const organizationalTargets = [
  {
    id: 1,
    title: "Monthly Hiring Target",
    description: "Total hires across all departments",
    target: 150,
    achieved: 142,
    period: "January 2024",
    status: "on-track",
    department: "All",
    deadline: "2024-01-31",
  },
  {
    id: 2,
    title: "Revenue Target",
    description: "Monthly revenue from all hirings",
    target: 7500000,
    achieved: 7100000,
    period: "January 2024",
    status: "at-risk",
    department: "All",
    deadline: "2024-01-31",
  },
  {
    id: 3,
    title: "Client Acquisition",
    description: "New clients onboarded",
    target: 5,
    achieved: 3,
    period: "Q1 2024",
    status: "behind",
    department: "Business Development",
    deadline: "2024-03-31",
  },
  {
    id: 4,
    title: "Quality Score",
    description: "Average hiring quality rating",
    target: 9.0,
    achieved: 8.7,
    period: "January 2024",
    status: "on-track",
    department: "All",
    deadline: "2024-01-31",
  },
];

const departmentTargets = [
  {
    department: "Technology",
    target: 50,
    achieved: 48,
    percentage: 96,
    trend: "up",
    recruiters: 8,
  },
  {
    department: "Banking",
    target: 40,
    achieved: 38,
    percentage: 95,
    trend: "up",
    recruiters: 6,
  },
  {
    department: "Healthcare",
    target: 35,
    achieved: 32,
    percentage: 91,
    trend: "down",
    recruiters: 5,
  },
  {
    department: "Manufacturing",
    target: 25,
    achieved: 24,
    percentage: 96,
    trend: "up",
    recruiters: 4,
  },
];

const recruiterTargets = [
  {
    id: 1,
    name: "Priya Sharma",
    department: "Technology",
    target: 8,
    achieved: 7,
    percentage: 88,
    revenue: 350000,
    status: "on-track",
  },
  {
    id: 2,
    name: "Rahul Kumar",
    department: "Banking",
    target: 6,
    achieved: 6,
    percentage: 100,
    revenue: 300000,
    status: "achieved",
  },
  {
    id: 3,
    name: "Anita Patel",
    department: "Healthcare",
    target: 7,
    achieved: 5,
    percentage: 71,
    revenue: 250000,
    status: "behind",
  },
  {
    id: 4,
    name: "Vikram Singh",
    department: "Manufacturing",
    target: 5,
    achieved: 5,
    percentage: 100,
    revenue: 250000,
    status: "achieved",
  },
];

const quarterlyProgress = [
  { month: "Oct", target: 140, achieved: 138, percentage: 99 },
  { month: "Nov", target: 145, achieved: 142, percentage: 98 },
  { month: "Dec", target: 150, achieved: 148, percentage: 99 },
  { month: "Jan", target: 150, achieved: 142, percentage: 95 },
];

export default function TargetsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Targets data refreshed");
    } catch (error) {
      console.error("Error fetching targets data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateTarget = () => {
    console.log("Create new target");
    // Create target functionality would be implemented here
  };

  const handleEditTarget = (targetId: number) => {
    console.log("Edit target:", targetId);
    // Edit target functionality would be implemented here
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "achieved":
        return "text-emerald-400";
      case "on-track":
        return "text-blue-400";
      case "at-risk":
        return "text-yellow-400";
      case "behind":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "achieved":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "on-track":
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case "at-risk":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case "behind":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 95) return "bg-emerald-500";
    if (percentage >= 80) return "bg-blue-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Filter data based on selected department
  const filteredDepartmentTargets =
    selectedDepartment === "all"
      ? departmentTargets
      : departmentTargets.filter(
          (dept) => dept.department.toLowerCase() === selectedDepartment,
        );

  const filteredRecruiterTargets =
    selectedDepartment === "all"
      ? recruiterTargets
      : recruiterTargets.filter(
          (rec) => rec.department.toLowerCase() === selectedDepartment,
        );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Targets & Goals
          </h1>
          <p className="text-slate-400">
            Set, track, and achieve recruitment targets and KPIs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="quarter">Current Quarter</SelectItem>
              <SelectItem value="year">Current Year</SelectItem>
              <SelectItem value="custom">Custom Period</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="banking">Banking</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
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
            Refresh
          </Button>

          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleCreateTarget}
          >
            <Plus className="w-4 h-4 mr-2" />
            Set Target
          </Button>
        </div>
      </div>

      {/* Organizational Targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {organizationalTargets.map((target) => {
          const percentage = Math.round(
            (target.achieved / target.target) * 100,
          );
          const isRevenue = target.title.includes("Revenue");

          return (
            <Card
              key={target.id}
              className="bg-slate-800/50 border-slate-700/50"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">
                    {target.title}
                  </CardTitle>
                  {getStatusIcon(target.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">
                      {isRevenue
                        ? `₹${(target.achieved / 100000).toFixed(1)}L`
                        : target.achieved}
                    </span>
                    <span className="text-slate-400 text-sm">
                      /{" "}
                      {isRevenue
                        ? `₹${(target.target / 100000).toFixed(1)}L`
                        : target.target}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">Progress</span>
                      <span
                        className={`text-xs font-medium ${getStatusColor(target.status)}`}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>{target.period}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                      onClick={() => handleEditTarget(target.id)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quarterly Progress */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">
              Quarterly Progress Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={quarterlyProgress}>
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
                  dataKey="target"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Target"
                />
                <Line
                  type="monotone"
                  dataKey="achieved"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Achieved"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">
              Department Target Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredDepartmentTargets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="department" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="achieved" fill="#10b981" name="Achieved" />
                <Bar dataKey="target" fill="#374151" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recruiter Performance */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">
            Individual Recruiter Targets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecruiterTargets.map((recruiter) => (
              <div
                key={recruiter.id}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                    {recruiter.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{recruiter.name}</h3>
                    <p className="text-slate-400 text-sm">
                      {recruiter.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-slate-400 text-xs">Target</p>
                    <p className="text-white font-bold">{recruiter.target}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-slate-400 text-xs">Achieved</p>
                    <p className="text-emerald-400 font-bold">
                      {recruiter.achieved}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-slate-400 text-xs">Revenue</p>
                    <p className="text-purple-400 font-bold">
                      ₹{(recruiter.revenue / 100000).toFixed(1)}L
                    </p>
                  </div>

                  <div className="w-24">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-400">Progress</span>
                      <span className="text-xs text-white">
                        {recruiter.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(recruiter.percentage)}`}
                        style={{
                          width: `${Math.min(recruiter.percentage, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {getStatusIcon(recruiter.status)}
                    <span
                      className={`ml-1 text-xs ${getStatusColor(recruiter.status)}`}
                    >
                      {recruiter.status}
                    </span>
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
