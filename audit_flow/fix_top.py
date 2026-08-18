import re

for file in ['src/components/FieldworkFindingView.tsx', 'src/components/OrgStructureView.tsx']:
    with open(file, 'r') as f:
        content = f.read()

    # Just wipe everything before the lucide imports and write the correct imports
    if 'OrgStructureView' in file:
        content = re.sub(r'^.*?import \{', 'import React, { useState, useEffect, useMemo } from "react";\nimport { useAuditContext } from "../context/AuditContext";\nimport {', content, count=1, flags=re.DOTALL)
    else:
        content = re.sub(r'^.*?import \{', 'import React, { useState, useRef } from "react";\nimport { useAuditContext } from "../context/AuditContext";\nimport {', content, count=1, flags=re.DOTALL)

    with open(file, 'w') as f:
        f.write(content)

