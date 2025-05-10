// components/ProtectedRoute.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/");
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        router.replace("/");
      }
    };

    checkAuth();
  }, [router]);

  // Muestra un estado de carga mientras verifica la autenticación
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Solo muestra el contenido si está autenticado
  return isAuthenticated ? children : null;
}
