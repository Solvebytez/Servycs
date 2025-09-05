import { Stack } from 'expo-router';

export default function UserLayout() {
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
