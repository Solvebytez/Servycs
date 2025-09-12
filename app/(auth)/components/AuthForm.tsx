import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ResponsiveText } from "@/components/UI/ResponsiveText";
import { ResponsiveButton } from "@/components/UI/ResponsiveButton";
import { COLORS } from "@/constants";
import { responsiveSpacing, responsiveScale } from "@/constants";

interface AuthFormProps {
  activeTab: "login" | "signup";
  isLoading?: boolean;
  onSubmit: (
    email: string,
    password: string,
    confirmPassword?: string,
    fullName?: string,
    phone?: string
  ) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  activeTab,
  isLoading = false,
  onSubmit,
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (
    password: string
  ): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return {
        isValid: false,
        message: "Password must be at least 8 characters long",
      };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one lowercase letter",
      };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one uppercase letter",
      };
    }
    if (!/(?=.*\d)/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one number",
      };
    }
    return { isValid: true, message: "" };
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const handleSubmit = () => {
    if (activeTab === "login") {
      // Login validation
      if (!email || !password) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }
      if (!validateEmail(email)) {
        Alert.alert("Error", "Please enter a valid email address");
        return;
      }
      onSubmit(email, password);
    } else {
      // Signup validation
      if (!fullName || !email || !phone || !password || !confirmPassword) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      if (fullName.trim().length < 2) {
        Alert.alert("Error", "Full name must be at least 2 characters long");
        return;
      }

      if (!validateEmail(email)) {
        Alert.alert("Error", "Please enter a valid email address");
        return;
      }

      if (!validatePhone(phone)) {
        Alert.alert("Error", "Please enter a valid phone number");
        return;
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        Alert.alert("Error", passwordValidation.message);
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }

      onSubmit(email, password, confirmPassword, fullName, phone);
    }
  };

  return (
    <View style={styles.container}>
      {activeTab === "signup" && (
        <>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.text.secondary}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor={COLORS.text.secondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>
        </>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor={COLORS.text.secondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.passwordInputWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.text.secondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={responsiveScale(20)}
              color={COLORS.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === "signup" && (
        <View style={styles.inputContainer}>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm your password"
              placeholderTextColor={COLORS.text.secondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={responsiveScale(20)}
                color={COLORS.text.secondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ResponsiveButton
        title={
          isLoading
            ? "Please wait..."
            : activeTab === "login"
            ? "Log in"
            : "Sign up"
        }
        variant="primary"
        size="medium"
        fullWidth
        onPress={handleSubmit}
        disabled={isLoading}
        style={styles.submitButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: responsiveSpacing(16),
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: responsiveScale(8),
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(12),
    fontSize: responsiveScale(14),
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.primary,
  },
  passwordInputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: responsiveScale(8),
    paddingLeft: responsiveSpacing(16), // Keep left padding same as other inputs
    paddingRight: responsiveSpacing(50), // Make room for eye icon
    paddingVertical: responsiveSpacing(12),
    fontSize: responsiveScale(14),
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.primary,
  },
  eyeIcon: {
    position: "absolute",
    right: responsiveSpacing(16),
    padding: responsiveSpacing(4),
  },
  submitButton: {
    marginTop: responsiveSpacing(8),
  },
});

export default AuthForm;
