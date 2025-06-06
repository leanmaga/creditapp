// src/lib/cloudinary-fallback.js
// Funciones de respaldo en caso de que Cloudinary no esté configurado

export const uploadToCloudinary = async (file, options = {}) => {
  // Simulación de subida para desarrollo
  console.warn("Cloudinary no configurado, usando simulación");

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        publicId: `mock_${Date.now()}_${file.name}`,
        url: URL.createObjectURL(file),
        secureUrl: URL.createObjectURL(file),
        format: file.type.split("/")[1],
        bytes: file.size,
        width: 800,
        height: 600,
      });
    }, 1000);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  console.warn("Cloudinary delete - usando simulación");
  return { success: true, message: "Simulación de eliminación" };
};

export const validateFile = (file, options = {}) => {
  const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB por defecto
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

export const generateUniqueFileName = (originalName, clientId) => {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop();
  const baseName = originalName.split(".").slice(0, -1).join(".");

  return `${clientId}_${baseName}_${timestamp}_${randomString}.${extension}`;
};

export const getTransformedUrl = (publicId, transformations = {}) => {
  // Para desarrollo, retornar URL básica
  return publicId;
};

export const getOptimizedImageUrl = (publicId, options = {}) => {
  return publicId;
};

export const getThumbnailUrl = (publicId, size = 150) => {
  return publicId;
};
