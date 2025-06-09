import React, { useState, useEffect } from "react";
import {
  Calendar,
  Edit3,
  Plus,
  Trash2,
  Save,
  X,
  Clock,
  DollarSign,
  Calculator,
} from "lucide-react";
import { createLoan } from "../../lib/api-client";

const NewLoanForm = ({ clientId, clientName, onSuccess, onCancel }) => {
  // Estados del formulario básico
  const [formData, setFormData] = useState({
    amount: "",
    cantidad: "",
    interestRate: "",
    tipoTiempo: "meses",
    useCustomDates: true,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  // Estados del sistema avanzado de fechas
  const [dateMode, setDateMode] = useState("auto");
  const [installmentDates, setInstallmentDates] = useState([]);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [calculatedData, setCalculatedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función helper para crear fecha segura
  const createSafeDate = (dateValue) => {
    if (!dateValue) return null;
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date;
    } catch (error) {
      return null;
    }
  };

  // Función helper para formatear fecha a ISO de forma segura
  const toISODateString = (date) => {
    if (!date) return "";
    try {
      if (typeof date === "string") {
        if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return date;
        }
        date = createSafeDate(date);
      }
      if (!date || isNaN(date.getTime())) {
        return "";
      }
      return date.toISOString().split("T")[0];
    } catch (error) {
      return "";
    }
  };

  // Función para calcular fechas automáticas mejoradas - CORREGIDA
  const calculateAutomaticDates = (startDate, endDate, numInstallments) => {
    if (!startDate || !endDate || !numInstallments || numInstallments <= 0) {
      return [];
    }

    try {
      const start = createSafeDate(startDate);
      const end = createSafeDate(endDate);

      if (!start || !end) {
        return [];
      }

      if (end <= start) {
        return [];
      }

      const dates = [];

      // Para préstamos mensuales, agregar un mes a cada cuota
      for (let i = 0; i < numInstallments; i++) {
        const installmentDate = new Date(start);

        // Agregar meses en lugar de días distribuidos
        installmentDate.setMonth(start.getMonth() + (i + 1));

        // Si es la última cuota, asegurar que coincida con la fecha de fin
        if (i === numInstallments - 1) {
          // Usar la fecha de fin especificada para la última cuota
          installmentDate.setTime(end.getTime());
        }

        const dateString = toISODateString(installmentDate);
        if (dateString) {
          dates.push(dateString);
        }
      }

      return dates;
    } catch (error) {
      return [];
    }
  };

  // Función principal de cálculo del préstamo
  const calculateLoan = (data) => {
    if (!data.amount || !data.cantidad || !data.interestRate) {
      return null;
    }

    const amount = parseFloat(data.amount);
    const installments = parseInt(data.cantidad);
    const interestRate = parseFloat(data.interestRate);

    if (
      isNaN(amount) ||
      isNaN(installments) ||
      isNaN(interestRate) ||
      amount <= 0 ||
      installments <= 0 ||
      interestRate < 0
    ) {
      return null;
    }

    const interestAmount = (amount * interestRate) / 100;
    const totalAmount = amount + interestAmount;
    const monthlyPayment = totalAmount / installments;

    let installmentDatesArray = [];

    if (data.useCustomDates && data.startDate && data.endDate) {
      installmentDatesArray = calculateAutomaticDates(
        data.startDate,
        data.endDate,
        installments
      );
    }

    const result = {
      amount: amount,
      interestRate: interestRate,
      interestAmount: interestAmount,
      totalAmount: totalAmount,
      monthlyPayment: monthlyPayment,
      installmentDates: installmentDatesArray,
      months: installments,
      startDate: data.startDate || "",
      endDate: data.endDate || "",
    };

    setCalculatedData(result);

    if (result.startDate || installmentDatesArray.length > 0) {
      generateDetailedInstallments(result);
    }

    return result;
  };

  // Generar cuotas detalladas editables
  const generateDetailedInstallments = (loanData) => {
    const installments = [];
    const baseAmount = Math.round(loanData.monthlyPayment);

    const safeStartDate =
      loanData.startDate || new Date().toISOString().split("T")[0];

    for (let i = 0; i < loanData.months; i++) {
      const startDate =
        i === 0
          ? safeStartDate
          : loanData.installmentDates[i - 1] || safeStartDate;

      const dueDate =
        loanData.installmentDates[i] ||
        calculateDefaultDueDate(safeStartDate, i + 1);

      installments.push({
        id: i + 1,
        installmentNumber: i + 1,
        startDate: startDate,
        dueDate: dueDate,
        amount: baseAmount,
        paid: false,
        paymentDate: null,
      });
    }

    setInstallmentDates(installments);
  };

  // Calcular fecha de vencimiento por defecto (mensual)
  const calculateDefaultDueDate = (startDate, monthsToAdd) => {
    try {
      const baseDate = startDate ? createSafeDate(startDate) : new Date();
      if (!baseDate) {
        const today = new Date();
        today.setMonth(today.getMonth() + monthsToAdd);
        return toISODateString(today);
      }

      const resultDate = new Date(baseDate);
      resultDate.setMonth(resultDate.getMonth() + monthsToAdd);
      return toISODateString(resultDate) || toISODateString(new Date());
    } catch (error) {
      const fallbackDate = new Date();
      fallbackDate.setMonth(fallbackDate.getMonth() + monthsToAdd);
      return toISODateString(fallbackDate);
    }
  };

  // Actualizar fecha de cuota individual
  const updateInstallmentDate = (id, field, value) => {
    setInstallmentDates((prev) =>
      prev.map((installment) =>
        installment.id === id ? { ...installment, [field]: value } : installment
      )
    );
  };

  // Agregar nueva cuota
  const addInstallment = () => {
    const lastInstallment = installmentDates[installmentDates.length - 1];

    let newDueDate;
    try {
      const baseDate =
        lastInstallment?.dueDate ||
        formData.endDate ||
        new Date().toISOString().split("T")[0];

      const newDate = createSafeDate(baseDate);

      if (!newDate) {
        const today = new Date();
        today.setMonth(today.getMonth() + 1);
        newDueDate = toISODateString(today);
      } else {
        const resultDate = new Date(newDate);
        resultDate.setMonth(resultDate.getMonth() + 1);
        newDueDate = toISODateString(resultDate);
      }
    } catch (error) {
      const today = new Date();
      today.setMonth(today.getMonth() + 1);
      newDueDate = toISODateString(today);
    }

    const newInstallment = {
      id: installmentDates.length + 1,
      installmentNumber: installmentDates.length + 1,
      startDate:
        lastInstallment?.dueDate ||
        formData.startDate ||
        new Date().toISOString().split("T")[0],
      dueDate: newDueDate,
      amount: Math.round(calculatedData?.monthlyPayment || 0),
      paid: false,
      paymentDate: null,
    };

    setInstallmentDates([...installmentDates, newInstallment]);
    setFormData((prev) => ({
      ...prev,
      cantidad: String(installmentDates.length + 1),
    }));
  };

  // Remover cuota
  const removeInstallment = (id) => {
    if (installmentDates.length > 1) {
      const newInstallments = installmentDates.filter((inst) => inst.id !== id);
      const renumberedInstallments = newInstallments.map((inst, index) => ({
        ...inst,
        id: index + 1,
        installmentNumber: index + 1,
      }));

      setInstallmentDates(renumberedInstallments);
      setFormData((prev) => ({
        ...prev,
        cantidad: String(renumberedInstallments.length),
      }));
    }
  };

  // Manejar cambios en inputs del formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Establecer fecha de fin automática cuando se cambia la cantidad
  const handleCantidadChange = (e) => {
    const cantidad = e.target.value;
    setFormData((prev) => {
      const newData = { ...prev, cantidad };

      // Solo calcular fecha de fin automática si no se ha establecido manualmente
      if (
        prev.startDate &&
        cantidad &&
        !isNaN(parseInt(cantidad)) &&
        !prev.endDate
      ) {
        try {
          const startDate = createSafeDate(prev.startDate);

          if (startDate) {
            const endDate = new Date(startDate);
            const cantidadNum = parseInt(cantidad);

            if (prev.tipoTiempo === "meses") {
              endDate.setMonth(startDate.getMonth() + cantidadNum);
            } else if (prev.tipoTiempo === "semanas") {
              endDate.setDate(startDate.getDate() + cantidadNum * 7);
            } else {
              endDate.setDate(startDate.getDate() + cantidadNum);
            }

            const endDateString = toISODateString(endDate);
            if (endDateString) {
              newData.endDate = endDateString;
            }
          }
        } catch (error) {
          // Silently handle error
        }
      }

      return newData;
    });
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.amount || !formData.cantidad || !formData.interestRate) {
        throw new Error("Por favor complete todos los campos obligatorios");
      }

      if (!formData.startDate || !formData.endDate) {
        throw new Error(
          "Por favor seleccione las fechas de inicio y vencimiento"
        );
      }

      if (installmentDates.length === 0) {
        throw new Error("No se han generado las cuotas del préstamo");
      }

      const loanDetails = {
        clientId: clientId,
        amount: parseFloat(formData.amount),
        interestRate: parseFloat(formData.interestRate),
        months: parseInt(formData.cantidad),
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalAmount: calculatedData.totalAmount,
        monthlyPayment: calculatedData.monthlyPayment,
        interestAmount: calculatedData.interestAmount,
        installmentDates: installmentDates.map((inst) => inst.dueDate),
        customInstallments: installmentDates,
      };

      const result = await createLoan(loanDetails);

      if (result && onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      alert("Error al crear el préstamo: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recalcular cuando cambien los datos del formulario
  useEffect(() => {
    if (formData.amount && formData.cantidad && formData.interestRate) {
      if (formData.useCustomDates) {
        if (formData.startDate && formData.endDate) {
          calculateLoan(formData);
        }
      } else {
        calculateLoan(formData);
      }
    }
  }, [
    formData.amount,
    formData.cantidad,
    formData.interestRate,
    formData.startDate,
    formData.endDate,
  ]);

  // Calcular totales de las cuotas editables
  const getTotalAmount = () => {
    return installmentDates.reduce((sum, inst) => sum + (inst.amount || 0), 0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center  p-4">
      <div className=" rounded-2xl shadow-xl w-full max-w-3xl p-6 space-y-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calculator className="text-white" />
            Nuevo Préstamo para {clientName}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Datos básicos del préstamo */}
          <div className=" border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <DollarSign className="text-blue-600" />
              Datos del Préstamo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto a Prestar *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Ej: 100000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad de Cuotas *
                </label>
                <input
                  type="number"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleCantidadChange}
                  placeholder="Ej: 12"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tasa de Interés (%) *
                </label>
                <input
                  type="number"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleInputChange}
                  placeholder="Ej: 50"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Tiempo
              </label>
              <select
                name="tipoTiempo"
                value={formData.tipoTiempo}
                onChange={handleInputChange}
                className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="meses">Meses</option>
                <option value="semanas">Semanas</option>
                <option value="dias">Días</option>
              </select>
            </div>
          </div>

          {/* Sistema de fechas avanzado */}
          <div className=" border rounded-lg p-6">
            <div className="flex-col pb-4 justify-between items-center mb-4 md:flex lg:flex ">
              <h2 className="text-xl font-semibold text-blue-800 flex items-center gap-4 pb-4 ">
                <Calendar className="text-blue-600" />
                Fechas del Préstamo
              </h2>
              <div className="flex gap-2">
                <select
                  value={dateMode}
                  onChange={(e) => setDateMode(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="auto">Automático</option>
                  <option value="manual">Manual</option>
                </select>
                <button
                  type="button"
                  onClick={() => setIsEditingDates(!isEditingDates)}
                  className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
                    isEditingDates
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  {isEditingDates ? <X size={14} /> : <Edit3 size={14} />}
                  {isEditingDates ? "Finalizar" : "Editar Cuotas"}
                </button>
              </div>
            </div>

            {/* Fechas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Vencimiento Final *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Cuotas detalladas editables */}
            {installmentDates.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    Cronograma de Cuotas ({installmentDates.length})
                  </h3>
                  {isEditingDates && (
                    <button
                      type="button"
                      onClick={addInstallment}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-md text-sm flex items-center gap-1 hover:bg-green-200"
                    >
                      <Plus size={14} />
                      Agregar Cuota
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {installmentDates.map((installment) => (
                    <div
                      key={installment.id}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-gray-800">
                          Cuota {installment.installmentNumber}
                        </span>
                        {isEditingDates && installmentDates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInstallment(installment.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Eliminar cuota"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Fecha de Inicio
                          </label>
                          <input
                            type="date"
                            value={installment.startDate}
                            onChange={(e) =>
                              updateInstallmentDate(
                                installment.id,
                                "startDate",
                                e.target.value
                              )
                            }
                            disabled={!isEditingDates}
                            className={`w-full px-3 py-2 text-sm border rounded-md ${
                              isEditingDates
                                ? "border-gray-300 focus:ring-2 focus:ring-blue-500"
                                : "border-gray-200 bg-gray-100"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Fecha de Vencimiento
                          </label>
                          <input
                            type="date"
                            value={installment.dueDate}
                            onChange={(e) =>
                              updateInstallmentDate(
                                installment.id,
                                "dueDate",
                                e.target.value
                              )
                            }
                            disabled={!isEditingDates}
                            className={`w-full px-3 py-2 text-sm border rounded-md ${
                              isEditingDates
                                ? "border-gray-300 focus:ring-2 focus:ring-blue-500"
                                : "border-gray-200 bg-gray-100"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Monto ($)
                          </label>
                          <input
                            type="number"
                            value={installment.amount}
                            onChange={(e) =>
                              updateInstallmentDate(
                                installment.id,
                                "amount",
                                parseInt(e.target.value) || 0
                              )
                            }
                            disabled={!isEditingDates}
                            className={`w-full px-3 py-2 text-sm border rounded-md ${
                              isEditingDates
                                ? "border-gray-300 focus:ring-2 focus:ring-blue-500"
                                : "border-gray-200 bg-gray-100"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resumen del préstamo */}
          {calculatedData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                Resumen del Préstamo
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Monto Prestado</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ${calculatedData.amount.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    Interés ({calculatedData.interestRate}%)
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${calculatedData.interestAmount.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Total a Devolver</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${getTotalAmount().toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Cuota Promedio</p>
                  <p className="text-2xl font-bold text-purple-600">
                    $
                    {Math.round(calculatedData.monthlyPayment).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded border">
                <div className="flex justify-between text-sm">
                  <span>Período:</span>
                  <span className="font-medium">
                    {calculatedData.startDate} a {calculatedData.endDate}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Plazo:</span>
                  <span className="font-medium">
                    {calculatedData.months} {formData.tipoTiempo}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !calculatedData}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Crear Préstamo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewLoanForm;
