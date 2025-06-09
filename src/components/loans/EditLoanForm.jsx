import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Edit3,
  Plus,
  Trash2,
  Save,
  X,
  DollarSign,
  Calculator,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchLoanById,
  updateLoan,
  updateInstallment,
} from "../../lib/api-client";
import { useToast } from "@/hooks/use-toast";

const EditLoanForm = ({ clientId, loanId }) => {
  const router = useRouter();
  const { toast } = useToast();

  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    amount: "",
    interestRate: "",
    months: "",
    startDate: "",
    endDate: "",
  });

  const [installmentDates, setInstallmentDates] = useState([]);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [calculatedData, setCalculatedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalLoan, setOriginalLoan] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Helper para formatear fecha de ISO a YYYY-MM-DD
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    try {
      // Si ya está en formato YYYY-MM-DD, devolverla tal como está
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }

      // Si está en formato ISO completo, extraer solo la fecha
      if (dateString.includes("T")) {
        return dateString.split("T")[0];
      }

      // Intentar parsear y formatear
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }

      return "";
    } catch (error) {
      console.warn("Error formatting date:", dateString, error);
      return "";
    }
  };

  // Cargar datos del préstamo
  useEffect(() => {
    const loadLoanData = async () => {
      if (!clientId || !loanId) {
        console.error("Missing clientId or loanId:", { clientId, loanId });
        setError("Parámetros inválidos");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Fetching loan data for:", { clientId, loanId });
        const loanData = await fetchLoanById(clientId, loanId);
        console.log("📦 Raw loan data received:", loanData);

        if (!loanData) {
          throw new Error("No se encontró el préstamo");
        }

        setOriginalLoan(loanData);

        // Formatear fechas correctamente
        const formattedStartDate = formatDateForInput(loanData.start_date);
        const formattedEndDate = formatDateForInput(loanData.end_date);

        console.log("📅 Date formatting:", {
          raw_start_date: loanData.start_date,
          formatted_start_date: formattedStartDate,
          raw_end_date: loanData.end_date,
          formatted_end_date: formattedEndDate,
        });

        // Establecer datos del formulario
        const newFormData = {
          amount: loanData.amount?.toString() || "",
          interestRate: loanData.interest_rate?.toString() || "",
          months: loanData.months?.toString() || "",
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        };

        console.log("📝 Setting form data:", newFormData);
        setFormData(newFormData);

        // Establecer cuotas
        if (loanData.installments && Array.isArray(loanData.installments)) {
          const formattedInstallments = loanData.installments.map((inst) => {
            const formattedDueDate = formatDateForInput(inst.due_date);
            const formattedStartDate = formatDateForInput(inst.start_date);

            console.log(`📅 Installment ${inst.installment_number} dates:`, {
              raw_due_date: inst.due_date,
              formatted_due_date: formattedDueDate,
              raw_start_date: inst.start_date,
              formatted_start_date: formattedStartDate,
            });

            return {
              id: inst.id,
              installmentNumber: inst.installment_number,
              startDate: formattedStartDate,
              dueDate: formattedDueDate,
              amount: inst.amount,
              paid: inst.paid,
              paymentDate: inst.payment_date,
              originalAmount: inst.amount,
            };
          });

          console.log("💳 Formatted installments:", formattedInstallments);
          setInstallmentDates(
            formattedInstallments.sort(
              (a, b) => a.installmentNumber - b.installmentNumber
            )
          );
        } else {
          console.warn("⚠️ No installments found or invalid format");
          setInstallmentDates([]);
        }

        // Calcular datos iniciales
        const calculatedInfo = {
          amount: parseFloat(loanData.amount || 0),
          interestRate: parseFloat(loanData.interest_rate || 0),
          interestAmount: parseFloat(loanData.interest_amount || 0),
          totalAmount: parseFloat(loanData.total_amount || 0),
          monthlyPayment: parseFloat(loanData.monthly_payment || 0),
          months: parseInt(loanData.months || 0),
        };

        console.log("🧮 Calculated data:", calculatedInfo);
        setCalculatedData(calculatedInfo);
      } catch (error) {
        console.error("❌ Error loading loan data:", error);
        setError(error.message || "Error al cargar el préstamo");

        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la información del préstamo",
        });
      } finally {
        setLoading(false);
      }
    };

    loadLoanData();
  }, [clientId, loanId, toast]);

  // Detectar cambios
  useEffect(() => {
    if (!originalLoan) return;

    const formChanged =
      formData.amount !== (originalLoan.amount?.toString() || "") ||
      formData.interestRate !==
        (originalLoan.interest_rate?.toString() || "") ||
      formData.months !== (originalLoan.months?.toString() || "") ||
      formData.startDate !== formatDateForInput(originalLoan.start_date) ||
      formData.endDate !== formatDateForInput(originalLoan.end_date);

    const installmentsChanged = installmentDates.some((inst) => {
      const original = originalLoan.installments?.find((o) => o.id === inst.id);
      if (!original) return true;
      return (
        inst.amount !== original.amount ||
        inst.dueDate !== formatDateForInput(original.due_date) ||
        inst.startDate !== formatDateForInput(original.start_date)
      );
    });

    const hasAnyChanges = formChanged || installmentsChanged;
    console.log("🔍 Change detection:", {
      formChanged,
      installmentsChanged,
      hasAnyChanges,
      currentFormData: formData,
      originalDates: {
        start: formatDateForInput(originalLoan.start_date),
        end: formatDateForInput(originalLoan.end_date),
      },
    });

    setHasChanges(hasAnyChanges);
  }, [formData, installmentDates, originalLoan]);

  // Calcular préstamo
  const calculateLoan = () => {
    const amount = parseFloat(formData.amount);
    const interestRate = parseFloat(formData.interestRate);
    const months = parseInt(formData.months);

    if (
      isNaN(amount) ||
      isNaN(interestRate) ||
      isNaN(months) ||
      amount <= 0 ||
      months <= 0
    ) {
      return null;
    }

    const interestAmount = (amount * interestRate) / 100;
    const totalAmount = amount + interestAmount;
    const monthlyPayment = totalAmount / months;

    const newCalculatedData = {
      amount,
      interestRate,
      interestAmount,
      totalAmount,
      monthlyPayment,
      months,
    };

    console.log("🧮 Recalculated loan data:", newCalculatedData);
    setCalculatedData(newCalculatedData);

    return newCalculatedData;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("📝 Form input changed:", { name, value });
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Actualizar cuota individual
  const updateInstallmentDate = (id, field, value) => {
    console.log("💳 Updating installment:", { id, field, value });
    setInstallmentDates((prev) =>
      prev.map((installment) =>
        installment.id === id ? { ...installment, [field]: value } : installment
      )
    );
  };

  // Agregar nueva cuota
  const addInstallment = () => {
    const lastInstallment = installmentDates[installmentDates.length - 1];
    const baseDate = lastInstallment?.dueDate || formData.endDate;

    let newDueDate = "";
    if (baseDate) {
      try {
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() + 1);
        newDueDate = formatDateForInput(date.toISOString());
      } catch (error) {
        console.warn("Error calculating new due date:", error);
        newDueDate = "";
      }
    }

    const newInstallment = {
      id: `new-${Date.now()}`,
      installmentNumber: installmentDates.length + 1,
      startDate: lastInstallment?.dueDate || formData.startDate,
      dueDate: newDueDate,
      amount: calculatedData?.monthlyPayment || 0,
      paid: false,
      paymentDate: null,
      isNew: true,
    };

    console.log("➕ Adding new installment:", newInstallment);
    setInstallmentDates([...installmentDates, newInstallment]);
    setFormData((prev) => ({
      ...prev,
      months: String(installmentDates.length + 1),
    }));
  };

  // Remover cuota
  const removeInstallment = (id) => {
    const installmentToRemove = installmentDates.find((inst) => inst.id === id);

    if (installmentToRemove?.paid) {
      toast({
        variant: "destructive",
        title: "No permitido",
        description: "No se pueden eliminar cuotas que ya han sido pagadas",
      });
      return;
    }

    if (installmentDates.length > 1) {
      const newInstallments = installmentDates
        .filter((inst) => inst.id !== id)
        .map((inst, index) => ({
          ...inst,
          installmentNumber: index + 1,
        }));

      console.log("🗑️ Removing installment:", {
        id,
        newCount: newInstallments.length,
      });
      setInstallmentDates(newInstallments);
      setFormData((prev) => ({
        ...prev,
        months: String(newInstallments.length),
      }));
    }
  };

  // Recalcular todas las cuotas
  const recalculateInstallments = () => {
    const loanData = calculateLoan();
    if (!loanData) return;

    const updatedInstallments = installmentDates.map((inst) => ({
      ...inst,
      amount: Math.round(loanData.monthlyPayment),
    }));

    setInstallmentDates(updatedInstallments);
    toast({
      title: "Cuotas recalculadas",
      description: "Los montos de las cuotas han sido actualizados",
    });
  };

  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasChanges) {
      toast({
        title: "Sin cambios",
        description: "No hay cambios que guardar",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (!formData.amount || !formData.interestRate || !formData.months) {
        throw new Error("Complete todos los campos obligatorios");
      }

      // Actualizar datos principales del préstamo
      const loanUpdateData = {
        amount: parseFloat(formData.amount),
        interest_rate: parseFloat(formData.interestRate),
        months: parseInt(formData.months),
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        total_amount: calculatedData.totalAmount,
        monthly_payment: calculatedData.monthlyPayment,
        interest_amount: calculatedData.interestAmount,
      };

      console.log("💾 Updating loan with data:", loanUpdateData);
      await updateLoan(loanId, loanUpdateData);

      // Actualizar cuotas existentes
      for (const installment of installmentDates) {
        if (!installment.isNew && installment.id) {
          const installmentData = {
            dueDate: installment.dueDate,
            amount: installment.amount,
            startDate: installment.startDate,
          };

          console.log(
            `💳 Updating installment ${installment.installmentNumber}:`,
            installmentData
          );
          await updateInstallment(loanId, installment.id, installmentData);
        }
      }

      const newInstallments = installmentDates.filter((inst) => inst.isNew);
      if (newInstallments.length > 0) {
        console.log("ℹ️ New installments detected:", newInstallments.length);
        toast({
          title: "Información",
          description: "Las cuotas nuevas se crearán automáticamente",
        });
      }

      toast({
        title: "Préstamo actualizado",
        description: "Los cambios se han guardado correctamente",
      });

      router.push(`/clientes/${clientId}/prestamos/${loanId}`);
    } catch (error) {
      console.error("❌ Error saving changes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudieron guardar los cambios",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        "¿Estás seguro? Se perderán los cambios no guardados."
      );
      if (!confirmed) return;
    }
    router.push(`/clientes/${clientId}/prestamos/${loanId}`);
  };

  // Recalcular cuando cambien los datos
  useEffect(() => {
    if (formData.amount && formData.interestRate && formData.months) {
      calculateLoan();
    }
  }, [formData.amount, formData.interestRate, formData.months]);

  // Calcular totales
  const getTotalAmount = () => {
    return installmentDates.reduce((sum, inst) => sum + (inst.amount || 0), 0);
  };

  const getPaidAmount = () => {
    return installmentDates
      .filter((inst) => inst.paid)
      .reduce((sum, inst) => sum + (inst.amount || 0), 0);
  };

  // Mostrar error si hay problema de carga
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 to-gray-900 text-white">
        <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-400/30 p-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
              <h2 className="text-xl font-bold text-red-200 mb-2">
                Error al cargar el préstamo
              </h2>
              <p className="text-red-300 mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Reintentar
                </Button>
                <Button
                  onClick={() => router.push(`/clientes/${clientId}`)}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Volver al Cliente
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Mostrar loader mientras carga
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 to-gray-900 text-white">
        <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-white/70">
                Cargando información del préstamo...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 to-gray-900 text-white">
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-lg border border-white/20">
            <div className="px-6 py-4 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                      <Edit3 className="text-blue-400" />
                      Editar Préstamo
                    </h1>
                    <p className="text-white/70 text-sm mt-1">
                      Cliente: {originalLoan?.client_name || ""}
                    </p>
                  </div>
                </div>
                {hasChanges && (
                  <span className="text-sm text-amber-300 flex items-center gap-1">
                    <AlertCircle size={16} />
                    Cambios sin guardar
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Datos básicos del préstamo */}
              <div className="bg-blue-500/20 rounded-lg p-6 border border-blue-400/30">
                <h2 className="text-xl font-semibold text-blue-200 mb-4 flex items-center gap-2">
                  <DollarSign className="text-blue-400" />
                  Datos del Préstamo
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Monto Prestado *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Tasa de Interés (%) *
                    </label>
                    <input
                      type="number"
                      name="interestRate"
                      value={formData.interestRate}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Número de Cuotas *
                    </label>
                    <input
                      type="number"
                      name="months"
                      value={formData.months}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Fecha de Vencimiento
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Cuotas */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Calendar className="text-blue-400" />
                    Cuotas del Préstamo ({installmentDates.length})
                  </h2>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={recalculateInstallments}
                      className="px-3 py-1 bg-amber-500/20 text-amber-200 rounded-md text-sm flex items-center gap-1 hover:bg-amber-500/30 transition-colors"
                    >
                      <RefreshCw size={14} />
                      Recalcular Montos
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingDates(!isEditingDates)}
                      className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors ${
                        isEditingDates
                          ? "bg-red-500/20 text-red-200 hover:bg-red-500/30"
                          : "bg-blue-500/20 text-blue-200 hover:bg-blue-500/30"
                      }`}
                    >
                      {isEditingDates ? <X size={14} /> : <Edit3 size={14} />}
                      {isEditingDates ? "Finalizar" : "Editar Cuotas"}
                    </button>
                  </div>
                </div>

                {/* Lista de cuotas */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {installmentDates.map((installment) => (
                    <div
                      key={installment.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        installment.paid
                          ? "bg-green-500/20 border-green-400/30"
                          : "bg-white/5 border-white/20"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-white">
                            Cuota {installment.installmentNumber}
                          </span>
                          {installment.paid && (
                            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                              PAGADA
                            </span>
                          )}
                        </div>
                        {isEditingDates &&
                          !installment.paid &&
                          installmentDates.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeInstallment(installment.id)}
                              className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-white/70 mb-1">
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
                            disabled={!isEditingDates || installment.paid}
                            className={`w-full px-3 py-2 text-sm border rounded-md transition-colors ${
                              !isEditingDates || installment.paid
                                ? "bg-white/5 border-white/20 text-white/60"
                                : "bg-white/10 border-white/30 text-white focus:ring-2 focus:ring-blue-400"
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-white/70 mb-1">
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
                            disabled={!isEditingDates || installment.paid}
                            className={`w-full px-3 py-2 text-sm border rounded-md transition-colors ${
                              !isEditingDates || installment.paid
                                ? "bg-white/5 border-white/20 text-white/60"
                                : "bg-white/10 border-white/30 text-white focus:ring-2 focus:ring-blue-400"
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-white/70 mb-1">
                            Monto ($)
                          </label>
                          <input
                            type="number"
                            value={installment.amount}
                            onChange={(e) =>
                              updateInstallmentDate(
                                installment.id,
                                "amount",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            disabled={!isEditingDates || installment.paid}
                            className={`w-full px-3 py-2 text-sm border rounded-md transition-colors ${
                              !isEditingDates || installment.paid
                                ? "bg-white/5 border-white/20 text-white/60"
                                : "bg-white/10 border-white/30 text-white focus:ring-2 focus:ring-blue-400"
                            }`}
                          />
                        </div>
                      </div>

                      {installment.paid && installment.paymentDate && (
                        <p className="text-xs text-white/60 mt-2">
                          Pagada el{" "}
                          {new Date(
                            installment.paymentDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {isEditingDates && (
                  <button
                    type="button"
                    onClick={addInstallment}
                    className="mt-4 w-full px-3 py-2 bg-green-500/20 text-green-200 rounded-md text-sm flex items-center justify-center gap-1 hover:bg-green-500/30 transition-colors"
                  >
                    <Plus size={14} />
                    Agregar Cuota
                  </button>
                )}
              </div>

              {/* Resumen */}
              {calculatedData && (
                <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-green-200 mb-4">
                    Resumen Actualizado
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-white/70 mb-1">
                        Monto Prestado
                      </p>
                      <p className="text-2xl font-bold text-white">
                        ${calculatedData.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-white/70 mb-1">
                        Interés ({calculatedData.interestRate}%)
                      </p>
                      <p className="text-2xl font-bold text-blue-300">
                        ${calculatedData.interestAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-white/70 mb-1">
                        Total a Devolver
                      </p>
                      <p className="text-2xl font-bold text-green-300">
                        ${getTotalAmount().toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-white/70 mb-1">Ya Pagado</p>
                      <p className="text-2xl font-bold text-purple-300">
                        ${getPaidAmount().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-6 border-t border-white/20">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-white/30 text-white rounded-md hover:bg-white/10 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !hasChanges}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditLoanForm;
