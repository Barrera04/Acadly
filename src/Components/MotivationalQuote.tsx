import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MotivationalQuoteProps {
  quote?: string;
  pendingCount?: number;
}

const MOTIVATIONAL_QUOTES = [
  "Un paso a la vez también es progreso.",
  "El éxito es la suma de pequeños esfuerzos.",
  "No importa tu ritmo, sigue adelante.",
  "Cada día es una nueva oportunidad para aprender.",
  "El difícil es el primer paso, lo demás es constancia.",
  "Tú eres más fuerte de lo que crees.",
  "La dedicación hoy es éxito mañana.",
  "Nunca es tarde para perseguir tus sueños.",
  "Mi única competencia soy yo mismo.",
  "El conocimiento es el mejor regalo que puedes darte.",
  "Aprende hoy, enseña mañana.",
  "Tú puedes lograr cualquier cosa que te propongas.",
];

export default function MotivationalQuote({
  quote: propQuote,
  pendingCount = 2,
}: MotivationalQuoteProps) {
  const [randomQuote, setRandomQuote] = useState<string>(propQuote || "");

  useEffect(() => {
    if (!propQuote) {
      const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
      setRandomQuote(MOTIVATIONAL_QUOTES[randomIndex]);
    } else {
      setRandomQuote(propQuote);
    }
  }, [propQuote]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.lightBulbCircle}>
          <Ionicons name="bulb" size={24} color="#fff" />
        </View>
        <Text style={styles.headerText}>Pendientes: {pendingCount}</Text>
      </View>

      <Text style={styles.quote}>{randomQuote}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 12,
    // Shadow iOS
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    // Elevation Android
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#3b82f6",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  lightBulbCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    // Shadow
    shadowColor: "#f59e0b",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },

  headerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  quote: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
    lineHeight: 22,
    fontStyle: "italic",
    marginLeft: 52,
  },
});
