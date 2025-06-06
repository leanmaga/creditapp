// src/app/(public)/registro-exitoso/page.js
"use client";

import Link from "next/link";
import { CheckCircle, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegistroExitoso() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [userConfirmed, setUserConfirmed] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Usuario ya está confirmado y logueado
          setUserConfirmed(true);
          setCountdown(5); // Reducir countdown si ya está confirmado
        } else {
          // Usuario necesita confirmar email
          setUserConfirmed(false);
          setCountdown(0); // No countdown si necesita confirmar
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setUserConfirmed(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setUserConfirmed(true);
        setCountdown(5);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Countdown solo si el usuario está confirmado
  useEffect(() => {
    if (!isLoading && userConfirmed && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(timer);
            router.push("/dashboard");
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [router, isLoading, userConfirmed, countdown]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full border-t-4 border-blue-500 h-8 w-8 mx-auto mb-4"></div>
          <p>Verificando registro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-900 to-gray-900">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/20 text-center">
        <div className="rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center mx-auto dark:bg-green-900/30">
          {userConfirmed ? (
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          ) : (
            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          )}
        </div>

        <h1 className="mt-6 text-2xl font-bold text-white">
          {userConfirmed ? "¡Registro Exitoso!" : "¡Casi terminamos!"}
        </h1>

        {userConfirmed ? (
          <>
            <p className="mt-4 text-blue-200">
              Tu cuenta ha sido verificada correctamente. Podrás acceder a tu
              dashboard en unos segundos.
            </p>
            <div className="mt-8 space-y-4">
              <p className="text-gray-300">
                Serás redirigido al dashboard en{" "}
                <span className="font-bold text-white">{countdown}</span>{" "}
                segundos.
              </p>
              <Link href="/dashboard">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:ring focus:ring-blue-500/50">
                  Ir al Dashboard
                </button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mt-4 text-blue-200">
              Tu cuenta ha sido creada correctamente. Se ha enviado un correo de
              confirmación a tu dirección de email.
            </p>
            <p className="mt-2 text-blue-200">
              Por favor, verifica tu bandeja de entrada y sigue las
              instrucciones para activar tu cuenta.
            </p>
            <div className="mt-8 space-y-4">
              <div className="bg-blue-500/20 border border-blue-500/50 text-blue-100 px-4 py-3 rounded-lg text-sm">
                <p className="mb-2">📧 Revisa tu bandeja de entrada</p>
                <p className="mb-2">
                  📁 Si no lo ves, revisa tu carpeta de spam
                </p>
                <p>⏰ Una vez confirmado, podrás iniciar sesión</p>
              </div>
              <Link href="/">
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:ring focus:ring-gray-500/50">
                  Ir a Iniciar Sesión
                </button>
              </Link>
            </div>
          </>
        )}

        <p className="text-sm text-gray-300 mt-6">
          <Link
            href="mailto:patagoniascript@gmail.com"
            className="text-blue-400 hover:text-blue-300"
          >
            ¿Necesitas ayuda? Contacta con soporte
          </Link>
        </p>
      </div>
    </div>
  );
}
