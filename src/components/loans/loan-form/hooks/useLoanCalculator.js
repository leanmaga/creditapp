import { useState, useEffect, useCallback } from "react";

export const useLoanCalculator = (initialStartDate = new Date().toISOString().split("T")[0]) => {
  // Estados del formulario básico
  const [formData, setFormData] = useState({
    amount: "",
    cantidad: "",
    interestRate: "",
    tipoTiempo: "meses",
    useCustomDates: true,
    startDate: initialStartDate,
    endDate: "",
  });

  // Estados del sistema avanzado de fechas
  const [dateMode, setDateMode] = useState("auto");
  const [installmentDates, setInstallmentDates] = useState([]);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [calculatedData, setCalculatedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // FUNCIONES HELPER DE FECHAS
  // ==========================================

  // Función helper para crear fecha segura
  const createSafeDate = useCallback((dateValue) => {
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
  }, []);

  // Función helper para formatear fecha a ISO de forma segura
  const toISODateString = useCallback((date) => {
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
  }, [createSafeDate]);

  // ==========================================
  // FUNCIONES DE CÁLCULO DE FECHAS
  // ==========================================

  // Función para calcular fechas automáticas según el tipo de tiempo
  const calculateAutomaticDates = useCallback((startDate, numInstallments, tipoTiempo) => {
    if (!startDate || !numInstallments || numInstallments <= 0) {
      return [];
    }

    try {
      const start = createSafeDate(startDate);
      if (!start) {
        return [];
      }

      const dates = [];

      for (let i = 0; i < numInstallments; i++) {
        const installmentDate = new Date(start);

        switch (tipoTiempo) {
          case "dias":
            // Cada cuota es un día después (empezando desde el día siguiente)
            installmentDate.setDate(start.getDate() + (i + 1));
            break;
          case "semanas":
            // Cada cuota es una semana después
            installmentDate.setDate(start.getDate() + ((i + 1) * 7));
            break;
          case "meses":
          default:
            // Cada cuota es un mes después
            installmentDate.setMonth(start.getMonth() + (i + 1));
            break;
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
  }, [createSafeDate, toISODateString]);

  // Calcular fecha de vencimiento por defecto según tipo de tiempo
  const calculateDefaultDueDate = useCallback((startDate, periodsToAdd, tipoTiempo = "meses") => {
    try {
      const baseDate = startDate ? createSafeDate(startDate) : new Date();
      if (!baseDate) {
        const today = new Date();
        today.setMonth(today.getMonth() + periodsToAdd);
        return toISODateString(today);
      }

      const resultDate = new Date(baseDate);

      switch (tipoTiempo) {
        case "dias":
          resultDate.setDate(resultDate.getDate() + periodsToAdd);
          break;
        case "semanas":
          resultDate.setDate(resultDate.getDate() + (periodsToAdd * 7));
          break;
        case "meses":
        default:
          resultDate.setMonth(resultDate.getMonth() + periodsToAdd);
          break;
      }

      return toISODateString(resultDate) || toISODateString(new Date());
    } catch (error) {
      const fallbackDate = new Date();
      fallbackDate.setMonth(fallbackDate.getMonth() + periodsToAdd);
      return toISODateString(fallbackDate);
    }
  }, [createSafeDate, toISODateString]);

  // Calcular fecha de fin basada en cantidad y tipo de tiempo
  const calculateEndDate = useCallback((startDate, cantidad, tipoTiempo) => {
    if (!startDate || !cantidad || isNaN(parseInt(cantidad))) {
      return "";
    }

    try {
      const start = createSafeDate(startDate);
      if (!start) return "";

      const endDate = new Date(start);
      const cantidadNum = parseInt(cantidad);

      switch (tipoTiempo) {
        case "dias":
          endDate.setDate(start.getDate() + cantidadNum);
          break;
        case "semanas":
          endDate.setDate(start.getDate() + (cantidadNum * 7));
          break;
        case "meses":
        default:
          endDate.setMonth(start.getMonth() + cantidadNum);
          break;
      }

      return toISODateString(endDate);
    } catch (error) {
      return "";
    }
  }, [createSafeDate, toISODateString]);

  // ==========================================
  // FUNCIONES DE GENERACIÓN DE CUOTAS
  // ==========================================

  // Generar cuotas detalladas editables
  const generateDetailedInstallments = useCallback((loanData, tipoTiempo = "meses") => {
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
        calculateDefaultDueDate(safeStartDate, i + 1, tipoTiempo);

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
  }, [calculateDefaultDueDate]);

  // ==========================================
  // FUNCIÓN PRINCIPAL DE CÁLCULO
  // ==========================================

  const calculateLoan = useCallback((data) => {
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

    // Calcular fechas automáticas basadas en el tipo de tiempo
    if (data.startDate) {
      installmentDatesArray = calculateAutomaticDates(
        data.startDate,
        installments,
        data.tipoTiempo
      );
    }

    // Calcular fecha de fin automática basada en la última cuota
    const calculatedEndDate = installmentDatesArray.length > 0
      ? installmentDatesArray[installmentDatesArray.length - 1]
      : data.endDate || "";

    const result = {
      amount: amount,
      interestRate: interestRate,
      interestAmount: interestAmount,
      totalAmount: totalAmount,
      monthlyPayment: monthlyPayment,
      installmentDates: installmentDatesArray,
      months: installments,
      startDate: data.startDate || "",
      endDate: calculatedEndDate,
    };

    setCalculatedData(result);

    // Actualizar el endDate en el formData también
    if (calculatedEndDate && calculatedEndDate !== data.endDate) {
      setFormData((prev) => ({
        ...prev,
        endDate: calculatedEndDate,
      }));
    }

    if (result.startDate || installmentDatesArray.length > 0) {
      generateDetailedInstallments(result, data.tipoTiempo);
    }

    return result;
  }, [calculateAutomaticDates, generateDetailedInstallments]);

  // ==========================================
  // HANDLERS DE ACTUALIZACIÓN
  // ==========================================

  // Actualizar fecha de cuota individual
  const updateInstallmentDate = useCallback((id, field, value) => {
    setInstallmentDates((prev) =>
      prev.map((installment) =>
        installment.id === id ? { ...installment, [field]: value } : installment
      )
    );
  }, []);

  // Agregar nueva cuota
  const addInstallment = useCallback(() => {
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
        switch (formData.tipoTiempo) {
          case "dias":
            today.setDate(today.getDate() + 1);
            break;
          case "semanas":
            today.setDate(today.getDate() + 7);
            break;
          case "meses":
          default:
            today.setMonth(today.getMonth() + 1);
            break;
        }
        newDueDate = toISODateString(today);
      } else {
        const resultDate = new Date(newDate);
        switch (formData.tipoTiempo) {
          case "dias":
            resultDate.setDate(resultDate.getDate() + 1);
            break;
          case "semanas":
            resultDate.setDate(resultDate.getDate() + 7);
            break;
          case "meses":
          default:
            resultDate.setMonth(resultDate.getMonth() + 1);
            break;
        }
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
  }, [installmentDates, formData, calculatedData, createSafeDate, toISODateString]);

  // Remover cuota
  const removeInstallment = useCallback((id) => {
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
  }, [installmentDates]);

  // Manejar cambios en inputs del formulario
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  // Handler para cuando cambie el tipo de tiempo
  const handleTipoTiempoChange = useCallback((e) => {
    const tipoTiempo = e.target.value;
    setFormData((prev) => {
      const newData = { ...prev, tipoTiempo };

      // Recalcular endDate cuando cambie el tipo de tiempo
      const newEndDate = calculateEndDate(prev.startDate, prev.cantidad, tipoTiempo);
      if (newEndDate) {
        newData.endDate = newEndDate;
      }

      return newData;
    });
  }, [calculateEndDate]);

  // Establecer fecha de fin automática cuando se cambia la cantidad
  const handleCantidadChange = useCallback((e) => {
    const cantidad = e.target.value;
    setFormData((prev) => {
      const newData = { ...prev, cantidad };

      // Calcular fecha de fin automática según tipo de tiempo
      const newEndDate = calculateEndDate(prev.startDate, cantidad, prev.tipoTiempo);
      if (newEndDate) {
        newData.endDate = newEndDate;
      }

      return newData;
    });
  }, [calculateEndDate]);

  // ==========================================
  // EFECTOS
  // ==========================================

  // Recalcular cuando cambien los datos del formulario
  useEffect(() => {
    if (formData.amount && formData.cantidad && formData.interestRate) {
      if (formData.startDate) {
        calculateLoan(formData);
      }
    }
  }, [
    formData.amount,
    formData.cantidad,
    formData.interestRate,
    formData.startDate,
    formData.endDate,
    formData.tipoTiempo,
    calculateLoan,
  ]);

  // ==========================================
  // HELPERS
  // ==========================================

  // Calcular totales de las cuotas editables
  const getTotalAmount = useCallback(() => {
    return installmentDates.reduce((sum, inst) => sum + (inst.amount || 0), 0);
  }, [installmentDates]);

  // Helper para obtener el label del tipo de tiempo
  const getTipoTiempoLabel = useCallback(() => {
    switch (formData.tipoTiempo) {
      case "dias":
        return "días";
      case "semanas":
        return "semanas";
      case "meses":
      default:
        return "meses";
    }
  }, [formData.tipoTiempo]);

  return {
    // Estados
    formData,
    setFormData,
    dateMode,
    setDateMode,
    installmentDates,
    setInstallmentDates,
    isEditingDates,
    setIsEditingDates,
    calculatedData,
    setCalculatedData,
    isSubmitting,
    setIsSubmitting,

    // Handlers
    handleInputChange,
    handleTipoTiempoChange,
    handleCantidadChange,
    updateInstallmentDate,
    addInstallment,
    removeInstallment,

    // Helpers
    getTotalAmount,
    getTipoTiempoLabel,
    createSafeDate,
    toISODateString,
    calculateLoan,
  };
};

export default useLoanCalculator;
