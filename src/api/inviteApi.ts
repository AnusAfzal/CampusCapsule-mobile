import { request } from './client';
import { Group, InviteInfo } from '../types/models';

export const inviteApi = {
  async createInvite(groupId: string, params: { expiresInDays?: number; maxUses?: number } = {}): Promise<{ invite: any; deepLink: string }> {
    return request<{ invite: any; deepLink: string }>(`/invites/groups/${groupId}`, {
      method: 'POST',
      body: params,
    });
  },

  async getInviteInfo(code: string): Promise<InviteInfo> {
    return request<InviteInfo>(`/invites/${code}`);
  },

  async joinGroupByInvite(code: string): Promise<{ group: Group; role: string }> {
    return request<{ group: Group; role: string }>(`/invites/${code}/join`, {
      method: 'POST',
    });
  },

  async revokeInvite(code: string): Promise<void> {
    return request<void>(`/invites/${code}`, {
      method: 'DELETE',
    });
  },
};
