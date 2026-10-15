import { create } from 'zustand';
import { Group } from '../types/models';

interface GroupState {
  currentGroup: Group | null;
  groups: Group[];
  setCurrentGroup: (group: Group | null) => void;
  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
}

export const useGroupStore = create<GroupState>((set) => ({
  currentGroup: null,
  groups: [],

  setCurrentGroup: (group) => set({ currentGroup: group }),
  setGroups: (groups) => {
    set((state) => {
      // If current group is not in list, pick the first one
      let current = state.currentGroup;
      if (!current && groups.length > 0) {
        current = groups[0];
      } else if (current && !groups.some((g) => (g.id || g._id) === (current?.id || current?._id))) {
        current = groups[0] || null;
      }
      return { groups, currentGroup: current };
    });
  },
  addGroup: (group) =>
    set((state) => ({
      groups: [group, ...state.groups],
      currentGroup: group,
    })),
}));
