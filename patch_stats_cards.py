with open('frontend/src/pages/admin/AdminDashboard.tsx', 'r') as f:
    code = f.read()

# 1. Total Users
old_users = """        <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="rounded-md bg-blue-100 p-3 text-blue-600">
            <Users size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
          </div>
        </div>"""
new_users = """        <Link to="/system/users" className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="rounded-md bg-blue-100 p-3 text-blue-600">
            <Users size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
          </div>
        </Link>"""
code = code.replace(old_users, new_users)

# 2. Departments
old_depts = """        <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="rounded-md bg-purple-100 p-3 text-purple-600">
            <Building2 size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Departments</p>
            <p className="text-2xl font-semibold text-gray-900">{departments.length}</p>
          </div>
        </div>"""
new_depts = """        <Link to="/system/departments" className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="rounded-md bg-purple-100 p-3 text-purple-600">
            <Building2 size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Departments</p>
            <p className="text-2xl font-semibold text-gray-900">{departments.length}</p>
          </div>
        </Link>"""
code = code.replace(old_depts, new_depts)

# 3. Audit Periods
old_periods = """        <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="rounded-md bg-green-100 p-3 text-green-600">
            <Calendar size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Audit Periods</p>
            <p className="text-2xl font-semibold text-gray-900">{periods.length}</p>
          </div>
        </div>"""
new_periods = """        <Link to="/system/periods" className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="rounded-md bg-green-100 p-3 text-green-600">
            <Calendar size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Audit Periods</p>
            <p className="text-2xl font-semibold text-gray-900">{periods.length}</p>
          </div>
        </Link>"""
code = code.replace(old_periods, new_periods)

# 4. Total Audit Logs
old_logs = """        <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="rounded-md bg-yellow-100 p-3 text-yellow-600">
            <Activity size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Audit Logs</p>
            <p className="text-2xl font-semibold text-gray-900">{logs.length}</p>
          </div>
        </div>"""
new_logs = """        <Link to="/system/logs" className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="rounded-md bg-yellow-100 p-3 text-yellow-600">
            <Activity size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Audit Logs</p>
            <p className="text-2xl font-semibold text-gray-900">{logs.length}</p>
          </div>
        </Link>"""
code = code.replace(old_logs, new_logs)

with open('frontend/src/pages/admin/AdminDashboard.tsx', 'w') as f:
    f.write(code)
