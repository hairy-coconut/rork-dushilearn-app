import { supabase } from '../utils/supabase';

export interface ShopItem {
    id: string;
    type: 'power_up' | 'customization' | 'special';
    name: string;
    description: string;
    icon: string;
    price: number;
    currency: 'gems' | 'xp';
    duration?: number; // Duration in hours for power-ups
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    effects?: {
        type: string;
        value: number;
    }[];
    preview?: string; // URL for customization preview
}

export interface UserInventory {
    id: string;
    userId: string;
    itemId: string;
    quantity: number;
    expiresAt?: Date;
    isActive?: boolean;
}

export interface ShopCategory {
    id: string;
    name: string;
    icon: string;
    description: string;
}

const SHOP_CATEGORIES: ShopCategory[] = [
    {
        id: 'power_ups',
        name: 'Power-ups',
        icon: 'lightning-bolt',
        description: 'Boost your learning with special abilities',
    },
    {
        id: 'customizations',
        name: 'Customizations',
        icon: 'palette',
        description: 'Personalize your learning experience',
    },
    {
        id: 'special',
        name: 'Special Items',
        icon: 'star',
        description: 'Rare and limited-time items',
    },
];

const POWER_UPS: ShopItem[] = [
    {
        id: 'streak_freeze',
        type: 'power_up',
        name: 'Streak Freeze',
        description: 'Protect your streak for 24 hours',
        icon: 'snowflake',
        price: 50,
        currency: 'gems',
        duration: 24,
        rarity: 'common',
        effects: [
            { type: 'streak_protection', value: 1 },
        ],
    },
    {
        id: 'xp_boost',
        type: 'power_up',
        name: 'XP Boost',
        description: 'Double XP for 1 hour',
        icon: 'star',
        price: 100,
        currency: 'gems',
        duration: 1,
        rarity: 'rare',
        effects: [
            { type: 'xp_multiplier', value: 2 },
        ],
    },
    {
        id: 'heart_refill',
        type: 'power_up',
        name: 'Heart Refill',
        description: 'Instantly refill all hearts',
        icon: 'heart',
        price: 30,
        currency: 'gems',
        rarity: 'common',
        effects: [
            { type: 'heart_refill', value: 5 },
        ],
    },
];

const CUSTOMIZATIONS: ShopItem[] = [
    {
        id: 'theme_dark',
        type: 'customization',
        name: 'Dark Theme',
        description: 'Switch to a sleek dark theme',
        icon: 'theme-light-dark',
        price: 200,
        currency: 'gems',
        rarity: 'rare',
        preview: 'themes/dark.png',
    },
    {
        id: 'theme_gradient',
        type: 'customization',
        name: 'Gradient Theme',
        description: 'Beautiful gradient backgrounds',
        icon: 'gradient',
        price: 300,
        currency: 'gems',
        rarity: 'epic',
        preview: 'themes/gradient.png',
    },
    {
        id: 'avatar_frame',
        type: 'customization',
        name: 'Golden Frame',
        description: 'Exclusive golden avatar frame',
        icon: 'account',
        price: 500,
        currency: 'gems',
        rarity: 'legendary',
        preview: 'frames/golden.png',
    },
];

const SPECIAL_ITEMS: ShopItem[] = [
    {
        id: 'streak_insurance',
        type: 'special',
        name: 'Streak Insurance',
        description: 'Protect your streak for 7 days',
        icon: 'shield-check',
        price: 1000,
        currency: 'gems',
        duration: 168, // 7 days
        rarity: 'epic',
        effects: [
            { type: 'streak_protection', value: 7 },
        ],
    },
    {
        id: 'xp_mega_boost',
        type: 'special',
        name: 'Mega XP Boost',
        description: 'Triple XP for 24 hours',
        icon: 'star-triangle',
        price: 500,
        currency: 'gems',
        duration: 24,
        rarity: 'legendary',
        effects: [
            { type: 'xp_multiplier', value: 3 },
        ],
    },
];

export const SHOP_ITEMS: ShopItem[] = [
    ...POWER_UPS,
    ...CUSTOMIZATIONS,
    ...SPECIAL_ITEMS,
];

export async function getShopItems(category?: string): Promise<ShopItem[]> {
    if (category) {
        return SHOP_ITEMS.filter(item => item.type === category);
    }
    return SHOP_ITEMS;
}

export async function getShopCategories(): Promise<ShopCategory[]> {
    return SHOP_CATEGORIES;
}

export async function getUserInventory(userId: string): Promise<UserInventory[]> {
    const { data, error } = await supabase
        .from('user_inventory')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        throw new Error('Failed to fetch user inventory');
    }

    return data.map(item => ({
        ...item,
        expiresAt: item.expires_at ? new Date(item.expires_at) : undefined,
    }));
}

export async function purchaseItem(
    userId: string,
    itemId: string
): Promise<{
    success: boolean;
    message: string;
    inventory?: UserInventory;
}> {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) {
        throw new Error('Item not found');
    }

    // Check if user has enough currency
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('gems, xp')
        .eq('id', userId)
        .single();

    if (userError) {
        throw new Error('Failed to fetch user data');
    }

    if (item.currency === 'gems' && userData.gems < item.price) {
        return {
            success: false,
            message: 'Not enough gems',
        };
    }

    if (item.currency === 'xp' && userData.xp < item.price) {
        return {
            success: false,
            message: 'Not enough XP',
        };
    }

    // Start transaction
    const { error: purchaseError } = await supabase.rpc('purchase_shop_item', {
        user_id: userId,
        item_id: itemId,
        price: item.price,
        currency: item.currency,
    });

    if (purchaseError) {
        throw new Error('Failed to purchase item');
    }

    // Add item to inventory
    const expiresAt = item.duration
        ? new Date(Date.now() + item.duration * 60 * 60 * 1000)
        : undefined;

    const { data: inventory, error: inventoryError } = await supabase
        .from('user_inventory')
        .insert({
            user_id: userId,
            item_id: itemId,
            quantity: 1,
            expires_at: expiresAt?.toISOString(),
            is_active: true,
        })
        .select()
        .single();

    if (inventoryError) {
        throw new Error('Failed to add item to inventory');
    }

    return {
        success: true,
        message: 'Item purchased successfully',
        inventory: {
            ...inventory,
            expiresAt,
        },
    };
}

export async function activateItem(
    userId: string,
    inventoryId: string
): Promise<{
    success: boolean;
    message: string;
}> {
    const { data: inventory, error: fetchError } = await supabase
        .from('user_inventory')
        .select('*')
        .eq('id', inventoryId)
        .single();

    if (fetchError || !inventory) {
        throw new Error('Item not found in inventory');
    }

    if (inventory.expires_at && new Date(inventory.expires_at) < new Date()) {
        return {
            success: false,
            message: 'Item has expired',
        };
    }

    const { error: updateError } = await supabase
        .from('user_inventory')
        .update({ is_active: true })
        .eq('id', inventoryId);

    if (updateError) {
        throw new Error('Failed to activate item');
    }

    return {
        success: true,
        message: 'Item activated successfully',
    };
}

export async function deactivateItem(
    userId: string,
    inventoryId: string
): Promise<{
    success: boolean;
    message: string;
}> {
    const { error } = await supabase
        .from('user_inventory')
        .update({ is_active: false })
        .eq('id', inventoryId);

    if (error) {
        throw new Error('Failed to deactivate item');
    }

    return {
        success: true,
        message: 'Item deactivated successfully',
    };
} 