import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [user] = useState({ name: 'John Doe', trustScore: 95 });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome, {user.name}!</Text>
          <View style={styles.trustScore}>
            <Text style={styles.trustLabel}>Trust Score</Text>
            <Text style={styles.trustValue}>{user.trustScore}%</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/destination')}
          >
            <Text style={styles.actionIcon}>✈️</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Select Destination</Text>
              <Text style={styles.actionDesc}>Choose your airport destination</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/rides')}
          >
            <Text style={styles.actionIcon}>🚗</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>My Rides</Text>
              <Text style={styles.actionDesc}>View your ride history</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.actionIcon}>👤</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Profile</Text>
              <Text style={styles.actionDesc}>Manage your account</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Rides</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyText}>No active rides</Text>
            <Text style={styles.emptyDesc}>Select a destination to get started</Text>
          </View>
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
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  trustScore: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trustLabel: {
    fontSize: 14,
    color: '#999',
  },
  trustValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 13,
    color: '#999',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
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
