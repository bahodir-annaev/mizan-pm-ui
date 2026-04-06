import { describe, it, expect } from 'vitest';
import { mapApiTaskToTask, mapTaskToCreateRequest } from '../task.mapper';
import type { ApiTask, ApiUser } from '@/types/api';

const baseUser: ApiUser = {
  id: 'user-1',
  email: 'jane@example.com',
  firstName: 'Jane',
  lastName: 'Smith',
  status: 'ACTIVE',
  isActive: true,
  orgId: 'org-1',
  createdAt: '',
  updatedAt: '',
};

const baseApiTask: ApiTask = {
  id: 'task-1',
  title: 'Design foundation',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  projectId: 'proj-1',
  createdAt: '2024-01-10T00:00:00.000Z',
  updatedAt: '2024-01-11T00:00:00.000Z',
};

describe('mapApiTaskToTask', () => {
  it('maps basic fields', () => {
    const result = mapApiTaskToTask(baseApiTask);
    expect(result.id).toBe('task-1');
    expect(result.title).toBe('Design foundation');
    expect(result.projectId).toBe('proj-1');
  });

  it('maps status enum to display string', () => {
    const result = mapApiTaskToTask(baseApiTask);
    expect(result.status).toBe('In Progress');
    expect(result.statusKey).toBe('IN_PROGRESS');
  });

  it('maps all status values', () => {
    const cases: Array<[ApiTask['status'], string]> = [
      ['TODO', 'To Do'],
      ['IN_PROGRESS', 'In Progress'],
      ['IN_REVIEW', 'In Review'],
      ['DONE', 'Done'],
      ['CANCELLED', 'Cancelled'],
    ];
    cases.forEach(([key, display]) => {
      const result = mapApiTaskToTask({ ...baseApiTask, status: key });
      expect(result.status).toBe(display);
    });
  });

  it('maps priority enum to display string', () => {
    const result = mapApiTaskToTask(baseApiTask);
    expect(result.priority).toBe('High');
    expect(result.priorityKey).toBe('HIGH');
  });

  it('maps all priority values', () => {
    const cases: Array<[ApiTask['priority'], string]> = [
      ['LOW', 'Low'],
      ['MEDIUM', 'Medium'],
      ['HIGH', 'High'],
      ['URGENT', 'Urgent'],
    ];
    cases.forEach(([key, display]) => {
      const result = mapApiTaskToTask({ ...baseApiTask, priority: key });
      expect(result.priority).toBe(display);
    });
  });

  it('uses assignee field when present', () => {
    const result = mapApiTaskToTask({ ...baseApiTask, assignee: baseUser });
    expect(result.assignee?.id).toBe('user-1');
    expect(result.assignee?.name).toBe('Jane Smith');
    expect(result.assignee?.initials).toBe('JS');
  });

  it('falls back to first assignee from assignees array when no assignee', () => {
    const result = mapApiTaskToTask({ ...baseApiTask, assignees: [baseUser] });
    expect(result.assignee?.id).toBe('user-1');
  });

  it('leaves assignee undefined when neither present', () => {
    const result = mapApiTaskToTask(baseApiTask);
    expect(result.assignee).toBeUndefined();
  });

  it('maps participants array', () => {
    const result = mapApiTaskToTask({ ...baseApiTask, participants: [baseUser] });
    expect(result.participants).toHaveLength(1);
    expect(result.participants![0].id).toBe('user-1');
  });

  it('recursively maps subtasks', () => {
    const subtask: ApiTask = { ...baseApiTask, id: 'sub-1', title: 'Sub task', status: 'TODO', priority: 'LOW' };
    const result = mapApiTaskToTask({ ...baseApiTask, subtasks: [subtask] });
    expect(result.subtasks).toHaveLength(1);
    expect(result.subtasks![0].id).toBe('sub-1');
    expect(result.subtasks![0].status).toBe('To Do');
  });
});

describe('mapTaskToCreateRequest', () => {
  it('maps required fields', () => {
    const dto = mapTaskToCreateRequest({
      title: 'New Task',
      projectId: 'proj-1',
      statusKey: 'TODO',
      priorityKey: 'MEDIUM',
    });
    expect(dto.title).toBe('New Task');
    expect(dto.projectId).toBe('proj-1');
    expect(dto.status).toBe('TODO');
    expect(dto.priority).toBe('MEDIUM');
  });

  it('includes assigneeId from assignee', () => {
    const dto = mapTaskToCreateRequest({
      projectId: 'proj-1',
      assignee: { id: 'user-99', name: '', initials: '', color: '' },
    });
    expect(dto.assigneeId).toBe('user-99');
  });
});
