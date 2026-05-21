import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function DestinationScreen() {
  const router = useRouter();
  const [selectedDestination, setSelectedDestination] = useState(null);

  const destinations = [
    { id: 1, name: 'Railway Station', emoji: '🚂' },
    { id: 2, name: 'Bus Stand', emoji: '🚌' },
    { id: 3, name: 'City Center', emoji: '🏙️' },
    { id: 4, name: 'Airport', emoji: '✈️' },
    { id: 5, name: 'Hotel District', emoji: '🏨' },
    { id: 6, name: 'Business Park', emoji: '🏢' },
  ];

  const handleSelect = (destination) => {
    setSelectedDestination(destination);
    Alert.alert(
      'Destination Selected',
      `You selected: ${destination.name}\n\nFinding ride partners...`,
      [
        {
          text: 'Continue',
          onPress: () => router.push('/rides'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Your Destination</Text>
          <Text style={styles.subtitle}>Where are you heading from the airport?</Text>
        </View>

        <View style={styles.grid}>
          {destinations.map((destination) => (
            <TouchableOpacity
              key={destination.id}
              style={[
                styles.card,
                selectedDestination?.id === destination.id && styles.cardSelected,
              ]}
              onPress={() => handleSelect(destination)}
            >
              <Text style={styles.emoji}>{destination.emoji}</Text>
              <Text style={styles.cardText}>{destination.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.info}>
          <Text style={styles.infoTitle}>💡 Tip</Text>
          <Text style={styles.infoText}>
            Select your destination while in-flight. The app works offline using Bluetooth mesh networking to connect you with other passengers heading to the same place.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardSelected: {
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#0056CC',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  info: {
    backgroundColor: '#E8F4FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#0056CC',
    lineHeight: 20,
  },
});
