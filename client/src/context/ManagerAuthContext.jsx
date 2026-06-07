import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const ManagerAuthContext = createContext();

export const useManagerAuth = () => useContext(ManagerAuthContext);

const STORAGE_KEY = "spmart-manager-token";

export const ManagerAuthProvider = ({ children }) => {
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify stored token on mount
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    axios
      .get("/api/auth/verify", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        // Accept either manager or admin tokens — admin can also use the order panel
        if (data.role === "manager" || data.role === "admin") {
          setManager({ email: data.email, role: data.role, token });
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post("/api/auth/manager-login", { email, password });
    localStorage.setItem(STORAGE_KEY, data.token);
    setManager({ email: data.email, role: data.role, token: data.token });
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setManager(null);
  };

  return (
    <ManagerAuthContext.Provider value={{ manager, loading, login, logout }}>
      {children}
    </ManagerAuthContext.Provider>
  );
};
