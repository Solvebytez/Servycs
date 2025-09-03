import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE } from '../../constants';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Select your role to continue</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  title: {
    fontSize: FONT_SIZE.h1,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: FONT_SIZE.body1,
    color: COLORS.text.secondary,
  },
});
