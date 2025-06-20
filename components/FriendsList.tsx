import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { socialApi } from './utils/supabase';
import Colors from '../constants/colors';

interface Friend {
  friend_id: string;
  users: {
    id: string;
    username: string;
    avatar_url: string | null;
    user_progress: {
      level: number;
      experience: number;
    };
  };
}

export default function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriendUsername, setNewFriendUsername] = useState('');

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const data = await socialApi.getFriends();
      setFriends(data);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!newFriendUsername.trim()) return;

    try {
      // First, find the user by username
      const { data: users, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', newFriendUsername.trim())
        .single();

      if (error || !users) {
        // Show error message
        return;
      }

      await socialApi.addFriend(users.id);
      setNewFriendUsername('');
      setShowAddFriend(false);
      loadFriends(); // Reload friends list
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <Image
        source={
          item.users.avatar_url
            ? { uri: item.users.avatar_url }
            : require('../assets/icon.png')
        }
        style={styles.avatar}
      />

      <View style={styles.friendInfo}>
        <Text style={styles.username}>{item.users.username}</Text>
        <Text style={styles.level}>Level {item.users.user_progress.level}</Text>
      </View>

      <TouchableOpacity
        style={styles.challengeButton}
        onPress={() => {
          // Navigate to challenge creation screen
        }}
      >
        <MaterialCommunityIcons name="trophy" size={20} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const filteredFriends = friends.filter(friend =>
    friend.users.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddFriend(true)}
        >
          <MaterialCommunityIcons name="account-plus" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color={Colors.text} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends..."
          placeholderTextColor={Colors.text + '80'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {showAddFriend && (
        <View style={styles.addFriendContainer}>
          <TextInput
            style={styles.addFriendInput}
            placeholder="Enter username..."
            placeholderTextColor={Colors.text + '80'}
            value={newFriendUsername}
            onChangeText={setNewFriendUsername}
          />
          <TouchableOpacity
            style={styles.addFriendButton}
            onPress={handleAddFriend}
          >
            <Text style={styles.addFriendButtonText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setShowAddFriend(false);
              setNewFriendUsername('');
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredFriends}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item.friend_id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="account-group"
              size={48}
              color={Colors.text + '40'}
            />
            <Text style={styles.emptyText}>No friends yet</Text>
            <Text style={styles.emptySubtext}>
              Add friends to challenge them and track progress together!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    color: Colors.text,
  },
  listContainer: {
    padding: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  level: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
  },
  challengeButton: {
    padding: 8,
  },
  addFriendContainer: {
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  addFriendInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    color: Colors.text,
    marginBottom: 8,
  },
  addFriendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  addFriendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.text,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 8,
  },
}); 