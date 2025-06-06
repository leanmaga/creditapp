"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  deleteAccount,
  getProfileData,
} from "@/lib/profile-api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, User, Mail, Lock, Trash } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Estados para los formularios
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    companyName: "",
  });
  const [emailForm, setEmailForm] = useState({ newEmail: "", password: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deleteForm, setDeleteForm] = useState({ password: "" });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await getProfileData();
        if (!profileData) {
          router.push("/");
          return;
        }

        setProfile(profileData);
        setProfileForm({
          fullName: profileData.fullName || "",
          companyName: profileData.companyName || "",
        });
        setEmailForm({ newEmail: profileData.email, password: "" });
      } catch (error) {
        setErrorMessage("Error al cargar el perfil");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsLoading(true);
    if (
      profileForm.fullName === profile.fullName &&
      profileForm.companyName === profile.companyName
    ) {
      setErrorMessage("No se detectaron cambios para guardar");
      setIsLoading(false);
      return;
    }
    try {
      await updateProfile(profileForm);
      setSuccessMessage("Perfil actualizado correctamente");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reemplaza la función handleEmailUpdate en src/app/profile/page.js

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!emailForm.newEmail || !emailForm.password) {
      setErrorMessage("Todos los campos son obligatorios");
      return;
    }

    // Verificar que el nuevo email sea diferente al actual
    if (emailForm.newEmail === profile?.email) {
      setErrorMessage("El nuevo email debe ser diferente al actual");
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateEmail(emailForm.newEmail, emailForm.password);

      // Mensaje más detallado
      setSuccessMessage(
        `✅ ${result.message}\n\n📧 Revisa tu bandeja de entrada en: ${emailForm.newEmail}\n📁 Si no lo encuentras, revisa tu carpeta de spam\n⏰ El enlace expira en 24 horas`
      );

      // Limpiar solo la contraseña, mantener el nuevo email para referencia
      setEmailForm({ ...emailForm, password: "" });

      // NO redirigir automáticamente - dejar que el usuario lea el mensaje
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setErrorMessage("Todos los campos son obligatorios");
      return;
    }

    setIsLoading(true);

    try {
      const result = await updatePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      setSuccessMessage(result.message);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountDelete = async (e) => {
    e.preventDefault();

    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");

    if (!deleteForm.password) {
      setErrorMessage("Por favor, introduce tu contraseña para confirmar");
      return;
    }

    setIsLoading(true);

    try {
      await deleteAccount(deleteForm.password);
      setDeleteForm({ password: "" });
      router.push("/");
    } catch (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-10 px-4 flex flex-col min-h-screen justify-center items-center bg-gradient-to-br from-blue-900 to-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-white">Mi Perfil</h1>

      {successMessage && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="mb-6 bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-6 w-4/12">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Información</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden md:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden md:inline">Contraseña</span>
          </TabsTrigger>
          <TabsTrigger value="delete" className="flex items-center gap-2">
            <Trash className="h-4 w-4" />
            <span className="hidden md:inline">Eliminar</span>
          </TabsTrigger>
        </TabsList>
        {/* Pestaña de Perfil */}

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Información del Perfil</CardTitle>
              <CardDescription>
                Actualiza tu información personal
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileUpdate}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        fullName: e.target.value,
                      })
                    }
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nombre de la Empresa</Label>
                  <Input
                    id="companyName"
                    value={profileForm.companyName}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        companyName: e.target.value,
                      })
                    }
                    placeholder="Nombre de tu empresa (opcional)"
                  />
                </div>
                <div className="pt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Email: {profile?.email}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        {/* Pestaña de Email */}

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Email</CardTitle>
              <CardDescription>
                Actualiza tu dirección de correo electrónico
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleEmailUpdate}>
              <CardContent className="space-y-4">
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

                {/* Mensaje informativo */}
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-1">
                        ¿Cómo funciona el cambio de email?
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>
                          Se enviará un enlace de confirmación a tu nuevo email
                        </li>
                        <li>
                          Debes hacer clic en el enlace para confirmar el cambio
                        </li>
                        <li>
                          Tu email actual seguirá activo hasta confirmar el
                          nuevo
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar Confirmación"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        {/* Pestaña de Contraseña */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>
                Actualiza tu contraseña de acceso
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordUpdate}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña Actual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        {/* Pestaña de Eliminar Cuenta */}
        <TabsContent value="delete">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">
                Eliminar Cuenta
              </CardTitle>
              <CardDescription>
                Eliminar tu cuenta es una acción permanente y no puede
                deshacerse
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAccountDelete}>
              <CardContent className="space-y-4">
                <Alert className="bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Esta acción eliminará permanentemente tu cuenta, tus
                    clientes, préstamos y todos los datos relacionados.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="passwordDelete">Confirma tu contraseña</Label>
                  <Input
                    id="passwordDelete"
                    type="password"
                    value={deleteForm.password}
                    onChange={(e) =>
                      setDeleteForm({ ...deleteForm, password: e.target.value })
                    }
                    placeholder="Ingresa tu contraseña"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                >
                  {isLoading
                    ? "Procesando..."
                    : "Eliminar Cuenta Permanentemente"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
