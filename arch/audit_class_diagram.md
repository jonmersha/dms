# Audit Workflow - Data Models Class Diagram

This document provides a highly detailed structural class diagram of the Audit Workflow Management subsystem. It maps out all the Django models, their explicit attributes, types, and the relationships (ForeignKeys, OneToOnes, ManyToManys) that bind them together.

## Mermaid Class Diagram

```mermaid
classDiagram
    %% Core Definition Models
    class AuditPeriod {
        +String fiscal_year
        +DateField start_date
        +DateField end_date
        +Boolean is_active
        +save()
        +clean()
    }

    class ChecklistTemplate {
        +String name
        +TextField description
        +FileField file_attachment
        +DateTimeField created_at
    }

    class AuditableEntity {
        +String name
        +String entity_type
        +String sub_category
        +String risk_rating
        +TextField description
        +DateField last_audited_date
        +Boolean is_deleted
        +DateTimeField created_at
        +DateTimeField updated_at
    }

    %% Planning Phase Models
    class AnnualAuditPlan {
        +String title
        +TextField description
        +String status
        +DecimalField total_budgeted_hours
        +DateField approved_date
        +DateTimeField created_at
        +DateTimeField updated_at
    }

    class PlannedAudit {
        +String quarter_targeted
        +DecimalField budgeted_hours
        +TextField objectives
        +DateTimeField created_at
        +DateTimeField updated_at
    }

    %% Execution & Fieldwork Models
    class AuditEngagement {
        +String engagement_code
        +String status
        +DateField start_date
        +DateField end_date
        +TextField scope
        +DecimalField actual_hours
        +JSONField wbs
        +JSONField engagement_letter
        +DateTimeField created_at
        +DateTimeField updated_at
        +save()
    }

    class RiskControlMatrix {
        +String process_name
        +TextField identified_risk
        +TextField control_description
        +String control_design_assessment
        +String control_operating_effectiveness
        +DateTimeField created_at
        +DateTimeField updated_at
    }

    class WorkPaper {
        +String title
        +TextField description
        +String status
        +FileField attachment
        +DateTimeField created_at
        +DateTimeField updated_at
    }

    %% Findings & Reporting Models
    class AuditFinding {
        +String title
        +TextField condition
        +TextField criteria
        +TextField cause
        +TextField effect
        +TextField recommendation
        +TextField root_cause
        +DecimalField loss_figures
        +String risk_level
        +Boolean is_sent_to_auditees
        +TextField management_response
        +TextField auditee_response
        +DateField action_plan_date
        +String rectification_validation_status
        +DateField sla_deadline
        +String status
        +DateTimeField created_at
        +DateTimeField updated_at
    }

    class EngagementReport {
        +TextField executive_summary
        +String overall_rating
        +String status
        +DateField issue_date
        +FileField pdf_report
        +DateTimeField created_at
        +DateTimeField updated_at
    }

    class ComplianceControl {
        +String regulation_type
        +String directive_number
        +String control_name
        +TextField assessment_criteria
        +String status
        +DateField last_assessed_date
    }

    class Escalation {
        +String issue_type
        +String title
        +TextField description
        +String status
        +DateTimeField creation_date
        +DateTimeField decision_date
        +TextField decision_notes
    }

    %% Relationships
    AuditPeriod "1" -- "1" AnnualAuditPlan : has
    AnnualAuditPlan "1" *-- "*" PlannedAudit : includes
    AuditableEntity "1" -- "*" PlannedAudit : targeted by
    AuditableEntity "*" -- "*" ChecklistTemplate : uses
    AuditableEntity "1" -- "*" ComplianceControl : assessed by
    
    PlannedAudit "1" -- "1" AuditEngagement : executes as
    AuditEngagement "1" *-- "*" RiskControlMatrix : identifies
    AuditEngagement "1" *-- "*" WorkPaper : documents
    AuditEngagement "1" *-- "*" AuditFinding : discovers
    AuditEngagement "1" -- "1" EngagementReport : produces

    %% Note for external relations (Users / Departments)
    note for AuditableEntity "FK to users.Department"
    note for PlannedAudit "FK to users.Department (assigned_team)"
    note for AuditEngagement "FKs to users.User (lead_auditor, auditors)"
    note for WorkPaper "FKs to users.User (prepared_by, reviewed_by)"
    note for Escalation "FKs to users.Department & users.User"
```

## Relationship Types Explained
- **1 to 1 (`"1" -- "1"`)**: Used where exactly one instance maps to another. For example, an `AuditPeriod` has exactly one overarching `AnnualAuditPlan`. An `AuditEngagement` produces exactly one `EngagementReport`.
- **1 to Many (`"1" *-- "*"`)**: Composition or standard Foreign Key. An `AuditEngagement` is composed of multiple `WorkPaper`s, `AuditFinding`s, and `RiskControlMatrix` entries.
- **Many to Many (`"*" -- "*"`)**: An `AuditableEntity` can have multiple standard `ChecklistTemplate`s attached to it, and a template can be used by multiple entities.
