"""Explicit one-case demo transport. Uses actual local data; only #55 may be changed."""
import base64, json, sys, urllib.request
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
sys.stdin.reconfigure(encoding='utf-8')
import app
from campus.common import store
assert '--case55-demo' in sys.argv, 'Explicit demo flag required'
app.get_db_connection = lambda: None
urllib.request.urlopen = lambda *a, **k: (_ for _ in ()).throw(OSError('offline preview'))
case = next(c for c in store.data['admin_cases'] if c['id']==55)
assert case['kind']=='成績單申請' and case['title'].startswith('【整合示範】') and case['applicant_username']=='student1'
clients = {}
def client(username):
    assert username in ('student1','demo_office_academic')
    if username not in clients:
        c = app.app.test_client()
        r = c.post('/api/auth/login',json={'username':username,'password':'123456'})
        assert r.status_code==200
        clients[username]=c
    return clients[username]
for line in sys.stdin:
    req=json.loads(line)
    try:
        method=req.get('method','GET')
        if method != 'GET' and req['path'] not in ('/api/campus/admin-cases/55','/api/campus/admin-cases/55/certificate/reissue'):
            result={'id':req['id'],'status':403,'type':'application/json','body':base64.b64encode(b'{"status":"error","message":"Only demo case 55 may be changed"}').decode()}
        else:
            opts={'method':method}
            if 'json' in req:opts['json']=req['json']
            elif req.get('body'):opts.update(data=base64.b64decode(req['body']),content_type=req.get('contentType'))
            r=client(req.get('as','student1')).open(req['path'],**opts)
            result={'id':req['id'],'status':r.status_code,'type':r.content_type,'body':base64.b64encode(r.data).decode(), 'headers':{k:v for k,v in r.headers.items() if k.lower() in ('content-disposition','cache-control','x-content-type-options')}}
    except Exception as e:result={'id':req['id'],'error':str(e)}
    print(json.dumps(result),flush=True)
