"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Verificar si hay una sesión válida para reset de contraseña
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error checking session:", error);
          setError("Sesión inválida o expirada");
          setIsValidSession(false);
        } else if (session) {
          setIsValidSession(true);
        } else {
          setError(
            "Enlace inválido o expirado. Solicita un nuevo enlace de recuperación."
          );
          setIsValidSession(false);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Error al verificar la sesión");
        setIsValidSession(false);
      } finally {
        setIsCheckingSession(false);
      }
    };

    // También escuchar cambios en la sesión de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
        setIsCheckingSession(false);
      }
    });

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validaciones
    if (!password || !confirmPassword) {
      setError("Todos los campos son obligatorios");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);

      // Redirigir al dashboard después de un momento
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Error updating password:", error);
      setError(error.message || "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900">
        <div className="text-white">
          <div className="animate-spin rounded-full border-t-4 border-blue-500 h-8 w-8 mx-auto mb-4"></div>
          <p>Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-900 to-gray-900">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/20 text-center">
          <div className="rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center mx-auto dark:bg-green-900/30">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-white">
            ¡Contraseña actualizada!
          </h1>
          <p className="mt-4 text-blue-200">
            Tu contraseña ha sido actualizada correctamente. Serás redirigido al
            dashboard en unos segundos.
          </p>
          <div className="mt-8">
            <Link href="/dashboard">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:ring focus:ring-blue-500/50">
                Ir al Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-900 to-gray-900">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/20 text-center">
          <div className="rounded-full bg-red-100 p-3 w-16 h-16 flex items-center justify-center mx-auto dark:bg-red-900/30">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-white">
            Enlace inválido
          </h1>
          <p className="mt-4 text-blue-200">
            {error || "El enlace de recuperación es inválido o ha expirado."}
          </p>
          <div className="mt-8 space-y-4">
            <Link href="/">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:ring focus:ring-blue-500/50">
                Solicitar nuevo enlace
              </button>
            </Link>
            <p className="text-sm text-gray-300">
              <Link
                href="mailto:patagoniascript@gmail.com"
                className="text-blue-400 hover:text-blue-300"
              >
                ¿Necesitas ayuda? Contacta con soporte
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-900 to-gray-900">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Establecer Nueva Contraseña
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label className="block text-blue-200 mb-2">Nueva Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-blue-800/50 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-500/20 text-white pr-10"
                placeholder="••••••••"
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-blue-200 mb-2">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-blue-800/50 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-500/20 text-white pr-10"
                placeholder="••••••••"
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-400"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:ring focus:ring-blue-500/50 disabled:opacity-70"
          >
            {loading ? "Actualizando..." : "Actualizar Contraseña"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-blue-200 text-sm">
            ¿Recordaste tu contraseña?{" "}
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
