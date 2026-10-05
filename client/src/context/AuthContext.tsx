import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { setAccessToken } from "../api/token-store";
import { refreshUser } from "../api/auth";

interface User {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User, accessToken: string) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Silent refresh on mount
  useEffect(() => {
    const performRefresh = async () => {
      try {
        const data = await refreshUser();
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch (err) {
        console.error("Silent refresh failed:", err);
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    performRefresh();
  }, []);

  const login = (user: User, accessToken: string) => {
    setAccessToken(accessToken);
    setUser(user);
  };

  const logout = async () => {
    try {
      const { logoutUser } = await import("../api/auth");
      await logoutUser();
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};