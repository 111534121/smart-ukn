"""Real Flask routes via stdio for offline browser integration, all data isolated."""
import base64, json, sys, urllib.request
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
sys.stdin.reconfigure(encoding='utf-8')
import app
from campus.common import store
app.get_db_connection = lambda: None
urllib.request.urlopen = lambda *a, **k: (_ for _ in ()).throw(OSError('offline test'))
store.data = {} if '--saved' not in sys.argv else store.data
store.save = lambda: None
clients = {}
def client(username):
    if username not in clients:
        c = app.app.test_client()
        r = c.post('/api/auth/login',json={'username':username,'password':'admin123' if username in ('admin','system_admin','content_admin') else '123456'})
        assert r.status_code == 200
        clients[username] = c
    return clients[username]
for line in sys.stdin:
    req = json.loads(line)
    try:
        options = {'method':req.get('method','GET')}
        if 'json' in req: options['json'] = req['json']
        elif req.get('body'): options.update(data=base64.b64decode(req['body']),content_type=req.get('contentType'))
        r = client(req.get('as','student1')).open(req['path'],**options)
        result = {'id':req['id'],'status':r.status_code,'type':r.content_type,'body':base64.b64encode(r.data).decode()}
    except Exception as e:
        result = {'id':req['id'],'error':str(e)}
    print(json.dumps(result),flush=True)
