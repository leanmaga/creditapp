"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Save,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
} from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { fetchClientById } from "@/lib/api-client";

export function EditClientForm({ clientId }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientData, setClientData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    dni: "",
    notes: "",
  });

  useEffect(() => {
    const getClientData = async () => {
      try {
        const data = await fetchClientById(clientId);
        if (data) {
          setClientData({
            name: data.name || "",
            phone: data.phone || "",
            email: data.email || "",
            address: data.address || "",
            dni: data.dni || "",
            notes: data.notes || "",
          });
        }
      } catch (error) {
        console.error("Error fetching client:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la información del cliente",
        });
      } finally {
        setIsLoading(false);
      }
    };

    getClientData();
  }, [clientId, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!clientData.name) {
        throw new Error("El nombre del cliente es obligatorio");
      }

      // In a real app, we'd update the client in Supabase
      // Since we're using mock data, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: "Cliente actualizado",
        description:
          "La información del cliente se ha actualizado exitosamente",
      });

      router.push(`/clientes/${clientId}`);
    } catch (error) {
      console.error("Error updating client:", error);
      toast({
        variant: "destructive",
        title: "Error al actualizar el cliente",
        description:
          error.message || "Ha ocurrido un error. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            disabled
            className="text-gray-400"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-[300px] bg-gray-200 dark:bg-gray-700" />
        </div>
        <Card className="max-w-3xl mx-auto border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-[180px] bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-4 w-[250px] mt-2 bg-gray-200 dark:bg-gray-700" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700" />
          </CardContent>
          <CardFooter className="border-t border-gray-200 dark:border-gray-800 p-6">
            <Skeleton className="h-10 w-[100px] bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-10 w-[100px] ml-auto bg-gray-200 dark:bg-gray-700" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 bg-white dark:bg-gray-950 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        <Link href={`/clientes/${clientId}`}>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Editar Cliente
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Actualiza la información de {clientData.name}
          </p>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
        <CardHeader className="border-b border-gray-200 dark:border-gray-800 pb-6">
          <CardTitle className="text-xl text-gray-900 dark:text-gray-100 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-500" />
            Información del Cliente
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
            Actualiza la información de contacto del cliente
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Nombre Completo{" "}
                <span className="text-red-600 dark:text-red-400">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Nombre y apellido"
                  value={clientData.name}
                  onChange={handleChange}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-gray-700 dark:text-gray-300 font-medium"
                >
                  Teléfono
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Número de teléfono"
                    value={clientData.phone}
                    onChange={handleChange}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="dni"
                  className="text-gray-700 dark:text-gray-300 font-medium"
                >
                  DNI
                </Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="dni"
                    name="dni"
                    placeholder="Número de documento"
                    value={clientData.dni}
                    onChange={handleChange}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Correo Electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Correo electrónico"
                  value={clientData.email}
                  onChange={handleChange}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Dirección
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <Input
                  id="address"
                  name="address"
                  placeholder="Dirección completa"
                  value={clientData.address}
                  onChange={handleChange}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Notas
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Información adicional"
                  value={clientData.notes}
                  onChange={handleChange}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-gray-200 dark:border-gray-800 p-6">
            <Link href={`/clientes/${clientId}`}>
              <Button
                type="button"
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
            >
              {isSubmitting ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
