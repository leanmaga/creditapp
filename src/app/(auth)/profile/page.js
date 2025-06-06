"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  updateProfile,
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
import { EmailChangeComponent } from "@/components/profile/EmailChangeComponent";

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

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!emailForm.newEmail || !emailForm.password) {
      setErrorMessage("Todos los campos son obligatorios");
      return;
    }

    if (emailForm.newEmail === profile?.email) {
      setErrorMessage("El nuevo email debe ser diferente al actual");
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateEmail(emailForm.newEmail, emailForm.password);

      setSuccessMessage(
        `✅ ${result.message}\n\n📧 Revisa tu bandeja de entrada en: ${emailForm.newEmail}\n📁 Si no lo encuentras, revisa tu carpeta de spam\n⏰ El enlace expira en 24 horas`
      );
      setEmailForm({ ...emailForm, password: "" });
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 py-10 px-4">
      <div className="w-full max-w-2xl mx-auto flex flex-col space-y-6">
        <h1 className="text-3xl font-bold text-center text-white">Mi Perfil</h1>

        {successMessage && (
          <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert className="bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/*
          Usamos siempre “w-full max-w-lg mx-auto” en lugar de anchos en fracciones,
          para que en móvil ocupe 100% y en desktop se centre con un ancho máximo razonable.
        */}
        <Tabs
          defaultValue="profile"
          className="w-full max-w-lg mx-auto space-y-6"
        >
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
            <TabsTrigger
              value="profile"
              className="flex items-center justify-center gap-1 py-2"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">Información</span>
            </TabsTrigger>
            <TabsTrigger
              value="email"
              className="flex items-center justify-center gap-1 py-2"
            >
              <Mail className="h-5 w-5" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="flex items-center justify-center gap-1 py-2"
            >
              <Lock className="h-5 w-5" />
              <span className="hidden sm:inline">Contraseña</span>
            </TabsTrigger>
            <TabsTrigger
              value="delete"
              className="flex items-center justify-center gap-1 py-2"
            >
              <Trash className="h-5 w-5" />
              <span className="hidden sm:inline">Eliminar</span>
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
                  <p className="text-sm text-gray-200">
                    Email: {profile?.email}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Pestaña de Email */}
          <TabsContent value="email">
            <EmailChangeComponent
              profile={profile}
              onProfileUpdate={(newProfile) => {
                setProfile(newProfile);
                setProfileForm({
                  fullName: newProfile.fullName || "",
                  companyName: newProfile.companyName || "",
                });
              }}
            />
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
                    <Label htmlFor="confirmPassword">
                      Confirmar Contraseña
                    </Label>
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
                  <Button type="submit" disabled={isLoading} className="w-full">
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
                    <Label htmlFor="passwordDelete">
                      Confirma tu contraseña
                    </Label>
                    <Input
                      id="passwordDelete"
                      type="password"
                      value={deleteForm.password}
                      onChange={(e) =>
                        setDeleteForm({
                          ...deleteForm,
                          password: e.target.value,
                        })
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
                    className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
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
    </div>
  );
}
