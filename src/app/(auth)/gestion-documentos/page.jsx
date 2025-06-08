"use client";
import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  FileText,
  Image,
  Download,
  Eye,
  Trash2,
  Calendar,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Loader2,
  ExternalLink,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Importar funciones de API
import { fetchClients } from "@/lib/api-client";

// Importar hook personalizado
import { useDocuments } from "@/hooks/useDocuments";

export default function DocumentManagementSystem() {
  const { toast } = useToast();

  // Hook personalizado para documentos
  const {
    documents,
    stats,
    isLoading,
    isUploading,
    isReady, // Importante: asegurarse de que isReady esté disponible
    filters,
    setFilters,
    uploadDocument,
    uploadMultipleDocuments,
    verifyDocument,
    removeDocument,
  } = useDocuments();

  // Estados locales
  const [clients, setClients] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedDocuments, setExpandedDocuments] = useState(new Set());

  // Estados para upload
  const [uploadData, setUploadData] = useState({
    clientId: "",
    loanId: "",
    productId: "",
    documentType: "comprobante_pago",
    amount: "",
    paymentDate: "",
    notes: "",
  });

  // Estados para verificación
  const [verificationDialog, setVerificationDialog] = useState({
    open: false,
    document: null,
    action: "",
    rejectionReason: "",
  });

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClients();
  }, []);

  // UseEffect para debugging del estado del sistema
  useEffect(() => {
    console.log("Upload system state:", {
      isReady,
      isUploading,
      clientId: uploadData.clientId,
      cloudinaryConfig: {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      },
    });
  }, [isReady, isUploading, uploadData.clientId]);

  const documentTypes = [
    {
      value: "comprobante_pago",
      label: "💰 Comprobante de Pago",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    },
    {
      value: "dni_frontal",
      label: "🪪 DNI Frontal",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    },
    {
      value: "dni_dorso",
      label: "🪪 DNI Dorso",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    },
    {
      value: "recibo_sueldo",
      label: "💼 Recibo de Sueldo",
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    },
    {
      value: "cbu_cuenta",
      label: "🏦 CBU/Cuenta Bancaria",
      color:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    },
    {
      value: "contrato",
      label: "📋 Contrato Firmado",
      color:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    },
    {
      value: "screenshot",
      label: "📱 Screenshot",
      color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    },
    {
      value: "otro",
      label: "📎 Otro Documento",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    },
  ];

  const loadClients = async () => {
    try {
      const clientsData = await fetchClients();
      setClients(clientsData);
    } catch (error) {
      console.error("Error loading clients:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los clientes",
      });
    }
  };

  // Manejo de drag & drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = [...e.dataTransfer.files];
    handleFiles(files);
  }, []);

  // Manejo de archivos con validaciones mejoradas
  const handleFiles = async (files) => {
    if (!uploadData.clientId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selecciona un cliente antes de subir archivos",
      });
      return;
    }

    if (!isReady) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "El sistema de archivos aún se está inicializando. Por favor, intenta nuevamente.",
      });
      return;
    }

    try {
      console.log("Starting file upload for files:", files);
      await uploadMultipleDocuments(files, uploadData);
    } catch (error) {
      console.error("Error in handleFiles:", error);
      // El error ya se maneja en el hook
    }
  };

  // Verificación de documentos
  const handleVerification = async (document, action) => {
    try {
      await verifyDocument(
        document.id,
        action,
        action === "rejected" ? verificationDialog.rejectionReason : null
      );

      setVerificationDialog({
        open: false,
        document: null,
        action: "",
        rejectionReason: "",
      });
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  // Eliminar documento
  const handleDeleteDocument = async (document) => {
    if (
      !window.confirm("¿Estás seguro de que quieres eliminar este documento?")
    ) {
      return;
    }

    try {
      await removeDocument(document);
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  // Obtener configuración del tipo de documento
  const getTypeInfo = (type) => {
    return (
      documentTypes.find((t) => t.value === type) ||
      documentTypes[documentTypes.length - 1]
    );
  };

  // Obtener badge de estado
  const getStatusBadge = (status) => {
    const className =
      "text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit";
    switch (status) {
      case "verified":
        return (
          <Badge
            className={`${className} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`}
          >
            <CheckCircle className="h-3 w-3" />
            <span className="hidden sm:inline">Verificado</span>
            <span className="sm:hidden">✓</span>
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            className={`${className} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`}
          >
            <XCircle className="h-3 w-3" />
            <span className="hidden sm:inline">Rechazado</span>
            <span className="sm:hidden">✗</span>
          </Badge>
        );
      default:
        return (
          <Badge
            className={`${className} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span className="hidden sm:inline">Pendiente</span>
            <span className="sm:hidden">⏳</span>
          </Badge>
        );
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Toggle expand document
  const toggleExpandDocument = (docId) => {
    const newExpanded = new Set(expandedDocuments);
    if (newExpanded.has(docId)) {
      newExpanded.delete(docId);
    } else {
      newExpanded.add(docId);
    }
    setExpandedDocuments(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900 text-white p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-gray-300">Cargando sistema de documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 py-4 sm:py-6 lg:py-10 px-3 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Gestión de Documentos
        </h1>
        <p className="text-gray-300 text-sm sm:text-base px-4">
          Sube y organiza comprobantes de pago y documentos de clientes
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">
                  {stats.totalDocuments}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">
                  {stats.verifiedDocuments}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Verificados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">
                  {stats.paymentReceipts}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Comprobantes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">
                  {stats.todayUploads}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layout principal - Stack en móvil, Grid en desktop */}
      <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
        {/* Panel de carga */}
        <Card className="bg-white/95 backdrop-blur lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">
              📤 Subir Documento
            </CardTitle>
            <CardDescription className="text-sm">
              Arrastra archivos aquí o haz click para seleccionar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Indicador de carga del sistema de archivos */}
            {!isReady && (
              <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Inicializando sistema de archivos...
                </p>
              </div>
            )}

            {/* Área de drag & drop */}
            <div
              className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 text-blue-500 animate-spin mb-3 sm:mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    Subiendo archivos...
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm sm:text-base">
                    Arrastra imágenes o PDFs aquí
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    JPG, PNG, PDF hasta 10MB
                  </p>
                  <Button
                    onClick={() => {
                      if (!uploadData.clientId) {
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description:
                            "Por favor selecciona un cliente primero",
                        });
                        return;
                      }
                      if (!isReady) {
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description:
                            "El sistema aún se está cargando. Por favor espera un momento.",
                        });
                        return;
                      }
                      document.getElementById("file-upload").click();
                    }}
                    disabled={!uploadData.clientId || !isReady || isUploading}
                    className="w-full sm:w-auto"
                    size="sm"
                  >
                    {isUploading ? "Subiendo..." : "Seleccionar Archivos"}
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        console.log("Files selected:", e.target.files);
                        handleFiles([...e.target.files]);
                      }
                    }}
                  />
                </>
              )}
            </div>

            {/* Configuración de upload */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Cliente *</Label>
                <Select
                  value={uploadData.clientId}
                  onValueChange={(value) =>
                    setUploadData({ ...uploadData, clientId: value })
                  }
                >
                  <SelectTrigger className="mt-1">
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
                <Label className="text-sm font-medium">Tipo de Documento</Label>
                <Select
                  value={uploadData.documentType}
                  onValueChange={(value) =>
                    setUploadData({ ...uploadData, documentType: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {uploadData.documentType === "comprobante_pago" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Monto</Label>
                    <Input
                      type="number"
                      placeholder="Ej: 25000"
                      value={uploadData.amount}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, amount: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fecha de pago</Label>
                    <Input
                      type="date"
                      value={uploadData.paymentDate}
                      onChange={(e) =>
                        setUploadData({
                          ...uploadData,
                          paymentDate: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Notas</Label>
                <Textarea
                  placeholder="Ej: Pago cuota #3, transferencia bancaria"
                  value={uploadData.notes}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, notes: e.target.value })
                  }
                  rows={3}
                  className="mt-1 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de documentos */}
        <Card className="bg-white/95 backdrop-blur lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex flex-col space-y-4">
              <div>
                <CardTitle className="text-lg sm:text-xl">
                  📋 Documentos
                </CardTitle>
                <CardDescription className="text-sm">
                  Documentos subidos organizados por fecha
                </CardDescription>
              </div>

              {/* Filtros - Colapsibles en móvil */}
              <div className="space-y-3">
                <div className="flex items-center justify-between sm:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filtros
                    {showFilters ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div
                  className={`space-y-3 sm:space-y-0 sm:flex sm:gap-3 ${
                    showFilters ? "block" : "hidden sm:flex"
                  }`}
                >
                  <div className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar..."
                      className="pl-8 text-sm"
                      value={filters.searchTerm}
                      onChange={(e) =>
                        setFilters({ ...filters, searchTerm: e.target.value })
                      }
                    />
                  </div>
                  <Select
                    value={filters.clientId || "all"}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        clientId: value === "all" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger className="sm:w-40">
                      <SelectValue placeholder="Cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.verificationStatus || "all"}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        verificationStatus: value === "all" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger className="sm:w-40">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="verified">Verificados</SelectItem>
                      <SelectItem value="rejected">Rechazados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {documents.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-600 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <FileText className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                  <p className="text-sm sm:text-base">
                    No se encontraron documentos
                  </p>
                  <p className="text-xs sm:text-sm mt-1 px-4">
                    {filters.searchTerm ||
                    filters.clientId ||
                    filters.verificationStatus
                      ? "Prueba con otros filtros"
                      : "Sube tu primer documento para comenzar"}
                  </p>
                </div>
              ) : (
                documents.map((doc) => {
                  const typeInfo = getTypeInfo(doc.document_type);
                  const clientData = doc.clients || {};
                  const isExpanded = expandedDocuments.has(doc.id);

                  return (
                    <div
                      key={doc.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {/* Header del documento */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3 min-w-0 flex-1">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                            {doc.file_type === "application/pdf" ? (
                              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            ) : (
                              <Image className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                              {doc.file_name}
                            </h4>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500 mt-1 space-y-1 sm:space-y-0">
                              <span className="flex items-center">
                                <User className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {clientData.name || "Cliente no encontrado"}
                                </span>
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                {formatDate(doc.created_at)}
                              </span>
                              <span className="hidden sm:inline">
                                {formatFileSize(doc.file_size)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {getStatusBadge(doc.verification_status)}
                        </div>
                      </div>

                      {/* Información del documento */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={`${typeInfo.color} text-xs`}>
                            {typeInfo.label}
                          </Badge>
                          {doc.amount && (
                            <span className="flex items-center text-xs sm:text-sm font-medium text-green-600">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {formatCurrency(doc.amount)}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 sm:hidden">
                            {formatFileSize(doc.file_size)}
                          </span>
                        </div>
                        <div className="flex flex-col text-xs text-gray-500 space-y-1">
                          {doc.loan_id && <span>Préstamo: {doc.loan_id}</span>}
                          {doc.product_id && (
                            <span>
                              Producto:{" "}
                              {doc.purchased_products?.product_name ||
                                doc.product_id}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Notas y razón de rechazo */}
                      {doc.notes && (
                        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs sm:text-sm">
                          <strong>Notas:</strong> {doc.notes}
                        </div>
                      )}

                      {doc.verification_status === "rejected" &&
                        doc.rejection_reason && (
                          <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs sm:text-sm">
                            <strong className="text-red-600">
                              Motivo de rechazo:
                            </strong>{" "}
                            {doc.rejection_reason}
                          </div>
                        )}

                      {/* Acciones - Adaptables a móvil */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        {/* Botones principales siempre visibles */}
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(doc.cloudinary_secure_url, "_blank")
                            }
                            className="flex-1 sm:flex-initial"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            <span className="sm:inline">Ver</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = doc.cloudinary_secure_url;
                              link.download = doc.file_name;
                              link.click();
                            }}
                            className="flex-1 sm:flex-initial"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            <span className="sm:inline">Descargar</span>
                          </Button>
                        </div>

                        {/* Botones adicionales - Colapsibles en móvil */}
                        <div className="sm:hidden">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpandDocument(doc.id)}
                            className="w-full justify-center"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Menos opciones
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Más opciones
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Acciones adicionales */}
                        <div
                          className={`flex gap-2 flex-wrap ${
                            isExpanded ? "block" : "hidden"
                          } sm:flex`}
                        >
                          {doc.verification_status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-initial"
                                onClick={() =>
                                  setVerificationDialog({
                                    open: true,
                                    document: doc,
                                    action: "verified",
                                    rejectionReason: "",
                                  })
                                }
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                <span className="sm:inline">Verificar</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-300 flex-1 sm:flex-initial"
                                onClick={() =>
                                  setVerificationDialog({
                                    open: true,
                                    document: doc,
                                    action: "rejected",
                                    rejectionReason: "",
                                  })
                                }
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                <span className="sm:inline">Rechazar</span>
                              </Button>
                            </>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 flex-1 sm:flex-initial"
                            onClick={() => handleDeleteDocument(doc)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            <span className="sm:inline">Eliminar</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de verificación/rechazo */}
      <AlertDialog
        open={verificationDialog.open}
        onOpenChange={(open) =>
          setVerificationDialog({ ...verificationDialog, open })
        }
      >
        <AlertDialogContent className="mx-4 max-w-md sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              {verificationDialog.action === "verified"
                ? "Verificar Documento"
                : "Rechazar Documento"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {verificationDialog.action === "verified"
                ? "¿Estás seguro de que quieres verificar este documento?"
                : "¿Estás seguro de que quieres rechazar este documento?"}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {verificationDialog.action === "rejected" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Motivo del rechazo</Label>
              <Textarea
                placeholder="Explica por qué se rechaza el documento..."
                value={verificationDialog.rejectionReason}
                onChange={(e) =>
                  setVerificationDialog({
                    ...verificationDialog,
                    rejectionReason: e.target.value,
                  })
                }
                rows={3}
                className="text-sm"
              />
            </div>
          )}

          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleVerification(
                  verificationDialog.document,
                  verificationDialog.action
                )
              }
              disabled={
                verificationDialog.action === "rejected" &&
                !verificationDialog.rejectionReason.trim()
              }
              className={`w-full sm:w-auto ${
                verificationDialog.action === "verified"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {verificationDialog.action === "verified"
                ? "Verificar"
                : "Rechazar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
