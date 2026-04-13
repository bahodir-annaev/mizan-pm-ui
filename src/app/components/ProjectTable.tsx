import { useState, useEffect } from 'react';
import {
  Hash,
  FileText,
  User,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
  Layers,
  Tag,
  Folder,
} from 'lucide-react';
import { TaskDetailPage } from './TaskDetailPage';
import { AddTaskRow } from './AddTaskRow';
import { ColumnEditorModal, ColumnConfig } from './ColumnEditorModal';
import { useColumnConfig } from '../hooks/useColumnConfig';
import { EditableProjectCell } from './EditableProjectCell';
import { ProjectScopePopover } from './ProjectScopePopover';
import { ProjectTaskDetailOverlay } from './ProjectTaskDetailOverlay';
import { ProjectsToolbar } from './ProjectsToolbar';
import { useProjects } from '@/hooks/api/useProjects';
import type { Project } from '@/types/domain';

// Legacy mock fallback — replaced by useProjects() hook below
const _LEGACY_PROJECTS: Project[] = [];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'In Progress':
      return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#60A5FA', dot: '#60A5FA' };
    case 'Start':
      return { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.25)', text: '#60A5FA', dot: '#60A5FA' };
    case 'Burning':
      return { bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.3)', text: '#FB923C', dot: '#FB923C' };
    case 'End':
      return { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22C55E', dot: '#22C55E' };
    case 'Late':
      return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#EF4444', dot: '#EF4444' };
    default:
      return { bg: 'rgba(156, 163, 175, 0.1)', border: 'rgba(156, 163, 175, 0.3)', text: '#9CA3AF', dot: '#9CA3AF' };
  }
};

// Default column configuration
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'id', label: 'ID', visible: true, locked: false },
  { id: 'name', label: 'Project Name', visible: true, locked: false },
  { id: 'client', label: 'Client', visible: true, locked: false },
  { id: 'dateStart', label: 'Date Start', visible: true, locked: false },
  { id: 'dateEnd', label: 'Date End', visible: true, locked: false },
  { id: 'holat', label: 'Holat', visible: true, locked: false },
  { id: 'status', label: 'Status', visible: true, locked: false },
  { id: 'size', label: 'Project Size', visible: true, locked: false },
  { id: 'type', label: 'Project Type', visible: true, locked: false },
];

