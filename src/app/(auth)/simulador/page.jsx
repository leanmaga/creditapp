"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
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
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote,
  Calculator,
  PercentCircle,
  CalendarDays,
  Clock,
  TrendingUp,
} from "lucide-react";

const SimuladorDePrestamos = () => {
  const [monto, setMonto] = useState("");
  const [interestRate, setInterestRate] = useState(30); // Cambiado a número simple
  const [tipoTiempo, setTipoTiempo] = useState("meses");
  const [cantidad, setCantidad] = useState("");
  const [loanDetails, setLoanDetails] = useState(null);
  const [error, setError] = useState(null);

  const inputRef = React.useRef(null);

  const appTitle = "Simulador de Préstamos Flexible";

  // CÁLCULO SIMPLE COMO PEDISTE
  const calcularPrestamo = useCallback(
    (montoSolicitado, tasaInteres, tipoTiempo, cantidadTiempo) => {
      // Interés simple: Monto * (Tasa / 100)
      const interesTotal = montoSolicitado * (tasaInteres / 100);
      const montoTotal = montoSolicitado + interesTotal;

      // Cuota por período (semanas, meses, años)
      const cuotaPorPeriodo =
        cantidadTiempo > 0 ? montoTotal / cantidadTiempo : 0;

      return {
        montoSolicitado,
        tasaInteres,
        plazoOriginal: cantidadTiempo,
        tipoTiempo,
        montoTotal,
        interesTotal,
        cuotaPorPeriodo,
        unidadTiempo: tipoTiempo,
      };
    },
    []
  );

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Auto-calcular cuando cambien los valores
  useEffect(() => {
    if (monto && cantidad && !error) {
      const montoNumerico = Number(monto);
      const cantidadNumerica = Number(cantidad);

      if (montoNumerico > 0 && cantidadNumerica > 0) {
        const detalles = calcularPrestamo(
          montoNumerico,
          interestRate,
          tipoTiempo,
          cantidadNumerica
        );
        setLoanDetails(detalles);
      }
    }
  }, [monto, interestRate, tipoTiempo, cantidad, error, calcularPrestamo]);

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

  const handleCantidadChange = (event) => {
    const value = event.target.value;
    if (/^(\d+(\.\d{0,2})?)?$/.test(value)) {
      setCantidad(value);
      setError(null);
    } else {
      setError("Por favor, ingresa una cantidad válida.");
      setCantidad(value);
    }
  };

  const formatNumber = (number) => {
    return number.toLocaleString("es-AR", {
      style: "decimal",
      useGrouping: true,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatCurrency = (number) => {
    return number.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
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

  const getMinMax = () => {
    switch (tipoTiempo) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold mb-6 text-white">{appTitle}</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Calcula tu préstamo con interés simple: monto, tasa e interés
            directo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel de Configuración */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-lg border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Configuración del Préstamo
            </h2>

            <div className="space-y-6">
              {/* Monto */}
              <div className="space-y-2">
                <Label
                  htmlFor="monto"
                  className="text-gray-300 flex items-center gap-2"
                >
                  <Banknote className="w-4 h-4" />
                  Monto a solicitar ($)
                </Label>
                <Input
                  ref={inputRef}
                  id="monto"
                  type="text"
                  value={monto}
                  onChange={handleMontoChange}
                  placeholder="Ej: 100000"
                  className={cn(
                    "w-full bg-black/20 text-white border-purple-500/30 text-lg",
                    "placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500/50",
                    "transition-all duration-300",
                    error && "border-red-500/50 focus:ring-red-500/50"
                  )}
                />
              </div>

              {/* Tasa de Interés - SLIDER MEJORADO */}
              <div className="space-y-3">
                <Label className="text-gray-300 flex items-center gap-2">
                  <PercentCircle className="w-4 h-4" />
                  Tasa de Interés: {interestRate}%
                </Label>
                <div className="px-2">
                  {/* SLIDER PERSONALIZADO VISIBLE */}
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="200"
                      step="1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                          ((interestRate - 1) / 199) * 100
                        }%, rgba(255,255,255,0.2) ${
                          ((interestRate - 1) / 199) * 100
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
                  <p className="text-xs text-gray-300 mt-2">
                    💡 Interés simple: se aplica directo sobre el monto
                  </p>
                </div>
              </div>

              {/* Tipo de Tiempo */}
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Unidad de Tiempo
                </Label>
                <Select value={tipoTiempo} onValueChange={setTipoTiempo}>
                  <SelectTrigger className="bg-black/20 text-white border-purple-500/30">
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
                  className="text-gray-300 flex items-center gap-2"
                >
                  <CalendarDays className="w-4 h-4" />
                  Cantidad de {tipoTiempo}
                </Label>
                <Input
                  id="cantidad"
                  type="text"
                  value={cantidad}
                  onChange={handleCantidadChange}
                  placeholder={`Ej: ${
                    tipoTiempo === "semanas"
                      ? "4"
                      : tipoTiempo === "meses"
                      ? "12"
                      : "2"
                  }`}
                  className="w-full bg-black/20 text-white border-purple-500/30"
                />
                <p className="text-xs text-gray-400">
                  Rango: {getMinMax().min} - {getMinMax().max} {tipoTiempo}
                </p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Panel de Resultados */}
          <div className="space-y-6">
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
                        <TrendingUp className="w-6 h-6" />
                        Resumen del Préstamo
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Cálculo con interés simple directo
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 text-gray-300">
                        <div className="bg-black/20 p-4 rounded-lg">
                          <span className="text-sm text-gray-400">
                            Monto Solicitado
                          </span>
                          <div className="text-xl font-bold text-white">
                            {formatCurrency(loanDetails.montoSolicitado)}
                          </div>
                        </div>

                        <div className="bg-black/20 p-4 rounded-lg">
                          <span className="text-sm text-gray-400">
                            Tasa de Interés
                          </span>
                          <div className="text-xl font-bold text-white">
                            {loanDetails.tasaInteres}%
                            <span className="text-sm text-gray-400 ml-1">
                              (directo)
                            </span>
                          </div>
                        </div>

                        <div className="bg-black/20 p-4 rounded-lg">
                          <span className="text-sm text-gray-400">Plazo</span>
                          <div className="text-xl font-bold text-white">
                            {loanDetails.plazoOriginal} {loanDetails.tipoTiempo}
                          </div>
                        </div>

                        <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                          <span className="text-sm text-purple-400">
                            Interés Total
                          </span>
                          <div className="text-2xl font-bold text-purple-300">
                            {formatCurrency(loanDetails.interesTotal)}
                          </div>
                          <span className="text-xs text-purple-400">
                            {formatCurrency(loanDetails.montoSolicitado)} ×{" "}
                            {loanDetails.tasaInteres}%
                          </span>
                        </div>

                        <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                          <span className="text-sm text-green-400">
                            Total a Devolver
                          </span>
                          <div className="text-2xl font-bold text-green-300">
                            {formatCurrency(loanDetails.montoTotal)}
                          </div>
                          <span className="text-xs text-green-400">
                            Capital + Interés
                          </span>
                        </div>

                        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                          <span className="text-sm text-blue-400">
                            Cuota por {loanDetails.tipoTiempo.slice(0, -1)}
                          </span>
                          <div className="text-2xl font-bold text-blue-300">
                            {formatCurrency(loanDetails.cuotaPorPeriodo)}
                          </div>
                          <span className="text-xs text-blue-400">
                            {formatCurrency(loanDetails.montoTotal)} ÷{" "}
                            {loanDetails.plazoOriginal} {loanDetails.tipoTiempo}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {!loanDetails && !error && (
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 shadow-lg border border-white/10 text-center">
                <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Completa los datos
                </h3>
                <p className="text-gray-400">
                  Ingresa el monto y el plazo para ver el cálculo automático
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimuladorDePrestamos;
