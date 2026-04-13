import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, GoogleAuthProvider, reload, sendEmailVerification, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useContext, useState } from "react";
import {
    Alert,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { UserContext } from "../src/context/UserContext";

// Función para validar email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function Register() {
  const router = useRouter();
  const userContext = useContext(UserContext);

  const [username, setUsername] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (
      !username.trim() ||
      !correo.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert(
        "⚠️ Campos incompletos",
        "Por favor completa todos los campos",
      );
      return;
    }

    if (username.trim().length < 3) {
      Alert.alert(
        "⚠️ Nombre de usuario inválido",
        "El nombre de usuario debe tener al menos 3 caracteres",
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

    if (password !== confirmPassword) {
      Alert.alert(
        "⚠️ Contraseñas no coinciden",
        "Las contraseñas ingresadas no son iguales",
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "⚠️ Contraseña débil",
        "La contraseña debe tener al menos 6 caracteres",
      );
      return;
    }

    try {
      console.log("[REGISTRO] Iniciando creación de usuario...");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        correo,
        password,
      );
      const uid = userCredential.user.uid;

      console.log("[REGISTRO] Usuario creado en Firebase, UID:", uid);
      console.log("[REGISTRO] Guardando datos en Firestore...");

      // Guardar el nombre de usuario en Firestore
      try {
        await setDoc(doc(db, "users", uid), {
          username: username.trim(),
          correo: correo.trim(),
          createdAt: new Date(),
        });
        console.log("[REGISTRO EXITOSO] Datos guardados en Firestore");
      } catch (firestoreError: any) {
        console.log(
          "[REGISTRO] Error al guardar en Firestore:",
          firestoreError.message,
        );
        // Continuar de todas formas - el usuario fue creado en Auth
        console.log("[REGISTRO] Continuando sin guardar en Firestore...");
      }

      console.log("[REGISTRO EXITOSO] Usuario registrado correctamente");
      console.log("[REGISTRO EXITOSO] UID:", uid);
      console.log("[REGISTRO EXITOSO] Nombre de usuario:", username);
      console.log("[REGISTRO EXITOSO] Correo:", correo);

      // Enviar email de verificación
      try {
        await sendEmailVerification(userCredential.user);
        console.log("[REGISTRO] Email de verificación enviado");
      } catch (e: any) {
        console.warn("[REGISTRO] Error enviando email de verificación:", e.message);
      }

      // Guardar contexto
      userContext.setUid(userCredential.user.uid);
      userContext.setUsername(username);

      Alert.alert(
        "✅ Cuenta creada",
        "Se envió un correo de verificación. Por favor verifica tu email y luego presiona 'Ya verifiqué' para continuar.",
        [
          {
            text: "Ya verifiqué",
            onPress: async () => {
              try {
                await reload(userCredential.user);
                if (userCredential.user.emailVerified) {
                  router.replace("/login");
                } else {
                  Alert.alert("Aún no verificado", "No hemos detectado la verificación. Revisa tu correo y luego pulsa 'Ya verifiqué'.");
                }
              } catch (e: any) {
                Alert.alert("Error", e.message || "No se pudo comprobar la verificación");
              }
            },
          },
          {
            text: "Cerrar",
            style: "cancel",
          },
        ],
        { cancelable: false },
      );
    } catch (error: any) {
      console.log("[REGISTRO FALLIDO] Error completo:", error);
      console.log("[REGISTRO FALLIDO] Mensaje:", error.message);
      console.log("[REGISTRO FALLIDO] Código de error:", error.code);

      let mensajeError = "Error al registrarse";
      let titulo = "❌ Error de registro";

      if (error.code === "auth/too-many-requests") {
        mensajeError =
          "Demasiados intentos. Tu IP ha sido bloqueada temporalmente por seguridad. Por favor intenta de nuevo en unos minutos.";
      } else if (error.code === "auth/email-already-in-use") {
        mensajeError =
          "Este correo ya está registrado. ¿Quizás quieras iniciar sesión?";
      } else if (error.code === "auth/invalid-email") {
        mensajeError = "El correo ingresado no es válido";
      } else if (error.code === "auth/weak-password") {
        mensajeError = "La contraseña es muy débil. Usa al menos 6 caracteres";
      } else if (error.code === "auth/operation-not-allowed") {
        mensajeError = "El registro está deshabilitado temporalmente";
      } else if (error.message) {
        mensajeError = error.message;
      }

      Alert.alert(titulo, mensajeError);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Nombre de usuario"
          placeholderTextColor="#7A8CA3"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

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

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Confirmar contraseña"
          placeholderTextColor="#7A8CA3"
          secureTextEntry={!showConfirmPassword}
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <Pressable
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.eyeIcon}
        >
          <Text style={styles.eyeText}>
            {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
          </Text>
        </Pressable>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      {/* Google Register Button (web-only) */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#DB4437', marginTop: 12 }]}
        onPress={async () => {
          if (Platform.OS !== 'web') {
            Alert.alert('Registro con Google', 'El registro con Google solo está disponible en la versión web.');
            return;
          }
          try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            // Si es nuevo usuario, crear perfil en Firestore
            const user = result.user;
            try {
              await setDoc(doc(db, 'users', user.uid), {
                username: user.displayName || (user.email ? user.email.split('@')[0] : 'Usuario'),
                correo: user.email || '',
                createdAt: new Date(),
                photoURL: user.photoURL || null,
              });
            } catch (e) {
              console.warn('[REGISTRO GOOGLE] No se pudo guardar perfil:', e);
            }
            Alert.alert('Registro con Google', 'Registro exitoso. Serás redirigido al inicio.');
            router.replace('/HomeScreen');
          } catch (err: any) {
            Alert.alert('Error', err.message || 'No se pudo registrar con Google');
          }
        }}
      >
        <Text style={styles.buttonText}>Registrarse con Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Volver al login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#F4F7FB",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#3D5A80",
    textAlign: "center",
    marginBottom: 30,
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
  input: {
    fontSize: 16,
    color: "#333",
    flex: 1,
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
