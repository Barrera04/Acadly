import TopBar from "@/src/Components/TopBar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { auth } from "../firebaseConfig";
import BottomNavigationBar from "../src/Components/BottomNavigationBar";
import MotivationalQuote from "../src/Components/MotivationalQuote";
import NextHomework from "../src/Components/NextHomework";
import TODOHomeworks from "../src/Components/TODOHomeworks";
import { UserContext } from "../src/context/UserContext";
import { useAuthUser } from "../src/hooks/useAuthUser";
import { useTareas } from "../src/hooks/useTareas";

export default function HomeScreen() {
  const router = useRouter();
  const { uid } = useAuthUser();
  const { username } = useContext(UserContext);
  const [nextHomework, setNextHomework] = useState<any>(null);

  // Obtener todas las tareas del usuario
  const { tareas, loading, error } = useTareas(uid);

  // Obtener la tarea más próxima
  useEffect(() => {
    if (tareas && tareas.length > 0) {
      // Filtrar tareas no completadas y obtener la de menor fecha
      const pendientes = tareas.filter((t) => !t.completada);
      if (pendientes.length > 0) {
        setNextHomework(pendientes[0]);
      } else {
        setNextHomework(null);
      }
    } else {
      setNextHomework(null);
    }
  }, [tareas]);

  const normalizeToDate = (value: any): Date | null => {
    if (!value) return null;
    // Firestore Timestamp (has toDate)
    if (typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function') {
      return value.toDate();
    }
    // JS Date
    if (value instanceof Date) return value;
    // Numeric timestamp (milliseconds)
    if (typeof value === 'number') return new Date(value);
    // ISO string or other date string
    const parsed = new Date(String(value));
    if (!isNaN(parsed.getTime())) return parsed;
    return null;
  };

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            console.log("[LOGOUT EXITOSO] Sesión cerrada correctamente");

            Alert.alert("✅ Sesión cerrada", "Has cerrado sesión exitosamente");

            setTimeout(() => {
              router.replace("/login");
            }, 500);
          } catch (error: any) {
            console.log(
              "[LOGOUT FALLIDO] Error al cerrar sesión:",
              error.message,
            );
            Alert.alert(
              "❌ Error",
              "No pudimos cerrar tu sesión. Intenta nuevamente.",
            );
          }
        },
      },
    ]);
  };

  return (
    <>
      <TopBar name={username || "Acadly"} greeting="Hola 👋" />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Bienvenido a Acadly</Text>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.logoutText}>Cerrar</Text>
          </Pressable>
        </View>

        {/* Tarea más próxima */}
        {loading ? (
          <View style={styles.card}>
            <ActivityIndicator size="large" color="#3D5A80" />
          </View>
        ) : nextHomework ? (
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>Proxima tarea</Text>
            <NextHomework
              title={nextHomework.titulo}
              subject={nextHomework.materia || "Sin asignar"}
              date={
                (() => {
                  const d = normalizeToDate(nextHomework.fechaEntrega);
                  return d
                    ? d.toLocaleDateString("es-ES", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "Sin fecha";
                })()
              }
            />
          </Pressable>
        ) : (
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>No hay tareas pendientes 🎉</Text>
          </Pressable>
        )}

        {/* Acciones rápidas */}
        <View style={styles.middleRow}>
          <Pressable
            style={styles.middleCard}
            onPress={() => router.push("/Asiggment")}
          >
            <View style={styles.plusCircle}>
              <Ionicons name="add" size={28} color="#fff" />
            </View>
            <Text style={styles.middleCardTitle}>Agregar tarea</Text>
          </Pressable>

          <Pressable
            style={styles.middleCard}
            onPress={() => router.push("/Materias")}
          >
            <View style={styles.plusCircle}>
              <Ionicons name="book-outline" size={28} color="#fff" />
            </View>
            <Text style={styles.middleCardTitle}>Ver materias</Text>
          </Pressable>

          <Pressable
            style={styles.middleCard}
            onPress={() => router.push("/Schedule")}
          >
            <View style={styles.plusCircle}>
              <Ionicons name="calendar-outline" size={28} color="#fff" />
            </View>
            <Text style={styles.middleCardTitle}>Ver horario</Text>
          </Pressable>
        </View>

        {/* Resumen de tareas */}
        <MotivationalQuote
          pendingCount={tareas?.filter((t) => !t.completada).length || 0}
        />

        {/* Lista de tareas */}
        <TODOHomeworks
          homeworks={
            tareas?.map((t) => ({
              id: t.id || "",
              title: t.titulo,
              description: t.descripcion,
              dueDate:
                typeof t.fechaEntrega === "object" && "toDate" in t.fechaEntrega
                  ? t.fechaEntrega.toDate()
                  : t.fechaEntrega,
              completed: t.completada,
            })) || []
          }
        />
      </View>
      <BottomNavigationBar onChange={undefined} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0e4ec",
    padding: 20,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    marginTop: -30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    padding: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 15,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  middleCard: {
    width: 120,
    height: 120,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginBottom: 12,
    // shadow iOS
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    // elevation Android
    elevation: 3,
  },

  middleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  plusCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  middleCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  logoutText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
