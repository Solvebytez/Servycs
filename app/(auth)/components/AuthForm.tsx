import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert } from 'react-native';
import { ResponsiveText } from '@/components/UI/ResponsiveText';
import { ResponsiveButton } from '@/components/UI/ResponsiveButton';
import { COLORS } from '@/constants';
import { responsiveSpacing, responsiveScale } from '@/constants';

interface AuthFormProps {
  activeTab: 'login' | 'signup';
  onSubmit: (email: string, password: string, confirmPassword?: string, fullName?: string, phone?: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ activeTab, onSubmit }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    if (activeTab === 'login') {
      if (!email || !password) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      onSubmit(email, password);
    } else {
      // Signup validation
      if (!fullName || !email || !phone || !password || !confirmPassword) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      onSubmit(email, password, confirmPassword, fullName, phone);
    }
  };

  return (
    <View style={styles.container}>
      {activeTab === 'signup' && (
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
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor={COLORS.text.secondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      {activeTab === 'signup' && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor={COLORS.text.secondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
      )}

      <ResponsiveButton
        title={activeTab === 'login' ? 'Log in' : 'Sign up'}
        variant="primary"
        size="medium"
        fullWidth
        onPress={handleSubmit}
        style={styles.submitButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
  submitButton: {
    marginTop: responsiveSpacing(8),
  },
});

export default AuthForm;
