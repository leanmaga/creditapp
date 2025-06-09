"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CircleDollarSign,
  ArrowRight,
  PlusCircle,
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
import { fetchRecentLoans } from "@/lib/api-client";
import { formatDate, formatCurrency, cn } from "@/lib/utils";

export function RecentLoans() {
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getRecentLoans = async () => {
      try {
        const data = await fetchRecentLoans();
        setLoans(data);
      } catch (error) {
        console.error("Error fetching recent loans:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getRecentLoans();
  }, []);

  return (
    <Card className="col-span-1 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
            Préstamos Recientes
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
            Los últimos préstamos otorgados
          </CardDescription>
        </div>
        <CircleDollarSign className="h-5 w-5 text-blue-500 dark:text-blue-400" />
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
        ) : loans.length > 0 ? (
          <div className="space-y-4">
            {loans.map((loan) => (
              <div
                key={loan.id}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/clientes/${loan.client_id}`}>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 hover:underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {loan.client_name}
                      </h3>
                    </Link>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(loan.amount)}
                      </span>{" "}
                      -{" "}
                      <span className="text-green-600 dark:text-green-400">
                        {loan.months} mes{loan.months > 1 ? "es" : ""}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mt-1.5">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(loan.start_date)}
                    </div>
                  </div>
                  <Link
                    href={`/clientes/${loan.client_id}/prestamos/${loan.id}`}
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
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <CircleDollarSign className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
            <p>No hay préstamos recientes</p>
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
      {loans.length > 0 && (
        <CardFooter className="flex justify-center pt-0 border-t border-gray-200 dark:border-gray-800 p-4">
          <Link href="/clientes">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
            >
              Ver todos los préstamos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
