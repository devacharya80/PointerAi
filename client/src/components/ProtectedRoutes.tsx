import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // While checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <div className="text-slate-100 text-lg font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  // User not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User authenticated, render protected content
  return <>{children}</>;
}