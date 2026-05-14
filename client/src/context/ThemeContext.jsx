import { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

// Light-mode-only: dark mode has been disabled per design.
export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    localStorage.setItem("spmart-theme", "light");
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode: false, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};
