import { apiClient } from '@/lib/api-client';
import { mapApiClientToClient, mapApiContactToContactPerson } from '@/lib/mappers';
import type { Client, ContactPerson } from '@/types/domain';
import type { ApiClient, ApiContact, CreateClientDto, UpdateClientDto } from '@/types/api';

export interface ClientFilter {
  search?: string;
  page?: number;
  limit?: number;
}

export async function getClients(filter: ClientFilter = {}): Promise<Client[]> {
  const params = new URLSearchParams();
  if (filter.search) params.set('search', filter.search);
  if (filter.page) params.set('page', String(filter.page));
  if (filter.limit) params.set('limit', String(filter.limit));
  const { data } = await apiClient.get<ApiClient[]>(`/clients?${params}`);
  return data.map(mapApiClientToClient);
}

export async function getClient(id: string): Promise<Client> {
  const { data } = await apiClient.get<ApiClient>(`/clients/${id}`);
  return mapApiClientToClient(data);
}

export async function createClient(dto: CreateClientDto): Promise<Client> {
  const { data } = await apiClient.post<ApiClient>('/clients', dto);
  return mapApiClientToClient(data);
}

export async function updateClient(id: string, dto: UpdateClientDto): Promise<Client> {
  const { data } = await apiClient.patch<ApiClient>(`/clients/${id}`, dto);
  return mapApiClientToClient(data);
}

export async function deleteClient(id: string): Promise<void> {
  await apiClient.delete(`/clients/${id}`);
}

export async function toggleClientFavorite(id: string): Promise<Client> {
  const { data } = await apiClient.patch<ApiClient>(`/clients/${id}/favorite`);
  return mapApiClientToClient(data);
}

export async function getClientContacts(clientId: string): Promise<ContactPerson[]> {
  const { data } = await apiClient.get<ApiContact[]>(`/clients/${clientId}/contacts`);
  return data.map(mapApiContactToContactPerson);
}

export async function createContact(clientId: string, dto: Partial<ContactPerson>): Promise<ContactPerson> {
  const { data } = await apiClient.post<ApiContact>(`/clients/${clientId}/contacts`, dto);
  return mapApiContactToContactPerson(data);
}

export async function deleteContact(clientId: string, contactId: string): Promise<void> {
  await apiClient.delete(`/clients/${clientId}/contacts/${contactId}`);
}
