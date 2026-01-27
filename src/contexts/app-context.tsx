import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getCategories } from "@/data/getCategories";
import { getTransactionYearsRange } from "@/data/getTransactionYearsRange";
import { Category } from "@/lib/types";

interface AppContextType {
  categories: Category[];
  yearsRange: number[];
  isLoading: boolean;
  refetchCategories: () => Promise<void>;
  refetchYearsRange: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [yearsRange, setYearsRange] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const refetchYearsRange = async () => {
    try {
      const data = await getTransactionYearsRange();
      setYearsRange(data);
    } catch (error) {
      console.error("Failed to fetch years range:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [cats, years] = await Promise.all([
          getCategories(),
          getTransactionYearsRange(),
        ]);
        setCategories(cats);
        setYearsRange(years);
      } catch (error) {
        console.error("Failed to fetch app data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        categories,
        yearsRange,
        isLoading,
        refetchCategories,
        refetchYearsRange,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
