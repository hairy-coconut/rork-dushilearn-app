import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
    Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Colors from '../constants/colors';
import { useUser } from '../contexts/AuthContext';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

type AvatarPart = 'skin' | 'hair' | 'eyes' | 'mouth' | 'clothes' | 'accessories';
type AvatarColor = string;

interface AvatarCustomization {
    skin: AvatarColor;
    hair: AvatarColor;
    eyes: AvatarColor;
    mouth: AvatarColor;
    clothes: AvatarColor;
    accessories: AvatarColor[];
}

const SKIN_TONES = [
    '#FFDBAC', '#F5D0A9', '#E6C3A9', '#D4B996', '#C68642', '#8D5524',
];

const HAIR_COLORS = [
    '#000000', '#4A3000', '#8B4513', '#A0522D', '#CD853F', '#DEB887',
    '#FFD700', '#FFA500', '#FF4500', '#FF0000', '#800080', '#4B0082',
];

const EYE_COLORS = [
    '#000000', '#4A3000', '#8B4513', '#A0522D', '#CD853F', '#DEB887',
    '#00FF00', '#008000', '#0000FF', '#000080', '#800080', '#4B0082',
];

const CLOTHES_COLORS = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FFA500', '#800080', '#008000', '#800000', '#008080', '#000080',
];

const ACCESSORIES = [
    { id: 'sunglasses', icon: 'sunglasses', color: '#000000' },
    { id: 'hat', icon: 'hat-fedora', color: '#8B4513' },
    { id: 'necklace', icon: 'necklace', color: '#FFD700' },
    { id: 'earrings', icon: 'earrings', color: '#C0C0C0' },
    { id: 'bracelet', icon: 'bracelet', color: '#FFD700' },
    { id: 'flower', icon: 'flower', color: '#FF69B4' },
];

