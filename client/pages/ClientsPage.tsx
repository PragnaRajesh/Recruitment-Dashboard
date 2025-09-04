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
import { ClientDetailModal } from "@/components/DetailModals";
import {
  Plus,
  Building2,
  IndianRupee,
  Clock,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { dataService, type ClientData } from "@/services/dataService";

const columns: Column[] = [
  {
    key: "name",
    label: "Client Name",
    sortable: true,
    render: (value, row) => (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {value.charAt(0)}
        </div>
        <div>
          <div className="font-medium text-white">{value}</div>
          <div className="text-sm text-slate-400">{row.company}</div>
        </div>
      </div>
    ),
  },
  {
    key: "industry",
    label: "Industry",
    sortable: true,
    render: (value) => (
      <Badge variant="outline" className="border-slate-600 text-slate-300">
        <Building2 className="w-3 h-3 mr-1" />
        {value}
      </Badge>
    ),
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
  {
    key: "totalHired",
    label: "Total Hired",
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
    key: "avgDaysToFill",
    label: "Avg. Days to Fill",
    sortable: true,
    render: (value) => (
      <div className="flex items-center text-slate-300">
        <Clock className="w-3 h-3 mr-1" />
        {value} days
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value) => {
      const variants = {
        active: "bg-emerald-600 hover:bg-emerald-700",
        pending: "bg-yellow-600 hover:bg-yellow-700",
        inactive: "bg-slate-600 hover:bg-slate-700",
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
    key: "lastActivity",
    label: "Last Activity",
    sortable: true,
    render: (value) => (
      <span className="text-slate-400 text-sm">
        {new Date(value).toLocaleDateString("en-IN")}
      </span>
    ),
  },
];

export default function ClientsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({});
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientsData, setClientsData] = useState<ClientData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  // Fetch data on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const data = await dataService.fetchClients();
      setClientsData(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on dropdowns
  const filteredData = clientsData.filter((client) => {
    const industryMatch =
      selectedIndustry === "all" || client.industry === selectedIndustry;
    const locationMatch =
      selectedLocation === "all" || client.location.includes(selectedLocation);
    return industryMatch && locationMatch;
  });

  const handleRowClick = (client: any) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleEdit = (client: any) => {
    console.log("Edit client:", client);
    // Edit functionality would be implemented here
  };

  const handleDelete = (client: any) => {
    console.log("Delete client:", client);
    // Delete functionality would be implemented here
  };

  const handleAddClient = () => {
    console.log("Add new client");
    // Add new client functionality would be implemented here
  };

  // Get unique industries and locations for dropdowns
  const industries = [...new Set(clientsData.map((c) => c.industry))];
  const locations = [
    ...new Set(clientsData.map((c) => c.location.split(",")[0])),
  ];

  // Calculate summary metrics
  const totalRevenue = filteredData.reduce(
    (sum, client) => sum + client.revenue,
    0,
  );
  const totalHired = filteredData.reduce(
    (sum, client) => sum + client.totalHired,
    0,
  );
  const avgDaysToFill =
    filteredData.length > 0
      ? Math.round(
          filteredData.reduce((sum, client) => sum + client.avgDaysToFill, 0) /
            filteredData.length,
        )
      : 0;
  const averageARPU =
    filteredData.length > 0
      ? dataService.calculateARPU(totalRevenue, totalHired)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Client Management
          </h1>
          <p className="text-slate-400">
            Manage relationships and track client performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
            onClick={fetchClients}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Fetch Data
          </Button>
          <Button
            onClick={handleAddClient}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border border-emerald-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200 text-sm font-medium">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-white">
                ₹{(totalRevenue / 10000000).toFixed(1)}Cr
              </p>
            </div>
            <IndianRupee className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium">Total Hired</p>
              <p className="text-2xl font-bold text-white">{totalHired}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm font-medium">
                Avg. Days to Fill
              </p>
              <p className="text-2xl font-bold text-white">{avgDaysToFill}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
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
            <IndianRupee className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex gap-4">
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
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
        placeholder="Search clients by name, company, or industry..."
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

      {/* Client Detail Modal */}
      <ClientDetailModal
        client={selectedClient}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
