// src/components/dashboard/product-alerts.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  AlertTriangle,
  Calendar,
  User,
  Clock,
  ArrowRight,
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
import { getProductPaymentAlerts } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export function ProductAlerts() {
  const [alerts, setAlerts] = useState({
    overdue: [],
    upcoming: [],
    isLoading: true,
  });

  useEffect(() => {
    const getAlerts = async () => {
      try {
        const data = await getProductPaymentAlerts();
        setAlerts({
          ...data,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching product alerts:", error);
        setAlerts((prev) => ({ ...prev, isLoading: false }));
      }
    };

    getAlerts();
  }, []);

  const totalAlerts = alerts.overdue.length + alerts.upcoming.length;

  if (alerts.isLoading) {
    return (
      <Card className="col-span-1 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div>
            <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
              Alertas de Compras
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
              Cargando alertas...
            </CardDescription>
          </div>
          <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400" />
        </CardHeader>
        <CardContent className="pt-5">
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
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
        </CardContent>
      </Card>
    );
  }

  if (totalAlerts === 0) {
    return (
      <Card className="col-span-1 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div>
            <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
              Alertas de Compras
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
              Estado de pagos de productos
            </CardDescription>
          </div>
          <ShoppingCart className="h-5 w-5 text-green-500 dark:text-green-400" />
        </CardHeader>
        <CardContent className="pt-5">
          <div className="text-center py-8 text-gray-600 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <ShoppingCart className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
            <p>No hay alertas de productos</p>
            <p className="text-sm mt-1">Todos los pagos están al día</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <CardTitle className="text-xl text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Alertas de Compras
            {totalAlerts > 0 && (
              <Badge variant="destructive" className="ml-2">
                {totalAlerts}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
            Pagos de productos que requieren atención
          </CardDescription>
        </div>
        <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400" />
      </CardHeader>
      <CardContent className="pt-5">
        <div className="space-y-4">
          {/* Pagos Vencidos */}
          {alerts.overdue.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Pagos Vencidos ({alerts.overdue.length})
              </h4>
              {alerts.overdue.slice(0, 3).map((payment) => (
                <div
                  key={payment.id}
                  className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-3 transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {payment.purchased_products?.product_name || "Producto"}
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {payment.clients?.name || "Cliente"}
                        </span>
                        <span className="flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Vencido: {formatDate(payment.due_date)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(payment.amount)}
                      </div>
                      <Badge variant="destructive" className="mt-1">
                        Vencido
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {alerts.overdue.length > 3 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  ... y {alerts.overdue.length - 3} pagos vencidos más
                </p>
              )}
            </div>
          )}

          {/* Pagos Próximos */}
          {alerts.upcoming.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Próximos Pagos ({alerts.upcoming.length})
              </h4>
              {alerts.upcoming.slice(0, 3).map((payment) => (
                <div
                  key={payment.id}
                  className="border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-3 transition-all duration-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {payment.purchased_products?.product_name || "Producto"}
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {payment.clients?.name || "Cliente"}
                        </span>
                        <span className="flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Vence: {formatDate(payment.due_date)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(payment.amount)}
                      </div>
                      <Badge
                        variant="outline"
                        className="mt-1 bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700"
                      >
                        Próximo
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {alerts.upcoming.length > 3 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  ... y {alerts.upcoming.length - 3} pagos próximos más
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
      {totalAlerts > 0 && (
        <CardFooter className="flex justify-center pt-0 border-t border-gray-200 dark:border-gray-800 p-4">
          <Link href="/compras">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
            >
              Ver todas las compras
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
