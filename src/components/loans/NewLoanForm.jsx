"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, AlertCircle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { createLoan } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

export default function NewLoanForm({ clientId, clientName, onComplete }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loanData, setLoanData] = useState({
    amount: "",
    months: "1",
    interestRate: 50,
  });
  const [calculation, setCalculation] = useState({
    totalAmount: 0,
    monthlyPayment: 0,
    interest: 0,
  });

  useEffect(() => {
    calculateLoan();
  }, [loanData.amount, loanData.months, loanData.interestRate]);

  const calculateLoan = () => {
    const amount = parseFloat(loanData.amount) || 0;
    const months = parseInt(loanData.months) || 1;
    const interestRate = parseInt(loanData.interestRate) || 50;

    const interest = (amount * interestRate) / 100;
    const totalAmount = amount + interest;
    const monthlyPayment = totalAmount / months;

    setCalculation({
      totalAmount,
      monthlyPayment,
      interest,
    });
  };

  const handleMonthsChange = (value) => {
    const interestRate = value === "1" ? 50 : 60;
    setLoanData({
      ...loanData,
      months: value,
      interestRate,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!loanData.amount || parseFloat(loanData.amount) <= 0) {
        throw new Error("El monto del préstamo debe ser mayor a cero");
      }

      const loanDetails = {
        clientId,
        amount: parseFloat(loanData.amount),
        months: parseInt(loanData.months),
        interestRate: parseInt(loanData.interestRate),
        totalAmount: calculation.totalAmount,
        monthlyPayment: calculation.monthlyPayment,
      };

      const result = await createLoan(loanDetails);

      toast({
        title: "Préstamo creado con éxito",
        description: "El préstamo se ha registrado correctamente",
      });

      if (onComplete) {
        onComplete(clientId);
      } else {
        router.push(`/clientes/${clientId}`);
      }
    } catch (error) {
      console.error("Error creating loan:", error);
      toast({
        variant: "destructive",
        title: "Error al crear el préstamo",
        description:
          error.message || "Ha ocurrido un error. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToClientInfo = () => {
    router.push(`/clientes/${clientId}`);
  };

  return (
    <>
      <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
        <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
          Nuevo Préstamo
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Creando préstamo para cliente:{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {clientName}
          </span>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label
              htmlFor="amount"
              className="text-gray-700 dark:text-gray-300"
            >
              Monto del Préstamo (ARS) *
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Ingrese el monto"
              value={loanData.amount}
              onChange={(e) =>
                setLoanData({ ...loanData, amount: e.target.value })
              }
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              Duración del Préstamo *
            </Label>
            <RadioGroup
              value={loanData.months}
              onValueChange={handleMonthsChange}
              className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="1"
                  id="1-month"
                  className="border-gray-300 text-blue-600 focus:ring-blue-500/20 dark:border-gray-700"
                />
                <Label
                  htmlFor="1-month"
                  className="cursor-pointer text-gray-700 dark:text-gray-300"
                >
                  1 mes{" "}
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    (50% interés)
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="2"
                  id="2-month"
                  className="border-gray-300 text-blue-600 focus:ring-blue-500/20 dark:border-gray-700"
                />
                <Label
                  htmlFor="2-month"
                  className="cursor-pointer text-gray-700 dark:text-gray-300"
                >
                  2 meses{" "}
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    (60% interés)
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {loanData.amount > 0 && (
            <Alert className="bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 mt-4">
              <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-base font-semibold ml-2 text-blue-800 dark:text-blue-300">
                Resumen del Préstamo
              </AlertTitle>
              <AlertDescription className="text-sm space-y-2 mt-2 text-blue-700 dark:text-blue-300">
                <div className="flex justify-between">
                  <span>Monto prestado:</span>
                  <span className="font-medium">
                    {formatCurrency(parseFloat(loanData.amount) || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Interés ({loanData.interestRate}%):</span>
                  <span className="font-medium">
                    {formatCurrency(calculation.interest)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold border-t border-blue-200 dark:border-blue-700 pt-2 mt-2">
                  <span>Total a devolver:</span>
                  <span>{formatCurrency(calculation.totalAmount)}</span>
                </div>
                <div className="pt-2 flex justify-between text-blue-900 dark:text-blue-200 font-semibold bg-blue-100/50 dark:bg-blue-800/30 p-2 rounded-md">
                  <span>
                    Cuota mensual ({loanData.months}{" "}
                    {parseInt(loanData.months) === 1 ? "mes" : "meses"}):
                  </span>
                  <span>{formatCurrency(calculation.monthlyPayment)}</span>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 rounded-b-lg">
          <Button
            type="button"
            variant="outline"
            onClick={goToClientInfo}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !loanData.amount}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-600/70 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-blue-600/70 transition-colors"
          >
            {isSubmitting ? "Guardando..." : "Crear Préstamo"}
          </Button>
        </CardFooter>
      </form>
    </>
  );
}
