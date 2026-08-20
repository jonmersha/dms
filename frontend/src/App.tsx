import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import { AdminRoles } from './pages/admin/AdminRoles';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { PerformancePlansManager } from './pages/dashboards/PerformancePlansManager';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AuditAdminDashboard } from './pages/admin/AuditAdminDashboard';
import { AuditUsersAccess } from './pages/admin/AuditUsersAccess';
import { DMSAdminDashboard } from './pages/admin/DMSAdminDashboard';
import { DMSUsersAccess } from './pages/admin/DMSUsersAccess';
import { LMSAdminDashboard } from './pages/admin/LMSAdminDashboard';
import { LMSUsersAccess } from './pages/admin/LMSUsersAccess';
import { IncidentAdminDashboard } from './pages/admin/IncidentAdminDashboard';
import { IncidentUsersAccess } from './pages/admin/IncidentUsersAccess';
import { AnalyticsAdminDashboard } from './pages/admin/AnalyticsAdminDashboard';
import { AnalyticsUsersAccess } from './pages/admin/AnalyticsUsersAccess';
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
import { AuditFlowLayout } from './layouts/AuditFlowLayout';
import { AuditProvider } from './contexts/AuditContext';
import UniversePlanView from './pages/audit/flow/UniversePlanView';
import AdminConsoleView from './pages/audit/flow/AdminConsoleView';
import RiskAssessmentView from './pages/audit/flow/RiskAssessmentView';
import EngagementView from './pages/audit/flow/EngagementView';
import FieldworkFindingView from './pages/audit/flow/FieldworkFindingView';
import RemediationView from './pages/audit/flow/RemediationView';
import DashboardKpiView from './pages/audit/flow/DashboardKpiView';
import IrregularityRegistryView from './pages/irregularities/IrregularityRegistryView';
import IncidentAdminView from './pages/irregularities/IncidentAdminView';
import { BranchResidentAuditorDashboard } from './pages/irregularities/BranchResidentAuditorDashboard';
import { FindingListView } from './pages/irregularities/FindingListView';
import { FindingDetailView } from './pages/irregularities/FindingDetailView';
import OrgStructureView from './pages/audit/flow/OrgStructureView';
import CaatAnalyticsView from './pages/audit/flow/CaatAnalyticsView';
import ImmutableLogView from './pages/audit/flow/ImmutableLogView';
import { AnalyticsLayout } from './layouts/AnalyticsLayout';
import { SessionTimeoutManager } from './components/SessionTimeoutManager';
import { AnalyticsDashboard } from './pages/analytics/AnalyticsDashboard';
import { DataSources } from './pages/analytics/DataSources';
import { AuditScripts } from './pages/analytics/AuditScripts';
import { ExceptionsDashboard } from './pages/analytics/ExceptionsDashboard';

// A user is a Super Admin if they are a Django superuser OR belong to the System Administrator group
function isSuperAdmin(user: { is_superuser: boolean; role: string }) {
  return user.is_superuser || user.role === 'ADMIN';
}

