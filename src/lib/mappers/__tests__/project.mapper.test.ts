import { describe, it, expect } from 'vitest';
import { mapApiProjectToProject, mapProjectToCreateRequest } from '../project.mapper';
import type { ApiProject } from '@/types/api';

const baseApiProject: ApiProject = {
  id: 'proj-1',
  name: 'Test Project',
  description: 'A test project',
  status: 'IN_PROGRESS',
  progress: 42,
  isPinned: false,
  orgId: 'org-1',
  createdAt: '2024-01-12T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

describe('mapApiProjectToProject', () => {
  it('maps basic fields correctly', () => {
    const result = mapApiProjectToProject(baseApiProject);
    expect(result.id).toBe('proj-1');
    expect(result.name).toBe('Test Project');
    expect(result.description).toBe('A test project');
    expect(result.isPinned).toBe(false);
  });

  it('maps status enum to display string', () => {
    const result = mapApiProjectToProject(baseApiProject);
    expect(result.status).toBe('In Progress');
    expect(result.statusKey).toBe('IN_PROGRESS');
  });

  it('maps all status values', () => {
    const statuses: Array<[ApiProject['status'], string]> = [
      ['PLANNING', 'Planning'],
      ['IN_PROGRESS', 'In Progress'],
      ['ON_HOLD', 'On Hold'],
      ['COMPLETED', 'Completed'],
      ['CANCELLED', 'Cancelled'],
    ];
    statuses.forEach(([key, display]) => {
      const result = mapApiProjectToProject({ ...baseApiProject, status: key });
      expect(result.status).toBe(display);
    });
  });

  it('maps progress and holat alias', () => {
    const result = mapApiProjectToProject({ ...baseApiProject, progress: 75 });
    expect(result.progress).toBe(75);
    expect(result.holat).toBe(75);
  });

  it('formats areaSqm to kvadratura string', () => {
    const result = mapApiProjectToProject({ ...baseApiProject, areaSqm: 1250 });
    expect(result.kvadratura).toBe('1250 m²');
    expect(result.areaSqm).toBe(1250);
  });

  it('leaves kvadratura undefined when areaSqm is absent', () => {
    const result = mapApiProjectToProject(baseApiProject);
    expect(result.kvadratura).toBeUndefined();
  });

  it('formats ISO startDate to display string', () => {
    const result = mapApiProjectToProject({ ...baseApiProject, startDate: '2024-01-12T00:00:00.000Z' });
    expect(result.startDate).toBe('12 Jan 2024');
    expect(result.dateStart).toBe('12 Jan 2024');
  });

  it('formats ISO dueDate to display string', () => {
    const result = mapApiProjectToProject({ ...baseApiProject, dueDate: '2024-06-30T00:00:00.000Z' });
    expect(result.dueDate).toBe('30 Jun 2024');
    expect(result.dateEnd).toBe('30 Jun 2024');
  });

  it('leaves dates undefined when absent', () => {
    const result = mapApiProjectToProject(baseApiProject);
    expect(result.startDate).toBeUndefined();
    expect(result.dueDate).toBeUndefined();
  });

  it('maps client name from nested client', () => {
    const result = mapApiProjectToProject({
      ...baseApiProject,
      clientId: 'client-1',
      client: { id: 'client-1', name: 'Acme Corp', type: 'COMPANY', isFavorite: false, orgId: 'org-1', createdAt: '', updatedAt: '' },
    });
    expect(result.clientName).toBe('Acme Corp');
    expect(result.clientId).toBe('client-1');
  });

  it('counts members from members array', () => {
    const result = mapApiProjectToProject({
      ...baseApiProject,
      members: [
        { userId: 'u1', projectId: 'proj-1', role: 'member', user: {} as any },
        { userId: 'u2', projectId: 'proj-1', role: 'owner', user: {} as any },
      ],
    });
    expect(result.memberCount).toBe(2);
  });
});

describe('mapProjectToCreateRequest', () => {
  it('maps domain project to create DTO', () => {
    const dto = mapProjectToCreateRequest({
      name: 'New Project',
      statusKey: 'PLANNING',
      budget: 500000,
    });
    expect(dto.name).toBe('New Project');
    expect(dto.status).toBe('PLANNING');
    expect(dto.budget).toBe(500000);
  });

  it('defaults name to empty string when undefined', () => {
    const dto = mapProjectToCreateRequest({});
    expect(dto.name).toBe('');
  });
});
