import React, { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSettingsStore } from "@/stores/settings-store";
import { applyTheme } from "@/utils/theme";

const App: React.FC = () => {
  const { theme } = useSettingsStore();

  // Apply theme on initial mount and whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return <AppLayout />;
};

export default App;
