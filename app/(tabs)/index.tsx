import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useRideStore } from '../../store/rideStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { state } = useAuth();
  const { currentGroup } = useRideStore();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStartRide = () => {
    router.push('/destination-selection');
  };

  const handleViewActiveRide = () => {
    if (currentGroup) {
      router.push('/ride-coordination');
    }
  };

  if (!state.user) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </View>
    );
  }

  const user = state.user;
  const isVerified = user.kycStatus === 'verified';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <View>
            <Text style={styles.welcomeText}>Welcome back, {user.name}!</Text>
            <Text style={styles.welcomeSubtext}>Ready to share a ride?</Text>
          </View>
          <View style={styles.trustScoreBadge}>
            <Text style={styles.trustScoreValue}>⭐</Text>
            <Text style={styles.trustScoreText}>{user.trustScore.toFixed(1)}</Text>
          </View>
        </View>

        {/* KYC Status Banner */}
        {!isVerified && (
          <View style={styles.kycBanner}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#ff9800" />
            <View style={styles.kycBannerContent}>
              <Text style={styles.kycBannerTitle}>Complete Your Verification</Text>
              <Text style={styles.kycBannerText}>
                Verify your identity to unlock all features
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/kyc-verification')}
            >
              <Text style={styles.kycBannerAction}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleStartRide}
            >
              <View style={styles.quickActionIcon}>
                <MaterialCommunityIcons name="airplane" size={24} color="#007AFF" />
              </View>
              <Text style={styles.quickActionLabel}>New Ride</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/rides')}
            >
              <View style={styles.quickActionIcon}>
                <MaterialCommunityIcons name="history" size={24} color="#4caf50" />
              </View>
              <Text style={styles.quickActionLabel}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/kyc-verification')}
            >
              <View style={styles.quickActionIcon}>
                <MaterialCommunityIcons name="shield-check" size={24} color="#2196f3" />
              </View>
              <Text style={styles.quickActionLabel}>Verification</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/profile')}
            >
              <View style={styles.quickActionIcon}>
                <MaterialCommunityIcons name="account" size={24} color="#9c27b0" />
              </View>
              <Text style={styles.quickActionLabel}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Ride */}
        {currentGroup && (
          <View style={styles.activeRideSection}>
            <Text style={styles.sectionTitle}>Active Ride</Text>
            <TouchableOpacity
              style={styles.activeRideCard}
              onPress={handleViewActiveRide}
            >
              <View style={styles.activeRideHeader}>
                <View>
                  <Text style={styles.activeRideDestination}>
                    {currentGroup.destination}
                  </Text>
                  <Text style={styles.activeRideMembers}>
                    {currentGroup.memberCount} members
                  </Text>
                </View>
                <View style={styles.activeRideCost}>
                  <Text style={styles.activeRideCostValue}>
                    ${currentGroup.estimatedCost.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={styles.membersList}>
                {currentGroup.members.slice(0, 3).map((member) => (
                  <View key={member.id} style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                ))}
                {currentGroup.memberCount > 3 && (
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      +{currentGroup.memberCount - 3}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View Details →</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Rides Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Money Saved</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Friends Met</Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="wifi-off" size={20} color="#007AFF" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Offline Mode</Text>
              <Text style={styles.featureDescription}>
                Select destinations and chat offline on the plane
              </Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#4caf50" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Verified Members</Text>
              <Text style={styles.featureDescription}>
                All members are verified for your safety
              </Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="credit-card" size={20} color="#2196f3" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Easy Payments</Text>
              <Text style={styles.featureDescription}>
                Split costs easily with group members
              </Text>
            </View>
          </View>
        </View>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  welcomeSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  trustScoreBadge: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  trustScoreValue: {
    fontSize: 20,
  },
  trustScoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1976d2',
    marginTop: 2,
  },
  kycBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 12,
  },
  kycBannerContent: {
    flex: 1,
    marginLeft: 12,
  },
  kycBannerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#856404',
  },
  kycBannerText: {
    fontSize: 12,
    color: '#856404',
    marginTop: 2,
  },
  kycBannerAction: {
    fontSize: 18,
    color: '#856404',
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  quickActionCard: {
    width: '25%',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  activeRideSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  activeRideCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  activeRideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeRideDestination: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  activeRideMembers: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeRideCost: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeRideCostValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  membersList: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  memberAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  viewButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  viewButtonText: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: '600',
  },
  statsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  featuresSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
