import React, { useState, useCallback } from "react";
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
} from "lucide-react";

export default function DocumentUploadSystem() {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Comprobante_Pago_Juan_Cuota_3.jpg",
      type: "comprobante_pago",
      clientName: "Juan Pérez",
      loanId: "LOAN001",
      amount: 25000,
      uploadDate: "2025-06-05",
      fileSize: "2.3 MB",
      status: "verified",
      notes: "Pago de cuota #3 - Transferencia Bancaria",
    },
    {
      id: 2,
      name: "Captura_Pago_Maria_Inicial.png",
      type: "comprobante_pago",
      clientName: "María González",
      loanId: "LOAN015",
      amount: 50000,
      uploadDate: "2025-06-04",
      fileSize: "1.8 MB",
      status: "pending",
      notes: "Pago inicial del préstamo",
    },
    {
      id: 3,
      name: "Recibo_Carlos_Cuota_Final.jpg",
      type: "comprobante_pago",
      clientName: "Carlos Ruiz",
      loanId: "LOAN008",
      amount: 32500,
      uploadDate: "2025-06-03",
      fileSize: "3.1 MB",
      status: "verified",
      notes: "Última cuota - Préstamo completado",
    },
  ]);

  const [dragActive, setDragActive] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedLoan, setSelectedLoan] = useState("");
  const [uploadNotes, setUploadNotes] = useState("");

  const documentTypes = [
    {
      value: "comprobante_pago",
      label: "💰 Comprobante de Pago",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "dni_frontal",
      label: "🪪 DNI Frontal",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "dni_dorso",
      label: "🪪 DNI Dorso",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "recibo_sueldo",
      label: "💼 Recibo de Sueldo",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "cbu_cuenta",
      label: "🏦 CBU/Cuenta Bancaria",
      color: "bg-orange-100 text-orange-800",
    },
    {
      value: "contrato",
      label: "📋 Contrato Firmado",
      color: "bg-indigo-100 text-indigo-800",
    },
    {
      value: "otro",
      label: "📎 Otro Documento",
      color: "bg-gray-100 text-gray-800",
    },
  ];

  const clients = [
    { id: "1", name: "Juan Pérez" },
    { id: "2", name: "María González" },
    { id: "3", name: "Carlos Ruiz" },
    { id: "4", name: "Ana López" },
  ];

  const loans = [
    { id: "LOAN001", client: "Juan Pérez", amount: 100000 },
    { id: "LOAN015", client: "María González", amount: 150000 },
    { id: "LOAN008", client: "Carlos Ruiz", amount: 75000 },
  ];

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

  const handleFiles = (files) => {
    files.forEach((file) => {
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        console.log("Archivo a subir:", file.name);
        // Aquí integrarías con tu backend/storage
        // Simular upload exitoso
        const newDoc = {
          id: documents.length + 1,
          name: file.name,
          type: "comprobante_pago", // Por defecto
          clientName: selectedClient
            ? clients.find((c) => c.id === selectedClient)?.name
            : "Sin asignar",
          loanId: selectedLoan || "Sin asignar",
          amount: 0,
          uploadDate: new Date().toISOString().split("T")[0],
          fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          status: "pending",
          notes: uploadNotes || "Documento subido",
        };
        setDocuments((prev) => [newDoc, ...prev]);
      }
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verificado
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">⏳ Pendiente</Badge>
        );
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">❌ Rechazado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Sin revisar</Badge>;
    }
  };

  const getTypeInfo = (type) => {
    return (
      documentTypes.find((t) => t.value === type) ||
      documentTypes[documentTypes.length - 1]
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>📤 Subir Documento</CardTitle>
            <CardDescription>
              Arrastra archivos aquí o haz click para seleccionar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag & Drop Area */}
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
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Arrastra imágenes o PDFs aquí
              </p>
              <p className="text-sm text-gray-500 mb-4">
                JPG, PNG, PDF hasta 10MB
              </p>
              <Button
                onClick={() => document.getElementById("file-upload").click()}
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
            </div>

            {/* Pre-categorización */}
            <div className="space-y-3">
              <div>
                <Label>Cliente</Label>
                <Select
                  value={selectedClient}
                  onValueChange={setSelectedClient}
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
                <Label>Préstamo</Label>
                <Select value={selectedLoan} onValueChange={setSelectedLoan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar préstamo" />
                  </SelectTrigger>
                  <SelectContent>
                    {loans
                      .filter(
                        (loan) =>
                          !selectedClient ||
                          loan.client ===
                            clients.find((c) => c.id === selectedClient)?.name
                      )
                      .map((loan) => (
                        <SelectItem key={loan.id} value={loan.id}>
                          {loan.id} - {formatCurrency(loan.amount)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notas</Label>
                <Input
                  placeholder="Ej: Pago cuota #3, transferencia bancaria"
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>📋 Documentos Recientes</CardTitle>
            <CardDescription>
              Documentos subidos organizados por fecha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => {
                const typeInfo = getTypeInfo(doc.type);
                return (
                  <div
                    key={doc.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          {doc.name.toLowerCase().includes(".pdf") ? (
                            <FileText className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Image className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {doc.name}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {doc.clientName}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {doc.uploadDate}
                            </span>
                            <span>{doc.fileSize}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(doc.status)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={typeInfo.color}>
                          {typeInfo.label}
                        </Badge>
                        {doc.amount > 0 && (
                          <span className="flex items-center text-sm font-medium text-green-600">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {formatCurrency(doc.amount)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        Préstamo: {doc.loanId}
                      </span>
                    </div>

                    {doc.notes && (
                      <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                        <strong>Notas:</strong> {doc.notes}
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Descargar
                      </Button>
                      {doc.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            ✅ Verificar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300"
                          >
                            ❌ Rechazar
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{documents.length}</p>
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
                <p className="text-2xl font-bold">
                  {documents.filter((d) => d.status === "verified").length}
                </p>
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
                <p className="text-2xl font-bold">
                  {
                    documents.filter((d) => d.type === "comprobante_pago")
                      .length
                  }
                </p>
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
                <p className="text-2xl font-bold">
                  {
                    documents.filter(
                      (d) =>
                        d.uploadDate === new Date().toISOString().split("T")[0]
                    ).length
                  }
                </p>
                <p className="text-sm text-gray-600">Hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
