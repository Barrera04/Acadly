import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface BottomNavigationBarProps {
  active?: string;
  onChange?: (label: string) => void;
}

export default function BottomNavigationBar({
  active = "Inicio",
  onChange,
}: BottomNavigationBarProps) {
  const router = useRouter();

  const handleChange = (label: string) => {
    if (onChange) {
      onChange(label);
    }
    if (label === "Inicio") {
      router.navigate("/(tabs)" as any);
    }
    if (label === "Tareas") {
      router.navigate("/Homewoorks" as any);
    }
    if (label === "Materias") {
      router.navigate("/Materias" as any);
    }
    if (label === "Horario") {
      router.navigate("/Schedule" as any);
    }
    if (label === "Perfil") {
      router.navigate("/Profile" as any);
    }
  };

  interface ItemProps {
    label: string;
    icon: string;
  }

  const Item = ({ label, icon }: ItemProps) => {
    const isActive = active === label;

    return (
      <Pressable
        onPress={() => handleChange(label)}
        style={({ pressed }) => [
          styles.button,
          isActive && styles.activeButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name={icon as any}
          size={22}
          color={isActive ? "#2563EB" : "#6B7280"}
        />
        <Text style={[styles.buttonText, isActive && styles.activeText]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Item label="Inicio" icon="home-outline" />
      <Item label="Materias" icon="book-outline" />
      <Item label="Tareas" icon="checkmark-done-outline" />
      <Item label="Horario" icon="calendar-outline" />
      <Item label="Perfil" icon="person-outline" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
  button: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 11,
    marginTop: 4,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeButton: {
    backgroundColor: "#EFF6FF",
  },
  activeText: {
    color: "#2563EB",
    fontWeight: "600",
  },
});
