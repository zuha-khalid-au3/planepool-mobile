import { Platform } from 'react-native';

/**
 * Offline Mesh Networking Service
 * Handles Bluetooth Low Energy (BLE) and WiFi Direct for in-flight communication
 * This service enables passengers to communicate without internet connectivity
 */

export interface MeshPeer {
  id: string;
  name: string;
  distance?: number;
  lastSeen: number;
}

export interface MeshMessage {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
  delivered: boolean;
}

class MeshNetworkingService {
  private peers: Map<string, MeshPeer> = new Map();
  private messages: MeshMessage[] = [];
  private isInitialized = false;
  private messageListeners: ((message: MeshMessage) => void)[] = [];
  private peerListeners: ((peers: MeshPeer[]) => void)[] = [];

  /**
   * Initialize mesh networking
   * In production, this would initialize BLE/WiFi Direct
   */
  async initialize(userId: string, userName: string): Promise<void> {
    try {
      console.log('[MeshNetworking] Initializing mesh network...');

      // In a real implementation, this would:
      // 1. Initialize BLE peripheral (advertise)
      // 2. Initialize BLE central (scan)
      // 3. Initialize WiFi Direct
      // 4. Set up message handlers

      if (Platform.OS === 'ios') {
        // iOS-specific BLE initialization
        console.log('[MeshNetworking] Initializing iOS BLE...');
      } else if (Platform.OS === 'android') {
        // Android-specific BLE/WiFi Direct initialization
        console.log('[MeshNetworking] Initializing Android BLE and WiFi Direct...');
      }

      this.isInitialized = true;
      console.log('[MeshNetworking] Mesh network initialized successfully');
    } catch (error) {
      console.error('[MeshNetworking] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Start scanning for nearby peers
   */
  async startScanning(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Mesh networking not initialized');
    }

    console.log('[MeshNetworking] Starting peer discovery...');

    // In production, this would use native BLE scanning
    // For now, simulate peer discovery
    this.simulatePeerDiscovery();
  }

  /**
   * Stop scanning for peers
   */
  async stopScanning(): Promise<void> {
    console.log('[MeshNetworking] Stopping peer discovery...');
    // In production, this would stop BLE scanning
  }

  /**
   * Send a message through the mesh network
   */
  async sendMessage(
    from: string,
    to: string,
    text: string
  ): Promise<MeshMessage> {
    const message: MeshMessage = {
      id: `${Date.now()}-${Math.random()}`,
      from,
      to,
      text,
      timestamp: Date.now(),
      delivered: false,
    };

    this.messages.push(message);

    // In production, this would:
    // 1. Route through BLE/WiFi Direct
    // 2. Use mesh routing algorithm
    // 3. Retry if delivery fails

    // Simulate delivery
    setTimeout(() => {
      message.delivered = true;
      this.notifyMessageListeners(message);
    }, 500);

    return message;
  }

  /**
   * Broadcast a message to all peers
   */
  async broadcastMessage(from: string, text: string): Promise<void> {
    const peers = Array.from(this.peers.values());
    for (const peer of peers) {
      await this.sendMessage(from, peer.id, text);
    }
  }

  /**
   * Get all discovered peers
   */
  getPeers(): MeshPeer[] {
    return Array.from(this.peers.values());
  }

  /**
   * Get message history
   */
  getMessages(limit: number = 100): MeshMessage[] {
    return this.messages.slice(-limit);
  }

  /**
   * Subscribe to message events
   */
  onMessage(callback: (message: MeshMessage) => void): () => void {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter((l) => l !== callback);
    };
  }

  /**
   * Subscribe to peer discovery events
   */
  onPeersChanged(callback: (peers: MeshPeer[]) => void): () => void {
    this.peerListeners.push(callback);
    return () => {
      this.peerListeners = this.peerListeners.filter((l) => l !== callback);
    };
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.isInitialized && this.peers.size > 0;
  }

  /**
   * Cleanup and disconnect
   */
  async disconnect(): Promise<void> {
    console.log('[MeshNetworking] Disconnecting from mesh network...');
    this.peers.clear();
    this.messages = [];
    this.messageListeners = [];
    this.peerListeners = [];
    this.isInitialized = false;
  }

  // Private methods

  private simulatePeerDiscovery(): void {
    // Simulate discovering peers over time
    const simulatedPeers = [
      { id: 'peer-1', name: 'Alice', distance: 5 },
      { id: 'peer-2', name: 'Bob', distance: 8 },
      { id: 'peer-3', name: 'Charlie', distance: 12 },
    ];

    simulatedPeers.forEach((peerData, index) => {
      setTimeout(() => {
        const peer: MeshPeer = {
          ...peerData,
          lastSeen: Date.now(),
        };
        this.peers.set(peer.id, peer);
        this.notifyPeerListeners();
        console.log(`[MeshNetworking] Discovered peer: ${peer.name}`);
      }, (index + 1) * 1000);
    });
  }

  private notifyMessageListeners(message: MeshMessage): void {
    this.messageListeners.forEach((listener) => {
      try {
        listener(message);
      } catch (error) {
        console.error('[MeshNetworking] Error in message listener:', error);
      }
    });
  }

  private notifyPeerListeners(): void {
    const peers = Array.from(this.peers.values());
    this.peerListeners.forEach((listener) => {
      try {
        listener(peers);
      } catch (error) {
        console.error('[MeshNetworking] Error in peer listener:', error);
      }
    });
  }
}

export const meshNetworking = new MeshNetworkingService();
