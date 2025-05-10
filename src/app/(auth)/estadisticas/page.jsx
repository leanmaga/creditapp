import ProtectedRoute from "@/components/ProtectedRoute";
import { StatsOverview } from "@/components/stats/stats-overview";

export default function StatsPage() {
  return (
    <ProtectedRoute>
      {" "}
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 to-gray-900 text-white">
        <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold mb-6 text-white ">Estadísticas</h1>
          <StatsOverview />
        </main>
      </div>
    </ProtectedRoute>
  );
}
