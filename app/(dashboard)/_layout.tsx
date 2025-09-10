import { Stack } from "expo-router";

export default function DashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(user)" options={{ headerShown: false }} />
      <Stack.Screen name="(vendor)" options={{ headerShown: false }} />
      <Stack.Screen name="(salesman)" options={{ headerShown: false }} />
    </Stack>
  );
}
