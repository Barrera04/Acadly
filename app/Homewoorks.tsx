import BottomNavigationBar from "@/src/Components/BottomNavigationBar";
import TODOHomeworks, { Homework } from "@/src/Components/TODOHomeworks";
import TopBar from "@/src/Components/TopBar";
import { useAuthUser } from "@/src/hooks/useAuthUser";
import { obtenerTodasLasTareas } from "@/src/Services/firestoreService";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

export default function Homewoorks() {
  const [active, setActive] = useState<string>("Tareas");
  const { uid, loading: authLoading } = useAuthUser();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!uid) {
        setHomeworks([]);
        return;
      }

      try {
        setLoading(true);
        const tareas = await obtenerTodasLasTareas(uid);

        // Mapear las tareas de Firestore al tipo `Homework`
        const mapped: Homework[] = tareas.map((t) => ({
          id: t.id || "",
          title: (t as any).titulo || (t as any).title || "Sin título",
          description: (t as any).descripcion || (t as any).description || "",
          dueDate: (t as any).fechaEntrega || (t as any).dueDate || undefined,
          completed: !!(t as any).completada || false,
        }));

        if (mounted) setHomeworks(mapped);
      } catch (error) {
        console.warn("[HOMEWORKS] Error cargando tareas:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [uid]);

  return (
    <View style={{ flex: 1 }}>
      <TopBar name="Tareas" />
      <View style={styles.container}>
        <Text style={styles.title}>Tus tareas</Text>

        {authLoading || loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginVertical: 20 }} />
        ) : (
          <>
            <TODOHomeworks homeworks={homeworks} />

            <FlatList
              data={homeworks}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    {item.completed ? (
                      <Ionicons name="checkmark-circle" size={22} color="#10b981" />
                    ) : (
                      <Ionicons name="time-outline" size={22} color="#3b82f6" />
                    )}
                  </View>
                  <Text style={styles.cardDesc}>{item.description}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardDate}>
                      {typeof item.dueDate === "string"
                        ? item.dueDate
                        : item.dueDate
                        ? new Date((item.dueDate as any).seconds ? (item.dueDate as any).toDate() : item.dueDate).toLocaleDateString()
                        : ""}
                    </Text>
                    <Pressable style={styles.actionBtn}>
                      <Ionicons name="create-outline" size={18} color="#fff" />
                      <Text style={styles.actionBtnText}>Editar</Text>
                    </Pressable>
                  </View>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 32 }}
            />
          </>
        )}
      </View>
      <BottomNavigationBar active={active} onChange={setActive} />
    </View>
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
    marginBottom: 18,
    color: "#0f172a",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563EB",
  },
  cardDesc: {
    fontSize: 15,
    color: "#334155",
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardDate: {
    fontSize: 13,
    color: "#475569",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 13,
  },
});
