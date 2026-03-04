import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
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
  MessageCircle,
  ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Avatar, AvatarFallback } from './ui/avatar';

interface Project {
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

interface ProjectDetailPanelProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusOptions = [
  { value: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'Start', color: 'bg-green-100 text-green-700' },
  { value: 'Burning', color: 'bg-orange-100 text-orange-700' },
  { value: 'End', color: 'bg-purple-100 text-purple-700' },
  { value: 'Late', color: 'bg-red-100 text-red-700' },
];

const priorityOptions = [
  { value: 'Low', color: 'bg-gray-100 text-gray-700', icon: '○' },
  { value: 'Medium', color: 'bg-yellow-100 text-yellow-700', icon: '◐' },
  { value: 'High', color: 'bg-red-100 text-red-700', icon: '●' },
];

export function ProjectDetailPanel({ project, isOpen, onClose }: ProjectDetailPanelProps) {
  const [selectedStatus, setSelectedStatus] = useState('In Progress');
  const [selectedPriority, setSelectedPriority] = useState('Medium');
  const [startDate, setStartDate] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date>();
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');

  if (!project) return null;

  const currentStatus = statusOptions.find(s => s.value === selectedStatus) || statusOptions[0];
  const currentPriority = priorityOptions.find(p => p.value === selectedPriority) || priorityOptions[1];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[700px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    defaultValue={project.name}
                    className="text-2xl text-gray-900 border-none outline-none focus:ring-0 w-full bg-transparent hover:bg-gray-50 px-2 -mx-2 rounded"
                  />
                  <p className="text-sm text-gray-500 mt-1 px-2">ID: {project.id}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Ellipsis className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Status */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Status</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={`${currentStatus.color} px-4 py-2 rounded-full inline-flex items-center gap-2 hover:opacity-80 transition-opacity`}>
                        <span>{selectedStatus}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2 bg-white" align="start">
                      {statusOptions.map((status) => (
                        <button
                          key={status.value}
                          onClick={() => setSelectedStatus(status.value)}
                          className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                            selectedStatus === status.value ? 'bg-gray-50' : ''
                          }`}
                        >
                          <span className={`inline-block px-3 py-1 rounded-full text-sm ${status.color}`}>
                            {status.value}
                          </span>
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Start Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full px-4 py-2 border border-gray-200 rounded-lg text-left hover:border-gray-300 transition-colors">
                          {startDate ? format(startDate, 'MMM dd, yyyy') : project.dateStart}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full px-4 py-2 border border-gray-200 rounded-lg text-left hover:border-gray-300 transition-colors">
                          {dueDate ? format(dueDate, 'MMM dd, yyyy') : project.dateEnd}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white" align="start">
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

                {/* Assignees */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Assignees
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-500 text-white text-xs">JD</AvatarFallback>
                    </Avatar>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-green-500 text-white text-xs">SM</AvatarFallback>
                    </Avatar>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-purple-500 text-white text-xs">AK</AvatarFallback>
                    </Avatar>
                    <button className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors">
                      <Plus className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    Priority
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={`${currentPriority.color} px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:opacity-80 transition-opacity`}>
                        <span>{currentPriority.icon}</span>
                        <span>{selectedPriority}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2 bg-white" align="start">
                      {priorityOptions.map((priority) => (
                        <button
                          key={priority.value}
                          onClick={() => setSelectedPriority(priority.value)}
                          className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                            selectedPriority === priority.value ? 'bg-gray-50' : ''
                          }`}
                        >
                          <span>{priority.icon}</span>
                          <span>{priority.value}</span>
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Estimate */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time Estimate
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 40 hours"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {project.type}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {project.client}
                    </span>
                    <button className="px-3 py-1 border-2 border-dashed border-gray-300 rounded-full text-sm text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center gap-1">
                      <Plus className="w-3 h-3" />
                      Add tag
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-600">Description</label>
                    <button className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Write with AI
                    </button>
                  </div>
                  <textarea
                    placeholder="Add a description..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Custom Fields */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm text-gray-600">Custom Fields</label>
                    <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      <Plus className="w-4 h-4" />
                      Add field
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-32">Project Size:</span>
                      <span className="text-sm text-gray-900">{project.size}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-32">Client:</span>
                      <span className="text-sm text-gray-900">{project.client}</span>
                    </div>
                  </div>
                </div>

                {/* Subtasks */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm text-gray-600 flex items-center gap-2">
                      <CheckCheck className="w-4 h-4" />
                      Subtasks
                    </label>
                    <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      <Plus className="w-4 h-4" />
                      Add subtask
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300" onChange={() => {}} />
                      <span className="text-sm text-gray-700 flex-1">Initial planning phase</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" onChange={() => {}} />
                      <span className="text-sm text-gray-500 line-through flex-1">Requirements gathering</span>
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm text-gray-600">Checklist</label>
                    <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      <Plus className="w-4 h-4" />
                      Add item
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" onChange={() => {}} />
                      <span className="text-sm text-gray-500 line-through">Design mockups approved</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300" onChange={() => {}} />
                      <span className="text-sm text-gray-700">Development environment setup</span>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm text-gray-600 flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      Attachments
                    </label>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Drop files here or click to upload</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, Images, Documents</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Activity & Comments */}
                <div>
                  <div className="flex items-center gap-4 mb-4 border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('details')}
                      className={`pb-2 text-sm transition-colors ${
                        activeTab === 'details'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setActiveTab('activity')}
                      className={`pb-2 text-sm transition-colors ${
                        activeTab === 'activity'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Activity
                    </button>
                  </div>

                  {activeTab === 'activity' && (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-blue-500 text-white text-xs">JD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-900 mb-1">John Doe</p>
                            <p className="text-sm text-gray-600">Updated the project status to In Progress</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-green-500 text-white text-xs">SM</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-900 mb-1">Sarah Miller</p>
                            <p className="text-sm text-gray-600">Added 3 new attachments</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">You</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <textarea
                            placeholder="Add a comment..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          />
                          <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}