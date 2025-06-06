import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings, Bell, Moon, Volume2, Globe, Award, LogOut, Share2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import ProfileHeader from '@/components/ProfileHeader';
import { useProgressStore, getLevelProgress } from '@/store/progressStore';
import { useBadgeStore } from '@/store/badgeStore';
import { useAuthStore } from '@/store/authStore';
import BadgeItem from '@/components/BadgeItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { streak, xp, level, resetProgress, shareProgress } = useProgressStore();
  const { badges } = useBadgeStore();
  const { user, logout } = useAuthStore();
  const levelProgress = getLevelProgress();
  
  const earnedBadges = badges.filter(badge => badge.earned);
  
  // Sync with Supabase when component mounts
  useEffect(() => {
    const syncData = async () => {
      try {
        await useProgressStore.getState().syncWithSupabase();
        await useBadgeStore.getState().syncWithSupabase();
      } catch (error) {
        console.error('Error syncing data with Supabase:', error);
      }
    };
    
    syncData();
  }, []);
  
  const handleResetProgress = () => {
    Alert.alert(
      "Reset Progress",
      "Are you sure you want to reset all your progress? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Reset", 
          onPress: () => resetProgress(),
          style: "destructive"
        }
      ]
    );
  };
  
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Log Out", 
          onPress: async () => {
            await logout();
            router.replace('/splash');
          }
        }
      ]
    );
  };
  
  const handleShare = async () => {
    try {
      // Mark as shared in progress store
      shareProgress();
      
      // Share functionality would go here
      if (Platform.OS !== 'web') {
        // This would use the Share API on native platforms
        console.log('Sharing progress...');
      } else {
        // Web fallback
        console.log('Sharing not available on web');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  const handleViewAllBadges = () => {
    router.push('/badges');
  };
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ProfileHeader 
        name={user?.name || "Learner"}
        streak={streak}
        xp={xp}
        level={level}
        progress={levelProgress}
        avatarUrl={user?.avatarUrl}
      />
      
      {/* Badges section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Badges</Text>
          <TouchableOpacity onPress={handleViewAllBadges}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.badgesContainer}>
          {earnedBadges.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesScroll}
            >
              {earnedBadges.slice(0, 5).map(badge => (
                <View key={badge.id} style={styles.badgeItem}>
                  <BadgeItem badge={badge} size="small" />
                </View>
              ))}
              {earnedBadges.length > 5 && (
                <TouchableOpacity 
                  style={styles.moreBadgesButton}
                  onPress={handleViewAllBadges}
                >
                  <Text style={styles.moreBadgesText}>+{earnedBadges.length - 5} more</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          ) : (
            <View style={styles.noBadgesContainer}>
              <Award size={40} color={Colors.inactive} />
              <Text style={styles.noBadgesText}>Complete lessons to earn badges!</Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Share section */}
      <TouchableOpacity 
        style={styles.shareButton}
        onPress={handleShare}
      >
        <Share2 size={20} color="white" />
        <Text style={styles.shareButtonText}>Share Your Progress</Text>
      </TouchableOpacity>
      
      {/* Settings sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Settings size={20} color={Colors.text} />
              <Text style={styles.settingText}>Edit Profile</Text>
            </View>
            <Text style={styles.settingAction}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Globe size={20} color={Colors.text} />
              <Text style={styles.settingText}>Language</Text>
            </View>
            <Text style={styles.settingAction}>English</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={Colors.text} />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch 
              value={true}
              trackColor={{ false: Colors.inactive, true: Colors.primary }}
              thumbColor="white"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Moon size={20} color={Colors.text} />
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch 
              value={false}
              trackColor={{ false: Colors.inactive, true: Colors.primary }}
              thumbColor="white"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Volume2 size={20} color={Colors.text} />
              <Text style={styles.settingText}>Sound Effects</Text>
            </View>
            <Switch 
              value={true}
              trackColor={{ false: Colors.inactive, true: Colors.primary }}
              thumbColor="white"
            />
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Goals</Text>
        
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Award size={20} color={Colors.text} />
              <Text style={styles.settingText}>Daily Goal</Text>
            </View>
            <Text style={styles.settingAction}>1 lesson</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleResetProgress}
        >
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.resetButtonText}>Reset Progress</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color={Colors.text} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  badgesContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgesScroll: {
    paddingRight: 16,
  },
  badgeItem: {
    marginRight: 8,
  },
  moreBadgesButton: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreBadgesText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  noBadgesContainer: {
    alignItems: 'center',
    padding: 16,
  },
  noBadgesText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  settingAction: {
    fontSize: 14,
    color: Colors.primary,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginTop: 24,
  },
  resetButtonText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginTop: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    marginLeft: 8,
  },
});