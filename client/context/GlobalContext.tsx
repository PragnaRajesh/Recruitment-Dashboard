import { createContext, useContext, useState, ReactNode } from "react";

interface GlobalState {
  selectedRecruiter: string;
  setSelectedRecruiter: (recruiter: string) => void;
  hasImportedData: boolean;
  setHasImportedData: (hasData: boolean) => void;
  selectedMonth?: string;
  setSelectedMonth: (m?: string) => void;
  selectedYear?: string;
  setSelectedYear: (y?: string) => void;
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>("all");
  const [hasImportedData, setHasImportedData] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);

  const value = {
    selectedRecruiter,
    setSelectedRecruiter,
    hasImportedData,
    setHasImportedData,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};
