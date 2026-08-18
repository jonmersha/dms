import { db } from "../db.js";

export const login = (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      return res.status(401).json({ error: "User profile not found in Enterprise Directory" });
    }
    
    if (user.password !== password) {
      return res.status(401).json({ error: "Incorrect security credentials or password match" });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      active: user.active === 1
    });
  } catch (err) {
    next(err);
  }
};

export const register = (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;
    if (!name || !email || !password || !role || !department) {
      return res.status(400).json({ error: "All profile fields are required for registration" });
    }
    
    const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(450).json({ error: "An audit profile with this email already exists" });
    }
    
    const newUserId = `usr-${Date.now()}`;
    db.prepare(`
      INSERT INTO users (id, name, email, role, department, active, password)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `).run(newUserId, name, email, role, department, password);
    
    res.json({
      id: newUserId,
      name,
      email,
      role,
      department,
      active: true
    });
  } catch (err) {
    next(err);
  }
};

export const getGoogleUrl = (req, res, next) => {
  try {
    const host = req.get("host");
    const protocol = req.protocol;
    const origin = `${protocol}://${host}`;
    const redirectUri = `${origin}/auth/callback`;
    const clientId = process.env.OAUTH_CLIENT_ID;
    
    if (clientId && !clientId.startsWith("MY_") && clientId.trim() !== "") {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
        access_type: "offline",
        prompt: "consent"
      });
      return res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
    } else {
      return res.json({ url: `${origin}/auth/google-sandbox-simulator` });
    }
  } catch (err) {
    next(err);
  }
};

export const serveGoogleSandbox = (req, res, next) => {
  try {
    const list = db.prepare("SELECT * FROM users").all();
    const options = list.map(u => `<option value="${u.email}">${u.name} (${u.email} - ${u.role})</option>`).join("");
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sign in with Google - VERIFY Sandbox</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
          <style>body { font-family: 'Inter', sans-serif; }</style>
        </head>
        <body class="bg-slate-50 flex items-center justify-center min-h-screen p-4">
          <div class="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
            <div class="text-center space-y-2">
              <svg class="h-10 w-10 mx-auto" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.83 21.56,11.4 21.35,11.1z" fill="#4285F4" />
                  <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.58c-0.91,0.61 -2.09,0.98 -3.1,0.98 -2.39,0 -4.41,-1.61 -5.13,-3.78H2.94v2.67C4.42,18.66 7.97,20.6 12,20.6z" fill="#34A853" />
                  <path d="M6.87,13.04a5.21,5.21 0 0 1 0,-3.3V7.07H2.94a8.88,8.88 0 0 0 0,8.64l3.93,-2.67z" fill="#FBBC05" />
                  <path d="M12,6.49c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,3.8 14.43,3.02 12,3.02 7.97,3.02 4.42,4.96 2.94,7.07l3.93,2.67c0.72,-2.17 2.74,-3.78 5.13,-3.78z" fill="#EA4335" />
                </g>
              </svg>
              <h1 class="text-xl font-bold tracking-tight text-slate-900">Active Directory Simulator</h1>
              <p class="text-xs text-slate-500">Sign in with Google to access the VERIFY Enterprise Portal</p>
            </div>

            <div class="space-y-4">
              <div class="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
                <span class="text-xs font-semibold text-indigo-800">🔒 Google OAuth Developer Sandbox Mode</span>
              </div>
              
              <div class="space-y-2">
                <label class="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">Select Linked Google Profile</label>
                <select id="sso_email_select" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none">
                  ${options}
                  <option value="__NEW__">-- Link a custom Google identity manually --</option>
                </select>
              </div>

              <div id="custom_google_profile" class="space-y-3 hidden border-t border-slate-100 pt-3">
                <div class="space-y-1.5">
                  <label class="block text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
                  <input type="text" id="g_name" placeholder="E.g. Lidya Tekle" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-[10px] font-bold text-slate-500 uppercase">Google Email</label>
                  <input type="email" id="g_email" placeholder="ltekle@bank.et" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-[10px] font-bold text-slate-500 uppercase">Target Role</label>
                  <select id="g_role" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none">
                    <option value="Admin">Chief Auditor (Admin)</option>
                    <option value="Manager">Senior Audit Manager</option>
                    <option value="Team Leader">Audit Leader</option>
                    <option value="Auditor">Field Auditor</option>
                    <option value="Auditee">Business Auditee</option>
                    <option value="Executive">Executive Board member</option>
                  </select>
                </div>
              </div>

              <button onclick="approveSign()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md">
                Authorize Google Access
              </button>
            </div>

            <p class="text-[10px] text-slate-450 text-center leading-normal">
              This simulated sandbox redirects and syncs via secure postMessage interfaces. If actual CLIENT_ID secrets are placed in environment variables, real Google Accounts login is executed automatically.
            </p>
          </div>

          <script>
            const select = document.getElementById("sso_email_select");
            const customDiv = document.getElementById("custom_google_profile");
            select.addEventListener("change", (e) => {
              if (e.target.value === "__NEW__") {
                customDiv.classList.remove("hidden");
              } else {
                customDiv.classList.add("hidden");
              }
            });

            function approveSign() {
              const selectedValue = select.value;
              let email = selectedValue;
              let name = select.options[select.selectedIndex].text.split(" (")[0];
              let isNew = false;
              let role = "Auditor";

              if (selectedValue === "__NEW__") {
                email = document.getElementById("g_email").value.trim();
                name = document.getElementById("g_name").value.trim();
                role = document.getElementById("g_role").value;
                isNew = true;
                if (!email || !name) {
                  alert("Please populate custom name and email addresses.");
                  return;
                }
              }

              const targetUrl = "/auth/callback?code=mock_code&email=" + encodeURIComponent(email) + "&name=" + encodeURIComponent(name) + "&isNew=" + isNew + "&role=" + encodeURIComponent(role);
              window.location.href = targetUrl;
            }
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    next(err);
  }
};

