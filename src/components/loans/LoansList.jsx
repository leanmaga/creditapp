"use client";

import Link from "next/link";
import {
  CircleDollarSign,
  CalendarClock,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit3,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, formatCurrency } from "@/lib/utils";

export function LoansList({ loans, clientId, clientName }) {
  if (!loans || loans.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        <CircleDollarSign className="h-10 w-10 mx-auto text-gray-400 dark:text-gray-600" />
        <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-gray-100">
          No hay préstamos
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          Este cliente no tiene préstamos registrados todavía
        </p>
        <Link href={`/clientes/${clientId}/prestamos/nuevo`}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors">
            Crear Préstamo
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
          >
            Activo
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
          >
            Completado
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="dark:text-gray-300 dark:border-gray-600"
          >
            Desconocido
          </Badge>
        );
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
      case "completed":
        return (
          <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
        );
      default:
        return (
          <AlertCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        );
    }
  };

  const calculateProgress = (loan) => {
    const paidInstallments = loan.installments.filter(
      (inst) => inst.paid
    ).length;
    const totalInstallments = loan.installments.length;
    return Math.round((paidInstallments / totalInstallments) * 100);
  };

  return (
    <div className="space-y-4">
      {loans.map((loan) => (
        <div
          key={loan.id}
          className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-950 transition-all duration-200 hover:shadow-md group"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <Link
              href={`/clientes/${clientId}/prestamos/${loan.id}`}
              className="flex-1"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(loan.amount)}
                  </span>
                  {getStatusBadge(loan.status)}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <CalendarClock className="h-3.5 w-3.5 mr-1" />
                  <span>
                    {loan.start_date &&
                    loan.start_date !== loan.created_at?.split("T")[0]
                      ? `Iniciado el ${formatDate(loan.start_date)}`
                      : `Otorgado el ${formatDate(loan.created_at)}`}
                  </span>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {loan.months} {loan.months === 1 ? "mes" : "meses"} -{" "}
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {loan.interest_rate}% interés
                  </span>
                </div>
                <div className="flex items-center text-sm mt-1 text-gray-700 dark:text-gray-300">
                  {getStatusIcon(loan.status)}
                  <span className="ml-1">
                    {calculateProgress(loan)}% completado
                  </span>
                </div>
              </div>

              {/* Menú de opciones */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Opciones</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/clientes/${clientId}/prestamos/${loan.id}`}>
                      Ver detalles
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/clientes/${clientId}/prestamos/${loan.id}/editar`}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar préstamo
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-4 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${calculateProgress(loan)}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
