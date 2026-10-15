import { File } from 'expo-file-system';

import { request } from './client';
import { Memory, MemoryLocation } from '../types/models';

export interface PaginatedMemories {
  memories: Memory[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface CalendarDayEntry {
  date: string;
  count: number;
  memories: Array<{
    id: string;
    imageUrl: string;
    user: {
      _id: string;
      name: string;
      profileImage?: string;
    };
  }>;
}

export const memoryApi = {
  /**
   * Create a new memory with an image.
   *
   * The image is sent as multipart/form-data.
   * The backend receives it through Multer and uploads it
   * directly to Cloudinary.
   */
  async createMemory(params: {
    groupId: string;
    imageUri: string;
    memoryDate: string;
    caption?: string;
    location?: MemoryLocation;
  }): Promise<Memory> {
    const formData = new FormData();

    formData.append('groupId', params.groupId);
    formData.append('memoryDate', params.memoryDate);

    if (params.caption) {
      formData.append('caption', params.caption);
    }

    if (params.location) {
      formData.append(
        'location',
        JSON.stringify(params.location)
      );
    }

    /**
     * Expo SDK 57:
     *
     * Use expo-file-system's File API instead of the old
     * React Native { uri, name, type } FormData object.
     */
    const filename =
      params.imageUri.split('/').pop() || 'memory.jpg';

    const extension =
      filename.includes('.')
        ? filename.split('.').pop()?.toLowerCase()
        : 'jpg';

    const mimeType =
      extension === 'png'
        ? 'image/png'
        : extension === 'webp'
          ? 'image/webp'
          : 'image/jpeg';

    const imageFile = new File(params.imageUri);

    formData.append('image', imageFile);

    return request<Memory>('/memories', {
      method: 'POST',
      body: formData,
    });
  },

  async getGroupMemories(
    groupId: string,
    params: {
      page?: number;
      limit?: number;
      memoryDate?: string;
      month?: string;
      year?: string;
      userId?: string;
    } = {}
  ): Promise<Memory[]> {
    const query = new URLSearchParams();

    if (params.page) {
      query.append('page', params.page.toString());
    }

    if (params.limit) {
      query.append('limit', params.limit.toString());
    }

    if (params.memoryDate) {
      query.append('memoryDate', params.memoryDate);
    }

    if (params.month) {
      query.append('month', params.month);
    }

    if (params.year) {
      query.append('year', params.year);
    }

    if (params.userId) {
      query.append('userId', params.userId);
    }

    const queryString = query.toString();

    const endpoint =
      `/memories/groups/${groupId}` +
      (queryString ? `?${queryString}` : '');

    return request<Memory[]>(endpoint);
  },

  async getMemoryById(id: string): Promise<Memory> {
    return request<Memory>(`/memories/${id}`);
  },

  async updateMemory(
    id: string,
    params: {
      caption?: string;
      location?: MemoryLocation;
    }
  ): Promise<Memory> {
    return request<Memory>(`/memories/${id}`, {
      method: 'PATCH',
      body: params,
    });
  },

  async deleteMemory(id: string): Promise<void> {
    return request<void>(`/memories/${id}`, {
      method: 'DELETE',
    });
  },

  async getGroupCalendar(
    groupId: string,
    month?: string
  ): Promise<CalendarDayEntry[]> {
    const query = month ? `?month=${month}` : '';

    return request<CalendarDayEntry[]>(
      `/memories/groups/${groupId}/calendar${query}`
    );
  },

  async getGroupArchive(
    groupId: string
  ): Promise<Record<string, Record<string, any[]>>> {
    return request<Record<string, Record<string, any[]>>>(
      `/memories/groups/${groupId}/archive`
    );
  },
};
