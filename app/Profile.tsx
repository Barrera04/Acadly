import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth } from "../firebaseConfig";
import BottomNavigationBar from "../src/Components/BottomNavigationBar";
import { useAuthUser } from "../src/hooks/useAuthUser";
import { useUserProfile } from "../src/hooks/useUserProfile";
import { actualizarNombreUsuario } from "../src/Services/firestoreService";

export default function Profile() {
  const router = useRouter();
  const { uid } = useAuthUser();
  const { profile, loading, error } = useUserProfile(uid);

  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.username) {
      setEditedUsername(profile.username);
    }
  }, [profile]);

  const handleSaveUsername = async () => {
    if (!uid) {
      Alert.alert("Error", "No se pudo identificar el usuario");
      return;
    }

    if (!editedUsername.trim()) {
      Alert.alert("Error", "El nombre de usuario no puede estar vacío");
      return;
    }

    if (editedUsername.trim().length < 3) {
      Alert.alert(
        "Error",
        "El nombre de usuario debe tener al menos 3 caracteres",
      );
      return;
    }

    try {
      setIsSaving(true);
      await actualizarNombreUsuario(uid, editedUsername);
      Alert.alert("Éxito", "Nombre de usuario actualizado correctamente");
      setIsEditing(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo actualizar el nombre");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Cerrar sesión",
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace("/login");
          } catch (err: any) {
            Alert.alert("Error", err.message || "Error al cerrar sesión");
          }
        },
        style: "destructive",
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color="#ef4444"
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.errorText}>Error al cargar el perfil</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            {auth.currentUser?.photoURL ? (
              <Image source={{ uri: auth.currentUser.photoURL }} style={{ width: 140, height: 140, borderRadius: 70 }} />
            ) : (
              <Text style={{ fontSize: 56, fontWeight: '700', color: '#3b82f6' }}>
                {(() => {
                  const name = profile?.username || auth.currentUser?.displayName || auth.currentUser?.email || 'U';
                  const parts = name.trim().split(' ');
                  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
                  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
                })()}
              </Text>
            )}
          </View>
        </View>

        {/* Username Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nombre de Usuario</Text>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={editedUsername}
                onChangeText={setEditedUsername}
                placeholder="Ingresa tu nombre de usuario"
                editable={!isSaving}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.smallButton, styles.cancelButton]}
                  onPress={() => {
                    setIsEditing(false);
                    setEditedUsername(profile?.username || "");
                  }}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallButton, styles.saveButton]}
                  onPress={handleSaveUsername}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#ffff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.displayContainer}>
              <Text style={styles.usernameDisplay}>{profile?.username}</Text>
              <Pressable
                style={styles.editIconButton}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="pencil" size={18} color="#3b82f6" />
              </Pressable>
            </View>
          )}
        </View>

        {/* UID Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ID de Usuario</Text>
          <View style={styles.uidContainer}>
            <Text style={styles.uidText} numberOfLines={2}>
              {uid}
            </Text>
            <Pressable
              style={styles.copyButton}
              onPress={() => {
                // Copiar al portapapeles (si necesitas, agrega react-native-clipboard)
                Alert.alert(
                  "ID Copiado",
                  "El ID de usuario se ha copiado al portapapeles",
                );
              }}
            >
              <Ionicons name="copy" size={18} color="#3b82f6" />
            </Pressable>
          </View>
        </View>

        {/* Email Section */}
        {profile?.correo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Correo Electrónico</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>{profile.correo}</Text>
            </View>
          </View>
        )}

        {/* Account Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de la Cuenta</Text>
          {profile?.createdAt && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>
                Cuenta creada:{" "}
                {new Date(
                  typeof profile.createdAt === "object" &&
                    "toDate" in profile.createdAt
                    ? profile.createdAt.toDate()
                    : profile.createdAt,
                ).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#ffff" />
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigationBar active="Perfil" onChange={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  header: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ef4444",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  displayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  usernameDisplay: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  editIconButton: {
    padding: 8,
    marginLeft: 8,
  },
  editContainer: {
    gap: 12,
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  smallButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: "#E5E7EB",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#3b82f6",
  },
  saveButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  uidContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  uidText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "monospace",
    flex: 1,
  },
  copyButton: {
    padding: 8,
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoText: {
    fontSize: 16,
    color: "#1F2937",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    elevation: 2,
    shadowColor: "#ef4444",
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
});
