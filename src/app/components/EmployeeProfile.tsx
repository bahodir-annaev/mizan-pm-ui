import { useState } from 'react';
import { 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Clock,
  Award,
  TrendingUp,
  Target,
  CheckCircle2,
  Camera,
  Edit2,
  Save,
  X,
  FileText,
  Users,
  Activity
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';

export interface Employee {
  id: string;
  name: string;
  role: string;
  status: 'working' | 'idle' | 'offline';
  currentProject: string | null;
  tasksCompleted: number;
  tasksTotal: number;
  hoursToday: number;
  lastActive: string;
  avatar?: string;
  email?: string;
  phone?: string;
  location?: string;
  joinDate?: string;
  department?: string;
  totalProjects?: number;
  weeklyHours?: number;
  monthlyTasksCompleted?: number;
  performance?: number;
  skills?: string[];
  recentProjects?: { name: string; role: string; completion: number }[];
}

interface EmployeeProfileProps {
  employee: Employee;
  onBack: () => void;
  onUpdateEmployee?: (updatedEmployee: Employee) => void;
}

export function EmployeeProfile({ employee, onBack, onUpdateEmployee }: EmployeeProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<Employee>(employee);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleSave = () => {
    if (onUpdateEmployee) {
      onUpdateEmployee(editedEmployee);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedEmployee(employee);
    setIsEditing(false);
  };

  const handlePhotoUpload = () => {
    // Simulate photo upload
    setIsUploadingPhoto(true);
    setTimeout(() => {
      // Mock photo URL
      const newPhotoUrl = `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
      const updated = { ...editedEmployee, avatar: newPhotoUrl };
      setEditedEmployee(updated);
      if (onUpdateEmployee) {
        onUpdateEmployee(updated);
      }
      setIsUploadingPhoto(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working':
        return { bg: 'var(--status-progress-bg)', text: 'var(--status-progress-text)', dot: '#10b981' };
      case 'idle':
        return { bg: 'var(--status-burning-bg)', text: 'var(--status-burning-text)', dot: '#f59e0b' };
      case 'offline':
        return { bg: 'var(--surface-tertiary)', text: 'var(--text-tertiary)', dot: '#6b7280' };
      default:
        return { bg: 'var(--surface-tertiary)', text: 'var(--text-secondary)', dot: '#6b7280' };
    }
  };

  const statusColors = getStatusColor(editedEmployee.status);
  const taskProgress = editedEmployee.tasksTotal > 0 
    ? Math.round((editedEmployee.tasksCompleted / editedEmployee.tasksTotal) * 100) 
    : 0;

  return (
    <div className="h-full overflow-auto">
      <div className="p-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg transition-colors"
            style={{
              color: 'var(--text-secondary)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Team</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
                Employee Profile
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Detailed information and performance metrics
              </p>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                }}
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-tertiary)',
                    color: 'var(--text-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                  }}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                  }}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div
              className="rounded-xl p-6 border mb-6"
              style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              {/* Avatar with Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <Avatar className="w-32 h-32 mb-3">
                    {editedEmployee.avatar ? (
                      <AvatarImage src={editedEmployee.avatar} alt={editedEmployee.name} />
                    ) : (
                      <AvatarFallback 
                        className="text-2xl"
                        style={{ 
                          backgroundColor: 'var(--accent-primary-subtle)',
                          color: 'var(--accent-primary)'
                        }}
                      >
                        {editedEmployee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  {isEditing && (
                    <button
                      onClick={handlePhotoUpload}
                      disabled={isUploadingPhoto}
                      className="absolute bottom-3 right-0 p-2 rounded-full transition-all"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: '#ffffff',
                        opacity: isUploadingPhoto ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!isUploadingPhoto) {
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {editedEmployee.name}
                </h3>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {editedEmployee.role}
                </p>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusColors.dot }}
                  />
                  <span 
                    className="text-sm px-3 py-1 rounded-md"
                    style={{ 
                      backgroundColor: statusColors.bg,
                      color: statusColors.text
                    }}
                  >
                    {editedEmployee.status.charAt(0).toUpperCase() + editedEmployee.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedEmployee.email || ''}
                      onChange={(e) => setEditedEmployee({ ...editedEmployee, email: e.target.value })}
                      placeholder="email@example.com"
                      className="flex-1 px-2 py-1 rounded border text-sm"
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--input-border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  ) : (
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {editedEmployee.email || 'No email set'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedEmployee.phone || ''}
                      onChange={(e) => setEditedEmployee({ ...editedEmployee, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="flex-1 px-2 py-1 rounded border text-sm"
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--input-border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  ) : (
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {editedEmployee.phone || 'No phone set'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedEmployee.location || ''}
                      onChange={(e) => setEditedEmployee({ ...editedEmployee, location: e.target.value })}
                      placeholder="City, Country"
                      className="flex-1 px-2 py-1 rounded border text-sm"
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--input-border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  ) : (
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {editedEmployee.location || 'No location set'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    Joined {editedEmployee.joinDate || 'Jan 2023'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {editedEmployee.department || 'Design Team'}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills Card */}
            <div
              className="rounded-xl p-6 border"
              style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Skills & Expertise
              </h4>
              <div className="flex flex-wrap gap-2">
                {(editedEmployee.skills || ['AutoCAD', '3D Modeling', 'Revit', 'SketchUp', 'Rendering']).map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: 'var(--accent-primary-bg)',
                      color: 'var(--accent-primary)'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Performance & Activity */}
          <div className="lg:col-span-2">
            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div
                className="rounded-xl p-5 border"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  borderColor: 'var(--border-primary)'
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Projects</span>
                </div>
                <div className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {editedEmployee.totalProjects || 24}
                </div>
              </div>

              <div
                className="rounded-xl p-5 border"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  borderColor: 'var(--border-primary)'
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5" style={{ color: 'var(--status-progress-text)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Weekly Hours</span>
                </div>
                <div className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {editedEmployee.weeklyHours || 38.5}h
                </div>
              </div>

              <div
                className="rounded-xl p-5 border"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  borderColor: 'var(--border-primary)'
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-5 h-5" style={{ color: 'var(--status-end-text)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Performance</span>
                </div>
                <div className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {editedEmployee.performance || 94}%
                </div>
              </div>
            </div>

            {/* Current Activity */}
            <div
              className="rounded-xl p-6 border mb-6"
              style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Current Activity
              </h4>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Current Project</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {editedEmployee.currentProject || 'No active project'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tasks Today</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {editedEmployee.tasksCompleted} / {editedEmployee.tasksTotal}
                    </span>
                  </div>
                  <Progress 
                    value={taskProgress} 
                    className="h-2"
                    style={{ backgroundColor: 'var(--surface-tertiary)' }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Hours Today</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {editedEmployee.hoursToday.toFixed(1)}h
                    </span>
                  </div>
                  <Progress 
                    value={(editedEmployee.hoursToday / 8) * 100} 
                    className="h-2"
                    style={{ backgroundColor: 'var(--surface-tertiary)' }}
                  />
                  <span className="text-xs mt-1 inline-block" style={{ color: 'var(--text-tertiary)' }}>
                    Target: 8h
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Last Active</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {editedEmployee.lastActive}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Projects */}
            <div
              className="rounded-xl p-6 border"
              style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Recent Projects
              </h4>

              <div className="space-y-4">
                {(editedEmployee.recentProjects || [
                  { name: 'Bobur residence interior', role: 'Lead Designer', completion: 85 },
                  { name: 'Modern Spaces LLC', role: 'Interior Designer', completion: 100 },
                  { name: 'Heritage Builders', role: 'Consultant', completion: 60 }
                ]).map((project, index) => (
                  <div key={index} className="pb-4 border-b last:border-b-0" style={{ borderColor: 'var(--border-secondary)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                          {project.name}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {project.role}
                        </div>
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                        {project.completion}%
                      </span>
                    </div>
                    <Progress 
                      value={project.completion} 
                      className="h-1.5"
                      style={{ backgroundColor: 'var(--surface-tertiary)' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
