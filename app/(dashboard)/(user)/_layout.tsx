import { Stack } from "expo-router";
import { useEffect } from "react";

export default function UserLayout() {
  useEffect(() => {
    console.log("UserLayout: Component mounted");
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="search" />
      <Stack.Screen name="services" />
      <Stack.Screen name="bookings" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
