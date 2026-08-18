import re

with open('frontend/src/pages/audit/flow/AdminConsoleView.tsx', 'r') as f:
    content = f.read()

# 1. Add import
content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useNavigate } from 'react-router-dom';")

# 2. Replace onExitConsole
old_str = "  const onExitConsole = () => setActiveTab('Dashboard & KPIs');"
new_str = "  const navigate = useNavigate();\n  const onExitConsole = () => navigate('/auditflow/dashboard');"

content = content.replace(old_str, new_str)

with open('frontend/src/pages/audit/flow/AdminConsoleView.tsx', 'w') as f:
    f.write(content)
