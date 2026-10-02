import { registerPlugin, Capacitor } from '@capacitor/core';

export interface GoogleCastPluginInterface {
  isAvailable(): Promise<{ isAvailable: boolean; hasActiveSession?: boolean; deviceName?: string }>;
  showCastPicker(): Promise<{ success: boolean }>;
  loadMedia(options: {
    url: string;
    title: string;
    subtitle?: string;
    contentType?: string;
    position?: number;
    autoplay?: boolean;
  }): Promise<{ success: boolean }>;
  play(): Promise<{ success: boolean }>;
  pause(): Promise<{ success: boolean }>;
  seek(options: { position: number }): Promise<{ success: boolean }>;
  setVolume(options: { volume: number }): Promise<{ success: boolean }>;
  disconnect(): Promise<{ success: boolean }>;
  addListener(eventName: string, listenerFunc: (data: any) => void): Promise<any>;
  removeAllListeners(): Promise<void>;
}

export const GoogleCast = registerPlugin<GoogleCastPluginInterface>('GoogleCast');

export const isNativeAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};
