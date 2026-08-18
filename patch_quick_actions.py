with open('frontend/src/pages/admin/AdminDashboard.tsx', 'r') as f:
    code = f.read()

# Add missing imports
if 'Megaphone' not in code:
    code = code.replace(
        "import { Users, Building2, Calendar, Activity, Settings, ArchiveRestore, Award, X, UserPlus } from 'lucide-react';",
        "import { Users, Building2, Calendar, Activity, Settings, ArchiveRestore, Award, X, UserPlus, Newspaper, Megaphone } from 'lucide-react';"
    )

old_grid_start = '<div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">'
new_grid_start = '<div className="mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">'

code = code.replace(old_grid_start, new_grid_start)

# We want to insert the two new cards before the closing div of the quick actions.
# Let's find the closing div by searching for the element after it: <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
insert_target = '      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">'

new_cards = """        <Link to="/system/content" className="bg-sky-600 hover:bg-sky-700 text-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer">
          <Newspaper size={28} className="mb-2 opacity-90" />
          <span className="font-semibold text-sm">Public Content</span>
        </Link>
        <Link to="/system/announcements" className="bg-violet-600 hover:bg-violet-700 text-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer">
          <Megaphone size={28} className="mb-2 opacity-90" />
          <span className="font-semibold text-sm">Announcements</span>
        </Link>
      </div>

"""

code = code.replace('      </div>\n\n      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">', new_cards + insert_target)

with open('frontend/src/pages/admin/AdminDashboard.tsx', 'w') as f:
    f.write(code)

