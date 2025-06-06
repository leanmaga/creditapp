"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, User } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!email) {
      setError("Por favor, ingresa tu correo electrónico");
      setLoading(false);
      return;
    }

    try {
      // Importar la función de redirección
      const { getResetPasswordConfig } = await import(
        "../../utils/auth-redirects"
      );

      // Primero verificar si el email existe en nuestro sistema
      const { data: users, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .limit(1);

      // También verificar en auth.users si no encontramos en profiles
      if (!users || users.length === 0) {
        // Intentar verificar de otra manera
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email,
          getResetPasswordConfig()
        );

        if (!resetError) {
          setMessage(
            "Si existe una cuenta con este correo, recibirás un enlace de recuperación en unos minutos."
          );
          setSent(true);
        } else {
          throw resetError;
        }
      } else {
        // El email existe, proceder con el reset
        const { error } = await supabase.auth.resetPasswordForEmail(
          email,
          getResetPasswordConfig()
        );

        if (error) throw error;

        setMessage(
          "Se ha enviado un enlace de recuperación a tu correo electrónico"
        );
        setSent(true);
      }
    } catch (error) {
      // Manejar errores específicos
      if (
        error.message.includes("email not found") ||
        error.message.includes("User not found")
      ) {
        setError("No existe una cuenta registrada con este correo electrónico");
      } else if (error.message.includes("email rate limit")) {
        setError(
          "Has solicitado demasiados enlaces. Espera unos minutos antes de intentar de nuevo."
        );
      } else {
        setError(error.message || "Ocurrió un error. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="rounded-full bg-blue-100 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4 dark:bg-blue-900/30">
            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-blue-200 text-sm">
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  {error}
                  {error.includes("No existe una cuenta") && (
                    <div className="mt-2">
                      <Link
                        href="/registro"
                        className="text-blue-300 hover:text-blue-200 underline"
                      >
                        ¿Quieres crear una cuenta nueva?
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-blue-200 mb-2 text-sm font-medium">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-blue-800/50 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-500/20 text-white placeholder:text-gray-400"
                placeholder="tu@email.com"
              />
              <p className="text-xs text-blue-200 mt-1">
                Debe ser el mismo email con el que te registraste
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring focus:ring-blue-500/50 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verificando...
                </span>
              ) : (
                "Enviar enlace de recuperación"
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            {message && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-100 px-4 py-3 rounded-lg flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm">{message}</div>
              </div>
            )}

            <div className="bg-blue-500/20 border border-blue-500/50 text-blue-100 px-4 py-3 rounded-lg text-sm">
              <p className="mb-2">📧 Revisa tu bandeja de entrada</p>
              <p className="mb-2">📁 Si no lo ves, revisa tu carpeta de spam</p>
              <p>⏰ El enlace expira en 1 hora</p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>

        {sent && (
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setSent(false);
                setMessage("");
                setEmail("");
              }}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              ¿No recibiste el correo? Intentar de nuevo
            </button>
          </div>
        )}

        <div className="mt-4 text-center border-t border-white/10 pt-4">
          <p className="text-blue-200 text-xs mb-2">¿No tienes cuenta?</p>
          <Link
            href="/registro"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center gap-1"
          >
            <User className="h-4 w-4" />
            Crear cuenta nueva
          </Link>
        </div>
      </div>
    </div>
  );
}
