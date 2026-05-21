import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';

interface KYCStatus {
  status: 'pending' | 'verified' | 'rejected';
  idVerified: boolean;
  selfieVerified: boolean;
  ticketVerified: boolean;
  rejectionReason?: string;
}

export default function KYCVerificationScreen() {
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<'id' | 'selfie' | 'ticket' | null>(null);
  const router = useRouter();
  const { state } = useAuth();

  useEffect(() => {
    loadKycStatus();
  }, []);

  const loadKycStatus = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getKycStatus();
      if (response.success && response.data) {
        setKycStatus(response.data);
      }
    } catch (error) {
      console.error('Error loading KYC status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadDocument = async (type: 'id' | 'selfie' | 'ticket') => {
    // In a real app, this would open a file picker or camera
    Alert.alert(
      'Upload Document',
      `Upload your ${type === 'id' ? 'Government ID' : type === 'selfie' ? 'Selfie' : 'Flight Ticket'}`,
      [
        {
          text: 'Take Photo',
          onPress: () => simulateUpload(type),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => simulateUpload(type),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const simulateUpload = async (type: 'id' | 'selfie' | 'ticket') => {
    setIsUploading(true);
    try {
      // Simulate file upload
      const mockFile = {
        uri: 'file://mock-image.jpg',
        type: 'image/jpeg',
        name: `${type}-document.jpg`,
      };

      const response = await apiClient.uploadKycDocument(type, mockFile);
      if (response.success) {
        Alert.alert('Success', `${type} uploaded successfully!`);
        await loadKycStatus();
      } else {
        Alert.alert('Error', response.error || 'Failed to upload document');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while uploading');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading KYC status...</Text>
        </View>
      </View>
    );
  }

  const isVerified = kycStatus?.status === 'verified';
  const isRejected = kycStatus?.status === 'rejected';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Identity Verification</Text>
          <Text style={styles.subtitle}>Complete your KYC to build trust</Text>
        </View>

        {/* Status Banner */}
        {isVerified && (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerIcon}>✓</Text>
            <Text style={styles.successBannerText}>Your identity is verified!</Text>
          </View>
        )}

        {isRejected && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerIcon}>⚠</Text>
            <View>
              <Text style={styles.errorBannerTitle}>Verification Rejected</Text>
              <Text style={styles.errorBannerText}>{kycStatus?.rejectionReason}</Text>
            </View>
          </View>
        )}

        {/* Documents */}
        <View style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>Required Documents</Text>

          {/* Government ID */}
          <View
            style={[
              styles.documentCard,
              kycStatus?.idVerified && styles.documentCardVerified,
            ]}
          >
            <View style={styles.documentHeader}>
              <View>
                <Text style={styles.documentName}>Government ID</Text>
                <Text style={styles.documentDescription}>
                  Passport, Driver{"'"}s License, or National ID
                </Text>
              </View>
              {kycStatus?.idVerified && <Text style={styles.verifiedIcon}>✓</Text>}
            </View>

            {!kycStatus?.idVerified && (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handleUploadDocument('id')}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="#007AFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.uploadButtonIcon}>📸</Text>
                    <Text style={styles.uploadButtonText}>Upload ID</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Selfie */}
          <View
            style={[
              styles.documentCard,
              kycStatus?.selfieVerified && styles.documentCardVerified,
            ]}
          >
            <View style={styles.documentHeader}>
              <View>
                <Text style={styles.documentName}>Selfie with ID</Text>
                <Text style={styles.documentDescription}>
                  Take a photo holding your ID to verify your identity
                </Text>
              </View>
              {kycStatus?.selfieVerified && <Text style={styles.verifiedIcon}>✓</Text>}
            </View>

            {!kycStatus?.selfieVerified && (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handleUploadDocument('selfie')}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="#007AFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.uploadButtonIcon}>🤳</Text>
                    <Text style={styles.uploadButtonText}>Take Selfie</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Flight Ticket */}
          <View
            style={[
              styles.documentCard,
              kycStatus?.ticketVerified && styles.documentCardVerified,
            ]}
          >
            <View style={styles.documentHeader}>
              <View>
                <Text style={styles.documentName}>Flight Ticket</Text>
                <Text style={styles.documentDescription}>
                  Screenshot or PDF of your flight booking confirmation
                </Text>
              </View>
              {kycStatus?.ticketVerified && <Text style={styles.verifiedIcon}>✓</Text>}
            </View>

            {!kycStatus?.ticketVerified && (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handleUploadDocument('ticket')}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="#007AFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.uploadButtonIcon}>🎫</Text>
                    <Text style={styles.uploadButtonText}>Upload Ticket</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Trust Score */}
        {isVerified && (
          <View style={styles.trustScoreSection}>
            <Text style={styles.sectionTitle}>Your Trust Score</Text>
            <View style={styles.trustScoreCard}>
              <Text style={styles.trustScoreValue}>⭐ 5.0</Text>
              <Text style={styles.trustScoreLabel}>Verified Member</Text>
              <Text style={styles.trustScoreDescription}>
                Your verified status helps you join ride groups and build connections with other
                travelers.
              </Text>
            </View>
          </View>
        )}

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Benefits of Verification</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Join ride groups with confidence</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Build your trust score</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Access priority ride matching</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Unlock exclusive features</Text>
          </View>
        </View>

        {/* Continue Button */}
        {isVerified && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.continueButtonText}>Continue to Dashboard</Text>
          </TouchableOpacity>
        )}
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    marginTop: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  successBanner: {
    backgroundColor: '#d4edda',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  successBannerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  successBannerText: {
    fontSize: 14,
    color: '#155724',
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorBannerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  errorBannerTitle: {
    fontSize: 14,
    color: '#721c24',
    fontWeight: '600',
  },
  errorBannerText: {
    fontSize: 12,
    color: '#721c24',
    marginTop: 4,
  },
  documentsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  documentCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  documentCardVerified: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  documentDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  verifiedIcon: {
    fontSize: 20,
    color: '#4caf50',
  },
  uploadButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  uploadButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  trustScoreSection: {
    marginBottom: 32,
  },
  trustScoreCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  trustScoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  trustScoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 8,
  },
  trustScoreDescription: {
    fontSize: 13,
    color: '#1565c0',
    textAlign: 'center',
    lineHeight: 20,
  },
  benefitsSection: {
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 16,
    color: '#4caf50',
    marginRight: 12,
    fontWeight: 'bold',
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
