/**
 * BudgetDisplay Component
 * Shows total budget with smooth animations and clear visual hierarchy
 */

import { TrendingUp, AlertCircle, BarChart3, X, DollarSign, Shield, Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useBudget, formatBudget } from '@/app/contexts/BudgetContext';
import { useState } from 'react';

export function BudgetDisplay() {
  const { totalLimit, getTotalUsed, getRemaining, projects } = useBudget();
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const totalUsed = getTotalUsed();
  const remaining = getRemaining();
  const percentage = (totalUsed / totalLimit) * 100;
  const isOverLimit = totalUsed > totalLimit;

  // Sort projects by budget (highest to lowest)
  const sortedProjects = [...projects].sort((a, b) => b.budget - a.budget);

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-8 transition-all duration-500"
      style={{
        background: isOverLimit
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.12) 100%)'
          : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.15) 100%)',
        border: isOverLimit
          ? '1px solid rgba(239, 68, 68, 0.25)'
          : '1px solid var(--border-primary)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Animated background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: isOverLimit
            ? 'radial-gradient(circle at 30% 50%, rgba(239, 68, 68, 0.15) 0%, transparent 50%)'
            : 'radial-gradient(circle at 30% 50%, rgba(96, 165, 250, 0.4) 0%, transparent 50%)',
          animation: 'pulse 3s ease-in-out infinite'
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp 
              className="w-6 h-6" 
              style={{ color: isOverLimit ? 'rgba(239, 68, 68, 0.9)' : 'var(--accent-primary)' }} 
            />
            <div>
              <h3 
                className="text-lg font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Loyihalarning umumiy byudjeti
              </h3>
              {isOverLimit && (
                <div 
                  className="text-xs font-medium mt-1 flex items-center gap-1"
                  style={{ color: 'rgba(239, 68, 68, 0.9)' }}
                >
                  <AlertTriangle className="w-3 h-3" />
                  Byudjet limiti oshib ketdi
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Budget Stats - Reordered for visual hierarchy */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Over Limit / Remaining - Highest Priority */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              {isOverLimit ? (
                <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'rgba(239, 68, 68, 0.9)' }} />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
              )}
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {isOverLimit ? 'Limitdan oshiq' : "Qolgan mablag'"}
              </div>
            </div>
            <div 
              className="text-xl font-bold flex items-baseline gap-1" 
              style={{ color: isOverLimit ? 'rgba(239, 68, 68, 0.95)' : '#22C55E' }}
            >
              {isOverLimit && <span className="text-sm">+</span>}
              {isOverLimit ? formatBudget(Math.abs(remaining)) : formatBudget(remaining)}
            </div>
          </div>

          {/* Used Budget - Second Priority */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5" style={{ color: isOverLimit ? 'rgba(239, 68, 68, 0.8)' : 'var(--accent-primary)' }} />
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Ishlatilgan byudjet
              </div>
            </div>
            <div 
              className="text-xl font-bold" 
              style={{ color: 'var(--text-primary)' }}
            >
              {formatBudget(totalUsed)}
            </div>
          </div>

          {/* Total Limit - Third Priority */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Umumiy limit
              </div>
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatBudget(totalLimit)}
            </div>
          </div>
        </div>

        {/* Budget Breakdown Button - Small, aligned right */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: showBreakdown 
                ? (isOverLimit ? 'rgba(239, 68, 68, 0.9)' : 'var(--accent-primary)')
                : 'var(--surface-secondary)',
              color: showBreakdown ? '#ffffff' : 'var(--text-secondary)',
              border: `1px solid ${showBreakdown ? 'transparent' : 'var(--border-primary)'}`
            }}
            onMouseEnter={(e) => {
              if (!showBreakdown) {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showBreakdown) {
                e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            {showBreakdown ? 'Tafsilotni yashirish' : 'Tafsilotni ko\'rsatish'}
          </button>
        </div>

        {/* Progress Bar with Warning Icon */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Byudjetdan foydalanish
            </span>
            <span 
              className="text-xs font-bold"
              style={{ color: 'var(--text-secondary)' }}
            >
              {percentage.toFixed(1)}%
            </span>
          </div>
          <div className="relative">
            <div 
              className="h-3 rounded-full overflow-hidden"
              style={{ 
                backgroundColor: 'var(--surface-tertiary)',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              {isOverLimit ? (
                // Full red progress bar when over limit
                <div
                  className="h-full transition-all duration-500 relative overflow-hidden"
                  style={{
                    width: `100%`,
                    background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.7) 0%, rgba(252, 165, 165, 0.6) 100%)',
                    boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)',
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s linear infinite'
                    }}
                  />
                </div>
              ) : (
                // Standard blue progress bar
                <div
                  className="h-full transition-all duration-500 relative overflow-hidden"
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    background: 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)',
                    boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)',
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s linear infinite'
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Warning icon at 100% mark if over limit */}
            {isOverLimit && (
              <div 
                className="absolute top-1/2 -translate-y-1/2"
                style={{ 
                  left: `${(100 / percentage) * 100}%`,
                  marginLeft: '-10px'
                }}
              >
                <AlertTriangle 
                  className="w-5 h-5" 
                  style={{ 
                    color: 'rgba(239, 68, 68, 0.8)',
                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
                  }} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Project Breakdown */}
        {showBreakdown && (
          <div 
            className="mt-4 p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Loyihalar byudjet bo'yicha (eng kattasidan kichigigacha)
              </h4>
              <button
                onClick={() => setShowBreakdown(false)}
                className="p-1 rounded hover:bg-opacity-10"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {sortedProjects.map((project, index) => {
                const projectPercentage = (project.budget / totalLimit) * 100;
                return (
                  <div 
                    key={project.id}
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-secondary)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <div 
                          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: isOverLimit ? 'rgba(239, 68, 68, 0.9)' : 'var(--accent-primary)',
                            color: '#ffffff',
                            opacity: isOverLimit ? (1 - (index * 0.1)) : (1 - (index * 0.15))
                          }}
                        >
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium flex-1" style={{ color: 'var(--text-primary)' }}>
                          {project.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        <span className="text-sm font-bold" style={{ color: isOverLimit ? 'rgba(239, 68, 68, 0.9)' : 'var(--accent-primary)' }}>
                          {formatBudget(project.budget)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Mini progress bar for this project */}
                    <div className="flex items-center gap-2">
                      <div 
                        className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--surface-tertiary)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${projectPercentage}%`,
                            backgroundColor: isOverLimit ? 'rgba(239, 68, 68, 0.8)' : 'var(--accent-primary)',
                            opacity: isOverLimit ? (1 - (index * 0.1)) : (1 - (index * 0.15))
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                        {projectPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Warning Message if over limit */}
        {isOverLimit && (
          <div 
            className="mt-6 p-4 rounded-lg"
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                }}
              >
                <AlertTriangle 
                  className="w-4 h-4" 
                  style={{ color: 'rgba(239, 68, 68, 0.9)' }} 
                />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold mb-1" style={{ color: 'rgba(239, 68, 68, 0.95)' }}>
                  Byudjet limiti oshib ketdi
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Siz <span className="font-bold">{formatBudget(Math.abs(remaining))}</span> {formatBudget(totalLimit)} limitdan oshib ketdingiz. 
                  Yangi loyiha qo'shish uchun ishlarni yakunlang.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}