import AsyncStorage from '@react-native-async-storage/async-storage';

interface StorageData {
  destinations?: any[];
  selectedDestination?: string;
  flightId?: string;
  rideGroups?: any[];
  messages?: any[];
  userProfile?: any;
  lastSyncTime?: number;
}

class OfflineStorage {
  private prefix = '@planepool_';

  async saveDestinations(destinations: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.prefix}destinations`,
        JSON.stringify(destinations)
      );
    } catch (error) {
      console.error('Error saving destinations:', error);
    }
  }

  async getDestinations(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(`${this.prefix}destinations`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting destinations:', error);
      return [];
    }
  }

  async saveSelectedDestination(destination: string): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.prefix}selectedDestination`,
        destination
      );
    } catch (error) {
      console.error('Error saving selected destination:', error);
    }
  }

  async getSelectedDestination(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(`${this.prefix}selectedDestination`);
    } catch (error) {
      console.error('Error getting selected destination:', error);
      return null;
    }
  }

  async saveFlightId(flightId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(`${this.prefix}flightId`, flightId);
    } catch (error) {
      console.error('Error saving flight ID:', error);
    }
  }

  async getFlightId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(`${this.prefix}flightId`);
    } catch (error) {
      console.error('Error getting flight ID:', error);
      return null;
    }
  }

  async saveRideGroups(groups: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.prefix}rideGroups`,
        JSON.stringify(groups)
      );
    } catch (error) {
      console.error('Error saving ride groups:', error);
    }
  }

  async getRideGroups(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(`${this.prefix}rideGroups`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting ride groups:', error);
      return [];
    }
  }

  async saveMessages(groupId: string, messages: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.prefix}messages_${groupId}`,
        JSON.stringify(messages)
      );
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }

  async getMessages(groupId: string): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(`${this.prefix}messages_${groupId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  async addMessage(groupId: string, message: any): Promise<void> {
    try {
      const messages = await this.getMessages(groupId);
      messages.push(message);
      await this.saveMessages(groupId, messages);
    } catch (error) {
      console.error('Error adding message:', error);
    }
  }

  async saveUserProfile(profile: any): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.prefix}userProfile`,
        JSON.stringify(profile)
      );
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  async getUserProfile(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(`${this.prefix}userProfile`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async saveSyncQueue(action: any): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      queue.push({
        ...action,
        timestamp: Date.now(),
      });
      await AsyncStorage.setItem(
        `${this.prefix}syncQueue`,
        JSON.stringify(queue)
      );
    } catch (error) {
      console.error('Error saving to sync queue:', error);
    }
  }

  async getSyncQueue(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(`${this.prefix}syncQueue`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }

  async clearSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.prefix}syncQueue`);
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  }

  async clearAllData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const planepoolKeys = keys.filter((key) => key.startsWith(this.prefix));
      await AsyncStorage.multiRemove(planepoolKeys);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  async getLastSyncTime(): Promise<number | null> {
    try {
      const data = await AsyncStorage.getItem(`${this.prefix}lastSyncTime`);
      return data ? parseInt(data, 10) : null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  async setLastSyncTime(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.prefix}lastSyncTime`,
        timestamp.toString()
      );
    } catch (error) {
      console.error('Error setting last sync time:', error);
    }
  }
}

export const offlineStorage = new OfflineStorage();
