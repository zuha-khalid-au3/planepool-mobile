import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../services/api';
import { useRideStore } from '../store/rideStore';

interface RideGroup {
  id: string;
  destination: string;
  memberCount: number;
  members: Array<{
    id: string;
    name: string;
    profileImage?: string;
    verified: boolean;
    trustScore: number;
  }>;
  estimatedCost: number;
  createdAt: string;
  status: 'active' | 'completed' | 'cancelled';
}

export default function RideMatchingScreen() {
  const [rideGroups, setRideGroups] = useState<RideGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<RideGroup | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();
  const { selectedDestination, currentFlightId, setCurrentGroup } = useRideStore();

  useEffect(() => {
    loadRideGroups();
    // Poll for new groups every 5 seconds
    const interval = setInterval(loadRideGroups, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadRideGroups = async () => {
    if (!currentFlightId) return;

    try {
      const response = await apiClient.getRideGroups(currentFlightId);
      if (response.success && response.data) {
        // Filter groups by selected destination
        const filtered = response.data.filter(
          (group: RideGroup) => group.destination === selectedDestination
        );
        setRideGroups(filtered);
      }
    } catch (error) {
      console.error('Error loading ride groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGroup = async (group: RideGroup) => {
    setIsJoining(true);
    try {
      const response = await apiClient.joinRideGroup(group.id);
      if (response.success) {
        setCurrentGroup(group);
        Alert.alert('Success', 'You joined the ride group!', [
          {
            text: 'OK',
            onPress: () => router.push('/ride-coordination'),
          },
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to join group');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while joining the group');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateGroup = async () => {
    // Navigate to group creation screen
    router.push('/create-ride-group');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Finding ride groups...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ride Groups</Text>
          <Text style={styles.subtitle}>
            {rideGroups.length} group{rideGroups.length !== 1 ? 's' : ''} heading to{' '}
            {selectedDestination}
          </Text>
        </View>

        {/* Groups List */}
        {rideGroups.length > 0 ? (
          <View style={styles.groupsList}>
            {rideGroups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={styles.groupCard}
                onPress={() => setSelectedGroup(group)}
              >
                {/* Group Header */}
                <View style={styles.groupHeader}>
                  <View>
                    <Text style={styles.groupDestination}>{group.destination}</Text>
                    <Text style={styles.groupTime}>
                      Created {new Date(group.createdAt).toLocaleTimeString()}
                    </Text>
                  </View>
                  <View style={styles.costBadge}>
                    <Text style={styles.costText}>${group.estimatedCost.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Members */}
                <View style={styles.membersContainer}>
                  <Text style={styles.membersLabel}>
                    {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                  </Text>
                  <View style={styles.membersList}>
                    {group.members.slice(0, 3).map((member) => (
                      <View key={member.id} style={styles.memberAvatar}>
                        {member.profileImage ? (
                          <Image
                            source={{ uri: member.profileImage }}
                            style={styles.memberImage}
                          />
                        ) : (
                          <View style={styles.memberImagePlaceholder}>
                            <Text style={styles.memberInitial}>
                              {member.name.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                        {member.verified && (
                          <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedText}>✓</Text>
                          </View>
                        )}
                      </View>
                    ))}
                    {group.memberCount > 3 && (
                      <View style={styles.memberAvatar}>
                        <View style={styles.memberImagePlaceholder}>
                          <Text style={styles.memberInitial}>+{group.memberCount - 3}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                {/* Join Button */}
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => handleJoinGroup(group)}
                  disabled={isJoining}
                >
                  <Text style={styles.joinButtonText}>
                    {isJoining ? 'Joining...' : 'Join Group'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🚗</Text>
            <Text style={styles.emptyStateTitle}>No groups yet</Text>
            <Text style={styles.emptyStateText}>
              Be the first to create a ride group heading to {selectedDestination}
            </Text>
          </View>
        )}

        {/* Create Group Button */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
          <Text style={styles.createButtonText}>+ Create New Group</Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Tips</Text>
          <Text style={styles.infoText}>
            • Join an existing group to start coordinating immediately{'\n'}• Create a new group if
            you do not see one heading to your destination{'\n'}• Share contact info with group
            members after landing
          </Text>
        </View>
      </View>

      {/* Group Details Modal */}
      {selectedGroup && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setSelectedGroup(null)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>{selectedGroup.destination}</Text>
            <Text style={styles.modalSubtitle}>
              {selectedGroup.memberCount} members • ${selectedGroup.estimatedCost.toFixed(2)}
            </Text>

            <View style={styles.modalMembers}>
              <Text style={styles.modalMembersTitle}>Members</Text>
              {selectedGroup.members.map((member) => (
                <View key={member.id} style={styles.modalMember}>
                  <View style={styles.modalMemberAvatar}>
                    {member.profileImage ? (
                      <Image
                        source={{ uri: member.profileImage }}
                        style={styles.modalMemberImage}
                      />
                    ) : (
                      <View style={styles.modalMemberImagePlaceholder}>
                        <Text style={styles.memberInitial}>
                          {member.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.modalMemberInfo}>
                    <Text style={styles.modalMemberName}>{member.name}</Text>
                    <View style={styles.trustScore}>
                      <Text style={styles.trustScoreText}>
                        ⭐ {member.trustScore.toFixed(1)}
                      </Text>
                      {member.verified && <Text style={styles.verifiedLabel}>Verified</Text>}
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalJoinButton}
              onPress={() => {
                handleJoinGroup(selectedGroup);
                setSelectedGroup(null);
              }}
              disabled={isJoining}
            >
              <Text style={styles.modalJoinButtonText}>
                {isJoining ? 'Joining...' : 'Join This Group'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  groupsList: {
    marginBottom: 24,
  },
  groupCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupDestination: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  groupTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  costBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  costText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  membersContainer: {
    marginBottom: 12,
  },
  membersLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  membersList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    position: 'relative',
    marginRight: -8,
  },
  memberImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  memberImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  memberInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  joinButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  createButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  createButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
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
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalClose: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    color: '#999',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  modalMembers: {
    marginBottom: 20,
  },
  modalMembersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  modalMember: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalMemberAvatar: {
    marginRight: 12,
  },
  modalMemberImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  modalMemberImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMemberInfo: {
    flex: 1,
  },
  modalMemberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  trustScore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trustScoreText: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  verifiedLabel: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '600',
  },
  modalJoinButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalJoinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
