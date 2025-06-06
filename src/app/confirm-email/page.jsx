"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ConfirmEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Obtener parámetros de la URL
        const token = searchParams.get("token");
        const type = searchParams.get("type");

        console.log("URL params:", { token, type });

        // Si es una confirmación de email change
        if (type === "email_change" || type === "signup") {
          // Obtener la sesión actual
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          console.log("Session:", session);

          if (sessionError) {
            console.error("Error al obtener sesión:", sessionError);
            setErrorMessage("Error al verificar la sesión");
            setStatus("error");
            return;
          }

          if (session?.user) {
            console.log("User confirmed:", session.user);
            setStatus("success");

            // Redirigir después de 3 segundos
            setTimeout(() => {
              router.push("/dashboard");
            }, 3000);
          } else {
            console.log("No session found");
            setErrorMessage("No se pudo confirmar el cambio de email");
            setStatus("error");
          }
        } else {
          // Para otros tipos de confirmación
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            console.error("Error al obtener sesión:", error);
            setErrorMessage(error.message);
            setStatus("error");
            return;
          }

          if (session) {
            setStatus("success");
          } else {
            setErrorMessage("Enlace inválido o expirado");
            setStatus("error");
          }
        }
      } catch (err) {
        console.error("Error verificando confirmación:", err);
        setErrorMessage("Error inesperado al confirmar email");
        setStatus("error");
      }
    };

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.email);

      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
        setStatus("success");
      }
    });

    handleEmailConfirmation();

    return () => subscription.unsubscribe();
  }, [router, searchParams]);

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
            ? "Email confirmado"
            : status === "error"
            ? "Error al confirmar"
            : "Confirmando..."}
        </h1>

        <p className="mt-4 text-blue-200">
          {status === "success"
            ? "Tu email ha sido confirmado correctamente. Ya puedes continuar usando la app."
            : status === "error"
            ? errorMessage ||
              "No pudimos verificar tu email. Asegúrate de haber usado un enlace válido y actualizado."
            : "Verificando tu email..."}
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
            <Link href="/">
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
              ¿Necesitas ayuda? Contactanos en soporte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
