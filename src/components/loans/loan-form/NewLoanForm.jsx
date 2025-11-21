import React from "react";
import { Calculator } from "lucide-react";
import { createLoan } from "../../../lib/api-client";
import { useLoanCalculator } from "./hooks";
import {
  LoanBasicInfo,
  LoanDatesSection,
  LoanSummary,
  FormActions,
} from "./components";

const NewLoanForm = ({ clientId, clientName, onSuccess, onCancel }) => {
  // Usar el hook personalizado para toda la lógica
  const {
    formData,
    dateMode,
    setDateMode,
    installmentDates,
    isEditingDates,
    setIsEditingDates,
    calculatedData,
    isSubmitting,
    setIsSubmitting,
    handleInputChange,
    handleTipoTiempoChange,
    handleCantidadChange,
    updateInstallmentDate,
    addInstallment,
    removeInstallment,
    getTotalAmount,
    getTipoTiempoLabel,
  } = useLoanCalculator();

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

      // ✅ Estructura correcta para enviar
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
        // ✅ Solo enviar las fechas de vencimiento para la función RPC
        installmentDates: installmentDates.map((inst) => inst.dueDate),
        // ✅ Enviar las cuotas completas para actualizarlas después
        customInstallments: installmentDates,
        tipoTiempo: formData.tipoTiempo,
      };

      console.log("📤 Enviando loanDetails:", loanDetails);

      const result = await createLoan(loanDetails);

      if (result && onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error("❌ Error completo:", error);
      alert("Error al crear el préstamo: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="rounded-2xl shadow-xl w-full max-w-3xl p-6 space-y-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calculator className="text-white" />
            Nuevo Préstamo para {clientName}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Datos básicos del préstamo */}
          <LoanBasicInfo
            formData={formData}
            handleInputChange={handleInputChange}
            handleCantidadChange={handleCantidadChange}
            handleTipoTiempoChange={handleTipoTiempoChange}
          />

          {/* Sistema de fechas avanzado */}
          <LoanDatesSection
            formData={formData}
            handleInputChange={handleInputChange}
            dateMode={dateMode}
            setDateMode={setDateMode}
            isEditingDates={isEditingDates}
            setIsEditingDates={setIsEditingDates}
            installmentDates={installmentDates}
            updateInstallmentDate={updateInstallmentDate}
            removeInstallment={removeInstallment}
            addInstallment={addInstallment}
          />

          {/* Resumen del préstamo */}
          <LoanSummary
            calculatedData={calculatedData}
            getTotalAmount={getTotalAmount}
            getTipoTiempoLabel={getTipoTiempoLabel}
          />

          {/* Botones de acción */}
          <FormActions
            onCancel={onCancel}
            isSubmitting={isSubmitting}
            isDisabled={!calculatedData}
          />
        </form>
      </div>
    </div>
  );
};

export default NewLoanForm;
