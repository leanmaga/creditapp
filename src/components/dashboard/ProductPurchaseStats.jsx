// src/components/dashboard/product-purchase-stats.jsx
"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Package, AlertCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProductPurchaseStats } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

export function ProductPurchaseStats() {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    activeProducts: 0,
    totalProfits: 0,
    capitalInvested: 0,
    pendingCapital: 0,
    isLoading: true,
  });

  useEffect(() => {
    const getStats = async () => {
      try {
        const data = await getProductPurchaseStats();
        setStats({
          ...data,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching product purchase stats:", error);
        setStats((prev) => ({ ...prev, isLoading: false }));
      }
    };

    getStats();
  }, []);

  if (stats.isLoading) {
    return (
      <Card className="transition-all duration-200 hover:shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sistema de Compras
          </CardTitle>
          <ShoppingCart className="h-5 w-5 text-purple-500 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-6 w-16 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Solicitudes Pendientes */}
      <Card className="transition-all duration-200 hover:shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Solicitudes Pendientes
          </CardTitle>
          <AlertCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.pendingRequests}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Esperan aprobación
          </p>
          {stats.pendingRequests > 0 && (
            <Badge
              variant="outline"
              className="mt-2 bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
            >
              Requiere atención
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Aprobados para Comprar */}
      <Card className="transition-all duration-200 hover:shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Listos para Comprar
          </CardTitle>
          <ShoppingCart className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.approvedRequests}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Solicitudes aprobadas
          </p>
          {stats.approvedRequests > 0 && (
            <Badge
              variant="outline"
              className="mt-2 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
            >
              Acción requerida
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Productos Activos */}
      <Card className="transition-all duration-200 hover:shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Productos Activos
          </CardTitle>
          <Package className="h-5 w-5 text-green-500 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.activeProducts}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            En proceso de pago
          </p>
          {stats.activeProducts > 0 && (
            <div className="mt-3 h-1 w-full bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 dark:bg-green-500/80 rounded-full"
                style={{
                  width: `${Math.min(100, stats.activeProducts * 20)}%`,
                }}
              ></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ganancias Realizadas */}
      <Card className="transition-all duration-200 hover:shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Ganancias Totales
          </CardTitle>
          <TrendingUp className="h-5 w-5 text-purple-500 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalProfits
              ? formatCurrency(stats.totalProfits)
              : formatCurrency(0)}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Productos completados
          </p>
          {stats.totalProfits > 0 && (
            <div className="mt-2 flex items-center text-xs text-green-600 dark:text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Rentabilidad positiva</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Capital Invertido - Card adicional más grande */}
      {(stats.capitalInvested > 0 || stats.pendingCapital > 0) && (
        <Card className="md:col-span-2 transition-all duration-200 hover:shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
              Estado de Capital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Capital Invertido
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(stats.capitalInvested)}
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Capital Pendiente
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(stats.pendingCapital)}
                </p>
              </div>
            </div>
            {stats.capitalInvested > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Progreso de recuperación
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {(
                      ((stats.capitalInvested - stats.pendingCapital) /
                        stats.capitalInvested) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(
                        5,
                        ((stats.capitalInvested - stats.pendingCapital) /
                          stats.capitalInvested) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
