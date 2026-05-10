import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const validateForm = () => {
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.changePassword(
        formData.currentPassword,
        formData.newPassword
      );

      if (response.success) {
        Alert.alert('Success', 'Password changed successfully!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to change password');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while changing password');
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordInput = ({
    label,
    field,
    value,
    error,
  }: {
    label: string;
    field: 'currentPassword' | 'newPassword' | 'confirmPassword';
    value: string;
    error: string;
  }) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error && styles.inputContainerError]}>
        <TextInput
          style={styles.input}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#999"
          secureTextEntry={!showPasswords[field]}
          value={value}
          onChangeText={(text) =>
            setFormData({ ...formData, [field]: text })
          }
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={() =>
            setShowPasswords({
              ...showPasswords,
              [field]: !showPasswords[field],
            })
          }
        >
          <MaterialCommunityIcons
            name={showPasswords[field] ? 'eye' : 'eye-off'}
            size={20}
            color="#999"
          />
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Change Password</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <MaterialCommunityIcons name="shield-check" size={20} color="#2196f3" />
          <Text style={styles.infoBannerText}>
            Keep your account secure by using a strong password
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <PasswordInput
            label="Current Password"
            field="currentPassword"
            value={formData.currentPassword}
            error={errors.currentPassword}
          />

          <PasswordInput
            label="New Password"
            field="newPassword"
            value={formData.newPassword}
            error={errors.newPassword}
          />

          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <View style={styles.strengthIndicator}>
              <Text style={styles.strengthLabel}>Password Strength:</Text>
              <View style={styles.strengthBars}>
                <View
                  style={[
                    styles.strengthBar,
                    formData.newPassword.length >= 8 && styles.strengthBarFilled,
                  ]}
                />
                <View
                  style={[
                    styles.strengthBar,
                    formData.newPassword.length >= 12 && styles.strengthBarFilled,
                  ]}
                />
                <View
                  style={[
                    styles.strengthBar,
                    formData.newPassword.match(/[A-Z]/) &&
                      formData.newPassword.match(/[0-9]/) &&
                      styles.strengthBarFilled,
                  ]}
                />
              </View>
            </View>
          )}

          <PasswordInput
            label="Confirm Password"
            field="confirmPassword"
            value={formData.confirmPassword}
            error={errors.confirmPassword}
          />

          {/* Password Requirements */}
          <View style={styles.requirementsSection}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <View style={styles.requirement}>
              <MaterialCommunityIcons
                name={formData.newPassword.length >= 8 ? 'check-circle' : 'circle'}
                size={16}
                color={formData.newPassword.length >= 8 ? '#4caf50' : '#ddd'}
              />
              <Text style={styles.requirementText}>At least 8 characters</Text>
            </View>
            <View style={styles.requirement}>
              <MaterialCommunityIcons
                name={formData.newPassword.match(/[A-Z]/) ? 'check-circle' : 'circle'}
                size={16}
                color={formData.newPassword.match(/[A-Z]/) ? '#4caf50' : '#ddd'}
              />
              <Text style={styles.requirementText}>One uppercase letter</Text>
            </View>
            <View style={styles.requirement}>
              <MaterialCommunityIcons
                name={formData.newPassword.match(/[0-9]/) ? 'check-circle' : 'circle'}
                size={16}
                color={formData.newPassword.match(/[0-9]/) ? '#4caf50' : '#ddd'}
              />
              <Text style={styles.requirementText}>One number</Text>
            </View>
          </View>
        </View>

        {/* Change Button */}
        <TouchableOpacity
          style={[styles.changeButton, isLoading && styles.changeButtonDisabled]}
          onPress={handleChangePassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.changeButtonText}>Change Password</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#1565c0',
    marginLeft: 12,
    flex: 1,
  },
  formSection: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputContainerError: {
    borderColor: '#f44336',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  strengthIndicator: {
    marginBottom: 16,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
  },
  strengthBarFilled: {
    backgroundColor: '#4caf50',
  },
  requirementsSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  changeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  changeButtonDisabled: {
    opacity: 0.6,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
