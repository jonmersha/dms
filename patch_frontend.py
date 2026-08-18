import re

# 1. App.tsx
with open('frontend/src/App.tsx', 'r') as f:
    app_content = f.read()

if 'import IrregularityRegistryView' not in app_content:
    app_content = app_content.replace(
        "import DashboardKpiView from './pages/audit/flow/DashboardKpiView';",
        "import DashboardKpiView from './pages/audit/flow/DashboardKpiView';\nimport IrregularityRegistryView from './pages/irregularities/IrregularityRegistryView';"
    )
    
    app_content = app_content.replace(
        '<Route path="engagements" element={<EngagementView />} />',
        '<Route path="irregularities" element={<IrregularityRegistryView />} />\n          <Route path="engagements" element={<EngagementView />} />'
    )
    
    with open('frontend/src/App.tsx', 'w') as f:
        f.write(app_content)

# 2. AuditFlowLayout.tsx
with open('frontend/src/layouts/AuditFlowLayout.tsx', 'r') as f:
    layout_content = f.read()

if '/auditflow/irregularities' not in layout_content:
    layout_content = layout_content.replace(
        "import { \n  Shield, Calendar, Briefcase, CheckSquare, FileText, \n  BarChart, Settings, Activity, Building, Target, \n  Users, Lock, ShieldAlert \n} from 'lucide-react';",
        "import { \n  Shield, Calendar, Briefcase, CheckSquare, FileText, \n  BarChart, Settings, Activity, Building, Target, \n  Users, Lock, ShieldAlert, AlertCircle \n} from 'lucide-react';"
    )
    layout_content = layout_content.replace(
        "{ to: '/auditflow/engagements', icon: Briefcase, label: 'Engagements & Programs' },",
        "{ to: '/auditflow/irregularities', icon: AlertCircle, label: 'Irregularity Logs' },\n        { to: '/auditflow/engagements', icon: Briefcase, label: 'Engagements & Programs' },"
    )
    
    with open('frontend/src/layouts/AuditFlowLayout.tsx', 'w') as f:
        f.write(layout_content)

# 3. SystemNavbar.tsx
with open('frontend/src/components/SystemNavbar.tsx', 'r') as f:
    navbar_content = f.read()

if '/auditflow/irregularities' not in navbar_content:
    navbar_content = navbar_content.replace(
        "import { Activity, Home, FileText, Shield, PieChart, User, LogOut, ChevronDown, ListVideo, Settings, Trash2 } from 'lucide-react';",
        "import { Activity, Home, FileText, Shield, PieChart, User, LogOut, ChevronDown, ListVideo, Settings, Trash2, AlertCircle } from 'lucide-react';"
    )
    
    link_to_add = """
                {/* Branch Irregularities */}
                {user.role !== 'VISITOR' && (
                  <Link to="/auditflow/irregularities" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                    <AlertCircle size={18} /> Incident Log
                  </Link>
                )}"""
                
    navbar_content = navbar_content.replace(
        "{/* 3. Audit Workflow */}",
        f"{link_to_add}\n\n                {{/* 3. Audit Workflow */}}"
    )
    
    with open('frontend/src/components/SystemNavbar.tsx', 'w') as f:
        f.write(navbar_content)

