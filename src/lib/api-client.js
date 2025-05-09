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
  // Obtener estadísticas generales
  const { data: clientsCount, error: clientsError } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true });

  const { data: activeLoans, error: activeLoansError } = await supabase
    .from("loans")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  const { data: completedLoans, error: completedLoansError } = await supabase
    .from("loans")
    .select("id", { count: "exact", head: true })
    .eq("status", "completed");

  const { data: loansData, error: loansError } = await supabase
    .from("loans")
    .select("amount, interest_amount");

  // Obtener estadísticas de cuotas
  const { data: paidInstallments, error: paidError } = await supabase
    .from("installments")
    .select("amount", { count: "exact" })
    .eq("paid", true);

  const { data: pendingInstallments, error: pendingError } = await supabase
    .from("installments")
    .select("id", { count: "exact", head: true })
    .eq("paid", false);

  const { data: overdueInstallments, error: overdueError } = await supabase
    .from("installments")
    .select("id", { count: "exact", head: true })
    .eq("paid", false)
    .lt("due_date", new Date().toISOString());

  if (
    clientsError ||
    activeLoansError ||
    completedLoansError ||
    loansError ||
    paidError ||
    pendingError ||
    overdueError
  ) {
    console.error("Error fetching stats data");
    throw new Error("Error al obtener estadísticas");
  }

  // Calcular totales
  const totalLent = loansData.reduce(
    (sum, loan) => sum + parseFloat(loan.amount),
    0
  );
  const totalInterest = loansData.reduce(
    (sum, loan) => sum + parseFloat(loan.interest_amount),
    0
  );
  const totalCollected = paidInstallments.reduce(
    (sum, inst) => sum + parseFloat(inst.amount),
    0
  );

  // Generar datos mensuales para los últimos 6 meses
  const monthlyData = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthName = month.toLocaleString("es-AR", { month: "short" });

    // Estas consultas serían más eficientes con una sola llamada usando SQL en la base de datos
    // pero se separan aquí para facilitar la comprensión
    const { data: monthLoans } = await supabase
      .from("loans")
      .select("amount")
      .gte("created_at", month.toISOString())
      .lte("created_at", monthEnd.toISOString());

    const { data: monthInterest } = await supabase
      .from("loans")
      .select("interest_amount")
      .gte("created_at", month.toISOString())
      .lte("created_at", monthEnd.toISOString());

    const { data: monthCollected } = await supabase
      .from("installments")
      .select("amount")
      .eq("paid", true)
      .gte("payment_date", month.toISOString())
      .lte("payment_date", monthEnd.toISOString());

    const prestado = monthLoans.reduce(
      (sum, loan) => sum + parseFloat(loan.amount),
      0
    );
    const interes = monthInterest.reduce(
      (sum, loan) => sum + parseFloat(loan.interest_amount),
      0
    );
    const cobrado = monthCollected.reduce(
      (sum, inst) => sum + parseFloat(inst.amount),
      0
    );

    monthlyData.push({
      month: monthName,
      prestado,
      cobrado,
      interes,
    });
  }

  return {
    totalClients: clientsCount.count || 0,
    activeLoans: activeLoans.count || 0,
    totalLent,
    totalCollected,
    totalInterest,
    overdueInstallments: overdueInstallments.count || 0,
    monthlyData,
    loanStatusDistribution: [
      { name: "Activos", value: activeLoans.count || 0 },
      { name: "Completados", value: completedLoans.count || 0 },
    ],
    installmentStatusDistribution: [
      { name: "Pagadas", value: paidInstallments.count || 0 },
      {
        name: "Pendientes",
        value:
          (pendingInstallments.count || 0) - (overdueInstallments.count || 0),
      },
      { name: "Vencidas", value: overdueInstallments.count || 0 },
    ],
  };
}
