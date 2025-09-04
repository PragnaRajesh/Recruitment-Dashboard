import { useState } from "react";
import {
  BarChart3,
  Users,
  Building2,
  TrendingUp,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Home,
  UserCheck,
  Calendar,
  FileText,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "recruiters", label: "Recruiters", icon: Users },
  { id: "clients", label: "Clients", icon: Building2 },
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "candidates", label: "Candidates", icon: UserCheck },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "targets", label: "Targets", icon: Target },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden bg-slate-800/80 backdrop-blur-sm text-white"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "group fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-50 transition-all duration-300 ease-in-out",
          "w-16 hover:w-64",
          isMobileOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-center group-hover:justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
                RecruitPro
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <li key={item.id}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full text-left transition-all duration-200 relative",
                        "px-3 group-hover:justify-start justify-center",
                        isActive
                          ? "bg-emerald-500/20 text-emerald-400 border-r-2 border-emerald-500"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/50",
                      )}
                      onClick={() => {
                        onTabChange(item.id);
                        setIsMobileOpen(false);
                      }}
                      title={item.label}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
                        {item.label}
                      </span>
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex items-center group-hover:space-x-3 justify-center group-hover:justify-start">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white flex-shrink-0"
              >
                <Bell className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white flex-shrink-0"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <div className="flex-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                <div className="text-sm font-medium text-white whitespace-nowrap">
                  Admin User
                </div>
                <div className="text-xs text-slate-400 whitespace-nowrap">
                  admin@company.com
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
