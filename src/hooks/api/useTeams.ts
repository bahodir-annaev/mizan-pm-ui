import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import * as teamService from '@/services/team.service';
import type { ApiTeam, TeamRole } from '@/types/api';

export function useTeams() {
  return useQuery({
    queryKey: queryKeys.teams.list(),
    queryFn: teamService.getTeams,
  });
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: queryKeys.teams.detail(id),
    queryFn: () => teamService.getTeam(id),
    enabled: !!id,
  });
}

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: queryKeys.teams.members(teamId),
    queryFn: () => teamService.getTeamMembers(teamId),
    enabled: !!teamId,
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; code?: string; description?: string }) => teamService.createTeam(dto),
    onSuccess: (newTeam) => {
      qc.setQueryData<ApiTeam[]>(queryKeys.teams.list(), (old = []) => [...old, newTeam]);
    },
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { name?: string; description?: string } }) =>
      teamService.updateTeam(id, dto),
    onSuccess: (updated) => {
      qc.setQueryData<ApiTeam[]>(queryKeys.teams.list(), (old = []) =>
        old.map((t) => (t.id === updated.id ? updated : t)),
      );
      qc.setQueryData(queryKeys.teams.detail(updated.id), updated);
    },
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamService.deleteTeam(id),
    onSuccess: (_, id) => {
      qc.setQueryData<ApiTeam[]>(queryKeys.teams.list(), (old = []) => old.filter((t) => t.id !== id));
      qc.removeQueries({ queryKey: queryKeys.teams.detail(id) });
    },
  });
}

export function useAddTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId, role }: { teamId: string; userId: string; role?: TeamRole }) =>
      teamService.addTeamMember(teamId, userId, role),
    onSuccess: (_, { teamId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.teams.members(teamId) });
    },
  });
}

export function useUpdateTeamMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId, teamRole }: { teamId: string; userId: string; teamRole: TeamRole }) =>
      teamService.updateTeamMemberRole(teamId, userId, teamRole),
    onSuccess: (_, { teamId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.teams.members(teamId) });
    },
  });
}

export function useRemoveTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      teamService.removeTeamMember(teamId, userId),
    onSuccess: (_, { teamId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.teams.members(teamId) });
    },
  });
}
