import { Tabs } from 'expo-router';
import { COLORS } from '../../../constants';
import { Text } from 'react-native';

export default function UserTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary[200],
        tabBarInactiveTintColor: COLORS.text.secondary,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabBarIcon({ name, color }: { name: string; color: string }) {
  return (
    <Text style={{ color, fontSize: 20 }}>
      {name === 'home' && '🏠'}
      {name === 'search' && '🔍'}
      {name === 'calendar' && '📅'}
      {name === 'person' && '👤'}
    </Text>
  );
}
