import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { exchangeAuthCode } from "../api/auth";
import { setAccessToken } from "../api/token-store";
import { useAuth } from "../context/AuthContext";
import LoadingOverlay from "../components/LoadingOverlay";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  // React StrictMode runs effects twice in development.
  // The code is single-use, so only the first exchange must run.
  const exchangedRef = useRef(false);

  useEffect(() => {
    if (exchangedRef.current) return;
    exchangedRef.current = true;

    const code = searchParams.get("code");

    if (!code) {
      navigate("/login", { replace: true });
      return;
    }

    // Remove the code from the address bar as early as possible.
    window.history.replaceState(null, "", "/auth/callback");

    const run = async () => {
      try {
        const response = await exchangeAuthCode(code);

        login(response.user, response.accessToken);

        navigate("/chat", { replace: true });
      } catch {
        setAccessToken(null);
        navigate("/login", { replace: true });
      }
    };

    void run();
  }, [searchParams, navigate, login]);

  return <LoadingOverlay message="Signing you in with Google..." />;
}