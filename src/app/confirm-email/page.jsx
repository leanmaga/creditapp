"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ConfirmEmailPage() {
  const router = useRouter();
  const [status, setStatus] =
    (useState < "loading") | "success" | ("error" > "loading");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error al obtener sesión:", error);
          setStatus("error");
          return;
        }

        if (session) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Error verificando sesión:", err);
        setStatus("error");
      }
    };

    checkSession();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/20 text-center">
        <div className="rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto">
          {status === "success" ? (
            <div className="bg-green-100 dark:bg-green-900/30 w-full h-full flex items-center justify-center rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          ) : status === "error" ? (
            <div className="bg-red-100 dark:bg-red-900/30 w-full h-full flex items-center justify-center rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          ) : (
            <div className="animate-spin rounded-full border-t-4 border-blue-500 h-8 w-8" />
          )}
        </div>

        <h1 className="mt-6 text-2xl font-bold text-white">
          {status === "success"
            ? "Correo confirmado"
            : status === "error"
            ? "Error al confirmar"
            : "Confirmando..."}
        </h1>

        <p className="mt-4 text-blue-200">
          {status === "success"
            ? "Tu nuevo correo ha sido confirmado correctamente. Ya podés continuar usando la app."
            : status === "error"
            ? "No pudimos verificar tu correo. Asegurate de haber usado un enlace válido y actualizado."
            : "Verificando tu correo..."}
        </p>

        <div className="mt-8 space-y-4">
          {status === "success" && (
            <Link href="/dashboard">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:ring focus:ring-blue-500/50">
                Ir al Dashboard
              </button>
            </Link>
          )}

          {status === "error" && (
            <Link href="/login">
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:ring focus:ring-red-500/50">
                Volver a Iniciar Sesión
              </button>
            </Link>
          )}

          <p className="text-sm text-gray-300">
            <Link
              href="mailto:patagoniascript@gmail.com"
              className="text-blue-400 hover:text-blue-300"
            >
              ¿Necesitás ayuda? Contactanos en soporte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
