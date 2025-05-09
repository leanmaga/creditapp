"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleDollarSign,
  Users,
  Home,
  BarChart,
  Calculator,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();

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
            href="/"
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <CircleDollarSign className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            <span className="font-bold text-gray-900 dark:text-gray-100">
              Préstamos App
            </span>
          </Link>
        </div>
        <nav className="flex items-center space-x-1 lg:space-x-2">
          <Link
            href="/"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(
              "/"
            )}`}
          >
            <span className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden md:block">Inicio</span>
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
        </nav>
        <div className="ml-auto">
          <span className="hidden md:inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
            Sistema Activo
          </span>
        </div>
      </div>
    </header>
  );
}
