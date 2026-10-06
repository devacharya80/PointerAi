import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { motion } from "motion/react";

import ProtectedRoute from "./components/ProtectedRoutes";

import LoginPage from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import RegisterPage from "./pages/Register";
import ConversationList from "./pages/ChatPage/ConversationList"

const ChatPage = () => (
  <div>Chat Page (TODO)</div>
);

const NotFoundPage = () => (
  <div>404 Not Found</div>
);

const AnimatedPage = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.1 }}
  >
    {children}
  </motion.div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}

        <Route
          path="/login"
          element={
            <AnimatedPage>
              <LoginPage />
            </AnimatedPage>
          }
        />

        <Route
          path="/register"
          element={
            <AnimatedPage>
              <RegisterPage />
            </AnimatedPage>
          }
        />

        <Route
          path="/auth/callback"
          element={
            <AnimatedPage>
              <AuthCallback />
            </AnimatedPage>
          }
        />

        {/* Protected */}

        <Route
          path="/chat"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />

        {/* Default */}

        <Route
          path="/"
          element={
            <AnimatedPage>
              <Navigate
                to="/chat"
                replace
              />
            </AnimatedPage>
          }
        />

        <Route
        path="/convo"
        element={<ConversationList/>}
        />

        {/* 404 */}

        <Route
          path="*"
          element={
            <AnimatedPage>
              <NotFoundPage />
            </AnimatedPage>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}