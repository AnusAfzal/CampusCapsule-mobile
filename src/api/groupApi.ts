import { request } from './client';
import { Group, GroupMember } from '../types/models';

export const groupApi = {
  async createGroup(params: { name: string; description?: string; coverImage?: string }): Promise<{ group: Group; role: string }> {
    return request<{ group: Group; role: string }>('/groups', {
      method: 'POST',
      body: params,
    });
  },

  async getUserGroups(): Promise<Group[]> {
    return request<Group[]>('/groups');
  },

  async getGroupById(groupId: string): Promise<{ group: Group; role: string; memberCount: number; memoryCount: number }> {
    return request<{ group: Group; role: string; memberCount: number; memoryCount: number }>(`/groups/${groupId}`);
  },

  async updateGroup(groupId: string, params: { name?: string; description?: string; coverImage?: string }): Promise<Group> {
    return request<Group>(`/groups/${groupId}`, {
      method: 'PATCH',
      body: params,
    });
  },

  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    return request<GroupMember[]>(`/groups/${groupId}/members`);
  },

  async removeMember(groupId: string, userId: string): Promise<void> {
    return request<void>(`/groups/${groupId}/members/${userId}`, {
      method: 'DELETE',
    });
  },
};
