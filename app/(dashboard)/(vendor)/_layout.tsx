import { Stack } from "expo-router";

export default function VendorStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="services" />
      <Stack.Screen name="bookings" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="my-list" />
      <Stack.Screen name="add-listing" />
      <Stack.Screen name="my-promotions" />
      <Stack.Screen name="create-promotion" />
      <Stack.Screen name="reviews" />
    </Stack>
  );
}
