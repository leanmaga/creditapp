// Crea este archivo: src/components/profile/EmailChangeComponent.jsx
"use client";

import { useState, useEffect } from "react";
import { Mail, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateEmail, getProfileData } from "@/lib/profile-api";

export function EmailChangeComponent({ profile, onProfileUpdate }) {
  const [emailForm, setEmailForm] = useState({
    newEmail: profile?.email || "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [changeStatus, setChangeStatus] = useState("idle"); // idle, pending_current, pending_new, completed
  const [pendingChange, setPendingChange] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Verificar si hay un cambio pendiente al cargar
  useEffect(() => {
    const checkPendingChange = () => {
      // Si el email del formulario es diferente al del perfil, hay un cambio pendiente
      if (
        profile?.email &&
        emailForm.newEmail !== profile.email &&
        emailForm.newEmail
      ) {
        setChangeStatus("pending_current");
        setPendingChange({
          currentEmail: profile.email,
          newEmail: emailForm.newEmail,
        });
      }
    };

    checkPendingChange();
  }, [profile?.email, emailForm.newEmail]);

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!emailForm.newEmail || !emailForm.password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (emailForm.newEmail === profile?.email) {
      setError("El nuevo email debe ser diferente al actual");
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateEmail(emailForm.newEmail, emailForm.password);

      setChangeStatus("pending_current");
      setPendingChange({
        currentEmail: result.currentEmail,
        newEmail: result.newEmail,
      });
      setMessage("Proceso iniciado correctamente");
      setEmailForm({ ...emailForm, password: "" });
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    setIsLoading(true);
    try {
      const profileData = await getProfileData(true);
      if (profileData && onProfileUpdate) {
        onProfileUpdate(profileData);

        // Verificar si el cambio se completó
        if (profileData.email === pendingChange?.newEmail) {
          setChangeStatus("completed");
          setMessage("¡Email actualizado exitosamente!");
          setPendingChange(null);
        }
      }
    } catch (error) {
      setError("Error al actualizar datos");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelChange = () => {
    setChangeStatus("idle");
    setPendingChange(null);
    setEmailForm({ newEmail: profile?.email || "", password: "" });
    setMessage("");
    setError("");
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: "current", label: "Confirmar email actual", icon: Mail },
      { id: "new", label: "Confirmar email nuevo", icon: CheckCircle },
      { id: "completed", label: "Cambio completado", icon: CheckCircle },
    ];

    return (
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        {steps.map((step, index) => {
          const Icon = step.icon;
          let status = "pending";

          if (changeStatus === "pending_current" && index === 0)
            status = "active";
          else if (changeStatus === "pending_new" && index === 1)
            status = "active";
          else if (changeStatus === "completed" && index === 2)
            status = "completed";
          else if (changeStatus === "completed" && index < 2)
            status = "completed";

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 mr-3
                ${
                  status === "completed"
                    ? "bg-green-500 border-green-500 text-white"
                    : status === "active"
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "bg-gray-200 border-gray-300 text-gray-500"
                }
              `}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    status === "completed"
                      ? "text-green-600 dark:text-green-400"
                      : status === "active"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-300 mx-4"></div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Cambiar Email
          <Button
            variant="outline"
            size="sm"
            onClick={refreshProfile}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </CardTitle>
        <CardDescription>
          Actualiza tu dirección de correo electrónico de forma segura
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {changeStatus !== "idle" && renderStepIndicator()}

        {error && (
          <Alert className="bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {changeStatus === "idle" && (
          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentEmail">Email Actual</Label>
              <Input
                id="currentEmail"
                type="email"
                value={profile?.email || ""}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newEmail">Nuevo Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={emailForm.newEmail}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, newEmail: e.target.value })
                }
                placeholder="nuevo@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordEmail">Contraseña actual</Label>
              <Input
                id="passwordEmail"
                type="password"
                value={emailForm.password}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, password: e.target.value })
                }
                placeholder="Confirma tu contraseña"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Iniciando proceso..." : "Iniciar cambio de email"}
            </Button>
          </form>
        )}

        {changeStatus === "pending_current" && pendingChange && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    Paso 1: Confirma desde tu email actual
                  </p>
                  <p>Se ha enviado un enlace de confirmación a:</p>
                  <p className="font-mono bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded text-sm">
                    📧 {pendingChange.currentEmail}
                  </p>
                  <p className="text-xs">
                    Revisa tu bandeja de entrada y spam. Haz clic en el enlace
                    para confirmar que quieres cambiar tu email.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={refreshProfile} disabled={isLoading}>
                ¿Ya confirmaste? Verificar
              </Button>
              <Button variant="outline" onClick={cancelChange}>
                Cancelar cambio
              </Button>
            </div>
          </div>
        )}

        {changeStatus === "pending_new" && pendingChange && (
          <div className="space-y-4">
            <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-200">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    Paso 2: Confirma desde tu email nuevo
                  </p>
                  <p>Ahora confirma desde tu nuevo email:</p>
                  <p className="font-mono bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded text-sm">
                    📧 {pendingChange.newEmail}
                  </p>
                  <p className="text-xs">
                    Revisa tu bandeja de entrada y spam. Haz clic en el enlace
                    para completar el cambio.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
            <Button onClick={refreshProfile} disabled={isLoading}>
              ¿Ya confirmaste? Verificar
            </Button>
          </div>
        )}

        {changeStatus === "completed" && (
          <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium">
                ¡Cambio de email completado exitosamente! 🎉
              </p>
              <p className="text-sm mt-1">
                Tu nuevo email está activo y puedes usarlo para iniciar sesión.
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
