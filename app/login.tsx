import { useRouter } from "expo-router";
import {
    GoogleAuthProvider,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import { useContext, useState } from "react";
import {
    Alert, Platform, Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { auth } from "../firebaseConfig";
import { UserContext } from "../src/context/UserContext";
import {
    crearPerfilUsuarioSiNoExiste,
    obtenerPerfilUsuario,
} from "../src/Services/firestoreService";

// Función para validar email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function Login() {
  const router = useRouter();
  const userContext = useContext(UserContext);

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!correo.trim() || !password.trim()) {
      Alert.alert(
        "⚠️ Campos incompletos",
        "Por favor completa todos los campos",
      );
      return;
    }

    if (!validateEmail(correo.trim())) {
      Alert.alert(
        "⚠️ Correo inválido",
        "Por favor ingresa un correo electrónico válido",
      );
      return;
    }

    try {
      console.log("[LOGIN] Iniciando sesión...");

      const userCredential = await signInWithEmailAndPassword(
        auth,
        correo.trim(),
        password.trim(),
      );

      // Verificar que el email esté verificado
      if (!userCredential.user.emailVerified) {
        try {
          await sendEmailVerification(userCredential.user);
        } catch (e) {
          console.warn('[LOGIN] Error enviando email de verificación:', e);
        }
        Alert.alert(
          'Email no verificado',
          'Hemos enviado un correo de verificación. Verifica tu email antes de iniciar sesión.',
        );
        await signOut(auth);
        return;
      }

      console.log("[LOGIN EXITOSO] Sesión iniciada correctamente");
      console.log("[LOGIN EXITOSO] UID:", userCredential.user.uid);
      console.log("[LOGIN EXITOSO] Correo:", userCredential.user.email);

      // Guardar UID en el contexto
      userContext.setUid(userCredential.user.uid);

      // Obtener el username desde Firestore
      try {
        const profile = await obtenerPerfilUsuario(userCredential.user.uid);
        if (profile?.username) {
          userContext.setUsername(profile.username);
          console.log("[LOGIN] Username obtenido:", profile.username);
        }
      } catch (profileError) {
        console.warn("[LOGIN] Error al obtener perfil:", profileError);
        // No es un error crítico, continuar con login
      }

      router.replace("/HomeScreen");
    } catch (error: any) {
      console.log("[LOGIN FALLIDO] Error completo:", error);
      console.log("[LOGIN FALLIDO] Mensaje:", error.message);
      console.log("[LOGIN FALLIDO] Código de error:", error.code);

      let mensajeError = "Error al iniciar sesión";

      if (error.code === "auth/too-many-requests") {
        mensajeError =
          "Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente por seguridad. Por favor intenta de nuevo en unos minutos.";
      } else if (error.code === "auth/user-not-found") {
        mensajeError = "El usuario no existe. ¿Quizás quieras registrarte?";
      } else if (error.code === "auth/wrong-password") {
        mensajeError = "La contraseña es incorrecta";
      } else if (error.code === "auth/invalid-email") {
        mensajeError = "El correo ingresado no es válido";
      } else if (error.code === "auth/user-disabled") {
        mensajeError = "La cuenta ha sido deshabilitada";
      } else if (error.message) {
        mensajeError = error.message;
      }

      Alert.alert("❌ Error de login", mensajeError);
    }
  };

  const handleGoogleSignIn = async () => {
    if (Platform.OS !== "web") {
      Alert.alert(
        "Google Sign-In no disponible",
        "Google Sign-In está disponible solo en la versión web por ahora.",
      );
      return;
    }

    try {
      console.log("[GOOGLE] Iniciando signInWithPopup...");
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const user = result.user;
      console.log("[GOOGLE] UID:", user.uid, "email:", user.email);

      userContext.setUid(user.uid);

      const displayName = user.displayName || (user.email ? user.email.split("@")[0] : "Usuario");
      userContext.setUsername(displayName);

      // Crear perfil en Firestore si es la primera vez
      try {
        await crearPerfilUsuarioSiNoExiste(user.uid, user.email || "", displayName);
      } catch (e) {
        console.warn("[GOOGLE] Error creando perfil en Firestore:", e);
      }

      router.replace("/HomeScreen");
    } catch (error: any) {
      console.error("[GOOGLE] Error en signInWithPopup:", error);
      const msg = error?.message || "Error en Google Sign-In";
      Alert.alert("Error Google Sign-In", msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Acadly</Text>
      <Text style={styles.subtitle}>Organiza tu vida académica</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Correo"
          placeholderTextColor="#7A8CA3"
          style={styles.input}
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#7A8CA3"
          secureTextEntry={!showPassword}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <Pressable
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Text style={styles.eyeText}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
        </Pressable>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleGoogleSignIn}
        style={[styles.button, { backgroundColor: "#FFFFFF", marginTop: 12 }]}
      >
        <Text style={[styles.buttonText, { color: "#000" }]}>Iniciar sesión con Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logo: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#3D5A80",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    textAlign: "center",
    color: "#7A8CA3",
    marginBottom: 40,
    fontSize: 16,
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  passwordContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  eyeIcon: {
    padding: 10,
    justifyContent: "center",
  },
  eyeText: {
    fontSize: 18,
  },
  button: {
    backgroundColor: "#3D5A80",
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#3D5A80",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    textAlign: "center",
    marginTop: 20,
    color: "#3D5A80",
  },
});
