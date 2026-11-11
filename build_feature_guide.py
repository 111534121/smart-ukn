"""Regenerate the public, metadata-only guide. Never reads runtime data or .env."""
import ast
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
# Human-facing feature groups and the API prefixes they implement.
FEATURES = [
    ('auth', '登入與身分驗證', '系統', '/api/auth|/api/visitor/register', '驗證帳密與身分，建立登入工作階段。'),
    ('dashboard', '學生首頁與請假', '學習', '/api/student/dashboard|/api/student/announcements|/api/student/leave-requests|/api/leave-requests', '整合學習資訊，送出請假並由有權限的人員審核。'),
    ('course', '修業進度與擋修', '學習', '/api/courses|/api/student/courses', '比對已修科目與先修規則，計算修業進度與擋修影響。'),
    ('retake', '重補修推薦', '學習', '/api/student/retake-recommendations|/api/admin/notify/retake', '比對未通過科目與開課班別，排除課表衝突並提供修課建議。'),
    ('plan', '選課檢查', '學習', '/api/campus/course-plan', '讀取開課資料，檢查所選課程的限制與衝突。'),
    ('graduation', '畢業門檻', '學習', '/api/student/graduation|/api/teacher/class-summary', '彙整學分與證照，計算畢業門檻達成情形。'),
    ('attendance', '班級與個人出缺勤', '導師班', '/api/teacher/class-attendance|/api/student/attendance|/api/admin/attendance', '讀取出缺勤紀錄，依規則計算提醒並處理通知。'),
    ('class', '我的導師班與學生總覽', '導師班', '/api/teacher/class-overview|/api/teacher/student-profile', '檢查導師班與學生授權，整合班級或學生的學習狀況。'),
    ('counseling', '導生關懷紀錄', '導師班', '/api/campus/counseling', '檢查班級與紀錄權限，儲存晤談、追蹤進度並提供匯出。'),
    ('warning', '學業預警', '學習', '/api/student/early-warning', '檢查查詢權限與授權，分析未通過科目和擋修風險。'),
    ('certs', '證照與競賽成果', '學習', '/api/campus/certs|/api/certificates|/api/competitions', '上傳成果並保存紀錄，由授權人員審核與統計。'),
    ('review', '學期自評表', '學習', '/api/self-review', '依登入學生與學期讀取、儲存或刪除自評內容。'),
    ('faculty', '教師專長與我的課表', '學習', '/api/faculty|/api/admin/faculty|/api/campus/teachers|/api/admin/teachers', '查詢教師專長、課表與辦公室資料，提供個人或管理端維護；教職員送出的老師名錄異動由管理員審核。'),
    ('assistant', '申請問題小幫手', '校務', '/api/assistant', '比對申請流程與規章，依設定產生問題回覆。'),
    ('rules', '智慧校規與搜尋', '校務', '/api/search|/api/feedback|/api/rules|/api/categories|/api/synonyms|/api/campus/rules', '接收關鍵字，比對規章與同義詞，回傳結果並記錄回饋。'),
    ('checklist', '行政申請流程', '校務', '/api/checklists|/api/checklist|/api/student/my-applications|/api/campus/checklist-docs|/api/campus/forms', '讀取申請步驟與應備文件，保存個人的勾選進度；表單可隨時查詢並加入常用。'),
    ('calendar', '行事曆與期限提醒', '校務', '/api/calendar|/api/academic-calendar|/api/deadlines|/api/school-calendar|/api/admin/school-calendar|/api/campus/calendar|/api/campus/my-events', '整合校曆、申辦期限與個人行程，依日期回傳事件。'),
    ('scholarship', '獎助學金檢核', '校務', '/api/scholarships|/api/admin/notify/scholarship-warning|/api/admin/scholarship-applications', '比對獎助學金條件與學生資料，回傳符合情況或發出提醒。'),
    ('services', '宿舍與總務申請', '校務', '/api/campus/dorm|/api/campus/reimburse|/api/campus/services', '檢查申請內容與權限，記錄送件及審核進度。'),
    ('reports', '報表與文件下載', '校務', '/api/campus/reports', '依報表種類與查詢條件整理資料，提供檢視或下載。'),
    ('rent', '教室與櫃子租借', '校園生活', '/api/campus/rooms|/api/campus/lockers|/api/campus/bookings', '查詢空間與時段，檢查借用限制後保存預約。'),
    ('map', '地圖、辦公室與交通', '校園生活', '/api/campus/map|/api/campus/locations|/api/campus/weather|/api/campus/traffic|/api/campus/crowd', '讀取校園地點或外部資訊，整理成地圖與生活資訊。'),
    ('links', '常用系統連結', '校園生活', '/api/links', '讀取或維護常用連結，供使用者開啟外部系統。'),
    ('notices', '班級通知與幹部紀錄', '導師班', '/api/campus/notices|/api/campus/groups|/api/campus/records', '檢查發送對象與班級權限，保存通知、群組及幹部紀錄。'),
    ('privacy', '個人偏好、授權與聯絡資料', '系統', '/api/me/preferences|/api/departments|/api/student/privacy-consent|/api/student/emergency-contact', '依帳號讀取或更新科系偏好、資料授權及緊急聯絡資料。'),
    ('anniversary', '校慶活動與祝福', '校園生活', '/api/anniversary|/api/admin/anniversary', '查詢活動與祝福內容，由管理端維護與審核。'),
    ('visits', '訪客預約與參訪', '校園生活', '/api/campus/visits', '查詢可預約時段，建立或取消參訪紀錄。'),
    ('affairs', '校務送件與獎學金資料', '校務', '/api/campus/affairs|/api/campus/scholarships', '查詢申辦資料、檢查送件內容並保存申請。'),
    ('messages', '校園公告、班級與師生聯繫', '導師班', '/api/campus/announcements|/api/campus/classes|/api/campus/broadcast|/api/campus/advisor-messages|/api/campus/meetings', '依身分與班級權限讀取公告、管理班級或傳遞訊息；開線上會議並以邀請或邀請碼加入。'),
    ('transport', '交通資訊與校園偏好', '校園生活', '/api/campus/transport|/api/campus/prefs', '提供交通資訊，讀取或儲存校園生活偏好。'),
    ('admin-cases', '行政案件工作台、補件與處室分工', '校務', '/api/campus/admin-cases', '學生送出申請後依類別分流；承辦處室可分派、要求補件、重新受理與結案，案件及附件依身分隔離。'),
    ('public-site', '公開網址、QR Code 與 LINE 分享', '系統', '/api/public-site', '使用固定公開首頁網址產生 QR Code 與 LINE 分享入口，不包含個人資料。'),
    ('admin', '管理、稽核與系統狀態', '系統', '/api/admin|/api/health|/api/stats|/api/staff/alerts|/api/faq|/api/student/moodle', '依端點檢查權限，處理管理查詢、系統檢查或外部平台連結。'),
]


