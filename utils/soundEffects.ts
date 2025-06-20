import { Audio } from 'expo-av';

class SoundManager {
  private static instance: SoundManager;
  private sounds: { [key: string]: Audio.Sound } = {};
  private isMuted: boolean = false;

  private constructor() {}

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async loadSounds() {
    try {
      const soundFiles = {
        chestOpen: require('@/assets/sounds/chest-open.mp3'),
        rewardGet: require('@/assets/sounds/reward-get.mp3'),
        streakUp: require('@/assets/sounds/streak-up.mp3'),
        click: require('@/assets/sounds/click.mp3'),
        success: require('@/assets/sounds/success.mp3'),
      };

      for (const [key, file] of Object.entries(soundFiles)) {
        const { sound } = await Audio.Sound.createAsync(file);
        this.sounds[key] = sound;
      }
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  }

  async playSound(soundName: string) {
    if (this.isMuted) return;

    try {
      const sound = this.sounds[soundName];
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  async unloadSounds() {
    try {
      for (const sound of Object.values(this.sounds)) {
        await sound.unloadAsync();
      }
      this.sounds = {};
    } catch (error) {
      console.error('Error unloading sounds:', error);
    }
  }
}

export default SoundManager.getInstance(); 