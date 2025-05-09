"use client";

import { supabase } from "./supabase";

// Cliente methods
export async function fetchClients() {
  const { data, error } = await supabase
    .from("client_loan_counts")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching clients:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function fetchClientById(clientId, forEdit = false) {
  try {
    // Para cualquier caso, primero obtén los datos completos del cliente desde la tabla clients
    const { data: clientDetails, error: clientDetailsError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();

    if (clientDetailsError) {
      console.error("Error fetching client details:", clientDetailsError);
      return null;
    }

    // Si es solo para edición, devuelve los datos del cliente sin préstamos
    if (forEdit) {
      return clientDetails;
    }

    // Si es para la vista de detalles, obtén también los préstamos
    const { data: loans, error: loansError } = await supabase
      .from("loans")
      .select(
        `
        *,
        installments(*)
      `
      )
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (loansError) {
      console.error("Error fetching client loans:", loansError);
      // No lanzamos error para que al menos se muestren los datos del cliente
    }

    // Devuelve los datos completos del cliente más los préstamos
    return {
      ...clientDetails,
      loans: loans || [],
      // Si estabas obteniendo otros datos de la vista client_loan_counts, podrías añadirlos aquí
    };
  } catch (error) {
    console.error("Error completo:", error);
    throw error;
  }
}

export async function createClient(clientData) {
  const { data, error } = await supabase
    .from("clients")
    .insert([
      {
        name: clientData.name,
        phone: clientData.phone || null,
        email: clientData.email || null,
        address: clientData.address || null,
        dni: clientData.dni || null,
        notes: clientData.notes || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating client:", error);
    throw new Error(error.message);
  }

  return data.id;
}

export async function updateClient(clientId, clientData) {
  console.log("Actualizando cliente:", clientId, "con datos:", clientData);

  const { data, error } = await supabase
    .from("clients")
    .update({
      name: clientData.name,
      phone: clientData.phone || null,
      email: clientData.email || null,
      address: clientData.address || null,
      dni: clientData.dni || null,
      notes: clientData.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", clientId)
    .select()
    .single();

  if (error) {
    console.error("Error updating client:", error);
    throw new Error(error.message);
  }

  console.log("Cliente actualizado con éxito:", data);
  return data;
}

export async function deleteClient(clientId) {
  // Los préstamos y cuotas se eliminarán automáticamente por la restricción ON DELETE CASCADE
  const { error } = await supabase.from("clients").delete().eq("id", clientId);

  if (error) {
    console.error("Error deleting client:", error);
    throw new Error(error.message);
  }

  return true;
}

// Loan methods
export async function createLoan(loanDetails) {
  // Usar la función del servidor para crear un préstamo con sus cuotas
  const { data, error } = await supabase.rpc("create_loan_with_installments", {
    p_client_id: loanDetails.clientId,
    p_amount: loanDetails.amount,
    p_interest_rate: loanDetails.interestRate,
    p_months: loanDetails.months,
  });

  if (error) {
    console.error("Error creating loan:", error);
    throw new Error(error.message);
  }

  return data; // Retorna el ID del préstamo creado
}

export async function fetchLoanById(clientId, loanId) {
  const { data, error } = await supabase
    .from("loans")
    .select(
      `
      *,
      installments(*),
      clients(name)
    `
    )
    .eq("id", loanId)
    .eq("client_id", clientId)
    .single();

  if (error) {
    console.error("Error fetching loan:", error);
    return null;
  }

  // Formatear la respuesta para mantener compatibilidad con el mock
  return {
    ...data,
    client_name: data.clients?.name || "Cliente",
    installments: data.installments || [],
  };
}

export async function deleteLoan(clientId, loanId) {
  // Las cuotas se eliminarán automáticamente por la restricción ON DELETE CASCADE
  const { error } = await supabase
    .from("loans")
    .delete()
    .eq("id", loanId)
    .eq("client_id", clientId);

  if (error) {
    console.error("Error deleting loan:", error);
    throw new Error(error.message);
  }

  return true;
}

export async function payInstallment(
  clientId,
  loanId,
  installmentId,
  paymentDetails
) {
  // Primero verificamos que el préstamo pertenezca al cliente
  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("id")
    .eq("id", loanId)
    .eq("client_id", clientId)
    .single();

  if (loanError || !loan) {
    console.error("Error fetching loan:", loanError);
    throw new Error("Préstamo no encontrado");
  }

  // Actualizamos la cuota como pagada
  const { error } = await supabase
    .from("installments")
    .update({
      paid: true,
      payment_date: paymentDetails.payment_date || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", installmentId)
    .eq("loan_id", loanId);

  if (error) {
    console.error("Error paying installment:", error);
    throw new Error(error.message);
  }

  // El trigger en la base de datos actualizará automáticamente el estado del préstamo si todas las cuotas están pagadas

  return true;
}

// Dashboard stats
export async function fetchDashboardStats() {
  try {
    // Obtener número total de clientes
    const {
      data: clientsData,
      count: clientsCount,
      error: clientsError,
    } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true });

    // Obtener préstamos activos
    const {
      data: activeLoansData,
      count: activeLoansCount,
      error: loansError,
    } = await supabase
      .from("loans")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    // Obtener monto total prestado
    const { data: totalLentData, error: totalLentError } = await supabase
      .from("loans")
      .select("amount");

    // Obtener cuotas vencidas
    const {
      data: overdueData,
      count: overdueCount,
      error: overdueError,
    } = await supabase
      .from("installments")
      .select("id", { count: "exact", head: true })
      .eq("paid", false)
      .lt("due_date", new Date().toISOString());

    if (clientsError || loansError || totalLentError || overdueError) {
      console.error("Error fetching dashboard stats");
      throw new Error("Error al obtener estadísticas");
    }

    const totalLent = (totalLentData || []).reduce(
      (sum, loan) => sum + parseFloat(loan.amount || 0),
      0
    );

    return {
      totalClients: clientsCount || 0,
      activeLoans: activeLoansCount || 0,
      totalLent,
      overdueInstallments: overdueCount || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}

export async function fetchRecentLoans() {
  const { data, error } = await supabase
    .from("loans")
    .select(
      `
      *,
      clients(name)
    `
    )
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching recent loans:", error);
    throw new Error(error.message);
  }

  // Formatear la respuesta para mantener compatibilidad con el mock
  return data.map((loan) => ({
    ...loan,
    client_name: loan.clients?.name || "Cliente",
  }));
}

export async function fetchUpcomingPayments() {
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const { data, error } = await supabase
    .from("installments")
    .select(
      `
      *,
      loans(id, months, client_id, clients(name))
    `
    )
    .eq("paid", false)
    .lte("due_date", nextMonth.toISOString())
    .order("due_date")
    .limit(5);

  if (error) {
    console.error("Error fetching upcoming payments:", error);
    throw new Error(error.message);
  }

  // Formatear la respuesta para mantener compatibilidad con el mock
  return data.map((installment) => ({
    ...installment,
    client_name: installment.loans?.clients?.name || "Cliente",
    client_id: installment.loans?.client_id,
    loan_id: installment.loans?.id,
    total_installments: installment.loans?.months || 0,
  }));
}

export async function fetchStatsData() {
  try {
    // 1. Consultas más seguras con manejo de errores mejorado

    // Obtener estadísticas de clientes
    const { data: clientsData, error: clientsError } = await supabase
      .from("clients")
      .select("*", { count: "exact" });

    const clientsCount = clientsError ? 0 : clientsData?.length || 0;

    // Obtener préstamos activos
    const { data: activeLoansData, error: activeLoansError } = await supabase
      .from("loans")
      .select("*")
      .eq("status", "active");

    const activeLoansCount = activeLoansError
      ? 0
      : activeLoansData?.length || 0;

    // Obtener préstamos completados
    const { data: completedLoansData, error: completedLoansError } =
      await supabase.from("loans").select("*").eq("status", "completed");

    const completedLoansCount = completedLoansError
      ? 0
      : completedLoansData?.length || 0;

    // Obtener todos los préstamos para cálculos
    const { data, error: loansError } = await supabase
      .from("loans")
      .select("amount, interest_amount, created_at");

    // Usar una nueva variable en lugar de reasignar
    const loansData = loansError ? [] : data || [];

    // Obtener estadísticas de cuotas
    const { data: instData, error: installmentsError } = await supabase
      .from("installments")
      .select("*");

    // Usar una nueva variable en lugar de reasignar
    const installmentsData = installmentsError ? [] : instData || [];

    // 2. Cálculo seguro de totales

    // Filtramos las cuotas según su estado
    const paidInstallments = installmentsData.filter((inst) => inst.paid) || [];
    const pendingInstallments =
      installmentsData.filter((inst) => !inst.paid) || [];
    const overdueInstallments =
      pendingInstallments.filter(
        (inst) => new Date(inst.due_date) < new Date()
      ) || [];

    // Calculamos totales de manera segura
    const totalLent = loansData.reduce(
      (sum, loan) => sum + parseFloat(loan.amount || 0),
      0
    );

    const totalInterest = loansData.reduce(
      (sum, loan) => sum + parseFloat(loan.interest_amount || 0),
      0
    );

    const totalCollected = paidInstallments.reduce(
      (sum, inst) => sum + parseFloat(inst.amount || 0),
      0
    );

    // 3. Simplificamos los datos mensuales para evitar múltiples consultas

    // Obtenemos los últimos 6 meses
    const now = new Date();
    const monthlyData = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toLocaleString("es-AR", { month: "short" });

      // Filtrar préstamos y cuotas de este mes
      const monthLoans = loansData.filter((loan) => {
        const loanDate = new Date(loan.created_at);
        return loanDate >= monthStart && loanDate <= monthEnd;
      });

      const monthPaidInstallments = paidInstallments.filter((inst) => {
        const paymentDate = new Date(inst.payment_date);
        return paymentDate >= monthStart && paymentDate <= monthEnd;
      });

      // Calcular valores mensuales
      const prestado = monthLoans.reduce(
        (sum, loan) => sum + parseFloat(loan.amount || 0),
        0
      );

      const interes = monthLoans.reduce(
        (sum, loan) => sum + parseFloat(loan.interest_amount || 0),
        0
      );

      const cobrado = monthPaidInstallments.reduce(
        (sum, inst) => sum + parseFloat(inst.amount || 0),
        0
      );

      monthlyData.push({
        month: monthName,
        prestado,
        cobrado,
        interes,
      });
    }

    // 4. Retorno de datos estructurados
    return {
      totalClients: clientsCount,
      activeLoans: activeLoansCount,
      totalLent,
      totalCollected,
      totalInterest,
      overdueInstallments: overdueInstallments.length,
      monthlyData,
      loanStatusDistribution: [
        { name: "Activos", value: activeLoansCount },
        { name: "Completados", value: completedLoansCount },
      ],
      installmentStatusDistribution: [
        { name: "Pagadas", value: paidInstallments.length },
        {
          name: "Pendientes",
          value: pendingInstallments.length - overdueInstallments.length,
        },
        { name: "Vencidas", value: overdueInstallments.length },
      ],
    };
  } catch (error) {
    console.error("Error completo en fetchStatsData:", error);
    // En lugar de lanzar error, devolvemos datos vacíos o mínimos
    // para que la interfaz pueda seguir funcionando
    return {
      totalClients: 0,
      activeLoans: 0,
      totalLent: 0,
      totalCollected: 0,
      totalInterest: 0,
      overdueInstallments: 0,
      monthlyData: [],
      loanStatusDistribution: [
        { name: "Activos", value: 0 },
        { name: "Completados", value: 0 },
      ],
      installmentStatusDistribution: [
        { name: "Pagadas", value: 0 },
        { name: "Pendientes", value: 0 },
        { name: "Vencidas", value: 0 },
      ],
    };
  }
}
