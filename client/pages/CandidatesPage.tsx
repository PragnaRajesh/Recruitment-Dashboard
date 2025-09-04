import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SearchAndFilter from "@/components/SearchAndFilter";
import EnhancedDataTable, { Column } from "@/components/EnhancedDataTable";
import {
  Plus,
  RefreshCw,
  UserCheck,
  Clock,
  IndianRupee,
  MapPin,
  Award,
} from "lucide-react";
import { dataService, type CandidateData } from "@/services/dataService";

const columns: Column[] = [
  {
    key: "name",
    label: "Candidate Name",
    sortable: true,
    render: (value, row) => (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {value.charAt(0)}
        </div>
        <div>
          <div className="font-medium text-white">{value}</div>
          <div className="text-sm text-slate-400">{row.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: "position",
    label: "Position",
    sortable: true,
    render: (value) => (
      <span className="text-slate-300 font-medium">{value}</span>
    ),
  },
  {
    key: "experience",
    label: "Experience",
    sortable: true,
    render: (value) => (
      <Badge variant="outline" className="border-slate-600 text-slate-300">
        {value}
      </Badge>
    ),
  },
  {
    key: "skills",
    label: "Skills",
    sortable: false,
    render: (value) => (
      <div className="flex flex-wrap gap-1">
        {value.slice(0, 2).map((skill: string, index: number) => (
          <Badge
            key={index}
            variant="secondary"
            className="text-xs bg-slate-700 text-slate-300"
          >
            {skill}
          </Badge>
        ))}
        {value.length > 2 && (
          <Badge
            variant="secondary"
            className="text-xs bg-slate-700 text-slate-300"
          >
            +{value.length - 2}
          </Badge>
        )}
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value) => {
      const variants = {
        hired: "bg-emerald-600 hover:bg-emerald-700",
        interview: "bg-blue-600 hover:bg-blue-700",
        pending: "bg-yellow-600 hover:bg-yellow-700",
        rejected: "bg-red-600 hover:bg-red-700",
      };

      return (
        <Badge
          variant="default"
          className={variants[value as keyof typeof variants] || ""}
        >
          {value}
        </Badge>
      );
    },
  },
  {
    key: "salary",
    label: "Salary",
    sortable: true,
    render: (value) => (
      <div className="flex items-center text-emerald-400 font-medium">
        <IndianRupee className="w-3 h-3 mr-1" />
        {(value / 100000).toFixed(1)}L
      </div>
    ),
  },
  {
    key: "recruiter",
    label: "Recruiter",
    sortable: true,
    render: (value) => <span className="text-slate-300">{value}</span>,
  },
  {
    key: "client",
    label: "Client",
    sortable: true,
    render: (value) => <span className="text-blue-400">{value}</span>,
  },
  {
    key: "location",
    label: "Location",
    sortable: true,
    render: (value) => (
      <div className="flex items-center text-slate-300">
        <MapPin className="w-3 h-3 mr-1" />
        {value.split(",")[0]}
      </div>
    ),
  },
];

export default function CandidatesPage() {
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({});
  const [candidatesData, setCandidatesData] = useState<CandidateData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>("all");

  // Fetch data on component mount
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const data = await dataService.fetchCandidates();
      setCandidatesData(data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on dropdowns
  const filteredData = candidatesData.filter((candidate) => {
    const statusMatch =
      selectedStatus === "all" || candidate.status === selectedStatus;
    const recruiterMatch =
      selectedRecruiter === "all" || candidate.recruiter === selectedRecruiter;
    return statusMatch && recruiterMatch;
  });

  const handleRowClick = (candidate: any) => {
    console.log("View candidate details:", candidate);
    // Could open a detailed modal here
  };

  const handleEdit = (candidate: any) => {
    console.log("Edit candidate:", candidate);
    // Edit functionality would be implemented here
  };

  const handleDelete = (candidate: any) => {
    console.log("Delete candidate:", candidate);
    // Delete functionality would be implemented here
  };

  const handleAddCandidate = () => {
    console.log("Add new candidate");
    // Add new candidate functionality would be implemented here
  };

  // Get unique statuses and recruiters for dropdowns
  const statuses = [...new Set(candidatesData.map((c) => c.status))];
  const recruiters = [...new Set(candidatesData.map((c) => c.recruiter))];

  // Calculate summary metrics
  const totalCandidates = filteredData.length;
  const hiredCandidates = filteredData.filter(
    (c) => c.status === "hired",
  ).length;
  const interviewCandidates = filteredData.filter(
    (c) => c.status === "interview",
  ).length;
  const pendingCandidates = filteredData.filter(
    (c) => c.status === "pending",
  ).length;
  const avgSalary =
    filteredData.length > 0
      ? Math.round(
          filteredData.reduce((sum, c) => sum + c.salary, 0) /
            filteredData.length,
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Candidate Management
          </h1>
          <p className="text-slate-400">
            Manage your candidate pipeline and track hiring progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
            onClick={fetchCandidates}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Fetch Data
          </Button>
          <Button
            onClick={handleAddCandidate}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium">
                Total Candidates
              </p>
              <p className="text-2xl font-bold text-white">{totalCandidates}</p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border border-emerald-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200 text-sm font-medium">Hired</p>
              <p className="text-2xl font-bold text-white">{hiredCandidates}</p>
            </div>
            <Award className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border border-yellow-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm font-medium">
                In Interview
              </p>
              <p className="text-2xl font-bold text-white">
                {interviewCandidates}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-white">
                {pendingCandidates}
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border border-orange-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm font-medium">Avg. Salary</p>
              <p className="text-2xl font-bold text-white">
                ₹{(avgSalary / 100000).toFixed(1)}L
              </p>
            </div>
            <IndianRupee className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex gap-4">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedRecruiter}
            onValueChange={setSelectedRecruiter}
          >
            <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="All Recruiters" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Recruiters</SelectItem>
              {recruiters.map((recruiter) => (
                <SelectItem key={recruiter} value={recruiter}>
                  {recruiter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search and Filter */}
      <SearchAndFilter
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={filters}
        onFiltersChange={setFilters}
        placeholder="Search candidates by name, position, or skills..."
      />

      {/* Data Table */}
      <EnhancedDataTable
        data={filteredData}
        columns={columns}
        searchValue={searchValue}
        filters={filters}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        pageSize={10}
      />
    </div>
  );
}
