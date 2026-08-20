# Document Management System (DMS) - Detailed Workflows

This document outlines the detailed procedural workflows and state machines governing the Document Management System (DMS) subsystem. It maps out how documents are uploaded, secured, accessed, and eventually archived or deleted.

---

## 1. Document Upload & Approval Workflow

All critical documents (like final Audit Reports or new Policies) follow a strict maker-checker process before they become active and searchable on the platform.

```mermaid
sequenceDiagram
    actor Uploader as Staff / Uploader
    participant System as DMS
    actor Admin as DMS Admin / Chief

    Uploader->>System: Uploads Document (PDF) & sets Metadata
    System-->>Uploader: Status: DRAFT
    
    Uploader->>System: Submits for Approval
    System->>System: Status transitions to PENDING_APPROVAL
    System-->>Admin: Notification: Document awaiting approval
    
    Admin->>System: Reviews Document & Metadata
    
    alt Approved
        Admin->>System: Approves Document
        System->>System: Status transitions to APPROVED
        System->>System: Log 'APPROVED' in DocumentAuditLog
        System-->>Uploader: Notification: Approved
    else Rejected/Returned
        Admin->>System: Returns with Revision Comments
        System->>System: Status transitions to RETURNED
        System-->>Uploader: Notification: Requires edits
        Uploader->>System: Uploads new version (DocumentVersion created)
    end
```

---

## 2. Temporary Access Grant Workflow (State Machine)

If a user does not have native permissions to view or download a restricted document, they can request temporary access.

```mermaid
stateDiagram-v2
    [*] --> PENDING: User requests Access (Provides Reason)
    
    PENDING --> Rejected: Authorizer denies request
    Rejected --> [*]
    
    PENDING --> ACTIVE: Authorizer approves (Sets Expires_At)
    
    state ACTIVE {
        [*] --> ValidatingTime
        ValidatingTime --> AccessGranted: Current Time < expires_at
        
        %% Track user activity
        AccessGranted --> LogView: User views document
        AccessGranted --> LogDownload: User downloads document
        
        LogView --> ValidatingTime
        LogDownload --> ValidatingTime
    }
    
    ACTIVE --> EXPIRED: Current Time >= expires_at
    ACTIVE --> REVOKED: Authorizer manually revokes early
    
    EXPIRED --> [*]
    REVOKED --> [*]
```

---

## 3. Document Deletion & Retention Lifecycle

To prevent accidental data loss and maintain compliance, documents are rarely deleted immediately. They go through a request pipeline, followed by soft-deletion, before physical files are permanently removed via Django signals.

```mermaid
sequenceDiagram
    actor User as Document Owner
    participant System as DMS Database
    participant Storage as File System
    actor Admin as DMS Admin

    User->>System: Requests Deletion (Provides Reason)
    System->>System: Flags 'deletion_requested = True'
    System-->>Admin: Notification: Deletion Request Pending
    
    Admin->>System: Reviews Deletion Request
    
    alt Soft Delete / Archive
        Admin->>System: Approves Soft Delete
        System->>System: Flags 'is_deleted = True'
        System->>System: Logs 'DELETION_APPROVED'
        Note right of System: Document hidden from search, but file remains
    else Permanent (Hard) Delete
        Admin->>System: Triggers Hard Delete
        System->>System: Record completely deleted from Database
        System--)Storage: Django 'post_delete' Signal Fired
        Storage->>Storage: os.remove(pdf_file.path)
        Note right of Storage: Physical PDF file permanently erased
    end
```

---

## 4. Automated Backup Operations Workflow

The DMS includes automated scripts for backing up both the database and the physical document files.

```mermaid
stateDiagram-v2
    [*] --> PENDING: Backup Scheduled / Triggered
    
    PENDING --> RUNNING: Backup Worker Starts
    
    state RUNNING {
        [*] --> CompressFiles: include_files = True
        [*] --> DumpDatabase: include_database = True
        
        CompressFiles --> EncryptArchive
        DumpDatabase --> EncryptArchive
        
        EncryptArchive --> CalculateStats: Count backed_up vs failed
    }
    
    RUNNING --> COMPLETED: 100% Success Rate
    RUNNING --> PARTIAL: Some files failed to compress
    RUNNING --> FAILED: Critical Error (e.g., Disk Full)
    
    COMPLETED --> [*]
    PARTIAL --> [*]
    FAILED --> [*]
```
