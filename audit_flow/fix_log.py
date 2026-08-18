import re

with open('src/components/ImmutableLogView.tsx', 'r') as f:
    content = f.read()

content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { useAuditContext } from \"../context/AuditContext\";")
content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useAuditContext } from \"../context/AuditContext\";")
content = content.replace("import React from 'react';", "import React from 'react';\nimport { useAuditContext } from \"../context/AuditContext\";")

replacement = """export default function ImmutableLogView() {
  const { systemLogs: logs, activeRole } = useAuditContext();
"""

content = re.sub(r'interface ImmutableLogViewProps \{.*?\n}\n\nexport default function ImmutableLogView\(\{.*?\}\: ImmutableLogViewProps\) \{', replacement, content, flags=re.DOTALL)

with open('src/components/ImmutableLogView.tsx', 'w') as f:
    f.write(content)
