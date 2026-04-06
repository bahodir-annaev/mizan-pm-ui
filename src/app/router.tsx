import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { LoginPage } from './auth/LoginPage';
import { RegisterPage } from './auth/RegisterPage';
import { ForgotPasswordPage } from './auth/ForgotPasswordPage';
import { ResetPasswordPage } from './auth/ResetPasswordPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TeamPage } from './pages/TeamPage';
import { ClientsPage } from './pages/ClientsPage';
import { SettingsPage } from './pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/tasks" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'team', element: <TeamPage /> },
      { path: 'clients', element: <ClientsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
