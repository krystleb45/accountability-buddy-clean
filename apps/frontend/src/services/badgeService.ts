// src/services/badgeService.ts
import { http } from '@/utils/http';

/** Badge definitions */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  criteria: 'messages' | 'reactions' | 'challenges';
  threshold: number;
  imageUrl?: string;
}

/** Badge as stored per user */
export interface UserBadge extends Badge {
  userId: string;
  earnedAt: string;
}

const handleError = <T>(fn: string, error: unknown, fallback: T): T => {
  console.error(`❌ Error in ${fn}:`, error);
  return fallback;
};

const badgeService = {
  /** Get all possible badges */
  async fetchBadges(): Promise<Badge[]> {
    try {
      const { data } = await http.get<Badge[]>('/badges');
      return data;
    } catch (err) {
      return handleError('fetchBadges', err, []);
    }
  },

  /** Get badges earned by a specific user */
  async fetchUserBadges(userId?: string): Promise<Badge[]> {
    if (!userId) {
      console.error('❌ fetchUserBadges: userId is required');
      return [];
    }
    try {
      const { data } = await http.get<UserBadge[]>(`/users/${userId}/badges`);
      return data.map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        icon: b.icon ?? '/default-badge-icon.png',
        criteria: b.criteria,
        threshold: b.threshold,
        imageUrl: b.imageUrl ?? '',
      }));
    } catch (err) {
      return handleError('fetchUserBadges', err, []);
    }
  },

  /** Award a badge to a user */
  async awardBadge(userId: string, badgeId: string): Promise<Badge | null> {
    if (!userId || !badgeId) {
      console.error('❌ awardBadge: both userId and badgeId are required');
      return null;
    }
    try {
      const { data } = await http.post<UserBadge>('/badges/award', { userId, badgeId });
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        icon: data.icon ?? '/default-badge-icon.png',
        criteria: data.criteria,
        threshold: data.threshold,
        imageUrl: data.imageUrl ?? '',
      };
    } catch (err) {
      return handleError('awardBadge', err, null);
    }
  },

  /** Fetch favorite badges */
  async fetchFavoriteBadges(): Promise<Badge[]> {
    try {
      const { data } = await http.get<Badge[]>('/badges/favorites');
      return data;
    } catch (err) {
      return handleError('fetchFavoriteBadges', err, []);
    }
  },

  /** Update the user's favorite badges */
  async updateFavoriteBadges(userId: string, badgeIds: string[]): Promise<Badge[]> {
    try {
      const { data } = await http.patch<Badge[]>(`/users/${userId}/favorite-badges`, { badgeIds });
      return data;
    } catch (err) {
      return handleError('updateFavoriteBadges', err, []);
    }
  },

  /** Toggle a single badge in favorites */
  async toggleFavoriteBadge(userId: string, badgeId: string): Promise<Badge[]> {
    try {
      const { data } = await http.post<Badge[]>(`/users/${userId}/favorite-badges/toggle`, {
        badgeId,
      });
      return data;
    } catch (err) {
      return handleError('toggleFavoriteBadge', err, []);
    }
  },
};

export default badgeService;
