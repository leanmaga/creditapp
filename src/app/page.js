// app/page.js (versión simplificada)
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking auth...");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Auth session:", session);
      if (!session) {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // En tu componente de login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Forzar redirección mediante recarga completa
      window.location.href = "/dashboard";
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 to-gray-900">
      {/* El resto del contenido permanece igual */}
      <div className="flex-grow flex flex-col lg:flex-row items-center">
        {/* Lado izquierdo - Descripción */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Gestiona tus préstamos de forma eficiente
          </h1>
          <p className="text-xl text-blue-200 mb-8">
            La mejor plataforma para prestamistas que desean organizar sus
            clientes, préstamos y pagos en un solo lugar. Simplifica tu trabajo
            y aumenta tu productividad.
          </p>
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <svg
                className="h-6 w-6 text-green-400 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-white">Seguimiento de cuotas</span>
            </div>
            <div className="flex items-center">
              <svg
                className="h-6 w-6 text-green-400 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-white">Estadísticas claras</span>
            </div>
          </div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/20 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              Iniciar Sesión
            </h2>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-blue-200 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-blue-800/50 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-500/20 text-white"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-blue-200 mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-blue-800/50 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-500/20 text-white pr-10"
                    placeholder="••••••••"
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

              <div className="flex items-center justify-between">
                <Link
                  href="#"
                  className="text-sm text-blue-300 hover:text-blue-200"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:ring focus:ring-blue-500/50 disabled:opacity-70"
              >
                {loading ? "Ingresando..." : "Iniciar Sesión"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-blue-200">
                ¿No tienes una cuenta?{" "}
                <Link
                  href="/registro"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Regístrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
