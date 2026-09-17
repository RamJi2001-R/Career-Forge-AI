import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios.js";

// Context banaya - isse koi bhi component "user login hai ya nahi" access kar payega,
// bina props ko har jagah pass kiye (prop drilling se bachne ke liye)
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // app load hote hi check karega

  // App pehli baar load hone par, agar localStorage me token hai,
  // to backend se pooch ke check karo ki wo abhi bhi valid hai
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        // token invalid/expired nikla, to clean up kar do
        localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data);
  };

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook - components isse aise use karenge: const { user, login } = useAuth();
export const useAuth = () => useContext(AuthContext);
