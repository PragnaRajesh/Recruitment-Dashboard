import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SearchAndFilter from "@/components/SearchAndFilter";
import EnhancedDataTable, { Column } from "@/components/EnhancedDataTable";
import { RecruiterDetailModal } from "@/components/DetailModals";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  IndianRupee,
  MapPin,
} from "lucide-react";
import { dataService, type RecruiterData } from "@/services/dataService";

const columns: Column[] = [
  {
    key: "name",
    label: "Recruiter Name",
    sortable: true,
    render: (value, row) => (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
    key: "department",
    label: "Department",
    sortable: true,
    render: (value) => (
      <Badge variant="outline" className="border-slate-600 text-slate-300">
        {value}
      </Badge>
    ),
  },
  {
    key: "territory",
    label: "Territory",
    sortable: true,
    render: (value, row) => (
      <div className="flex items-center text-slate-300">
        <MapPin className="w-3 h-3 mr-1" />
        {value}
      </div>
    ),
  },
  {
    key: "hired",
    label: "Hired",
    sortable: true,
    render: (value) => (
      <span className="text-emerald-400 font-medium">{value}</span>
    ),
  },
  {
    key: "revenue",
    label: "Revenue",
    sortable: true,
    render: (value) => (
      <div className="flex items-center text-emerald-400 font-medium">
        <IndianRupee className="w-3 h-3 mr-1" />
        {(value / 100000).toFixed(1)}L
      </div>
    ),
  },
  {
    key: "arpu",
    label: "ARPU",
    sortable: true,
    render: (value) => (
      <div className="flex items-center text-orange-400 font-medium">
        <IndianRupee className="w-3 h-3 mr-1" />
        {(value / 1000).toFixed(0)}K
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value) => (
      <Badge
        variant={value === "active" ? "default" : "secondary"}
        className={
          value === "active" ? "bg-emerald-600 hover:bg-emerald-700" : ""
        }
      >
        {value}
      </Badge>
    ),
  },
  {
    key: "trend",
    label: "Trend",
    sortable: false,
    render: (value) => (
      <div className="flex items-center">
        {value === "up" ? (
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-400" />
        )}
      </div>
    ),
  },
];

export default function RecruitersPage() {
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({});
  const [selectedRecruiter, setSelectedRecruiter] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recruitersData, setRecruitersData] = useState<RecruiterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  // Fetch data on component mount
  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    setIsLoading(true);
    try {
      const data = await dataService.fetchRecruiters();
      setRecruitersData(data);
    } catch (error) {
      console.error("Error fetching recruiters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on dropdowns
  const filteredData = recruitersData.filter((recruiter) => {
    const departmentMatch =
      selectedDepartment === "all" ||
      recruiter.department === selectedDepartment;
    const locationMatch =
      selectedLocation === "all" || recruiter.territory === selectedLocation;
    return departmentMatch && locationMatch;
  });

  const handleRowClick = (recruiter: any) => {
    setSelectedRecruiter(recruiter);
    setIsModalOpen(true);
  };

  const handleEdit = (recruiter: any) => {
    console.log("Edit recruiter:", recruiter);
    // Edit functionality would be implemented here
  };

  const handleDelete = (recruiter: any) => {
    console.log("Delete recruiter:", recruiter);
    // Delete functionality would be implemented here
  };

  const handleAddRecruiter = () => {
    console.log("Add new recruiter");
    // Add new recruiter functionality would be implemented here
  };

  // Get unique departments and locations for dropdowns
  const departments = [...new Set(recruitersData.map((r) => r.department))];
  const locations = [...new Set(recruitersData.map((r) => r.territory))];

  // Calculate summary metrics
  const totalHired = filteredData.reduce((sum, r) => sum + r.hired, 0);
  const totalRevenue = filteredData.reduce((sum, r) => sum + r.revenue, 0);
  const averageARPU =
    filteredData.length > 0
      ? dataService.calculateARPU(totalRevenue, totalHired)
      : 0;
  const activeRecruiters = filteredData.filter(
    (r) => r.status === "active",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Recruiter Management
          </h1>
          <p className="text-slate-400">
            Manage and track your recruitment team performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
            onClick={fetchRecruiters}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Fetch Data
          </Button>
          <Button
            onClick={handleAddRecruiter}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Recruiter
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border border-emerald-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200 text-sm font-medium">
                Total Hired
              </p>
              <p className="text-2xl font-bold text-white">{totalHired}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium">
                Active Recruiters
              </p>
              <p className="text-2xl font-bold text-white">
                {activeRecruiters}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm font-medium">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-white">
                ₹{(totalRevenue / 10000000).toFixed(1)}Cr
              </p>
            </div>
            <IndianRupee className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border border-orange-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm font-medium">
                Average ARPU
              </p>
              <p className="text-2xl font-bold text-white">
                ₹{(averageARPU / 1000).toFixed(0)}K
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex gap-4">
          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
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
        placeholder="Search recruiters by name, email, or department..."
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

      {/* Recruiter Detail Modal */}
      <RecruiterDetailModal
        recruiter={selectedRecruiter}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
