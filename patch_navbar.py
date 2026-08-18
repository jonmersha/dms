with open('frontend/src/components/SystemNavbar.tsx', 'r') as f:
    nav = f.read()

# 1. Public Web
nav = nav.replace(
    "{/* 1. Public Web */}\n                <Link",
    "{/* 1. Public Web */}\n                {!isSuperAdmin(user) && (\n                  <Link"
)
nav = nav.replace(
    "<Home size={18} /> Public Web\n                </Link>",
    "<Home size={18} /> Public Web\n                  </Link>\n                )}"
)

# 2. DMS
nav = nav.replace(
    "{user.role !== 'VISITOR' && (",
    "{user.role !== 'VISITOR' && !isSuperAdmin(user) && ("
)

# 3. Audit Workflow & Analytics (Remove ADMIN and superuser from list)
nav = nav.replace(
    "{(['CHIEF', 'DIRECTOR', 'TEAM_MANAGER', 'ADMIN'].includes(user.role) || user.is_superuser) && (",
    "{['CHIEF', 'DIRECTOR', 'TEAM_MANAGER'].includes(user.role) && ("
)

with open('frontend/src/components/SystemNavbar.tsx', 'w') as f:
    f.write(nav)
