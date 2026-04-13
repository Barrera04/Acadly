import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";

/**
 * Hook para obtener el UID del usuario autenticado
 * Se actualiza automáticamente cuando cambia el estado de autenticación
 */
export const useAuthUser = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        console.log("[AUTH] Usuario autenticado. UID:", user.uid);
      } else {
        setUid(null);
        console.log("[AUTH] Usuario no autenticado");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { uid, loading, error };
};
