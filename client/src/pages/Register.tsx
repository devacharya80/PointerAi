import { FcGoogle } from "react-icons/fc";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "../schemas/auth.schema";
import { useState } from "react";
import { registerUser } from "../api/auth";
import LoadingOverlay from "../components/LoadingOverlay";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const labelStyle = `
  block
  text-sm
  text-gray-300
  mb-2
`;

const inputStyle = `
  w-full
  h-[52px]
  rounded-xl
  bg-[#1f1f1f]
  border
  border-gray-600
  px-4
  text-white
  placeholder:text-gray-600
  outline-none
  focus:border-gray-400
  transition
`;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      // confirmPassword is only used for frontend validation.
      // It should not be sent to the backend.
      const { confirmPassword, ...userData } = data;

      const payload = {
        ...userData,
        lastName: userData.lastName?.trim() || null,
      };

      const response = await registerUser(payload);

      // Store authenticated user + access token
      login(response.user, response.accessToken);

      toast.success("Registered successfully", {
        duration: 3000,
      });

      navigate("/chat");
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Unable to register";

      toast.error(message, {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${
      import.meta.env.VITE_BACKEND_URL
    }/auth/google`;
  };

  return (
    <>
      {isLoading && <LoadingOverlay message="Creating account..." />}

      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[430px]">
          {/* Auth Card */}
          <div className="bg-[#2f2f2f] rounded-2xl px-8 py-9 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-[30px] font-semibold text-white tracking-tight">
                Welcome To PointerAI
              </h1>

              <p className="mt-3 text-[15px] text-gray-400">
                Start your AI-powered learning workspace
              </p>
            </div>

            {/* Google Button */}
            <button
              type="button"
              disabled={isLoading}
              className="
                flex
                justify-center
                items-center
                gap-3
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
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
              onClick={handleGoogleRegister}
            >
              <FcGoogle size={21} />

              <span>Continue with Google</span>
            </button>

            {/* OR */}
            <div className="flex items-center gap-4 my-7">
              <div className="h-px flex-1 bg-gray-600" />

              <span className="text-xs text-gray-500 font-medium">OR</span>

              <div className="h-px flex-1 bg-gray-600" />
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit(handleRegisterSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className={labelStyle}>
                    First Name
                  </label>

                  <input
                    type="text"
                    id="firstName"
                    placeholder="John"
                    disabled={isLoading}
                    className={`${inputStyle} ${
                      errors.firstName ? "border-red-500" : ""
                    }`}
                    {...register("firstName")}
                  />

                  {errors.firstName && (
                    <p className="mt-2 text-xs text-red-400">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className={labelStyle}>
                    Last Name <span className="text-gray-500">(optional)</span>
                  </label>

                  <input
                    type="text"
                    id="lastName"
                    placeholder="Williams"
                    disabled={isLoading}
                    className={`${inputStyle} ${
                      errors.lastName ? "border-red-500" : ""
                    }`}
                    {...register("lastName")}
                  />

                  {errors.lastName && (
                    <p className="mt-2 text-xs text-red-400">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="col-span-2">
                  <label htmlFor="email" className={labelStyle}>
                    Email
                  </label>

                  <input
                    type="email"
                    id="email"
                    placeholder="you@email.com"
                    disabled={isLoading}
                    className={`${inputStyle} ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    {...register("email")}
                  />

                  {errors.email && (
                    <p className="mt-2 text-xs text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="col-span-2">
                  <label htmlFor="password" className={labelStyle}>
                    Password
                  </label>

                  <input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    disabled={isLoading}
                    className={`${inputStyle} ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    {...register("password")}
                  />

                  {errors.password && (
                    <p className="mt-2 text-xs text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="col-span-2">
                  <label htmlFor="confirmPassword" className={labelStyle}>
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    className={`${inputStyle} ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                    {...register("confirmPassword")}
                  />

                  {errors.confirmPassword && (
                    <p className="mt-2 text-xs text-red-400">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    col-span-2
                    w-full
                    h-[52px]
                    rounded-xl
                    bg-white
                    text-black
                    font-semibold
                    hover:bg-gray-200
                    active:scale-[0.99]
                    transition-all
                    duration-200
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <div className="text-center mt-7">
              <p className="text-sm text-gray-400">
                Already have an account?{" "}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => navigate("/login")}
                  className="
                    text-white
                    font-medium
                    hover:underline
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-600 mt-6 px-6">
            By continuing, you agree to PointerAI's Terms of Service and Privacy
            Policy.
          </p>
        </div>
      </div>
    </>
  );
}
