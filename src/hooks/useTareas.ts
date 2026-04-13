import { useEffect, useState } from "react";
import {
    Tarea,
    actualizarTarea,
    crearTarea,
    eliminarTarea,
    marcarTareaCompletada,
    obtenerTareas,
    obtenerTodasLasTareas,
} from "../Services/firestoreService";

export const useTareas = (uid: string | null, materiaId?: string) => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar tareas al montar o cambiar materiaId
  useEffect(() => {
    if (!uid) {
      setTareas([]);
      return;
    }

    const cargarTareas = async () => {
      setLoading(true);
      setError(null);
      try {
        const tareasObtenidas = materiaId
          ? await obtenerTareas(uid, materiaId)
          : await obtenerTodasLasTareas(uid);
        setTareas(tareasObtenidas);
      } catch (err: any) {
        setError(err.message);
        console.error("[HOOK ERROR] No se pudieron cargar tareas:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarTareas();
  }, [uid, materiaId]);

  // Crear nueva tarea
  const crear = async (
    tareaData: Omit<Tarea, "id" | "creadaEn">,
    mId: string = materiaId || "",
  ) => {
    if (!uid || !mId) {
      setError("Datos incompletos para crear tarea");
      return null;
    }

    try {
      setError(null);
      const nuevoId = await crearTarea(uid, mId, tareaData);

      const nuevaTarea: Tarea = {
        id: nuevoId,
        ...tareaData,
        creadaEn: new Date(),
      };

      setTareas([...tareas, nuevaTarea]);
      return nuevoId;
    } catch (err: any) {
      setError(err.message);
      console.error("[HOOK ERROR] No se pudo crear tarea:", err);
      return null;
    }
  };

  // Actualizar tarea
  const actualizar = async (
    tareaId: string,
    updates: Partial<Tarea>,
    mId: string = materiaId || "",
  ) => {
    if (!uid || !mId) {
      setError("Datos incompletos para actualizar tarea");
      return false;
    }

    try {
      setError(null);
      await actualizarTarea(uid, mId, tareaId, updates);

      setTareas(
        tareas.map((t) => (t.id === tareaId ? { ...t, ...updates } : t)),
      );
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error("[HOOK ERROR] No se pudo actualizar tarea:", err);
      return false;
    }
  };

  // Marcar como completada
  const marcarCompletada = async (
    tareaId: string,
    completada: boolean,
    mId: string = materiaId || "",
  ) => {
    if (!uid || !mId) {
      setError("Datos incompletos para marcar tarea");
      return false;
    }

    try {
      setError(null);
      await marcarTareaCompletada(uid, mId, tareaId, completada);

      setTareas(
        tareas.map((t) =>
          t.id === tareaId
            ? {
                ...t,
                completada,
                estado: completada ? "completada" : "pendiente",
              }
            : t,
        ),
      );
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error("[HOOK ERROR] No se pudo marcar tarea:", err);
      return false;
    }
  };

  // Eliminar tarea
  const eliminar = async (tareaId: string, mId: string = materiaId || "") => {
    if (!uid || !mId) {
      setError("Datos incompletos para eliminar tarea");
      return false;
    }

    try {
      setError(null);
      await eliminarTarea(uid, mId, tareaId);

      setTareas(tareas.filter((t) => t.id !== tareaId));
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error("[HOOK ERROR] No se pudo eliminar tarea:", err);
      return false;
    }
  };

  return {
    tareas,
    loading,
    error,
    crear,
    actualizar,
    marcarCompletada,
    eliminar,
  };
};
