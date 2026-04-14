import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

// ========================
// TIPOS / INTERFACES
// ========================

export interface Materia {
  id?: string;
  nombre: string;
  profesor: string;
  semestre: number;
  color: string;
  horario?: Array<{
    dia: string;
    inicio: string;
    fin: string;
  }>;
  creadaEn: Timestamp | Date;
}

export interface Tarea {
  id?: string;
  titulo: string;
  descripcion: string;
  fechaEntrega: Timestamp | Date;
  completada: boolean;
  estado: "pendiente" | "en-progreso" | "completada";
  creadaEn: Timestamp | Date;
}

/**
 * Helper: asegurarse que el usuario haya verificado su correo en Firestore
 */
export const ensureEmailVerified = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    const data = userSnap.exists() ? (userSnap.data() as any) : null;
    if (!data || !data.emailVerified) {
      const err: any = new Error("EMAIL_NOT_VERIFIED: El usuario no ha verificado su correo");
      err.code = "auth/email-not-verified";
      throw err;
    }
  } catch (error) {
    throw error;
  }
};

// ========================
// SERVICIOS - MATERIAS
// ========================

/**
 * Crear una nueva materia para el usuario autenticado
 */
export const crearMateria = async (
  uid: string,
  materiaData: Omit<Materia, "id" | "creadaEn">,
): Promise<string> => {
  try {
    await ensureEmailVerified(uid);
    const docRef = await addDoc(collection(db, "users", uid, "materias"), {
      ...materiaData,
      creadaEn: Timestamp.now(),
    });
    console.log("[FIRESTORE] Materia creada con ID:", docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error("[FIRESTORE ERROR] No se pudo crear materia:", error.message);
    throw error;
  }
};

/**
 * Obtener todas las materias del usuario autenticado
 */
export const obtenerMaterias = async (uid: string): Promise<Materia[]> => {
  try {
    const q = query(
      collection(db, "users", uid, "materias"),
      orderBy("creadaEn", "desc"),
    );
    const querySnapshot = await getDocs(q);

    const materias: Materia[] = [];
    querySnapshot.forEach((docSnapshot) => {
      materias.push({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<Materia, "id">),
      });
    });

    console.log("[FIRESTORE] Materias obtenidas:", materias.length);
    return materias;
  } catch (error: any) {
    console.error(
      "[FIRESTORE ERROR] No se pudieron obtener materias:",
      error.message,
    );
    throw error;
  }
};

/**
 * Actualizar una materia existente
 */
export const actualizarMateria = async (
  uid: string,
  materiaId: string,
  updates: Partial<Materia>,
): Promise<void> => {
  try {
    await ensureEmailVerified(uid);
    const docRef = doc(db, "users", uid, "materias", materiaId);
    await updateDoc(docRef, updates);
    console.log("[FIRESTORE] Materia actualizada:", materiaId);
  } catch (error: any) {
    console.error(
      "[FIRESTORE ERROR] No se pudo actualizar materia:",
      error.message,
    );
    throw error;
  }
};

/**
 * Eliminar una materia
 */
export const eliminarMateria = async (
  uid: string,
  materiaId: string,
): Promise<void> => {
  try {
    await ensureEmailVerified(uid);
    const docRef = doc(db, "users", uid, "materias", materiaId);
    await deleteDoc(docRef);
    console.log("[FIRESTORE] Materia eliminada:", materiaId);
  } catch (error: any) {
    console.error(
      "[FIRESTORE ERROR] No se pudo eliminar materia:",
      error.message,
    );
    throw error;
  }
};

// ========================
// SERVICIOS - TAREAS
// ========================

/**
 * Crear una nueva tarea dentro de una materia
 */
