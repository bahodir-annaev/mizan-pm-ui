import { ProjectTable } from '../components/ProjectTable';
// import { BudgetDisplay } from '../components/BudgetDisplay';

export function ProjectsPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 z-40 p-8 pb-4 border-b" style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border-primary)'
      }}>
        <div className="mb-6">
          <h2 className="text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>Projects</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and track all your projects</p>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="p-8 pt-6 space-y-6">
          {/* <BudgetDisplay /> */}
          <ProjectTable />
        </div>
      </div>
    </div>
  );
}
