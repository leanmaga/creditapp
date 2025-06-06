// src/hooks/useDocuments.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  createDocument,
  fetchDocuments,
  updateDocumentVerification,
  deleteDocument,
  getDocumentStats,
} from "@/lib/api-client";
// Hook para cargar funciones de Cloudinary dinámicamente
const useCloudinaryFunctions = () => {
  const [cloudinaryFunctions, setCloudinaryFunctions] = useState(null);

  useEffect(() => {
    const loadCloudinaryFunctions = async () => {
      try {
        const functions = await import("@/lib/cloudinary");
        setCloudinaryFunctions(functions);
      } catch (error) {
        console.warn("Cloudinary no disponible, usando funciones de respaldo");
        try {
          const fallbackFunctions = await import("@/lib/cloudinary-fallback");
          setCloudinaryFunctions(fallbackFunctions);
        } catch (fallbackError) {
          console.error("Error cargando funciones de respaldo:", fallbackError);
          // Usar implementaciones mínimas inline
          setCloudinaryFunctions({
            uploadToCloudinary: async () => ({
              publicId: "mock",
              url: "mock",
              secureUrl: "mock",
            }),
            deleteFromCloudinary: async () => ({ success: true }),
            validateFile: () => true,
            generateUniqueFileName: (name) => `mock_${name}`,
          });
        }
      }
    };

    loadCloudinaryFunctions();
  }, []);

  return cloudinaryFunctions;
};

// 🔧 CORRECCIÓN: Mantener la función de corrección de stats si es necesaria
// Esta función ya está incluida en api-client.js, pero la mantenemos aquí por compatibilidad