export const crearTarea = async (
  uid: string,
  materiaId: string,
  tareaData: Omit<Tarea, "id" | "creadaEn">,
): Promise<string> => {
  try {
    await ensureEmailVerified(uid);
    const docRef = await addDoc(
      collection(db, "users", uid, "materias", materiaId, "tareas"),
      {
        ...tareaData,
        creadaEn: Timestamp.now(),
      },
    );
    console.log("[FIRESTORE] Tarea creada con ID:", docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error("[FIRESTORE ERROR] No se pudo crear tarea:", error.message);
    throw error;
  }
};

/**
 * Obtener todas las tareas de una materia
 */
export const obtenerTareas = async (
  uid: string,
  materiaId: string,
): Promise<Tarea[]> => {
  try {
    const q = query(
      collection(db, "users", uid, "materias", materiaId, "tareas"),
      orderBy("fechaEntrega", "asc"),
    );
    const querySnapshot = await getDocs(q);

    const tareas: Tarea[] = [];
    querySnapshot.forEach((docSnapshot) => {
      tareas.push({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<Tarea, "id">),
      });
    });

    console.log("[FIRESTORE] Tareas obtenidas:", tareas.length);
    return tareas;
  } catch (error: any) {
    console.error(
      "[FIRESTORE ERROR] No se pudieron obtener tareas:",
      error.message,
    );
    throw error;
  }
};

/**
 * Obtener todas las tareas de TODAS las materias del usuario
 * (útil para NextHomework y TODOHomeworks)
 */
export const obtenerTodasLasTareas = async (uid: string): Promise<Tarea[]> => {
  try {
    const materiasSnapshot = await getDocs(
      collection(db, "users", uid, "materias"),
    );

    const todasLasTareas: Tarea[] = [];

    for (const materiaDoc of materiasSnapshot.docs) {
      const tareasSnapshot = await getDocs(
        collection(db, "users", uid, "materias", materiaDoc.id, "tareas"),
      );

      tareasSnapshot.forEach((tareaDoc) => {
        todasLasTareas.push({
          id: tareaDoc.id,
          ...(tareaDoc.data() as Omit<Tarea, "id">),
        });
      });
    }

    // Ordenar por fecha de entrega
    todasLasTareas.sort((a, b) => {
      const dateA =
        a.fechaEntrega instanceof Timestamp
          ? a.fechaEntrega.toDate()
          : new Date(a.fechaEntrega);
      const dateB =
        b.fechaEntrega instanceof Timestamp
          ? b.fechaEntrega.toDate()
          : new Date(b.fechaEntrega);
      return dateA.getTime() - dateB.getTime();
    });

    console.log(
      "[FIRESTORE] Todas las tareas obtenidas:",
      todasLasTareas.length,
    );
    return todasLasTareas;
  } catch (error: any) {
    console.error(
      "[FIRESTORE ERROR] No se pudieron obtener todas las tareas:",
      error.message,
    );
    throw error;
  }
};

/**
 * Actualizar una tarea existente
 */
export const actualizarTarea = async (
  uid: string,
  materiaId: string,
  tareaId: string,
  updates: Partial<Tarea>,
): Promise<void> => {
  try {
    await ensureEmailVerified(uid);
    const docRef = doc(
      db,
      "users",
      uid,
      "materias",
      materiaId,
      "tareas",
      tareaId,
    );
    await updateDoc(docRef, updates);
    console.log("[FIRESTORE] Tarea actualizada:", tareaId);
  } catch (error: any) {
    console.error(
      "[FIRESTORE ERROR] No se pudo actualizar tarea:",
      error.message,
    );
    throw error;
  }
};

/**
 * Marcar tarea como completada
 */
export const marcarTareaCompletada = async (
  uid: string,
  materiaId: string,
  tareaId: string,
  completada: boolean,
): Promise<void> => {
  try {
    await ensureEmailVerified(uid);
    await actualizarTarea(uid, materiaId, tareaId, {
      completada,
      estado: completada ? "completada" : "pendiente",
    });
    console.log(
      "[FIRESTORE] Tarea marcada como:",
      completada ? "completada" : "pendiente",
    );
  } catch (error: any) {
    console.error("[FIRESTORE ERROR] No se pudo marcar tarea:", error.message);
    throw error;
  }
};

/**
 * Eliminar una tarea
 */
export const eliminarTarea = async (
  uid: string,
  materiaId: string,
  tareaId: string,
): Promise<void> => {
  try {
    await ensureEmailVerified(uid);
    const docRef = doc(
      db,
      "users",
      uid,
      "materias",
      materiaId,
      "tareas",
      tareaId,
    );
    await deleteDoc(docRef);
    console.log("[FIRESTORE] Tarea eliminada:", tareaId);
  } catch (error: any) {
    console.error(
      "[FIRESTORE ERROR] No se pudo eliminar tarea:",
      error.message,
    );
    throw error;
  }
};

