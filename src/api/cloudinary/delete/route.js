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

// Si usas Pages Router, usa este código en su lugar:
/*
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    // Eliminar de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return res.status(500).json({ error: 'Failed to delete from Cloudinary' });
  }
}
*/
