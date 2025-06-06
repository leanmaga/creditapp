// src/hooks/useDocuments.js
import { useState, useEffect, useCallback } from "react";
import {
  fetchDocuments,
  createDocument,
  updateDocumentVerification,
  deleteDocument,
  getDocumentStats,
  searchDocuments,
} from "@/lib/api-client";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { useToast } from "@/hooks/use-toast";

export function useDocuments(initialFilters = {}) {
  const { toast } = useToast();

  // Estados
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    verifiedDocuments: 0,
    pendingDocuments: 0,
    rejectedDocuments: 0,
    paymentReceipts: 0,
    todayUploads: 0,
    totalStorageUsed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [filters, setFilters] = useState(initialFilters);

  // Cargar documentos
  const loadDocuments = useCallback(async () => {
    try {
      let documentsData;

      if (filters.searchTerm?.trim()) {
        documentsData = await searchDocuments(filters.searchTerm);
      } else {
        const filterParams = {};
        if (filters.clientId) filterParams.clientId = filters.clientId;
        if (filters.documentType)
          filterParams.documentType = filters.documentType;
        if (filters.verificationStatus)
          filterParams.verificationStatus = filters.verificationStatus;
        if (filters.dateFrom) filterParams.dateFrom = filters.dateFrom;
        if (filters.dateTo) filterParams.dateTo = filters.dateTo;

        documentsData = await fetchDocuments(filterParams);
      }

      setDocuments(documentsData);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los documentos",
      });
    }
  }, [filters, toast]);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    try {
      const statsData = await getDocumentStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }, []);

  // Cargar datos iniciales
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadDocuments(), loadStats()]);
    } finally {
      setIsLoading(false);
    }
  }, [loadDocuments, loadStats]);

  // Subir archivo
  const uploadDocument = useCallback(
    async (file, documentData) => {
      if (!documentData.clientId) {
        throw new Error("Cliente es requerido");
      }

      setIsUploading(true);

      try {
        // Validar tipo de archivo
        if (
          !file.type.startsWith("image/") &&
          file.type !== "application/pdf"
        ) {
          throw new Error("Solo se permiten imágenes y archivos PDF");
        }

        // Validar tamaño (10MB máximo)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("El archivo es demasiado grande. Máximo 10MB");
        }

        // Subir a Cloudinary
        const cloudinaryResult = await uploadToCloudinary(file, {
          folder: `prestamos-app/documents/${documentData.clientId}`,
          tags: [documentData.documentType, "documents"],
        });

        // Crear documento en la base de datos
        const newDocumentData = {
          clientId: documentData.clientId,
          loanId: documentData.loanId || null,
          productId: documentData.productId || null,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          cloudinaryPublicId: cloudinaryResult.publicId,
          cloudinaryUrl: cloudinaryResult.url,
          cloudinarySecureUrl: cloudinaryResult.secureUrl,
          documentType: documentData.documentType,
          amount: documentData.amount ? parseFloat(documentData.amount) : null,
          paymentDate: documentData.paymentDate || null,
          notes: documentData.notes || null,
        };

        const newDocument = await createDocument(newDocumentData);

        // Recargar datos
        await Promise.all([loadDocuments(), loadStats()]);

        toast({
          title: "Archivo subido",
          description: `${file.name} se ha subido correctamente`,
        });

        return newDocument;
      } catch (error) {
        console.error("Error uploading document:", error);
        toast({
          variant: "destructive",
          title: "Error al subir archivo",
          description: error.message || "No se pudo subir el archivo",
        });
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [loadDocuments, loadStats, toast]
  );

  // Verificar documento
  const verifyDocument = useCallback(
    async (documentId, action, rejectionReason = null) => {
      try {
        const verificationData = {
          status: action,
          rejectionReason: action === "rejected" ? rejectionReason : null,
        };

        await updateDocumentVerification(documentId, verificationData);

        // Recargar datos
        await Promise.all([loadDocuments(), loadStats()]);

        toast({
          title: "Documento actualizado",
          description: `El documento ha sido ${
            action === "verified" ? "verificado" : "rechazado"
          }`,
        });
      } catch (error) {
        console.error("Error updating verification:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo actualizar el documento",
        });
        throw error;
      }
    },
    [loadDocuments, loadStats, toast]
  );

  // Eliminar documento
  const removeDocument = useCallback(
    async (document) => {
      try {
        // Eliminar de Cloudinary
        await deleteFromCloudinary(document.cloudinary_public_id);

        // Eliminar de la base de datos
        await deleteDocument(document.id);

        // Recargar datos
        await Promise.all([loadDocuments(), loadStats()]);

        toast({
          title: "Documento eliminado",
          description: "El documento ha sido eliminado correctamente",
        });
      } catch (error) {
        console.error("Error deleting document:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar el documento",
        });
        throw error;
      }
    },
    [loadDocuments, loadStats, toast]
  );

  // Subir múltiples archivos
  const uploadMultipleDocuments = useCallback(
    async (files, documentData) => {
      const results = [];
      const errors = [];

      for (const file of files) {
        try {
          const result = await uploadDocument(file, documentData);
          results.push(result);
        } catch (error) {
          errors.push({ file: file.name, error: error.message });
        }
      }

      if (errors.length > 0) {
        toast({
          variant: "destructive",
          title: "Algunos archivos no se pudieron subir",
          description: `${errors.length} de ${files.length} archivos fallaron`,
        });
      }

      return { results, errors };
    },
    [uploadDocument, toast]
  );

  // Efectos
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [filters]);

  return {
    // Estados
    documents,
    stats,
    isLoading,
    isUploading,
    filters,

    // Acciones
    setFilters,
    uploadDocument,
    uploadMultipleDocuments,
    verifyDocument,
    removeDocument,
    loadDocuments,
    loadStats,
    loadData,
  };
}
