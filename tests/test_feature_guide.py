"""The teaching guide must cover registered APIs and point to real source lines."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def guide():
    source = (ROOT / 'static/feature-guide-data.js').read_text(encoding='utf-8')
    return json.loads(source.removeprefix('window.FEATURE_GUIDE = ').rstrip().removesuffix(';'))


def test_guide_assets_and_no_home_entry(client):
    for path in ('/feature-guide.html', '/feature-guide-data.js', '/css/feature-guide.css', '/js/feature-guide.js'):
        response = client.get(path)
        assert response.status_code == 200
        response.close()
    # 頁首不再顯示「功能對照說明」連結，頁面本身仍可直接用網址開啟
    assert b'/feature-guide.html' not in client.get('/').data


def test_guide_covers_registered_business_routes(client):
    routes = [r for f in guide()['features'] for r in f['routes']]
    actual = {(r.rule, m) for r in client.application.url_map.iter_rules() if r.rule.startswith('/api/') for m in r.methods - {'HEAD', 'OPTIONS'}}
    documented = {(r['url'], m) for r in routes for m in r['methods']}
    assert actual == documented
    assert len(routes) == guide()['routeCount']


def test_guide_evidence_matches_source():
    data = guide()
    assert all(f['routes'] for f in data['features'])
    for feature in data['features']:
        for route in feature['routes']:
            lines = (ROOT / route['file']).read_text(encoding='utf-8-sig').splitlines()
            assert lines[route['line'] - 1].startswith('def ' + route['function'] + '(')
            for table in route['tables']:
                assert table['name'] in data['schema']
                for schema in table['schema']:
                    line = (ROOT / schema['file']).read_text(encoding='utf-8-sig').splitlines()[schema['line'] - 1]
                    assert table['name'] in line and 'CREATE TABLE' in line
    counseling = next(f for f in data['features'] if f['id'] == 'counseling')
    assert any(t['name'] == 'counseling_records' for r in counseling['routes'] for t in r['tables'])
    assert any('campus_store.json' in s for r in counseling['routes'] for s in r['storage'])
