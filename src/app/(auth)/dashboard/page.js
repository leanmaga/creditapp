// app/dashboard/page.js
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentLoans } from "@/components/dashboard/recent-loans";
import { UpcomingPayments } from "@/components/dashboard/upcoming-payments";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-900 via-[#0d1b2a] to-black p-4 text-white">
        <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          <DashboardStats />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <RecentLoans />
            <UpcomingPayments />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
