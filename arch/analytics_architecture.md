# Analytics & Reporting - Subsystem Architecture

This document provides a deep dive into the **Analytics & Reporting (`analytics`)** subsystem of the Comprehensive Audit Platform (CAP). Beyond just generating charts for a dashboard, this module serves as a powerful **Continuous Auditing** and data extraction engine that interfaces directly with both internal and external databases to detect anomalies.

## 1. High-Level Subsystem Flow

The Analytics module automates the discovery of data anomalies (exceptions) without requiring manual fieldwork:

1. **Connection Setup**: Administrators define external or internal databases (`DataSource`).
2. **Script Authoring**: Auditors write SQL queries (`AuditScript`) designed to return anomalous rows (e.g., "Transactions > $10k missing approvals").
3. **Execution**: The system executes the script on a schedule or manually (`ScriptExecution`).
4. **Exception Handling**: Any returned rows are logged as anomalies (`AnalyticsException`). Auditors review these exceptions and can optionally escalate them into formal `AuditFinding`s within the main Audits subsystem.

## 2. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    DATA_SOURCE ||--o{ AUDIT_SCRIPT : "queried by"
    USER ||--o{ AUDIT_SCRIPT : "authors"
    
    AUDIT_SCRIPT ||--o{ SCRIPT_EXECUTION : "runs as"
    USER ||--o{ SCRIPT_EXECUTION : "triggers"
    
    SCRIPT_EXECUTION ||--o{ ANALYTICS_EXCEPTION : "generates"
```

## 3. Data Models & Mechanics

### 3.1. Integration & Connectivity
- **`DataSource`**: Acts as a connection registry to various IT and core banking systems.
  - *Attributes*: Name, connection string (e.g., `postgresql://user:pass@localhost:5432/dbname`).
  - *Drivers Supported*: `POSTGRES`, `MYSQL`, `SQLSERVER`, `ORACLE`.

### 3.2. Continuous Auditing Scripts
- **`AuditScript`**: The definition of the automated test.
  - *Attributes*: `script_type` (currently defaults to `SQL`), and the `code_content` which contains the raw query. 
  - *Concept*: Scripts are written such that they only return rows that violate a control (e.g., finding duplicated vendor payments).

### 3.3. Execution Tracking
- **`ScriptExecution`**: A transactional ledger tracking every time a script is run.
  - *State Machine*: `RUNNING` ➔ `SUCCESS` (or `FAILED`).
  - *Metrics*: Captures `start_time`, `end_time`, calculates duration, and records the total `records_processed`. It also captures `error_message` dumps if the remote database connection fails.

### 3.4. Exception Management
- **`AnalyticsException`**: The core triage model. Whenever a `ScriptExecution` successfully runs and returns anomalous rows, each row is converted into an exception.
  - *Data Storage*: The raw violating row data is stored dynamically in a JSON blob (`exception_data`).
  - *State Machine*: `NEW` ➔ `REVIEWING` ➔ `DISMISSED` (if false positive) or `ESCALATED`.
  - *Escalation Hook*: Once `ESCALATED`, this data natively feeds into the `audits` app, automatically creating a formal `AuditFinding` for management to rectify.

## 4. Exception Triage Workflow (State Machine)

The following diagram illustrates how the system handles raw data anomalies discovered via SQL scripts.

```mermaid
stateDiagram-v2
    [*] --> Script_Runs
    
    state "Automated Execution" as AE {
        Script_Runs --> Data_Returned: Anomalies Found
        Script_Runs --> [*]: Zero Rows (Clean)
    }
    
    Data_Returned --> NEW: Exceptions Logged
    
    state "Auditor Triage" as AT {
        NEW --> REVIEWING: Auditor investigates JSON data
        
        REVIEWING --> DISMISSED: Identified as False Positive
        REVIEWING --> ESCALATED: Confirmed as true Risk
    }
    
    DISMISSED --> [*]
    
    %% Cross-module hook
    ESCALATED --> Formal_Audit_Finding_Created
    Formal_Audit_Finding_Created --> [*]
```

## 5. Key Integrations with other Subsystems

- **Audits Subsystem (`audits`)**:
  - The Analytics module operates as a feeder. By triaging an `AnalyticsException` to `ESCALATED`, the system bridges the gap between automated data analytics and traditional fieldwork, dynamically generating a new `AuditFinding` for the audit team to track.
- **Dashboards & Frontend**:
  - In addition to automated scripting, the Analytics app contains specialized API views to aggregate metrics (Count of High-Risk Findings, Number of Open Irregularities, Total Loss Figures) from across all other apps to populate the unified React dashboards.
