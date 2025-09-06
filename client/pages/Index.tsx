import { useEffect } from "react";
import Dashboard from "@/components/Dashboard";

export default function Index() {
  // This component now serves as a wrapper for the dashboard
  // The main app logic has been moved to App.tsx with sidebar navigation

  return <Dashboard />;
}
