import type { ReactNode } from "react";

import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { motion } from "motion/react";

import ProtectedRoute from "./components/ProtectedRoutes";

import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import ChatPage from "./pages/Chat";

function AnimatedPage({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12 }}
      className="min-h-dvh"
    >
      {children}
    </motion.div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-black px-4 text-gray-100">
      <div className="text-center">
        <p className="text-sm text-gray-500">404</p>

        <h1 className="mt-2 text-xl font-semibold">
          Page not found
        </h1>

        <Link
          to="/chat"
          className="mt-4 inline-block text-sm text-sky-400 hover:text-sky-300"
        >
          Return to PointerAI
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
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

        <Route
          path="/chat/:conversationId?"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={<Navigate to="/chat" replace />}
        />

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}