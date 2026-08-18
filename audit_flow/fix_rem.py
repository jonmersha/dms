import re

with open('src/components/RemediationView.tsx', 'r') as f:
    content = f.read()

content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { useAuditContext } from \"../context/AuditContext\";")
content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useAuditContext } from \"../context/AuditContext\";")
content = content.replace("import React from 'react';", "import React from 'react';\nimport { useAuditContext } from \"../context/AuditContext\";")

replacement = """export default function RemediationView() {
  const { findings, setFindings: onUpdateFindings, activeRole, handleLogSystemAction: onLogAction } = useAuditContext();
"""

content = re.sub(r'interface RemediationViewProps \{.*?\n}\n\nexport default function RemediationView\(\{.*?\}\: RemediationViewProps\) \{', replacement, content, flags=re.DOTALL)

with open('src/components/RemediationView.tsx', 'w') as f:
    f.write(content)
