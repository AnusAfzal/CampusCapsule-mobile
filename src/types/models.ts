export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  createdAt?: string;
}

export interface Group {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  createdBy: string;
  coverImage?: string;
  createdAt?: string;
  userRole?: UserRole;
  memberCount?: number;
  memoryCount?: number;
}

export interface GroupMember {
  membershipId: string;
  user: User;
  role: UserRole;
  joinedAt: string;
}

export interface MemoryLocation {
  latitude?: number | null;
  longitude?: number | null;
  readableName?: string;
}

export interface Memory {
  id?: string;
  _id?: string;
  groupId: string;
  userId: User;
  imageUrl: string;
  cloudinaryPublicId: string;
  memoryDate: string; // YYYY-MM-DD
  caption?: string;
  location?: MemoryLocation;
  createdAt: string;
  updatedAt?: string;
}

export interface InviteInfo {
  // The backend wraps invite metadata under an "invite" sub-object:
  // { group: {...}, invite: { code, expiresAt }, alreadyMember }
  invite: {
    code: string;
    expiresAt: string;
  };
  group: {
    id: string;
    name: string;
    description?: string;
    coverImage?: string;
    memberCount: number;
  };
  alreadyMember: boolean;
}
