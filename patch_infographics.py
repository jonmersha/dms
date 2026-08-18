import re

with open('frontend/src/pages/admin/AdminDashboard.tsx', 'r') as f:
    code = f.read()

# 1. Add recharts imports
if 'RechartsPieChart' not in code:
    code = code.replace(
        "import { Link } from 'react-router-dom';",
        "import { Link } from 'react-router-dom';\nimport { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';"
    )

# 2. Add data calculation hooks before the return statement
hooks_code = """
  const roleDistribution = React.useMemo(() => {
    const roles: Record<string, number> = {};
    users.forEach((u: any) => {
      const role = u.role_display || u.role || 'Unknown';
      roles[role] = (roles[role] || 0) + 1;
    });
    return Object.entries(roles).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [users]);

  const deptDistribution = React.useMemo(() => {
    const depts: Record<string, number> = {};
    users.forEach((u: any) => {
      const dept = u.department_details?.name || 'Unassigned';
      depts[dept] = (depts[dept] || 0) + 1;
    });
    return Object.entries(depts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5); // top 5
  }, [users]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#64748b'];

  return ("""

code = code.replace('  return (', hooks_code)


# 3. Replace Administrative Sections block with Infographics block
old_admin_block = """        <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="text-gray-500" /> Administrative Sections
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/system/users" className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
              <Users className="text-blue-600 mb-2" size={24} />
              <h3 className="font-semibold text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-500">Add, edit, or suspend users</p>
            </Link>
            <Link to="/system/departments" className="block p-4 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors">
              <Building2 className="text-purple-600 mb-2" size={24} />
              <h3 className="font-semibold text-gray-900">Manage Departments</h3>
              <p className="text-sm text-gray-500">Configure organizational structure</p>
            </Link>
            <Link to="/system/periods" className="block p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors">
              <Calendar className="text-green-600 mb-2" size={24} />
              <h3 className="font-semibold text-gray-900">Audit Periods</h3>
              <p className="text-sm text-gray-500">Define fiscal years and quarters</p>
            </Link>
            <Link to="/system/logs" className="block p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 transition-colors">
              <Activity className="text-yellow-600 mb-2" size={24} />
              <h3 className="font-semibold text-gray-900">System Logs</h3>
              <p className="text-sm text-gray-500">View user activities and audits</p>
            </Link>
            <Link to="/system/backups" className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
              <ArchiveRestore className="text-blue-600 mb-2" size={24} />
              <h3 className="font-semibold text-gray-900">Backup & Restore</h3>
              <p className="text-sm text-gray-500">Manage system data backups</p>
            </Link>
            <button onClick={() => setIsCertSettingsModalOpen(true)} className="block p-4 border border-gray-200 rounded-lg hover:bg-orange-50 transition-colors text-left">
              <Award className="text-orange-600 mb-2" size={24} />
              <h3 className="font-semibold text-gray-900">Certificate Settings</h3>
              <p className="text-sm text-gray-500">Configure global learning certificates</p>
            </button>
          </div>
        </div>"""

new_infographics = """        <div className="flex flex-col gap-6">
          <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200 flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="text-indigo-600" /> User Role Distribution
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200 flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="text-emerald-600" /> Top Departments by Size
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} angle={-45} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>"""

if 'Administrative Sections' in code:
    code = code.replace(old_admin_block, new_infographics)
    with open('frontend/src/pages/admin/AdminDashboard.tsx', 'w') as f:
        f.write(code)

