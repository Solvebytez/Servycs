import { Tabs } from 'expo-router';
import { COLORS } from '../../../constants';
import { Text } from 'react-native';

export default function SalesmanTabsLayout() {
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
        name="vendors"
        options={{
          title: 'Vendors',
          tabBarIcon: ({ color }) => <TabBarIcon name="vendors" color={color} />,
        }}
      />
      <Tabs.Screen
        name="targets"
        options={{
          title: 'Targets',
          tabBarIcon: ({ color }) => <TabBarIcon name="targets" color={color} />,
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
      {name === 'vendors' && '🏪'}
      {name === 'targets' && '🎯'}
      {name === 'profile' && '👤'}
    </Text>
  );
}
