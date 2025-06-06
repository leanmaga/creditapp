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

export async function fetchLoanById(clientId, loanId) {
  try {
    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select(
        `
        *,
        clients(name),
        installments(*)
      `
      )
      .eq("id", loanId)
      .eq("client_id", clientId)
      .single();

    if (loanError) {
      console.error("Error fetching loan:", loanError);
      throw new Error("Préstamo no encontrado");
    }

    return {
      ...loan,
      client_name: loan.clients?.name || "Cliente",
    };
  } catch (error) {
    console.error("Error fetching loan:", error);
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
export async function createProductRequest(requestData) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  // Calcular detalles del préstamo
  const interestAmount =
    (requestData.requestedPrice * requestData.interestRate) / 100;
  const totalAmount = requestData.requestedPrice + interestAmount;
  const monthlyPayment = totalAmount / requestData.months;

  const { data, error } = await supabase
    .from("product_purchase_requests")
    .insert({
      user_id: user.id,
      client_id: requestData.clientId,
      product_name: requestData.productName,
      product_url: requestData.productUrl || null,
      estimated_price: requestData.estimatedPrice
        ? parseFloat(requestData.estimatedPrice)
        : null,
      requested_price: parseFloat(requestData.requestedPrice),
      store: requestData.store || null,
      reason: requestData.reason || null,
      urgency: requestData.urgency || "medium",
      months: requestData.months,
      interest_rate: requestData.interestRate,
      monthly_payment: monthlyPayment,
      total_amount: totalAmount,
      client_credit_score: requestData.clientCredit || "good",
      internal_notes: requestData.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating product request:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function fetchProductRequests(status = null) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("product_purchase_requests")
    .select(
      `
      *,
      clients(id, name, phone, email)
    `
    )
    .eq("user_id", user.id)
    .order("request_date", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching product requests:", error);
    return [];
  }

  return data || [];
}

export async function updateRequestStatus(requestId, status, notes = null) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  const updateData = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "approved") {
    updateData.approved_date = new Date().toISOString().split("T")[0];
  }

  if (notes) {
    updateData.internal_notes = notes;
  }

  const { data, error } = await supabase
    .from("product_purchase_requests")
    .update(updateData)
    .eq("id", requestId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating request status:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteProductRequest(requestId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  const { error } = await supabase
    .from("product_purchase_requests")
    .delete()
    .eq("id", requestId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting product request:", error);
    throw new Error(error.message);
  }

  return true;
}

// 2. PRODUCTOS COMPRADOS

export async function createPurchasedProduct(purchaseData) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  // Usar la función RPC para aprobar solicitud y crear producto
  const { data, error } = await supabase.rpc("approve_product_request", {
    p_request_id: purchaseData.requestId,
    p_actual_price: parseFloat(purchaseData.actualPrice),
    p_purchase_date:
      purchaseData.purchaseDate || new Date().toISOString().split("T")[0],
  });

  if (error) {
    console.error("Error creating purchased product:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function fetchPurchasedProducts(clientId = null) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("purchased_products")
    .select(
      `
      *,
      clients(id, name, phone, email),
      product_purchase_requests(product_url, reason)
    `
    )
    .eq("user_id", user.id)
    .order("purchase_date", { ascending: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching purchased products:", error);
    return [];
  }

  return data || [];
}

export async function updateProductStatus(
  productId,
  status,
  deliveryDate = null
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  const updateData = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (deliveryDate) {
    updateData.delivery_date = deliveryDate;
  }

  const { data, error } = await supabase
    .from("purchased_products")
    .update(updateData)
    .eq("id", productId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating product status:", error);
    throw new Error(error.message);
  }

  return data;
}

// 3. PAGOS DE PRODUCTOS

export async function fetchProductPayments(productId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("product_payments")
    .select("*")
    .eq("purchased_product_id", productId)
    .eq("user_id", user.id)
    .order("installment_number");

  if (error) {
    console.error("Error fetching product payments:", error);
    return [];
  }

  return data || [];
}

export async function payProductInstallment(paymentId, paymentData) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  const { data, error } = await supabase
    .from("product_payments")
    .update({
      paid: true,
      payment_date:
        paymentData.paymentDate || new Date().toISOString().split("T")[0],
      payment_method: paymentData.paymentMethod || "transferencia",
      notes: paymentData.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error paying product installment:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function getOverdueProductPayments() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("product_payments")
    .select(
      `
      *,
      purchased_products(id, product_name, client_id),
      clients(name, phone)
    `
    )
    .eq("paid", false)
    .lt("due_date", today)
    .eq("user_id", user.id)
    .order("due_date");

  if (error) {
    console.error("Error fetching overdue product payments:", error);
    return [];
  }

  return data || [];
}

// 4. ESTADÍSTICAS Y REPORTES

export async function getProductPurchaseStats() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      pendingRequests: 0,
      approvedRequests: 0,
      activeProducts: 0,
      totalProfits: 0,
      directProfits: 0,
      interestProfits: 0,
      capitalInvested: 0,
      capitalRecovered: 0,
      pendingCapital: 0,
    };
  }

  try {
    // Solicitudes pendientes
    const { count: pendingRequests } = await supabase
      .from("product_purchase_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .eq("user_id", user.id);

    // Solicitudes aprobadas para comprar
    const { count: approvedRequests } = await supabase
      .from("product_purchase_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("user_id", user.id);

    // Productos activos (comprados pero no completamente pagados)
    const { count: activeProducts } = await supabase
      .from("purchased_products")
      .select("id", { count: "exact", head: true })
      .neq("status", "completed")
      .eq("user_id", user.id);

    // Ganancias realizadas (productos completados)
    const { data: completedProducts } = await supabase
      .from("purchased_products")
      .select("direct_profit, total_amount, agreed_client_price")
      .eq("status", "completed")
      .eq("user_id", user.id);

    const directProfits =
      completedProducts?.reduce(
        (sum, p) => sum + parseFloat(p.direct_profit || 0),
        0
      ) || 0;

    const interestProfits =
      completedProducts?.reduce(
        (sum, p) =>
          sum +
          (parseFloat(p.total_amount || 0) -
            parseFloat(p.agreed_client_price || 0)),
        0
      ) || 0;

    const totalProfits = directProfits + interestProfits;

    // Capital invertido actualmente
    const { data: activeProductsData } = await supabase
      .from("purchased_products")
      .select("actual_purchase_price, total_paid")
      .neq("status", "completed")
      .eq("user_id", user.id);

    const capitalInvested =
      activeProductsData?.reduce(
        (sum, p) => sum + parseFloat(p.actual_purchase_price || 0),
        0
      ) || 0;

    const capitalRecovered =
      activeProductsData?.reduce(
        (sum, p) => sum + parseFloat(p.total_paid || 0),
        0
      ) || 0;

    return {
      pendingRequests: pendingRequests || 0,
      approvedRequests: approvedRequests || 0,
      activeProducts: activeProducts || 0,
      totalProfits,
      directProfits,
      interestProfits,
      capitalInvested,
      capitalRecovered,
      pendingCapital: capitalInvested - capitalRecovered,
    };
  } catch (error) {
    console.error("Error fetching product purchase stats:", error);
    return {
      pendingRequests: 0,
      approvedRequests: 0,
      activeProducts: 0,
      totalProfits: 0,
      directProfits: 0,
      interestProfits: 0,
      capitalInvested: 0,
      capitalRecovered: 0,
      pendingCapital: 0,
    };
  }
}

export async function getProductPaymentAlerts() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { overdue: [], upcoming: [] };

  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  try {
    // Pagos vencidos
    const { data: overdue } = await supabase
      .from("product_payments")
      .select(
        `
        *,
        purchased_products(product_name),
        clients(name, phone)
      `
      )
      .eq("paid", false)
      .lt("due_date", today)
      .eq("user_id", user.id);

    // Pagos próximos (próxima semana)
    const { data: upcoming } = await supabase
      .from("product_payments")
      .select(
        `
        *,
        purchased_products(product_name),
        clients(name, phone)
      `
      )
      .eq("paid", false)
      .gte("due_date", today)
      .lte("due_date", nextWeek)
      .eq("user_id", user.id);

    return {
      overdue: overdue || [],
      upcoming: upcoming || [],
    };
  } catch (error) {
    console.error("Error fetching product payment alerts:", error);
    return { overdue: [], upcoming: [] };
  }
}

// 5. FUNCIONES DE BÚSQUEDA Y UTILIDADES

export async function searchProducts(searchTerm) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("purchased_products")
    .select(
      `
      *,
      clients(name, phone)
    `
    )
    .or(
      `product_name.ilike.%${searchTerm}%, clients.name.ilike.%${searchTerm}%`
    )
    .eq("user_id", user.id)
    .order("purchase_date", { ascending: false });

  if (error) {
    console.error("Error searching products:", error);
    return [];
  }

  return data || [];
}

export async function getClientProductHistory(clientId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("purchased_products")
    .select(
      `
      *,
      product_payments(*)
    `
    )
    .eq("client_id", clientId)
    .eq("user_id", user.id)
    .order("purchase_date", { ascending: false });

  if (error) {
    console.error("Error fetching client product history:", error);
    return [];
  }

  return data || [];
}

// 6. INTEGRACIÓN CON SISTEMA EXISTENTE

export async function fetchClientWithProducts(clientId) {
  try {
    const clientData = await fetchClientById(clientId);
    const productHistory = await getClientProductHistory(clientId);

    return {
      ...clientData,
      purchasedProducts: productHistory,
    };
  } catch (error) {
    console.error("Error fetching client with products:", error);
    throw error;
  }
}

// 7. FUNCIONES DE CONFIGURACIÓN

export async function getProductPurchaseSettings() {
  // Esta función puede expandirse para manejar configuraciones
  // guardadas en Supabase en el futuro
  return {
    defaultInterestRates: {
      6: 25,
      12: 30,
      18: 35,
      24: 40,
    },
    maxProductValue: 1000000,
    minDownPayment: 20,
    allowedStores: [
      "MercadoLibre",
      "Apple Store",
      "Samsung Store",
      "Compumundo",
      "Garbarino",
      "Frávega",
      "Otro",
    ],
    urgencyLevels: [
      { value: "low", label: "🟢 Baja", color: "text-green-600" },
      { value: "medium", label: "🟡 Media", color: "text-yellow-600" },
      { value: "high", label: "🔴 Alta", color: "text-red-600" },
    ],
    creditScores: [
      { value: "poor", label: "Malo", color: "text-red-600" },
      { value: "fair", label: "Regular", color: "text-yellow-600" },
      { value: "good", label: "Bueno", color: "text-blue-600" },
      { value: "excellent", label: "Excelente", color: "text-green-600" },
    ],
  };
}
