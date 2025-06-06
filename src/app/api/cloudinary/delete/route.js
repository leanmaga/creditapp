// src/app/api/cloudinary/delete/route.js
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID is required" },
        { status: 400 }
      );
    }

    // Eliminar archivo de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return NextResponse.json({
        success: true,
        message: "File deleted successfully",
        result,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to delete file", result },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
