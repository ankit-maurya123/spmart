import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if stored token is still valid
  useEffect(() => {
    const token = localStorage.getItem("spmart-admin-token");
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get("/api/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setAdmin({ email: data.email, token });
      })
      .catch(() => {
        localStorage.removeItem("spmart-admin-token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post("/api/auth/login", { email, password });
    localStorage.setItem("spmart-admin-token", data.token);
    setAdmin({ email: data.email, token: data.token });
  };

  const logout = () => {
    localStorage.removeItem("spmart-admin-token");
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
