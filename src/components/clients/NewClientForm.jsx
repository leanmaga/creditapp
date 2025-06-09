"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/api-client";
import NewLoanForm from "@/components/loans/NewLoanForm";

export function NewClientForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("client-info");
  const [clientData, setClientData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    dni: "",
    notes: "",
  });
  const [clientId, setClientId] = useState(null);

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
      if (!clientData.name) {
        throw new Error("El nombre del cliente es obligatorio");
      }

      const newClientId = await createClient(clientData);

      setClientId(newClientId);
      setActiveTab("loan-info");

      toast({
        title: "Cliente creado con éxito",
        description: "Ahora puedes agregar un préstamo",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al crear el cliente",
        description:
          error.message || "Ha ocurrido un error. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/clientes");
  };

  const handleLoanSuccess = () => {
    // Redirigir a la lista de clientes después de crear el préstamo
    router.push("/clientes");
  };

  const handleLoanCancel = () => {
    // Si cancela el préstamo, ir al cliente creado
    router.push(`/clientes/${clientId}`);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="client-info" disabled={activeTab === "loan-info"}>
            Información del Cliente
          </TabsTrigger>
          <TabsTrigger value="loan-info" disabled={!clientId}>
            Información del Préstamo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="client-info">
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
            <CardDescription>
              Ingresa los datos del cliente para registrarlo en el sistema
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nombre y apellido"
                  value={clientData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Número de teléfono"
                    value={clientData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI</Label>
                  <Input
                    id="dni"
                    name="dni"
                    placeholder="Número de documento"
                    value={clientData.dni}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Correo electrónico"
                  value={clientData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Dirección completa"
                  value={clientData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Información adicional"
                  value={clientData.notes}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Cliente"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>

        <TabsContent value="loan-info">
          {clientId && (
            <NewLoanForm
              clientId={clientId}
              clientName={clientData.name}
              onSuccess={handleLoanSuccess}
              onCancel={handleLoanCancel}
            />
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
