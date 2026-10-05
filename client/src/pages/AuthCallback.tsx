import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { setAccessToken } from "../api/token-store";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/axios";

import LoadingOverlay from "../components/LoadingOverlay";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token =
        searchParams.get("accessToken");

      /*
       * Google authentication failed / no token.
       */
      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      try {
        /*
         * Store the access token received
         * from the backend.
         */
        setAccessToken(token);

        /*
         * Get the authenticated user.
         *
         * Your backend already uses /auth/refresh
         * to return both:
         *
         * accessToken
         * user
         */
        const response =
          await api.post("/auth/refresh");

        const {
          accessToken,
          user,
        } = response.data;

        /*
         * Put BOTH user + token into AuthContext.
         */
        login(user, accessToken);

        /*
         * Now ProtectedRoute sees:
         *
         * user !== null
         *
         * and allows /chat.
         */
        navigate("/chat", {
          replace: true,
        });
      } catch (error) {
        console.error(
          "Google authentication failed:",
          error,
        );

        setAccessToken(null);

        navigate("/login", {
          replace: true,
        });
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <LoadingOverlay
      message="Signing you in with Google..."
    />
  );
}