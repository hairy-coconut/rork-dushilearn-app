import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ShopItemCard } from '../../components/ShopItemCard';
import {
  getShopItems,
  getShopCategories,
  purchaseItem,
  ShopItem,
  ShopCategory,
} from '../../utils/shop';
import { useUser } from '../../contexts/AuthContext';
import Colors from '../../constants/colors';

const { width } = Dimensions.get('window');

const ShopScreen = () => {
  const { user, profile, refreshProfile } = useUser();
  const { theme } = useTheme();
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('power_up');
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadItems();
  }, [selectedCategory]);

  const loadCategories = async () => {
    const cats = await getShopCategories();
    setCategories(cats);
    setSelectedCategory(cats[0]?.id || 'power_up');
  };

  const loadItems = async () => {
    setLoading(true);
    const items = await getShopItems(selectedCategory.replace('_', ''));
    setItems(items);
    setLoading(false);
  };

  const handlePurchase = async (item: ShopItem) => {
    if (!user) return;
    setPurchasing(item.id);
    try {
      const result = await purchaseItem(user.id, item.id);
      if (result.success) {
        Alert.alert('Success', 'Item purchased successfully!');
        refreshProfile && refreshProfile();
      } else {
        Alert.alert('Not enough currency', result.message);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to purchase item');
    }
    setPurchasing(null);
  };

  const renderCategory = (cat: ShopCategory) => (
    <TouchableOpacity
      key={cat.id}
      style={[
        styles.categoryButton,
        selectedCategory === cat.id && { backgroundColor: Colors.primary },
      ]}
      onPress={() => setSelectedCategory(cat.id)}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons name={cat.icon as any} size={20} color={Colors.text} />
      <Text style={[styles.categoryText, { color: Colors.text }]}>{cat.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}> 
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Shop</Text>
        <View style={styles.balanceRow}>
          <MaterialCommunityIcons name="diamond-stone" size={22} color="#fff" />
          <Text style={styles.balanceText}>{profile?.gems ?? 0}</Text>
          <MaterialCommunityIcons name="star" size={22} color="#fff" style={{ marginLeft: 16 }} />
          <Text style={styles.balanceText}>{profile?.xp ?? 0}</Text>
        </View>
      </LinearGradient>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        {categories.map(renderCategory)}
      </ScrollView>
      <View style={styles.itemsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={items}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ShopItemCard
                item={item}
                onPress={handlePurchase}
                isOwned={false}
                isActive={false}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 20 }}
            snapToInterval={width * 0.85 + 20}
            decelerationRate="fast"
          />
        )}
      </View>
      <Text style={styles.tipText}>
        Earn gems by completing lessons, daily goals, and challenges. Spend gems on power-ups, customizations, and special items to boost your learning!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  balanceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  categoryScroll: {
    marginTop: 10,
    maxHeight: 50,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  itemsContainer: {
    flex: 1,
    marginTop: 10,
  },
  tipText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginVertical: 16,
    marginHorizontal: 20,
  },
});

export default ShopScreen; 