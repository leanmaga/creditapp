import { LoanDetail } from "@/components/loans/LoanDetail";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function LoanDetailPage({ params }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col  bg-gradient-to-br from-blue-900 to-gray-900 text-white">
        <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <LoanDetail clientId={params.id} loanId={params.loanId} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
