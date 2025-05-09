"use client";

import { useEffect, useState } from "react";
import { Users, CircleDollarSign, CreditCard, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchDashboardStats } from "@/lib/api-client";

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeLoans: 0,
    totalLent: 0,
    overdueInstallments: 0,
    isLoading: true,
  });

  useEffect(() => {
    const getStats = async () => {
      try {
        const data = await fetchDashboardStats();
        setStats({
          ...data,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setStats((prev) => ({ ...prev, isLoading: false }));
      }
    };

    getStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="transition-all duration-200 hover:shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Clientes
          </CardTitle>
          <Users className="h-5 w-5 text-amber-500 dark:text-amber-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.isLoading ? (
              <div className="h-8 w-16 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              stats.totalClients
            )}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Total de clientes registrados
          </p>
          {!stats.isLoading && (
            <div className="mt-3 h-1 w-full bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 dark:bg-amber-500/80 rounded-full"
                style={{ width: `${Math.min(100, stats.totalClients * 5)}%` }}
              ></div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="transition-all duration-200 hover:shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Préstamos Activos
          </CardTitle>
          <CircleDollarSign className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.isLoading ? (
              <div className="h-8 w-16 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              stats.activeLoans
            )}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Préstamos con cuotas pendientes
          </p>
          {!stats.isLoading && (
            <div className="mt-3 h-1 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 dark:bg-blue-500/80 rounded-full"
                style={{ width: `${Math.min(100, stats.activeLoans * 10)}%` }}
              ></div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="transition-all duration-200 hover:shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Capital Prestado
          </CardTitle>
          <CreditCard className="h-5 w-5 text-green-500 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.isLoading ? (
              <div className="h-8 w-16 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              formatCurrency(stats.totalLent)
            )}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Total de dinero prestado
          </p>
          {!stats.isLoading && (
            <div className="mt-3 h-1 w-full bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 dark:bg-green-500/80 rounded-full"
                style={{
                  width: `${Math.min(100, (stats.totalLent / 1000000) * 100)}%`,
                }}
              ></div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="transition-all duration-200 hover:shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Cuotas Vencidas
          </CardTitle>
          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.isLoading ? (
              <div className="h-8 w-16 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <span
                className={
                  stats.overdueInstallments > 0
                    ? "text-red-600 dark:text-red-400"
                    : ""
                }
              >
                {stats.overdueInstallments}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Cuotas sin pagar fuera de fecha
          </p>
          {!stats.isLoading && (
            <div className="mt-3 h-1 w-full bg-red-100 dark:bg-red-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 dark:bg-red-500/80 rounded-full"
                style={{
                  width: `${Math.min(100, stats.overdueInstallments * 20)}%`,
                }}
              ></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
