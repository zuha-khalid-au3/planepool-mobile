import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, FlatList } from 'react-native';

export default function RidesScreen() {
  const [rides] = useState([
    {
      id: 1,
      destination: 'Railway Station',
      date: '2024-05-10',
      members: 3,
      cost: '$12.50',
      status: 'completed',
    },
    {
      id: 2,
      destination: 'City Center',
      date: '2024-05-08',
      members: 2,
      cost: '$15.00',
      status: 'completed',
    },
  ]);

  const renderRide = ({ item }) => (
    <View style={styles.rideCard}>
      <View style={styles.rideHeader}>
        <Text style={styles.destination}>{item.destination}</Text>
        <Text style={[styles.status, item.status === 'completed' && styles.completed]}>
          {item.status}
        </Text>
      </View>
      <View style={styles.rideDetails}>
        <Text style={styles.detail}>📅 {item.date}</Text>
        <Text style={styles.detail}>👥 {item.members} members</Text>
        <Text style={styles.detail}>💰 {item.cost}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>My Rides</Text>
          <Text style={styles.subtitle}>Your ride history and upcoming trips</Text>
        </View>

        {rides.length > 0 ? (
          <FlatList
            data={rides}
            renderItem={renderRide}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyText}>No rides yet</Text>
            <Text style={styles.emptyDesc}>Start by selecting a destination</Text>
          </View>
        )}
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
    marginBottom: 24,
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
  rideCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  destination: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'capitalize',
  },
  completed: {
    color: '#34C759',
  },
  rideDetails: {
    gap: 8,
  },
  detail: {
    fontSize: 13,
    color: '#666',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#999',
  },
});
