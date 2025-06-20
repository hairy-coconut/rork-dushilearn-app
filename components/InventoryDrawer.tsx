import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ShopItem, getUserInventory, activateItem, deactivateItem, SHOP_ITEMS } from '../utils/shop';
import { ShopItemCard } from './ShopItemCard';
import { useUser } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const { height } = Dimensions.get('window');

interface InventoryDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export const InventoryDrawer: React.FC<InventoryDrawerProps> = ({ visible, onClose }) => {
  const { user } = useUser();
  const { theme } = useTheme();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const slideAnim = new Animated.Value(visible ? 0 : height);

  useEffect(() => {
    if (visible) {
      loadInventory();
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
    // eslint-disable-next-line
  }, [visible]);

  const loadInventory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const inv = await getUserInventory(user.id);
      setInventory(inv);
    } catch (e) {
      setInventory([]);
    }
    setLoading(false);
  };

  const handleActivate = async (invId: string) => {
    if (!user) return;
    setActivating(invId);
    try {
      await activateItem(user.id, invId);
      await loadInventory();
    } catch {}
    setActivating(null);
  };

  const handleDeactivate = async (invId: string) => {
    if (!user) return;
    setActivating(invId);
    try {
      await deactivateItem(user.id, invId);
      await loadInventory();
    } catch {}
    setActivating(null);
  };

  const renderItem = ({ item }: { item: any }) => {
    const shopItem = SHOP_ITEMS.find(i => i.id === item.item_id);
    if (!shopItem) return null;
    return (
      <View style={styles.cardWrapper}>
        <ShopItemCard
          item={shopItem}
          onPress={() => {}}
          isOwned
          isActive={item.is_active}
        />
        <TouchableOpacity
          style={[
            styles.actionButton,
            item.is_active ? styles.deactivate : styles.activate,
          ]}
          onPress={() =>
            item.is_active ? handleDeactivate(item.id) : handleActivate(item.id)
          }
          disabled={activating === item.id}
        >
          <MaterialCommunityIcons
            name={item.is_active ? 'close-circle' : 'check-circle'}
            size={20}
            color="#fff"
          />
          <Text style={styles.actionText}>
            {item.is_active ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="none" transparent>
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: theme.colors.background + 'ee',
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Inventory</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : inventory.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="package-variant" size={48} color="#bbb" />
            <Text style={styles.emptyText}>No items yet. Buy something from the shop!</Text>
          </View>
        ) : (
          <FlatList
            data={inventory}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 100,
    paddingTop: 60,
    paddingHorizontal: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
  },
  closeBtn: {
    padding: 6,
  },
  cardWrapper: {
    marginVertical: 10,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activate: {
    backgroundColor: '#4a90e2',
  },
  deactivate: {
    backgroundColor: '#e24a4a',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
}); 