export const useDocuments = () => {
  const { toast } = useToast();
  const cloudinaryFunctions = useCloudinaryFunctions();

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
  const [filters, setFilters] = useState({
    clientId: "",
    loanId: "",
    productId: "",
    documentType: "",
    verificationStatus: "",
    searchTerm: "",
    dateFrom: "",
    dateTo: "",
  });

  // No continuar si las funciones de Cloudinary no están cargadas
  const isReady = cloudinaryFunctions !== null;

  // Cargar documentos inicial
  useEffect(() => {
    loadDocuments();
    loadStats();
  }, []);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    loadDocuments();
  }, [filters]);

  // Funciones de carga
  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchDocuments(filters);
      setDocuments(data);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los documentos",
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await getDocumentStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }, []);

  // Subir documento único
  const uploadDocument = useCallback(
    async (file, metadata) => {
      if (!isReady) {
        throw new Error("Sistema de archivos no está listo");
      }

      try {
        setIsUploading(true);

        // Validar archivo
        cloudinaryFunctions.validateFile(file, {
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: ["image/", "application/pdf"],
        });

        // Generar nombre único
        const uniqueFileName = cloudinaryFunctions.generateUniqueFileName(
          file.name,
          metadata.clientId
        );

        // Subir a Cloudinary
        const uploadResult = await cloudinaryFunctions.uploadToCloudinary(
          file,
          {
            folder: `prestamos-app/documents/${metadata.clientId}`,
            publicId: uniqueFileName,
            tags: [
              "prestamos-app",
              "documents",
              metadata.documentType,
              metadata.clientId,
            ],
          }
        );

        // Crear documento en la base de datos
        const documentData = {
          clientId: metadata.clientId,
          loanId: metadata.loanId || null,
          productId: metadata.productId || null,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          cloudinaryPublicId: uploadResult.publicId,
          cloudinaryUrl: uploadResult.url,
          cloudinarySecureUrl: uploadResult.secureUrl,
          documentType: metadata.documentType,
          amount: metadata.amount ? parseFloat(metadata.amount) : null,
          paymentDate: metadata.paymentDate || null,
          notes: metadata.notes || null,
        };

        const newDocument = await createDocument(documentData);

        // Actualizar lista de documentos y stats
        await loadDocuments();
        await loadStats();

        toast({
          title: "Documento subido",
          description: `${file.name} se ha subido correctamente`,
        });

        return newDocument;
      } catch (error) {
        console.error("Error uploading document:", error);
        toast({
          variant: "destructive",
          title: "Error al subir documento",
          description: error.message || "No se pudo subir el documento",
        });
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [isReady, cloudinaryFunctions, loadDocuments, loadStats, toast]
  );

  // Subir múltiples documentos
  const uploadMultipleDocuments = useCallback(
    async (files, metadata) => {
      try {
        setIsUploading(true);
        const results = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            const result = await uploadDocument(file, metadata);
            results.push(result);
          } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
            // Continuar con el siguiente archivo
          }
        }

        if (results.length > 0) {
          toast({
            title: "Documentos subidos",
            description: `Se subieron ${results.length} de ${files.length} documentos correctamente`,
          });
        }

        return results;
      } catch (error) {
        console.error("Error uploading multiple documents:", error);
        toast({
          variant: "destructive",
          title: "Error al subir documentos",
          description: error.message || "No se pudieron subir los documentos",
        });
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [uploadDocument, toast]
  );

  // Verificar documento
  const verifyDocument = useCallback(
    async (documentId, action, rejectionReason = null) => {
      try {
        const verificationData = {
          status: action,
          rejectionReason,
        };

        await updateDocumentVerification(documentId, verificationData);

        // Recargar documentos y stats
        await loadDocuments();
        await loadStats();

        toast({
          title:
            action === "verified"
              ? "Documento verificado"
              : "Documento rechazado",
          description: `El documento ha sido ${
            action === "verified" ? "verificado" : "rechazado"
          } correctamente`,
        });
      } catch (error) {
        console.error("Error verifying document:", error);
        toast({
          variant: "destructive",
          title: "Error al verificar documento",
          description: error.message || "No se pudo verificar el documento",
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
        // Eliminar de Cloudinary si está disponible
        if (isReady && document.cloudinary_public_id) {
          try {
            await cloudinaryFunctions.deleteFromCloudinary(
              document.cloudinary_public_id
            );
          } catch (cloudinaryError) {
            console.warn("Error deleting from Cloudinary:", cloudinaryError);
            // Continuar con la eliminación de la base de datos
          }
        }

        // Eliminar de la base de datos
        await deleteDocument(document.id);

        // Recargar documentos y stats
        await loadDocuments();
        await loadStats();

        toast({
          title: "Documento eliminado",
          description: "El documento ha sido eliminado correctamente",
        });
      } catch (error) {
        console.error("Error removing document:", error);
        toast({
          variant: "destructive",
          title: "Error al eliminar documento",
          description: error.message || "No se pudo eliminar el documento",
        });
        throw error;
      }
    },
    [isReady, cloudinaryFunctions, loadDocuments, loadStats, toast]
  );

  // Buscar documentos
  const searchDocuments = useCallback(
    async (searchTerm) => {
      try {
        setFilters((prev) => ({ ...prev, searchTerm }));
      } catch (error) {
        console.error("Error searching documents:", error);
        toast({
          variant: "destructive",
          title: "Error en la búsqueda",
          description: "No se pudo realizar la búsqueda",
        });
      }
    },
    [toast]
  );

  // Filtrar por cliente
  const filterByClient = useCallback((clientId) => {
    setFilters((prev) => ({ ...prev, clientId }));
  }, []);

  // Filtrar por tipo
  const filterByType = useCallback((documentType) => {
    setFilters((prev) => ({ ...prev, documentType }));
  }, []);

  // Filtrar por estado
  const filterByStatus = useCallback((verificationStatus) => {
    setFilters((prev) => ({ ...prev, verificationStatus }));
  }, []);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      clientId: "",
      loanId: "",
      productId: "",
      documentType: "",
      verificationStatus: "",
      searchTerm: "",
      dateFrom: "",
      dateTo: "",
    });
  }, []);

  // Recargar todo
  const refresh = useCallback(async () => {
    await loadDocuments();
    await loadStats();
  }, [loadDocuments, loadStats]);

  return {
    // Estados
    documents,
    stats,
    isLoading,
    isUploading,
    isReady,
    filters,

    // Setters
    setFilters,

    // Funciones principales
    uploadDocument,
    uploadMultipleDocuments,
    verifyDocument,
    removeDocument,

    // Funciones de búsqueda y filtrado
    searchDocuments,
    filterByClient,
    filterByType,
    filterByStatus,
    clearFilters,

    // Funciones de utilidad
    refresh,
    loadDocuments,
    loadStats,
  };
};