// ========================
// SERVICIOS - USUARIO
// ========================

// Perfil público básico del usuario almacenado en /users/{uid}
// NOTA: Se añadió el campo `emailVerified` (boolean) para reflejar
// si el usuario ya confirmó su correo en Firebase Auth.
export interface UserProfile {
  username: string;
  correo: string;
  createdAt: Timestamp | Date;
  // `emailVerified` se usa en reglas y en el cliente para permitir
  // operaciones que requieren correo verificado (ej. crear/editar datos).
  emailVerified?: boolean;
}

/**
 * Obtener datos del perfil de usuario
 */
export const obtenerPerfilUsuario = async (
  uid: string,
): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, "users", uid);
    const userDoc = await getDoc(docRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    } else {
      console.log("[FIRESTORE] Usuario no encontrado:", uid);
      return null;
    }
  } catch (error: any) {
    console.error(
      "[FIRESTORE ERROR] No se pudo obtener perfil:",
      error.message,
    );
    throw error;
  }
};

/**
 * Crear perfil de usuario si no existe (usado para OAuth como Google Sign-In)
 */
/**
 * Crear perfil en Firestore si no existe.
 * Cambios añadidos:
 * - Nuevo parámetro opcional `isVerified` (boolean) para guardar
 *   el estado inicial de `emailVerified` al crear el documento.
 * - Guarda `emailVerified` en el documento para que las reglas
 *   y la lógica client-side puedan basarse en él.
 */
export const crearPerfilUsuarioSiNoExiste = async (
  uid: string,
  correo: string,
  username?: string,
  isVerified: boolean = false,
): Promise<void> => {
  try {
    const docRef = doc(db, "users", uid);
    const userDoc = await getDoc(docRef);

    if (!userDoc.exists()) {
      const nombre = username?.trim() || (correo ? correo.split("@")[0] : "Usuario");
      // Guardamos `emailVerified` explícitamente (puede venir de Google Sign-In
      // o del flujo de verificación por email). Esto permite imponer reglas
      // de seguridad basadas en este campo y evitar escrituras desde cuentas
      // no verificadas.
      await setDoc(docRef, {
        username: nombre,
        correo: correo || "",
        createdAt: Timestamp.now(),
        emailVerified: !!isVerified,
      });
      console.log("[FIRESTORE] Perfil creado para usuario:", uid);
    } else {
      console.log("[FIRESTORE] Perfil ya existe para usuario:", uid);
    }
  } catch (error: any) {
    console.error("[FIRESTORE ERROR] No se pudo crear perfil de usuario:", error.message);
    throw error;
  }
};

/**
 * Actualizar el estado de verificación de correo del usuario en Firestore
 */
export const actualizarVerificacionCorreo = async (
  uid: string,
  isVerified: boolean,
): Promise<void> => {
  try {
    // Actualiza (merge) únicamente el campo `emailVerified` del documento
    // del usuario. Se utiliza cuando detectamos en Firebase Auth que el
    // usuario verificó su correo (ej. tras pulsar "Ya verifiqué" o al
    // hacer login si ya estaba verificado). Al hacer merge evitamos
    // sobrescribir otros campos del perfil.
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, { emailVerified: !!isVerified }, { merge: true });
    console.log("[FIRESTORE] emailVerified actualizado para:", uid, isVerified);
  } catch (error: any) {
    console.error("[FIRESTORE ERROR] No se pudo actualizar emailVerified:", error.message);
    throw error;
  }
};

/**
 * Actualizar el nombre de usuario
 */
export const actualizarNombreUsuario = async (
  uid: string,
  nuevoNombre: string,
): Promise<void> => {
  try {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, {
      username: nuevoNombre.trim(),
    });
    console.log("[FIRESTORE] Nombre de usuario actualizado:", nuevoNombre);
  } catch (error: any) {
    console.error(
      "[FIRESTORE ERROR] No se pudo actualizar nombre de usuario:",
      error.message,
    );
    throw error;
  }
};
