import { useAuthUser } from "@/src/hooks/useAuthUser";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { auth } from "../../firebaseConfig";

export default function TopBar({ name = "Acadly", greeting = "Hola 👋" }) {
  const { uid } = useAuthUser();
  const { profile, loading } = useUserProfile(uid);

  // Generar saludos del tiempo del día
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const displayName = profile?.username || "Usuario";
  const timeGreeting = getTimeGreeting();

  const firebaseUser = auth.currentUser;
  const photoURL = firebaseUser?.photoURL || null;
  const computeInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <View style={styles.container}>
      {/* TopBar - Muestra el nombre del usuario y saludo personalizado */}
      <View style={styles.left}>
        {loading ? (
          <>
            <View
              style={{
                height: 30,
                width: 100,
                backgroundColor: "rgba(255,255,255,0.3)",
                borderRadius: 4,
                marginBottom: 4,
              }}
            />
            <View
              style={{
                height: 14,
                width: 150,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 3,
              }}
            />
          </>
        ) : (
          <>
            <Text style={styles.title} numberOfLines={1}>
              {timeGreeting}, {displayName} 👋
            </Text>
            <Text style={styles.subtitle}>{name}</Text>
          </>
        )}
      </View>

      <View style={styles.right}>
        <View style={styles.userCircle}>
          {loading ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{computeInitials(profile?.username || firebaseUser?.displayName || firebaseUser?.email || 'U')}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 150,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  left: {
    flexDirection: "column",
    justifyContent: "center",
    flex: 1,
  },

  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
  },

  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 4,
  },

  right: {
    alignItems: "center",
    justifyContent: "center",
  },

  userCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
