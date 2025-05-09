"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  CircleDollarSign,
  UserCog,
  Trash2,
  AlertTriangle,
  Calendar,
  CreditCard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { LoansList } from "@/components/loans/LoansList";
import { useToast } from "@/hooks/use-toast";
import { fetchClientById, deleteClient } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { ClientContactButtons } from "../ui/contact-client";

export function ClientDetail({ clientId }) {
  const router = useRouter();
  const { toast } = useToast();
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const getClientData = async () => {
      try {
        const data = await fetchClientById(clientId);
        setClient(data);
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

  const handleDeleteClient = async () => {
    setIsDeleting(true);
    try {
      await deleteClient(clientId);
      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado correctamente",
      });
      router.push("/clientes");
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar el cliente",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-[250px] bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />
          </div>
          <Skeleton className="h-10 w-[130px] bg-gray-200 dark:bg-gray-700" />
        </div>
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-[180px] bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-4 w-[120px] bg-gray-200 dark:bg-gray-700" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-24 w-full bg-gray-200 dark:bg-gray-700" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-500 dark:text-red-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Cliente no encontrado
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          El cliente que buscas no existe o ha sido eliminado
        </p>
        <Link href="/clientes" className="mt-4 inline-block">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors">
            Volver a Clientes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-950 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/clientes">
              <Button
                variant="ghost"
                size="icon"
                className="mr-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {client.name}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-500" />
            Cliente desde {formatDate(client.created_at)}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Link href={`/clientes/${clientId}/prestamos/nuevo`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors">
              <CircleDollarSign className="h-4 w-4 mr-2" />
              Nuevo Préstamo
            </Button>
          </Link>

          <Link href={`/clientes/${clientId}/editar`}>
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
            >
              <UserCog className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                  Esta acción eliminará permanentemente al cliente {client.name}{" "}
                  y todos sus préstamos asociados. Esta acción no se puede
                  deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteClient}
                  disabled={isDeleting}
                  className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors"
                >
                  {isDeleting ? "Eliminando..." : "Eliminar Cliente"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800 pb-4">
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Información de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {client.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-0.5 text-blue-500 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Teléfono
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {client.phone}
                  </p>
                </div>
              </div>
            )}

            {client.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 text-amber-500 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Correo Electrónico
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {client.email}
                  </p>
                </div>
              </div>
            )}

            {client.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-green-500 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Dirección
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {client.address}
                  </p>
                </div>
              </div>
            )}

            {client.dni && (
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 mt-0.5 text-purple-500 dark:text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    DNI
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {client.dni}
                  </p>
                </div>
              </div>
            )}

            {client.notes && (
              <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                  Notas
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-800">
                  {client.notes}
                </p>
              </div>
            )}

            {!client.phone &&
              !client.email &&
              !client.address &&
              !client.dni &&
              !client.notes && (
                <div className="text-gray-600 dark:text-gray-400 text-center py-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <UserCog className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                  <p>No hay información de contacto disponible</p>
                  <Link
                    href={`/clientes/${clientId}/editar`}
                    className="mt-2 inline-block"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
                    >
                      Añadir información
                    </Button>
                  </Link>
                </div>
              )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 dark:text-gray-100">
                Préstamos
              </CardTitle>
              {client.loans.length > 0 && (
                <Badge
                  variant="outline"
                  className="ml-2 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                >
                  {client.loans.length} préstamo
                  {client.loans.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
              Historial de préstamos del cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-3 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm rounded-md"
                >
                  Activos
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm rounded-md"
                >
                  Completados
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm rounded-md"
                >
                  Todos
                </TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="mt-6">
                <LoansList
                  loans={client.loans.filter(
                    (loan) => loan.status === "active"
                  )}
                  clientId={clientId}
                  clientName={client.name}
                />
              </TabsContent>
              <TabsContent value="completed" className="mt-6">
                <LoansList
                  loans={client.loans.filter(
                    (loan) => loan.status === "completed"
                  )}
                  clientId={clientId}
                  clientName={client.name}
                />
              </TabsContent>
              <TabsContent value="all" className="mt-6">
                <LoansList
                  loans={client.loans}
                  clientId={clientId}
                  clientName={client.name}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          {client.loans.length === 0 && (
            <CardFooter className="pt-0 pb-6">
              <div className="w-full text-center py-8 text-gray-600 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <CircleDollarSign className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                <p>No hay préstamos registrados</p>
                <Link
                  href={`/clientes/${clientId}/prestamos/nuevo`}
                  className="mt-3 inline-block"
                >
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors">
                    Crear Préstamo
                  </Button>
                </Link>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-950 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Contacto:
            </h1>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <ClientContactButtons client={client} />
        </div>
      </div>
    </div>
  );
}
