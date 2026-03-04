import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useState } from 'react';
import { X, Folder, Building2, Calendar, CalendarCheck, Workflow, Layers, Tag } from 'lucide-react';
import { TaskDetailPage } from './TaskDetailPage';
import { AddTaskRow } from './AddTaskRow';
import { ColumnEditorModal, ColumnConfig } from './ColumnEditorModal';
import { useColumnConfig } from '../hooks/useColumnConfig';
import { EditableProjectCell } from './EditableProjectCell';
import { ProjectScopePopover } from './ProjectScopePopover';
import { ProjectTaskDetailOverlay } from './ProjectTaskDetailOverlay';
import { ProjectsToolbar } from './ProjectsToolbar';

interface Project {
  id: string;
  name: string;
  client: string;
  dateStart: string;
  dateEnd: string;
  holat: number;
  status: string;
  size: string;
  kvadratura: string;
  type: string;
  progress: number; // Added for the detail panel
  description?: string;
  complexity?: string;
  duration?: string;
}

const projects: Project[] = [
  {
    id: 'PRJ-001',
    name: 'Bobur residence interior',
    client: 'Bobur Construction',
    dateStart: '12 Jan 2024',
    dateEnd: '15 Mar 2024',
    holat: 45,
    status: 'In Progress',
    size: 'Large',
    kvadratura: '1250 m²',
    type: 'Interior',
    progress: 45,
    description: 'Comprehensive interior design project covering full residential space with custom furniture and lighting solutions.',
    complexity: 'High',
    duration: '8-10 weeks'
  },
  {
    id: 'PRJ-002',
    name: 'Bobur residence interior',
    client: 'Elite Developers',
    dateStart: '15 Jan 2024',
    dateEnd: '20 Mar 2024',
    holat: 80,
    status: 'Burning',
    size: 'Medium',
    kvadratura: '850 m²',
    type: 'Residential',
    progress: 80,
    description: 'Modern residential development with emphasis on sustainable materials and energy-efficient solutions.',
    complexity: 'Medium',
    duration: '6-8 weeks'
  },
  {
    id: 'PRJ-003',
    name: 'Bobur residence interior',
    client: 'Modern Spaces LLC',
    dateStart: '20 Jan 2024',
    dateEnd: '25 Mar 2024',
    holat: 75,
    status: 'In Progress',
    size: 'Large',
    kvadratura: '1500 m²',
    type: 'Commercial',
    progress: 75,
    description: 'Large-scale commercial space transformation including office layouts, collaboration zones, and reception areas.',
    complexity: 'High',
    duration: '10-12 weeks'
  },
  {
    id: 'PRJ-004',
    name: 'Bobur residence interior',
    client: 'Urban Design Co',
    dateStart: '25 Jan 2024',
    dateEnd: '30 Mar 2024',
    holat: 50,
    status: 'Start',
    size: 'Small',
    kvadratura: '450 m²',
    type: 'Interior',
    progress: 50,
    description: 'Boutique interior redesign focused on maximizing space efficiency and aesthetic appeal.',
    complexity: 'Low',
    duration: '4-6 weeks'
  },
  {
    id: 'PRJ-005',
    name: 'Bobur residence interior',
    client: 'Prestige Homes',
    dateStart: '01 Feb 2024',
    dateEnd: '05 Apr 2024',
    holat: 88,
    status: 'End',
    size: 'Large',
    kvadratura: '1800 m²',
    type: 'Residential',
    progress: 88,
    description: 'Luxury residential project featuring high-end finishes, smart home integration, and custom millwork.',
    complexity: 'High',
    duration: '12-14 weeks'
  },
  {
    id: 'PRJ-006',
    name: 'Bobur residence interior',
    client: 'Skyline Architects',
    dateStart: '05 Feb 2024',
    dateEnd: '10 Apr 2024',
    holat: 60,
    status: 'In Progress',
    size: 'Medium',
    kvadratura: '950 m²',
    type: 'Commercial',
    progress: 60,
    description: 'Commercial office renovation with flexible workspace design and modern amenities.',
    complexity: 'Medium',
    duration: '7-9 weeks'
  },
  {
    id: 'PRJ-007',
    name: 'Bobur residence interior',
    client: 'Heritage Builders',
    dateStart: '10 Feb 2024',
    dateEnd: '15 Apr 2024',
    holat: 62,
    status: 'Late',
    size: 'Medium',
    kvadratura: '750 m²',
    type: 'Interior',
    progress: 62,
    description: 'Heritage building interior restoration balancing historical character with contemporary functionality.',
    complexity: 'Medium',
    duration: '8-10 weeks'
  },
  {
    id: 'PRJ-008',
    name: 'Bobur residence interior',
    client: 'Zenith Properties',
    dateStart: '15 Feb 2024',
    dateEnd: '20 Apr 2024',
    holat: 70,
    status: 'In Progress',
    size: 'Large',
    kvadratura: '1650 m²',
    type: 'Residential',
    progress: 70,
    description: 'Premium residential development with landscaping integration and outdoor living spaces.',
    complexity: 'High',
    duration: '10-12 weeks'
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'In Progress':
      return 'status-progress';
    case 'Start':
      return 'status-start';
    case 'Burning':
      return 'status-burning';
    case 'End':
      return 'status-end';
    case 'Late':
      return 'status-late';
    default:
      return 'status-progress';
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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'detail'>('table');
  const [detailTask, setDetailTask] = useState<Project | null>(null);
  const [isColumnEditorOpen, setIsColumnEditorOpen] = useState(false);
  const [projectsData, setProjectsData] = useState<Project[]>(projects);

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
    // Generate new project ID
    const newId = `PRJ-${String(projectsData.length + 1).padStart(3, '0')}`;
    
    // Create new project from task data
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
    
    // Add to projects list
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

      <div className="rounded-xl shadow-sm border overflow-hidden" style={{
        backgroundColor: 'var(--surface-primary)',
        borderColor: 'var(--border-primary)'
      }}>
        <ProjectsToolbar />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
                <th 
                  className="px-6 py-4 text-left text-xs uppercase tracking-wider font-medium"
                  style={{ 
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--surface-secondary)'
                  }}
                >
                  {getColumnById('id')?.label || 'ID'}
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs uppercase tracking-wider font-medium"
                  style={{ 
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--surface-secondary)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Folder 
                      className="w-3.5 h-3.5" 
                      strokeWidth={1.5}
                      style={{ opacity: 0.5 }}
                    />
                    {getColumnById('name')?.label || 'Project Name'}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs uppercase tracking-wider font-medium"
                  style={{ 
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--surface-secondary)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Building2 
                      className="w-3.5 h-3.5" 
                      strokeWidth={1.5}
                      style={{ opacity: 0.5 }}
                    />
                    {getColumnById('client')?.label || 'Client'}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs uppercase tracking-wider font-medium"
                  style={{ 
                    color: 'var(--text-secondary)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar 
                      className="w-3.5 h-3.5" 
                      strokeWidth={1.5}
                      style={{ opacity: 0.5 }}
                    />
                    {getColumnById('dateStart')?.label || 'Date Start'}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs uppercase tracking-wider font-medium"
                  style={{ 
                    color: 'var(--text-secondary)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <CalendarCheck 
                      className="w-3.5 h-3.5" 
                      strokeWidth={1.5}
                      style={{ opacity: 0.5 }}
                    />
                    {getColumnById('dateEnd')?.label || 'Date End'}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs uppercase tracking-wider font-medium"
                  style={{ 
                    color: 'var(--text-secondary)'
                  }}
                >
                  {getColumnById('holat')?.label || 'Holat'}
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs uppercase tracking-wider font-medium"
                  style={{ 
                    color: 'var(--text-secondary)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Workflow 
                      className="w-3.5 h-3.5" 
                      strokeWidth={1.5}
                      style={{ opacity: 0.5 }}
                    />
                    {getColumnById('status')?.label || 'Status'}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs uppercase tracking-wider font-medium"
                  style={{ 
                    color: 'var(--text-secondary)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Layers 
                      className="w-3.5 h-3.5" 
                      strokeWidth={1.5}
                      style={{ opacity: 0.5 }}
                    />
                    {getColumnById('size')?.label || 'Project Size'}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs uppercase tracking-wider font-medium"
                  style={{ 
                    color: 'var(--text-secondary)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Tag 
                      className="w-3.5 h-3.5" 
                      strokeWidth={1.5}
                      style={{ opacity: 0.5 }}
                    />
                    {getColumnById('type')?.label || 'Project Type'}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {projectsData.map((project) => (
                <tr 
                  key={project.id} 
                  className="border-b transition-colors cursor-pointer" 
                  style={{ borderColor: 'var(--border-secondary)' }}
                  onClick={() => handleProjectClick(project)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>{project.id}</td>
                  <td 
                    className="px-6 py-4"
                    onClick={(e) => {
                      // Check if clicking on the editable cell - if in edit mode, don't open detail
                      const target = e.target as HTMLElement;
                      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                        e.stopPropagation();
                      }
                    }}
                  >
                    <EditableProjectCell
                      field="name"
                      value={project.name}
                      onChange={(newName) => handleUpdateProject(project.id, 'name', newName)}
                    />
                  </td>
                  <td 
                    className="px-6 py-4"
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
                  <td 
                    className="px-6 py-4" 
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
                  <td 
                    className="px-6 py-4" 
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
                  <td 
                    className="px-6 py-4" 
                    style={{ backgroundColor: 'var(--status-start-bg)' }}
                  >
                    <div className="flex items-center gap-3">
                      <Progress 
                        value={project.holat} 
                        className="flex-1 h-2 table-progress-bar"
                        style={{
                          backgroundColor: 'var(--surface-tertiary)'
                        }}
                      />
                      <span className="text-sm min-w-[3ch]" style={{ color: 'var(--text-secondary)' }}>{project.holat}%</span>
                    </div>
                  </td>
                  <td 
                    className="px-6 py-4"
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('button')) {
                        e.stopPropagation();
                      }
                    }}
                  >
                    <EditableProjectCell
                      field="status"
                      value={project.status}
                      onChange={(newStatus) => handleUpdateProject(project.id, 'status', newStatus)}
                    />
                  </td>
                  <td className="px-6 py-4" data-column-type="meta" onClick={(e) => e.stopPropagation()}>
                    <ProjectScopePopover
                      size={project.size}
                      kvadratura={project.kvadratura}
                      type={project.type}
                      description={project.description}
                      complexity={project.complexity}
                      duration={project.duration}
                    >
                      <button
                        className="text-sm transition-all rounded px-2 py-1 -mx-2 -my-1 cursor-pointer"
                        style={{ 
                          color: 'var(--text-primary)',
                          fontWeight: 500
                        }}
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
                  <td 
                    className="px-6 py-4" 
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
              ))}
              
              {/* Add Task Row */}
              <AddTaskRow 
                onAddTask={handleAddTask}
                colSpan={9}
                mode="projects"
              />
            </tbody>
          </table>
        </div>
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