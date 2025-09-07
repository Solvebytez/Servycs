import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONT_SIZE, PADDING, MARGIN } from "../../constants";
import { ResponsiveText } from "../../components";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <ResponsiveText
        variant="h1"
        weight="bold"
        color={COLORS.text.primary}
        style={styles.title}
      >
        Login
      </ResponsiveText>
      <ResponsiveText
        variant="h4"
        color={COLORS.text.secondary}
        style={styles.subtitle}
      >
        Welcome to Listro
      </ResponsiveText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background.primary,
    padding: PADDING.lg,
  },
  title: {
    marginBottom: MARGIN.md,
  },
  subtitle: {
    marginBottom: MARGIN.xl,
  },
});
