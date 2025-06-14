"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CircleDollarSign,
  CalendarClock,
  Banknote,
  CheckCircle2,
  Trash2,
  Clock,
  AlertTriangle,
  PercentCircle,
  TrendingUp,
  Edit3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { PayInstallmentDialog } from "@/components/loans/PayInstallmentDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { fetchLoanById, deleteLoan } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

// Función para formatear fechas correctamente sin problemas de zona horaria
const formatDateSafe = (dateString) => {
  if (!dateString) return "N/A";

  try {
    // Si la fecha viene en formato ISO, extraer solo la parte de la fecha
    if (dateString.includes("T")) {
      const datePart = dateString.split("T")[0];
      const [year, month, day] = datePart.split("-");
      return `${day}/${month}/${year}`;
    }

    // Si viene en formato YYYY-MM-DD
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    }

    // Fallback: usar Date pero ajustando timezone
    const date = new Date(dateString + "T12:00:00"); // Agregar hora del mediodía para evitar problemas de timezone
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    console.warn("Error formatting date:", dateString, error);
    return dateString;
  }
};

export function LoanDetail({ clientId, loanId }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loan, setLoan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  useEffect(() => {
    const getLoanData = async () => {
      try {
        const data = await fetchLoanById(clientId, loanId);
        setLoan(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la información del préstamo",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId && loanId) {
      getLoanData();
    }
  }, [clientId, loanId, toast]);

  const refreshLoanData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLoanById(clientId, loanId);
      setLoan(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la información del préstamo",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLoan = async () => {
    setIsDeleting(true);
    try {
      await deleteLoan(clientId, loanId);
      toast({
        title: "Préstamo eliminado",
        description: "El préstamo ha sido eliminado correctamente",
      });
      router.push(`/clientes/${clientId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar el préstamo",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openPaymentDialog = (installment) => {
    setSelectedInstallment(installment);
    setIsPaymentDialogOpen(true);
  };

  const getInstallmentStatusBadge = (installment) => {
    const today = new Date();
    const dueDate = new Date(installment.due_date);

    if (installment.paid) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Pagada
        </Badge>
      );
    } else if (dueDate < today) {
      return (
        <Badge variant="destructive" className="dark:bg-red-700">
          <Clock className="h-3 w-3 mr-1" />
          Vencida
        </Badge>
      );
    } else {
      const diffTime = Math.abs(dueDate - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) {
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
          >
            <Clock className="h-3 w-3 mr-1" />
            Próxima
          </Badge>
        );
      } else {
        return (
          <Badge
            variant="outline"
            className="dark:text-gray-300 dark:border-gray-600"
          >
            <CalendarClock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      }
    }
  };

  const getLoanType = (months, interestRate) => {
    if (months === 1 && interestRate === 50) {
      return {
        type: "Préstamo Rápido",
        color: "text-green-600 dark:text-green-400",
      };
    } else if (months === 2 && interestRate === 60) {
      return {
        type: "Préstamo Estándar",
        color: "text-blue-600 dark:text-blue-400",
      };
    } else {
      return {
        type: "Préstamo Personalizado",
        color: "text-purple-600 dark:text-purple-400",
      };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
          <Skeleton className="h-10 w-[130px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-[180px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-[180px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-500 dark:text-red-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Préstamo no encontrado
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          El préstamo que buscas no existe o ha sido eliminado
        </p>
        <Link href={`/clientes/${clientId}`} className="mt-4 inline-block">
          <Button>Volver al Cliente</Button>
        </Link>
      </div>
    );
  }

  const paidAmount = loan.installments
    .filter((inst) => inst.paid)
    .reduce((sum, inst) => sum + (inst.amount || 0), 0);

  const pendingAmount = (loan.total_amount || 0) - paidAmount;
  const paidInstallments = loan.installments.filter((inst) => inst.paid).length;
  const totalInstallments = loan.installments.length;
  const progressPercentage =
    totalInstallments > 0
      ? Math.round((paidInstallments / totalInstallments) * 100)
      : 0;
  const loanTypeInfo = getLoanType(loan.months, loan.interest_rate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/clientes/${clientId}`}>
              <Button
                variant="ghost"
                size="icon"
                className="mr-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Detalles del Préstamo
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Cliente:{" "}
            <Link
              href={`/clientes/${clientId}`}
              className="hover:underline text-blue-600 dark:text-blue-400"
            >
              {loan.client_name}
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/clientes/${clientId}/prestamos/${loanId}/editar`}>
            <Button
              variant="outline"
              className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/30 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                  Esta acción eliminará permanentemente este préstamo y todas
                  sus cuotas. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteLoan}
                  disabled={isDeleting}
                  className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors"
                >
                  {isDeleting ? "Eliminando..." : "Eliminar Préstamo"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Resumen del Préstamo
            </CardTitle>
            <div className="flex items-center justify-between mt-2">
              {loan.status === "active" ? (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                >
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  Activo
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Completado
                </Badge>
              )}
              <span className={`text-sm font-medium ${loanTypeInfo.color}`}>
                {loanTypeInfo.type}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Monto prestado:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(loan.amount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <PercentCircle className="h-3.5 w-3.5 mr-1" />
                  Interés ({loan.interest_rate}%):
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(loan.interest_amount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Total a devolver:
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(loan.total_amount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Duración:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {loan.months} {loan.months === 1 ? "mes" : "meses"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Cuota mensual:
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(loan.monthly_payment || 0)}
                </span>
              </div>
            </div>

            <Separator className="bg-gray-200 dark:bg-gray-700" />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Fecha de inicio:
                </span>
                <span className="font-medium flex items-center text-gray-900 dark:text-gray-100">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-400" />
                  {formatDateSafe(loan.start_date)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Pagado hasta ahora:
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(paidAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Pendiente por pagar:
                </span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {formatCurrency(pendingAmount)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  Progreso
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {progressPercentage}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                <span>
                  {paidInstallments} de {totalInstallments} cuotas pagadas
                </span>
                <span>
                  {formatCurrency(paidAmount)} de{" "}
                  {formatCurrency(loan.total_amount || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Cuotas
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Historial de pagos del préstamo
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loan.installments && loan.installments.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden min-w-max">
                  <div className="grid grid-cols-12 py-3 px-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                    <div className="col-span-1 font-medium">#</div>
                    <div className="col-span-3 font-medium">Vencimiento</div>
                    <div className="col-span-3 font-medium">Monto</div>
                    <div className="col-span-3 font-medium">Estado</div>
                    <div className="col-span-2 font-medium text-right">
                      Acción
                    </div>
                  </div>
                  {loan.installments.map((installment) => (
                    <div
                      key={installment.id}
                      className="grid grid-cols-12 py-3 px-4 border-b border-gray-200 dark:border-gray-800 last:border-b-0 items-center hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors"
                    >
                      <div className="col-span-1 text-gray-900 dark:text-gray-100">
                        {installment.installment_number}
                      </div>
                      <div className="col-span-3 flex items-center text-gray-900 dark:text-gray-100">
                        <CalendarClock className="h-3.5 w-3.5 mr-1.5 text-gray-500 dark:text-gray-400" />
                        {formatDateSafe(installment.due_date)}
                      </div>
                      <div className="col-span-3 font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(installment.amount || 0)}
                      </div>
                      <div className="col-span-3">
                        {getInstallmentStatusBadge(installment)}
                        {installment.paid && installment.payment_date && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Pagada el {formatDateSafe(installment.payment_date)}
                          </div>
                        )}
                      </div>
                      <div className="col-span-2 text-right">
                        {!installment.paid ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPaymentDialog(installment)}
                            className="border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
                          >
                            <Banknote className="h-3.5 w-3.5 mr-1" />
                            Pagar
                          </Button>
                        ) : (
                          <div className="flex items-center justify-end">
                            <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                <CalendarClock className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                <p>No hay cuotas registradas para este préstamo</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PayInstallmentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        installment={selectedInstallment}
        clientId={clientId}
        loanId={loanId}
        onSuccess={refreshLoanData}
      />
    </div>
  );
}
