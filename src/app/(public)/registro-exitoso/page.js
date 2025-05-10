"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegistroExitoso() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  useEffect(() => {
    // Verificar si hay una sesión activa
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Si el usuario ya está autenticado, redirigir directamente al dashboard
          setTimeout(() => {
            router.push("/dashboard");
          }, 0);
          return;
        } else {
          // Verificar si la confirmación de email está habilitada
          const { data: authSettings } = await supabase
            .from("auth_settings")
            .select("*")
            .single();
          const needsConfirmation = authSettings?.confirm_email || false;
          setNeedsEmailConfirmation(needsConfirmation);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  // Separate useEffect for countdown to prevent race conditions
  useEffect(() => {
    // Solo iniciar cuenta regresiva si no está cargando
    if (isLoading) return;

    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          // Redirigir al dashboard en lugar de la página de inicio
          setTimeout(() => {
            router.push("/dashboard");
          }, 0);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/20 text-center">
        <div className="rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center mx-auto dark:bg-green-900/30">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-white">
          ¡Registro Exitoso!
        </h1>

        {needsEmailConfirmation ? (
          <>
            <p className="mt-4 text-blue-200">
              Tu cuenta ha sido creada correctamente. Se ha enviado un correo de
              confirmación a tu dirección de email.
            </p>

            <p className="mt-2 text-blue-200">
              Por favor, verifica tu bandeja de entrada y sigue las
              instrucciones para activar tu cuenta.
            </p>
          </>
        ) : (
          <p className="mt-4 text-blue-200">
            Tu cuenta ha sido creada correctamente. Podrás acceder a tu
            dashboard en unos segundos.
          </p>
        )}

        <div className="mt-8 space-y-4">
          <p className="text-gray-300">
            Serás redirigido al dashboard en{" "}
            <span className="font-bold text-white">{countdown}</span> segundos.
          </p>

          <Link href="/dashboard">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:ring focus:ring-blue-500/50">
              Ir al Dashboard
            </button>
          </Link>

          <p className="text-sm text-gray-300">
            <Link
              href="mailto:soporte@prestamosapp.com"
              className="text-blue-400 hover:text-blue-300"
            >
              ¿Necesitas ayuda? Contacta con soporte@prestamosapp.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
