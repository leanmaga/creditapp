// src/components/layout/Navbar.jsx - Versión actualizada
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase, signOut } from "@/lib/supabase";
import {
  CircleDollarSign,
  Users,
  Home,
  BarChart,
  Calculator,
  Menu,
  X,
  LogOut,
  User,
  ShoppingCart,
} from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario autenticado
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);

      // Suscribirse a cambios de autenticación
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user || null);
        }
      );

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    };

    checkUser();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const isActive = (path) => {
    return pathname === path
      ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-500"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/60";
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-6 flex">
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <CircleDollarSign className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            <span className="font-bold text-gray-900 dark:text-gray-100">
              Préstamos App
            </span>
          </Link>
        </div>

        {!loading && (
          <>
            {/* Navegación principal - visible solo si está autenticado */}
            {user ? (
              <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(
                    "/dashboard"
                  )}`}
                >
                  <span className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span className="hidden md:block">Dashboard</span>
                  </span>
                </Link>
                <Link
                  href="/clientes"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(
                    "/clientes"
                  )}`}
                >
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden md:block">Clientes</span>
                  </span>
                </Link>
                <Link
                  href="/productos"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(
                    "/productos"
                  )}`}
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="hidden md:block">Productos</span>
                  </span>
                </Link>
                <Link
                  href="/estadisticas"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(
                    "/estadisticas"
                  )}`}
                >
                  <span className="flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    <span className="hidden md:block">Estadísticas</span>
                  </span>
                </Link>
                <Link
                  href="/simulador"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(
                    "/simulador"
                  )}`}
                >
                  <span className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    <span className="hidden md:block">Simulador</span>
                  </span>
                </Link>
                <Link
                  href="/profile"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(
                    "/profile"
                  )}`}
                >
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden md:block">Mi Perfil</span>
                  </span>
                </Link>
              </nav>
            ) : null}

            {/* Parte derecha del navbar */}
            <div className="ml-auto flex items-center">
              {user ? (
                <div className="hidden md:flex items-center space-x-4">
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    <span>Salir</span>
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <Link href="/registro">
                    <span className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      Registrarse
                    </span>
                  </Link>
                </div>
              )}

              {/* Botón de menú móvil */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="ml-2 rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Menú móvil */}
      {isMenuOpen && !loading && (
        <div className="md:hidden py-2 px-4 space-y-2 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive(
                  "/dashboard"
                )}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </span>
              </Link>
              <Link
                href="/clientes"
                className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive(
                  "/clientes"
                )}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Clientes</span>
                </span>
              </Link>
              <Link
                href="/productos"
                className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive(
                  "/productos"
                )}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Productos"</span>
                </span>
              </Link>
              <Link
                href="/estadisticas"
                className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive(
                  "/estadisticas"
                )}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  <span>Estadísticas</span>
                </span>
              </Link>
              <Link
                href="/simulador"
                className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive(
                  "/simulador"
                )}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  <span>Simulador</span>
                </span>
              </Link>
              <Link
                href="/profile"
                className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive(
                  "/profile"
                )}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Mi Perfil</span>
                </span>
              </Link>
              <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center py-2 text-sm">
                  <User className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300 truncate">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 py-2 text-sm font-medium"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/registro"
                className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive(
                  "/registro"
                )}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

// Añadir esta exportación por defecto
export default Navbar;
