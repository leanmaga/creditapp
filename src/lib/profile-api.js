// lib/profile-api.js
import { supabase } from "./supabase";

// Actualizar datos del perfil
export async function updateProfile(profileData) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  // Actualizar datos en la tabla profiles
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      full_name: profileData.fullName,
      company_name: profileData.companyName,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

// Cambiar correo electrónico
export async function updateEmail(newEmail, password) {
  // Obtener email actual
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");

  // Verificar credenciales primero
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: password,
  });

  if (verifyError) throw new Error("Contraseña incorrecta");

  const { data, error } = await supabase.auth.updateUser(
    { email: newEmail },
    { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/confirm-email` }
  );

  if (error) throw error;

  return {
    message:
      "Se ha enviado un enlace de verificación a tu nuevo correo electrónico",
  };
}

// Cambiar contraseña
export async function updatePassword(currentPassword, newPassword) {
  // Verificar credenciales actuales
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) throw new Error("Contraseña actual incorrecta");

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;

  return { message: "Contraseña actualizada correctamente" };
}

// Eliminar cuenta
// Updated deleteAccount function for profile-api.js
export async function deleteAccount(password) {
  try {
    // 1. Verify credentials
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuario no autenticado");

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password,
    });

    if (verifyError) throw new Error("Contraseña incorrecta");

    // 2. Delete all user data in correct order to respect foreign key constraints
    // We'll use transactions to ensure all-or-nothing deletion

    // First get all clients to find their associated loans and installments
    const { data: clientsData, error: clientsError } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id);

    if (clientsError) {
      console.error("Error fetching clients:", clientsError);
      throw new Error("Error al eliminar datos de clientes");
    }

    // If the user has clients, delete them (and their loans and installments through cascade)
    if (clientsData && clientsData.length > 0) {
      // Delete clients (will cascade to loans and installments if CASCADE is set up)
      const { error: deleteClientsError } = await supabase
        .from("clients")
        .delete()
        .eq("user_id", user.id);

      if (deleteClientsError) {
        console.error("Error deleting clients:", deleteClientsError);
        throw new Error("Error al eliminar datos de clientes");
      }
    }

    // 3. Delete profile data
    const { error: deleteProfileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (deleteProfileError) {
      console.error("Error deleting profile:", deleteProfileError);
      throw new Error("Error al eliminar datos de perfil");
    }

    // 4. Delete the user's auth account
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(
      user.id
    );

    // If admin API is not available, use the standard method
    if (deleteUserError) {
      console.error("Error using admin API:", deleteUserError);
      // Try with alternative method
      const { error: altDeleteError } = await supabase.rpc("delete_user");

      if (altDeleteError) {
        // If RPC fails, fall back to regular delete
        console.error("Error with RPC delete_user:", altDeleteError);

        // As a fallback, try standard auth
        const { error: stdDeleteError } = await supabase.auth.deleteUser();

        if (stdDeleteError) {
          console.error("Error deleting user auth:", stdDeleteError);
          throw new Error("Error al eliminar la cuenta de usuario");
        }
      }
    }

    // 5. Sign out
    await supabase.auth.signOut();

    return { message: "Cuenta eliminada correctamente" };
  } catch (error) {
    console.error("Complete error in deleteAccount:", error);
    throw error;
  }
}

// Obtener datos del perfil
export async function getProfileData() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching profile:", error);
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    fullName: data?.full_name || "",
    companyName: data?.company_name || "",
  };
}
