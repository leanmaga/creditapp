"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  CircleDollarSign,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchUpcomingPayments } from "@/lib/api-client";
import { formatDate, formatCurrency, cn } from "@/lib/utils";

export function UpcomingPayments() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUpcomingPayments = async () => {
      try {
        const data = await fetchUpcomingPayments();
        setPayments(data);
      } catch (error) {
        console.error("Error fetching upcoming payments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getUpcomingPayments();
  }, []);

  const getStatusBadge = (installment) => {
    const today = new Date();
    const dueDate = new Date(installment.due_date);

    if (installment.paid) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 flex items-center"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Pagada
        </Badge>
      );
    } else if (dueDate < today) {
      return (
        <Badge
          variant="destructive"
          className="dark:bg-red-700 flex items-center"
        >
          <Clock className="h-3 w-3 mr-1" />
          Vencida
        </Badge>
      );
    } else {
      // Due in less than 7 days
      const diffTime = Math.abs(dueDate - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) {
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800 flex items-center"
          >
            <Clock className="h-3 w-3 mr-1" />
            Próxima
          </Badge>
        );
      } else {
        return (
          <Badge
            variant="outline"
            className="dark:text-gray-300 dark:border-gray-600 flex items-center"
          >
            <CalendarClock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      }
    }
  };

  return (
    <Card className="col-span-1 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
            Próximos Pagos
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
            Cuotas con vencimiento cercano
          </CardDescription>
        </div>
        <CalendarClock className="h-5 w-5 text-purple-500 dark:text-purple-400" />
      </CardHeader>
      <CardContent className="pt-5">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-2"
              >
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/clientes/${payment.client_id}`}>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 hover:underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {payment.client_name}
                      </h3>
                    </Link>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(payment.amount)}
                      </span>{" "}
                      -{" "}
                      <span className="text-purple-600 dark:text-purple-400">
                        Cuota {payment.installment_number}/
                        {payment.total_installments}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mt-1.5">
                      <CalendarClock className="h-3 w-3 mr-1" />
                      Vence: {formatDate(payment.due_date)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(payment)}
                    <Link
                      href={`/clientes/${payment.client_id}/prestamos/${payment.loan_id}`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
                      >
                        Ver
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <CalendarClock className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
            <p>No hay pagos próximos</p>
            <Link href="/clientes/nuevo" className="mt-3 inline-block">
              <Button
                className={cn(
                  "flex-1 bg-gradient-to-r from-black to-black-600/20 text-white",
                  "hover:from-blue-500/30 hover:to-blue-600/30  ",
                  "border border-white-500/30 shadow-lg hover:shadow-green-500/20",
                  "transition-all duration-300 py-3 sm:py-4 text-sm sm:text-base",
                  "flex items-center justify-center gap-2"
                )}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Crear préstamo
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
      {payments.length > 0 && (
        <CardFooter className="flex justify-center pt-0 border-t border-gray-200 dark:border-gray-800 p-4">
          <Link href="/clientes">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
            >
              Ver todos los clientes
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
