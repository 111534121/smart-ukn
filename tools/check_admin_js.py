import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('static/js/admin-core.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('submitUserForm')
if idx == -1:
    idx = text.find('/api/admin/users')
while idx != -1:
    print(f"--- at {idx} ---")
    print(text[max(0, idx-50):min(len(text), idx+400)])
    print('='*50)
    idx = text.find('/api/admin/users', idx+20)
