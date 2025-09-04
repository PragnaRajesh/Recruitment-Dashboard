import "./global.css";

import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Components
import Sidebar from "@/components/Sidebar";

// Pages with proper naming
import DashboardPage from "./pages/DashboardPage";
import RecruitersPage from "./pages/RecruitersPage";
import ClientsPage from "./pages/ClientsPage";
import CandidatesPage from "./pages/CandidatesPage";
import PerformancePage from "./pages/PerformancePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SchedulePage from "./pages/SchedulePage";
import ReportsPage from "./pages/ReportsPage";
import TargetsPage from "./pages/TargetsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage />;
      case "recruiters":
        return <RecruitersPage />;
      case "clients":
        return <ClientsPage />;
      case "candidates":
        return <CandidatesPage />;
      case "performance":
        return <PerformancePage />;
      case "analytics":
        return <AnalyticsPage />;
      case "schedule":
        return <SchedulePage />;
      case "reports":
        return <ReportsPage />;
      case "targets":
        return <TargetsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
          <div className="flex">
            {/* Sidebar */}
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Main Content */}
            <div className="flex-1 lg:ml-16 transition-all duration-300 min-w-0 overflow-x-hidden">
              <main className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto w-full">
                  {renderContent()}
                </div>
              </main>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// Legacy routing component for compatibility
const AppWithRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/dashboard" element={<App />} />
      <Route path="/recruiters" element={<App />} />
      <Route path="/clients" element={<App />} />
      <Route path="/candidates" element={<App />} />
      <Route path="/performance" element={<App />} />
      <Route path="/analytics" element={<App />} />
      <Route path="/schedule" element={<App />} />
      <Route path="/reports" element={<App />} />
      <Route path="/targets" element={<App />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

createRoot(document.getElementById("root")!).render(<AppWithRouter />);
