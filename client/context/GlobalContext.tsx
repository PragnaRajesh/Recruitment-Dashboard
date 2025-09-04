import { createContext, useContext, useState, ReactNode } from "react";

interface GlobalState {
  selectedRecruiter: string;
  setSelectedRecruiter: (recruiter: string) => void;
  hasImportedData: boolean;
  setHasImportedData: (hasData: boolean) => void;
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

  const value = {
    selectedRecruiter,
    setSelectedRecruiter,
    hasImportedData,
    setHasImportedData,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};
