import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

/**
 * TODOHomeworks
 *
 * Muestra un resumen compacto: número de tareas pendientes y número de tareas hechas.
 *
 * TODOs / lógica a implementar posteriormente:
 * - Definir y usar la interfaz `Homework` con: id, title, dueDate (Date|string), completed:boolean.
 * - Recibir prop `homeworks: Homework[]` y calcular:
 *     - `pending = homeworks.filter(h => !h.completed).length`
 *     - `completed = homeworks.filter(h => h.completed).length`
 * - Implementar orden/filtrado por fecha de entrega y seleccionar la próxima tarea.
 * - Añadir manejo de zonas horarias y formateo de fecha (Intl.DateTimeFormat / dayjs).
 * - Hacer el componente accesible (labels, roles) y añadir animación al actualizar conteos.
 */

export interface Homework {
  id: string | number;
  title: string;
  description?: string;
  dueDate?: string | Date;
  completed: boolean;
}

interface TODOHomeworksProps {
  // Opcional: lista de tareas; si no se provee, se muestran valores de ejemplo.
  homeworks?: Homework[];
}

export default function TODOHomeworks({ homeworks }: TODOHomeworksProps) {
  // TODO: En el futuro calcular desde `homeworks` reales.
  const pendingCount = homeworks ? homeworks.filter((h) => !h.completed).length : 2;
  const completedCount = homeworks ? homeworks.filter((h) => h.completed).length : 1;

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.label}>Pendientes:</Text>
        <Text style={styles.count}>{pendingCount}</Text>
      </View>

      <View style={styles.right}>
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={16} color="#fff" />
        </View>
        <Text style={styles.doneLabel}>Hechas: <Text style={styles.doneCount}>{completedCount}</Text></Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // Shadow iOS
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    // Elevation Android
    elevation: 2,
    marginBottom: 12
  },

  left: {
    flexDirection: "row",
    alignItems: "center"
  },

  label: {
    fontSize: 16,
    color: "#0f172a",
    marginRight: 8,
    fontWeight: "600"
  },

  count: {
    fontSize: 18,
    color: "#3b82f6",
    fontWeight: "800"
  },

  right: {
    flexDirection: "row",
    alignItems: "center"
  },

  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8
  },

  doneLabel: {
    fontSize: 14,
    color: "#475569"
  },

  doneCount: {
    fontWeight: "700",
    color: "#0f172a"
  }
});
