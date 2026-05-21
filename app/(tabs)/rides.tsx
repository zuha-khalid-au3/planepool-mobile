import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { apiClient } from '../../services/api';

export default function RidesScreen() {
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getUserRides();
      if (response.success && response.data) {
        setRides(response.data);
      }
    } catch (error) {
      console.error('Error loading rides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRidePress = (ride) => {
    if (ride.status === 'active') {
      router.push('/ride-coordination');
    } else {
      Alert.alert(
        'Ride Details',
        `Destination: ${ride.destination}\nMembers: ${ride.memberCount}\nCost: $${ride.cost.toFixed(2)}\nStatus: ${ride.status}`
      );
    }
  };

  const handleRateRide = (ride) => {
    Alert.alert(
      'Rate Ride',
      'How would you rate this ride?',
      [
        { text: '⭐', onPress: () => submitRating(ride.id, 1) },
        { text: '⭐⭐', onPress: () => submitRating(ride.id, 2) },
        { text: '⭐⭐⭐', onPress: () => submitRating(ride.id, 3) },
        { text: '⭐⭐⭐⭐', onPress: () => submitRating(ride.id, 4) },
        { text: '⭐⭐⭐⭐⭐', onPress: () => submitRating(ride.id, 5) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const submitRating = async (rideId, rating) => {
    try {
      const response = await apiClient.rateRide(rideId, rating);
      if (response.success) {
        Alert.alert('Success', 'Thank you for rating!');
        loadRides();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit rating');
    }
  };

  const filteredRides = rides.filter((r) =>
    filter === 'all' ? true : r.status === filter
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'active':
        return '#2196f3';
      case 'cancelled':
        return '#f44336';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'active':
        return 'clock';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your rides...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'all' && styles.filterTabTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
          onPress={() => setFilter('active')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'active' && styles.filterTabTextActive,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
          onPress={() => setFilter('completed')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'completed' && styles.filterTabTextActive,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rides List */}
      {filteredRides.length > 0 ? (
        <FlatList
          data={filteredRides}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.rideCard}
              onPress={() => handleRidePress(item)}
            >
              <View style={styles.rideHeader}>
                <View style={styles.rideInfo}>
                  <View
                    style={[
                      styles.statusIcon,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={getStatusIcon(item.status)}
                      size={20}
                      color="#fff"
                    />
                  </View>
                  <View style={styles.rideDetails}>
                    <Text style={styles.rideDestination}>{item.destination}</Text>
                    <Text style={styles.rideDate}>
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.rideCost}>
                  <Text style={styles.rideCostValue}>${item.cost.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.rideFooter}>
                <View style={styles.rideStats}>
                  <MaterialCommunityIcons name="account-multiple" size={14} color="#666" />
                  <Text style={styles.rideStatText}>{item.memberCount} members</Text>
                </View>

                {item.status === 'completed' && !item.rating && (
                  <TouchableOpacity
                    style={styles.rateButton}
                    onPress={() => handleRateRide(item)}
                  >
                    <Text style={styles.rateButtonText}>Rate</Text>
                  </TouchableOpacity>
                )}

                {item.rating && (
                  <View style={styles.ratingDisplay}>
                    <Text style={styles.ratingText}>
                      {'⭐'.repeat(item.rating)}
                    </Text>
                  </View>
                )}

                {item.status === 'active' && (
                  <TouchableOpacity style={styles.continueButton}>
                    <Text style={styles.continueButtonText}>Continue →</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="car-off" size={48} color="#ddd" />
          <Text style={styles.emptyStateTitle}>No rides yet</Text>
          <Text style={styles.emptyStateText}>
            {filter === 'all'
              ? 'Start your first ride to see it here'
              : `No ${filter} rides yet`}
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/destination-selection')}
          >
            <Text style={styles.startButtonText}>Start a Ride</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterTabActive: {
    backgroundColor: '#007AFF',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingVertical: 12,
  },
  rideCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rideDetails: {
    flex: 1,
  },
  rideDestination: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  rideDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  rideCost: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rideCostValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  rideFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  rideStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rideStatText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  rateButton: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rateButtonText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '600',
  },
  ratingDisplay: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ratingText: {
    fontSize: 12,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
});
