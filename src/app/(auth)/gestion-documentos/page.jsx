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

  // Manejo de archivos
  const handleFiles = async (files) => {
    if (!uploadData.clientId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selecciona un cliente antes de subir archivos",
      });
      return;
    }

    try {
      await uploadMultipleDocuments(files, uploadData);
    } catch (error) {
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
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verificado
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Rechazado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando sistema de documentos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestión de Documentos
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Sube y organiza comprobantes de pago y documentos de clientes
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.totalDocuments}</p>
                <p className="text-sm text-gray-600">Total Documentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.verifiedDocuments}</p>
                <p className="text-sm text-gray-600">Verificados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.paymentReceipts}</p>
                <p className="text-sm text-gray-600">Comprobantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.todayUploads}</p>
                <p className="text-sm text-gray-600">Hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de carga */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>📤 Subir Documento</CardTitle>
            <CardDescription>
              Arrastra archivos aquí o haz click para seleccionar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Área de drag & drop */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
                  <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Subiendo archivos...
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Arrastra imágenes o PDFs aquí
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    JPG, PNG, PDF hasta 10MB
                  </p>
                  <Button
                    onClick={() =>
                      document.getElementById("file-upload").click()
                    }
                    disabled={!uploadData.clientId}
                    className="mx-auto"
                  >
                    Seleccionar Archivos
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFiles([...e.target.files])}
                  />
                </>
              )}
            </div>

            {/* Configuración de upload */}
            <div className="space-y-3">
              <div>
                <Label>Cliente *</Label>
                <Select
                  value={uploadData.clientId}
                  onValueChange={(value) =>
                    setUploadData({ ...uploadData, clientId: value })
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
                <Label>Tipo de Documento</Label>
                <Select
                  value={uploadData.documentType}
                  onValueChange={(value) =>
                    setUploadData({ ...uploadData, documentType: value })
                  }
                >
                  <SelectTrigger>
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
                <>
                  <div>
                    <Label>Monto</Label>
                    <Input
                      type="number"
                      placeholder="Ej: 25000"
                      value={uploadData.amount}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, amount: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Fecha de pago</Label>
                    <Input
                      type="date"
                      value={uploadData.paymentDate}
                      onChange={(e) =>
                        setUploadData({
                          ...uploadData,
                          paymentDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}

              <div>
                <Label>Notas</Label>
                <Textarea
                  placeholder="Ej: Pago cuota #3, transferencia bancaria"
                  value={uploadData.notes}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de documentos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>📋 Documentos</CardTitle>
                <CardDescription>
                  Documentos subidos organizados por fecha
                </CardDescription>
              </div>

              {/* Filtros */}
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar..."
                    className="pl-8 w-40"
                    value={filters.searchTerm}
                    onChange={(e) =>
                      setFilters({ ...filters, searchTerm: e.target.value })
                    }
                  />
                </div>
                <Select
                  value={filters.clientId}
                  onValueChange={(value) =>
                    setFilters({ ...filters, clientId: value })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.verificationStatus}
                  onValueChange={(value) =>
                    setFilters({ ...filters, verificationStatus: value })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="verified">Verificados</SelectItem>
                    <SelectItem value="rejected">Rechazados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <FileText className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                  <p>No se encontraron documentos</p>
                  <p className="text-sm mt-1">
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

                  return (
                    <div
                      key={doc.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            {doc.file_type === "application/pdf" ? (
                              <FileText className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Image className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {doc.file_name}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <span className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {clientData.name || "Cliente no encontrado"}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(doc.created_at)}
                              </span>
                              <span>{formatFileSize(doc.file_size)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(doc.verification_status)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                          {doc.amount && (
                            <span className="flex items-center text-sm font-medium text-green-600">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {formatCurrency(doc.amount)}
                            </span>
                          )}
                        </div>
                        {doc.loan_id && (
                          <span className="text-xs text-gray-500">
                            Préstamo: {doc.loan_id}
                          </span>
                        )}
                        {doc.product_id && (
                          <span className="text-xs text-gray-500">
                            Producto:{" "}
                            {doc.purchased_products?.product_name ||
                              doc.product_id}
                          </span>
                        )}
                      </div>

                      {doc.notes && (
                        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <strong>Notas:</strong> {doc.notes}
                        </div>
                      )}

                      {doc.verification_status === "rejected" &&
                        doc.rejection_reason && (
                          <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                            <strong className="text-red-600">
                              Motivo de rechazo:
                            </strong>{" "}
                            {doc.rejection_reason}
                          </div>
                        )}

                      <div className="flex items-center space-x-2 flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(doc.cloudinary_secure_url, "_blank")
                          }
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
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
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Descargar
                        </Button>

                        {doc.verification_status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() =>
                                setVerificationDialog({
                                  open: true,
                                  document: doc,
                                  action: "verified",
                                  rejectionReason: "",
                                })
                              }
                            >
                              ✅ Verificar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300"
                              onClick={() =>
                                setVerificationDialog({
                                  open: true,
                                  document: doc,
                                  action: "rejected",
                                  rejectionReason: "",
                                })
                              }
                            >
                              ❌ Rechazar
                            </Button>
                          </>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => handleDeleteDocument(doc)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {verificationDialog.action === "verified"
                ? "Verificar Documento"
                : "Rechazar Documento"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {verificationDialog.action === "verified"
                ? "¿Estás seguro de que quieres verificar este documento?"
                : "¿Estás seguro de que quieres rechazar este documento?"}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {verificationDialog.action === "rejected" && (
            <div className="space-y-2">
              <Label>Motivo del rechazo</Label>
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
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
              className={
                verificationDialog.action === "verified"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
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
