import { Tabs } from 'expo-router';
import { COLORS, FONT_SIZE } from '../../constants';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary[200],
        tabBarInactiveTintColor: COLORS.text.secondary,
        tabBarStyle: {
          backgroundColor: COLORS.background.primary,
          borderTopColor: COLORS.border.light,
        },
        headerStyle: {
          backgroundColor: COLORS.background.primary,
        },
        headerTintColor: COLORS.text.primary,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: FONT_SIZE.h4 }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: FONT_SIZE.h4 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
