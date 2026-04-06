import type { ApiClient, CreateClientDto } from '@/types/api';
import type { Client, ContactPerson } from '@/types/domain';

const TYPE_DISPLAY: Record<string, string> = {
  INDIVIDUAL: 'Individual',
  COMPANY: 'Company',
  GOVERNMENT: 'Government',
  NGO: 'NGO',
};

export function mapApiClientToClient(api: ApiClient): Client {
  const primaryContact = api.contacts?.find((c) => c.isPrimary) ?? api.contacts?.[0];
  return {
    id: api.id,
    name: api.name,
    type: TYPE_DISPLAY[api.clientType] ?? api.clientType,
    email: api.email,
    phone: api.phone,
    address: api.address,
    website: api.website,
    isFavorite: api.isFavorite,
    contactPerson: primaryContact?.name,
    contactEmail: primaryContact?.email,
    contactPhone: primaryContact?.phone,
    createdAt: api.createdAt,
  };
}

export function mapApiContactToContactPerson(api: ApiClient['contacts'][0]): ContactPerson {
  return {
    id: api.id,
    clientId: api.clientId,
    name: api.name,
    position: api.position,
    email: api.email,
    phone: api.phone,
    isPrimary: api.isPrimary,
  };
}

export function mapClientToCreateRequest(client: Partial<Client>): CreateClientDto {
  return {
    name: client.name ?? '',
    clientType: (client.type?.toUpperCase() ?? 'COMPANY') as CreateClientDto['clientType'],
    email: client.email,
    phone: client.phone,
    address: client.address,
    website: client.website,
  };
}
