import re

with open('src/components/CaatAnalyticsView.tsx', 'r') as f:
    content = f.read()

content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { useAuditContext } from \"../context/AuditContext\";")
content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useAuditContext } from \"../context/AuditContext\";")
content = content.replace("import React from 'react';", "import React from 'react';\nimport { useAuditContext } from \"../context/AuditContext\";")

replacement = """export default function CaatAnalyticsView() {
  const { activeRole, handleLogSystemAction: onLogAction } = useAuditContext();
"""

content = re.sub(r'interface CaatAnalyticsViewProps \{.*?\n}\n\nexport default function CaatAnalyticsView\(\{.*?\}\: CaatAnalyticsViewProps\) \{', replacement, content, flags=re.DOTALL)

with open('src/components/CaatAnalyticsView.tsx', 'w') as f:
    f.write(content)
