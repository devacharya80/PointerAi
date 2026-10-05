// App.tsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Placeholder pages (we'll build these next)
// const LoginPage = () => <div >Login Page (TODO)</div>;
import LoginPage from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
const RegisterPage = () => <div>Register Page (TODO)</div>;
const ChatPage = () => <div>Chat Page (TODO)</div>;
const NotFoundPage = () => <div>404 Not Found</div>;

export default function App() {
  const { user, isLoading } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected routes */}
        <Route
          path="/chat"
          element={
            isLoading ? (
              <div className="flex items-center justify-center h-screen">
                Loading...
              </div>
            ) : user ? (
              <ChatPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to={user ? "/chat" : "/login"} replace />}
        />

        {/* Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
