// app/registro/page.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      // Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      });

      if (authError) throw authError;

      // Registro exitoso, redirigir o mostrar mensaje
      router.push("/registro-exitoso");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 to-gray-900">
      <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-blue-800/50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <svg
              className="h-8 w-8 text-blue-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <Link href="/">
              <span className="text-white text-xl font-bold">
                Préstamos App
              </span>
            </Link>
          </div>
          <div>
            <Link href="/">
              <button className="text-blue-300 hover:text-white mr-4 transition-colors">
                Iniciar Sesión
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-6">
            Crear una cuenta
          </h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-blue-200 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/5 border border-blue-800/50 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-500/20 text-white"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-blue-200 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/5 border border-blue-800/50 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-500/20 text-white"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-blue-200 mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
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
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white/5 border border-blue-800/50 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-500/20 text-white pr-10"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:ring focus:ring-blue-500/50 disabled:opacity-70 mt-6"
            >
              {loading ? "Registrando..." : "Crear Cuenta"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-blue-200">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/" className="text-blue-400 hover:text-blue-300">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
