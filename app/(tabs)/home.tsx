import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, MARGIN } from '../../constants';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Text style={styles.subtitle}>Welcome to the home screen!</Text>
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
    marginBottom: MARGIN.md,
  },
  subtitle: {
    fontSize: FONT_SIZE.body1,
    color: COLORS.text.secondary,
  },
});
