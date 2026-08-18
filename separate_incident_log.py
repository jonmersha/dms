import re

# 1. Update App.tsx
with open('frontend/src/App.tsx', 'r') as f:
    app = f.read()

app = app.replace(
    '          <Route path="irregularities" element={<IrregularityRegistryView />} />\n',
    ''
)

new_route = """
        {/* Incident Log Route */}
        <Route 
          path="/incident-log" 
          element={
            <ProtectedRoute allowedRoles={['CHIEF', 'DIRECTOR', 'TEAM_MANAGER', 'ADMIN', 'BRANCH_CONTROLLER', 'USER', 'CHIEF_AUDITOR', 'SENIOR_AUDITOR', 'AUDITOR']}>
              <div className="py-6"><IrregularityRegistryView /></div>
            </ProtectedRoute>
          } 
        />
"""

if 'path="/incident-log"' not in app:
    app = app.replace(
        '{/* Audit Management Routes */}',
        f"{new_route}\n        {{/* Audit Management Routes */}}"
    )

with open('frontend/src/App.tsx', 'w') as f:
    f.write(app)


# 2. Update SystemNavbar.tsx
with open('frontend/src/components/SystemNavbar.tsx', 'r') as f:
    nav = f.read()

nav = nav.replace('to="/auditflow/irregularities"', 'to="/incident-log"')

with open('frontend/src/components/SystemNavbar.tsx', 'w') as f:
    f.write(nav)


# 3. Update AuditFlowLayout.tsx
with open('frontend/src/layouts/AuditFlowLayout.tsx', 'r') as f:
    layout = f.read()

layout = re.sub(r"\{\s*to:\s*'/auditflow/irregularities',\s*icon:\s*AlertCircle,\s*label:\s*'Irregularity Logs'\s*\},?\n\s*", "", layout)

with open('frontend/src/layouts/AuditFlowLayout.tsx', 'w') as f:
    f.write(layout)
