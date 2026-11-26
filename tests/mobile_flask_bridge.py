"""Serve the real Flask responses over stdio for network-isolated browser checks."""
import sys, json, base64, tempfile
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import urllib.request
def no_network(*args, **kwargs):
    raise OSError("Isolated browser test: external network disabled")
urllib.request.urlopen = no_network
import app
from campus.common import store
app.get_db_connection = lambda: None
if '--saved' not in sys.argv:
    store.data = {}
store.save = lambda: None
client = app.app.test_client()
account = next((arg.split('=', 1)[1] for arg in sys.argv if arg.startswith('--account=')),
               'teacher1' if '--teacher' in sys.argv else 'student1')
assert account in {'student1', 'student2', 'teacher1', 'demo_assistant_cs'}
assert client.post('/api/auth/login', json={'username':account,'password':'123456'}).status_code == 200
for line in sys.stdin:
    try:
        req = json.loads(line)
        r = client.open(req['path'], method='GET')
        result = {'id':req['id'], 'status':r.status_code, 'type':r.content_type, 'body':base64.b64encode(r.data).decode()}
        print(json.dumps(result), flush=True)
    except Exception as e:
        print(json.dumps({'id':req.get('id'), 'error':str(e)}), flush=True)
