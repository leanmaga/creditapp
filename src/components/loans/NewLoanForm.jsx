"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  AlertCircle,
  Calculator,
  PercentCircle,
  CalendarDays,
  Clock,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    months: "", // Esto se calculará según el tiempo elegido
    interestRate: 30,
    tipoTiempo: "meses",
    cantidad: "",
  });
  const [calculation, setCalculation] = useState({
    totalAmount: 0,
    monthlyPayment: 0,
    interest: 0,
    plazoEnMeses: 0,
  });

  useEffect(() => {
    calculateLoan();
  }, [
    loanData.amount,
    loanData.cantidad,
    loanData.interestRate,
    loanData.tipoTiempo,
  ]);

  const calculateLoan = () => {
    const amount = parseFloat(loanData.amount) || 0;
    const cantidad = parseFloat(loanData.cantidad) || 0;
    const interestRate = parseInt(loanData.interestRate) || 30;

    if (amount <= 0 || cantidad <= 0) {
      setCalculation({
        totalAmount: 0,
        monthlyPayment: 0,
        interest: 0,
        plazoEnMeses: 0,
      });
      return;
    }

    // Convertir a meses para compatibilidad con la base de datos
    let plazoEnMeses;
    switch (loanData.tipoTiempo) {
      case "semanas":
        plazoEnMeses = cantidad / 4.33; // Aproximadamente 4.33 semanas por mes
        break;
      case "meses":
        plazoEnMeses = cantidad;
        break;
      case "años":
        plazoEnMeses = cantidad * 12;
        break;
      default:
        plazoEnMeses = cantidad;
    }

    // Cálculo simple como en el simulador
    const interest = (amount * interestRate) / 100;
    const totalAmount = amount + interest;
    const monthlyPayment = totalAmount / plazoEnMeses;

    setCalculation({
      totalAmount,
      monthlyPayment,
      interest,
      plazoEnMeses: Math.round(plazoEnMeses * 100) / 100, // Redondear a 2 decimales
    });

    // Actualizar el campo months para la base de datos
    setLoanData((prev) => ({
      ...prev,
      months: Math.round(plazoEnMeses).toString(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validaciones
      if (!loanData.amount || parseFloat(loanData.amount) <= 0) {
        throw new Error("El monto del préstamo debe ser mayor a cero");
      }

      if (!loanData.cantidad || parseFloat(loanData.cantidad) <= 0) {
        throw new Error("La duración del préstamo debe ser mayor a cero");
      }

      if (calculation.plazoEnMeses < 0.1) {
        throw new Error("El plazo mínimo es de aproximadamente 3 días");
      }

      // Asegurar que months sea al menos 1
      const monthsForDB = Math.max(1, Math.round(calculation.plazoEnMeses));

      const loanDetails = {
        clientId,
        amount: parseFloat(loanData.amount),
        months: monthsForDB, // Convertido a meses para la BD
        interestRate: parseInt(loanData.interestRate),
        totalAmount: calculation.totalAmount,
        monthlyPayment: calculation.monthlyPayment,
      };

      console.log("Enviando préstamo:", loanDetails); // Para debug

      const result = await createLoan(loanDetails);

      toast({
        title: "Préstamo creado con éxito",
        description: `Préstamo de ${formatCurrency(
          parseFloat(loanData.amount)
        )} creado correctamente`,
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

  const getMinMax = () => {
    switch (loanData.tipoTiempo) {
      case "semanas":
        return { min: 1, max: 52 }; // 1 semana a 1 año
      case "meses":
        return { min: 1, max: 24 }; // 1 mes a 2 años
      case "años":
        return { min: 1, max: 5 }; // 1 año a 5 años
      default:
        return { min: 1, max: 24 };
    }
  };

  const cuotaPorPeriodo =
    loanData.cantidad > 0
      ? calculation.totalAmount / parseFloat(loanData.cantidad)
      : 0;

  return (
    <>
      <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
        <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
          Nuevo Préstamo Flexible
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Creando préstamo personalizado para:{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {clientName}
          </span>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5 pt-6">
          {/* Monto */}
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
              placeholder="Ej: 50000"
              value={loanData.amount}
              onChange={(e) =>
                setLoanData({ ...loanData, amount: e.target.value })
              }
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              required
              min="1"
              step="0.01"
            />
          </div>

          {/* Tasa de Interés */}
          <div className="space-y-3">
            <Label className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <PercentCircle className="w-4 h-4" />
              Tasa de Interés: {loanData.interestRate}%
            </Label>
            <div className="px-2">
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="200"
                  step="1"
                  value={loanData.interestRate}
                  onChange={(e) =>
                    setLoanData({
                      ...loanData,
                      interestRate: Number(e.target.value),
                    })
                  }
                  className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                      ((loanData.interestRate - 1) / 199) * 100
                    }%, rgba(255,255,255,0.2) ${
                      ((loanData.interestRate - 1) / 199) * 100
                    }%, rgba(255,255,255,0.2) 100%)`,
                  }}
                />
                <style jsx>{`
                  input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #3b82f6;
                    border: 2px solid #ffffff;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                  }
                  input[type="range"]::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #3b82f6;
                    border: 2px solid #ffffff;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                    border: none;
                  }
                `}</style>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1%</span>
                <span>100%</span>
                <span>200%</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                💡 Interés simple: se aplica directo sobre el monto
              </p>
            </div>
          </div>

          {/* Tipo de Tiempo */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Unidad de Tiempo *
            </Label>
            <Select
              value={loanData.tipoTiempo}
              onValueChange={(value) =>
                setLoanData({ ...loanData, tipoTiempo: value, cantidad: "" })
              }
            >
              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semanas">Semanas</SelectItem>
                <SelectItem value="meses">Meses</SelectItem>
                <SelectItem value="años">Años</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cantidad de Tiempo */}
          <div className="space-y-2">
            <Label
              htmlFor="cantidad"
              className="text-gray-700 dark:text-gray-300 flex items-center gap-2"
            >
              <CalendarDays className="w-4 h-4" />
              Cantidad de {loanData.tipoTiempo} *
            </Label>
            <Input
              id="cantidad"
              type="number"
              placeholder={`Ej: ${
                loanData.tipoTiempo === "semanas"
                  ? "4"
                  : loanData.tipoTiempo === "meses"
                  ? "12"
                  : "2"
              }`}
              value={loanData.cantidad}
              onChange={(e) =>
                setLoanData({ ...loanData, cantidad: e.target.value })
              }
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              min={getMinMax().min}
              max={getMinMax().max}
              step="1"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Rango: {getMinMax().min} - {getMinMax().max} {loanData.tipoTiempo}
            </p>
          </div>

          {/* Resumen del Cálculo */}
          {loanData.amount > 0 && loanData.cantidad > 0 && (
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
                <div className="flex justify-between">
                  <span>Plazo:</span>
                  <span className="font-medium">
                    {loanData.cantidad} {loanData.tipoTiempo}
                    {loanData.tipoTiempo !== "meses" && (
                      <span className="text-xs ml-1">
                        (≈ {calculation.plazoEnMeses.toFixed(1)} meses)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-semibold border-t border-blue-200 dark:border-blue-700 pt-2 mt-2">
                  <span>Total a devolver:</span>
                  <span>{formatCurrency(calculation.totalAmount)}</span>
                </div>
                <div className="pt-2 flex justify-between text-blue-900 dark:text-blue-200 font-semibold bg-blue-100/50 dark:bg-blue-800/30 p-2 rounded-md">
                  <span>Cuota por {loanData.tipoTiempo.slice(0, -1)}:</span>
                  <span>{formatCurrency(cuotaPorPeriodo)}</span>
                </div>
                {loanData.tipoTiempo !== "meses" && (
                  <div className="pt-1 flex justify-between text-blue-800 dark:text-blue-300 text-xs bg-blue-100/30 dark:bg-blue-800/20 p-2 rounded-md">
                    <span>Cuota mensual equivalente:</span>
                    <span>{formatCurrency(calculation.monthlyPayment)}</span>
                  </div>
                )}
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
            disabled={isSubmitting || !loanData.amount || !loanData.cantidad}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-600/70 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-blue-600/70 transition-colors"
          >
            {isSubmitting ? "Guardando..." : "Crear Préstamo"}
          </Button>
        </CardFooter>
      </form>
    </>
  );
}
