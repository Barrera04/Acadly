import BottomNavigationBar from "@/src/Components/BottomNavigationBar";
import TopBar from "@/src/Components/TopBar";
import { useAuthUser } from "@/src/hooks/useAuthUser";
import { useMateria } from "@/src/hooks/useMateria";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function MateriasScreen() {
  const router = useRouter();
  const { uid } = useAuthUser();
  const { materias, loading, error, crear } = useMateria(uid);

  const [modalVisible, setModalVisible] = useState(false);
  const [nombreMateria, setNombreMateria] = useState("");
  const [profesor, setProfesor] = useState("");
  const [semestre, setSemestre] = useState<number>(1);
  const [color, setColor] = useState<string>("#3D5A80");
  const [horario, setHorario] = useState<Array<{dia:string; inicio:string; fin:string}>>([]);

  // Temp schedule inputs
  const [diaTemp, setDiaTemp] = useState<string>("Lunes");
  const [inicioTemp, setInicioTemp] = useState<string>("");
  const [finTemp, setFinTemp] = useState<string>("");
  const [showDiaDropdown, setShowDiaDropdown] = useState<boolean>(false);
  const daysOptions = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const handleAgregarMateria = () => {
    setModalVisible(true);
    setNombreMateria("");
  };

  const handleCrearMateria = async () => {
    if (!nombreMateria.trim()) {
      Alert.alert("❌ Error", "El nombre no puede estar vacío");
      return;
    }

    try {
      const nuevoId = await crear({
        nombre: nombreMateria.trim(),
        profesor: profesor.trim() || "Sin asignar",
        semestre: semestre,
        color: color,
        horario: horario,
      });

      if (nuevoId) {
        Alert.alert(
          "✅ Éxito",
          `Materia "${nombreMateria}" creada correctamente`,
        );
        setModalVisible(false);
        setNombreMateria("");
        setProfesor("");
        setSemestre(1);
        setColor("#3D5A80");
        setHorario([]);
      }
    } catch (err: any) {
      Alert.alert("❌ Error", err.message);
    }
  };

  const handleEliminarMateria = (materiaId: string, nombre: string) => {
    Alert.alert("Confirmar", `¿Eliminar la materia "${nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await useMateria(userContext?.uid || null).eliminar(materiaId);
            Alert.alert("✅ Eliminada", "La materia ha sido eliminada");
          } catch (err: any) {
            Alert.alert("❌ Error", err.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <TopBar name="Materias" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mis Materias</Text>
          <Pressable style={styles.addButton} onPress={handleAgregarMateria}>
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color="#3D5A80" />
            <Text style={styles.loadingText}>Cargando materias...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        ) : materias.length === 0 ? (
          <View style={styles.centerContent}>
            <Ionicons name="book-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No tienes materias aún.</Text>
            <Text style={styles.emptySubtext}>
              Presiona el botón + para agregar una
            </Text>
          </View>
        ) : (
          <FlatList
            data={materias}
            keyExtractor={(item) => item.id || ""}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.materiaCard,
                  { borderLeftColor: item.color, borderLeftWidth: 5 },
                ]}
                onPress={() => router.push(`/MateriaDetail?id=${item.id}`)}
              >
                <View style={styles.materiaHeader}>
                  <View style={styles.materiaNombreBox}>
                    <Text style={styles.materiaNombre}>{item.nombre}</Text>
                    <Text style={styles.materiaProfesor}>{item.profesor}</Text>
                  </View>
                  <View style={styles.materiaActions}>
                    <Pressable style={styles.actionIcon}>
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color="#3D5A80"
                      />
                    </Pressable>
                    <Pressable
                      style={styles.actionIcon}
                      onPress={() =>
                        handleEliminarMateria(item.id || "", item.nombre)
                      }
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#ef4444"
                      />
                    </Pressable>
                  </View>
                </View>
                <Text style={styles.materiaSemestre}>
                  📚 Semestre {item.semestre}
                </Text>
              </Pressable>
            )}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        )}
      </View>
      <BottomNavigationBar onChange={() => {}} />

      {/* Modal para crear materia */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Materia</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nombre de la materia"
              placeholderTextColor="#999"
              value={nombreMateria}
              onChangeText={setNombreMateria}
              autoFocus={true}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Profesor (opcional)"
              placeholderTextColor="#999"
              value={profesor}
              onChangeText={setProfesor}
            />

            <Text style={{ marginBottom: 8, color: '#666' }}>Semestre</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setSemestre(s)}
                  style={[
                    styles.semestreBtn,
                    semestre === s ? styles.semestreBtnActive : null,
                  ]}
                >
                  <Text style={semestre === s ? styles.semestreTextActive : styles.semestreText}>{s}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={{ marginBottom: 8, color: '#666' }}>Color</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {['#3D5A80', '#F97316', '#10B981', '#60A5FA', '#A78BFA', '#F43F5E'].map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={[styles.colorSwatch, { backgroundColor: c, borderWidth: color === c ? 2 : 0, borderColor: '#000' }]}
                />
              ))}
            </View>

            <Text style={{ marginBottom: 8, color: '#666', fontWeight: '600' }}>Horario de clases (opcional)</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <View style={{ flex: 1, position: 'relative' }}>
                <Pressable
                  onPress={() => setShowDiaDropdown(!showDiaDropdown)}
                  style={[styles.smallInput, { justifyContent: 'center' }]}
                >
                  <Text style={{ color: '#111' }}>{diaTemp}</Text>
                </Pressable>
                {showDiaDropdown && (
                  <View style={{ position: 'absolute', top: 46, left: 0, right: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, zIndex: 999, padding: 6 }}>
                    {daysOptions.map((d) => (
                      <Pressable
                        key={d}
                        onPress={() => { setDiaTemp(d); setShowDiaDropdown(false); }}
                        style={{ paddingVertical: 8, paddingHorizontal: 6 }}
                      >
                        <Text style={{ color: d === diaTemp ? '#3D5A80' : '#111' }}>{d}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.smallInput}
                  value={inicioTemp}
                  onChangeText={setInicioTemp}
                  placeholder="Inicio (08:00)"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.smallInput}
                  value={finTemp}
                  onChangeText={setFinTemp}
                  placeholder="Fin (09:30)"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 }}>
              <Pressable
                style={[styles.modalButton, styles.crearButton]}
                onPress={() => {
                  if (!inicioTemp || !finTemp) {
                    Alert.alert('Horario inválido', 'Ingresa hora de inicio y fin');
                    return;
                  }
                  setHorario([...horario, { dia: diaTemp, inicio: inicioTemp, fin: finTemp }]);
                  setInicioTemp('');
                  setFinTemp('');
                }}
              >
                <Text style={styles.crearButtonText}>Agregar horario</Text>
              </Pressable>
            </View>

            {horario.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                {horario.map((h, idx) => (
                  <View key={idx} style={styles.horarioRow}>
                    <Text style={{ color: '#0f172a' }}>{h.dia} {h.inicio} - {h.fin}</Text>
                    <Pressable onPress={() => setHorario(horario.filter((_, i) => i !== idx))}>
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.crearButton]}
                onPress={handleCrearMateria}
              >
                <Text style={styles.crearButtonText}>Crear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
  },
  addButton: {
    backgroundColor: "#3D5A80",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  materiaCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  materiaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  materiaNombreBox: {
    flex: 1,
  },
  materiaNombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  materiaProfesor: {
    fontSize: 14,
    color: "#7A8CA3",
    marginTop: 4,
  },
  materiaActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionIcon: {
    padding: 8,
  },
  materiaSemestre: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 8,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#7A8CA3",
  },
  emptyText: {
    fontSize: 16,
    color: "#7A8CA3",
    marginTop: 12,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
  },
  semestreBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6'
  },
  semestreBtnActive: {
    backgroundColor: '#3D5A80'
  },
  semestreText: { color: '#111' },
  semestreTextActive: { color: '#fff', fontWeight: '700' },
  colorSwatch: { width: 36, height: 36, borderRadius: 8 },
  horarioRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 90,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  crearButton: {
    backgroundColor: "#3D5A80",
  },
  crearButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
