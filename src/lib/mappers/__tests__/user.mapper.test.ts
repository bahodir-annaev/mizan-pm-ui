import { describe, it, expect } from 'vitest';
import {
  getUserColor,
  getUserInitials,
  mapApiUserToTeamMember,
  mapApiUserToTaskAssignee,
  mapApiUserToAuthUser,
} from '../user.mapper';
import type { ApiUser } from '@/types/api';

const baseUser: ApiUser = {
  id: 'user-1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  position: 'Developer',
  status: 'ACTIVE',
  isActive: true,
  orgId: 'org-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('getUserInitials', () => {
  it('returns uppercase initials from first and last name', () => {
    expect(getUserInitials('John', 'Doe')).toBe('JD');
  });

  it('works with single-letter names', () => {
    expect(getUserInitials('A', 'B')).toBe('AB');
  });

  it('uppercases lowercase input', () => {
    expect(getUserInitials('alice', 'smith')).toBe('AS');
  });
});

describe('getUserColor', () => {
  it('returns a valid hex color string', () => {
    const color = getUserColor('user-1');
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('returns same color for same id (deterministic)', () => {
    expect(getUserColor('user-abc')).toBe(getUserColor('user-abc'));
  });

  it('returns different colors for different ids (high probability)', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const colors = ids.map(getUserColor);
    const unique = new Set(colors);
    // With 8 ids and 10 colors, very unlikely all are the same
    expect(unique.size).toBeGreaterThan(1);
  });
});

describe('mapApiUserToTeamMember', () => {
  it('concatenates firstName and lastName into name', () => {
    const result = mapApiUserToTeamMember(baseUser);
    expect(result.name).toBe('John Doe');
  });

  it('computes initials correctly', () => {
    const result = mapApiUserToTeamMember(baseUser);
    expect(result.initials).toBe('JD');
  });

  it('assigns a color string', () => {
    const result = mapApiUserToTeamMember(baseUser);
    expect(result.color).toMatch(/^#/);
  });

  it('maps role from position', () => {
    const result = mapApiUserToTeamMember(baseUser);
    expect(result.role).toBe('Developer');
  });

  it('defaults role to "Member" when position is absent', () => {
    const result = mapApiUserToTeamMember({ ...baseUser, position: undefined });
    expect(result.role).toBe('Member');
  });

  it('preserves email and orgId', () => {
    const result = mapApiUserToTeamMember(baseUser);
    expect(result.email).toBe('john.doe@example.com');
    expect(result.orgId).toBe('org-1');
  });
});

describe('mapApiUserToTaskAssignee', () => {
  it('returns id, name, initials, color', () => {
    const result = mapApiUserToTaskAssignee(baseUser);
    expect(result.id).toBe('user-1');
    expect(result.name).toBe('John Doe');
    expect(result.initials).toBe('JD');
    expect(result.color).toBeTruthy();
  });
});

describe('mapApiUserToAuthUser', () => {
  it('maps to AuthUser shape', () => {
    const result = mapApiUserToAuthUser(baseUser);
    expect(result.id).toBe('user-1');
    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john.doe@example.com');
    expect(result.initials).toBe('JD');
    expect(result.orgId).toBe('org-1');
  });
});
