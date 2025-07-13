// src/api/groups/groupApi.ts - UPDATED to use real API
import axios from 'axios';
import { http } from '@/utils/http';

export interface Member {
  id: string;
  name: string;
  email: string;
  profilePicture: string | null;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  isPublic: boolean;
  isJoined: boolean;
  lastActivity: string;
  avatar?: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  members?: Member[];
  inviteOnly?: boolean;
}

export interface CreateGroupRequest {
  name: string;
  description: string;
  category: string;
  isPublic?: boolean;
  inviteOnly?: boolean;
  tags?: string[];
}

export interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'message' | 'system';
}

const logErr = (fn: string, error: unknown): void => {
  if (axios.isAxiosError(error)) {
    console.error(`❌ [groupApi::${fn}]`, error.response?.data?.message || error.message);
  } else {
    console.error(`❌ [groupApi::${fn}]`, error);
  }
};

const handleError = <T>(fn: string, error: unknown, fallback: T): T => {
  logErr(fn, error);
  return fallback;
};

const GroupService = {
  /**
   * Fetch all available groups with optional filters
   * GET /api/groups?category=...&search=...
   */
  async fetchGroups(category?: string, search?: string): Promise<Group[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (search) params.append('search', search);

      const queryString = params.toString();
      const url = `/api/groups${queryString ? `?${queryString}` : ''}`;

      console.log(`[API] Fetching groups: ${url}`);
      const resp = await http.get(url);

      // Handle both Express response format and direct data
      const groups = resp.data?.data || resp.data || [];
      console.log(`[API] Retrieved ${groups.length} groups`);

      return groups;
    } catch (error) {
      console.error('[API] Error fetching groups:', error);
      return handleError('fetchGroups', error, []);
    }
  },

  /**
   * Fetch user's joined groups
   * GET /api/groups/my-groups
   */
  async fetchMyGroups(): Promise<Group[]> {
    try {
      console.log('[API] Fetching my groups');
      const resp = await http.get('/api/groups/my-groups');

      // Handle both Express response format and direct data
      const groups = resp.data?.data || resp.data || [];
      console.log(`[API] Retrieved ${groups.length} my groups`);

      return groups;
    } catch (error) {
      console.error('[API] Error fetching my groups:', error);
      return handleError('fetchMyGroups', error, []);
    }
  },

  /**
   * Fetch group details
   * GET /api/groups/:groupId
   */
  async fetchGroupDetails(groupId: string): Promise<Group | null> {
    if (!groupId) return null;
    try {
      console.log(`[API] Fetching group details: ${groupId}`);
      const resp = await http.get(`/api/groups/${encodeURIComponent(groupId)}`);

      // Handle both Express response format and direct data
      const group = resp.data?.data || resp.data;
      console.log(`[API] Retrieved group details for: ${group?.name}`);

      return group || null;
    } catch (error) {
      console.error(`[API] Error fetching group ${groupId}:`, error);
      return handleError('fetchGroupDetails', error, null);
    }
  },

  /**
   * Create a new group
   * POST /api/groups
   */
  async createGroup(groupData: CreateGroupRequest): Promise<Group | null> {
    if (!groupData.name.trim()) return null;
    try {
      console.log('[API] Creating group:', groupData.name);
      const resp = await http.post('/api/groups', groupData);

      // Handle both Express response format and direct data
      const group = resp.data?.data || resp.data;
      console.log(`[API] Created group: ${group?.name}`);

      return group || null;
    } catch (error) {
      console.error('[API] Error creating group:', error);
      return handleError('createGroup', error, null);
    }
  },

  /**
   * Join a group
   * POST /api/groups/:groupId/join
   */
  async joinGroup(groupId: string): Promise<boolean> {
    if (!groupId) return false;
    try {
      console.log(`[API] Joining group: ${groupId}`);
      await http.post(`/api/groups/${encodeURIComponent(groupId)}/join`);
      console.log(`[API] Successfully joined group: ${groupId}`);
      return true;
    } catch (error) {
      console.error(`[API] Error joining group ${groupId}:`, error);
      return handleError('joinGroup', error, false);
    }
  },

  /**
   * Leave a group
   * POST /api/groups/:groupId/leave
   */
  async leaveGroup(groupId: string): Promise<boolean> {
    if (!groupId) return false;
    try {
      console.log(`[API] Leaving group: ${groupId}`);
      await http.post(`/api/groups/${encodeURIComponent(groupId)}/leave`);
      console.log(`[API] Successfully left group: ${groupId}`);
      return true;
    } catch (error) {
      console.error(`[API] Error leaving group ${groupId}:`, error);
      return handleError('leaveGroup', error, false);
    }
  },

  /**
   * Update group details (admin only)
   * PUT /api/groups/:groupId
   */
  async updateGroup(groupId: string, updates: Partial<Group>): Promise<Group | null> {
    if (!groupId) return null;
    try {
      console.log(`[API] Updating group: ${groupId}`);
      const resp = await http.put(`/api/groups/${encodeURIComponent(groupId)}`, updates);

      // Handle both Express response format and direct data
      const group = resp.data?.data || resp.data;
      console.log(`[API] Updated group: ${group?.name}`);

      return group || null;
    } catch (error) {
      console.error(`[API] Error updating group ${groupId}:`, error);
      return handleError('updateGroup', error, null);
    }
  },

  /**
   * Delete a group (admin only)
   * DELETE /api/groups/:groupId
   */
  async deleteGroup(groupId: string): Promise<boolean> {
    if (!groupId) return false;
    try {
      console.log(`[API] Deleting group: ${groupId}`);
      await http.delete(`/api/groups/${encodeURIComponent(groupId)}`);
      console.log(`[API] Successfully deleted group: ${groupId}`);
      return true;
    } catch (error) {
      console.error(`[API] Error deleting group ${groupId}:`, error);
      return handleError('deleteGroup', error, false);
    }
  },

  // Member Management Functions
  /**
   * Fetch group members
   * GET /api/groups/:id/members
   */
  async fetchGroupMembers(groupId: string): Promise<Member[]> {
    if (!groupId) return [];
    try {
      console.log(`[API] Fetching members for group: ${groupId}`);
      const resp = await http.get(`/api/groups/${encodeURIComponent(groupId)}/members`);

      // Handle both Express response format and direct data
      const members = resp.data?.data || resp.data || [];
      console.log(`[API] Retrieved ${members.length} members`);

      return members;
    } catch (error) {
      console.error(`[API] Error fetching members for group ${groupId}:`, error);
      return handleError('fetchGroupMembers', error, []);
    }
  },

  /**
   * Invite a member to group
   * POST /api/groups/:id/invite
   */
  async inviteMember(groupId: string, userId: string): Promise<boolean> {
    if (!groupId || !userId) return false;
    try {
      console.log(`[API] Inviting user ${userId} to group ${groupId}`);
      await http.post(`/api/groups/${encodeURIComponent(groupId)}/invite`, { userId });
      console.log(`[API] Successfully sent invitation`);
      return true;
    } catch (error) {
      console.error(`[API] Error inviting member:`, error);
      return handleError('inviteMember', error, false);
    }
  },

  /**
   * Remove a member from group
   * DELETE /api/groups/:id/remove/:userId
   */
  async removeMember(groupId: string, userId: string): Promise<boolean> {
    if (!groupId || !userId) return false;
    try {
      console.log(`[API] Removing user ${userId} from group ${groupId}`);
      await http.delete(
        `/api/groups/${encodeURIComponent(groupId)}/remove/${encodeURIComponent(userId)}`
      );
      console.log(`[API] Successfully removed member`);
      return true;
    } catch (error) {
      console.error(`[API] Error removing member:`, error);
      return handleError('removeMember', error, false);
    }
  },

  // Message Functions
  /**
   * Fetch group messages
   * GET /api/groups/:groupId/messages
   */
  async fetchGroupMessages(groupId: string): Promise<GroupMessage[]> {
    if (!groupId) return [];
    try {
      console.log(`[API] Fetching messages for group: ${groupId}`);
      const resp = await http.get(`/api/groups/${encodeURIComponent(groupId)}/messages`);

      // Handle both Express response format and direct data
      const messages = resp.data?.data || resp.data || [];
      console.log(`[API] Retrieved ${messages.length} messages`);

      return messages;
    } catch (error) {
      console.error(`[API] Error fetching messages for group ${groupId}:`, error);
      return handleError('fetchGroupMessages', error, []);
    }
  },

  /**
   * Send a message to group
   * POST /api/groups/:groupId/messages
   */
  async sendGroupMessage(groupId: string, content: string): Promise<GroupMessage | null> {
    if (!groupId || !content.trim()) return null;
    try {
      console.log(`[API] Sending message to group: ${groupId}`);
      const resp = await http.post(`/api/groups/${encodeURIComponent(groupId)}/messages`, {
        content: content.trim()
      });

      // Handle both Express response format and direct data
      const message = resp.data?.data || resp.data;
      console.log(`[API] Message sent successfully`);

      return message || null;
    } catch (error) {
      console.error(`[API] Error sending message:`, error);
      return handleError('sendGroupMessage', error, null);
    }
  }
};

// Export both the service object and individual functions for flexibility
export const {
  fetchGroups,
  fetchMyGroups,
  fetchGroupDetails,
  createGroup,
  joinGroup,
  leaveGroup,
  updateGroup,
  deleteGroup,
  fetchGroupMembers,
  inviteMember,
  removeMember,
  fetchGroupMessages,
  sendGroupMessage
} = GroupService;

export default GroupService;
