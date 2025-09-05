import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { COLORS, FONT_SIZE, MARGIN, SPACING } from '../constants';

// Keep the splash screen visible while we fetch resources
ExpoSplashScreen.preventAutoHideAsync();

export default function SplashScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  console.log('SplashScreen component is rendering!');

  useEffect(() => {
    console.log('SplashScreen useEffect running');
    
    // Hide the default Expo splash screen immediately
    ExpoSplashScreen.hideAsync();
    
    // Simulate loading time and check authentication
    const timer = setTimeout(() => {
      try {
        // TODO: Check if user is authenticated and get user role
        const isAuthenticated = false; // Replace with actual auth check
        
        console.log('Navigating based on authentication...');
        if (isAuthenticated) {
          // If user is already authenticated, go to their dashboard
          // TODO: Get user role from token and navigate accordingly
          router.replace('/(dashboard)/(user)/home');
        } else {
          // If not authenticated, go to role selection first
          router.replace('/(auth)/role-selection');
        }
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback to role selection if navigation fails
        router.replace('/(auth)/role-selection');
      } finally {
        setIsLoading(false);
      }
    }, 3000); // Reduced to 3 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary[200], '#E0F7FF', COLORS.background.primary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.7, 1]}
      >
        <View style={styles.content}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          {isLoading && (
            <Text style={styles.loadingText}>Loading...</Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: MARGIN.lg,
  },
  logoText: {
    fontSize: FONT_SIZE.display1,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: MARGIN.lg,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  loadingText: {
    fontSize: FONT_SIZE.body1,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: MARGIN.md,
  },
});
