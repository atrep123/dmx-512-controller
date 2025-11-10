import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/services/apiClient";

interface DMXState {
  connected: boolean;
  mockMode: boolean;
  metrics: any;
  rgb: { r: number; g: number; b: number };
}

export function useDMXConnection() {
  const [state, setState] = useState<DMXState>({
    connected: false,
    mockMode: true,
    metrics: null,
    rgb: { r: 0, g: 0, b: 0 },
  });

  const checkConnection = useCallback(async () => {
    const data = await apiClient.fetch<any>("/metrics");
    setState((prev) => ({
      ...prev,
      connected: !data.mock,
      mockMode: data.mock || false,
      metrics: data,
    }));
  }, []);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  const sendCommand = useCallback(async (command: any) => {
    return await apiClient.fetch("/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(command),
    });
  }, []);

  const setRGB = useCallback(async (r: number, g: number, b: number) => {
    const data = await apiClient.fetch<any>("/rgb", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ r, g, b }),
    });
    setState((prev) => ({ ...prev, rgb: { r, g, b } }));
    return data;
  }, []);

  return {
    ...state,
    sendCommand,
    setRGB,
    checkConnection,
  };
}
