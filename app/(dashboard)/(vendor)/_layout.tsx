import { Tabs } from 'expo-router';
import { COLORS } from '../../../constants';
import { Text } from 'react-native';

export default function VendorTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary[200],
        tabBarInactiveTintColor: COLORS.text.secondary,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabBarIcon name="dashboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color }) => <TabBarIcon name="services" color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color }) => <TabBarIcon name="bookings" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="profile" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabBarIcon({ name, color }: { name: string; color: string }) {
  return (
    <Text style={{ color, fontSize: 20 }}>
      {name === 'dashboard' && '📊'}
      {name === 'services' && '🛠️'}
      {name === 'bookings' && '📅'}
      {name === 'profile' && '👤'}
    </Text>
  );
}
