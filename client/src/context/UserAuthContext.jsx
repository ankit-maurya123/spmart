import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserAuthContext = createContext();

export const useUserAuth = () => useContext(UserAuthContext);

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if stored token is still valid
  useEffect(() => {
    const token = localStorage.getItem("spmart-user-token");
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get("/api/user/verify", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setUser({ ...data.user, token });
      })
      .catch(() => {
        localStorage.removeItem("spmart-user-token");
      })
      .finally(() => setLoading(false));
  }, []);

  const register = async (name, email, password, phone) => {
    const { data } = await axios.post("/api/user/register", {
      name,
      email,
      password,
      phone,
    });
    localStorage.setItem("spmart-user-token", data.token);
    setUser({ ...data.user, token: data.token });
  };

  const login = async (email, password) => {
    const { data } = await axios.post("/api/user/login", { email, password });
    localStorage.setItem("spmart-user-token", data.token);
    setUser({ ...data.user, token: data.token });
  };

  const logout = () => {
    localStorage.removeItem("spmart-user-token");
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <UserAuthContext.Provider
      value={{ user, loading, register, login, logout, updateUser }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};
