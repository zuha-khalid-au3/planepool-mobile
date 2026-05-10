import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithPhone, confirmOtp, state } = useAuth();
  const router = useRouter();

  const handlePhoneSubmit = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithPhone(phoneNumber);
      if (!state.error) {
        setStep(2);
      } else {
        Alert.alert('Error', state.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    setIsLoading(true);
    try {
      await confirmOtp(phoneNumber, otp);
      if (!state.error) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', state.error);
      }
    } catch (error) {
      Alert.alert('Error', 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${(step / 2) * 100}%` }]} />
        </View>

        {step === 1 ? (
          <>
            {/* Step 1: Phone Verification */}
            <View style={styles.header}>
              <Text style={styles.title}>Verify Your Phone</Text>
              <Text style={styles.subtitle}>We'll send you an OTP to verify your number</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneInputContainer}>
                  <Text style={styles.countryCode}>+1</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="(555) 123-4567"
                    placeholderTextColor="#999"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    editable={!isLoading}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {state.error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{state.error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handlePhoneSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Step 2: OTP Verification */}
            <View style={styles.header}>
              <Text style={styles.title}>Enter OTP</Text>
              <Text style={styles.subtitle}>We sent a 6-digit code to {phoneNumber}</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>OTP Code</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="000000"
                  placeholderTextColor="#999"
                  value={otp}
                  onChangeText={setOtp}
                  editable={!isLoading}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              {state.error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{state.error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleOtpSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => setStep(1)}
              >
                <Text style={styles.resendText}>Didn't receive the code? Resend</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Skip */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 40,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  countryCode: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  otpInput: {
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#fee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    color: '#007AFF',
    fontSize: 14,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  skipText: {
    color: '#999',
    fontSize: 14,
  },
});
