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
  Clock,
  AlertTriangle,
  PercentCircle,
  TrendingUp,
  Package,
  User,
  Store,
  ExternalLink,
  Receipt,
  CreditCard,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  fetchPurchasedProducts,
  fetchProductPayments,
  updateProductStatus,
} from "@/lib/api-client";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ProductPaymentDialog } from "./ProductPaymentDialog";

export function ProductDetail({ productId, clientId }) {
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProductData();
    }
  }, [productId]);

  const loadProductData = async () => {
    try {
      setIsLoading(true);

      // Cargar datos del producto y pagos
      const [productsData, paymentsData] = await Promise.all([
        fetchPurchasedProducts(),
        fetchProductPayments(productId),
      ]);

      // Encontrar el producto específico
      const productData = productsData.find((p) => p.id === productId);

      if (!productData) {
        throw new Error("Producto no encontrado");
      }

      setProduct(productData);
      setPayments(paymentsData);
    } catch (error) {
      console.error("Error loading product data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar la información del producto",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProductData = async () => {
    await loadProductData();
  };

  const getPaymentStatusBadge = (payment) => {
    const today = new Date();
    const dueDate = new Date(payment.due_date);

    if (payment.paid) {
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

  const getProductStatusBadge = (status) => {
    const statusConfig = {
      purchased: {
        label: "🛒 Comprado",
        className:
          "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
      },
      delivered: {
        label: "📦 Entregado",
        className:
          "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
      },
      active: {
        label: "🔄 Activo",
        className:
          "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
      },
      completed: {
        label: "🎉 Completado",
        className:
          "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
      },
    };

    const config = statusConfig[status] || statusConfig.purchased;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await updateProductStatus(productId, newStatus);
      await refreshProductData();
      toast({
        title: "Estado actualizado",
        description: "El estado del producto ha sido actualizado correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar el estado",
      });
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
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-500 dark:text-red-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Producto no encontrado
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          El producto que buscas no existe o ha sido eliminado
        </p>
        <Link href="/productos" className="mt-4 inline-block">
          <Button>Volver a Productos</Button>
        </Link>
      </div>
    );
  }

  const paidAmount = payments
    .filter((payment) => payment.paid)
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

  const pendingAmount = (product.total_amount || 0) - paidAmount;
  const paidPayments = payments.filter((payment) => payment.paid).length;
  const totalPayments = payments.length;
  const progressPercentage =
    totalPayments > 0 ? Math.round((paidPayments / totalPayments) * 100) : 0;

  const clientData = product.clients || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/productos">
              <Button
                variant="ghost"
                size="icon"
                className="mr-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {product.product_name}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Cliente:{" "}
            <Link
              href={`/clientes/${clientId}`}
              className="hover:underline text-blue-600 dark:text-blue-400"
            >
              {clientData.name}
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsPaymentDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Banknote className="h-4 w-4 mr-2" />
            Registrar Pago
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Resumen del Producto
            </CardTitle>
            <div className="flex items-center justify-between mt-2">
              {getProductStatusBadge(product.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Precio de compra:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(product.actual_purchase_price || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Precio acordado:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(product.agreed_client_price || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <PercentCircle className="h-3.5 w-3.5 mr-1" />
                  Ganancia directa:
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(product.direct_profit || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Total con intereses:
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(product.total_amount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Cuota mensual:
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {formatCurrency(product.monthly_payment || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Plazo:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {product.months} meses
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Tasa de interés:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {product.interest_rate}%
                </span>
              </div>
            </div>

            <Separator className="bg-gray-200 dark:bg-gray-700" />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Fecha de compra:
                </span>
                <span className="font-medium flex items-center text-gray-900 dark:text-gray-100">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-400" />
                  {formatDate(product.purchase_date)}
                </span>
              </div>
              {product.delivery_date && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Fecha de entrega:
                  </span>
                  <span className="font-medium flex items-center text-gray-900 dark:text-gray-100">
                    <Package className="h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-400" />
                    {formatDate(product.delivery_date)}
                  </span>
                </div>
              )}
              {product.store && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Tienda:
                  </span>
                  <span className="font-medium flex items-center text-gray-900 dark:text-gray-100">
                    <Store className="h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-400" />
                    {product.store}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Total pagado:
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(paidAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Pendiente por cobrar:
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
                  Progreso de Pagos
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
                  {paidPayments} de {totalPayments} cuotas pagadas
                </span>
                <span>
                  {formatCurrency(paidAmount)} de{" "}
                  {formatCurrency(product.total_amount || 0)}
                </span>
              </div>
            </div>

            {/* Botones de acción de estado */}
            <div className="space-y-2">
              {product.status === "purchased" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleUpdateStatus("delivered")}
                >
                  📦 Marcar como Entregado
                </Button>
              )}
              {product.status === "delivered" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleUpdateStatus("active")}
                >
                  🔄 Marcar como Activo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Historial de Pagos
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Cronograma de pagos del producto
            </CardDescription>
          </CardHeader>

          <CardContent>
            {payments && payments.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden min-w-max">
                  {/* Header de la tabla */}
                  <div className="grid grid-cols-12 py-3 px-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                    <div className="col-span-1 font-medium">#</div>
                    <div className="col-span-3 font-medium">Vencimiento</div>
                    <div className="col-span-3 font-medium">Monto</div>
                    <div className="col-span-3 font-medium">Estado</div>
                    <div className="col-span-2 font-medium text-right">
                      Acción
                    </div>
                  </div>
                  {/* Filas de la tabla */}
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="grid grid-cols-12 py-3 px-4 border-b border-gray-200 dark:border-gray-800 last:border-b-0 items-center hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors"
                    >
                      <div className="col-span-1 text-gray-900 dark:text-gray-100">
                        {payment.installment_number}
                      </div>
                      <div className="col-span-3 flex items-center text-gray-900 dark:text-gray-100">
                        <CalendarClock className="h-3.5 w-3.5 mr-1.5 text-gray-500 dark:text-gray-400" />
                        {formatDate(payment.due_date)}
                      </div>
                      <div className="col-span-3 font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(payment.amount || 0)}
                      </div>
                      <div className="col-span-3">
                        {getPaymentStatusBadge(payment)}
                        {payment.paid && payment.payment_date && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Pagada el {formatDate(payment.payment_date)}
                            {payment.payment_method && (
                              <span className="ml-1">
                                ({payment.payment_method})
                              </span>
                            )}
                          </div>
                        )}
                        {payment.notes && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            💬 {payment.notes}
                          </div>
                        )}
                      </div>
                      <div className="col-span-2 text-right">
                        {payment.paid ? (
                          <div className="flex items-center justify-end">
                            <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsPaymentDialogOpen(true)}
                            className="border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
                          >
                            <Receipt className="h-3.5 w-3.5 mr-1" />
                            Pagar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                <CalendarClock className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                <p>No hay pagos registrados para este producto</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ProductPaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        productId={productId}
        productName={product.product_name}
        clientName={clientData.name}
        onSuccess={refreshProductData}
      />
    </div>
  );
}
