import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api } from "../api/axios";
import { setAccessToken } from "../api/token-store";

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

//  useEffect(() => {
//   const refreshToken = async () => {
//     try {
//       const response = await api.post("/auth/refresh");
//       console.log("✓ Silent refresh succeeded:", response.data.user);
//       setAccessToken(response.data.accessToken);
//       setUser(response.data.user);
//     } catch (err) {
//       console.error("✗ Silent refresh failed:", err);
//       setAccessToken(null);
//       setUser(null);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   refreshToken();
// }, []);

useEffect(() => {
  const refreshToken = async () => {
    console.log("🔄 Starting silent refresh...");
    try {
      const response = await api.post("/auth/refresh");
      console.log("✓ Full response:", response.data);
      console.log("✓ User from response:", response.data.user);
      
      setAccessToken(response.data.accessToken);
      setUser(response.data.user);
      
      console.log("✓ After setUser, user should be:", response.data.user);
    } catch (err) {
      console.error("✗ Silent refresh failed:", err);
      setAccessToken(null);
      setUser(null);
    } finally {
      console.log("✓ Silent refresh complete, isLoading = false");
      setIsLoading(false);
    }
  };
  refreshToken();
}, []);

  const login = (user: User, accessToken: string) => {
    setAccessToken(accessToken);
    setUser(user);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
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
