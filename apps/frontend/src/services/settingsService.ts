// src/services/settingsService.ts
import { http } from '@/utils/http';

export interface UserSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications?: boolean;
  theme?: 'light' | 'dark';
  language?: 'en' | 'es' | 'fr' | 'de' | 'zh';
  [key: string]: unknown;
}

const SettingsService = {
  /** GET  /settings */
  async getUserSettings(): Promise<UserSettings> {
    const resp = await http.get<{ success: boolean; data: { settings: UserSettings } }>(
      '/settings',
    );
    if (!resp.data.success) {
      throw new Error('Failed to fetch settings');
    }
    return resp.data.data.settings;
  },

  /** PUT  /settings */
  async updateUserSettings(updates: Record<string, unknown>): Promise<UserSettings> {
    const resp = await http.put<{ success: boolean; data: { settings: UserSettings } }>(
      '/settings',
      updates,
    );
    if (!resp.data.success) {
      throw new Error('Failed to update settings');
    }
    return resp.data.data.settings;
  },

  /** PUT  /settings/password */
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const resp = await http.put<{ success: boolean; message?: string }>('/settings/password', {
      currentPassword,
      newPassword,
    });
    if (!resp.data.success) {
      throw new Error(resp.data.message || 'Failed to update password');
    }
  },

  /** PUT  /settings/notifications */
  async updateNotificationPreferences(pref: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications?: boolean;
  }): Promise<UserSettings> {
    const resp = await http.put<{ success: boolean; data: { settings: UserSettings } }>(
      '/settings/notifications',
      pref,
    );
    if (!resp.data.success) {
      throw new Error('Failed to update notification preferences');
    }
    return resp.data.data.settings;
  },

  /** DELETE  /settings/account */
  async deactivateAccount(): Promise<void> {
    const resp = await http.delete<{ success: boolean; message?: string }>('/settings/account');
    if (!resp.data.success) {
      throw new Error(resp.data.message || 'Failed to deactivate account');
    }
  },
};

export default SettingsService;
