import { format, parseISO } from 'date-fns';
import type { ApiProject, CreateProjectDto } from '@/types/api';
import type { Project } from '@/types/domain';

const STATUS_DISPLAY: Record<string, string> = {
  PLANNING: 'Planning',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const TYPE_DISPLAY: Record<string, string> = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial',
  INFRASTRUCTURE: 'Infrastructure',
  INDUSTRIAL: 'Industrial',
  OTHER: 'Other',
};

const SIZE_DISPLAY: Record<string, string> = {
  SMALL: 'Small',
  MEDIUM: 'Medium',
  LARGE: 'Large',
};

const COMPLEXITY_DISPLAY: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  try {
    return format(parseISO(iso), 'dd MMM yyyy');
  } catch {
    return iso;
  }
}

export function mapApiProjectToProject(api: ApiProject): Project {
  const startDate = formatDate(api.startDate);
  const dueDate = formatDate(api.dueDate);
  const kvadratura = api.areaSqm ? `${api.areaSqm} m²` : undefined;

  return {
    id: api.id,
    name: api.name,
    description: api.description,
    status: STATUS_DISPLAY[api.status] ?? api.status,
    statusKey: api.status,
    type: api.projectType ? (TYPE_DISPLAY[api.projectType] ?? api.projectType) : undefined,
    progress: api.progress,
    holat: api.progress,
    areaSqm: api.areaSqm,
    kvadratura,
    startDate,
    dueDate,
    dateStart: startDate,
    dateEnd: dueDate,
    budget: api.budget,
    size: api.size ? (SIZE_DISPLAY[api.size] ?? api.size) : undefined,
    complexity: api.complexity ? (COMPLEXITY_DISPLAY[api.complexity] ?? api.complexity) : undefined,
    isPinned: api.isPinned,
    clientId: api.clientId,
    clientName: api.client?.name,
    client: api.client?.name,
    memberCount: api.members?.length,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

export function mapProjectToCreateRequest(project: Partial<Project>): CreateProjectDto {
  return {
    name: project.name ?? '',
    description: project.description,
    status: project.statusKey as CreateProjectDto['status'],
    startDate: project.startDate,
    dueDate: project.dueDate,
    budget: project.budget,
    clientId: project.clientId,
    areaSqm: project.areaSqm,
  };
}
