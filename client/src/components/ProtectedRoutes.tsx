import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LoadingOverlay from "../components/LoadingOverlay";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const {
    user,
    isLoading,
  } = useAuth();

  /*
   * AuthProvider is checking the refresh cookie.
   */
  if (isLoading) {
    return (
      <LoadingOverlay
        message="Checking your session..."
      />
    );
  }

  /*
   * No authenticated user.
   */
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /*
   * Authenticated.
   */
  return <>{children}</>;
}