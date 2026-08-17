import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { UploadDocument } from './pages/UploadDocument';
import { DocumentDetail } from './pages/DocumentDetail';
import { EditDocument } from './pages/EditDocument';
import { SystemNavbar } from './components/SystemNavbar';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { AboutUs } from './pages/public/AboutUs';
import { Learning } from './pages/public/Learning';
import { AdminContent } from './pages/admin/AdminContent';
import { AdminLearning } from './pages/admin/AdminLearning';
import { Publications } from './pages/public/Publications';
import { QualityManagement } from './pages/public/QualityManagement';
import { Performance } from './pages/public/Performance';
import { AdminDepartments } from './pages/admin/AdminDepartments';
import { AdminPeriods } from './pages/admin/AdminPeriods';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { PerformancePlansManager } from './pages/dashboards/PerformancePlansManager';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { BackupRestore } from './pages/admin/BackupRestore';
import { AllDocuments } from './pages/AllDocuments';
import { RecycleBin } from './pages/RecycleBin';
import { DocumentAccess } from './pages/DocumentAccess';
import { AccessManagement } from './pages/AccessManagement';
import { Activation } from './pages/auth/Activation';
import { PasswordResetRequest } from './pages/auth/PasswordResetRequest';
import { PasswordResetConfirm } from './pages/auth/PasswordResetConfirm';
import { Profile } from './pages/Profile';

// A user is a Super Admin if they are a Django superuser OR belong to the System Administrator group
function isSuperAdmin(user: { is_superuser: boolean; role: string }) {
  return user.is_superuser || user.role === 'ADMIN';
}

function ProtectedRoute({ children, allowedRoles, requireAdmin }: { children: React.ReactNode, allowedRoles?: string[], requireAdmin?: boolean }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  // Super Admins bypass all role restrictions
  if (isSuperAdmin(user)) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <SystemNavbar />
        <main className="flex-1">{children}</main>
      </div>
    );
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  // System-only routes (departments, users, roles, etc.) require Super Admin
  if (requireAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <SystemNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

function HomeRedirector() {
  const { user } = useAuth();
  
  if (user && isSuperAdmin(user)) {
    return <Navigate to="/system/dashboard" replace />;
  }
  
  return <Dashboard />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/activate/:uid/:token" element={<Activation />} />
        <Route path="/password-reset" element={<PasswordResetRequest />} />
        <Route path="/password/reset/confirm/:uid/:token" element={<PasswordResetConfirm />} />
        <Route 
          path="/" 
          element={
            <Layout>
              <LandingPage />
            </Layout>
          } 
        />
        <Route 
          path="/about" 
          element={
            <Layout>
              <AboutUs />
            </Layout>
          } 
        />
        <Route 
          path="/learning" 
          element={
            <Layout>
              <Learning />
            </Layout>
          } 
        />
        <Route 
          path="/publications" 
          element={
            <Layout>
              <Publications />
            </Layout>
          } 
        />

        <Route 
          path="/quality" 
          element={
            <Layout>
              <QualityManagement />
            </Layout>
          } 
        />
        <Route 
          path="/performance" 
          element={
            <Layout>
              <Performance />
            </Layout>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <HomeRedirector />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/documents" 
          element={
            <ProtectedRoute>
              <AllDocuments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/system/content" 
          element={
            <ProtectedRoute>
              <AdminContent />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/system/learning" 
          element={
            <ProtectedRoute allowedRoles={['CHIEF', 'DIRECTOR', 'TEAM_MANAGER', 'ADMIN']}>
              <AdminLearning />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/documents/new" 
          element={
            <ProtectedRoute allowedRoles={['TEAM_MANAGER', 'TEAM_MEMBER', 'DIRECTOR', 'CHIEF', 'ADMIN']}>
              <UploadDocument />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/documents/:id" 
          element={
            <Layout>
              <DocumentDetail />
            </Layout>
          } 
        />
        <Route 
          path="/documents/:id/edit" 
          element={
            <ProtectedRoute allowedRoles={['TEAM_MANAGER', 'TEAM_MEMBER', 'DIRECTOR', 'CHIEF', 'ADMIN']}>
              <EditDocument />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/documents/:id/access" 
          element={
            <ProtectedRoute>
              <DocumentAccess />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recycle-bin" 
          element={
            <ProtectedRoute>
              <RecycleBin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/access" 
          element={
            <ProtectedRoute>
              <AccessManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/system/dashboard" 
          element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/system/departments" 
          element={<ProtectedRoute requireAdmin><AdminDepartments /></ProtectedRoute>} 
        />
        <Route 
          path="/system/periods" 
          element={<ProtectedRoute requireAdmin><AdminPeriods /></ProtectedRoute>} 
        />
        <Route 
          path="/system/users" 
          element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} 
        />
        <Route 
          path="/system/logs" 
          element={<ProtectedRoute requireAdmin><AdminAuditLogs /></ProtectedRoute>} 
        />
        <Route 
          path="/dashboard/performance-plans" 
          element={<ProtectedRoute allowedRoles={['DIRECTOR', 'CHIEF', 'ADMIN']}><PerformancePlansManager /></ProtectedRoute>} 
        />
        <Route 
          path="/system/announcements" 
          element={
            <ProtectedRoute allowedRoles={['CHIEF', 'DIRECTOR']}>
              <AdminAnnouncements />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/system/backups" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'CHIEF', 'DIRECTOR', 'TEAM_MANAGER']}>
              <BackupRestore />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
