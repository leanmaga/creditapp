// middleware.js
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Rutas públicas que no requieren autenticación
  const publicPaths = [
    "/",
    "/registro",
    "/registro-exitoso",
    "/confirm-email",
    "/reset-password",
  ];

  const isPublicPath = publicPaths.some(
    (path) =>
      req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(path)
  );

  // Si es una ruta pública, permitir acceso
  if (isPublicPath) {
    return res;
  }

  // Si no hay sesión y no es ruta pública, redirigir al login
  if (!session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
