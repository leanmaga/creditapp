// src/app/(auth)productos/page.jsx
import ProductPurchaseSystem from "@/components/products/ProductPurchaseSystem";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProductPurchasePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 to-gray-900 text-white">
        <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ProductPurchaseSystem />
        </main>
      </div>
    </ProtectedRoute>
  );
}
