"""官網行政單位名稱；以下申辦流程為可編修的操作示範，非正式規章。"""
SOURCE = 'https://web.ukn.edu.tw/m/412-1000-377.php'
WORK_ROLES = ('教職員', '處室承辦', '科助', '住宿管理員', '管理員')
DEPARTMENTS = [('LTC','長期照護學系'),('ECE','嬰幼兒保育學系'),('NUR','護理科（五專）'),('OPT','視光科（五專）'),
               ('BA','企業管理學系（科）'),('CS','資訊管理科（五專）'),('ANI','數位影視動畫科（五專）'),('ENG','應用外語科（五專）')]
GROUPS = [
    ('registration','教務處','註冊組','學籍證明申請'), ('curriculum','教務處','課務組','課務異動諮詢'),
    ('guidance','學生事務處','生活輔導組','生活輔導事項申辦'), ('activities','學生事務處','課外活動組','社團活動申請'),
    ('health','學生事務處','衛保組','校園健康服務諮詢'),
    ('affairs','總務處','事務組','設備報修申請'), ('cashier','總務處','出納組','繳費資料確認'),
]
UNITS = [
    ('academic', '教務處', '學籍證明申請', ['證明用途', '申請份數'], ['身分驗證資料'],
     [('學籍資料核對', ['核對在學身分', '確認申請用途']), ('證明製發', ['確認證明內容', '記錄交付方式'])]),
    ('student', '學生事務處', '獎助資料審查', ['申請項目', '資格說明'], ['申請表', '資格佐證'],
     [('資格初審', ['核對申請資格', '核對佐證資料']), ('審查結果確認', ['確認審查意見', '登錄辦理結果'])]),
    ('general', '總務處', '設備報修申請', ['設備位置', '故障情形'], ['故障照片（可於補件時補交）'],
     [('報修受理與派工', ['確認故障位置', '安排處理人員']), ('修繕與驗收', ['記錄處理情形', '確認設備恢復狀態'])]),
    ('research', '研究發展處', '實習文件審查', ['實習單位', '預計實習期間'], ['實習計畫', '單位聯繫資料'],
     [('實習資料檢核', ['確認實習資料', '確認聯繫窗口']), ('實習安排確認', ['確認安排與申請一致', '記錄後續聯繫事項'])]),
    ('secretary', '秘書室', '校務公文諮詢', ['來文主旨', '洽詢事項'], ['相關來文或說明'],
     [('收件與業務判別', ['確認洽詢內容', '確認承辦窗口']), ('回覆與歸檔', ['確認回覆內容', '保留辦理紀錄'])]),
    ('library', '資訊暨圖書中心', '校園帳號與資源服務', ['服務項目', '使用情境'], ['問題畫面或說明'],
     [('問題分類與身分確認', ['核對申請人身分', '確認服務項目']), ('服務處理', ['記錄處理步驟', '確認服務可使用']), ('回覆與追蹤', ['回覆使用方式', '記錄確認結果'])]),
    ('accounting', '會計室', '經費核銷資料檢核', ['經費來源', '金額與用途'], ['支出說明', '收據或發票影本'],
     [('憑證初核', ['確認支出用途', '確認憑證完整']), ('預算與科目核對', ['核對經費來源', '確認會計科目']), ('核對結果登錄', ['登錄檢核結果', '交付後續辦理事項'])]),
    ('personnel', '人事室', '教職員在職證明申請', ['申請用途', '領取方式'], ['身分確認資料'],
     [('人員資料確認', ['核對教職員身分', '確認用途']), ('證明製發與交付', ['核對證明內容', '登錄交付結果'])]),
    ('teaching', '教學發展暨資源中心', '學習資源支援申請', ['資源需求', '使用期間'], ['需求說明'],
     [('需求確認', ['確認需求與使用對象', '確認使用期間']), ('資源安排', ['確認可提供資源', '記錄安排內容'])]),
    ('admissions', '招生中心', '招生諮詢轉介', ['諮詢管道', '想了解的入學項目'], ['諮詢內容摘要'],
     [('諮詢分類', ['確認諮詢項目', '確認回覆窗口']), ('回覆與追蹤', ['提供資訊來源', '記錄後續追蹤'])]),
    ('sports', '體育室', '運動場地使用申請', ['使用場地', '日期與時段', '活動內容'], ['活動說明'],
     [('場地與時段確認', ['確認場地時段', '確認使用內容']), ('使用安排確認', ['告知使用須知', '登錄使用安排'])]),
    ('institutional', '校務研究辦公室', '校務統計資料需求', ['資料用途', '統計範圍'], ['需求與使用範圍說明'],
     [('需求與範圍確認', ['確認資料用途', '確認可提供範圍']), ('資料彙整', ['檢查統計口徑', '移除可識別資料']), ('結果交付', ['確認提供內容', '登錄交付紀錄'])]),
    ('international', '國際暨兩岸事務處', '交流活動諮詢申請', ['交流項目', '預計參與期間'], ['參與規劃'],
     [('交流需求確認', ['確認交流項目', '確認參與條件']), ('文件檢核', ['確認所需資料', '整理補充事項']), ('回覆與安排', ['提供安排說明', '記錄回覆結果'])]),
    ('highered', '高教深耕辦公室', '計畫活動資料檢核', ['計畫名稱', '活動內容'], ['活動計畫', '預期成果說明'],
     [('計畫對應確認', ['確認計畫項目', '確認活動目標']), ('成果資料檢核', ['核對成果資料', '記錄待補事項']), ('結果彙整', ['確認資料完整', '登錄彙整結果'])]),
    ('extension', '推廣教育中心', '推廣課程諮詢', ['課程主題', '預計參加時段'], ['課程需求說明'],
     [('課程需求確認', ['確認課程主題', '確認參與時段']), ('開課資訊回覆', ['確認可提供資訊', '登錄回覆結果'])]),
]
OFFICES = [u[1] for u in UNITS] + [parent+'／'+group for _,parent,group,_ in GROUPS] + [name+'／科辦公室' for _,name in DEPARTMENTS] + ['學生事務處／住宿管理']
# 舊版本的處室與申請名稱繼續接受，但畫面統一使用官網全名。
ALIASES = {'學務處': '學生事務處', '研發處': '研究發展處'}
LEGACY_KINDS = {'學籍與成績': '教務處', '獎助與學生事務': '學生事務處',
                '報帳與設備': '總務處', '實習與就業': '研究發展處', '其他諮詢': '秘書室'}


