import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoutes";
import LoginPage from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";

const RegisterPage = () => <div>Register Page (TODO)</div>;
const ChatPage = () => <div>Chat Page (TODO)</div>;
const NotFoundPage = () => <div>404 Not Found</div>;

export default function App() {
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
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* Default route */}
        <Route path="/" element={<Navigate to="/chat" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}