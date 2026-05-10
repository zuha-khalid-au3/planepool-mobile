import React, { useState, useEffect } from 'react';
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
import { offlineStorage } from '../services/offlineStorage';
import { useRideStore } from '../store/rideStore';

interface Destination {
  id: string;
  name: string;
  category: string;
  distance: string;
  icon: string;
}

export default function DestinationSelectionScreen() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [customDestination, setCustomDestination] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const router = useRouter();
  const { setSelectedDestination: storeDestination, currentFlightId } = useRideStore();

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    try {
      setIsLoading(true);
      // Try to fetch from API
      const response = await apiClient.getDestinations();
      if (response.success && response.data) {
        setDestinations(response.data);
        await offlineStorage.saveDestinations(response.data);
        setIsOffline(false);
      } else {
        // Fall back to offline data
        const offlineData = await offlineStorage.getDestinations();
        setDestinations(offlineData);
        setIsOffline(true);
      }
    } catch (error) {
      // Fall back to offline data
      const offlineData = await offlineStorage.getDestinations();
      setDestinations(offlineData);
      setIsOffline(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDestination = async (destination: string) => {
    if (!currentFlightId) {
      Alert.alert('Error', 'Flight information not available');
      return;
    }

    setSelectedDestination(destination);
    storeDestination(destination);

    // Save to offline storage
    await offlineStorage.saveSelectedDestination(destination);

    // Try to sync with backend
    try {
      const response = await apiClient.selectDestination(destination, currentFlightId);
      if (response.success) {
        // Navigate to ride matching screen
        router.push('/ride-matching');
      } else {
        Alert.alert('Error', response.error || 'Failed to select destination');
      }
    } catch (error) {
      // Still navigate even if offline - will sync later
      router.push('/ride-matching');
    }
  };

  const handleCustomDestination = async () => {
    if (!customDestination.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    await handleSelectDestination(customDestination);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading destinations...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Where are you going?</Text>
          <Text style={styles.subtitle}>
            {isOffline ? '(Offline Mode)' : 'Select your destination'}
          </Text>
        </View>

        {/* Offline Banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>
              📡 You're in offline mode. Your selection will sync when you land.
            </Text>
          </View>
        )}

        {/* Destinations Grid */}
        <View style={styles.destinationsGrid}>
          {destinations.map((destination) => (
            <TouchableOpacity
              key={destination.id}
              style={[
                styles.destinationCard,
                selectedDestination === destination.name && styles.destinationCardSelected,
              ]}
              onPress={() => handleSelectDestination(destination.name)}
            >
              <Text style={styles.destinationIcon}>{destination.icon}</Text>
              <Text style={styles.destinationName}>{destination.name}</Text>
              <Text style={styles.destinationDistance}>{destination.distance}</Text>
              {selectedDestination === destination.name && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Destination */}
        <View style={styles.customSection}>
          <TouchableOpacity
            style={styles.customButton}
            onPress={() => setShowCustom(!showCustom)}
          >
            <Text style={styles.customButtonText}>+ Add Custom Destination</Text>
          </TouchableOpacity>

          {showCustom && (
            <View style={styles.customForm}>
              <TextInput
                style={styles.customInput}
                placeholder="Enter destination address"
                placeholderTextColor="#999"
                value={customDestination}
                onChangeText={setCustomDestination}
              />
              <TouchableOpacity
                style={styles.customSubmitButton}
                onPress={handleCustomDestination}
              >
                <Text style={styles.customSubmitButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 How it works</Text>
          <Text style={styles.infoText}>
            Select your destination now. Once you land, you'll be matched with other passengers
            heading to the same place. You can then coordinate and share a ride!
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, !selectedDestination && styles.buttonDisabled]}
          onPress={() => {
            if (selectedDestination) {
              router.push('/ride-matching');
            }
          }}
          disabled={!selectedDestination}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
  offlineBanner: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  offlineBannerText: {
    fontSize: 13,
    color: '#856404',
  },
  destinationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  destinationCard: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  destinationCardSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  destinationIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  destinationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  destinationDistance: {
    fontSize: 12,
    color: '#999',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  customSection: {
    marginBottom: 24,
  },
  customButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  customButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  customForm: {
    marginTop: 12,
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
    marginBottom: 12,
  },
  customSubmitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  customSubmitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1565c0',
    lineHeight: 20,
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
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