def canonical(office):
    return ALIASES.get(office, office)


def defaults():
    result = {}
    for code, office, kind, fields, documents, steps in UNITS:
        roles = list(WORK_ROLES) if code in ('accounting', 'personnel', 'institutional', 'highered') else ['學生', *WORK_ROLES]
        result[kind] = {'office': office, 'fields': fields, 'documents': documents, 'days': 7,
                        'roles': roles, 'is_demo': True,
                        'steps': [{'name': name, 'office': office, 'checks': checks} for name, checks in steps]}
    for code,parent,group,kind in GROUPS:
        unit = parent+'／'+group
        base = result.get(kind)
        name = kind+'（'+group+'）'
        if base:
            import copy
            spec = copy.deepcopy(base)
            spec['office'] = unit
            for step in spec['steps']: step['office'] = unit
        else:
            spec = {'office':unit,'fields':['申辦事項','希望協助的內容'],'documents':['相關說明資料'],
                    'days':7,'roles':['學生',*WORK_ROLES],'is_demo':True,
                    'steps':[{'name':group+'資料確認','office':unit,'checks':['核對申辦內容','確認資料完整']},
                             {'name':group+'辦理與回覆','office':unit,'checks':['登錄辦理結果','回覆申請人']}]}
        result[name] = spec
    # 各組的示範作業依實際承辦任務分開，不沿用處室層級的通用步驟。
    examples = {
        '學籍證明申請（註冊組）': (
            ['證明種類', '申請用途', '申請份數', '領取方式'], ['身分證明或委託資料'], 5,
            [('申請資料核對', ['核對申請人與學籍', '確認證明種類及份數']),
             ('製發與交付', ['確認證明內容', '記錄交付方式與日期'])]),
        '課務異動諮詢（課務組）': (
            ['學期', '課程名稱與代碼', '班級', '異動事項', '原因'], ['相關課表或異動說明'], 5,
            [('課務資料核對', ['核對課程與班級', '確認異動原因']),
             ('異動處理與回覆', ['記錄處理結果', '通知申請人確認'])]),
        '設備報修申請（事務組）': (
            ['設備位置', '設備類型', '故障情形', '可聯絡時間'], ['故障照片（可於補件時補交）'], 7,
            [('報修受理與派工', ['確認地點與故障情形', '記錄派工對象']),
             ('修繕與驗收', ['記錄修繕結果', '確認設備恢復使用'])]),
    }
    for name, (fields, documents, days, steps) in examples.items():
        spec = result[name]
        spec.update(fields=fields, documents=documents, days=days,
                    steps=[{'name': title, 'office': spec['office'], 'checks': checks}
                           for title, checks in steps])
    for _,dept in DEPARTMENTS:
        office = dept+'／科辦公室'
        result[dept+'科務申辦'] = {'office':office,'fields':['科務事項','需求說明'],'documents':['相關資料'],
            'days':5,'roles':['學生',*WORK_ROLES],'is_demo':True,
            'steps':[{'name':'科務資料確認','office':office,'checks':['確認所屬科系','核對申請內容']},
                     {'name':'科務協助與回覆','office':office,'checks':['記錄協助結果','回覆學生']}]}
        result[dept+'資料收件'] = {'office':office,
            'fields':['資料類別（實習／證照／其他）','資料名稱','學年學期','聯絡方式'],
            'documents':['應繳文件（依各科公告）'], 'days':5,
            'roles':['學生',*WORK_ROLES], 'is_demo':True,
            'steps':[{'name':'科助收件與缺件檢查','office':office,
                      'checks':['核對學生所屬科系','記錄已收文件與缺件項目']},
                     {'name':'完成收件與回覆','office':office,
                      'checks':['確認應繳資料齊全','回覆學生收件結果']}]}
    office = '學生事務處／住宿管理'
    result['住宿生活事項申辦'] = {'office':office,'fields':['宿舍與房號','住宿事項'],'documents':['相關說明'],
        'days':3,'roles':['學生',*WORK_ROLES],'is_demo':True,
        'steps':[{'name':'住宿事項確認','office':office,'checks':['確認住宿身分','核對住宿事項']},
                 {'name':'住宿處理與回覆','office':office,'checks':['登錄處理結果','回覆住生']}]}
    result['住宿異動申請'] = {'office':office,
        'fields':['目前宿舍與房號','申請事項（入住／換房／退宿）','希望生效日期','異動原因'],
        'documents':['相關佐證（依住宿管理單位要求）'], 'days':5,
        'roles':['學生',*WORK_ROLES], 'is_demo':True,
        'steps':[{'name':'住宿身分與空床確認','office':office,
                  'checks':['核對住宿身分','確認床位或退宿條件']},
                 {'name':'異動登記與通知','office':office,
                  'checks':['登記異動結果與日期','通知學生辦理後續事項']}]}
    result['住宿設備報修'] = {'office':office,
        'fields':['宿舍與房號','設備種類','故障情形','可進入維修時段'],
        'documents':['故障照片（可於補件時補交）'], 'days':3,
        'roles':['學生',*WORK_ROLES], 'is_demo':True,
        'steps':[{'name':'宿舍報修受理','office':office,
                  'checks':['確認房號與故障描述','安排維修處理']},
                 {'name':'修繕確認與回覆','office':office,
                  'checks':['記錄修繕結果','通知住宿學生確認']}]}
    return result


def demo_accounts():
    return [{'username': 'demo_office_' + code, 'full_name': office + '示範承辦人', 'office': office, 'role':'處室承辦','type':'office'}
            for code, office, *_ in UNITS] + [
            {'username':'demo_group_'+code,'full_name':parent+group+'組別帳號','office':parent+'／'+group,'role':'處室承辦','type':'group'}
            for code,parent,group,_ in GROUPS] + [
            {'username':'demo_assistant_'+code.lower(),'full_name':name+'科助','office':name+'／科辦公室',
             'role':'科助','type':'assistant','dept_id':code}
            for code,name in DEPARTMENTS] + [
            {'username':'dorm_demo','full_name':'宿舍管理示範員','office':'學生事務處／住宿管理','role':'教職員','type':'dorm'}]
