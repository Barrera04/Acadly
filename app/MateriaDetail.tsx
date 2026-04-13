import BottomNavigationBar from "@/src/Components/BottomNavigationBar";
import TopBar from "@/src/Components/TopBar";
import { useAuthUser } from "@/src/hooks/useAuthUser";
import { useMateria } from "@/src/hooks/useMateria";
import { useTareas } from "@/src/hooks/useTareas";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function MateriaDetailScreen() {
  const router = useRouter();
  const { uid } = useAuthUser();
  const { id } = useLocalSearchParams();
  const { materias, actualizar: actualizarMateria } = useMateria(uid);
  const {
    tareas,
    loading: tareasLoading,
    crear: crearTarea,
    actualizar,
    marcarCompletada,
  } = useTareas(uid, id as string);

  const materia = materias.find((m) => m.id === id);

  // Estados para modal de crear tarea
  const [modalTareaVisible, setModalTareaVisible] = useState(false);
  const [titleTarea, setTitleTarea] = useState("");
  const [descTarea, setDescTarea] = useState("");
  const [fechaTarea, setFechaTarea] = useState("");

  // Estados para editar tarea
  const [modalEditarTareaVisible, setModalEditarTareaVisible] = useState(false);
  const [editarTareaId, setEditarTareaId] = useState<string | null>(null);
  const [editarTitle, setEditarTitle] = useState("");
  const [editarDesc, setEditarDesc] = useState("");
  const [editarFecha, setEditarFecha] = useState("");

  // Estados para editar materia
  const [editandoMateria, setEditandoMateria] = useState(false);
  const [nombreEdit, setNombreEdit] = useState(materia?.nombre || "");
  const [profesorEdit, setProfesorEdit] = useState(materia?.profesor || "");
  const [semestreEdit, setSemestreEdit] = useState(
    materia?.semestre.toString() || "1",
  );
  const [colorEdit, setColorEdit] = useState<string>(materia?.color || '#3D5A80');
  const [horarioEdit, setHorarioEdit] = useState<Array<{dia:string; inicio:string; fin:string}>>(materia?.horario || []);
  const [diaTemp, setDiaTemp] = useState<string>('Lunes');
  const [inicioTemp, setInicioTemp] = useState<string>('');
  const [finTemp, setFinTemp] = useState<string>('');
  const [showDiaDropdown, setShowDiaDropdown] = useState<boolean>(false);
  const daysOptions = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const handleCrearTarea = async () => {
    if (!titleTarea.trim() || !descTarea.trim() || !fechaTarea.trim()) {
      Alert.alert("❌ Error", "Completa todos los campos");
      return;
    }

    try {
      // Validar formato de fecha (YYYY-MM-DD)
      const fecha = new Date(fechaTarea);
      if (isNaN(fecha.getTime())) {
        Alert.alert("❌ Error", "Formato de fecha inválido. Usa YYYY-MM-DD");
        return;
      }

      await crearTarea(
        {
          titulo: titleTarea.trim(),
          descripcion: descTarea.trim(),
          fechaEntrega: fecha,
          completada: false,
          estado: "pendiente",
        },
        id as string,
      );

      Alert.alert("✅ Éxito", "Tarea creada correctamente");
      setModalTareaVisible(false);
      setTitleTarea("");
      setDescTarea("");
      setFechaTarea("");
    } catch (err: any) {
      Alert.alert("❌ Error", err.message);
    }
  };

  // Normaliza varios formatos de fecha (Firestore Timestamp, Date, ISO string)
  const normalizeToDate = (d: any): Date | null => {
    if (!d) return null;
    if (d instanceof Date) return d;
    if (d && typeof d.toDate === "function") return d.toDate();
    if (typeof d === "number") return new Date(d);
    if (typeof d === "string") {
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? null : dt;
    }
    return null;
  };

  const abrirEditarTarea = (item: any) => {
    setEditarTareaId(item.id || null);
    setEditarTitle(item.titulo || "");
    setEditarDesc(item.descripcion || "");
    const d = normalizeToDate(item.fechaEntrega);
    setEditarFecha(d ? d.toISOString().slice(0, 10) : "");
    setModalEditarTareaVisible(true);
  };

  const handleActualizarTarea = async () => {
    if (!editarTareaId) return;
    if (!editarTitle.trim() || !editarDesc.trim() || !editarFecha.trim()) {
      Alert.alert("❌ Error", "Completa todos los campos");
      return;
    }

    const fecha = new Date(editarFecha);
    if (isNaN(fecha.getTime())) {
      Alert.alert("❌ Error", "Formato de fecha inválido. Usa YYYY-MM-DD");
      return;
    }

    try {
      const success = await actualizar(editarTareaId, {
        titulo: editarTitle.trim(),
        descripcion: editarDesc.trim(),
        fechaEntrega: fecha,
      });

      if (success) {
        Alert.alert("✅ Éxito", "Tarea actualizada correctamente");
        setModalEditarTareaVisible(false);
      } else {
        Alert.alert("❌ Error", "No se pudo actualizar la tarea");
      }
    } catch (err: any) {
      Alert.alert("❌ Error", err.message || String(err));
    }
  };

  const handleActualizarMateria = async () => {
    if (!nombreEdit.trim()) {
      Alert.alert("❌ Error", "El nombre no puede estar vacío");
      return;
    }

    try {
      await actualizarMateria(id as string, {
        nombre: nombreEdit.trim(),
        profesor: profesorEdit.trim(),
        semestre: parseInt(semestreEdit) || 1,
        color: colorEdit,
        horario: horarioEdit,
      });

      Alert.alert("✅ Éxito", "Materia actualizada correctamente");
      setEditandoMateria(false);
    } catch (err: any) {
      Alert.alert("❌ Error", err.message);
    }
  };

  if (!materia) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Materia no encontrada</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <TopBar name={materia.nombre} />
      <View style={styles.container}>
        {/* Info de Materia */}
        <View
          style={[
            styles.materiaCard,
            { borderLeftColor: materia.color, borderLeftWidth: 5 },
          ]}
        >
          <View style={styles.materiaHeader}>
            <View style={styles.materiaInfo}>
              <Text style={styles.materiaNombre}>{materia.nombre}</Text>
              <Text style={styles.materiaProfesor}>👨‍🏫 {materia.profesor}</Text>
              <Text style={styles.materiaSemestre}>
                📚 Semestre {materia.semestre}
              </Text>
              {materia.horario && materia.horario.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontWeight: '600', marginBottom: 6 }}>Horario</Text>
                  {materia.horario.map((h: any, i: number) => (
                    <Text key={i} style={{ color: '#444' }}>{h.dia} {h.inicio} - {h.fin}</Text>
                  ))}
                </View>
              )}
            </View>
            <Pressable
              style={styles.editButton}
              onPress={() => setEditandoMateria(true)}
            >
              <Ionicons name="pencil" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Tareas */}
        <View style={styles.seccionTareas}>
          <View style={styles.headerTareas}>
            <Text style={styles.titleTareas}>
              Tareas ({tareas?.length || 0})
            </Text>
            <Pressable
              style={styles.addTareaButton}
              onPress={() => setModalTareaVisible(true)}
            >
              <Ionicons name="add-circle" size={24} color="#3D5A80" />
            </Pressable>
          </View>

          {tareasLoading ? (
            <ActivityIndicator size="large" color="#3D5A80" />
          ) : tareas && tareas.length > 0 ? (
            <FlatList
              data={tareas}
              keyExtractor={(item) => item.id || ""}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.tareaCard,
                    item.completada && styles.tareaCompletada,
                  ]}
                  onPress={() => {
                    if (!item.completada) {
                      marcarCompletada(item.id || "", true, id as string);
                    }
                  }}
                >
                  <View style={styles.tareaCheckbox}>
                    <View
                      style={[
                        styles.checkbox,
                        item.completada && styles.checkboxCompleto,
                      ]}
                    >
                      {item.completada && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                  </View>

                  <View style={styles.tareaContent}>
                    <Text
                      style={[
                        styles.tareaTitulo,
                        item.completada && styles.tareaTituloCompletada,
                      ]}
                    >
                      {item.titulo}
                    </Text>
                    <Text style={styles.tareaDesc}>{item.descripcion}</Text>
                    <Text style={styles.tareaFecha}>
                      📅{" "}
                      {(() => {
                        const d = normalizeToDate(item.fechaEntrega);
                        return d ? d.toLocaleDateString("es-ES") : "";
                      })()}
                    </Text>
                  </View>
                  <Pressable
                    style={[styles.actionBtn, { paddingHorizontal: 10 }]}
                    onPress={() => abrirEditarTarea(item)}
                  >
                    <Ionicons name="create-outline" size={16} color="#fff" />
                    <Text style={[styles.actionBtnText, { fontSize: 12, marginLeft: 6 }]}>Editar</Text>
                  </Pressable>
                </Pressable>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          ) : (
            <View style={styles.emptyTareas}>
              <Ionicons name="checkmark-done-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No hay tareas aún</Text>
              <Text style={styles.emptySubtext}>
                Presiona + para agregar una
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Modal Editar Materia */}
      <Modal visible={editandoMateria} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Materia</Text>

            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={nombreEdit}
              onChangeText={setNombreEdit}
              placeholder="Nombre de la materia"
            />

            <Text style={styles.label}>Profesor</Text>
            <TextInput
              style={styles.input}
              value={profesorEdit}
              onChangeText={setProfesorEdit}
              placeholder="Nombre del profesor"
            />

            <Text style={styles.label}>Semestre</Text>
            <TextInput
              style={styles.input}
              value={semestreEdit}
              onChangeText={setSemestreEdit}
              placeholder="1"
              keyboardType="numeric"
            />

              <Text style={styles.label}>Color</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                {['#3D5A80', '#F97316', '#10B981', '#60A5FA', '#A78BFA', '#F43F5E'].map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setColorEdit(c)}
                    style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: c, borderWidth: colorEdit === c ? 2 : 0, borderColor: '#000' }}
                  />
                ))}
              </View>

              <Text style={styles.label}>Horario</Text>
              <View style={{ marginBottom: 8 }}>
                {horarioEdit.map((h, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
                    <Text>{h.dia} {h.inicio} - {h.fin}</Text>
                    <Pressable onPress={() => setHorarioEdit(horarioEdit.filter((_, i) => i !== idx))}>
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </Pressable>
                  </View>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Pressable
                    style={[styles.inputSmall, { justifyContent: 'center' }]}
                    onPress={() => setShowDiaDropdown(!showDiaDropdown)}
                  >
                    <Text style={{ color: '#333' }}>{diaTemp}</Text>
                  </Pressable>
                  {showDiaDropdown && (
                    <View style={styles.dropdownList}>
                      {daysOptions.map((d) => (
                        <Pressable
                          key={d}
                          onPress={() => {
                            setDiaTemp(d);
                            setShowDiaDropdown(false);
                          }}
                          style={styles.dropdownItem}
                        >
                          <Text style={{ color: '#111' }}>{d}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                <TextInput style={[styles.inputSmall, { flex: 1 }]} value={inicioTemp} onChangeText={setInicioTemp} placeholder='Inicio' />
                <TextInput style={[styles.inputSmall, { flex: 1 }]} value={finTemp} onChangeText={setFinTemp} placeholder='Fin' />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 }}>
                <Pressable
                  style={[styles.modalButton, styles.guardarButton]}
                  onPress={() => {
                    if (!inicioTemp || !finTemp) { Alert.alert('Horario inválido','Ingresa inicio y fin'); return; }
                    setHorarioEdit([...horarioEdit, { dia: diaTemp, inicio: inicioTemp, fin: finTemp }]);
                    setDiaTemp('Lunes'); setInicioTemp(''); setFinTemp('');
                  }}
                >
                  <Text style={styles.guardarButtonText}>Agregar</Text>
                </Pressable>
              </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditandoMateria(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.guardarButton]}
                onPress={handleActualizarMateria}
              >
                <Text style={styles.guardarButtonText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Editar Tarea */}
      <Modal visible={modalEditarTareaVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Tarea</Text>

              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                value={editarTitle}
                onChangeText={setEditarTitle}
                placeholder="Nombre de la tarea"
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={editarDesc}
                onChangeText={setEditarDesc}
                placeholder="Detalles de la tarea"
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Fecha de Entrega (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={editarFecha}
                onChangeText={setEditarFecha}
                placeholder="2026-04-15"
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalEditarTareaVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.guardarButton]}
                  onPress={handleActualizarTarea}
                >
                  <Text style={styles.guardarButtonText}>Guardar</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Crear Tarea */}
      <Modal visible={modalTareaVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Nueva Tarea</Text>

              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                value={titleTarea}
                onChangeText={setTitleTarea}
                placeholder="Nombre de la tarea"
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={descTarea}
                onChangeText={setDescTarea}
                placeholder="Detalles de la tarea"
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Fecha de Entrega (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={fechaTarea}
                onChangeText={setFechaTarea}
                placeholder="2026-04-15"
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalTareaVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.guardarButton]}
                  onPress={handleCrearTarea}
                >
                  <Text style={styles.guardarButtonText}>Crear</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <BottomNavigationBar onChange={() => {}} />
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
  materiaCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  materiaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  materiaInfo: {
    flex: 1,
  },
  materiaNombre: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  materiaProfesor: {
    fontSize: 16,
    color: "#7A8CA3",
    marginBottom: 4,
  },
  materiaSemestre: {
    fontSize: 14,
    color: "#666",
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  editButton: {
    backgroundColor: "#3D5A80",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  seccionTareas: {
    flex: 1,
  },
  headerTareas: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleTareas: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
  },
  addTareaButton: {
    padding: 8,
  },
  tareaCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tareaCompletada: {
    opacity: 0.6,
    backgroundColor: "#f0f0f0",
  },
  tareaCheckbox: {
    justifyContent: "center",
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#3D5A80",
  },
  checkboxCompleto: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  tareaContent: {
    flex: 1,
  },
  tareaTitulo: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  tareaTituloCompletada: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  tareaDesc: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  tareaFecha: {
    fontSize: 12,
    color: "#999",
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
  emptyTareas: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#7A8CA3",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  inputMultiline: {
    textAlignVertical: "top",
    minHeight: 80,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 20,
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
  guardarButton: {
    backgroundColor: "#3D5A80",
  },
  guardarButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  dropdownList: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    zIndex: 9999,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
});
