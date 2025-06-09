// app/api/cloudinary/delete/route.js
// o pages/api/cloudinary/delete.js si usas Pages Router

import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return Response.json({ error: "Public ID is required" }, { status: 400 });
    }

    // Eliminar de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    return Response.json({ success: true, result });
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return Response.json(
      { error: "Failed to delete from Cloudinary" },
      { status: 500 }
    );
  }
}
