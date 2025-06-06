// utils/auth-redirects.js
/**
 * Obtiene la URL base de la aplicación
 */
export function getBaseUrl() {
  // En producción, usar la variable de entorno
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // En desarrollo o como fallback, usar window.location.origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Fallback para server-side
  return "http://localhost:3000";
}

/**
 * URLs de redirección para diferentes flujos de auth
 */
export const AUTH_REDIRECTS = {
  resetPassword: () => `${getBaseUrl()}/reset-password`,
  confirmEmail: () => `${getBaseUrl()}/confirm-email`,
  registroExitoso: () => `${getBaseUrl()}/registro-exitoso`,
};

/**
 * Configuración para resetPasswordForEmail
 */
export function getResetPasswordConfig() {
  return {
    redirectTo: AUTH_REDIRECTS.resetPassword(),
  };
}

/**
 * Configuración para updateUser (cambio de email)
 */
export function getEmailUpdateConfig() {
  return {
    redirectTo: AUTH_REDIRECTS.confirmEmail(),
  };
}
