import { ClientDetailEdit } from "@/components/clients/ClientDetailEdit";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function EditClientPage({ params }) {
  return (
    <ProtectedRoute>
      {" "}
      <div className="min-h-screen flex flex-col  bg-gradient-to-br from-green-900 via-[#0d1b2a] to-black  text-white">
        <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold mb-6">Editar Cliente</h1>
          <ClientDetailEdit clientId={params.id} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