const AvatarBuilderScreen = () => {
    const { theme } = useTheme();
    const { user } = useUser();
    const [selectedPart, setSelectedPart] = useState<AvatarPart>('skin');
    const [customization, setCustomization] = useState<AvatarCustomization>({
        skin: SKIN_TONES[0],
        hair: HAIR_COLORS[0],
        eyes: EYE_COLORS[0],
        mouth: '#FF0000',
        clothes: CLOTHES_COLORS[0],
        accessories: [],
    });
    const [previewScale] = useState(new Animated.Value(1));

    const handlePartSelect = (part: AvatarPart) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedPart(part);
    };

    const handleColorSelect = (color: AvatarColor) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCustomization(prev => ({
            ...prev,
            [selectedPart]: color,
        }));
    };

    const handleAccessoryToggle = (accessoryId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCustomization(prev => ({
            ...prev,
            accessories: prev.accessories.includes(accessoryId)
                ? prev.accessories.filter(id => id !== accessoryId)
                : [...prev.accessories, accessoryId],
        }));
    };

    const handleSave = async () => {
        try {
            // Save avatar customization to user profile
            await updateUserAvatar(customization);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error('Error saving avatar:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const renderColorPicker = () => {
        let colors: AvatarColor[] = [];
        switch (selectedPart) {
            case 'skin':
                colors = SKIN_TONES;
                break;
            case 'hair':
                colors = HAIR_COLORS;
                break;
            case 'eyes':
                colors = EYE_COLORS;
                break;
            case 'clothes':
                colors = CLOTHES_COLORS;
                break;
            default:
                return null;
        }

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.colorPicker}
                contentContainerStyle={styles.colorPickerContent}
            >
                {colors.map((color) => (
                    <TouchableOpacity
                        key={color}
                        style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            customization[selectedPart] === color && styles.selectedColor,
                        ]}
                        onPress={() => handleColorSelect(color)}
                    />
                ))}
            </ScrollView>
        );
    };

    const renderAccessories = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.accessoriesPicker}
            contentContainerStyle={styles.accessoriesPickerContent}
        >
            {ACCESSORIES.map((accessory) => (
                <TouchableOpacity
                    key={accessory.id}
                    style={[
                        styles.accessoryOption,
                        customization.accessories.includes(accessory.id) && styles.selectedAccessory,
                    ]}
                    onPress={() => handleAccessoryToggle(accessory.id)}
                >
                    <MaterialCommunityIcons
                        name={accessory.icon}
                        size={24}
                        color={customization.accessories.includes(accessory.id)
                            ? Colors.primary
                            : '#666'
                        }
                    />
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={styles.headerTitle}>Avatar Builder</Text>
            </LinearGradient>

            <View style={styles.previewContainer}>
                <Animated.View
                    style={[
                        styles.avatarPreview,
                        { transform: [{ scale: previewScale }] },
                    ]}
                >
                    {/* Render avatar preview based on customization */}
                    <View style={[styles.avatarBase, { backgroundColor: customization.skin }]} />
                    <View style={[styles.avatarHair, { backgroundColor: customization.hair }]} />
                    <View style={[styles.avatarEyes, { backgroundColor: customization.eyes }]} />
                    <View style={[styles.avatarMouth, { backgroundColor: customization.mouth }]} />
                    <View style={[styles.avatarClothes, { backgroundColor: customization.clothes }]} />
                    {customization.accessories.map((accessoryId) => {
                        const accessory = ACCESSORIES.find(a => a.id === accessoryId);
                        return (
                            <MaterialCommunityIcons
                                key={accessoryId}
                                name={accessory?.icon || ''}
                                size={24}
                                color={accessory?.color}
                                style={styles.avatarAccessory}
                            />
                        );
                    })}
                </Animated.View>
            </View>

            <View style={styles.controlsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.partSelector}
                    contentContainerStyle={styles.partSelectorContent}
                >
                    {(['skin', 'hair', 'eyes', 'mouth', 'clothes', 'accessories'] as AvatarPart[]).map((part) => (
                        <TouchableOpacity
                            key={part}
                            style={[
                                styles.partButton,
                                selectedPart === part && styles.selectedPartButton,
                            ]}
                            onPress={() => handlePartSelect(part)}
                        >
                            <MaterialCommunityIcons
                                name={
                                    part === 'skin' ? 'face-woman' :
                                    part === 'hair' ? 'hair-dryer' :
                                    part === 'eyes' ? 'eye' :
                                    part === 'mouth' ? 'emoticon' :
                                    part === 'clothes' ? 'tshirt-crew' :
                                    'necklace'
                                }
                                size={24}
                                color={selectedPart === part ? '#fff' : Colors.primary}
                            />
                            <Text style={[
                                styles.partText,
                                selectedPart === part && styles.selectedPartText,
                            ]}>
                                {part.charAt(0).toUpperCase() + part.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {selectedPart === 'accessories' ? renderAccessories() : renderColorPicker()}
            </View>

            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
            >
                <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    style={styles.saveButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text style={styles.saveButtonText}>Save Avatar</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    previewContainer: {
        alignItems: 'center',
        padding: 20,
    },
    avatarPreview: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    avatarBase: {
        width: '100%',
        height: '100%',
        borderRadius: 100,
    },
    avatarHair: {
        position: 'absolute',
        top: 20,
        width: '80%',
        height: '30%',
        borderRadius: 40,
    },
    avatarEyes: {
        position: 'absolute',
        top: '40%',
        width: '20%',
        height: '10%',
        borderRadius: 10,
    },
    avatarMouth: {
        position: 'absolute',
        top: '60%',
        width: '30%',
        height: '10%',
        borderRadius: 10,
    },
    avatarClothes: {
        position: 'absolute',
        bottom: 20,
        width: '60%',
        height: '30%',
        borderRadius: 20,
    },
    avatarAccessory: {
        position: 'absolute',
    },
    controlsContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
    },
    partSelector: {
        maxHeight: 80,
    },
    partSelectorContent: {
        paddingVertical: 10,
    },
    partButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#f0f0f0',
    },
    selectedPartButton: {
        backgroundColor: Colors.primary,
    },
    partText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: Colors.primary,
    },
    selectedPartText: {
        color: '#fff',
    },
    colorPicker: {
        maxHeight: 60,
        marginTop: 20,
    },
    colorPickerContent: {
        paddingVertical: 10,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedColor: {
        borderColor: Colors.primary,
    },
    accessoriesPicker: {
        maxHeight: 60,
        marginTop: 20,
    },
    accessoriesPickerContent: {
        paddingVertical: 10,
    },
    accessoryOption: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedAccessory: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    saveButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
    },
    saveButtonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AvatarBuilderScreen; 