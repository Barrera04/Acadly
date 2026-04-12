import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

/**
 * NextHomework — Muestra la tarea más próxima a entregar.
 *
 * TODO: Recibir una lista de tareas (Homework[]) como prop y determinar
 *       automáticamente cuál es la tarea con la fecha de entrega más cercana.
 *
 * TODO: Definir la interfaz Homework con al menos:
 *       - id: string
 *       - title: string
 *       - subject: string
 *       - dueDate: Date | string   (fecha límite de entrega)
 *       - completed: boolean
 *
 * TODO: Filtrar las tareas no completadas y ordenarlas por dueDate ascendente
 *       para seleccionar la más cercana. Si no hay tareas pendientes, mostrar
 *       un mensaje como "No tienes tareas pendientes 🎉".
 *
 * TODO: Formatear la fecha de entrega (dueDate) a un formato legible,
 *       por ejemplo "Mar 24 Abr", usando Intl.DateTimeFormat o una librería
 *       como date-fns / dayjs.
 *
 * TODO: Manejar el caso en que la tarea ya venció (dueDate < hoy) y aplicar
 *       un estilo distinto (por ejemplo, franja roja en lugar de azul).
 */
export default function NextHomework({
    // TODO: Reemplazar estos valores por defecto con datos reales
    //       provenientes de la lógica de selección de tarea más cercana.
    title = "Ensayo sobre historia",
    subject = "Historia",
    date = "Mar 24 Abr",
}) {
    // TODO: Implementar lógica para calcular días restantes y mostrar
    //       una etiqueta como "Vence en 3 días" o "Vence hoy".
    //
    // Integración backend / datos reales:
    // - Este componente debe recibir la tarea seleccionada (`nextHomework`) o
    //   la lista completa `homeworks` y calcular la próxima pendiente.
    // - Normalizar `dueDate` a objeto Date si viene en string: new Date(dueDate).
    // - Calcular `daysLeft = differenceInDays(dueDate, today)` (usar date-fns/dayjs
    //   o Intl para evitar errores con zonas horarias).
    // - Si `daysLeft <= 0` marcar como vencida y aplicar estilo (franja roja).
    // - Evitar lógica pesada en render: calcular datos fuera (useMemo/useEffect)
    //   y pasar valores listos para mostrar.

    return (
        <View style={styles.card}>
            <View style={styles.leftStripe} />

            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>

                <View style={styles.row}>
                    <View style={styles.subjectRow}>
                        <View style={styles.iconBox}>
                            <Ionicons name="book" size={18} color="#3b82f6" />
                        </View>
                        <Text style={styles.subject}>{subject}</Text>
                    </View>

                    <View style={styles.dateRow}>
                        {/* TODO: Mostrar indicador de urgencia si faltan ≤ 2 días */}
                        <Text style={styles.date}>{date}</Text>
                        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        minHeight: 84,
        marginBottom: 12,
        // shadow for iOS
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        // elevation for Android
        elevation: 2
    },

    leftStripe: {
        width: 12,
        height: "100%",
        backgroundColor: "#3b82f6",
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        marginRight: 14,
        alignSelf: "stretch"
    },

    content: {
        flex: 1,
        justifyContent: "center"
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 8
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },

    subjectRow: {
        flexDirection: "row",
        alignItems: "center"
    },

    iconBox: {
        width: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: "#EFF6FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10
    },

    subject: {
        color: "#334155",
        fontSize: 16
    },

    dateRow: {
        flexDirection: "row",
        alignItems: "center"
    },

    date: {
        color: "#475569",
        marginRight: 8
    }
});