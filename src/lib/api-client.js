"use client";

import { supabase } from "./supabase";

export async function fetchClients() {
  try {
    // Se obtiene el usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Si no hay usuario, devolver array vacío
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("client_loan_counts")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) {
      console.error("Error fetching clients:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

export async function createClient(clientData) {
  // Se obtiene el usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
        user_id: user.id, // Añadir ID del usuario
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

export async function fetchClientById(clientId, forEdit = false) {
  try {
    // Para cualquier caso, primero obtén los datos completos del cliente
    const { data: clientDetails, error: clientDetailsError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();

    if (clientDetailsError) {
      console.error("Error fetching client details:", clientDetailsError);
      return null;
    }

    // RLS asegurará que solo se obtengan préstamos del usuario actual
    // No necesitas filtrar explícitamente por user_id en estas consultas
    if (forEdit) {
      return clientDetails;
    }

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
    }

    return {
      ...clientDetails,
      loans: loans || [],
    };
  } catch (error) {
    console.error("Error completo:", error);
    throw error;
  }
}

export async function updateClient(clientId, clientData) {
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

export async function createLoan(loanDetails) {
  // Obtener usuario actual antes de llamar a la función RPC
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Llamar a la función RPC (ya no necesitas pasar user_id explícitamente,
  // porque ahora la función RPC usa auth.uid() internamente)
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

export async function fetchDashboardStats() {
  try {
    // Obtener el usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Si no hay usuario autenticado, devolver datos predeterminados
    if (!user) {
      return {
        totalClients: 0,
        activeLoans: 0,
        totalLent: 0,
        overdueInstallments: 0,
      };
    }

    // Obtener número total de clientes
    const {
      data: clientsData,
      count: clientsCount,
      error: clientsError,
    } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Obtener préstamos activos
    const {
      data: activeLoansData,
      count: activeLoansCount,
      error: loansError,
    } = await supabase
      .from("loans")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .eq("user_id", user.id);

    // Obtener monto total prestado
    const { data: totalLentData, error: totalLentError } = await supabase
      .from("loans")
      .select("amount")
      .eq("user_id", user.id);

    // Para las cuotas vencidas, primero obtener los IDs de los préstamos
    const { data: loanIds, error: loanIdsError } = await supabase
      .from("loans")
      .select("id")
      .eq("user_id", user.id);

    // Si hay préstamos, usarlos para filtrar cuotas vencidas
    let overdueCount = 0;
    if (loanIds && loanIds.length > 0) {
      const loanIdValues = loanIds.map((loan) => loan.id);

      const { count, error: overdueError } = await supabase
        .from("installments")
        .select("id", { count: "exact", head: true })
        .eq("paid", false)
        .lt("due_date", new Date().toISOString())
        .in("loan_id", loanIdValues);

      overdueCount = count || 0;
    }

    const totalLent = (totalLentData || []).reduce(
      (sum, loan) => sum + parseFloat(loan.amount || 0),
      0
    );

    return {
      totalClients: clientsCount || 0,
      activeLoans: activeLoansCount || 0,
      totalLent,
      overdueInstallments: overdueCount,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // En caso de error, devolver objeto con valores predeterminados
    return {
      totalClients: 0,
      activeLoans: 0,
      totalLent: 0,
      overdueInstallments: 0,
    };
  }
}

export async function fetchRecentLoans() {
  try {
    // Obtener el usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Si no hay usuario, devolver array vacío
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("loans")
      .select(
        `
        *,
        clients(name)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching recent loans:", error);
      return [];
    }

    // Formatear la respuesta, asegurándose que data no sea null
    return (data || []).map((loan) => ({
      ...loan,
      client_name: loan.clients?.name || "Cliente",
    }));
  } catch (error) {
    console.error("Error fetching recent loans:", error);
    return [];
  }
}

export async function fetchUpcomingPayments() {
  try {
    // Obtener el usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Si no hay usuario, devolver array vacío
    if (!user) {
      return [];
    }

    // Primero, obtener los IDs de los préstamos que pertenecen al usuario
    const { data: userLoans, error: loansError } = await supabase
      .from("loans")
      .select("id")
      .eq("user_id", user.id);

    if (loansError || !userLoans || userLoans.length === 0) {
      return [];
    }

    // Extraer los IDs de los préstamos
    const loanIds = userLoans.map((loan) => loan.id);

    // Ahora, usar estos IDs para obtener las cuotas
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const { data, error } = await supabase
      .from("installments")
      .select(
        `
        *,
        loans(id, months, client_id, user_id, clients(name))
      `
      )
      .eq("paid", false)
      .lte("due_date", nextMonth.toISOString())
      .in("loan_id", loanIds) // Usar IN con el array de IDs
      .order("due_date")
      .limit(5);

    if (error) {
      console.error("Error fetching upcoming payments:", error);
      return [];
    }

    // Formatear la respuesta, asegurándose que data no sea null
    return (data || []).map((installment) => ({
      ...installment,
      client_name: installment.loans?.clients?.name || "Cliente",
      client_id: installment.loans?.client_id,
      loan_id: installment.loans?.id,
      total_installments: installment.loans?.months || 0,
    }));
  } catch (error) {
    console.error("Error fetching upcoming payments:", error);
    return [];
  }
}

export async function fetchStatsData() {
  try {
    // Obtener el usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Obtener estadísticas de clientes
    const { data: clientsData, error: clientsError } = await supabase
      .from("clients")
      .select("*", { count: "exact" })
      .eq("user_id", user.id); // Filtrar por usuario

    const clientsCount = clientsError ? 0 : clientsData?.length || 0;

    // Obtener préstamos activos
    const { data: activeLoansData, error: activeLoansError } = await supabase
      .from("loans")
      .select("*")
      .eq("status", "active")
      .eq("user_id", user.id); // Filtrar por usuario

    const activeLoansCount = activeLoansError
      ? 0
      : activeLoansData?.length || 0;

    // Obtener préstamos completados
    const { data: completedLoansData, error: completedLoansError } =
      await supabase
        .from("loans")
        .select("*")
        .eq("status", "completed")
        .eq("user_id", user.id); // Filtrar por usuario

    const completedLoansCount = completedLoansError
      ? 0
      : completedLoansData?.length || 0;

    // Obtener todos los préstamos para cálculos
    const { data, error: loansError } = await supabase
      .from("loans")
      .select("amount, interest_amount, created_at")
      .eq("user_id", user.id); // Filtrar por usuario

    // Usar una nueva variable en lugar de reasignar
    const loansData = loansError ? [] : data || [];

    // Obtener estadísticas de cuotas (necesitamos filtrar por usuario)
    const { data: instData, error: installmentsError } = await supabase
      .from("installments")
      .select("*, loans!inner(user_id)")
      .eq("loans.user_id", user.id); // Usamos una relación inner para filtrar por usuario

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

    // 3. Datos mensuales

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
    // En lugar de lanzar error, devolvemos datos vacíos
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
