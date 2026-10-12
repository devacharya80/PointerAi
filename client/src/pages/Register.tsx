import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FcGoogle } from "react-icons/fc";
import { motion } from "motion/react";
import axios from "axios";
import { toast } from "sonner";

import { useAuth } from "../context/AuthContext";
import { registerUser } from "../api/auth";

import {
  registerSchema,
  type RegisterFormData,
} from "../schemas/auth.schema";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleRegister = async (
    values: RegisterFormData,
  ) => {
    if (isLoading) return;

    setIsLoading(true);
    setServerError("");

    try {
      const {
        confirmPassword: _confirmPassword,
        lastName,
        ...rest
      } = values;

      const payload = {
        ...rest,
        ...(lastName?.trim()
          ? { lastName: lastName.trim() }
          : {}),
      };

      const response = await registerUser(payload);

      login(response.user, response.accessToken);

      toast.success("Account created successfully!");

      navigate("/chat", { replace: true });
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(
        error,
      )
        ? error.response?.data?.message ?? "Unable to register."
        : "Unable to register. Please try again.";

      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
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

  const inputClass = (hasError: boolean) =>
    `h-12 w-full rounded-xl border ${
      hasError ? "border-red-500" : "border-gray-600"
    } bg-[#1a1a1a] px-4 text-white outline-none transition placeholder:text-gray-600 focus:border-gray-300 disabled:opacity-50`;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-black px-4 py-8 text-white">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[480px]"
      >
        <div className="rounded-2xl border border-white/5 bg-[#242424] px-6 py-8 shadow-2xl sm:px-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-black">
              P
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              Create your account
            </h1>

            <p className="mt-3 text-sm text-gray-400">
              Start learning with PointerAI
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
            onClick={handleGoogleRegister}
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-gray-600 font-medium transition hover:bg-white/5 disabled:opacity-50"
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
            onSubmit={handleSubmit(handleRegister)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm text-gray-300"
                >
                  First name
                </label>

                <input
                  {...register("firstName")}
                  id="firstName"
                  autoComplete="given-name"
                  placeholder="John"
                  disabled={isLoading}
                  aria-invalid={Boolean(errors.firstName)}
                  className={inputClass(
                    Boolean(errors.firstName),
                  )}
                />

                {errors.firstName && (
                  <p className="mt-2 text-xs text-red-400">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm text-gray-300"
                >
                  Last name (optional)
                </label>

                <input
                  {...register("lastName")}
                  id="lastName"
                  autoComplete="family-name"
                  placeholder="Williams"
                  disabled={isLoading}
                  aria-invalid={Boolean(errors.lastName)}
                  className={inputClass(
                    Boolean(errors.lastName),
                  )}
                />

                {errors.lastName && (
                  <p className="mt-2 text-xs text-red-400">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

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
                className={inputClass(Boolean(errors.email))}
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
                autoComplete="new-password"
                placeholder="At least 8 characters"
                disabled={isLoading}
                aria-invalid={Boolean(errors.password)}
                className={inputClass(
                  Boolean(errors.password),
                )}
              />

              {errors.password && (
                <p className="mt-2 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm text-gray-300"
              >
                Confirm password
              </label>

              <input
                {...register("confirmPassword")}
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                disabled={isLoading}
                aria-invalid={Boolean(errors.confirmPassword)}
                className={inputClass(
                  Boolean(errors.confirmPassword),
                )}
              />

              {errors.confirmPassword && (
                <p className="mt-2 text-xs text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-12 w-full rounded-xl bg-white font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => navigate("/login")}
              className="font-medium text-white hover:underline"
            >
              Sign in
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