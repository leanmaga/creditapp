"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote,
  Calculator,
  PercentCircle,
  CalendarDays,
} from "lucide-react";

const SimuladorDePrestamos = () => {
  const [monto, setMonto] = useState("");
  const [loanDetails, setLoanDetails] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = React.useRef(null);

  const appTitle = "Simulador de Préstamos";

  const calcularPrestamo = useCallback((montoSolicitado, tipoPrestamo) => {
    let tasaInteres;
    let plazo;

    if (tipoPrestamo === "A") {
      tasaInteres = 0.5;
      plazo = 1;
    } else {
      tasaInteres = 0.6;
      plazo = 2;
    }

    const montoTotal = montoSolicitado * (1 + tasaInteres);
    const cuotaMensual = plazo > 0 ? montoTotal / plazo : 0;

    return {
      montoSolicitado,
      tasaInteres,
      plazo,
      montoTotal,
      cuotaMensual,
    };
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleMontoChange = (event) => {
    const value = event.target.value;
    if (/^(\d+(\.\d{0,2})?)?$/.test(value)) {
      setMonto(value);
      setError(null);
    } else {
      setError("Por favor, ingresa un monto válido (solo números).");
      setMonto(value);
      setLoanDetails(null);
    }
  };

  const handleCalcular = (tipoPrestamo) => {
    if (!monto.trim()) {
      setError("Por favor, ingresa un monto.");
      setLoanDetails(null);
      return;
    }

    const montoNumerico = Number(monto);
    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      setError("Por favor, ingresa un monto válido mayor a cero.");
      setLoanDetails(null);
      return;
    }

    setError(null);
    const detalles = calcularPrestamo(montoNumerico, tipoPrestamo);
    setLoanDetails(detalles);
  };

  // Función para formatear los números
  const formatNumber = (number) => {
    return number.toLocaleString("es-AR", {
      // Especifica el locale argentino
      style: "decimal",
      useGrouping: true,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-[#0d1b2a] to-black p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-white">
            {appTitle}
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Calcula tu préstamo personal de forma rápida y sencilla.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-lg border border-white/10">
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="monto"
                className="block text-sm font-medium text-gray-300"
              >
                <Banknote className="inline-block mr-2 w-4 h-4" />
                Monto a solicitar ($):
              </label>
              <Input
                ref={inputRef}
                id="monto"
                type="text"
                value={monto}
                onChange={handleMontoChange}
                placeholder="Ingresa el monto"
                className={cn(
                  "w-full bg-black/20 text-white border-purple-500/30",
                  "placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500/50",
                  "transition-all duration-300",
                  error && "border-red-500/50 focus:ring-red-500/50"
                )}
              />
              {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => handleCalcular("A")}
                className={cn(
                  "flex-1 bg-gradient-to-r from-black to-black-600/20 text-white",
                  "hover:from-blue-500/30 hover:to-blue-600/30  ",
                  "border border-white-500/30 shadow-lg hover:shadow-green-500/20",
                  "transition-all duration-300 py-3 sm:py-4 text-sm sm:text-base",
                  "flex items-center justify-center gap-2"
                )}
              >
                <Calculator className="w-5 h-5" />
                Préstamo Rápido (1 mes, 50% interés)
              </Button>
              <Button
                onClick={() => handleCalcular("B")}
                className={cn(
                  "flex-1 bg-gradient-to-r from-black to-black-600/20 text-white",
                  "hover:from-blue-500/30 hover:to-blue-600/30 ",
                  "border border-blue-500/30 shadow-lg hover:shadow-blue-500/20",
                  "transition-all duration-300 py-3 sm:py-4 text-sm sm:text-base",
                  "flex items-center justify-center gap-2"
                )}
              >
                <Calculator className="w-5 h-5" />
                Préstamo Estándar (2 meses, 60% interés)
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {loanDetails && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card className="bg-white/5 backdrop-blur-md shadow-lg border border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                    <PercentCircle className="w-6 h-6" />
                    Detalles del Préstamo
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Resumen de tu préstamo calculado:
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
                    <div>
                      <span className="font-medium">Monto Solicitado:</span>
                      <span className="ml-2 text-white">
                        ${formatNumber(loanDetails.montoSolicitado)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Tasa de Interés:</span>
                      <span className="ml-2 text-white">
                        {(loanDetails.tasaInteres * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Plazo:</span>
                      <span className="ml-2 text-white">
                        {loanDetails.plazo} mes
                        {loanDetails.plazo > 1 ? "es" : ""}
                        <CalendarDays className="inline-block ml-1 w-4 h-4" />
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">
                        Monto Total a Devolver:
                      </span>
                      <span className="ml-2 text-white">
                        ${formatNumber(loanDetails.montoTotal)}
                      </span>
                    </div>
                    {loanDetails.cuotaMensual !== undefined && (
                      <div>
                        <span className="font-medium">Cuota Mensual:</span>
                        <span className="ml-2 text-white">
                          ${formatNumber(loanDetails.cuotaMensual)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SimuladorDePrestamos;
