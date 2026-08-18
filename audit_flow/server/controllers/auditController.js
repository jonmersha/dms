import { db } from "../db.js";

// --- AUDIT UNIVERSE ---
export const getUniverse = (req, res, next) => {
  try {
    const entities = db.prepare("SELECT * FROM audit_universe").all();
    const mapped = entities.map(e => ({
      ...e,
      isDeleted: e.isDeleted === 1
    }));
    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

export const saveUniverse = (req, res, next) => {
  try {
    const entities = Array.isArray(req.body) ? req.body : [req.body];
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO audit_universe (id, name, description, category, subcategory, auditingUnit, riskScore, riskLevel, templateId, isDeleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const transaction = db.transaction((list) => {
      for (const ent of list) {
        stmt.run(
          ent.id,
          ent.name,
          ent.description || null,
          ent.category,
          ent.subcategory || null,
          ent.auditingUnit || null,
          ent.riskScore,
          ent.riskLevel,
          ent.templateId || null,
          ent.isDeleted ? 1 : 0
        );
      }
    });
    transaction(entities);
    res.json({ success: true, count: entities.length });
  } catch (err) {
    next(err);
  }
};

// --- ANNUAL PLAN ---
export const getAnnualPlan = (req, res, next) => {
  try {
    const plans = db.prepare("SELECT * FROM annual_plan").all();
    res.json(plans);
  } catch (err) {
    next(err);
  }
};

export const saveAnnualPlan = (req, res, next) => {
  try {
    const plans = Array.isArray(req.body) ? req.body : [req.body];
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO annual_plan (id, auditYear, entityId, entityName, riskLevel, riskScore, targetQuarter, targetMonth, assignedResources, status, approvedBy, approvalDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const transaction = db.transaction((list) => {
      for (const p of list) {
        stmt.run(p.id, p.auditYear || '2026', p.entityId, p.entityName, p.riskLevel, p.riskScore, p.targetQuarter, p.targetMonth, p.assignedResources, p.status, p.approvedBy || null, p.approvalDate || null);
      }
    });
    transaction(plans);
    res.json({ success: true, count: plans.length });
  } catch (err) {
    next(err);
  }
};

// --- ENGAGEMENTS ---
export const getEngagements = (req, res, next) => {
  try {
    const engs = db.prepare("SELECT * FROM engagements").all();
    const mapped = engs.map((e) => ({
      ...e,
      teamMembers: JSON.parse(e.teamMembers),
      wbs: JSON.parse(e.wbs),
      engagementLetter: JSON.parse(e.engagementLetter)
    }));
    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

export const saveEngagements = (req, res, next) => {
  try {
    const engs = Array.isArray(req.body) ? req.body : [req.body];
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO engagements (id, planId, title, entityId, entityName, auditorInCharge, teamMembers, status, startDate, endDate, wbs, engagementLetter, assignedSection, assignedTeam, assignedSubTeam)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const transaction = db.transaction((list) => {
      for (const e of list) {
        stmt.run(
          e.id,
          e.planId,
          e.title,
          e.entityId,
          e.entityName,
          e.auditorInCharge,
          JSON.stringify(e.teamMembers),
          e.status,
          e.startDate,
          e.endDate,
          JSON.stringify(e.wbs),
          JSON.stringify(e.engagementLetter),
          e.assignedSection || null,
          e.assignedTeam || null,
          e.assignedSubTeam || null
        );
      }
    });
    transaction(engs);
    res.json({ success: true, count: engs.length });
  } catch (err) {
    next(err);
  }
};

// --- FINDINGS ---
export const getFindings = (req, res, next) => {
  try {
    const fnds = db.prepare("SELECT * FROM findings").all();
    const mapped = fnds.map((f) => ({
      ...f,
      isSentToAuditees: f.isSentToAuditees === 1,
      isAcceptedByAuditor: f.isAcceptedByAuditor === 1,
      evidenceFiles: JSON.parse(f.evidenceFiles)
    }));
    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

export const saveFindings = (req, res, next) => {
  try {
    const fnds = Array.isArray(req.body) ? req.body : [req.body];
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO findings (id, engagementId, engagementTitle, entityName, title, description, criteria, rootCause, impact, lossFigures, recommendations, riskLevel, isSentToAuditees, auditeeResponse, isAcceptedByAuditor, targetedActionPlan, expectedCompletionDate, rectificationProgress, rectificationValidationStatus, evidenceFiles, creationDate, escalationLevel, slaDeadline)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const transaction = db.transaction((list) => {
      for (const f of list) {
        stmt.run(
          f.id,
          f.engagementId,
          f.engagementTitle,
          f.entityName,
          f.title,
          f.description,
          f.criteria,
          f.rootCause,
          f.impact,
          f.lossFigures,
          f.recommendations,
          f.riskLevel,
          f.isSentToAuditees ? 1 : 0,
          f.auditeeResponse || null,
          f.isAcceptedByAuditor ? 1 : 0,
          f.targetedActionPlan || null,
          f.expectedCompletionDate || null,
          f.rectificationProgress,
          f.rectificationValidationStatus,
          JSON.stringify(f.evidenceFiles),
          f.creationDate,
          f.escalationLevel,
          f.slaDeadline
        );
      }
    });
    transaction(fnds);
    res.json({ success: true, count: fnds.length });
  } catch (err) {
    next(err);
  }
};

// --- COMPLIANCE CONTROLS ---
export const getComplianceControls = (req, res, next) => {
  try {
    const controls = db.prepare("SELECT * FROM compliance_controls").all();
    res.json(controls);
  } catch (err) {
    next(err);
  }
};

export const saveComplianceControls = (req, res, next) => {
  try {
    const controls = Array.isArray(req.body) ? req.body : [req.body];
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO compliance_controls (id, regulationType, directiveNumber, controlName, assessmentCriteria, status, lastAssessedDate, mappedEntity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const transaction = db.transaction((list) => {
      for (const c of list) {
        stmt.run(c.id, c.regulationType, c.directiveNumber, c.controlName, c.assessmentCriteria, c.status, c.lastAssessedDate, c.mappedEntity);
      }
    });
    transaction(controls);
    res.json({ success: true, count: controls.length });
  } catch (err) {
    next(err);
  }
};

// --- SYSTEM LOGS ---
export const getSystemLogs = (req, res, next) => {
  try {
    const logs = db.prepare("SELECT * FROM system_logs ORDER BY timestamp DESC").all();
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

export const saveSystemLogs = (req, res, next) => {
  try {
    const logs = Array.isArray(req.body) ? req.body : [req.body];
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO system_logs (id, timestamp, user, role, action, details, ipAddress)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const transaction = db.transaction((list) => {
      for (const l of list) {
        stmt.run(l.id, l.timestamp, l.user, l.role, l.action, l.details, l.ipAddress);
      }
    });
    transaction(logs);
    res.json({ success: true, count: logs.length });
  } catch (err) {
    next(err);
  }
};

// --- ORGANIZATIONAL UNITS ---
export const getOrgUnits = (req, res, next) => {
  try {
    const units = db.prepare("SELECT * FROM org_units").all();
    const mapped = units.map(u => ({
      ...u,
      employees: JSON.parse(u.employees || "[]"),
      positions: JSON.parse(u.positions || "[]")
    }));
    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

export const saveOrgUnits = (req, res, next) => {
  try {
    const units = Array.isArray(req.body) ? req.body : [req.body];
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO org_units (id, name, code, type, parentId, headId, headName, employees, positions, roles, responsibilities)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const transaction = db.transaction((list) => {
      for (const u of list) {
        stmt.run(
          u.id,
          u.name,
          u.code,
          u.type,
          u.parentId || null,
          u.headId || null,
          u.headName || null,
          JSON.stringify(u.employees || []),
          JSON.stringify(u.positions || []),
          u.roles || null,
          u.responsibilities || null
        );
      }
    });
    transaction(units);
    res.json({ success: true, count: units.length });
  } catch (err) {
    next(err);
  }
};

// --- ESCALATIONS ---
export const getEscalations = (req, res, next) => {
  try {
    const esc = db.prepare("SELECT * FROM escalations ORDER BY creationDate DESC").all();
    res.json(esc);
  } catch (err) {
    next(err);
  }
};

export const saveEscalations = (req, res, next) => {
  try {
    const esc = Array.isArray(req.body) ? req.body : [req.body];
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO escalations (id, issueType, title, description, sourceUnitId, sourceUnitName, targetUnitId, targetUnitName, status, escalatedById, escalatedByName, escalatedToId, escalatedToName, creationDate, decisionDate, decisionNotes, decisionBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const transaction = db.transaction((list) => {
      for (const e of list) {
        stmt.run(
          e.id,
          e.issueType,
          e.title,
          e.description,
          e.sourceUnitId,
          e.sourceUnitName,
          e.targetUnitId,
          e.targetUnitName,
          e.status,
          e.escalatedById,
          e.escalatedByName,
          e.escalatedToId,
          e.escalatedToName,
          e.creationDate,
          e.decisionDate || null,
          e.decisionNotes || null,
          e.decisionBy || null
        );
      }
    });
    transaction(esc);
    res.json({ success: true, count: esc.length });
  } catch (err) {
    next(err);
  }
};
