"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchInsights, regenerateInsights } from "@/services/insightsService";

interface Insights {
  summary: string;
  hottestDay: string;
  precipitation: number;
  tempTrend: string;
  apparentTemperature: number;
}

interface InsightsContextType {
  insights: Insights | null;
  isLoading: boolean;
  refreshInsights: () => Promise<void>;
  regenerate: () => Promise<void>;
}

const InsightsContext = createContext<InsightsContextType>({
  insights: null,
  isLoading: false,
  refreshInsights: async () => {},
  regenerate: async () => {},
});

export const InsightsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);

  const refreshInsights = async () => {
    setLoading(true);
    try {
      const response = await fetchInsights();
      setInsights(response);
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async () => {
    setLoading(true);
    try {
      const response = await regenerateInsights();
      setInsights(response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshInsights();
  }, []);

  return (
    <InsightsContext.Provider
      value={{ insights, isLoading, refreshInsights, regenerate }}
    >
      {children}
    </InsightsContext.Provider>
  );
};

export const useInsights = () => useContext(InsightsContext);
