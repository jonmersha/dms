import re

with open('src/components/EngagementView.tsx', 'r') as f:
    content = f.read()

content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { useAuditContext } from \"../context/AuditContext\";")
content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useAuditContext } from \"../context/AuditContext\";")

replacement = """export default function EngagementView() {
  const { engagements, setEngagements: onUpdateEngagements, annualPlan, users, universe, activeRole, handleLogSystemAction: onLogAction } = useAuditContext();
"""

content = re.sub(r'interface EngagementViewProps \{.*?\n}\n\nexport default function EngagementView\(\{.*?\}\: EngagementViewProps\) \{', replacement, content, flags=re.DOTALL)

with open('src/components/EngagementView.tsx', 'w') as f:
    f.write(content)
