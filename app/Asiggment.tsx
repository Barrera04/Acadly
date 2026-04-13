import BottomNavigationBar from "@/src/Components/BottomNavigationBar";
import TopBar from "@/src/Components/TopBar";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

interface Subject {
  id: number;
  title: string;
  professor: string;
  schedule: string;
  color: string;
}

// Ejemplo de datos de materias
const subjects: Subject[] = [
  {
    id: 1,
    title: "Historia",
    professor: "Prof. Juan García",
    schedule: "Lunes y Jueves - 10:00 AM",
    color: "#3b82f6",
  },
  {
    id: 2,
    title: "Matemáticas",
    professor: "Prof. María López",
    schedule: "Martes y Viernes - 2:00 PM",
    color: "#8b5cf6",
  },
  {
    id: 3,
    title: "Biología",
    professor: "Prof. Carlos Rodríguez",
    schedule: "Miércoles - 11:30 AM",
    color: "#10b981",
  },
  {
    id: 4,
    title: "Español",
    professor: "Prof. Ana Martínez",
    schedule: "Lunes y Miércoles - 9:00 AM",
    color: "#f59e0b",
  },
];

export default function Asiggment() {
  const [active, setActive] = useState<string>("Materias");

  return (
    <View style={{ flex: 1 }}>
      <TopBar name="Materias" />
      <View style={styles.container}>
        <Text style={styles.title}>Tus materias</Text>
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.card,
                { borderLeftColor: item.color, borderLeftWidth: 5 },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.professor}>{item.professor}</Text>
                </View>
                <View
                  style={[styles.colorBadge, { backgroundColor: item.color }]}
                />
              </View>
              <View style={styles.scheduleSection}>
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text style={styles.schedule}>{item.schedule}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Pressable style={styles.actionBtn}>
                  <Ionicons name="book-outline" size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>Ver más</Text>
                </Pressable>
              </View>
            </Pressable>
          )}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
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
    marginBottom: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 4,
  },
  professor: {
    fontSize: 14,
    color: "#6b7280",
  },
  colorBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  scheduleSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  schedule: {
    fontSize: 13,
    color: "#475569",
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
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
