import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import * as userService from '@/services/user.service';
import type { TeamMember } from '@/types/domain';
import type { UpdateUserDto, ChangePasswordDto, UpdatePreferencesDto, CreateUserDto } from '@/types/api';

export function useOnlineUsers() {
  return useQuery({
    queryKey: queryKeys.users.online(),
    queryFn: userService.getOnlineUserIds,
    staleTime: 30_000,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: userService.getUsers,
  });
}

export function useMe() {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: userService.getMe,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) => userService.updateUser(id, dto),
    onSuccess: (updated) => {
      qc.setQueryData<TeamMember[]>(queryKeys.users.list(), (old = []) =>
        old.map((u) => (u.id === updated.id ? updated : u)),
      );
      qc.setQueryData(queryKeys.users.detail(updated.id), updated);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (dto: ChangePasswordDto) => userService.changePassword(dto),
  });
}

export function useUpdatePreferences() {
  return useMutation({
    mutationFn: (dto: UpdatePreferencesDto) => userService.updatePreferences(dto),
  });
}

export function useAssignUserToOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, orgId }: { userId: string; orgId: string | null }) =>
      userService.assignUserToOrg(userId, orgId),
    onSuccess: (_, { userId, orgId }) => {
      qc.setQueryData<TeamMember[]>(queryKeys.users.list(), (old = []) =>
        old.map((u) => (u.id === userId ? { ...u, orgId: orgId ?? undefined } : u)),
      );
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateUserDto & { role?: string }) => userService.createUser(dto),
    onSuccess: (newUser) => {
      qc.setQueryData<TeamMember[]>(queryKeys.users.list(), (old = []) => [...old, newUser]);
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: (_, id) => {
      qc.setQueryData<TeamMember[]>(queryKeys.users.list(), (old = []) => old.filter((u) => u.id !== id));
      qc.removeQueries({ queryKey: queryKeys.users.detail(id) });
    },
  });
}
