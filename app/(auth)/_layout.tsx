import { Stack } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import {
  checkAuthenticationStatus,
  navigateToDashboard,
} from "@/utils/authUtils";

export default function AuthLayout() {
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await checkAuthenticationStatus();
        if (authStatus.isAuthenticated && authStatus.userRole) {
          console.log(
            "User already authenticated in auth layout, redirecting to dashboard for role:",
            authStatus.userRole
          );
          navigateToDashboard(authStatus.userRole);
        }
      } catch (error) {
        console.error("Error checking authentication in auth layout:", error);
      }
    };

    checkAuth();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="role-selection" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="otp-verification" options={{ headerShown: false }} />
    </Stack>
  );
}
