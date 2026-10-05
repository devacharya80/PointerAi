import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAccessToken } from "../api/token-store";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/axios";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("accessToken");

    if (token) {
      setAccessToken(token);
      
      // Fetch user data with the token we just set
      api.post("/auth/refresh").then(() => {
        navigate("/chat", { replace: true });
      }).catch(() => {
        navigate("/", { replace: true });
      });
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, login]);

  return <div>Loading...</div>;
}