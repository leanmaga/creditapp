import { ClientDetail } from "@/components/clients/ClientDetail";

export default function ClientDetailPage({ params }) {
  return (
    <div className="min-h-screen flex flex-col   bg-gradient-to-br from-green-900 via-[#0d1b2a] to-black text-white">
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ClientDetail clientId={params.id} />
      </main>
    </div>
  );
}
