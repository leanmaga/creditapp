"use client";

import EditLoanForm from "@/components/loans/EditLoanForm";

export default function EditLoanPage({ params }) {
  // ✅ CORRECTO - según tu estructura de carpetas:
  // clientes/[id]/prestamos/[loanId]/editar
  // params.id = clientId (de la carpeta [id])
  // params.loanId = loanId (de la carpeta [loanId])

  console.log("📋 EditLoanPage params:", params);

  const clientId = params.id; // ← Cambio aquí: era params.clientId
  const loanId = params.loanId;

  console.log("🔍 Extracted IDs:", { clientId, loanId });

  if (!clientId || !loanId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            ⚠️ Error: Parámetros faltantes
          </h1>
          <p className="mb-2">Cliente ID: {clientId || "No encontrado"}</p>
          <p className="mb-4">Préstamo ID: {loanId || "No encontrado"}</p>
          <div className="text-sm text-white/70 bg-black/20 p-4 rounded mb-4">
            <p className="font-bold mb-2">Debug Info:</p>
            <p>Parámetros recibidos: {JSON.stringify(params, null, 2)}</p>
            <p className="mt-2">
              Estructura esperada: clientes/[id]/prestamos/[loanId]/editar
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  return <EditLoanForm clientId={clientId} loanId={loanId} />;
}
