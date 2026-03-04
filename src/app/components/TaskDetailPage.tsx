import { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Share2,
  Ellipsis,
  Calendar,
  Clock,
  Flag,
  Users,
  Tag,
  Plus,
  Paperclip,
  Upload,
  CheckCheck,
  ChevronDown,
  X,
  MessageCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Avatar, AvatarFallback } from './ui/avatar';
import { TaskTypeSelector } from './TaskTypeSelector';
import { EditableCustomField } from './EditableCustomField';
import { EditableSubtask } from './EditableSubtask';
import { EditableChecklistItem } from './EditableChecklistItem';

interface Task {
  id: string;
  name: string;
  client: string;
  dateStart: string;
  dateEnd: string;
  status: string;
  progress: number;
  size: string;
  type: string;
}

interface TaskDetailPageProps {
  task: Task;
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

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  status: string;
}

export function TaskDetailPage({ task, onBack }: TaskDetailPageProps) {
  const [taskType, setTaskType] = useState('task');
  const [selectedStatus, setSelectedStatus] = useState(task.status);
  const [selectedPriority, setSelectedPriority] = useState('Medium');
  const [startDate, setStartDate] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date>();
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { id: '1', title: 'Initial planning phase', completed: false, status: 'In Progress' },
    { id: '2', title: 'Requirements gathering', completed: true, status: 'End' },
    { id: '3', title: 'Design mockups', completed: false, status: 'Start' },
  ]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const currentStatus = statusOptions.find(s => s.value === selectedStatus) || statusOptions[0];
  const currentPriority = priorityOptions.find(p => p.value === selectedPriority) || priorityOptions[1];

  const handleAddSubtask = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSubtaskTitle.trim()) {
      setSubtasks([
        ...subtasks,
        {
          id: Date.now().toString(),
          title: newSubtaskTitle,
          completed: false,
          status: 'Start',
        },
      ]);
      setNewSubtaskTitle('');
    }
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map(st =>
        st.id === id ? { ...st, completed: !st.completed } : st
      )
    );
  };

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
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Projects</span>
            </button>

            {/* Header Section */}
            <div className="rounded-xl shadow-sm border p-8 mb-6" style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <TaskTypeSelector
                      value={taskType}
                      onChange={setTaskType}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>ID: {task.id}</span>
                  </div>
                  <input
                    type="text"
                    defaultValue={task.name}
                    className="w-full text-3xl border-none outline-none focus:ring-0 px-3 -mx-3 rounded mb-2"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 ml-6">
                  <button className="p-2.5 rounded-lg transition-colors"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}>
                    <Sparkles className="w-5 h-5 text-purple-500" />
                  </button>
                  <button className="p-2.5 rounded-lg transition-colors"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}>
                    <Share2 className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                  <button className="p-2.5 rounded-lg transition-colors"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}>
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
                          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                            selectedStatus === status.value ? 'bg-gray-50' : ''
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                          }}
                          onMouseLeave={(e) => {
                            if (selectedStatus !== status.value) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
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
                          className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                            selectedPriority === priority.value ? 'bg-gray-50' : ''
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                          }}
                          onMouseLeave={(e) => {
                            if (selectedPriority !== priority.value) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
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
                        {startDate ? format(startDate, 'MMM dd') : task.dateStart}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" style={{
                      backgroundColor: 'var(--surface-primary)'
                    }} align="start">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
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
                        {dueDate ? format(dueDate, 'MMM dd') : task.dateEnd}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" style={{
                      backgroundColor: 'var(--surface-primary)'
                    }} align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Additional Info Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                {/* Assignees */}
                <div>
                  <label className="text-xs mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    <Users className="w-3.5 h-3.5" />
                    Assignees
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="bg-blue-500 text-white text-xs">JD</AvatarFallback>
                    </Avatar>
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="bg-green-500 text-white text-xs">SM</AvatarFallback>
                    </Avatar>
                    <button className="w-7 h-7 rounded-full border-2 border-dashed flex items-center justify-center transition-colors" style={{
                      borderColor: 'var(--border-primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-hover)';
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}>
                      <Plus className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                    </button>
                  </div>
                </div>

                {/* Time Estimate */}
                <div>
                  <label className="text-xs mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    <Clock className="w-3.5 h-3.5" />
                    Time Estimate
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 40h"
                    className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 w-full"
                    style={{
                      borderColor: 'var(--border-primary)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    <Tag className="w-3.5 h-3.5" />
                    Tags
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full text-xs status-progress">
                      {task.type}
                    </span>
                    <button className="px-2.5 py-1 border border-dashed rounded-full text-xs transition-colors" style={{
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-tertiary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-hover)';
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}>
                      <Plus className="w-3 h-3 inline" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Block */}
            <div className="rounded-xl shadow-sm border p-6 mb-6" style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}>
              <div className="flex items-center justify-between mb-3">
                <h3 style={{ color: 'var(--text-primary)' }}>Description</h3>
                <button className="text-sm flex items-center gap-1.5 text-purple-600 hover:text-purple-700">
                  <Sparkles className="w-4 h-4" />
                  Write with AI
                </button>
              </div>
              <textarea
                placeholder="Add a description..."
                rows={5}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                style={{
                  borderColor: 'var(--border-primary)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Custom Fields Block */}
            <div className="rounded-xl shadow-sm border p-6 mb-6" style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ color: 'var(--text-primary)' }}>Custom Fields</h3>
                <button className="text-sm flex items-center gap-1" style={{ color: 'var(--accent-primary)' }}>
                  <Plus className="w-4 h-4" />
                  Add field
                </button>
              </div>
              <div className="space-y-3">
                <EditableCustomField
                  fieldId="size"
                  label="Project Size"
                  value={task.size}
                  onValueChange={(newValue) => {
                    console.log('Project Size changed to:', newValue);
                  }}
                />
                <EditableCustomField
                  fieldId="client"
                  label="Client"
                  value={task.client}
                  onValueChange={(newValue) => {
                    console.log('Client changed to:', newValue);
                  }}
                />
              </div>
            </div>

            {/* Subtasks Block */}
            <div className="rounded-xl shadow-sm border p-6 mb-6" style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <CheckCheck className="w-5 h-5" />
                  Subtasks
                  <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    ({subtasks.filter(st => st.completed).length}/{subtasks.length})
                  </span>
                </h3>
              </div>
              <div className="space-y-2">
                {subtasks.map((subtask) => (
                  <EditableSubtask
                    key={subtask.id}
                    id={subtask.id}
                    title={subtask.title}
                    completed={subtask.completed}
                    status={subtask.status}
                    onToggleComplete={() => toggleSubtask(subtask.id)}
                    onTitleChange={(newTitle) => {
                      setSubtasks(
                        subtasks.map(st =>
                          st.id === subtask.id ? { ...st, title: newTitle } : st
                        )
                      );
                    }}
                    onStatusChange={(newStatus) => {
                      setSubtasks(
                        subtasks.map(st =>
                          st.id === subtask.id ? { ...st, status: newStatus } : st
                        )
                      );
                    }}
                    onDelete={() => {
                      setSubtasks(subtasks.filter(st => st.id !== subtask.id));
                    }}
                    statusOptions={statusOptions}
                  />
                ))}
                
                {/* Add New Subtask Input */}
                <div 
                  className="flex items-center gap-3 p-3 border-2 border-dashed rounded-lg transition-colors"
                  style={{
                    borderColor: 'var(--border-secondary)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                  }}
                >
                  <Plus className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    placeholder="Add new subtask..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={handleAddSubtask}
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                    style={{
                      color: 'var(--text-primary)',
                      caretColor: 'var(--accent-primary)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Checklist Block */}
            <div className="rounded-xl shadow-sm border p-6 mb-6" style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ color: 'var(--text-primary)' }}>Checklist</h3>
                <button className="text-sm flex items-center gap-1 transition-colors" style={{ color: 'var(--accent-primary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}>
                  <Plus className="w-4 h-4" />
                  Add item
                </button>
              </div>
              <div className="space-y-3">
                <EditableChecklistItem
                  id="1"
                  text="Design mockups approved"
                  completed={true}
                  onToggleComplete={() => {
                    console.log('Design mockups approved toggled');
                  }}
                  onTextChange={(newText) => {
                    console.log('Text changed to:', newText);
                  }}
                  onDelete={() => {
                    console.log('Deleted checklist item');
                  }}
                />
                <EditableChecklistItem
                  id="2"
                  text="Development environment setup"
                  completed={false}
                  onToggleComplete={() => {
                    console.log('Development environment setup toggled');
                  }}
                  onTextChange={(newText) => {
                    console.log('Text changed to:', newText);
                  }}
                  onDelete={() => {
                    console.log('Deleted checklist item');
                  }}
                />
                <EditableChecklistItem
                  id="3"
                  text="Testing and QA review"
                  completed={false}
                  onToggleComplete={() => {
                    console.log('Testing and QA review toggled');
                  }}
                  onTextChange={(newText) => {
                    console.log('Text changed to:', newText);
                  }}
                  onDelete={() => {
                    console.log('Deleted checklist item');
                  }}
                />
              </div>
            </div>

            {/* Attachments Block */}
            <div className="rounded-xl shadow-sm border p-6 mb-6" style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Paperclip className="w-5 h-5" />
                  Attachments
                </h3>
              </div>
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer"
                style={{
                  borderColor: 'var(--border-secondary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-secondary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Drop files here or click to upload</p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>PDF, Images, Documents up to 10MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Activity Column */}
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}>
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}