function ProtectedRoute({ children, allowedRoles, requireAdmin, disableLayout, allowLmsCreator, requireIrregularityAccess, requireAuditAccess }: { children: React.ReactNode, allowedRoles?: string[], requireAdmin?: boolean, disableLayout?: boolean, allowLmsCreator?: boolean, requireIrregularityAccess?: boolean, requireAuditAccess?: boolean }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  // Super Admins bypass all role restrictions
  if (isSuperAdmin(user)) {
    if (disableLayout) return <>{children}</>;
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 pb-16 md:pb-0">
        <SystemNavbar />
        <main className="flex-1">{children}</main>
      </div>
    );
  }
  
  if (allowedRoles) {
    const hasRole = user.system_roles 
      ? user.system_roles.some(r => allowedRoles.includes(r))
      : allowedRoles.includes(user.role);
    const hasLmsAccess = allowLmsCreator && user.can_create_lms_course;
    if (!hasRole && !hasLmsAccess) {
      return <Navigate to="/unauthorized" />;
    }
  }

  if (requireIrregularityAccess && !user.has_irregularity_access) {
    return <Navigate to="/unauthorized" />;
  }

  if (requireAuditAccess && !user.has_audit_access) {
    return <Navigate to="/unauthorized" />;
  }
  
  // System-only routes (departments, users, roles, etc.) require Super Admin
  if (requireAdmin) {
    return <Navigate to="/" />;
  }

  if (disableLayout) return <>{children}</>;
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-16 md:pb-0">
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
      <SessionTimeoutManager timeoutMinutes={15} warningMinutes={1}>
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
            <ProtectedRoute allowedRoles={['CHIEF', 'DIRECTOR', 'TEAM_MANAGER', 'ADMIN']} allowLmsCreator={true}>
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
          path="/system/audit" 
          element={<ProtectedRoute requireAdmin><AuditAdminDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/audit/users" 
          element={<ProtectedRoute requireAdmin><AuditUsersAccess /></ProtectedRoute>} 
        />
        <Route 
          path="/system/dms" 
          element={<ProtectedRoute requireAdmin><DMSAdminDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/dms/users" 
          element={<ProtectedRoute requireAdmin><DMSUsersAccess /></ProtectedRoute>} 
        />
        <Route 
          path="/system/lms-admin" 
          element={<ProtectedRoute requireAdmin><LMSAdminDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/lms/users" 
          element={<ProtectedRoute requireAdmin><LMSUsersAccess /></ProtectedRoute>} 
        />
        <Route 
          path="/system/branch-audit-admin" 
          element={<ProtectedRoute requireAdmin><IncidentAdminDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/irregularities/resident-audit" 
          element={<ProtectedRoute><BranchResidentAuditorDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/irregularities/resident-audit/findings" 
          element={<ProtectedRoute><FindingListView /></ProtectedRoute>} 
        />
        <Route 
          path="/irregularities/resident-audit/findings/:id" 
          element={<ProtectedRoute><FindingDetailView /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/branch-audit/users" 
          element={<ProtectedRoute requireAdmin><IncidentUsersAccess /></ProtectedRoute>} 
        />
        <Route 
          path="/system/analytics-admin" 
          element={<ProtectedRoute requireAdmin><AnalyticsAdminDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/analytics/users" 
          element={<ProtectedRoute requireAdmin><AnalyticsUsersAccess /></ProtectedRoute>} 
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
          path="/system/roles" 
          element={<ProtectedRoute requireAdmin><AdminRoles /></ProtectedRoute>} 
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
        
        
        {/* Incident Log Route */}
        <Route 
          path="/branch-audit/admin" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'CHIEF', 'DIRECTOR']} disableLayout={true}>
              <div className="py-6"><IncidentAdminView /></div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/branch-audit" 
          element={
            <ProtectedRoute requireIrregularityAccess>
              <div className="py-6"><IrregularityRegistryView /></div>
            </ProtectedRoute>
          } 
        />

        {/* Audit Management Routes */}
        <Route 
          path="/auditflow" 
          element={
            <ProtectedRoute requireAuditAccess disableLayout={true}>
              <AuditProvider>
                <Outlet />
              </AuditProvider>
            </ProtectedRoute>
          } 
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          {/* Admin console has its own layout */}
          <Route path="admin" element={<AdminConsoleView />} />
          
          {/* All other routes use the AuditFlowLayout */}
          <Route element={<AuditFlowLayout />}>
          <Route path="universe" element={<UniversePlanView />} />
          <Route path="annual-plan" element={<RiskAssessmentView targetModule="AnnualPlan" />} />
          <Route path="engagements" element={<EngagementView />} />
          <Route path="fieldwork" element={<FieldworkFindingView />} />
          <Route path="reporting" element={<RemediationView />} />
          <Route path="dashboard" element={<DashboardKpiView />} />
          <Route path="risk-assessment" element={<RiskAssessmentView targetModule="RiskAssessment" />} />
          <Route path="remediation" element={<RemediationView />} />
          <Route path="org-structure" element={<OrgStructureView />} />
          <Route path="caat-analytics" element={<CaatAnalyticsView />} />
          <Route path="immutable-logs" element={<ImmutableLogView />} />
          </Route>
        </Route>

        {/* Analytics Routes */}
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute disableLayout={true}>
              <AnalyticsLayout />
            </ProtectedRoute>
          } 
        >
          <Route path="overview" element={<AnalyticsDashboard />} />
          <Route path="sources" element={<DataSources />} />
          <Route path="scripts" element={<AuditScripts />} />
          <Route path="exceptions" element={<ExceptionsDashboard />} />
        </Route>

        <Route 
          path="/unauthorized" 
          element={
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
              <div className="w-full max-w-md space-y-8 text-center">
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Access Denied</h2>
                <p className="mt-2 text-sm text-gray-600">You do not have permission to access this page.</p>
                <div className="mt-4 flex justify-center">
                  <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Return to Dashboard</a>
                </div>
              </div>
            </div>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </SessionTimeoutManager>
    </Router>
  );
}

export default App;
