import { db } from "../db.js";

export const getUsers = (req, res, next) => {
  try {
    const users = db.prepare("SELECT * FROM users").all();
    const mapped = users.map((u) => {
      let quals = [];
      let exps = [];
      try {
        quals = u.qualifications ? JSON.parse(u.qualifications) : [];
      } catch (e) {
        quals = [];
      }
      try {
        exps = u.expertise ? JSON.parse(u.expertise) : [];
      } catch (e) {
        exps = [];
      }
      return {
        ...u,
        active: u.active === 1,
        qualifications: Array.isArray(quals) ? quals : [],
        expertise: Array.isArray(exps) ? exps : []
      };
    });
    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

export const saveUsers = (req, res, next) => {
  try {
    const users = Array.isArray(req.body) ? req.body : [req.body];
    const stmt = db.prepare(`
      INSERT INTO users (
        id, name, email, role, department, active, password,
        title, category, team, reportsToId, reportsToName,
        employeeId, subProcess, employmentStatus, qualifications, expertise, contactPhone
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, COALESCE((SELECT password FROM users WHERE id = ?), 'Password123'),
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        email = excluded.email,
        role = excluded.role,
        department = excluded.department,
        active = excluded.active,
        title = excluded.title,
        category = excluded.category,
        team = excluded.team,
        reportsToId = excluded.reportsToId,
        reportsToName = excluded.reportsToName,
        employeeId = excluded.employeeId,
        subProcess = excluded.subProcess,
        employmentStatus = excluded.employmentStatus,
        qualifications = excluded.qualifications,
        expertise = excluded.expertise,
        contactPhone = excluded.contactPhone
    `);
    const transaction = db.transaction((userList) => {
      for (const u of userList) {
        const qualsJson = u.qualifications ? JSON.stringify(u.qualifications) : "[]";
        const expsJson = u.expertise ? JSON.stringify(u.expertise) : "[]";
        stmt.run(
          u.id,
          u.name,
          u.email,
          u.role,
          u.department,
          u.active ? 1 : 0,
          u.id,
          u.title || '',
          u.category || '',
          u.team || '',
          u.reportsToId || '',
          u.reportsToName || '',
          u.employeeId || '',
          u.subProcess || '',
          u.employmentStatus || 'Active',
          qualsJson,
          expsJson,
          u.contactPhone || ''
        );
      }
    });
    transaction(users);
    res.json({ success: true, count: users.length });
  } catch (err) {
    next(err);
  }
};
