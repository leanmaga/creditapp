// src/hooks/useDocuments.js - Versión corregida
import { useState, useEffect, useCallback } from "react";
import {
  fetchDocuments,
  createDocument,
  updateDocumentVerification,
  deleteDocument,
  getDocumentStats,
  searchDocuments,
} from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

// Funciones de Cloudinary simplificadas para evitar errores
const uploadToCloudinary = async (file, options = {}) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );

    if (options.folder) {
      formData.append("folder", options.folder);
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Error uploading to Cloudinary: ${response.status}`);
    }

    const data = await response.json();
    return {
      publicId: data.public_id,
      url: data.url,
      secureUrl: data.secure_url,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

const validateFile = (file, options = {}) => {
  const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB
  const allowedTypes = options.allowedTypes || ["image/", "application/pdf"];

  if (file.size > maxSize) {
    throw new Error(
      `El archivo es demasiado grande. Máximo ${Math.round(
        maxSize / 1024 / 1024
      )}MB`
    );
  }

  const isValidType = allowedTypes.some(
    (type) => file.type.startsWith(type) || file.type === type
  );
  if (!isValidType) {
    throw new Error(
      "Tipo de archivo no permitido. Solo se permiten imágenes y PDFs"
    );
  }

  return true;
};

const generateUniqueFileName = (originalName, clientId) => {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop();
  const baseName = originalName.split(".").slice(0, -1).join(".");

  return `${clientId}_${baseName}_${timestamp}_${randomString}.${extension}`;
};

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
  const [filters, setFilters] = useState({
    searchTerm: "",
    clientId: "",
    documentType: "",
    verificationStatus: "",
    ...initialFilters,
  });

  // Verificar configuración de Cloudinary
  const checkCloudinaryConfig = useCallback(() => {
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      console.error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME no está configurado");
      return false;
    }
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
      console.error("NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET no está configurado");
      return false;
    }
    return true;
  }, []);

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

        documentsData = await fetchDocuments(filterParams);
      }

      setDocuments(documentsData || []);
    } catch (error) {
      console.error("Error loading documents:", error);
      setDocuments([]);
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
      setStats(statsData || stats);
    } catch (error) {
      console.error("Error loading stats:", error);
      // No mostrar error aquí, usar valores por defecto
    }
  }, []);

  // Cargar datos iniciales
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadDocuments(), loadStats()]);
    } catch (error) {
      console.error("Error loading data:", error);
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

      // Verificar configuración de Cloudinary
      if (!checkCloudinaryConfig()) {
        throw new Error("Cloudinary no está configurado correctamente");
      }

      setIsUploading(true);

      try {
        // Validar archivo
        validateFile(file, {
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: ["image/", "application/pdf"],
        });

        // Generar nombre único
        const uniqueFileName = generateUniqueFileName(
          file.name,
          documentData.clientId
        );

        // Subir a Cloudinary
        const cloudinaryResult = await uploadToCloudinary(file, {
          folder: `prestamos-app/documents/${documentData.clientId}`,
        });

        // Crear documento en la base de datos
        const newDocumentData = {
          clientId: documentData.clientId,
          loanId: documentData.loanId || null,
          productId: documentData.productId || null,
          fileName: uniqueFileName,
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
    [loadDocuments, loadStats, toast, checkCloudinaryConfig]
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
        // Eliminar de la base de datos (la API route se encarga de Cloudinary)
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
      }
    },
    [loadDocuments, loadStats, toast]
  );

  // Subir múltiples archivos
  const uploadMultipleDocuments = useCallback(
    async (files, documentData) => {
      const results = [];
      const errors = [];

      setIsUploading(true);

      try {
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
        } else if (results.length > 0) {
          toast({
            title: "Archivos subidos",
            description: `${results.length} archivos subidos correctamente`,
          });
        }

        return { results, errors };
      } finally {
        setIsUploading(false);
      }
    },
    [uploadDocument, toast]
  );

  // Efectos
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadDocuments();
    }, 300); // Debounce para búsqueda

    return () => clearTimeout(timeoutId);
  }, [filters.searchTerm, filters.clientId, filters.verificationStatus]);

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
