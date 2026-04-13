import { useEffect, useState } from "react";
import {
    Materia,
    actualizarMateria,
    crearMateria,
    eliminarMateria,
    obtenerMaterias,
} from "../Services/firestoreService";

export const useMateria = (uid: string | null) => {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar materias al montar el componente o cuando cambia el UID
  useEffect(() => {
    if (!uid) {
      setMaterias([]);
      return;
    }

    const cargarMaterias = async () => {
      setLoading(true);
      setError(null);
      try {
        const materiasObtenidas = await obtenerMaterias(uid);
        setMaterias(materiasObtenidas);
      } catch (err: any) {
        setError(err.message);
        console.error("[HOOK ERROR] No se pudieron cargar materias:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarMaterias();
  }, [uid]);

  // Crear nueva materia
  const crear = async (materiaData: Omit<Materia, "id" | "creadaEn">) => {
    if (!uid) {
      setError("Usuario no autenticado");
      return null;
    }

    try {
      setError(null);
      const nuevoId = await crearMateria(uid, materiaData);

      // Agregar la nueva materia a la lista
      const nuevaMateria: Materia = {
        id: nuevoId,
        ...materiaData,
        creadaEn: new Date(),
      };

      setMaterias([nuevaMateria, ...materias]);
      return nuevoId;
    } catch (err: any) {
      setError(err.message);
      console.error("[HOOK ERROR] No se pudo crear materia:", err);
      return null;
    }
  };

  // Actualizar materia
  const actualizar = async (materiaId: string, updates: Partial<Materia>) => {
    if (!uid) {
      setError("Usuario no autenticado");
      return false;
    }

    try {
      setError(null);
      await actualizarMateria(uid, materiaId, updates);

      // Actualizar en la lista local
      setMaterias(
        materias.map((m) => (m.id === materiaId ? { ...m, ...updates } : m)),
      );
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error("[HOOK ERROR] No se pudo actualizar materia:", err);
      return false;
    }
  };

  // Eliminar materia
  const eliminar = async (materiaId: string) => {
    if (!uid) {
      setError("Usuario no autenticado");
      return false;
    }

    try {
      setError(null);
      await eliminarMateria(uid, materiaId);

      // Remover de la lista local
      setMaterias(materias.filter((m) => m.id !== materiaId));
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error("[HOOK ERROR] No se pudo eliminar materia:", err);
      return false;
    }
  };

  return {
    materias,
    loading,
    error,
    crear,
    actualizar,
    eliminar,
  };
};
