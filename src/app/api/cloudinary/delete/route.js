// src/app/api/cloudinary/delete/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID is required" },
        { status: 400 }
      );
    }

    // Hacer la eliminación usando la REST API de Cloudinary
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Crear la firma para autenticación
    const crypto = require("crypto");
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
    const signature = crypto
      .createHash("sha1")
      .update(stringToSign)
      .digest("hex");

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("timestamp", timestamp.toString());
    formData.append("api_key", process.env.CLOUDINARY_API_KEY);
    formData.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

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