export const handleGoogleCallback = async (req, res, next) => {
  try {
    const { code, email, name, isNew, role } = req.query;
    let targetUser = null;

    if (code === "mock_code" && email) {
      const queryEmail = email;
      const queryName = name;
      
      let user = db.prepare("SELECT * FROM users WHERE email = ?").get(queryEmail);
      if (!user) {
        const newUserId = `usr-${Date.now()}`;
        const finalRole = role || "Auditor";
        db.prepare(`
          INSERT INTO users (id, name, email, role, department, active, password)
          VALUES (?, ?, ?, ?, 'General Audit Department', 1, 'Password123')
        `).run(newUserId, queryName, queryEmail, finalRole);
        user = {
          id: newUserId,
          name: queryName,
          email: queryEmail,
          role: finalRole,
          department: 'General Audit Department',
          active: 1
        };
      }
      targetUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        active: user.active === 1
      };
    } else if (code) {
      const host = req.get("host");
      const protocol = req.protocol;
      const redirectUri = `${protocol}://${host}/auth/callback`;
      const clientId = process.env.OAUTH_CLIENT_ID;
      const clientSecret = process.env.OAUTH_CLIENT_SECRET;

      const exchangeRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code"
        })
      });

      if (!exchangeRes.ok) {
        throw new Error(`Google OAuth exchange failed: ${await exchangeRes.text()}`);
      }

      const tokenData = await exchangeRes.json();
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });

      if (!userInfoRes.ok) {
        throw new Error("Failed to fetch Google user profile data info");
      }

      const gUser = await userInfoRes.json();
      const gEmail = gUser.email;
      const gName = gUser.name || gUser.given_name || "Google User";

      let user = db.prepare("SELECT * FROM users WHERE email = ?").get(gEmail);
      if (!user) {
        const newId = `usr-${Date.now()}`;
        db.prepare(`
          INSERT INTO users (id, name, email, role, department, active, password)
          VALUES (?, ?, ?, 'Auditor', 'General Audit Department', 1, 'Password123')
        `).run(newId, gName, gEmail);
        user = {
          id: newId,
          name: gName,
          email: gEmail,
          role: 'Auditor',
          department: 'General Audit Department',
          active: 1
        };
      }
      targetUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        active: user.active === 1
      };
    }

    if (!targetUser) {
      return res.send(`
        <html>
          <body>
            <script>
              alert("Login failed: could not resolve user profile from identity provider.");
              window.close();
            </script>
          </body>
        </html>
      `);
    }

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS', 
                user: ${JSON.stringify(targetUser)} 
              }, '*');
              window.close();
            } else {
              try {
                localStorage.setItem('audit_auth_user', JSON.stringify(${JSON.stringify(targetUser)}));
              } catch (e) {
                console.error("Failed to write to localStorage:", e);
              }
              window.location.href = '/';
            }
          </script>
          <div style="font-family: sans-serif; text-align: center; padding: 40px; color: #334155;">
            <h2 style="color: #4f46e5;">Authorization Granted!</h2>
            <p>Establishing secure workspace connection... This popup should close automatically.</p>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("[OAUTH_ERROR]", err);
    res.send(`
      <html>
        <body>
          <div style="font-family: sans-serif; text-align: center; padding: 40px; color: #ef4444;">
            <h2>Service Error occurred</h2>
            <p>${err.message}</p>
            <button onclick="window.close()">Close popup</button>
          </div>
        </body>
      </html>
    `);
  }
};