export function ProjectTable() {
  const { data: serverProjects = _LEGACY_PROJECTS } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'detail'>('table');
  const [detailTask, setDetailTask] = useState<Project | null>(null);
  const [isColumnEditorOpen, setIsColumnEditorOpen] = useState(false);
  const [projectsData, setProjectsData] = useState<Project[]>(_LEGACY_PROJECTS);

  // Sync local state with server data when it loads
  useEffect(() => {
    if (serverProjects.length) setProjectsData(serverProjects);
  }, [serverProjects]);

  const {
    columns,
    visibleColumns,
    renameColumn,
    saveColumns,
    resetColumns,
    getColumnById
  } = useColumnConfig({
    storageKey: 'projects-table-columns',
    defaultColumns: DEFAULT_COLUMNS
  });

  const canEditColumns = true; // In real app, check user permissions

  // Handler for updating project data
  const handleUpdateProject = (projectId: string, field: keyof Project, value: any) => {
    setProjectsData(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId
          ? { ...project, [field]: value }
          : project
      )
    );
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    // Delay clearing selection to allow animation to complete
    setTimeout(() => setSelectedProject(null), 300);
  };

  const handleOpenTaskDetail = (project: Project) => {
    setDetailTask(project);
    setViewMode('detail');
  };

  const handleBackToTable = () => {
    setViewMode('table');
    setDetailTask(null);
  };

  const handleAddTask = (task: {
    title: string;
    project?: string;
    status: string;
    assignee?: string;
    dueDate?: string;
  }) => {
    const newId = `PRJ-${String(projectsData.length + 1).padStart(3, '0')}`;
    const newProject: Project = {
      id: newId,
      name: task.title,
      client: task.project || 'New Client',
      dateStart: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      dateEnd: task.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      holat: 0,
      status: task.status,
      size: 'Medium',
      kvadratura: '0 m²',
      type: 'Interior',
      progress: 0,
      description: 'New project - details to be added',
      complexity: 'Medium',
      duration: '4-6 weeks'
    };
    setProjectsData(prevProjects => [...prevProjects, newProject]);
  };

  // If in detail view mode, show TaskDetailPage
  if (viewMode === 'detail' && detailTask) {
    return <TaskDetailPage task={detailTask} onBack={handleBackToTable} />;
  }

  return (
    <>
      {/* Column Editor Modal */}
      <ColumnEditorModal
        isOpen={isColumnEditorOpen}
        onClose={() => setIsColumnEditorOpen(false)}
        columns={columns}
        onSave={saveColumns}
        onReset={resetColumns}
      />

      <div className="rounded-xl overflow-hidden" style={{
        backgroundColor: 'var(--surface-primary)',
        border: '1px solid var(--border-primary)'
      }}>
        <ProjectsToolbar />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{
                borderBottom: '1px solid var(--border-secondary)',
                backgroundColor: 'var(--surface-secondary)',
                height: '52px'
              }}>
                <th className="px-4 text-left" style={{ color: 'var(--text-tertiary)', width: '80px' }}>
                  <div className="flex items-center gap-1.5">
                    <Hash style={{ width: '13px', height: '13px' }} />
                    <span className="text-xs font-semibold">{getColumnById('id')?.label || 'ID'}</span>
                  </div>
                </th>
                <th className="px-4 text-left" style={{ color: 'var(--text-tertiary)', minWidth: '280px' }}>
                  <div className="flex items-center gap-1.5">
                    <FileText style={{ width: '13px', height: '13px' }} />
                    <span className="text-xs font-semibold">{getColumnById('name')?.label || 'Project Name'}</span>
                  </div>
                </th>
                <th className="px-4 text-left" style={{ color: 'var(--text-tertiary)' }}>
                  <div className="flex items-center gap-1.5">
                    <User style={{ width: '13px', height: '13px' }} />
                    <span className="text-xs font-semibold">{getColumnById('client')?.label || 'Client'}</span>
                  </div>
                </th>
                <th className="px-4 text-left" style={{ color: 'var(--text-tertiary)' }}>
                  <div className="flex items-center gap-1.5">
                    <Calendar style={{ width: '13px', height: '13px' }} />
                    <span className="text-xs font-semibold">{getColumnById('dateStart')?.label || 'Date Start'}</span>
                  </div>
                </th>
                <th className="px-4 text-left" style={{ color: 'var(--text-tertiary)' }}>
                  <div className="flex items-center gap-1.5">
                    <Clock style={{ width: '13px', height: '13px' }} />
                    <span className="text-xs font-semibold">{getColumnById('dateEnd')?.label || 'Date End'}</span>
                  </div>
                </th>
                <th className="px-4 text-left" style={{ color: 'var(--text-tertiary)', minWidth: '140px' }}>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp style={{ width: '13px', height: '13px' }} />
                    <span className="text-xs font-semibold">{getColumnById('holat')?.label || 'Progress'}</span>
                  </div>
                </th>
                <th className="px-4 text-left" style={{ color: 'var(--text-tertiary)' }}>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle style={{ width: '13px', height: '13px' }} />
                    <span className="text-xs font-semibold">{getColumnById('status')?.label || 'Status'}</span>
                  </div>
                </th>
                <th className="px-4 text-left" style={{ color: 'var(--text-tertiary)' }}>
                  <div className="flex items-center gap-1.5">
                    <Layers style={{ width: '13px', height: '13px' }} />
                    <span className="text-xs font-semibold">{getColumnById('size')?.label || 'Size'}</span>
                  </div>
                </th>
                <th className="px-4 text-left" style={{ color: 'var(--text-tertiary)' }}>
                  <div className="flex items-center gap-1.5">
                    <Tag style={{ width: '13px', height: '13px' }} />
                    <span className="text-xs font-semibold">{getColumnById('type')?.label || 'Type'}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {projectsData.map((project, index) => {
                const statusStyle = getStatusStyle(project.status);
                return (
                  <tr
                    key={project.id}
                    className="group transition-colors cursor-pointer"
                    style={{
                      borderBottom: index !== projectsData.length - 1
                        ? '1px solid rgba(255,255,255,0.03)'
                        : 'none'
                    }}
                    onClick={() => handleProjectClick(project)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* ID */}
                    <td
                      className="px-4 py-3"
                      style={{ color: '#6B7280', fontSize: '13px', fontWeight: '500', verticalAlign: 'top' }}
                    >
                      {project.id}
                    </td>

                    {/* Project Name */}
                    <td
                      className="px-4 py-3"
                      style={{ verticalAlign: 'top' }}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                          e.stopPropagation();
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Folder
                          style={{
                            width: '16px',
                            height: '16px',
                            color: 'var(--accent-primary)',
                            fill: 'var(--accent-primary)',
                            opacity: 0.8,
                            flexShrink: 0,
                          }}
                        />
                        <EditableProjectCell
                          field="name"
                          value={project.name}
                          onChange={(newName) => handleUpdateProject(project.id, 'name', newName)}
                        />
                      </div>
                    </td>

                    {/* Client */}
                    <td
                      className="px-4 py-3"
                      style={{ verticalAlign: 'top' }}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                          e.stopPropagation();
                        }
                      }}
                    >
                      <EditableProjectCell
                        field="client"
                        value={project.client}
                        onChange={(newClient) => handleUpdateProject(project.id, 'client', newClient)}
                      />
                    </td>

                    {/* Date Start */}
                    <td
                      className="px-4 py-3"
                      style={{ color: '#6B7280', fontSize: '13px', verticalAlign: 'top' }}
                      data-column-type="date"
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('button')) {
                          e.stopPropagation();
                        }
                      }}
                    >
                      <EditableProjectCell
                        field="dateStart"
                        value={project.dateStart}
                        onChange={(newDate) => handleUpdateProject(project.id, 'dateStart', newDate)}
                        rowData={project}
                      />
                    </td>

                    {/* Date End */}
                    <td
                      className="px-4 py-3"
                      style={{ color: '#6B7280', fontSize: '13px', verticalAlign: 'top' }}
                      data-column-type="date"
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('button')) {
                          e.stopPropagation();
                        }
                      }}
                    >
                      <EditableProjectCell
                        field="dateEnd"
                        value={project.dateEnd}
                        onChange={(newDate) => handleUpdateProject(project.id, 'dateEnd', newDate)}
                        rowData={project}
                      />
                    </td>

                    {/* Progress (holat) */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex-1 h-1.5 rounded-full overflow-hidden"
                          style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', minWidth: '60px' }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${project.holat}%`, backgroundColor: '#3B82F6' }}
                          />
                        </div>
                        <span
                          className="text-xs font-medium tabular-nums"
                          style={{ color: '#9CA3AF', minWidth: '38px', textAlign: 'right' }}
                        >
                          {project.holat}%
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td
                      className="px-4 py-3"
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('button')) {
                          e.stopPropagation();
                        }
                      }}
                    >
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: statusStyle.bg,
                          border: `1px solid ${statusStyle.border}`
                        }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: statusStyle.dot }}
                        />
                        <span
                          className="text-xs font-medium whitespace-nowrap"
                          style={{ color: statusStyle.text }}
                        >
                          {project.status}
                        </span>
                      </div>
                    </td>

                    {/* Size */}
                    <td className="px-4 py-3" data-column-type="meta" onClick={(e) => e.stopPropagation()}>
                      <ProjectScopePopover
                        size={project.size}
                        kvadratura={project.kvadratura}
                        type={project.type}
                        description={project.description}
                        complexity={project.complexity}
                        duration={project.duration}
                      >
                        <button
                          className="text-sm transition-all rounded px-2 py-0.5 -mx-2 cursor-pointer"
                          style={{ color: 'var(--text-primary)', fontWeight: 500 }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                            e.currentTarget.style.textDecoration = 'underline';
                            e.currentTarget.style.textDecorationStyle = 'dotted';
                            e.currentTarget.style.textUnderlineOffset = '2px';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.textDecoration = 'none';
                          }}
                        >
                          {project.size}
                        </button>
                      </ProjectScopePopover>
                    </td>

                    {/* Type */}
                    <td
                      className="px-4 py-3"
                      data-column-type="meta"
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('button')) {
                          e.stopPropagation();
                        }
                      }}
                    >
                      <EditableProjectCell
                        field="type"
                        value={project.type}
                        onChange={(newType) => handleUpdateProject(project.id, 'type', newType)}
                      />
                    </td>
                  </tr>
                );
              })}

              {/* Add Task Row */}
              {/* <AddTaskRow
                onAddTask={handleAddTask}
                colSpan={9}
                mode="projects"
              /> */}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {projectsData.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <Folder
              style={{ width: '48px', height: '48px', color: '#6B7280', opacity: 0.3, marginBottom: '12px' }}
            />
            <p className="text-sm font-medium" style={{ color: '#9CA3AF' }}>No projects found</p>
            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Add a new project to get started</p>
          </div>
        )}
      </div>

      {/* Project Detail Panel */}
      <ProjectTaskDetailOverlay
        project={selectedProject}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
    </>
  );
}
