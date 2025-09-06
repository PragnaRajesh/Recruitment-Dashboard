import { useState } from "react";
import { Search, Filter, X, Calendar, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

interface SearchAndFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFiltersChange: (filters: any) => void;
  filters: any;
  placeholder?: string;
}

export default function SearchAndFilter({
  searchValue,
  onSearchChange,
  onFiltersChange,
  filters,
  placeholder = "Search...",
}: SearchAndFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    onFiltersChange({});
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-emerald-600 text-white"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-slate-800 border-slate-700">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">Filters</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-slate-400 hover:text-white"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Status
                </label>
                <Select
                  value={filters.status || ""}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Department
                </label>
                <Select
                  value={filters.department || ""}
                  onValueChange={(value) =>
                    handleFilterChange("department", value)
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="accounts">Accounts</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="tech">Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Location
                </label>
                <Select
                  value={filters.location || ""}
                  onValueChange={(value) =>
                    handleFilterChange("location", value)
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="new-york">New York</SelectItem>
                    <SelectItem value="san-francisco">San Francisco</SelectItem>
                    <SelectItem value="london">London</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Experience Level
                </label>
                <Select
                  value={filters.experience || ""}
                  onValueChange={(value) =>
                    handleFilterChange("experience", value)
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="entry">
                      Entry Level (0-2 years)
                    </SelectItem>
                    <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                    <SelectItem value="senior">
                      Senior Level (6-10 years)
                    </SelectItem>
                    <SelectItem value="lead">Lead Level (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Date Range
                </label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                      <CalendarComponent
                        mode="single"
                        selected={dateFrom}
                        onSelect={(date) => {
                          setDateFrom(date);
                          handleFilterChange("dateFrom", date);
                        }}
                        initialFocus
                        className="bg-slate-800 text-white"
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                      <CalendarComponent
                        mode="single"
                        selected={dateTo}
                        onSelect={(date) => {
                          setDateTo(date);
                          handleFilterChange("dateTo", date);
                        }}
                        initialFocus
                        className="bg-slate-800 text-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => (
            <Badge
              key={key}
              variant="secondary"
              className="bg-emerald-600/20 text-emerald-300 border border-emerald-600/30"
            >
              <span className="capitalize">
                {key}: {String(value)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-emerald-300 hover:text-white"
                onClick={() => removeFilter(key)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
