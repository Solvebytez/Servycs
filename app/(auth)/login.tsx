import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Welcome to Listro</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.text.secondary,
    marginBottom: 40,
  },
});
