import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  getDriverProfile,
  getMyProfile,
  loginDriver,
  loginRider,
  logoutUser,
  registerDriver,
  registerRider,
} from "../api/authApi";
import { connectSocket, disconnectSocket } from "../socket/socketClient";

const TOKEN_KEY = "ridebooking_token";
const USER_KEY = "ridebooking_user";
const ROLE_KEY = "ridebooking_role";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const clearAuthState = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    setUser(null);
    setToken(null);
    setRole(null);
    setIsAuthenticated(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      console.log("Logout response: success");
    } catch (error) {
      console.log("Logout API error (ignored locally):", error);
    } finally {
      clearAuthState();
      disconnectSocket();
      toast.success("Logged out successfully");
      window.location.href = "/login";
    }
  }, [clearAuthState]);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      const storedRole = localStorage.getItem(ROLE_KEY);

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);
      setRole(storedRole || null);

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.log("Failed to parse local user cache", error);
        }
      }

      try {
        const profileResponse = storedRole === "driver" ? await getDriverProfile() : await getMyProfile();
        const freshUser = profileResponse?.user || profileResponse?.data?.user;
        if (freshUser) {
          localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
          setUser(freshUser);
          setIsAuthenticated(true);
          connectSocket(storedToken);
          console.log("Auth initialized with fresh profile", freshUser);
        } else {
          await logout();
        }
      } catch (error) {
        console.log("Auth initialization failed", error);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [logout]);

  const login = useCallback(async (email, password, userRole = "rider") => {
    try {
      const api = userRole === "driver" ? loginDriver : loginRider;
      const response = await api({ email, password });
      console.log("Login response", response);

      const nextToken = response?.token;
      const nextUser = response?.user;
      const nextRole = nextUser?.role || userRole;

      localStorage.setItem(TOKEN_KEY, nextToken);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      localStorage.setItem(ROLE_KEY, nextRole);

      setToken(nextToken);
      setUser(nextUser);
      setRole(nextRole);
      setIsAuthenticated(true);
      connectSocket(nextToken);

      toast.success(`Welcome back, ${nextUser?.fullName || "User"}!`);
      return { success: true, role: nextRole };
    } catch (error) {
      console.log("Login error", error);
      toast.error(error?.message || "Unable to connect to server");
      return { success: false, error };
    }
  }, []);

  const register = useCallback(async (formData, userRole = "rider") => {
    try {
      const api = userRole === "driver" ? registerDriver : registerRider;
      const response = await api(formData);
      console.log("Register response", response);

      if (userRole === "rider") {
        const nextToken = response?.token;
        const nextUser = response?.user;
        const nextRole = nextUser?.role || "rider";

        localStorage.setItem(TOKEN_KEY, nextToken);
        localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        localStorage.setItem(ROLE_KEY, nextRole);

        setToken(nextToken);
        setUser(nextUser);
        setRole(nextRole);
        setIsAuthenticated(true);
        connectSocket(nextToken);
        toast.success("Rider registration successful");
        return { success: true, role: nextRole };
      }

      toast.success("Registration submitted! Await admin approval.");
      return { success: true, role: "driver" };
    } catch (error) {
      console.log("Register error", error);
      toast.error(error?.message || "Unable to connect to server");
      return { success: false, error };
    }
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => {
      const merged = { ...(prev || {}), ...(updatedData || {}) };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, role, loading, isAuthenticated, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
};

export { AuthContext };

