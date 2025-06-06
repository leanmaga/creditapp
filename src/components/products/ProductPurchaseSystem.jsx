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
import { useToast } from "@/hooks/use-toast";
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
  Loader2,
  Percent,
} from "lucide-react";
import {
  createProductRequest,
  fetchProductRequests,
  updateRequestStatus,
  createPurchasedProduct,
  fetchPurchasedProducts,
  getProductPurchaseStats,
  fetchClients,
  deleteProductRequest,
} from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function ProductPurchaseSystem() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("requests");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customMonths, setCustomMonths] = useState("");
  const [monthsType, setMonthsType] = useState("preset");

  // Estados para datos reales
  const [stats, setStats] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    activeProducts: 0,
    totalProfits: 0,
  });

  const [clients, setClients] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [purchasedProducts, setPurchasedProducts] = useState([]);

  // Estados para filtros
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  // Estado para nueva solicitud - CAMPOS ACTUALIZADOS
  const [newRequest, setNewRequest] = useState({
    clientId: "",
    productName: "",
    productUrl: "",
    purchasePrice: "", // Precio de compra (lo que yo pago)
    interestAmount: "", // Valor de los intereses
    store: "",
    reason: "",
    months: 12,
    interestRate: 30, // Tasa de interés en porcentaje
    urgency: "medium",
    clientCredit: "good",
    notes: "",
  });

  // Función para sincronizar intereses
  const syncInterests = (
    purchasePrice,
    interestRate,
    interestAmount,
    changedField
  ) => {
    const price = parseFloat(purchasePrice) || 0;

    if (changedField === "rate" && price > 0) {
      // Si cambió la tasa, calcular el monto
      const newAmount = (price * interestRate) / 100;
      return { rate: interestRate, amount: newAmount.toString() };
    } else if (changedField === "amount" && price > 0) {
      // Si cambió el monto, calcular la tasa
      const newRate = ((parseFloat(interestAmount) || 0) / price) * 100;
      return { rate: Math.round(newRate * 100) / 100, amount: interestAmount };
    }

    return { rate: interestRate, amount: interestAmount };
  };

  // Handler para cambios en precio de compra
  const handlePurchasePriceChange = (value) => {
    const synced = syncInterests(
      value,
      newRequest.interestRate,
      newRequest.interestAmount,
      "rate"
    );
    setNewRequest({
      ...newRequest,
      purchasePrice: value,
      interestAmount: synced.amount,
    });
  };

  // Handler para cambios en tasa de interés
  const handleInterestRateChange = (value) => {
    const rate = Math.max(0, Math.min(200, parseFloat(value) || 0));
    const synced = syncInterests(
      newRequest.purchasePrice,
      rate,
      newRequest.interestAmount,
      "rate"
    );
    setNewRequest({
      ...newRequest,
      interestRate: rate,
      interestAmount: synced.amount,
    });
  };

  // Handler para cambios en monto de interés
  const handleInterestAmountChange = (value) => {
    const synced = syncInterests(
      newRequest.purchasePrice,
      newRequest.interestRate,
      value,
      "amount"
    );
    setNewRequest({
      ...newRequest,
      interestAmount: value,
      interestRate: synced.rate,
    });
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      // Cargar todos los datos en paralelo
      const [clientsData, requestsData, productsData, statsData] =
        await Promise.all([
          fetchClients(),
          fetchProductRequests(),
          fetchPurchasedProducts(),
          getProductPurchaseStats(),
        ]);

      setClients(clientsData);
      setPurchaseRequests(requestsData);
      setPurchasedProducts(productsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    setFilteredProducts(purchasedProducts);
  }, [purchasedProducts]);

  // Funciones de utilidad
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
      active: {
        label: "🔄 Activo",
        className:
          "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
      },
      completed: {
        label: "🎉 Completado",
        className:
          "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
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

  // NUEVA función de cálculo con los campos actualizados
  const calculateLoanDetails = (purchasePrice, interestAmount, months) => {
    const price = parseFloat(purchasePrice) || 0;
    const interest = parseFloat(interestAmount) || 0;
    const totalAmount = price + interest;
    const monthlyPayment = totalAmount / months;

    return {
      totalAmount,
      interest,
      monthlyPayment,
      clientPrice: price + interest,
    };
  };

  // Handlers para acciones
  const handleCreateRequest = async () => {
    if (
      !newRequest.clientId ||
      !newRequest.productName ||
      !newRequest.purchasePrice
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Completa todos los campos obligatorios",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calcular el precio acordado con el cliente
      const purchasePrice = parseFloat(newRequest.purchasePrice);
      const interestAmount = parseFloat(newRequest.interestAmount) || 0;
      const agreedClientPrice = purchasePrice + interestAmount;

      const requestData = {
        clientId: newRequest.clientId,
        productName: newRequest.productName,
        productUrl: newRequest.productUrl,
        estimatedPrice: purchasePrice, // Guardamos como estimatedPrice por compatibilidad
        requestedPrice: agreedClientPrice, // El precio total que pagará el cliente
        store: newRequest.store,
        reason: newRequest.reason,
        months: newRequest.months,
        interestRate: newRequest.interestRate,
        urgency: newRequest.urgency,
        clientCredit: newRequest.clientCredit,
        notes: newRequest.notes,
      };

      await createProductRequest(requestData);

      // Recargar datos
      const [requestsData, statsData] = await Promise.all([
        fetchProductRequests(),
        getProductPurchaseStats(),
      ]);

      setPurchaseRequests(requestsData);
      setStats(statsData);

      const resetForm = () => {
        setNewRequest({
          clientId: "",
          productName: "",
          productUrl: "",
          purchasePrice: "",
          interestAmount: "",
          store: "",
          reason: "",
          months: 12,
          interestRate: 30,
          urgency: "medium",
          clientCredit: "good",
          notes: "",
        }); // Agregar estos resets:
        setCustomMonths("");
        setMonthsType("preset");
      };

      setActiveTab("requests");
      toast({
        title: "Solicitud creada",
        description: "La solicitud se ha creado correctamente",
      });
    } catch (error) {
      console.error("Error creating request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo crear la solicitud",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const approveRequest = async (requestId) => {
    try {
      await updateRequestStatus(requestId, "approved");

      // Recargar datos
      const [requestsData, statsData] = await Promise.all([
        fetchProductRequests(),
        getProductPurchaseStats(),
      ]);

      setPurchaseRequests(requestsData);
      setStats(statsData);

      toast({
        title: "Solicitud aprobada",
        description: "La solicitud ha sido aprobada correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo aprobar la solicitud",
      });
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await updateRequestStatus(requestId, "rejected");

      // Recargar datos
      const [requestsData, statsData] = await Promise.all([
        fetchProductRequests(),
        getProductPurchaseStats(),
      ]);

      setPurchaseRequests(requestsData);
      setStats(statsData);

      toast({
        title: "Solicitud rechazada",
        description: "La solicitud ha sido rechazada",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo rechazar la solicitud",
      });
    }
  };

  const markAsPurchased = async (requestId) => {
    const actualPrice = prompt("¿Cuál fue el precio real de compra?");
    if (!actualPrice || isNaN(actualPrice)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes ingresar un precio válido",
      });
      return;
    }

    try {
      await createPurchasedProduct({
        requestId,
        actualPrice: parseFloat(actualPrice),
        purchaseDate: new Date().toISOString().split("T")[0],
      });

      // Recargar datos
      const [requestsData, productsData, statsData] = await Promise.all([
        fetchProductRequests(),
        fetchPurchasedProducts(),
        getProductPurchaseStats(),
      ]);

      setPurchaseRequests(requestsData);
      setPurchasedProducts(productsData);
      setStats(statsData);

      setActiveTab("purchased");
      toast({
        title: "Producto comprado",
        description:
          "El producto ha sido marcado como comprado y se crearon las cuotas automáticamente",
      });
    } catch (error) {
      console.error("Error marking as purchased:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo marcar como comprado",
      });
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta solicitud?")) {
      return;
    }

    try {
      await deleteProductRequest(requestId);

      // Recargar datos
      const [requestsData, statsData] = await Promise.all([
        fetchProductRequests(),
        getProductPurchaseStats(),
      ]);

      setPurchaseRequests(requestsData);
      setStats(statsData);

      toast({
        title: "Solicitud eliminada",
        description: "La solicitud ha sido eliminada correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar la solicitud",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando sistema de productos...
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
          {stats.pendingRequests > 0 && (
            <Badge variant="secondary" className="ml-1">
              {stats.pendingRequests}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeTab === "purchased" ? "default" : "outline"}
          onClick={() => setActiveTab("purchased")}
          className="flex items-center gap-2"
        >
          📦 Productos Comprados
          {stats.activeProducts > 0 && (
            <Badge variant="secondary" className="ml-1">
              {stats.activeProducts}
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
              // Usar los campos actuales de la DB
              const purchasePrice = request.estimated_price || 0; // El precio de compra real
              const clientPrice = request.requested_price || 0; // Lo que paga el cliente
              const interestAmount = clientPrice - purchasePrice; // La ganancia

              const loanDetails = calculateLoanDetails(
                purchasePrice,
                interestAmount,
                request.months
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
                          Precio de Compra
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(purchasePrice)}
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
                          Cliente Paga
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(clientPrice)}
                        </p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          Tu Ganancia
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(interestAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          🏪 Tienda:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {request.store || "No especificada"}
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
                        className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDeleteRequest(request.id)}
                      >
                        🗑️ Eliminar
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
                          {product.next_payment_date && (
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Próximo pago:{" "}
                              {formatDate(product.next_payment_date)}
                            </span>
                          )}
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
                          {formatCurrency(product.direct_profit || 0)}
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
                          Estado de Pagos
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Pagado: {formatCurrency(product.total_paid || 0)} de{" "}
                          {formatCurrency(product.total_amount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              100,
                              ((product.total_paid || 0) /
                                product.total_amount) *
                                100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span>
                          Progreso:{" "}
                          {Math.round(
                            ((product.total_paid || 0) / product.total_amount) *
                              100
                          )}
                          %
                        </span>
                        <span>
                          Pendiente:{" "}
                          {formatCurrency(
                            product.total_amount - (product.total_paid || 0)
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                      <Link
                        href={`/productos/${product.id}?clientId=${product.client_id}`}
                      >
                        <Button
                          variant="outline"
                          className="border-gray-300 dark:border-gray-700"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalles
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="border-gray-300 dark:border-gray-700"
                      >
                        📄 Ver Historial
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
                      <SelectItem key={client.id} value={client.id}>
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

            {/* CAMPOS NUEVOS SINCRONIZADOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="purchasePrice"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Precio de Compra (lo que yo pago) *
                </Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  placeholder="100000"
                  value={newRequest.purchasePrice}
                  onChange={(e) => handlePurchasePriceChange(e.target.value)}
                />
              </div>
              <div>
                <Label
                  htmlFor="interestAmount"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Valor de los Intereses (ARS)
                </Label>
                <Input
                  id="interestAmount"
                  type="number"
                  placeholder="30000"
                  value={newRequest.interestAmount}
                  onChange={(e) => handleInterestAmountChange(e.target.value)}
                />
              </div>
            </div>

            {/* Mostrar tasa calculada */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Tasa de Interés Calculada: {newRequest.interestRate}%
                </span>
              </div>
              <Input
                type="number"
                min="0"
                max="200"
                step="0.1"
                placeholder="30"
                value={newRequest.interestRate}
                onChange={(e) => handleInterestRateChange(e.target.value)}
                className="w-24"
              />
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                💡 Cambia cualquier campo y los otros se actualizarán
                automáticamente
              </p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  Plazo en Meses
                </Label>

                {/* Botones para elegir tipo */}
                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    variant={monthsType === "preset" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setMonthsType("preset");
                      setCustomMonths("");
                    }}
                  >
                    📋 Opciones Comunes
                  </Button>
                  <Button
                    type="button"
                    variant={monthsType === "custom" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMonthsType("custom")}
                  >
                    ✏️ Personalizado
                  </Button>
                </div>

                {/* Selector de opciones comunes */}
                {monthsType === "preset" && (
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
                      <SelectItem value="3">3 meses</SelectItem>
                      <SelectItem value="6">6 meses</SelectItem>
                      <SelectItem value="9">9 meses</SelectItem>
                      <SelectItem value="12">12 meses</SelectItem>
                      <SelectItem value="15">15 meses</SelectItem>
                      <SelectItem value="18">18 meses</SelectItem>
                      <SelectItem value="21">21 meses</SelectItem>
                      <SelectItem value="24">24 meses</SelectItem>
                      <SelectItem value="30">30 meses</SelectItem>
                      <SelectItem value="36">36 meses</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Input personalizado */}
                {monthsType === "custom" && (
                  <div className="space-y-2">
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      placeholder="Ej: 15"
                      value={customMonths}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value >= 1 && value <= 60) {
                          setCustomMonths(e.target.value);
                          setNewRequest({ ...newRequest, months: value });
                        }
                      }}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      💡 Ingresa entre 1 y 60 meses según las necesidades del
                      cliente
                    </p>
                  </div>
                )}
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
            {newRequest.purchasePrice && newRequest.interestAmount && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Vista Previa del Préstamo
                </h4>
                {(() => {
                  const purchasePrice = parseFloat(newRequest.purchasePrice);
                  const interestAmount = parseFloat(newRequest.interestAmount);
                  const details = calculateLoanDetails(
                    purchasePrice,
                    interestAmount,
                    newRequest.months
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
                          Cliente pagará:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(details.clientPrice)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Tu ganancia:
                        </span>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(interestAmount)}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "📝 Crear Solicitud"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
