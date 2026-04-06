import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import * as clientService from '@/services/client.service';
import type { Client, ContactPerson } from '@/types/domain';
import type { CreateClientDto, UpdateClientDto } from '@/types/api';

export function useClients(filter: clientService.ClientFilter = {}) {
  return useQuery({
    queryKey: [...queryKeys.clients.list(), filter],
    queryFn: () => clientService.getClients(filter),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: queryKeys.clients.detail(id),
    queryFn: () => clientService.getClient(id),
    enabled: !!id,
  });
}

export function useClientContacts(clientId: string) {
  return useQuery({
    queryKey: queryKeys.clients.contacts(clientId),
    queryFn: () => clientService.getClientContacts(clientId),
    enabled: !!clientId,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateClientDto) => clientService.createClient(dto),
    onSuccess: (newClient) => {
      qc.setQueryData<Client[]>(queryKeys.clients.list(), (old = []) => [...old, newClient]);
    },
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateClientDto }) => clientService.updateClient(id, dto),
    onSuccess: (updated) => {
      qc.setQueryData<Client[]>(queryKeys.clients.list(), (old = []) =>
        old.map((c) => (c.id === updated.id ? updated : c)),
      );
      qc.setQueryData(queryKeys.clients.detail(updated.id), updated);
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientService.deleteClient(id),
    onSuccess: (_, id) => {
      qc.setQueryData<Client[]>(queryKeys.clients.list(), (old = []) => old.filter((c) => c.id !== id));
      qc.removeQueries({ queryKey: queryKeys.clients.detail(id) });
    },
  });
}

export function useToggleClientFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientService.toggleClientFavorite(id),
    onSuccess: (updated) => {
      qc.setQueryData<Client[]>(queryKeys.clients.list(), (old = []) =>
        old.map((c) => (c.id === updated.id ? updated : c)),
      );
    },
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, dto }: { clientId: string; dto: Partial<ContactPerson> }) =>
      clientService.createContact(clientId, dto),
    onSuccess: (_, { clientId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.clients.contacts(clientId) });
    },
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, contactId }: { clientId: string; contactId: string }) =>
      clientService.deleteContact(clientId, contactId),
    onSuccess: (_, { clientId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.clients.contacts(clientId) });
    },
  });
}
