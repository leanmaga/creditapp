// src/lib/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

// Configuración del cliente de Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Función para subir archivos a Cloudinary
export const uploadToCloudinary = async (file, options = {}) => {
  try {
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

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Error uploading to Cloudinary");
    }

    const data = await response.json();
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

// Función para eliminar archivos de Cloudinary
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

export default cloudinary;