def build():
    modules = {}
    paths = [ROOT / 'app.py', ROOT / 'public_portal.py', ROOT / 'admin_core.py']
    for directory in ('campus', 'faculty', 'self_review', 'assistant', 'anniversary', 'preferences', 'attendance', 'dashboard', 'curriculum', 'moodle_sync', 'school_calendar', 'applications', 'conduct', 'devmap', 'retake', 'scholarship_apply'):
        paths.extend((ROOT / directory).glob('*.py'))
    for path in sorted(paths):
        source = path.read_text(encoding='utf-8-sig')
        tree = ast.parse(source)
        modules[path.relative_to(ROOT).as_posix()] = (source, tree, {n.name: n for n in tree.body if isinstance(n, (ast.FunctionDef, ast.ClassDef))})
    schemas = {}
    for filename in ('smart_ukn.sql', 'init_db.py'):
        source = (ROOT / filename).read_text(encoding='utf-8-sig')
        for match in re.finditer(r'CREATE TABLE\s+(?:IF NOT EXISTS\s+)?`?(\w+)`?', source, re.I):
            schemas.setdefault(match[1], []).append({'file': filename, 'line': source[:match.start()].count('\n') + 1})

    def references(file, node):
        # Follow local function calls, explicit imports, and app.py dependency injection.
        todo, seen, tables, files, storage = [(file, node)], set(), {}, {}, set()
        while todo:
            filename, current = todo.pop()
            key = (filename, current.lineno)
            if key in seen:
                continue
            seen.add(key)
            files[key] = {'file': filename, 'line': current.lineno, 'function': current.name}
            source, tree, functions = modules[filename]
            for child in ast.walk(current):
                if isinstance(child, ast.Constant) and isinstance(child.value, str):
                    if re.fullmatch(r'[\w./-]+\.json', child.value):
                        storage.add(child.value)
                    for hit in re.finditer(r'\b(?:FROM|JOIN|INTO|UPDATE)\s+`?(\w+)`?', child.value, re.I):
                        name = hit[1]
                        if name in schemas:
                            tables[(name, filename, child.lineno)] = {'name': name, 'file': filename, 'line': child.lineno, 'schema': schemas[name]}
                if not isinstance(child, ast.Call):
                    continue
                if isinstance(child.func, ast.Attribute) and child.func.attr == 'section' and isinstance(child.func.value, ast.Name) and child.func.value.id == 'store' and child.args and isinstance(child.args[0], ast.Constant):
                    storage.add('data/campus_store.json → ' + str(child.args[0].value))
                name = child.func.id if isinstance(child.func, ast.Name) else None
                if name in functions:
                    todo.append((filename, functions[name]))
                if isinstance(child.func, ast.Attribute) and isinstance(child.func.value, ast.Name) and child.func.value.id == 'deps':
                    name = child.func.attr
                    if name in modules['app.py'][2]:
                        todo.append(('app.py', modules['app.py'][2][name]))
                if isinstance(child.func, ast.Name):
                    for imp in tree.body:
                        if not isinstance(imp, ast.ImportFrom) or not imp.module or imp.level:
                            continue
                        for alias in imp.names:
                            if (alias.asname or alias.name) != child.func.id:
                                continue
                            target = imp.module.replace('.', '/') + '.py'
                            if target in modules and alias.name in modules[target][2]:
                                todo.append((target, modules[target][2][alias.name]))
        return list(tables.values()), list(files.values()), sorted(storage)

    routes = []
    for filename, (source, tree, _) in modules.items():
        for node in tree.body:
            if not isinstance(node, ast.FunctionDef):
                continue
            for dec in node.decorator_list:
                if not isinstance(dec, ast.Call) or not isinstance(dec.func, ast.Attribute) or dec.func.attr != 'route' or not dec.args or not isinstance(dec.args[0], ast.Constant):
                    continue
                url = dec.args[0].value
                if not isinstance(url, str) or not url.startswith('/api/'):
                    continue
                methods = next((ast.literal_eval(k.value) for k in dec.keywords if k.arg == 'methods'), ['GET'])
                tables, files, storage = references(filename, node)
                routes.append(dict(url=url, methods=methods, file=filename, line=node.lineno, function=node.name, tables=tables, files=files, storage=storage))
    features = []
    assigned = set()
    front_paths = list((ROOT / 'static').glob('*.html')) + list((ROOT / 'static/js').glob('*.js'))
    for key, name, group, patterns, summary in FEATURES:
        prefixes = patterns.split('|')
        selected = [r for i, r in enumerate(routes) if i not in assigned and any(r['url'] == p or r['url'].startswith(p + '/') or (p.endswith('graduation') and r['url'].startswith(p + '-')) for p in prefixes)]
        assigned.update(i for i, r in enumerate(routes) if r in selected)
        frontend = []
        for path in front_paths:
            for number, line in enumerate(path.read_text(encoding='utf-8-sig').splitlines(), 1):
                if any(p in line for p in prefixes):
                    frontend.append({'file': path.relative_to(ROOT).as_posix(), 'line': number})
        features.append(dict(id=key, name=name, group=group, summary=summary, routes=selected, frontend=frontend))
    # Include any routes not covered by a menu feature, without dropping working APIs.
    remaining = [r for i, r in enumerate(routes) if i not in assigned]
    if remaining:
        features.append(dict(id='other', name='其他校園服務端點', group='系統', summary='依下方端點查看各項服務的實際處理程式。', routes=remaining, frontend=[]))
    data = {'features': features, 'routeCount': len(routes), 'schemaCount': len(schemas), 'schema': schemas}
    target = ROOT / 'static/feature-guide-data.js'
    target.write_text('window.FEATURE_GUIDE = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
    print(f'Guide: {len(features)} features, {len(routes)} routes, {len(schemas)} schema tables')
    return data


if __name__ == '__main__':
    build()
