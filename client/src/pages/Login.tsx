import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FcGoogle } from "react-icons/fc";

import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/auth";
import {
  loginSchema,
  type LoginFormData,
} from "../schemas/auth.schema";

import LoadingOverlay from "../components/LoadingOverlay";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await loginUser(
        data.email,
        data.password
      );

      login(response.user, response.accessToken);

      toast.success("Logged in successfully",{duration: 3000})

      navigate("/chat");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to sign in"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${
      import.meta.env.VITE_BACKEND_URL
    }/auth/google`;
  };

  return (
    <>
      {/* =========================
          LOGIN PAGE
      ========================== */}

      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">

        <div className="w-full max-w-[430px]">

          {/* =========================
              AUTH CARD
          ========================== */}

          <div className="bg-[#2f2f2f] rounded-2xl px-8 py-9 shadow-2xl">

            {/* =========================
                HEADER
            ========================== */}

            <div className="text-center mb-8">

              <h1 className="text-[30px] font-semibold tracking-tight text-white">
                Welcome to PointerAI
              </h1>

              <p className="mt-3 text-[15px] text-gray-400">
                Your AI-powered learning workspace
              </p>

            </div>

            {/* =========================
                ERROR MESSAGE
            ========================== */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* =========================
                GOOGLE LOGIN
            ========================== */}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="
                w-full
                h-[52px]
                rounded-xl
                border
                border-gray-600
                bg-[#2f2f2f]
                hover:bg-[#3a3a3a]
                text-white
                font-medium
                transition
                duration-200
                flex
                items-center
                justify-center
                gap-3
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              <FcGoogle size={21} />

              <span>
                Continue with Google
              </span>
            </button>

            {/* =========================
                DIVIDER
            ========================== */}

            <div className="flex items-center gap-4 my-7">

              <div className="h-px flex-1 bg-gray-600" />

              <span className="text-xs text-gray-500 font-medium">
                OR
              </span>

              <div className="h-px flex-1 bg-gray-600" />

            </div>

            {/* =========================
                LOGIN FORM
            ========================== */}

            <form
              onSubmit={handleSubmit(handleLoginSubmit)}
              className="space-y-5"
            >

              {/* =========================
                  EMAIL
              ========================== */}

              <div>

                <label
                  htmlFor="email"
                  className="block text-sm text-gray-300 mb-2"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...register("email")}
                  className={`
                    w-full
                    h-[52px]
                    rounded-xl
                    bg-[#1f1f1f]
                    border
                    px-4
                    text-white
                    placeholder:text-gray-600
                    outline-none
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    ${
                      errors.email
                        ? "border-red-500"
                        : "border-gray-600 focus:border-gray-400"
                    }
                  `}
                />

                {errors.email && (
                  <p className="mt-2 text-xs text-red-400">
                    {errors.email.message}
                  </p>
                )}

              </div>

              {/* =========================
                  PASSWORD
              ========================== */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <label
                    htmlFor="password"
                    className="text-sm text-gray-300"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      // Add forgot password flow later
                    }}
                    className="
                      text-xs
                      text-gray-400
                      hover:text-white
                      transition
                      disabled:opacity-50
                    "
                  >
                    Forgot password?
                  </button>

                </div>

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...register("password")}
                  className={`
                    w-full
                    h-[52px]
                    rounded-xl
                    bg-[#1f1f1f]
                    border
                    px-4
                    text-white
                    placeholder:text-gray-600
                    outline-none
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    ${
                      errors.password
                        ? "border-red-500"
                        : "border-gray-600 focus:border-gray-400"
                    }
                  `}
                />

                {errors.password && (
                  <p className="mt-2 text-xs text-red-400">
                    {errors.password.message}
                  </p>
                )}

              </div>

              {/* =========================
                  CONTINUE BUTTON
              ========================== */}

              <button
                type="submit"
                disabled={isLoading}
                className="
                  w-full
                  h-[52px]
                  rounded-xl
                  bg-white
                  hover:bg-gray-200
                  text-black
                  font-semibold
                  transition
                  duration-200
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  mt-2
                "
              >
                Continue
              </button>

            </form>

            {/* =========================
                REGISTER
            ========================== */}

            <div className="text-center mt-7">

              <p className="text-sm text-gray-400">

                Don't have an account?{" "}

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => navigate("/register")}
                  className="
                    text-white
                    font-medium
                    hover:underline
                    transition
                    disabled:opacity-50
                  "
                >
                  Sign up
                </button>

              </p>

            </div>

          </div>

          {/* =========================
              FOOTER
          ========================== */}

          <p className="text-center text-xs text-gray-600 mt-6 px-6">
            By continuing, you agree to PointerAI's Terms of
            Service and Privacy Policy.
          </p>

        </div>

      </div>

      {/* =========================
          LOADING OVERLAY
      ========================== */}

      {isLoading && (
        <LoadingOverlay message="Logging in..." />
      )}
    </>
  );
}