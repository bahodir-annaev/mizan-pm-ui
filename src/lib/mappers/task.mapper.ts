import type { ApiTask, CreateTaskDto } from '@/types/api';
import type { Task } from '@/types/domain';
import { mapApiUserToTaskAssignee } from './user.mapper';

const STATUS_DISPLAY: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
};

const PRIORITY_DISPLAY: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export function mapApiTaskToTask(api: ApiTask): Task {
  const primaryAssignee = api.assignee
    ? mapApiUserToTaskAssignee(api.assignee)
    : api.assignees?.[0]
      ? mapApiUserToTaskAssignee(api.assignees[0])
      : undefined;

  const participants = api.participants?.map((p) => mapApiUserToTaskAssignee(p.user)) ?? [];

  return {
    id: api.id,
    code: api.code,
    title: api.title,
    description: api.description,
    status: STATUS_DISPLAY[api.status] ?? api.status,
    statusKey: api.status,
    priority: PRIORITY_DISPLAY[api.priority] ?? api.priority,
    priorityKey: api.priority,
    workType: api.workType,
    startDate: api.startDate,
    dueDate: api.dueDate,
    estimatedHours: api.estimatedHours,
    actualHours: api.actualHours,
    progress: api.progress,
    projectId: api.projectId,
    parentId: api.parentId,
    assignee: primaryAssignee,
    participants,
    subtasks: api.subtasks?.map(mapApiTaskToTask),
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    // Legacy aliases
    project: api.project,
    dateStart: api.startDate,
    dateEnd: api.dueDate,
    acceptance: api.acceptance,
  };
}

export function mapTaskToCreateRequest(task: Partial<Task> & { projectId: string }): CreateTaskDto {
  return {
    title: task.title ?? '',
    description: task.description,
    status: task.statusKey as CreateTaskDto['status'],
    priority: task.priorityKey as CreateTaskDto['priority'],
    startDate: task.startDate,
    dueDate: task.dueDate,
    estimatedHours: task.estimatedHours,
    projectId: task.projectId,
    parentId: task.parentId,
    assigneeId: task.assignee?.id,
  };
}
