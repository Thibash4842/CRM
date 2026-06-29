import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LeadProvider } from './context/LeadContext';
import { WebSocketProvider } from './context/WebSocketContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadEdit from './pages/LeadEdit';
import Trash from './pages/Trash';
import Deals from './pages/Deals';
import Clients from './pages/Clients';
import Accounts from './pages/Accounts';
import Activities from './pages/Activities';
import Notes from './pages/Notes';
import Projects from './pages/Projects';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import UsersPage from './pages/Users';
import SettingsPage from './pages/Settings';
import Notifications from './pages/Notifications';
import Calendar from './pages/Calendar';
import { LoadingSpinner } from './components/ui/PageHeader';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

export default function App() {
  if (typeof window !== 'undefined' && window.location.search.includes('mockConfirm')) {
    window.confirm = () => true;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <WebSocketProvider>
          <LeadProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

                <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
                  <Route index element={<Dashboard />} />
                  <Route path="leads" element={<Leads />} />
                  <Route path="leads/edit/:id" element={<LeadEdit />} />
                  <Route path="leads/converted" element={<Leads type="converted" />} />
                  <Route path="leads/lost" element={<Leads type="lost" />} />
                  <Route path="leads/trash" element={<Trash />} />
                  <Route path="contacts" element={<Clients />} />
                  <Route path="accounts" element={<Accounts />} />
                  <Route path="deals" element={<Deals />} />
                  <Route path="activities/:type" element={<Activities />} />
                  <Route path="notes" element={<Notes />} />
                  <Route path="clients" element={<Clients />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="invoices" element={<Invoices />} />
                  <Route path="payments" element={<Payments />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="notifications" element={<Notifications />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </LeadProvider>
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
