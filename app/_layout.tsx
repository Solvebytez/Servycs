import { Stack } from "expo-router";
import { useEffect } from "react";
import { QueryProvider } from "../providers/QueryProvider";

export default function RootLayout() {
  useEffect(() => {
    console.log("RootLayout: Component mounted");
  }, []);

  return (
    <QueryProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
      </Stack>
    </QueryProvider>
  );
}
