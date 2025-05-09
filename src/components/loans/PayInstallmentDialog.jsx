"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CalendarCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { payInstallment } from "@/lib/api-client";
import { formatDate, formatCurrency } from "@/lib/utils";

export function PayInstallmentDialog({
  open,
  onOpenChange,
  installment,
  clientId,
  loanId,
  onSuccess,
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  if (!installment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await payInstallment(clientId, loanId, installment.id, {
        payment_date: paymentDate,
      });

      toast({
        title: "Pago registrado",
        description: "El pago ha sido registrado exitosamente",
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Registrar Pago</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Registra el pago de la cuota{" "}
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {installment.installment_number}
            </span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2 pb-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-700 dark:text-blue-300">
                  Monto a pagar:
                </span>
                <span className="font-semibold text-blue-800 dark:text-blue-200">
                  {formatCurrency(installment.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-700 dark:text-blue-300">
                  Fecha de vencimiento:
                </span>
                <span className="flex items-center text-blue-800 dark:text-blue-200">
                  <CalendarClock className="h-3.5 w-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                  {formatDate(installment.due_date)}
                </span>
              </div>
            </div>

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
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="pl-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  max={new Date().toISOString().substring(0, 10)}
                />
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
              disabled={isSubmitting}
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
