with open('apps/lms/views.py', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "class LearningEpisodeViewSet(viewsets.ModelViewSet):" in line:
        start_idx = i
        break

for i in range(start_idx, len(lines)):
    if "if self.action in ['enroll', 'unenroll']:" in lines[i]:
        lines[i] = "        if self.action in ['complete']:\n"
        break

with open('apps/lms/views.py', 'w') as f:
    f.writelines(lines)
