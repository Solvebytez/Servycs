import { Stack } from "expo-router";
import { useEffect } from "react";

export default function DashboardLayout() {
  useEffect(() => {
    console.log("DashboardLayout: Component mounted");
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(user)" options={{ headerShown: false }} />
      <Stack.Screen name="(vendor)" options={{ headerShown: false }} />
      <Stack.Screen name="(salesman)" options={{ headerShown: false }} />
    </Stack>
  );
}
