import { useEffect } from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { refreshUser } from "../api/auth";
import { setAccessToken } from "../api/token-store";
import { useAuth } from "../context/AuthContext";
import LoadingOverlay from "../components/LoadingOverlay";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { login } = useAuth();

  useEffect(() => {
    let active = true;

    const handleCallback = async () => {
      const token = searchParams.get("accessToken");

      if (!token) {
        if (active) {
          navigate("/login", { replace: true });
        }

        return;
      }

      try {
        setAccessToken(token);

        const response = await refreshUser();

        if (!active) return;

        login(response.user, response.accessToken);

        navigate("/chat", { replace: true });
      } catch {
        if (!active) return;

        setAccessToken(null);

        navigate("/login", { replace: true });
      }
    };

    void handleCallback();

    return () => {
      active = false;
    };
  }, [searchParams, navigate, login]);

  return (
    <LoadingOverlay message="Signing you in with Google..." />
  );
}