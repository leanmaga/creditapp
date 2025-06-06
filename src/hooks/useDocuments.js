// 🔧 CORRECCIÓN en src/lib/api-client.js para getDocumentStats

export async function getDocumentStats() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    // 🔧 OPCIÓN 1: Intentar usar la vista
    const { data, error } = await supabase
      .from("document_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!error && data) {
      return {
        totalDocuments: data.total_documents || 0,
        verifiedDocuments: data.verified_documents || 0,
        pendingDocuments: data.pending_documents || 0,
        rejectedDocuments: data.rejected_documents || 0,
        paymentReceipts: data.payment_receipts || 0,
        todayUploads: data.today_uploads || 0,
        totalStorageUsed: data.total_storage_used || 0,
      };
    }

    console.warn(
      "Error with document_stats view, calculating manually:",
      error
    );

    // 🔧 OPCIÓN 2: Si la vista falla, calcular manualmente
    const { data: documents, error: documentsError } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id);

    if (documentsError) {
      console.error("Error fetching documents for stats:", documentsError);
      throw documentsError;
    }

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
