import { describe, it, expect } from 'vitest';
import { mapApiClientToClient, mapClientToCreateRequest } from '../client.mapper';
import type { ApiClient } from '@/types/api';

const baseApiClient: ApiClient = {
  id: 'client-1',
  name: 'Acme Corp',
  type: 'COMPANY',
  isFavorite: false,
  orgId: 'org-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('mapApiClientToClient', () => {
  it('maps basic fields', () => {
    const result = mapApiClientToClient(baseApiClient);
    expect(result.id).toBe('client-1');
    expect(result.name).toBe('Acme Corp');
    expect(result.isFavorite).toBe(false);
  });

  it('maps type enum to display string', () => {
    const cases: Array<[ApiClient['type'], string]> = [
      ['INDIVIDUAL', 'Individual'],
      ['COMPANY', 'Company'],
      ['GOVERNMENT', 'Government'],
      ['NGO', 'NGO'],
    ];
    cases.forEach(([key, display]) => {
      const result = mapApiClientToClient({ ...baseApiClient, type: key });
      expect(result.type).toBe(display);
    });
  });

  it('uses first primary contact as contactPerson', () => {
    const result = mapApiClientToClient({
      ...baseApiClient,
      contacts: [
        { id: 'c1', clientId: 'client-1', name: 'Alice', isPrimary: false },
        { id: 'c2', clientId: 'client-1', name: 'Bob', email: 'bob@co.com', isPrimary: true },
      ],
    });
    expect(result.contactPerson).toBe('Bob');
    expect(result.contactEmail).toBe('bob@co.com');
  });

  it('falls back to first contact when no primary', () => {
    const result = mapApiClientToClient({
      ...baseApiClient,
      contacts: [
        { id: 'c1', clientId: 'client-1', name: 'Charlie', isPrimary: false },
      ],
    });
    expect(result.contactPerson).toBe('Charlie');
  });

  it('leaves contactPerson undefined when no contacts', () => {
    const result = mapApiClientToClient(baseApiClient);
    expect(result.contactPerson).toBeUndefined();
  });
});

describe('mapClientToCreateRequest', () => {
  it('maps name and uppercases type', () => {
    const dto = mapClientToCreateRequest({ name: 'New Client', type: 'individual' });
    expect(dto.name).toBe('New Client');
    expect(dto.type).toBe('INDIVIDUAL');
  });

  it('defaults type to COMPANY when absent', () => {
    const dto = mapClientToCreateRequest({ name: 'Co' });
    expect(dto.type).toBe('COMPANY');
  });
});
