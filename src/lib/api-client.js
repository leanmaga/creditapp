"use client";

import { supabase } from "./supabase";

// Helper function to get current user
async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Usuario no autenticado");
  }
  return user;
}

// Helper function for safe user check (returns null instead of throwing)
async function getCurrentUserSafe() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// ==========================================
// CLIENT MANAGEMENT
// ==========================================

export async function fetchClients() {
  try {
    const user = await getCurrentUserSafe();
    if (!user) return [];

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
  const user = await getCurrentUser();

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
        user_id: user.id,
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
    const { data: clientDetails, error: clientDetailsError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();

    if (clientDetailsError) {
      console.error("Error fetching client details:", clientDetailsError);
      return null;
    }

    if (forEdit) {
      return clientDetails;
    }

    const { data: loans, error: loansError } = await supabase
      .from("loans")
      .select("*, installments(*)")
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
    console.error("Error fetching client:", error);
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
  const { error } = await supabase.from("clients").delete().eq("id", clientId);

  if (error) {
    console.error("Error deleting client:", error);
    throw new Error(error.message);
  }

  return true;
}

// ==========================================
// LOAN MANAGEMENT - SIMPLIFIED
// ==========================================

export async function fetchLoanById(clientId, loanId) {
  try {
    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("*, clients(name), installments(*)")
      .eq("id", loanId)
      .eq("client_id", clientId)
      .single();

    if (loanError) {
      throw new Error("Préstamo no encontrado");
    }

    // Ordenar las cuotas por número de cuota
    if (loan.installments && Array.isArray(loan.installments)) {
      loan.installments.sort(
        (a, b) => a.installment_number - b.installment_number
      );
    }

    return {
      ...loan,
      client_name: loan.clients?.name || "Cliente",
    };
  } catch (error) {
    throw error;
  }
}

export async function createLoan(loanDetails) {
  const user = await getCurrentUser();

  console.log("📥 createLoan recibió:", loanDetails);

  // Validar datos básicos
  if (
    !loanDetails.clientId ||
    !loanDetails.amount ||
    !loanDetails.interestRate ||
    !loanDetails.months
  ) {
    throw new Error("Faltan datos obligatorios del préstamo");
  }

  // Preparar parámetros para el RPC
  const rpcParams = {
    p_client_id: loanDetails.clientId,
    p_amount: parseFloat(loanDetails.amount),
    p_interest_rate: parseFloat(loanDetails.interestRate),
    p_months: parseInt(loanDetails.months),
  };

  // Agregar fechas si están disponibles
  if (loanDetails.startDate) {
    rpcParams.p_start_date = loanDetails.startDate;
  }

  if (loanDetails.endDate) {
    rpcParams.p_end_date = loanDetails.endDate;
  }

  // Indicar que se usan fechas personalizadas
  if (loanDetails.startDate && loanDetails.endDate) {
    rpcParams.p_custom_dates = true;
  }

  // ✅ NUEVO: Enviar fechas detalladas de cuotas si están disponibles
  if (
    loanDetails.installmentDates &&
    Array.isArray(loanDetails.installmentDates) &&
    loanDetails.installmentDates.length > 0
  ) {
    // Convertir array de fechas a formato que entienda PostgreSQL
    rpcParams.p_installment_dates = loanDetails.installmentDates;
    console.log("✅ Enviando fechas de cuotas:", loanDetails.installmentDates);
  }

  // ✅ NUEVO: Enviar montos calculados si están disponibles
  if (loanDetails.totalAmount) {
    rpcParams.p_total_amount = parseFloat(loanDetails.totalAmount);
  }

  if (loanDetails.monthlyPayment) {
    rpcParams.p_monthly_payment = parseFloat(loanDetails.monthlyPayment);
  }

  if (loanDetails.interestAmount) {
    rpcParams.p_interest_amount = parseFloat(loanDetails.interestAmount);
  }

  console.log("📤 Enviando a RPC create_loan_with_installments:", rpcParams);

  try {
    const { data, error } = await supabase.rpc(
      "create_loan_with_installments",
      rpcParams
    );

    if (error) {
      console.error("❌ Error en RPC:", error);
      throw new Error(`Error del servidor: ${error.message}`);
    }

    console.log("✅ Préstamo creado exitosamente:", data);

    // ✅ NUEVO: Si tenemos cuotas personalizadas, actualizarlas después de la creación
    if (
      loanDetails.customInstallments &&
      Array.isArray(loanDetails.customInstallments) &&
      data
    ) {
      try {
        await updateCustomInstallments(data, loanDetails.customInstallments);
        console.log("✅ Cuotas personalizadas actualizadas");
      } catch (updateError) {
        console.warn(
          "⚠️ Error actualizando cuotas personalizadas:",
          updateError
        );
        // No falla todo el préstamo si no se pueden actualizar las cuotas personalizadas
      }
    }

    return data;
  } catch (error) {
    console.error("❌ Error creando préstamo:", error);
    throw error;
  }
}

export async function updateLoan(loanId, loanData) {
  const user = await getCurrentUser();

  try {
    const { data: existingLoan, error: checkError } = await supabase
      .from("loans")
      .select("id, user_id")
      .eq("id", loanId)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingLoan) {
      throw new Error("Préstamo no encontrado o sin permisos");
    }

    const updateData = {
      amount: loanData.amount,
      interest_rate: loanData.interest_rate,
      months: loanData.months,
      interest_amount: loanData.interest_amount,
      total_amount: loanData.total_amount,
      monthly_payment: loanData.monthly_payment,
      updated_at: new Date().toISOString(),
    };

    if (loanData.start_date) {
      updateData.start_date = loanData.start_date;
    }

    if (loanData.end_date) {
      updateData.end_date = loanData.end_date;
    }

    const { data, error } = await supabase
      .from("loans")
      .update(updateData)
      .eq("id", loanId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

async function updateCustomInstallments(loanId, customInstallments) {
  if (!customInstallments || customInstallments.length === 0) {
    return;
  }

  try {
    const { data: existingInstallments, error: fetchError } = await supabase
      .from("installments")
      .select("id, installment_number")
      .eq("loan_id", loanId)
      .order("installment_number");

    if (fetchError) {
      throw new Error(`Error obteniendo cuotas: ${fetchError.message}`);
    }

    if (!existingInstallments || existingInstallments.length === 0) {
      throw new Error("No se encontraron cuotas para actualizar");
    }

    const updatePromises = customInstallments.map(
      async (customInstallment, index) => {
        const existingInstallment = existingInstallments[index];

        if (!existingInstallment) {
          return;
        }

        // ✅ CORREGIDO: SÍ actualizar start_date ya que la tabla SÍ lo tiene
        const updateData = {
          due_date: customInstallment.dueDate,
          amount: parseFloat(customInstallment.amount || 0),
          start_date: customInstallment.startDate || null, // ← AGREGADO
          updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from("installments")
          .update(updateData)
          .eq("id", existingInstallment.id);

        if (updateError) {
          throw new Error(
            `Error actualizando cuota ${customInstallment.installmentNumber}: ${updateError.message}`
          );
        }
      }
    );

    await Promise.all(updatePromises);
  } catch (error) {
    // No lanzar el error para que el préstamo se cree aunque falle la actualización
  }
}

export async function updateInstallment(
  loanId,
  installmentId,
  installmentData
) {
  const user = await getCurrentUser();

  try {
    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("id")
      .eq("id", loanId)
      .eq("user_id", user.id)
      .single();

    if (loanError || !loan) {
      throw new Error("Préstamo no encontrado o sin permisos");
    }

    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (installmentData.dueDate) {
      updateData.due_date = installmentData.dueDate;
    }

    if (installmentData.amount !== undefined) {
      updateData.amount = parseFloat(installmentData.amount);
    }

    // ✅ AGREGADO: Actualizar start_date si se proporciona
    if (installmentData.startDate) {
      updateData.start_date = installmentData.startDate;
    }

    if (installmentData.paid !== undefined) {
      updateData.paid = installmentData.paid;
    }

    if (installmentData.paymentDate) {
      updateData.payment_date = installmentData.paymentDate;
    }

    const { data, error } = await supabase
      .from("installments")
      .update(updateData)
      .eq("id", installmentId)
      .eq("loan_id", loanId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// ✅ NUEVA función: Obtener cronograma detallado de un préstamo
export async function fetchLoanSchedule(loanId) {
  const user = await getCurrentUserSafe();
  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from("installments")
      .select(
        `
        *,
        loans!inner(
          id,
          amount,
          interest_rate,
          total_amount,
          status,
          user_id,
          clients(id, name)
        )
      `
      )
      .eq("loan_id", loanId)
      .eq("loans.user_id", user.id)
      .order("installment_number");

    if (error) {
      console.error("Error fetching loan schedule:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error in fetchLoanSchedule:", error);
    throw error;
  }
}

export async function deleteLoan(clientId, loanId) {
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

  return true;
}

// ==========================================
// DASHBOARD & STATISTICS
// ==========================================

export async function fetchDashboardStats() {
  try {
    const user = await getCurrentUserSafe();
    if (!user) {
      return {
        totalClients: 0,
        activeLoans: 0,
        totalLent: 0,
        overdueInstallments: 0,
      };
    }

    const { count: clientsCount } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { count: activeLoansCount } = await supabase
      .from("loans")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .eq("user_id", user.id);

    const { data: totalLentData } = await supabase
      .from("loans")
      .select("amount")
      .eq("user_id", user.id);

    const { data: loanIds } = await supabase
      .from("loans")
      .select("id")
      .eq("user_id", user.id);

    let overdueCount = 0;
    if (loanIds && loanIds.length > 0) {
      const loanIdValues = loanIds.map((loan) => loan.id);
      const { count } = await supabase
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
    const user = await getCurrentUserSafe();
    if (!user) return [];

    const { data, error } = await supabase
      .from("loans")
      .select("*, clients(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching recent loans:", error);
      return [];
    }

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
    const user = await getCurrentUserSafe();
    if (!user) return [];

    const { data: userLoans } = await supabase
      .from("loans")
      .select("id")
      .eq("user_id", user.id);

    if (!userLoans || userLoans.length === 0) return [];

    const loanIds = userLoans.map((loan) => loan.id);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const { data, error } = await supabase
      .from("installments")
      .select("*, loans(id, months, client_id, user_id, clients(name))")
      .eq("paid", false)
      .lte("due_date", nextMonth.toISOString())
      .in("loan_id", loanIds)
      .order("due_date")
      .limit(5);

    if (error) {
      console.error("Error fetching upcoming payments:", error);
      return [];
    }

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
    const user = await getCurrentUser();

    const { data: clientsData } = await supabase
      .from("clients")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);

    const clientsCount = clientsData?.length || 0;

    const { data: activeLoansData } = await supabase
      .from("loans")
      .select("*")
      .eq("status", "active")
      .eq("user_id", user.id);

    const activeLoansCount = activeLoansData?.length || 0;

    const { data: completedLoansData } = await supabase
      .from("loans")
      .select("*")
      .eq("status", "completed")
      .eq("user_id", user.id);

    const completedLoansCount = completedLoansData?.length || 0;

    const { data: loansData } = await supabase
      .from("loans")
      .select("amount, interest_amount, created_at")
      .eq("user_id", user.id);

    const { data: installmentsData } = await supabase
      .from("installments")
      .select("*, loans!inner(user_id)")
      .eq("loans.user_id", user.id);

    const safeLoansData = loansData || [];
    const safeInstallmentsData = installmentsData || [];

    const paidInstallments = safeInstallmentsData.filter((inst) => inst.paid);
    const pendingInstallments = safeInstallmentsData.filter(
      (inst) => !inst.paid
    );
    const overdueInstallments = pendingInstallments.filter(
      (inst) => new Date(inst.due_date) < new Date()
    );

    const totalLent = safeLoansData.reduce(
      (sum, loan) => sum + parseFloat(loan.amount || 0),
      0
    );

    const totalInterest = safeLoansData.reduce(
      (sum, loan) => sum + parseFloat(loan.interest_amount || 0),
      0
    );

    const totalCollected = paidInstallments.reduce(
      (sum, inst) => sum + parseFloat(inst.amount || 0),
      0
    );

    const now = new Date();
    const monthlyData = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toLocaleString("es-AR", { month: "short" });

      const monthLoans = safeLoansData.filter((loan) => {
        const loanDate = new Date(loan.created_at);
        return loanDate >= monthStart && loanDate <= monthEnd;
      });

      const monthPaidInstallments = paidInstallments.filter((inst) => {
        const paymentDate = new Date(inst.payment_date);
        return paymentDate >= monthStart && paymentDate <= monthEnd;
      });

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
    console.error("Error fetching stats data:", error);
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

// ==========================================
// PRODUCT REQUESTS
// ==========================================

export async function createProductRequest(requestData) {
  const user = await getCurrentUser();

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
  const user = await getCurrentUserSafe();
  if (!user) return [];

  let query = supabase
    .from("product_purchase_requests")
    .select("*, clients(id, name, phone, email)")
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
  const user = await getCurrentUser();

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
  const user = await getCurrentUser();

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

// ==========================================
// PURCHASED PRODUCTS
// ==========================================

export async function createPurchasedProduct(purchaseData) {
  const user = await getCurrentUser();

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
  const user = await getCurrentUserSafe();
  if (!user) return [];

  let query = supabase
    .from("purchased_products")
    .select(
      "*, clients(id, name, phone, email), product_purchase_requests(product_url, reason)"
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
  const user = await getCurrentUser();

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

// ==========================================
// PRODUCT PAYMENTS
// ==========================================

export async function fetchProductPayments(productId) {
  const user = await getCurrentUserSafe();
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
  const user = await getCurrentUser();

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
  const user = await getCurrentUserSafe();
  if (!user) return [];

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("product_payments")
    .select(
      "*, purchased_products(id, product_name, client_id), clients(name, phone)"
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

export async function getProductPurchaseStats() {
  const user = await getCurrentUserSafe();
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
    const { count: pendingRequests } = await supabase
      .from("product_purchase_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .eq("user_id", user.id);

    const { count: approvedRequests } = await supabase
      .from("product_purchase_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("user_id", user.id);

    const { count: activeProducts } = await supabase
      .from("purchased_products")
      .select("id", { count: "exact", head: true })
      .neq("status", "completed")
      .eq("user_id", user.id);

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
  const user = await getCurrentUserSafe();
  if (!user) return { overdue: [], upcoming: [] };

  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  try {
    const { data: overdue } = await supabase
      .from("product_payments")
      .select("*, purchased_products(product_name), clients(name, phone)")
      .eq("paid", false)
      .lt("due_date", today)
      .eq("user_id", user.id);

    const { data: upcoming } = await supabase
      .from("product_payments")
      .select("*, purchased_products(product_name), clients(name, phone)")
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

export async function searchProducts(searchTerm) {
  const user = await getCurrentUserSafe();
  if (!user) return [];

  const { data, error } = await supabase
    .from("purchased_products")
    .select("*, clients(name, phone)")
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

export async function getProductPurchaseSettings() {
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

export async function getClientProductHistory(clientId) {
  const user = await getCurrentUserSafe();
  if (!user) return [];

  const { data, error } = await supabase
    .from("purchased_products")
    .select("*, product_payments(*)")
    .eq("client_id", clientId)
    .eq("user_id", user.id)
    .order("purchase_date", { ascending: false });

  if (error) {
    console.error("Error fetching client product history:", error);
    return [];
  }

  return data || [];
}

// ==========================================
// DOCUMENT MANAGEMENT
// ==========================================

export async function createDocument(documentData) {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      client_id: documentData.clientId,
      loan_id: documentData.loanId || null,
      product_id: documentData.productId || null,
      file_name: documentData.fileName,
      file_size: documentData.fileSize,
      file_type: documentData.fileType,
      cloudinary_public_id: documentData.cloudinaryPublicId,
      cloudinary_url: documentData.cloudinaryUrl,
      cloudinary_secure_url: documentData.cloudinarySecureUrl,
      document_type: documentData.documentType,
      amount: documentData.amount || null,
      payment_date: documentData.paymentDate || null,
      notes: documentData.notes || null,
    })
    .select(
      "*, clients(id, name), loans(id), purchased_products(id, product_name)"
    )
    .single();

  if (error) {
    console.error("Error creating document:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function fetchDocuments(filters = {}) {
  const user = await getCurrentUserSafe();
  if (!user) return [];

  let query = supabase
    .from("documents")
    .select(
      "*, clients(id, name), loans(id), purchased_products(id, product_name)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (filters.clientId) query = query.eq("client_id", filters.clientId);
  if (filters.loanId) query = query.eq("loan_id", filters.loanId);
  if (filters.productId) query = query.eq("product_id", filters.productId);
  if (filters.documentType)
    query = query.eq("document_type", filters.documentType);
  if (filters.verificationStatus)
    query = query.eq("verification_status", filters.verificationStatus);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", filters.dateTo);
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching documents:", error);
    return [];
  }

  return data || [];
}

export async function updateDocumentVerification(documentId, verificationData) {
  const user = await getCurrentUser();

  const updateData = {
    verification_status: verificationData.status,
    verified_by: user.id,
    verified_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (verificationData.rejectionReason) {
    updateData.rejection_reason = verificationData.rejectionReason;
  }

  const { data, error } = await supabase
    .from("documents")
    .update(updateData)
    .eq("id", documentId)
    .eq("user_id", user.id)
    .select(
      "*, clients(id, name), loans(id), purchased_products(id, product_name)"
    )
    .single();

  if (error) {
    console.error("Error updating document verification:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteDocument(documentId) {
  const user = await getCurrentUser();

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting document:", error);
    throw new Error(error.message);
  }

  return true;
}

export async function getDocumentStats() {
  const user = await getCurrentUserSafe();
  if (!user) {
    return {
      totalDocuments: 0,
      verifiedDocuments: 0,
      pendingDocuments: 0,
      rejectedDocuments: 0,
      paymentReceipts: 0,
      todayUploads: 0,
      totalStorageUsed: 0,
    };
  }

  try {
    const { data: documents } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id);

    const docs = documents || [];
    const today = new Date().toISOString().split("T")[0];

    return {
      totalDocuments: docs.length,
      verifiedDocuments: docs.filter(
        (d) => d.verification_status === "verified"
      ).length,
      pendingDocuments: docs.filter((d) => d.verification_status === "pending")
        .length,
      rejectedDocuments: docs.filter(
        (d) => d.verification_status === "rejected"
      ).length,
      paymentReceipts: docs.filter(
        (d) => d.document_type === "comprobante_pago"
      ).length,
      todayUploads: docs.filter((d) => d.created_at?.startsWith(today)).length,
      totalStorageUsed: docs.reduce((sum, d) => sum + (d.file_size || 0), 0),
    };
  } catch (error) {
    console.error("Error fetching document stats:", error);
    return {
      totalDocuments: 0,
      verifiedDocuments: 0,
      pendingDocuments: 0,
      rejectedDocuments: 0,
      paymentReceipts: 0,
      todayUploads: 0,
      totalStorageUsed: 0,
    };
  }
}

export async function searchDocuments(searchTerm) {
  const user = await getCurrentUserSafe();
  if (!user) return [];

  const { data, error } = await supabase
    .from("documents")
    .select(
      "*, clients(id, name), loans(id), purchased_products(id, product_name)"
    )
    .eq("user_id", user.id)
    .or(
      `file_name.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%,clients.name.ilike.%${searchTerm}%`
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error searching documents:", error);
    return [];
  }

  return data || [];
}

// ==========================================
// LOAN UTILITIES
// ==========================================

export async function calculateInstallmentDates(
  startDate,
  endDate,
  numInstallments,
  frequency = "monthly"
) {
  const { data, error } = await supabase.rpc("calculate_installment_dates", {
    p_start_date: startDate,
    p_end_date: endDate,
    p_num_installments: numInstallments,
    p_frequency: frequency,
  });

  if (error) {
    console.error("Error calculating installment dates:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function fetchLoanStatistics(filters = {}) {
  try {
    const user = await getCurrentUserSafe();
    if (!user) return [];

    let query = supabase
      .from("loan_statistics_view")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (filters.status) query = query.eq("status", filters.status);
    if (filters.extended_status)
      query = query.eq("extended_status", filters.extended_status);
    if (filters.clientId) query = query.eq("client_id", filters.clientId);
    if (filters.dateFrom) query = query.gte("start_date", filters.dateFrom);
    if (filters.dateTo) query = query.lte("end_date", filters.dateTo);
    if (filters.limit) query = query.limit(filters.limit);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching loan statistics:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching loan statistics:", error);
    return [];
  }
}

export async function fetchUpcomingDueLoans(days = 7) {
  try {
    const user = await getCurrentUserSafe();
    if (!user) return [];

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from("loan_statistics_view")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .lte("end_date", futureDate.toISOString().split("T")[0])
      .gte("end_date", new Date().toISOString().split("T")[0])
      .order("end_date");

    if (error) {
      console.error("Error fetching upcoming due loans:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching upcoming due loans:", error);
    return [];
  }
}

export async function fetchOverdueLoans() {
  try {
    const user = await getCurrentUserSafe();
    if (!user) return [];

    const { data, error } = await supabase
      .from("loan_statistics_view")
      .select("*")
      .eq("user_id", user.id)
      .eq("extended_status", "overdue")
      .order("end_date");

    if (error) {
      console.error("Error fetching overdue loans:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching overdue loans:", error);
    return [];
  }
}
