/**
 * BudgetContext - Manages global project budget tracking
 * Total budget limit: 10 billion (10 mlrd)
 */

import { createContext, useContext, useState, ReactNode } from 'react';

const TOTAL_BUDGET_LIMIT = 10000; // 10 billion in millions = 10,000 million

export interface ProjectBudget {
  id: string;
  name: string;
  budget: number; // in millions
}

interface BudgetContextType {
  totalLimit: number;
  projects: ProjectBudget[];
  addProject: (project: ProjectBudget) => boolean;
  removeProject: (id: string) => void;
  updateProject: (id: string, budget: number) => boolean;
  getTotalUsed: () => number;
  getRemaining: () => number;
  canAddBudget: (amount: number) => boolean;
  isBurning: () => boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

// Initialize with existing projects from ProjectDetail
const initialProjects: ProjectBudget[] = [
  { id: 'proj-1', name: 'Main Building Project', budget: 3500 }, // $3.5B
  { id: 'proj-2', name: 'Residential Complex', budget: 4200 }, // $4.2B
  { id: 'proj-3', name: 'Office Renovation', budget: 1800 }, // $1.8B
  { id: 'proj-4', name: 'City Plaza Development', budget: 1500 }, // $1.5B
];

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectBudget[]>(initialProjects);

  const getTotalUsed = () => {
    return projects.reduce((sum, project) => sum + project.budget, 0);
  };

  const getRemaining = () => {
    return TOTAL_BUDGET_LIMIT - getTotalUsed();
  };

  const canAddBudget = (amount: number) => {
    return getTotalUsed() + amount <= TOTAL_BUDGET_LIMIT;
  };

  const addProject = (project: ProjectBudget): boolean => {
    if (!canAddBudget(project.budget)) {
      return false;
    }
    setProjects(prev => [...prev, project]);
    return true;
  };

  const removeProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const updateProject = (id: string, budget: number): boolean => {
    const currentProject = projects.find(p => p.id === id);
    if (!currentProject) return false;

    const budgetDifference = budget - currentProject.budget;
    if (budgetDifference > 0 && !canAddBudget(budgetDifference)) {
      return false;
    }

    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, budget } : p))
    );
    return true;
  };

  const isBurning = () => {
    return getTotalUsed() > TOTAL_BUDGET_LIMIT;
  };

  return (
    <BudgetContext.Provider
      value={{
        totalLimit: TOTAL_BUDGET_LIMIT,
        projects,
        addProject,
        removeProject,
        updateProject,
        getTotalUsed,
        getRemaining,
        canAddBudget,
        isBurning,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}

// Helper function to format budget numbers
export function formatBudget(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)} mlrd`;
  }
  return `${amount} mln`;
}

// Helper function to parse budget input (supports M, B, mlrd, mln)
export function parseBudgetInput(input: string): number {
  const cleaned = input.trim().toLowerCase().replace(/[,$]/g, '');
  
  // Handle billion/mlrd
  if (cleaned.includes('b') || cleaned.includes('mlrd')) {
    const num = parseFloat(cleaned);
    return num * 1000; // Convert to millions
  }
  
  // Handle million/mln/m
  if (cleaned.includes('m') || cleaned.includes('mln')) {
    return parseFloat(cleaned);
  }
  
  // Plain number - assume millions
  return parseFloat(cleaned) || 0;
}