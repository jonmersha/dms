with open('frontend/src/pages/admin/AdminDashboard.tsx', 'r') as f:
    code = f.read()

if 'UserPlus' not in code:
    code = code.replace(
        "import { Users, Building2, Calendar, Activity, Settings, ArchiveRestore, Award, X } from 'lucide-react';",
        "import { Users, Building2, Calendar, Activity, Settings, ArchiveRestore, Award, X, UserPlus } from 'lucide-react';"
    )

quick_actions = """
      {/* Quick Action Cards */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/system/users" className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer">
          <UserPlus size={28} className="mb-2 opacity-90" />
          <span className="font-semibold text-sm">Manage Users</span>
        </Link>
        <Link to="/system/departments" className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer">
          <Building2 size={28} className="mb-2 opacity-90" />
          <span className="font-semibold text-sm">Departments</span>
        </Link>
        <button onClick={() => setIsCertSettingsModalOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer w-full">
          <Award size={28} className="mb-2 opacity-90" />
          <span className="font-semibold text-sm">Certificates</span>
        </button>
        <Link to="/system/backups" className="bg-rose-600 hover:bg-rose-700 text-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer">
          <ArchiveRestore size={28} className="mb-2 opacity-90" />
          <span className="font-semibold text-sm">System Backup</span>
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">"""

code = code.replace(
    '      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">',
    quick_actions
)

with open('frontend/src/pages/admin/AdminDashboard.tsx', 'w') as f:
    f.write(code)
