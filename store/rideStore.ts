import { create } from 'zustand';

interface RideGroup {
  id: string;
  destination: string;
  memberCount: number;
  members: Array<{
    id: string;
    name: string;
    profileImage?: string;
    verified: boolean;
  }>;
  estimatedCost: number;
  createdAt: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface RideState {
  selectedDestination: string | null;
  currentFlightId: string | null;
  rideGroups: RideGroup[];
  currentGroup: RideGroup | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedDestination: (destination: string) => void;
  setCurrentFlightId: (flightId: string) => void;
  setRideGroups: (groups: RideGroup[]) => void;
  setCurrentGroup: (group: RideGroup | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addMemberToGroup: (groupId: string, member: any) => void;
  removeMemberFromGroup: (groupId: string, memberId: string) => void;
  updateGroupStatus: (groupId: string, status: string) => void;
  clearRideData: () => void;
}

export const useRideStore = create<RideState>((set) => ({
  selectedDestination: null,
  currentFlightId: null,
  rideGroups: [],
  currentGroup: null,
  isLoading: false,
  error: null,

  setSelectedDestination: (destination) =>
    set({ selectedDestination: destination }),

  setCurrentFlightId: (flightId) =>
    set({ currentFlightId: flightId }),

  setRideGroups: (groups) =>
    set({ rideGroups: groups }),

  setCurrentGroup: (group) =>
    set({ currentGroup: group }),

  setIsLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({ error }),

  addMemberToGroup: (groupId, member) =>
    set((state) => ({
      rideGroups: state.rideGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              members: [...group.members, member],
              memberCount: group.memberCount + 1,
            }
          : group
      ),
      currentGroup:
        state.currentGroup?.id === groupId
          ? {
              ...state.currentGroup,
              members: [...state.currentGroup.members, member],
              memberCount: state.currentGroup.memberCount + 1,
            }
          : state.currentGroup,
    })),

  removeMemberFromGroup: (groupId, memberId) =>
    set((state) => ({
      rideGroups: state.rideGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              members: group.members.filter((m) => m.id !== memberId),
              memberCount: group.memberCount - 1,
            }
          : group
      ),
      currentGroup:
        state.currentGroup?.id === groupId
          ? {
              ...state.currentGroup,
              members: state.currentGroup.members.filter((m) => m.id !== memberId),
              memberCount: state.currentGroup.memberCount - 1,
            }
          : state.currentGroup,
    })),

  updateGroupStatus: (groupId, status) =>
    set((state) => ({
      rideGroups: state.rideGroups.map((group) =>
        group.id === groupId
          ? { ...group, status: status as any }
          : group
      ),
      currentGroup:
        state.currentGroup?.id === groupId
          ? { ...state.currentGroup, status: status as any }
          : state.currentGroup,
    })),

  clearRideData: () =>
    set({
      selectedDestination: null,
      currentFlightId: null,
      rideGroups: [],
      currentGroup: null,
      error: null,
    }),
}));
