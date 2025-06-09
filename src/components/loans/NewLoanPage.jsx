"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import NewLoanForm from "@/components/loans/NewLoanForm";
import { fetchClientById } from "@/lib/api-client";

export function NewLoanPage({ clientId }) {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getClientData = async () => {
      try {
        const data = await fetchClientById(clientId);
        setClient(data);
      } catch (error) {
        console.error("Error fetching client:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getClientData();
  }, [clientId]);

  const handleLoanSuccess = () => {
    // Redirigir a la lista de clientes después de crear el préstamo
    router.push("/clientes");
  };

  const handleCancel = () => {
    router.push(`/clientes/${clientId}`);
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
          <Skeleton className="h-8 w-[200px]" />
        </div>
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href={`/clientes/${clientId}`}>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Nuevo Préstamo
        </h1>
      </div>

      <Card className="max-w-3xl mx-auto border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
        <NewLoanForm
          clientId={clientId}
          clientName={client?.name || "Cliente"}
          onSuccess={handleLoanSuccess}
          onCancel={handleCancel}
        />
      </Card>
    </div>
  );
}
