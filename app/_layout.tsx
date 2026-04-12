import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
      initialRouteName="login"
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="HomeScreen" />
      <Stack.Screen name="Materias" />
      <Stack.Screen name="MateriaDetail" />
      <Stack.Screen name="Asiggment" />
      <Stack.Screen name="Homewoorks" />
      <Stack.Screen name="Schedule" />
      <Stack.Screen name="Profile" />
    </Stack>
  );
}
