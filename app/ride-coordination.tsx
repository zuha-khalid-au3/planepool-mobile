import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../services/api';
import { useRideStore } from '../store/rideStore';
import { offlineStorage } from '../services/offlineStorage';

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    profileImage?: string;
  };
  text: string;
  timestamp: string;
}

interface GroupMember {
  id: string;
  name: string;
  profileImage?: string;
  verified: boolean;
  trustScore: number;
  phoneNumber?: string;
}

export default function RideCoordinationScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [showMembersList, setShowMembersList] = useState(false);
  const router = useRouter();
  const { currentGroup } = useRideStore();

  useEffect(() => {
    if (!currentGroup) {
      router.back();
      return;
    }
    loadMessages();
    loadMembers();
    // Poll for new messages every 2 seconds
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [currentGroup]);

  const loadMessages = async () => {
    if (!currentGroup) return;
    try {
      const response = await apiClient.getMessages(currentGroup.id);
      if (response.success && response.data) {
        setMessages(response.data);
        await offlineStorage.saveMessages(currentGroup.id, response.data);
      } else {
        // Fall back to offline messages
        const offlineMessages = await offlineStorage.getMessages(currentGroup.id);
        setMessages(offlineMessages);
      }
    } catch (error) {
      // Fall back to offline messages
      const offlineMessages = await offlineStorage.getMessages(currentGroup.id);
      setMessages(offlineMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMembers = async () => {
    if (!currentGroup) return;
    setMembers(currentGroup.members as any);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentGroup) return;

    const messageText = newMessage;
    setNewMessage('');
    setIsSending(true);

    try {
      // Add message to local state immediately
      const localMessage: Message = {
        id: `${Date.now()}`,
        sender: {
          id: 'current-user',
          name: 'You',
        },
        text: messageText,
        timestamp: new Date().toISOString(),
      };

      setMessages([...messages, localMessage]);
      await offlineStorage.addMessage(currentGroup.id, localMessage);

      // Send to backend
      const response = await apiClient.sendMessage(currentGroup.id, messageText);
      if (!response.success) {
        Alert.alert('Error', response.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleShareContact = (member: GroupMember) => {
    Alert.alert(
      'Share Contact',
      `Share your contact with ${member.name}?`,
      [
        {
          text: 'Share',
          onPress: () => {
            Alert.alert('Success', 'Contact shared!');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </View>
    );
  }

  if (!currentGroup) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Group information not available</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{currentGroup.destination}</Text>
          <Text style={styles.headerSubtitle}>
            {currentGroup.memberCount} members • ${currentGroup.estimatedCost.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowMembersList(!showMembersList)}>
          <Text style={styles.memberCountBadge}>{currentGroup.memberCount}</Text>
        </TouchableOpacity>
      </View>

      {/* Members List (Collapsible) */}
      {showMembersList && (
        <View style={styles.membersList}>
          <Text style={styles.membersListTitle}>Group Members</Text>
          {members.map((member) => (
            <View key={member.id} style={styles.memberItem}>
              <View style={styles.memberInfo}>
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
                <View style={styles.memberDetails}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View style={styles.memberMeta}>
                    <Text style={styles.trustScore}>⭐ {member.trustScore.toFixed(1)}</Text>
                    {member.verified && (
                      <Text style={styles.verifiedBadge}>Verified</Text>
                    )}
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => handleShareContact(member)}
              >
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.sender.id === 'current-user' && styles.messageContainerOwn,
            ]}
          >
            {item.sender.id !== 'current-user' && (
              <View style={styles.messageAvatar}>
                <Text style={styles.messageAvatarText}>
                  {item.sender.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.messageBubble,
                item.sender.id === 'current-user' && styles.messageBubbleOwn,
              ]}
            >
              {item.sender.id !== 'current-user' && (
                <Text style={styles.messageSender}>{item.sender.name}</Text>
              )}
              <Text
                style={[
                  styles.messageText,
                  item.sender.id === 'current-user' && styles.messageTextOwn,
                ]}
              >
                {item.text}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  item.sender.id === 'current-user' && styles.messageTimeOwn,
                ]}
              >
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        )}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        inverted
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          editable={!isSending}
        />
        <TouchableOpacity
          style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={isSending || !newMessage.trim()}
        >
          {isSending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backArrow: {
    fontSize: 24,
    color: '#007AFF',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  memberCountBadge: {
    backgroundColor: '#007AFF',
    color: '#fff',
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  membersList: {
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    maxHeight: 200,
  },
  membersListTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  memberImagePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitial: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  trustScore: {
    fontSize: 11,
    color: '#666',
    marginRight: 8,
  },
  verifiedBadge: {
    fontSize: 11,
    color: '#4caf50',
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageContainerOwn: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  messageBubble: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '80%',
  },
  messageBubbleOwn: {
    backgroundColor: '#007AFF',
  },
  messageSender: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#000',
  },
  messageTextOwn: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  messageTimeOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
