import {
  ArrowLeft,
  Share2,
  Ellipsis,
  Calendar,
  Clock,
  Flag,
  Users,
  Tag,
  ChevronDown,
} from 'lucide-react';
import { format, parseISO, differenceInSeconds } from 'date-fns';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Avatar, AvatarFallback } from './ui/avatar';
import { TaskTypeSelector } from './TaskTypeSelector';
import { useState } from 'react';
import { useTaskTimeEntries } from '@/hooks/api/useTimeTracking';

interface Work {
  id: string;
  code?: string;
  title: string;
  description?: string;
  project?: string;
  projectId?: string;
  assignee: {
    id?: string;
    name: string;
    initials: string;
    color: string;
  };
  participants: Array<{
    id?: string;
    name: string;
    initials: string;
    color: string;
  }>;
  teamId?: string;
  teamName?: string;
  status: string;
  statusKey?: string;
  priority: string;
  priorityKey?: string;
  dateStart: string;
  dateEnd: string;
  progress: number;
  workType: string;
  volume?: string;
  unit?: string;
  acceptance: string;
  dependencies?: {
    blockedBy: string[];
    blocks: string[];
  };
}

interface TaskDetailPageProps {
  task: Work;
  onBack: () => void;
}

const statusOptions = [
  { value: 'In Progress', className: 'status-progress' },
  { value: 'Start', className: 'status-start' },
  { value: 'Burning', className: 'status-burning' },
  { value: 'End', className: 'status-end' },
  { value: 'Late', className: 'status-late' },
];

