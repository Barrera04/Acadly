import { useEffect, useState } from "react";
import {
    obtenerPerfilUsuario,
    UserProfile,
} from "../Services/firestoreService";

/**
 * Hook para obtener el perfil del usuario autenticado
 */
export const useUserProfile = (uid: string | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const userProfile = await obtenerPerfilUsuario(uid);
        setProfile(userProfile);
      } catch (err: any) {
        console.error("[HOOK ERROR] Error al obtener perfil:", err);
        setError(err.message || "Error al obtener perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [uid]);

  return { profile, loading, error };
};
