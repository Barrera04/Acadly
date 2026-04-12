import BottomNavigationBar from "@/src/Components/BottomNavigationBar";
import TopBar from "@/src/Components/TopBar";
import { useAuthUser } from "@/src/hooks/useAuthUser";
import { useMateria } from "@/src/hooks/useMateria";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

interface ScheduleClass {
  id: number;
  subject: string;
  professor: string;
  time: string;
  room: string;
  color: string;
  day: string;
}

// scheduleData will be derived from materias' horario

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export default function Schedule() {
  const [active, setActive] = useState<string>("Horario");
  const { uid, loading: authLoading } = useAuthUser();
  const { materias, loading: materiasLoading } = useMateria(uid);

  // Build schedule entries from materias' horario
  const scheduleData = useMemo(() => {
    const entries: ScheduleClass[] = [];
    materias.forEach((m, mi) => {
      if (!m.horario || !Array.isArray(m.horario)) return;
      m.horario.forEach((h: any, hi: number) => {
        const start = h.inicio || "";
        const end = h.fin || "";
        const time = start && end ? `${start} - ${end}` : start || end || "";
        entries.push({
          id: Number(`${mi}${hi}`),
          day: h.dia || "",
          subject: m.nombre,
          professor: m.profesor || "",
          time,
          room: (m as any).aula || "",
          color: m.color || "#3b82f6",
        });
      });
    });

    // sort entries by day order and start time
    const dayOrder: Record<string, number> = { Lunes: 0, Martes: 1, Miércoles: 2, Miercoles: 2, Jueves: 3, Viernes: 4, Sábado: 5, Sabado: 5, Domingo: 6 };
    const parseStartMinutes = (timeRange: string) => {
      const part = timeRange.split("-")[0]?.trim();
      if (!part) return 0;
      // support HH:MM and HH:MM AM/PM
      const ampmMatch = part.match(/(AM|PM)$/i);
      let t = part.replace(/(AM|PM)$/i, "").trim();
      const [hh, mm] = t.split(":");
      let hours = parseInt(hh || "0", 10);
      const minutes = parseInt(mm || "0", 10);
      if (ampmMatch) {
        const ampm = ampmMatch[0].toUpperCase();
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
      }
      return hours * 60 + minutes;
    };

    entries.sort((a, b) => {
      const dayA = dayOrder[a.day] ?? 999;
      const dayB = dayOrder[b.day] ?? 999;
      if (dayA !== dayB) return dayA - dayB;
      return parseStartMinutes(a.time) - parseStartMinutes(b.time);
    });

    return entries;
  }, [materias]);

  return (
    <View style={{ flex: 1 }}>
      <TopBar name="Horario" />
      <View style={styles.container}>
        <Text style={styles.title}>Tu horario semanal</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {authLoading || materiasLoading ? (
            <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 24 }} />
          ) : (
            days.map((day) => {
              const dayClasses = scheduleData.filter((item) => item.day === day);
              return (
                <View key={day} style={styles.daySection}>
                  <Text style={styles.dayTitle}>{day}</Text>
                  {dayClasses.length > 0 ? (
                    dayClasses.map((classItem) => (
                      <View
                        key={classItem.id}
                        style={[
                          styles.classCard,
                          { borderLeftColor: classItem.color },
                        ]}
                      >
                        <View style={styles.classHeader}>
                          <View style={styles.timeContainer}>
                            <Ionicons
                              name="time-outline"
                              size={18}
                              color={classItem.color}
                            />
                            <Text style={styles.time}>{classItem.time}</Text>
                          </View>
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: classItem.color },
                            ]}
                          />
                        </View>
                        <Text style={styles.subject}>{classItem.subject}</Text>
                        <Text style={styles.professor}>
                          {classItem.professor}
                        </Text>
                        <View style={styles.roomSection}>
                          <Ionicons
                            name="pin-outline"
                            size={14}
                            color="#6b7280"
                          />
                          <Text style={styles.room}>{classItem.room}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyDay}>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={32}
                        color="#d1d5db"
                      />
                      <Text style={styles.emptyText}>Sin clases este día</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
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
  daySection: {
    marginBottom: 24,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 12,
  },
  classCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
    marginLeft: 6,
  },
  statusBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  subject: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  professor: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
  },
  roomSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  room: {
    fontSize: 12,
    color: "#475569",
    marginLeft: 6,
  },
  emptyDay: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
  },
});