const priorityOptions = [
  { value: 'Low', className: 'priority-low', icon: '○' },
  { value: 'Medium', className: 'priority-medium', icon: '◐' },
  { value: 'High', className: 'priority-high', icon: '●' },
];

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function TaskDetailPage({ task, onBack }: TaskDetailPageProps) {
  const [taskType, setTaskType] = useState(task.workType ?? 'task');
  const [selectedStatus, setSelectedStatus] = useState(task.status);
  const [selectedPriority, setSelectedPriority] = useState(task.priority ?? 'Medium');
  const [startDate, setStartDate] = useState<Date | undefined>(
    task.dateStart ? parseISO(task.dateStart) : undefined
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dateEnd ? parseISO(task.dateEnd) : undefined
  );

  const { data: timeEntries = [] } = useTaskTimeEntries(task.id);

  const currentStatus = statusOptions.find(s => s.value === selectedStatus) || statusOptions[0];
  const currentPriority = priorityOptions.find(p => p.value === selectedPriority) || priorityOptions[1];

  const totalTrackedSeconds = timeEntries.reduce((sum, entry) => {
    if (entry.durationSeconds) return sum + entry.durationSeconds;
    if (entry.startTime && entry.endTime) {
      return sum + differenceInSeconds(parseISO(entry.endTime), parseISO(entry.startTime));
    }
    return sum;
  }, 0);

  const allParticipants = [task.assignee, ...task.participants].filter(
    (p, i, arr) => arr.findIndex(x => x.name === p.name) === i
  );

  return (
    <div
      className="h-full overflow-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="h-full flex">
        {/* Main Content Column */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="flex items-center gap-2 mb-6 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tasks</span>
            </button>

            {/* Header Section */}
            <div className="rounded-xl shadow-sm border p-8 mb-6" style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <TaskTypeSelector value={taskType} onChange={setTaskType} />
                    {task.code && (
                      <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        {task.code}
                      </span>
                    )}
                    {task.project && (
                      <span className="text-sm px-2 py-0.5 rounded" style={{
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--surface-secondary)'
                      }}>
                        {task.project}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    defaultValue={task.title}
                    className="w-full text-3xl border-none outline-none focus:ring-0 px-3 -mx-3 rounded mb-2"
                    style={{ backgroundColor: 'transparent', color: 'var(--text-primary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  />
                </div>
                <div className="flex items-center gap-2 ml-6">
                  <button className="p-2.5 rounded-lg transition-colors"
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                    <Share2 className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                  <button className="p-2.5 rounded-lg transition-colors"
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                    <Ellipsis className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Status */}
                <div>
                  <label className="text-xs mb-2 block" style={{ color: 'var(--text-tertiary)' }}>Status</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={`${currentStatus.className} px-3 py-1.5 rounded-full text-sm inline-flex items-center gap-2 hover:opacity-80 transition-opacity border`}>
                        <span>{selectedStatus}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2 border" style={{
                      backgroundColor: 'var(--surface-primary)',
                      borderColor: 'var(--border-primary)'
                    }} align="start">
                      {statusOptions.map((status) => (
                        <button
                          key={status.value}
                          onClick={() => setSelectedStatus(status.value)}
                          className="w-full text-left px-3 py-2 rounded-md transition-colors"
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <span className={`inline-block px-3 py-1 rounded-full text-sm border ${status.className}`}>
                            {status.value}
                          </span>
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-xs mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    <Flag className="w-3.5 h-3.5" />
                    Priority
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={`${currentPriority.className} px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-2 hover:opacity-80 transition-opacity border`}>
                        <span>{currentPriority.icon}</span>
                        <span>{selectedPriority}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-2 border" style={{
                      backgroundColor: 'var(--surface-primary)',
                      borderColor: 'var(--border-primary)'
                    }} align="start">
                      {priorityOptions.map((priority) => (
                        <button
                          key={priority.value}
                          onClick={() => setSelectedPriority(priority.value)}
                          className="w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2"
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <span>{priority.icon}</span>
                          <span className="text-sm">{priority.value}</span>
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Start Date */}
                <div>
                  <label className="text-xs mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    <Calendar className="w-3.5 h-3.5" />
                    Start Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="px-3 py-1.5 border rounded-lg text-sm transition-colors" style={{
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}>
                        {startDate ? format(startDate, 'MMM dd, yyyy') : '—'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" style={{ backgroundColor: 'var(--surface-primary)' }} align="start">
                      <CalendarComponent mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Due Date */}
                <div>
                  <label className="text-xs mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    <Calendar className="w-3.5 h-3.5" />
                    Due Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="px-3 py-1.5 border rounded-lg text-sm transition-colors" style={{
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}>
                        {dueDate ? format(dueDate, 'MMM dd, yyyy') : '—'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" style={{ backgroundColor: 'var(--surface-primary)' }} align="start">
                      <CalendarComponent mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Additional Info Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                {/* Assignees */}
                <div>
                  <label className="text-xs mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    <Users className="w-3.5 h-3.5" />
                    Assignees
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {allParticipants.map((p) => (
                      <Avatar key={p.name} className="w-7 h-7" title={p.name}>
                        <AvatarFallback style={{ backgroundColor: p.color }} className="text-white text-xs">
                          {p.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>

                {/* Work Type */}
                <div>
                  <label className="text-xs mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    <Tag className="w-3.5 h-3.5" />
                    Work Type
                  </label>
                  <span className="px-2.5 py-1 rounded-full text-xs status-progress">
                    {task.workType}
                  </span>
                </div>

                {/* Volume */}
                {task.volume && (
                  <div>
                    <label className="text-xs mb-2 block" style={{ color: 'var(--text-tertiary)' }}>Volume</label>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {task.volume}{task.unit ? ` ${task.unit}` : ''}
                    </span>
                  </div>
                )}

                {/* Team */}
                <div>
                  <label className="text-xs mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    <Users className="w-3.5 h-3.5" />
                    Team
                  </label>
                  <span className="text-sm" style={{ color: task.teamName ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                    {task.teamName || '—'}
                  </span>
                </div>

                {/* Acceptance */}
                <div>
                  <label className="text-xs mb-2 block" style={{ color: 'var(--text-tertiary)' }}>Acceptance</label>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {task.acceptance || '—'}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Progress</label>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{task.progress}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${task.progress}%`, backgroundColor: 'var(--accent-primary)' }}
                  />
                </div>
              </div>
            </div>

            {/* Description Block */}
            <div className="rounded-xl shadow-sm border p-6 mb-6" style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}>
              <h3 className="mb-3" style={{ color: 'var(--text-primary)' }}>Description</h3>
              <textarea
                placeholder="Add a description..."
                rows={5}
                defaultValue={task.description ?? ''}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                style={{
                  borderColor: 'var(--border-primary)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Time Entries Block */}
            <div className="rounded-xl shadow-sm border p-6 mb-6" style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Clock className="w-5 h-5" />
                  Time Tracked
                </h3>
                {totalTrackedSeconds > 0 && (
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Total: {formatDuration(totalTrackedSeconds)}
                  </span>
                )}
              </div>

              {timeEntries.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text-tertiary)' }}>
                  No time entries recorded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {timeEntries.map((entry) => {
                    const duration = entry.durationSeconds
                      ? entry.durationSeconds
                      : entry.endTime
                        ? differenceInSeconds(parseISO(entry.endTime), parseISO(entry.startTime))
                        : null;

                    return (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between px-4 py-3 rounded-lg"
                        style={{ backgroundColor: 'var(--surface-secondary)' }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className="text-xs" style={{
                              backgroundColor: 'var(--accent-primary)',
                              color: 'white'
                            }}>
                              {entry.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {entry.userName}
                            </p>
                            {entry.description && (
                              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                {entry.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {duration !== null ? formatDuration(duration) : 'Running…'}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {format(parseISO(entry.startTime), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Activity Column — commented out for now */}
        {/*
        <div className="w-80 border-l overflow-y-auto" style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)'
        }}>
          <div className="p-6">
            <h3 className="mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <MessageCircle className="w-5 h-5" />
              Activity
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-500 text-white text-xs">JD</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--surface-hover)' }}>
                    <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>John Doe</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Updated status to In Progress</p>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>2 hours ago</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-green-500 text-white text-xs">SM</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--surface-hover)' }}>
                    <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Sarah Miller</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Added 2 subtasks</p>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>5 hours ago</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-purple-500 text-white text-xs">AK</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--surface-hover)' }}>
                    <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Alex Kim</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Uploaded 3 files</p>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Yesterday</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4" style={{ borderColor: 'var(--border-secondary)' }}>
              <h4 className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Comments</h4>
              <div className="flex gap-3 mb-4">
                <Avatar className="w-8 h-8">
                  <AvatarFallback style={{ backgroundColor: 'var(--surface-tertiary)', color: 'var(--text-secondary)' }} className="text-xs">You</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <textarea
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none text-sm"
                    style={{
                      borderColor: 'var(--border-primary)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button className="mt-2 px-3 py-1.5 rounded-lg transition-colors text-sm" style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}>
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        */}
      </div>
    </div>
  );
}
