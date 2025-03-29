
import React, { createContext, useContext } from "react";

type ThemeContextType = {
  theme: "light";
};

const ThemeContext = createContext<ThemeContextType>({ theme: "light" });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always use light theme
  const theme = "light";

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
