import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FcGoogle } from "react-icons/fc";
import { motion } from "motion/react";
import axios from "axios";
import { toast } from "sonner";

import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/auth";

import {
  loginSchema,
  type LoginFormData,
} from "../schemas/auth.schema";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values: LoginFormData) => {
    if (isLoading) return;

    setIsLoading(true);
    setServerError("");

    try {
      const response = await loginUser(
        values.email,
        values.password,
      );

      login(response.user, response.accessToken);

      toast.success("Welcome back!");

      navigate("/chat", { replace: true });
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(
        error,
      )
        ? error.response?.data?.message ?? "Unable to sign in."
        : "Unable to sign in. Please try again.";

      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const base = import.meta.env.VITE_BACKEND_URL?.replace(
      /\/+$/,
      "",
    );

    if (!base) {
      setServerError("Backend URL is not configured.");
      return;
    }

    window.location.assign(`${base}/auth/google`);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-black px-4 py-8 text-white">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[430px]"
      >
        <div className="rounded-2xl border border-white/5 bg-[#242424] px-6 py-8 shadow-2xl sm:px-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-black">
              P
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome to PointerAI
            </h1>

            <p className="mt-3 text-sm text-gray-400">
              Your AI-powered learning workspace
            </p>
          </div>

          {serverError && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {serverError}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-gray-600 bg-transparent font-medium transition hover:bg-white/5 disabled:opacity-50"
          >
            <FcGoogle size={21} />
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-500">OR</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form
            onSubmit={handleSubmit(handleLogin)}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm text-gray-300"
              >
                Email address
              </label>

              <input
                {...register("email")}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={isLoading}
                aria-invalid={Boolean(errors.email)}
                className="h-12 w-full rounded-xl border border-gray-600 bg-[#1a1a1a] px-4 text-white outline-none transition placeholder:text-gray-600 focus:border-gray-300 disabled:opacity-50"
              />

              {errors.email && (
                <p className="mt-2 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm text-gray-300"
              >
                Password
              </label>

              <input
                {...register("password")}
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                disabled={isLoading}
                aria-invalid={Boolean(errors.password)}
                className="h-12 w-full rounded-xl border border-gray-600 bg-[#1a1a1a] px-4 text-white outline-none transition placeholder:text-gray-600 focus:border-gray-300 disabled:opacity-50"
              />

              {errors.password && (
                <p className="mt-2 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl bg-white font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Continue"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => navigate("/register")}
              className="font-medium text-white hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-gray-600">
          By continuing, you agree to PointerAI's Terms of Service
          and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}