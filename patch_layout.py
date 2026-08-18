import re

with open('frontend/src/App.tsx', 'r') as f:
    content = f.read()

# Replace the /auditflow route block
old_block = """        <Route 
          path="/auditflow" 
          element={
            <ProtectedRoute allowedRoles={['CHIEF', 'DIRECTOR', 'TEAM_MANAGER', 'ADMIN']} disableLayout={true}>
              <AuditProvider>
                <AuditFlowLayout />
              </AuditProvider>
            </ProtectedRoute>
          } 
        >"""

new_block = """        <Route 
          path="/auditflow" 
          element={
            <ProtectedRoute allowedRoles={['CHIEF', 'DIRECTOR', 'TEAM_MANAGER', 'ADMIN']} disableLayout={true}>
              <AuditProvider>
                <Outlet />
              </AuditProvider>
            </ProtectedRoute>
          } 
        >
          {/* Admin console has its own layout */}
          <Route path="admin" element={<AdminConsoleView />} />
          
          {/* All other routes use the AuditFlowLayout */}
          <Route element={<AuditFlowLayout />}>"""

content = content.replace(old_block, new_block)

# Remove the old admin route inside the children
content = content.replace('          <Route path="admin" element={<AdminConsoleView />} />\n', '')

# Close the new <Route element={<AuditFlowLayout />}> before the closing </Route> of /auditflow
# The closing tag for the /auditflow block is the </Route> before {/* Analytics Routes */}
# Let's find the closing tag.
# It looks like:
#           <Route path="immutable-logs" element={<ImmutableLogView />} />
#         </Route>
# 
#         {/* Analytics Routes */}

closing_block = """          <Route path="immutable-logs" element={<ImmutableLogView />} />
        </Route>

        {/* Analytics Routes */}"""

new_closing_block = """          <Route path="immutable-logs" element={<ImmutableLogView />} />
          </Route>
        </Route>

        {/* Analytics Routes */}"""

content = content.replace(closing_block, new_closing_block)

with open('frontend/src/App.tsx', 'w') as f:
    f.write(content)
