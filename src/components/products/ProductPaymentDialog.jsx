"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CalendarCheck,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { payProductInstallment, fetchProductPayments } from "@/lib/api-client";
import { formatDate, formatCurrency } from "@/lib/utils";

export function ProductPaymentDialog({
  open,
  onOpenChange,
  productId,
  productName,
  clientName,
  selectedPayment,
  onSuccess,
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payments, setPayments] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().substring(0, 10),
    paymentMethod: "transferencia",
    notes: "",
  });

  useEffect(() => {
    if (open && productId) {
      loadPayments();
    }
  }, [open, productId]);

  // Efecto para preseleccionar el pago si viene selectedPayment
  useEffect(() => {
    if (selectedPayment && selectedPayment.id) {
      setSelectedPaymentId(selectedPayment.id);
    }
  }, [selectedPayment]);

  const loadPayments = async () => {
    try {
      const paymentsData = await fetchProductPayments(productId);
      setPayments(paymentsData);

      // Si no hay selectedPayment, seleccionar automáticamente el próximo pago pendiente
      if (!selectedPayment) {
        const nextPendingPayment = paymentsData.find((p) => !p.paid);
        if (nextPendingPayment) {
          setSelectedPaymentId(nextPendingPayment.id);
        }
      }
    } catch (error) {
      console.error("Error loading payments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los pagos",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPaymentId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selecciona una cuota para pagar",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await payProductInstallment(selectedPaymentId, paymentData);

      toast({
        title: "Pago registrado",
        description: "El pago ha sido registrado exitosamente",
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();

      // Reset form
      setSelectedPaymentId("");
      setPaymentData({
        paymentDate: new Date().toISOString().substring(0, 10),
        paymentMethod: "transferencia",
        notes: "",
      });
    } catch (error) {
      console.error("Error registering payment:", error);
      toast({
        variant: "destructive",
        title: "Error al registrar el pago",
        description:
          error.message || "Ha ocurrido un error. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPaymentData = payments.find((p) => p.id === selectedPaymentId);

  const getPaymentStatusBadge = (payment) => {
    if (payment.paid) {
      return <span className="text-green-600 text-sm">✅ Pagada</span>;
    }

    const today = new Date();
    const dueDate = new Date(payment.due_date);

    if (dueDate < today) {
      return <span className="text-red-600 text-sm">🔴 Vencida</span>;
    } else {
      const diffTime = Math.abs(dueDate - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) {
        return <span className="text-yellow-600 text-sm">⚠️ Próxima</span>;
      } else {
        return <span className="text-blue-600 text-sm">⏳ Pendiente</span>;
      }
    }
  };

  // Reset form cuando se cierra el dialog
  useEffect(() => {
    if (!open) {
      setSelectedPaymentId("");
      setPaymentData({
        paymentDate: new Date().toISOString().substring(0, 10),
        paymentMethod: "transferencia",
        notes: "",
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Registrar Pago de Producto
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Registra el pago de una cuota para:{" "}
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {productName} - {clientName}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Selector de cuota */}
            {!selectedPayment && (
              <div className="space-y-2">
                <Label
                  htmlFor="paymentSelect"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Seleccionar Cuota
                </Label>
                <Select
                  value={selectedPaymentId}
                  onValueChange={setSelectedPaymentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una cuota para pagar" />
                  </SelectTrigger>
                  <SelectContent>
                    {payments.map((payment) => (
                      <SelectItem
                        key={payment.id}
                        value={payment.id}
                        disabled={payment.paid}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>
                            Cuota #{payment.installment_number} -{" "}
                            {formatCurrency(payment.amount)} -{" "}
                            {formatDate(payment.due_date)}
                          </span>
                          <span className="ml-2">
                            {getPaymentStatusBadge(payment)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Vista previa de la cuota seleccionada */}
            {selectedPaymentData && (
              <div className="space-y-2 pb-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-700 dark:text-blue-300">
                    Cuota #{selectedPaymentData.installment_number}:
                  </span>
                  <span className="font-semibold text-blue-800 dark:text-blue-200">
                    {formatCurrency(selectedPaymentData.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-700 dark:text-blue-300">
                    Fecha de vencimiento:
                  </span>
                  <span className="flex items-center text-blue-800 dark:text-blue-200">
                    <CalendarClock className="h-3.5 w-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                    {formatDate(selectedPaymentData.due_date)}
                  </span>
                </div>
                {selectedPaymentData.paid && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-700 dark:text-green-300">
                      Pagada el:
                    </span>
                    <span className="text-green-800 dark:text-green-200">
                      {formatDate(selectedPaymentData.payment_date)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Fecha de pago */}
            <div className="space-y-2">
              <Label
                htmlFor="paymentDate"
                className="text-gray-700 dark:text-gray-300"
              >
                Fecha de pago
              </Label>
              <div className="relative">
                <CalendarCheck className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      paymentDate: e.target.value,
                    })
                  }
                  className="pl-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  max={new Date().toISOString().substring(0, 10)}
                />
              </div>
            </div>

            {/* Método de pago */}
            <div className="space-y-2">
              <Label
                htmlFor="paymentMethod"
                className="text-gray-700 dark:text-gray-300"
              >
                Método de pago
              </Label>
              <Select
                value={paymentData.paymentMethod}
                onValueChange={(value) =>
                  setPaymentData({
                    ...paymentData,
                    paymentMethod: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transferencia">
                    🏦 Transferencia Bancaria
                  </SelectItem>
                  <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                  <SelectItem value="tarjeta_credito">
                    💳 Tarjeta de Crédito
                  </SelectItem>
                  <SelectItem value="tarjeta_debito">
                    💳 Tarjeta de Débito
                  </SelectItem>
                  <SelectItem value="mercadopago">📱 MercadoPago</SelectItem>
                  <SelectItem value="otro">🔄 Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="text-gray-700 dark:text-gray-300"
              >
                Notas (opcional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Ej: Pago con comprobante #12345, transferencia desde Banco Nación"
                value={paymentData.notes}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    notes: e.target.value,
                  })
                }
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                rows={3}
              />
            </div>

            {/* Resumen de pagos */}
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100 text-sm">
                📊 Resumen de Pagos
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total de cuotas:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {payments.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Cuotas pagadas:
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    {payments.filter((p) => p.paid).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Cuotas pendientes:
                  </span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {payments.filter((p) => !p.paid).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Monto total pagado:
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    {formatCurrency(
                      payments
                        .filter((p) => p.paid)
                        .reduce((sum, p) => sum + p.amount, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-gray-200 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || !selectedPaymentId || selectedPaymentData?.paid
              }
              className="bg-green-600 text-white hover:bg-green-700 disabled:bg-green-600/70 dark:bg-green-600 dark:hover:bg-green-700 transition-colors"
            >
              {isSubmitting ? (
                "Registrando..."
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar Pago
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
