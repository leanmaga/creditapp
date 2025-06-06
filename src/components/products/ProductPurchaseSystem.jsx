"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingCart,
  Package,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  DollarSign,
  Calendar,
  User,
  Star,
  AlertTriangle,
  ExternalLink,
  Banknote,
  TrendingUp,
  Plus,
  Filter,
} from "lucide-react";

export default function ProductPurchaseSystem() {
  const [activeTab, setActiveTab] = useState("requests");
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - reemplazar con llamadas reales a la API
  const [stats, setStats] = useState({
    pendingRequests: 3,
    approvedRequests: 2,
    activeProducts: 5,
    totalProfits: 150000,
  });

  const [clients, setClients] = useState([
    { id: 1, name: "Juan Pérez" },
    { id: 2, name: "María González" },
    { id: 3, name: "Carlos Ruiz" },
  ]);

  // Solicitudes de compra de productos
  const [purchaseRequests, setPurchaseRequests] = useState([
    {
      id: 1,
      client_id: 2,
      clients: { name: "María González" },
      product_name: "iPhone 15 Pro Max 256GB",
      product_url: "https://apple.com/iphone-15-pro",
      estimated_price: 450000,
      requested_price: 430000,
      store: "Apple Store Unicenter",
      reason: "Necesito el teléfono para trabajo, encontré esta oferta",
      request_date: "2025-06-06",
      status: "pending",
      months: 12,
      interest_rate: 35,
      urgency: "medium",
      client_credit_score: "good",
      internal_notes: "Cliente confiable, 3er préstamo",
    },
    {
      id: 2,
      client_id: 1,
      clients: { name: "Juan Pérez" },
      product_name: 'Samsung Smart TV 65" QLED',
      product_url: "https://mercadolibre.com.ar/tv-samsung",
      estimated_price: 380000,
      requested_price: 365000,
      store: "MercadoLibre - Vendedor Premium",
      reason: "Para la familia, oferta por tiempo limitado",
      request_date: "2025-06-05",
      status: "approved",
      months: 18,
      interest_rate: 30,
      urgency: "high",
      client_credit_score: "excellent",
      internal_notes: "Cliente VIP, siempre paga a tiempo",
    },
  ]);

  // Productos ya comprados
  const [purchasedProducts, setPurchasedProducts] = useState([
    {
      id: 1,
      client_id: 3,
      clients: { name: "Carlos Ruiz" },
      product_name: "Notebook Lenovo Legion Gaming",
      actual_purchase_price: 485000,
      agreed_client_price: 500000,
      direct_profit: 15000,
      purchase_date: "2025-06-04",
      delivery_date: "2025-06-05",
      status: "delivered",
      months: 24,
      interest_rate: 32,
      monthly_payment: 28500,
      total_amount: 684000,
      paid_installments: 1,
      total_installments: 24,
      next_payment_date: "2025-07-05",
      total_paid: 28500,
      store: "Compumundo",
    },
  ]);

  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Estados para filtros
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  // Estado para nueva solicitud
  const [newRequest, setNewRequest] = useState({
    clientId: "",
    productName: "",
    productUrl: "",
    estimatedPrice: "",
    requestedPrice: "",
    store: "",
    reason: "",
    months: 12,
    interestRate: 30,
    urgency: "medium",
    clientCredit: "good",
    notes: "",
  });

  // Cargar datos iniciales y aplicar filtros
  useEffect(() => {
    setFilteredRequests(purchaseRequests);
    setFilteredProducts(purchasedProducts);
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = purchaseRequests;

    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    if (urgencyFilter !== "all") {
      filtered = filtered.filter((req) => req.urgency === urgencyFilter);
    }

    setFilteredRequests(filtered);
  }, [purchaseRequests, statusFilter, urgencyFilter]);

  // Funciones de utilidad
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: "⏳ Pendiente",
        className:
          "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
      },
      approved: {
        label: "✅ Aprobado",
        className:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
      },
      rejected: {
        label: "❌ Rechazado",
        className:
          "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
      },
      purchased: {
        label: "🛒 Comprado",
        className:
          "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
      },
      delivered: {
        label: "📦 Entregado",
        className:
          "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
      },
      completed: {
        label: "🎉 Completado",
        className:
          "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-green-600 dark:text-green-400";
    }
  };

  const getCreditColor = (credit) => {
    switch (credit) {
      case "excellent":
        return "text-green-600 dark:text-green-400";
      case "good":
        return "text-blue-600 dark:text-blue-400";
      case "fair":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-red-600 dark:text-red-400";
    }
  };

  const calculateLoanDetails = (price, months, interestRate) => {
    const interest = (price * interestRate) / 100;
    const totalAmount = price + interest;
    const monthlyPayment = totalAmount / months;

    return {
      totalAmount,
      interest,
      monthlyPayment,
    };
  };

  // Handlers para acciones
  const handleCreateRequest = () => {
    if (
      !newRequest.clientId ||
      !newRequest.productName ||
      !newRequest.requestedPrice
    ) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    const newReq = {
      id: Date.now(),
      client_id: parseInt(newRequest.clientId),
      clients: {
        name:
          clients.find((c) => c.id === parseInt(newRequest.clientId))?.name ||
          "",
      },
      product_name: newRequest.productName,
      product_url: newRequest.productUrl,
      estimated_price: parseFloat(
        newRequest.estimatedPrice || newRequest.requestedPrice
      ),
      requested_price: parseFloat(newRequest.requestedPrice),
      store: newRequest.store,
      reason: newRequest.reason,
      request_date: new Date().toISOString().split("T")[0],
      status: "pending",
      months: newRequest.months,
      interest_rate: newRequest.interestRate,
      urgency: newRequest.urgency,
      client_credit_score: newRequest.clientCredit,
      internal_notes: newRequest.notes,
    };

    setPurchaseRequests([newReq, ...purchaseRequests]);

    // Reset form
    setNewRequest({
      clientId: "",
      productName: "",
      productUrl: "",
      estimatedPrice: "",
      requestedPrice: "",
      store: "",
      reason: "",
      months: 12,
      interestRate: 30,
      urgency: "medium",
      clientCredit: "good",
      notes: "",
    });

    setActiveTab("requests");
    alert("Solicitud creada correctamente");
  };

  const approveRequest = (requestId) => {
    setPurchaseRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "approved" } : req
      )
    );
    alert("Solicitud aprobada");
  };

  const rejectRequest = (requestId) => {
    setPurchaseRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "rejected" } : req
      )
    );
    alert("Solicitud rechazada");
  };

  const markAsPurchased = (requestId) => {
    const request = purchaseRequests.find((r) => r.id === requestId);
    if (!request) return;

    // Actualizar solicitud
    setPurchaseRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "purchased" } : req
      )
    );

    // Crear producto comprado
    const loanDetails = calculateLoanDetails(
      request.requested_price,
      request.months,
      request.interest_rate
    );
    const newProduct = {
      id: Date.now(),
      client_id: request.client_id,
      clients: request.clients,
      product_name: request.product_name,
      actual_purchase_price: request.requested_price * 0.95, // 5% menos como ejemplo
      agreed_client_price: request.requested_price,
      direct_profit: request.requested_price * 0.05,
      purchase_date: new Date().toISOString().split("T")[0],
      status: "purchased",
      months: request.months,
      interest_rate: request.interest_rate,
      monthly_payment: loanDetails.monthlyPayment,
      total_amount: loanDetails.totalAmount,
      paid_installments: 0,
      total_installments: request.months,
      next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      total_paid: 0,
      store: request.store,
    };

    setPurchasedProducts([newProduct, ...purchasedProducts]);
    setActiveTab("purchased");
    alert("Producto marcado como comprado");
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando sistema de compras...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Sistema de Compra por Encargo
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Gestiona solicitudes de compra de productos y financiamiento
        </p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.pendingRequests}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Solicitudes Pendientes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <CardContent className="p-4">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.approvedRequests}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Aprobados para Comprar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.activeProducts}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Productos Activos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(stats.totalProfits)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ganancias Realizadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={activeTab === "requests" ? "default" : "outline"}
          onClick={() => setActiveTab("requests")}
          className="flex items-center gap-2"
        >
          📝 Solicitudes de Compra
          {purchaseRequests.filter((r) => r.status === "pending").length >
            0 && (
            <Badge variant="secondary" className="ml-1">
              {purchaseRequests.filter((r) => r.status === "pending").length}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeTab === "purchased" ? "default" : "outline"}
          onClick={() => setActiveTab("purchased")}
          className="flex items-center gap-2"
        >
          📦 Productos Comprados
          {purchasedProducts.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {purchasedProducts.length}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeTab === "new" ? "default" : "outline"}
          onClick={() => setActiveTab("new")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Solicitud
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              📋 Solicitudes de Compra
            </h2>

            {/* Filtros */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved">Aprobados</SelectItem>
                  <SelectItem value="rejected">Rechazados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Urgencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <CardContent className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No hay solicitudes
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  No se encontraron solicitudes con los filtros seleccionados
                </p>
                <Button
                  onClick={() => setActiveTab("new")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Solicitud
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => {
              const loanDetails = calculateLoanDetails(
                request.requested_price,
                request.months,
                request.interest_rate
              );
              const clientData = request.clients || {};

              return (
                <Card
                  key={request.id}
                  className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                          {request.product_name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {clientData.name || "Cliente no encontrado"}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(request.request_date)}
                          </span>
                          <span
                            className={`font-medium ${getUrgencyColor(
                              request.urgency
                            )}`}
                          >
                            🚨 {request.urgency?.toUpperCase()}
                          </span>
                          <span
                            className={`font-medium ${getCreditColor(
                              request.client_credit_score
                            )}`}
                          >
                            💳 {request.client_credit_score?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Precio Solicitado
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(request.requested_price)}
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Cuota Mensual
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(loanDetails.monthlyPayment)}
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                          Total a Pagar
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(loanDetails.totalAmount)}
                        </p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          Tu Ganancia
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(loanDetails.interest)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          🏪 Tienda:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {request.store}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          📅 Plazo:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {request.months} meses
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          📊 Interés:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {request.interest_rate}%
                        </span>
                      </div>
                      {request.product_url && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            🔗 URL del Producto:
                          </span>
                          <a
                            href={request.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline dark:text-blue-400 flex items-center"
                          >
                            Ver Producto{" "}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>

                    {request.reason && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
                        <p className="text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                          💬 Razón de la solicitud:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {request.reason}
                        </p>
                      </div>
                    )}

                    {request.internal_notes && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                        <p className="text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                          📝 Notas internas:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {request.internal_notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                      {request.status === "pending" && (
                        <>
                          <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => approveRequest(request.id)}
                          >
                            ✅ Aprobar Compra
                          </Button>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => rejectRequest(request.id)}
                          >
                            ❌ Rechazar
                          </Button>
                        </>
                      )}

                      {request.status === "approved" && (
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => markAsPurchased(request.id)}
                        >
                          🛒 Marcar como Comprado
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        className="border-gray-300 dark:border-gray-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {activeTab === "purchased" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            📦 Productos Comprados
          </h2>
          {filteredProducts.length === 0 ? (
            <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No hay productos comprados
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Los productos comprados aparecerán aquí una vez que apruebes y
                  compres las solicitudes
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredProducts.map((product) => {
              const clientData = product.clients || {};
              const progressPercentage =
                product.total_installments > 0
                  ? Math.round(
                      (product.paid_installments / product.total_installments) *
                        100
                    )
                  : 0;

              return (
                <Card
                  key={product.id}
                  className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                          {product.product_name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {clientData.name || "Cliente no encontrado"}
                          </span>
                          <span className="flex items-center">
                            <Package className="h-4 w-4 mr-1" />
                            Comprado: {formatDate(product.purchase_date)}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Próximo pago:{" "}
                            {formatDate(product.next_payment_date)}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(product.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Precio Compra
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(product.actual_purchase_price)}
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Precio Cliente
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(product.agreed_client_price)}
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                          Ganancia Directa
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(product.direct_profit)}
                        </p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          Cuota Mensual
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(product.monthly_payment)}
                        </p>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">
                          Total Final
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(product.total_amount)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          Progreso de Pago
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {product.paid_installments}/
                          {product.total_installments} cuotas
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span>
                          Pagado: {formatCurrency(product.total_paid || 0)}
                        </span>
                        <span>
                          Pendiente:{" "}
                          {formatCurrency(
                            (product.total_amount || 0) -
                              (product.total_paid || 0)
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="border-gray-300 dark:border-gray-700"
                      >
                        <Banknote className="h-4 w-4 mr-1" />
                        Registrar Pago
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-300 dark:border-gray-700"
                      >
                        📄 Ver Recibo de Compra
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-300 dark:border-gray-700"
                      >
                        📊 Historial de Pagos
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-300 dark:border-gray-700"
                      >
                        📞 Contactar Cliente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {activeTab === "new" && (
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              ➕ Nueva Solicitud de Compra
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Registra una nueva solicitud de compra de producto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="clientId"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Cliente *
                </Label>
                <Select
                  value={newRequest.clientId}
                  onValueChange={(value) =>
                    setNewRequest({ ...newRequest, clientId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="productName"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Nombre del Producto *
                </Label>
                <Input
                  id="productName"
                  placeholder="Ej: iPhone 15 Pro Max 256GB"
                  value={newRequest.productName}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      productName: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="requestedPrice"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Precio Solicitado *
                </Label>
                <Input
                  id="requestedPrice"
                  type="number"
                  placeholder="450000"
                  value={newRequest.requestedPrice}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      requestedPrice: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label
                  htmlFor="estimatedPrice"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Precio Estimado
                </Label>
                <Input
                  id="estimatedPrice"
                  type="number"
                  placeholder="450000"
                  value={newRequest.estimatedPrice}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      estimatedPrice: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="productUrl"
                  className="text-gray-700 dark:text-gray-300"
                >
                  URL del Producto
                </Label>
                <Input
                  id="productUrl"
                  placeholder="https://..."
                  value={newRequest.productUrl}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, productUrl: e.target.value })
                  }
                />
              </div>
              <div>
                <Label
                  htmlFor="store"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Tienda
                </Label>
                <Input
                  id="store"
                  placeholder="Apple Store, MercadoLibre, etc."
                  value={newRequest.store}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, store: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="months"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Plazo en Meses
                </Label>
                <Select
                  value={newRequest.months.toString()}
                  onValueChange={(value) =>
                    setNewRequest({ ...newRequest, months: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 meses</SelectItem>
                    <SelectItem value="12">12 meses</SelectItem>
                    <SelectItem value="18">18 meses</SelectItem>
                    <SelectItem value="24">24 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="interestRate"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Tasa de Interés (%)
                </Label>
                <Input
                  id="interestRate"
                  type="number"
                  min="1"
                  max="200"
                  value={newRequest.interestRate}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      interestRate: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label
                  htmlFor="urgency"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Urgencia
                </Label>
                <Select
                  value={newRequest.urgency}
                  onValueChange={(value) =>
                    setNewRequest({ ...newRequest, urgency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Baja</SelectItem>
                    <SelectItem value="medium">🟡 Media</SelectItem>
                    <SelectItem value="high">🔴 Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label
                htmlFor="reason"
                className="text-gray-700 dark:text-gray-300"
              >
                Razón de la Solicitud
              </Label>
              <Textarea
                id="reason"
                placeholder="¿Por qué necesita este producto?"
                value={newRequest.reason}
                onChange={(e) =>
                  setNewRequest({ ...newRequest, reason: e.target.value })
                }
              />
            </div>

            <div>
              <Label
                htmlFor="notes"
                className="text-gray-700 dark:text-gray-300"
              >
                Notas Internas
              </Label>
              <Textarea
                id="notes"
                placeholder="Notas internas para tu referencia"
                value={newRequest.notes}
                onChange={(e) =>
                  setNewRequest({ ...newRequest, notes: e.target.value })
                }
              />
            </div>

            {/* Vista previa de cálculos */}
            {newRequest.requestedPrice && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Vista Previa del Préstamo
                </h4>
                {(() => {
                  const price = parseFloat(newRequest.requestedPrice);
                  const details = calculateLoanDetails(
                    price,
                    newRequest.months,
                    newRequest.interestRate
                  );
                  return (
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Cuota mensual:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(details.monthlyPayment)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Total a pagar:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(details.totalAmount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Tu ganancia:
                        </span>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(details.interest)}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCreateRequest}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Creando..." : "📝 Crear Solicitud"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
