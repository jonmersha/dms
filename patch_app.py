with open('frontend/src/App.tsx', 'r') as f:
    code = f.read()

# 1. Add import
if 'SessionTimeoutManager' not in code:
    code = code.replace(
        "import { AnalyticsLayout } from './layouts/AnalyticsLayout';",
        "import { AnalyticsLayout } from './layouts/AnalyticsLayout';\nimport { SessionTimeoutManager } from './components/SessionTimeoutManager';"
    )

# 2. Wrap Routes
old_return = """  return (
    <Router>
      <Routes>"""

new_return = """  return (
    <Router>
      <SessionTimeoutManager timeoutMinutes={15} warningMinutes={1}>
        <Routes>"""

if old_return in code:
    code = code.replace(old_return, new_return)
    
    # Close it at the bottom
    old_end = """      </Routes>
    </Router>
  );"""
    new_end = """        </Routes>
      </SessionTimeoutManager>
    </Router>
  );"""
    code = code.replace(old_end, new_end)

with open('frontend/src/App.tsx', 'w') as f:
    f.write(code)

