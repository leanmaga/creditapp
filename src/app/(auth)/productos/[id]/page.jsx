import { ProductDetail } from "@/components/products/ProductDetail";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProductDetailPage({ params, searchParams }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 to-gray-900 text-white">
        <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ProductDetail
            productId={params.id}
            clientId={searchParams.clientId}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}
