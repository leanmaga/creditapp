// src/lib/cloudinary.js
// Versión para cliente - Compatible con Next.js

// Función para subir archivos directamente a Cloudinary desde el cliente
export const uploadToCloudinary = async (file, options = {}) => {
  try {
    // Verificar que las variables de entorno existen
    if (
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    ) {
      throw new Error(
        "Cloudinary configuration missing. Please check your environment variables."
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );

    // Opciones adicionales
    if (options.folder) {
      formData.append("folder", options.folder);
    }

    if (options.publicId) {
      formData.append("public_id", options.publicId);
    }

    // Tags para organización
    const tags = ["prestamos-app", "documents"];
    if (options.tags) {
      tags.push(...options.tags);
    }
    formData.append("tags", tags.join(","));

    // Log para debugging
    console.log("Uploading to Cloudinary:", {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("Cloudinary response error:", {
        status: response.status,
        errorData,
        errorText,
      });
      throw new Error(
        `Error uploading to Cloudinary: ${response.status} - ${
          errorData?.error?.message || errorText
        }`
      );
    }

    const data = await response.json();
    console.log("Upload successful:", data);

    return {
      publicId: data.public_id,
      url: data.url,
      secureUrl: data.secure_url,
      format: data.format,
      bytes: data.bytes,
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

// Función para eliminar archivos usando API route
export const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error("Error deleting from Cloudinary");
    }

    return await response.json();
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

// Función para generar URLs de transformación
export const getTransformedUrl = (publicId, transformations = {}) => {
  const baseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

  const transformParams = [];

  if (transformations.width) transformParams.push(`w_${transformations.width}`);
  if (transformations.height)
    transformParams.push(`h_${transformations.height}`);
  if (transformations.crop) transformParams.push(`c_${transformations.crop}`);
  if (transformations.quality)
    transformParams.push(`q_${transformations.quality}`);
  if (transformations.format)
    transformParams.push(`f_${transformations.format}`);

  const transformString =
    transformParams.length > 0 ? `/${transformParams.join(",")}` : "";

  return `${baseUrl}${transformString}/${publicId}`;
};

// Función para optimizar imágenes automáticamente
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultTransformations = {
    quality: "auto",
    format: "auto",
    crop: "scale",
    ...options,
  };

  return getTransformedUrl(publicId, defaultTransformations);
};

// Función para crear thumbnails
export const getThumbnailUrl = (publicId, size = 150) => {
  return getTransformedUrl(publicId, {
    width: size,
    height: size,
    crop: "fill",
    quality: "auto",
    format: "auto",
  });
};

// Función para validar archivos antes de subirlos
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

// Función para generar nombre único de archivo
export const generateUniqueFileName = (originalName, clientId) => {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop();
  const baseName = originalName.split(".").slice(0, -1).join(".");

  return `${clientId}_${baseName}_${timestamp}_${randomString}.${extension}`;
};
