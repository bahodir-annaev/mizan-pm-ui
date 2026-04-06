import { apiClient } from '@/lib/api-client';
import { USE_MOCK_DATA } from '@/lib/config';
import { mapApiClientToClient, mapApiContactToContactPerson } from '@/lib/mappers';
import { MOCK_CLIENTS } from '@/mocks/clients';
import type { Client, ContactPerson } from '@/types/domain';
import type { ApiClient, ApiContact, CreateClientDto, UpdateClientDto } from '@/types/api';

export interface ClientFilter {
  search?: string;
  page?: number;
  limit?: number;
}

export async function getClients(filter: ClientFilter = {}): Promise<Client[]> {
  if (USE_MOCK_DATA) {
    const { search } = filter;
    if (!search) return [...MOCK_CLIENTS];
    const q = search.toLowerCase();
    return MOCK_CLIENTS.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.phone ?? '').toLowerCase().includes(q),
    );
  }
  const params = new URLSearchParams();
  if (filter.search) params.set('search', filter.search);
  if (filter.page) params.set('page', String(filter.page));
  if (filter.limit) params.set('limit', String(filter.limit));
  const { data } = await apiClient.get<ApiClient[]>(`/clients?${params}`);
  return data.map(mapApiClientToClient);
}

export async function getClient(id: string): Promise<Client> {
  if (USE_MOCK_DATA) {
    const c = MOCK_CLIENTS.find((c) => c.id === id);
    if (!c) throw new Error(`Client ${id} not found`);
    return c;
  }
  const { data } = await apiClient.get<ApiClient>(`/clients/${id}`);
  return mapApiClientToClient(data);
}

export async function createClient(dto: CreateClientDto): Promise<Client> {
  if (USE_MOCK_DATA) {
    return {
      id: `CLT-${Date.now()}`,
      name: dto.name,
      type: dto.type,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      website: dto.website,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };
  }
  const { data } = await apiClient.post<ApiClient>('/clients', dto);
  return mapApiClientToClient(data);
}

export async function updateClient(id: string, dto: UpdateClientDto): Promise<Client> {
  if (USE_MOCK_DATA) {
    const existing = MOCK_CLIENTS.find((c) => c.id === id);
    return { ...(existing as Client), ...dto };
  }
  const { data } = await apiClient.patch<ApiClient>(`/clients/${id}`, dto);
  return mapApiClientToClient(data);
}

export async function deleteClient(id: string): Promise<void> {
  if (USE_MOCK_DATA) return;
  await apiClient.delete(`/clients/${id}`);
}

export async function toggleClientFavorite(id: string): Promise<Client> {
  if (USE_MOCK_DATA) {
    const existing = MOCK_CLIENTS.find((c) => c.id === id);
    if (!existing) throw new Error(`Client ${id} not found`);
    return { ...existing, isFavorite: !existing.isFavorite };
  }
  const { data } = await apiClient.patch<ApiClient>(`/clients/${id}/favorite`);
  return mapApiClientToClient(data);
}

export async function getClientContacts(clientId: string): Promise<ContactPerson[]> {
  if (USE_MOCK_DATA) return [];
  const { data } = await apiClient.get<ApiContact[]>(`/clients/${clientId}/contacts`);
  return data.map(mapApiContactToContactPerson);
}

export async function createContact(clientId: string, dto: Partial<ContactPerson>): Promise<ContactPerson> {
  if (USE_MOCK_DATA) {
    return {
      id: `CONT-${Date.now()}`,
      clientId,
      name: dto.name ?? '',
      position: dto.position,
      email: dto.email,
      phone: dto.phone,
      isPrimary: dto.isPrimary ?? false,
    };
  }
  const { data } = await apiClient.post<ApiContact>(`/clients/${clientId}/contacts`, dto);
  return mapApiContactToContactPerson(data);
}

export async function deleteContact(clientId: string, contactId: string): Promise<void> {
  if (USE_MOCK_DATA) return;
  await apiClient.delete(`/clients/${clientId}/contacts/${contactId}`);
}
