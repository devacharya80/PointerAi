import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/axios";
import { loginSchema, type LoginFormData } from "../schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FcGoogle } from "react-icons/fc";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

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
      const response = await api.post("/auth/login", data);

      login(response.data.user, response.data.accessToken);
      navigate("/chat");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
  window.location.href = "http://localhost:3000/api/auth/google";
};

  return (
    <>
      <div>Pointer AI</div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit(handleLoginSubmit)}>
        <div>
          <label htmlFor="email"><Mail size={18}/></label>

          <input
            type="email"
            placeholder="your@email.com"
            id="email"
            {...register("email")}
          />

          {errors.email && (
            <p style={{ color: "red" }}>{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password"><Lock size={18}/></label>

          <input
            type="password"
            id="password"
            placeholder="***********"
            {...register("password")}
          />

          {errors.password && (
            <p style={{ color: "red" }}>{errors.password.message}</p>
          )}
        </div>

        <button type="submit">{isLoading ? "Logging in ..." : "Login"}</button>
      </form>

      <button type="button" onClick={handleGoogleLogin}>
        <FcGoogle />
        Continue with Google
      </button>
    </>
  );
}
