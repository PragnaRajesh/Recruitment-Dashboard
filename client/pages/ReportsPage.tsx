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
  FileText,
  Download,
  Calendar,
  BarChart3,
  Users,
  TrendingUp,
  RefreshCw,
  Filter,
  Plus,
  Eye,
  Share2,
  Clock,
} from "lucide-react";

// Sample reports data
const availableReports = [
  {
    id: 1,
    name: "Monthly Hiring Report",
    description:
      "Comprehensive monthly hiring statistics and performance metrics",
    type: "Scheduled",
    lastGenerated: "2024-01-15",
    frequency: "Monthly",
    format: "PDF",
    status: "Active",
    recipients: ["hr@company.com", "management@company.com"],
  },
  {
    id: 2,
    name: "Recruiter Performance Analysis",
    description: "Individual recruiter performance metrics and KPIs",
    type: "On-Demand",
    lastGenerated: "2024-01-14",
    frequency: "As Needed",
    format: "Excel",
    status: "Active",
    recipients: ["priya.sharma@company.com"],
  },
  {
    id: 3,
    name: "Client Satisfaction Survey",
    description: "Client feedback and satisfaction scores",
    type: "Scheduled",
    lastGenerated: "2024-01-10",
    frequency: "Quarterly",
    format: "PDF",
    status: "Active",
    recipients: ["business@company.com"],
  },
  {
    id: 4,
    name: "Salary Benchmarking Report",
    description: "Market salary analysis and compensation benchmarks",
    type: "On-Demand",
    lastGenerated: "2024-01-08",
    frequency: "As Needed",
    format: "Excel",
    status: "Draft",
    recipients: ["compensation@company.com"],
  },
  {
    id: 5,
    name: "Diversity & Inclusion Metrics",
    description: "D&I statistics and progress tracking",
    type: "Scheduled",
    lastGenerated: "2024-01-05",
    frequency: "Monthly",
    format: "PDF",
    status: "Active",
    recipients: ["di@company.com", "hr@company.com"],
  },
];

const recentReports = [
  {
    id: 1,
    name: "January 2024 Hiring Summary",
    generatedOn: "2024-01-15 10:30 AM",
    size: "2.3 MB",
    downloads: 12,
    format: "PDF",
  },
  {
    id: 2,
    name: "Q4 2023 Performance Review",
    generatedOn: "2024-01-10 02:15 PM",
    size: "1.8 MB",
    downloads: 8,
    format: "Excel",
  },
  {
    id: 3,
    name: "December Client Feedback",
    generatedOn: "2024-01-08 09:45 AM",
    size: "1.2 MB",
    downloads: 15,
    format: "PDF",
  },
  {
    id: 4,
    name: "Recruiter KPI Analysis",
    generatedOn: "2024-01-05 04:20 PM",
    size: "3.1 MB",
    downloads: 6,
    format: "Excel",
  },
];

const reportTemplates = [
  {
    id: 1,
    name: "Executive Summary",
    description: "High-level overview for leadership",
    category: "Management",
    estimatedTime: "5 mins",
  },
  {
    id: 2,
    name: "Detailed Analytics",
    description: "In-depth analysis with charts and metrics",
    category: "Analytics",
    estimatedTime: "15 mins",
  },
  {
    id: 3,
    name: "Operational Report",
    description: "Day-to-day operational insights",
    category: "Operations",
    estimatedTime: "8 mins",
  },
  {
    id: 4,
    name: "Financial Summary",
    description: "Revenue and cost analysis",
    category: "Finance",
    estimatedTime: "10 mins",
  },
];

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [generatingReport, setGeneratingReport] = useState<number | null>(null);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Reports data refreshed");
    } catch (error) {
      console.error("Error fetching reports data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGenerateReport = async (reportId: number) => {
    setGeneratingReport(reportId);
    try {
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDownloadReport = (reportId: number) => {
    console.log("Downloading report:", reportId);
    // Download functionality would be implemented here
  };

  const handleCreateCustomReport = () => {
    console.log("Create custom report");
    // Custom report creation functionality would be implemented here
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-600";
      case "Draft":
        return "bg-yellow-600";
      case "Inactive":
        return "bg-slate-600";
      default:
        return "bg-slate-600";
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "PDF":
        return <FileText className="w-4 h-4 text-red-400" />;
      case "Excel":
        return <BarChart3 className="w-4 h-4 text-emerald-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  // Filter reports based on selected filters
  const filteredReports = availableReports.filter((report) => {
    const typeMatch = selectedType === "all" || report.type === selectedType;
    const formatMatch =
      selectedFormat === "all" || report.format === selectedFormat;
    return typeMatch && formatMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Reports & Analytics
          </h1>
          <p className="text-slate-400">
            Generate, manage, and analyze recruitment reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="On-Demand">On-Demand</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
            <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="PDF">PDF</SelectItem>
              <SelectItem value="Excel">Excel</SelectItem>
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
            onClick={handleCreateCustomReport}
          >
            <Plus className="w-4 h-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">
                  Total Reports
                </p>
                <p className="text-2xl font-bold text-white">
                  {availableReports.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-sm font-medium">
                  Active Reports
                </p>
                <p className="text-2xl font-bold text-white">
                  {availableReports.filter((r) => r.status === "Active").length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">
                  This Month
                </p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm font-medium">
                  Total Downloads
                </p>
                <p className="text-2xl font-bold text-white">156</p>
              </div>
              <Download className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Reports */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Available Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-medium">
                          {report.name}
                        </h3>
                        <Badge
                          variant="default"
                          className={`${getStatusColor(report.status)} text-white text-xs`}
                        >
                          {report.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-slate-600 text-slate-300 text-xs"
                        >
                          {report.type}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">
                        {report.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Frequency: {report.frequency}</span>
                        <span>
                          Last:{" "}
                          {new Date(report.lastGenerated).toLocaleDateString(
                            "en-IN",
                          )}
                        </span>
                        <div className="flex items-center gap-1">
                          {getFormatIcon(report.format)}
                          <span>{report.format}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white"
                        onClick={() => handleDownloadReport(report.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleGenerateReport(report.id)}
                        disabled={generatingReport === report.id}
                      >
                        {generatingReport === report.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    Recipients: {report.recipients.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports & Templates */}
        <div className="space-y-6">
          {/* Recent Reports */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 bg-slate-700/20 rounded-lg hover:bg-slate-700/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium text-sm">
                        {report.name}
                      </h4>
                      <div className="flex items-center gap-1">
                        {getFormatIcon(report.format)}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{report.generatedOn}</span>
                      <span>{report.size}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-slate-500">
                        {report.downloads} downloads
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Report Templates */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Quick Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 bg-slate-700/20 rounded-lg hover:bg-slate-700/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium text-sm">
                        {template.name}
                      </h4>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-slate-600 text-slate-300"
                      >
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-xs mb-2">
                      {template.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{template.estimatedTime}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 text-xs"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
