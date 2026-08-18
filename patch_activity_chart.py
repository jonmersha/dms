with open('frontend/src/pages/admin/AdminDashboard.tsx', 'r') as f:
    code = f.read()

# 1. Update recharts import
if 'AreaChart' not in code:
    code = code.replace(
        "import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';",
        "import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } from 'recharts';"
    )

# 2. Add activityTimeline hook
if 'const activityTimeline' not in code:
    hook_injection = """  const activityTimeline = React.useMemo(() => {
    const dates: Record<string, number> = {};
    logs.forEach((log: any) => {
      const d = new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dates[d] = (dates[d] || 0) + 1;
    });
    return Object.entries(dates).map(([date, count]) => ({ date, count })).reverse();
  }, [logs]);

  const COLORS"""
    code = code.replace("  const COLORS", hook_injection)

# 3. Add chart above the text list
chart_html = """          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="text-blue-600" /> Recent User Activity
          </h2>
          
          <div className="h-48 mb-6 border-b border-gray-100 pb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTimeline}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis allowDecimals={false} width={30} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#93c5fd" name="Activities" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {logs.length > 0 ? ("""

code = code.replace(
    '          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">\n            <Activity className="text-blue-600" /> Recent User Activity\n          </h2>\n          {logs.length > 0 ? (',
    chart_html
)

with open('frontend/src/pages/admin/AdminDashboard.tsx', 'w') as f:
    f.write(code)

