import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import './index.css';
import { Layout } from './components/Layout';
import { isAuthError } from './lib/api';
import { Login, Register } from './pages/Auth';
import {
  AdminDashboard,
  Agreements,
  Invoices,
  Notifications,
  OwnerDashboard,
  Payments,
  Properties,
  Settings,
  TenantDashboard,
  Tenants,
} from './pages/Dashboards';
import { Landing } from './pages/Landing';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => !isAuthError(error) && failureCount < 2,
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'owner', element: <OwnerDashboard /> },
      { path: 'tenant', element: <TenantDashboard /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: 'properties', element: <Properties /> },
      { path: 'tenants', element: <Tenants /> },
      { path: 'payments', element: <Payments /> },
      { path: 'invoices', element: <Invoices /> },
      { path: 'agreements', element: <Agreements /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </React.StrictMode>,
);
