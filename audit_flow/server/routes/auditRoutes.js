import { Router } from "express";
import {
  getUniverse,
  saveUniverse,
  getAnnualPlan,
  saveAnnualPlan,
  getEngagements,
  saveEngagements,
  getFindings,
  saveFindings,
  getComplianceControls,
  saveComplianceControls,
  getSystemLogs,
  saveSystemLogs,
  getOrgUnits,
  saveOrgUnits,
  getEscalations,
  saveEscalations
} from "../controllers/auditController.js";

const router = Router();

// Universe Routes
router.get("/universe", getUniverse);
router.post("/universe", saveUniverse);

// Annual Plan Routes
router.get("/annual_plan", getAnnualPlan);
router.post("/annual_plan", saveAnnualPlan);

// Engagement Routes
router.get("/engagements", getEngagements);
router.post("/engagements", saveEngagements);

// Findings Routes
router.get("/findings", getFindings);
router.post("/findings", saveFindings);

// Compliance Controls Routes
router.get("/compliance_controls", getComplianceControls);
router.post("/compliance_controls", saveComplianceControls);

// System Logs Routes
router.get("/system_logs", getSystemLogs);
router.post("/system_logs", saveSystemLogs);

// Organizational Units Routes
router.get("/org_units", getOrgUnits);
router.post("/org_units", saveOrgUnits);

// Escalation Routes
router.get("/escalations", getEscalations);
router.post("/escalations", saveEscalations);

export default router;
