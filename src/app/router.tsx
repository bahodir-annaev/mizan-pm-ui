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
import { FinanceDashboardPage } from './pages/finance/FinanceDashboardPage';
import { ExchangeRatesPage } from './pages/finance/ExchangeRatesPage';
import { OverheadCostsPage } from './pages/finance/OverheadCostsPage';
import { EquipmentPage } from './pages/finance/EquipmentPage';
import { HourlyRatesPage } from './pages/finance/HourlyRatesPage';

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
      {
        path: 'finance',
        children: [
          { index: true, element: <FinanceDashboardPage /> },
          { path: 'exchange-rates', element: <ExchangeRatesPage /> },
          { path: 'overhead-costs', element: <OverheadCostsPage /> },
          { path: 'equipment', element: <EquipmentPage /> },
          { path: 'hourly-rates', element: <HourlyRatesPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
