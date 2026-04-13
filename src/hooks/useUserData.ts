import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";

export interface UserData {
  username: string;
  correo: string;
  createdAt: Date | any;
}

/**
 * Hook para obtener datos del usuario desde Firestore
 */
export const useUserData = (uid: string | null) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setUserData(null);
      return;
    }

    const obtenerDatos = async () => {
      setLoading(true);
      setError(null);
      try {
        const userDoc = await getDoc(doc(db, "users", uid));

        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);
          console.log("[USER DATA] Datos del usuario obtenidos:", data);
        } else {
          console.log("[USER DATA] El documento del usuario no existe");
          setUserData(null);
        }
      } catch (err: any) {
        setError(err.message);
        console.error("[USER DATA ERROR]", err);
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
  }, [uid]);

  return { userData, loading, error };
};
