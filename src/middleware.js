// middleware.js - Versión para pruebas
import { NextResponse } from "next/server";

export async function middleware(req) {
  // Simplemente permite todas las solicitudes para probar
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
