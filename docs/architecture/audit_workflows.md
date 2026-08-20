# Audit System - Detailed Workflows

This document outlines the detailed procedural workflows and state machines governing the Audit Workflow Management subsystem. It maps out how different roles interact with the system throughout the audit lifecycle.

---

## 1. Annual Audit Planning Workflow

Before any fieldwork can begin, the Chief Internal Auditor must establish an annual plan and obtain approval from the Board Audit Committee.

```mermaid
sequenceDiagram
    actor Chief as Chief Internal Auditor
    participant System as CAP System
    actor Board as Board Audit Committee

    Chief->>System: Creates new AuditPeriod (e.g. 2025-26)
    Chief->>System: Drafts AnnualAuditPlan
    System-->>Chief: Status: DRAFT
    
    Note over Chief,System: Iterative selection of Auditable Entities based on risk
    Chief->>System: Adds PlannedAudit targeting Branch A (Q1)
    Chief->>System: Adds PlannedAudit targeting IT Dept (Q2)
    
    Chief->>Board: Submits AnnualAuditPlan for Review
    
    alt Approved by Board
        Board->>System: Approves Plan
        System->>System: Update Status to APPROVED
        System-->>Chief: Notification: Plan Approved
    else Rejected/Revised
        Board->>Chief: Requests revisions
        Chief->>System: Modifies Planned Audits
    end
```

---

## 2. Audit Engagement Lifecycle (State Machine)

Once a `PlannedAudit` is approved, it transitions into an active `AuditEngagement`. This state machine ensures the audit follows standard phases.

```mermaid
stateDiagram-v2
    [*] --> PLANNING: Engagement Initiated from Plan
    
    state PLANNING {
        [*] --> AssignTeam: Lead Auditor Assigned
        AssignTeam --> DraftEngagementLetter: Auditors Draft Letter
        DraftEngagementLetter --> ApproveScope: Define Scope & WBS
    }
    
    PLANNING --> FIELDWORK: Planning Phase Signed-Off
    
    state FIELDWORK {
        [*] --> DataGathering
        DataGathering --> UploadWorkPapers: Auditors upload evidence
        UploadWorkPapers --> LogFindings: Anomalies logged as Findings
        LogFindings --> UpdateRCM: Update Risk Control Matrix
    }
    
    FIELDWORK --> REPORTING: Fieldwork Concluded
    
    state REPORTING {
        [*] --> DraftReport: Consolidate Findings
        DraftReport --> ReviewReport: Lead Auditor reviews
        ReviewReport --> Issued: Final PDF Generated
    }
    
    REPORTING --> CLOSED: Report Officially Issued
    CLOSED --> [*]
```

---

## 3. Work Paper Maker-Checker Workflow

To ensure quality control during the Fieldwork phase, every piece of evidence (`WorkPaper`) uploaded by a Junior Auditor (Maker) must be reviewed by a Senior Auditor / Team Lead (Checker).

```mermaid
sequenceDiagram
    actor Junior as Field Auditor (Maker)
    participant System as AuditEngagement
    actor Senior as Team Lead (Checker)

    Junior->>System: Uploads WorkPaper & Attachment
    System-->>Junior: Status: DRAFT
    
    Junior->>System: Submits for Review
    System->>System: Status transitions to IN_REVIEW
    System-->>Senior: Notification: WorkPaper needs review
    
    Senior->>System: Reviews WorkPaper content
    
    alt Content is Satisfactory
        Senior->>System: Approves WorkPaper
        System->>System: Status transitions to APPROVED
        System-->>Junior: Notification: Approved
    else Corrections Required
        Senior->>System: Returns with Comments
        System->>System: Status transitions to RETURNED
        System-->>Junior: Notification: Requires edits
        Junior->>System: Edits and Re-submits
    end
```

---

## 4. Audit Finding Resolution & Escalation Workflow

When an issue is identified during fieldwork, an `AuditFinding` is generated. It requires management response and tracked rectification. If SLAs are missed, the system escalates the finding.

```mermaid
stateDiagram-v2
    [*] --> OPEN: Auditor logs Finding (Condition, Cause, Effect)
    
    OPEN --> Management_Response: Finding sent to Auditees
    
    state Management_Response {
        [*] --> AwaitingResponse
        AwaitingResponse --> ActionPlanSubmitted: Management submits plan
    }
    
    Management_Response --> PENDING_FOLLOWUP: Action Plan Accepted
    
    state PENDING_FOLLOWUP {
        [*] --> AwaitingRectification: SLA Deadline Set
        
        AwaitingRectification --> Rectification_Verified: Auditor verifies fix
        AwaitingRectification --> SLA_Breached: Current Date > SLA Deadline
    }
    
    Rectification_Verified --> CLOSED: Finding Officially Closed
    
    SLA_Breached --> ESCALATED: Auto-trigger Escalation logic
    ESCALATED --> PENDING_FOLLOWUP: New deadline negotiated via Escalation
    
    CLOSED --> [*]
```
