# -*- coding: utf-8 -*-
"""
build_presentation.py
自動生成《校園智慧服務平台 (Smart UKN)》專業專題期中/期末成果審查簡報 (16:9 高畫質 PPTX)
包含完整 16 頁投影片、卡片式視覺排版、亮點指標與逐頁演講講稿 (Speaker Notes)。
"""

import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

# 1. 色彩定義
COLOR_BG = RGBColor(248, 250, 252)         # #F8FAFC 淺灰底
COLOR_NAVY = RGBColor(15, 23, 42)          # #0F172A 深夜藍/黑
COLOR_PRIMARY = RGBColor(30, 58, 138)      # #1E3A8A 康寧深藍
COLOR_BLUE = RGBColor(37, 99, 235)         # #2563EB 科技亮藍
COLOR_SKY = RGBColor(2, 132, 199)          # #0284C7 智慧青
COLOR_EMERALD = RGBColor(5, 150, 105)      # #059669 翠綠 (成功/通過)
COLOR_AMBER = RGBColor(217, 119, 6)        # #D97706 琥珀黃 (預警/洞察)
COLOR_CARD_BG = RGBColor(255, 255, 255)    # #FFFFFF 純白卡片
COLOR_CARD_BORDER = RGBColor(226, 232, 240)# #E2E8F0 邊框灰
COLOR_TEXT_MAIN = RGBColor(15, 23, 42)     # #0F172A 主文字
COLOR_TEXT_MUTED = RGBColor(100, 116, 139) # #64748B 次要文字
COLOR_LIGHT_BLUE = RGBColor(239, 246, 255) # #EFF6FF 淺藍背景

FONT_MAIN = "Microsoft JhengHei"

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    def set_slide_background(slide, color):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_header(slide, category, title, subtitle=None):
        # 頂部裝飾條
        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.45), Inches(0.4), Inches(0.08))
        bar.fill.solid()
        bar.fill.fore_color.rgb = COLOR_BLUE
        bar.line.fill.background()

        # 分類標籤 (Badge)
        badge_box = slide.shapes.add_textbox(Inches(1.3), Inches(0.35), Inches(4), Inches(0.3))
        tf_b = badge_box.text_frame
        tf_b.word_wrap = True
        p_b = tf_b.paragraphs[0]
        p_b.text = category.upper()
        p_b.font.name = FONT_MAIN
        p_b.font.size = Pt(10)
        p_b.font.bold = True
        p_b.font.color.rgb = COLOR_BLUE

        # 主標題
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.65), Inches(11.7), Inches(0.7))
        tf_t = title_box.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = title
        p_t.font.name = FONT_MAIN
        p_t.font.size = Pt(22)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_TEXT_MAIN

        # 副標題
        if subtitle:
            sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.3), Inches(11.7), Inches(0.4))
            tf_s = sub_box.text_frame
            tf_s.word_wrap = True
            p_s = tf_s.paragraphs[0]
            p_s.text = subtitle
            p_s.font.name = FONT_MAIN
            p_s.font.size = Pt(12)
            p_s.font.color.rgb = COLOR_TEXT_MUTED

    def add_card(slide, left, top, width, height, title, items, border_color=COLOR_BLUE, title_color=COLOR_PRIMARY, header_tag=None):
        # 卡片本體
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD_BG
        card.line.color.rgb = COLOR_CARD_BORDER
        card.line.width = Pt(1)

        # 頂部顏色標記條
        top_bar = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, Inches(0.08))
        top_bar.fill.solid()
        top_bar.fill.fore_color.rgb = border_color
        top_bar.line.fill.background()

        # 卡片文字區域
        tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), width - Inches(0.4), height - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True

        # 卡片標題
        p0 = tf.paragraphs[0]
        if header_tag:
            run_tag = p0.add_run()
            run_tag.text = f"[{header_tag}] "
            run_tag.font.name = FONT_MAIN
            run_tag.font.size = Pt(11)
            run_tag.font.bold = True
            run_tag.font.color.rgb = border_color

        run_title = p0.add_run()
        run_title.text = title
        run_title.font.name = FONT_MAIN
        run_title.font.size = Pt(14)
        run_title.font.bold = True
        run_title.font.color.rgb = title_color
        p0.space_after = Pt(8)

        # 內容列表
        for item in items:
            p = tf.add_paragraph()
            p.font.name = FONT_MAIN
            p.font.size = Pt(11)
            p.space_after = Pt(4)
            p.level = 0
            if isinstance(item, tuple):
                lead, desc = item
                r_lead = p.add_run()
                r_lead.text = f"• {lead}："
                r_lead.font.bold = True
                r_lead.font.color.rgb = COLOR_TEXT_MAIN
                r_desc = p.add_run()
                r_desc.text = desc
                r_desc.font.color.rgb = COLOR_TEXT_MUTED
            else:
                r = p.add_run()
                r.text = f"• {item}"
                r.font.color.rgb = COLOR_TEXT_MAIN

    # ==========================================
    # SLIDE 1: 專題成果發表封面
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, COLOR_NAVY)

    # 封面頂部副標 / 標籤
    tag_box = s1.shapes.add_textbox(Inches(1.2), Inches(1.2), Inches(10), Inches(0.4))
    p = tag_box.text_frame.paragraphs[0]
    p.text = "111 級畢業班專題製作成果審查 ｜ 資訊軟體開發"
    p.font.name = FONT_MAIN
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = COLOR_SKY

    # 封面主標題
    title_box = s1.shapes.add_textbox(Inches(1.2), Inches(1.7), Inches(11), Inches(1.6))
    tf = title_box.text_frame
    tf.word_wrap = True
    p1 = tf.paragraphs[0]
    p1.text = "校園智慧服務平台"
    p1.font.name = FONT_MAIN
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = RGBColor(255, 255, 255)

    p2 = tf.add_paragraph()
    p2.text = "Smart UKN — 全方位校務決策、多角色生活服務與智慧中樞整合平臺"
    p2.font.name = FONT_MAIN
    p2.font.size = Pt(18)
    p2.font.color.rgb = RGBColor(148, 163, 184)
    p2.space_before = Pt(8)

    # 封面特色徽章
    badges = [
        ("62 張標準資料表", COLOR_BLUE),
        ("2,689 項自動化測試 100% 通過", COLOR_EMERALD),
        ("4 大 AI 決策預警洞察", COLOR_AMBER),
        ("全校會議時段衝突演算", COLOR_SKY)
    ]
    bx = 1.2
    for b_text, b_color in badges:
        badge_shape = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(bx), Inches(3.6), Inches(2.5), Inches(0.45))
        badge_shape.fill.solid()
        badge_shape.fill.fore_color.rgb = RGBColor(30, 41, 59)
        badge_shape.line.color.rgb = b_color
        badge_shape.line.width = Pt(1.5)
        bp = badge_shape.text_frame.paragraphs[0]
        bp.text = b_text
        bp.alignment = PP_ALIGN.CENTER
        bp.font.name = FONT_MAIN
        bp.font.size = Pt(10)
        bp.font.bold = True
        bp.font.color.rgb = RGBColor(241, 245, 249)
        bx += 2.65

    # 底部組員資訊卡片
    info_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(4.5), Inches(10.9), Inches(2.2))
    info_card.fill.solid()
    info_card.fill.fore_color.rgb = RGBColor(30, 41, 59)
    info_card.line.color.rgb = RGBColor(51, 65, 85)

    itf = info_card.text_frame
    itf.word_wrap = True

    ip0 = itf.paragraphs[0]
    ip0.text = "【專題團隊與指導資訊】"
    ip0.font.name = FONT_MAIN
    ip0.font.size = Pt(13)
    ip0.font.bold = True
    ip0.font.color.rgb = COLOR_SKY
    ip0.space_after = Pt(8)

    members = [
        ("專題組長／架構設計", "王博慶", "111534123", "AI 決策預警中樞、線上會議時段衝突、系統安全防呆、DB 3NF 架構治理"),
        ("核心組員／學生體驗", "張晴茹", "111534117", "個人化首頁、畢業門檻雷達圖、獎助學金比對、宿舍床位選填、置物櫃登記"),
        ("核心組員／教學行政", "陳奕臻", "111534121", "動態課表、線上多關卡電子簽章、導生關懷晤談、班級推播回執、活動簽到"),
        ("核心組員／校務行政", "呂泑禎", "111534130", "臨時停課調課通知 (course_changes)、校曆同步、知識庫法規管理、常用表單下載")
    ]
    for role, name, sid, duty in members:
        ip = itf.add_paragraph()
        ip.font.name = FONT_MAIN
        ip.font.size = Pt(11)
        r1 = ip.add_run()
        r1.text = f"{name} ({sid}) ｜ {role}："
        r1.font.bold = True
        r1.font.color.rgb = RGBColor(255, 255, 255)
        r2 = ip.add_run()
        r2.text = f" {duty}"
        r2.font.color.rgb = RGBColor(203, 213, 225)

    ip_f = itf.add_paragraph()
    ip_f.text = "指導教授：彭賓鈺 老師  ｜  學校科系：康寧大學 資訊管理科 111 級  ｜  發表日期：中華民國 115 年 11 月"
    ip_f.font.name = FONT_MAIN
    ip_f.font.size = Pt(11)
    ip_f.font.color.rgb = RGBColor(148, 163, 184)
    ip_f.space_before = Pt(8)

    s1.notes_slide.notes_text_frame.text = (
        "【開場講稿】：\n"
        "各位指導老師、審查委員好，我們是 111 級資訊管理科專題組，組員包括張晴茹、陳奕臻、王博慶與呂泑禎，指導老師為彭賓鈺老師。\n"
        "今天由我代表全體組員向各位報告我們的專題成果——《校園智慧服務平台 (Smart UKN)》。\n"
        "本平台以全校 7 大角色的一站式校務生活服務為核心，不僅完成了 62 張標準資料表的 3NF 資料庫治理，更在管理端實作了前瞻性的『AI 智慧決策預警』與『線上會議時段衝突排程演算』。目前全系統 2,689 項自動化測試 100% 通過，功能全數上線就緒。"
    )

    # ==========================================
    # SLIDE 2: 專題背景與現行校園痛點分析
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, COLOR_BG)
    add_header(s2, "Background & Motivation", "校園服務現行痛點與專題研發動機", "分析現行各系統分散、法規查找困難、紙本流程冗長及缺乏主動預警決策之核心問題")

    pain_points = [
        ("痛點一：資訊分散與法規孤島", [
            ("法規規章多為 PDF", "學則、修課、考試規定分散於不同處室網頁，學生難以查找關聯條文"),
            ("口語與官方詞彙落差", "學生常用口語（如「當掉」、「重修」、「退選」）搜尋無法命中官方學則規章"),
            ("資訊孤島現象", "公告、校曆、活動、獎助學金各自獨立，缺乏單一匯聚入口")
        ], COLOR_BLUE, COLOR_PRIMARY, "資訊查找"),
        ("痛點二：紙本申辦流程冗長低效", [
            ("跨處室往返奔波", "補考、休學、折抵或器材租借須持紙本跑遍導師、系主任與各行政處室"),
            ("簽核進度不透明", "學生送件後無法即時追蹤審核關卡進度，缺件退件溝通成本高"),
            ("無紙化程度不足", "缺乏具備權限驗證與印鑑追蹤的動態電子簽章流轉機制")
        ], COLOR_SKY, COLOR_PRIMARY, "申辦流程"),
        ("痛點三：師生互動與生活服務割裂", [
            ("班級通知缺乏回執", "導師重要公告無法精準掌握誰看過、誰沒看過，難以及時催簽或提醒"),
            ("晤談紀錄隱私外洩風險", "學生身心、學業輔導紀錄缺乏嚴密之個資權限隔離保護"),
            ("宿舍與生活預約分散", "床位抽籤、置物櫃租借、訪客預約各自為政，缺乏統合管理")
        ], COLOR_EMERALD, COLOR_PRIMARY, "生活服務"),
        ("痛點四：行政決策被動且缺乏預警", [
            ("缺乏前瞻預警", "學生缺課達 1/3 扣考或先修擋修斷鏈，往往等期末成績出來才發現延畢"),
            ("會議衝突難協調", "跨處室視訊會議缺乏時段重疊衝突偵測演算法，容易撞期"),
            ("管理權限防呆脆弱", "缺乏全站防誤刪與中文密碼防呆，歷史操作缺乏不可篡改審計軌跡")
        ], COLOR_AMBER, COLOR_PRIMARY, "管理決策")
    ]

    for idx, (title, items, border_c, title_c, tag) in enumerate(pain_points):
        row = idx // 2
        col = idx % 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.85 + row * 2.65)
        add_card(s2, x, y, Inches(5.75), Inches(2.45), title, items, border_c, title_c, tag)

    s2.notes_slide.notes_text_frame.text = (
        "【第 2 頁講稿】：\n"
        "在專題啟動之初，我們深度訪談了康寧校園內的學生、導師與行政同仁，歸納出四大關鍵痛點：\n"
        "第一，資訊分散且多為靜態 PDF，學生常用口語關鍵字搜尋往往找不到對應規章。\n"
        "第二，紙本申辦流程往返奔波，缺乏透明的線上簽核與電子簽章追蹤。\n"
        "第三，生活服務零散割裂，導師發送重要通知無法得知閱讀回執，導生晤談紀錄更需要嚴格的隱私隔離。\n"
        "第四，最關鍵的是管理端：傳統校務系統多半是『事後記錄』，缺乏主動的 AI 擋修扣考預警，跨處室會議也經常發生時段衝突。\n"
        "這就是 Smart UKN 平台致力解決的核心問題。"
    )

    # ==========================================
    # SLIDE 3: 系統核心目標與整體技術架構
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, COLOR_BG)
    add_header(s3, "Architecture & Standards", "系統核心架構與技術棧規劃", "遵循現代軟體工程標準：響應式 SPA + RESTful API + 3NF 資料庫 + 嚴密 RBAC 權限體系")

    layers = [
        ("前端展示層 (Presentation Layer)", [
            ("多裝置響應式架構", "HTML5 / Vanilla JS / CSS3 現代卡片流體式 UI，自適應手機與桌面端"),
            ("PWA 離線漸進支援", "Service Worker (v54 快取策略)，支援 Android/iOS 加入主畫面離線運作"),
            ("前端安全防呆機制", "密碼輸入即時全形/中文攔截防呆、身分標籤動態清洗、權限按鈕動態隱藏"),
            ("輕量高效無冗餘依賴", "零笨重大型框架負擔，首屏載入速度小於 0.8 秒，極致流暢體驗")
        ], COLOR_BLUE, COLOR_PRIMARY, "前端 SPA + PWA"),
        ("後端服務層 (Application Service Layer)", [
            ("Python Flask RESTful API", "模組化 Blueprint 設計（Auth, Campus, Applications, Admin Core, Insights）"),
            ("嚴格 RBAC 角色矩陣", "涵蓋 7 大身分：學生、家長、教師、導師、行政、科助與超級管理員"),
            ("AI 決策與預警引擎", "內建多維度交叉推論演算法：擋修鏈追蹤、扣考預警、口語同義詞自主學習"),
            ("會議衝突偵測排程器", "實現 O(N log N) 區間排程重疊演算法，實時揪出跨處室時段衝突")
        ], COLOR_SKY, COLOR_PRIMARY, "後端微服務"),
        ("資料持久層 (Data Persistence Layer)", [
            ("MySQL / MariaDB 3NF", "全數 62 張正規化實體資料表，徹底消除遞移相依與資料冗餘"),
            ("36 條實體外鍵約束", "100% 外鍵防護無孤立子鍵，嚴格阻絕 #1452 資料不一致錯誤"),
            ("高效雙向索引設計", "主鍵、外鍵、班級名稱與日期複合索引，查詢效能達毫秒級"),
            ("真實生產級種子數據", "內含 75 位學生、922 筆歷年學分、161 筆學生紀錄、97 位使用者")
        ], COLOR_EMERALD, COLOR_PRIMARY, "資料庫 3NF"),
        ("安全與審計層 (Security & Audit Layer)", [
            ("密碼雜湊防護", "Werkzeug scrypt 現代高強度加密算法，杜絕明文密碼洩漏"),
            ("admin 帳號保護鎖定", "超級管理員帳號禁止刪除、停用或指派私有處室，確保系統永續運作"),
            ("不可篡改 Audit Log", "完整記錄所有重要實體異動（操作者、IP、變更前/後 JSON、時間戳記）"),
            ("全站 56 項自動化體檢", "內建端點健康診斷中樞，一鍵即時檢測系統各子模組健康度")
        ], COLOR_AMBER, COLOR_PRIMARY, "資安與審計")
    ]

    for idx, (title, items, border_c, title_c, tag) in enumerate(layers):
        x = Inches(0.8 + idx * 2.95)
        y = Inches(1.85)
        add_card(s3, x, y, Inches(2.85), Inches(5.1), title, items, border_c, title_c, tag)

    s3.notes_slide.notes_text_frame.text = (
        "【第 3 頁講稿】：\n"
        "本平台的技術架構嚴格遵循標準軟體工程規範：\n"
        "前端採用原生現代 SPA 搭配 PWA 技術，使用者可以將 Smart UKN 直接『加入手機主畫面』，體驗如同原生 App；\n"
        "後端採用 Python Flask RESTful API，以模組化 Blueprint 拆分業務邏輯，並內建我們自研的 AI 決策推論引擎與會議時段衝突演算法；\n"
        "資料庫層經由全面正規化治理，達到 62 張標準資料表、36 條無暇外鍵約束；\n"
        "最外層更築起密碼防呆、admin 帳號誤刪鎖定與不可篡改 Audit Log，確保全校資料的安全與合規。"
    )

    # ==========================================
    # SLIDE 4: 系統核心功能全景地圖
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, COLOR_BG)
    add_header(s4, "Feature Landscape", "系統核心功能全景地圖 (四大模組 × 七大角色)", "涵蓋超過 30+ 項完整校務與生活功能，貫穿學生入學、修課、申辦、生活到畢業全生命週期")

    modules = [
        ("一、學生智慧生活服務模組", [
            ("個人首頁與動態課表", "週課表視覺化呈現、空堂查詢、上課教室與授課教師"),
            ("課程地圖與修課檢視", "專業必修/選修學分達成率、先修後修擋修圖解"),
            ("畢業門檻審查雷達圖", "學業成績 GPA、操行、證照、服務學習門檻進度"),
            ("獎助學金智慧比對", "依身分條件（低收/原民/成績）自動推薦符合項目"),
            ("宿舍床位與置物櫃申辦", "多階段線上抽籤、床位選填、校園置物櫃租借"),
            ("口語化校規法規搜尋", "同義詞對照引擎，口語自動轉換官方規章條文")
        ], COLOR_BLUE, COLOR_PRIMARY, "學生端"),
        ("二、導師與教學工作台模組", [
            ("班級精準通知與催簽", "推播班級公告，實時掌握學生已讀/未讀並支援催簽"),
            ("導生關懷晤談紀錄", "建立面談/線上晤談紀錄，追蹤狀態，個資權限隔離"),
            ("班級幹部與群組管理", "動態維護班級幹部名冊、職務指派與專屬群組設定"),
            ("操行成績與獎懲審核", "日常表現加減分評定、獎懲歷程與缺曠統計連動"),
            ("臨時停調課即時推播", "教師線上發布停調課通知，班級即時收到推播")
        ], COLOR_SKY, COLOR_PRIMARY, "教師/導師端"),
        ("三、行政作業與線上申辦模組", [
            ("線上多關卡電子簽章", "補考、折抵、休退學表單，依序送導師/主任/處室蓋章"),
            ("動態電子印章機制", "各級主管專屬電子印鑑章，簽核覆核留下時戳歷程"),
            ("校園活動與報名核銷", "活動發布、名額管控、線上候補、QR Code 簽到"),
            ("重要規章與報表下載", "依角色權限過濾表單檔案、下載統計與常用收藏"),
            ("訪客預約與參訪登記", "校外人士參訪線上申請、名額容量管控與審核")
        ], COLOR_EMERALD, COLOR_PRIMARY, "行政人員端"),
        ("四、系統管理員與 AI 決策中樞", [
            ("AI 決策預警洞察中樞", "四大 AI 模型：擋修鏈斷裂、缺課扣考、同義詞自主採納"),
            ("全校線上會議中控台", "Jitsi 視訊整合、時段衝突重疊演算法、穿透審查名單"),
            ("帳號管理與權限矩陣", "RBAC 角色指派、admin 防誤刪鎖定、中文密碼防呆"),
            ("不可篡改 Audit Log", "完整記錄操作人、IP、變更前/後 JSON 與時間戳記"),
            ("全站 56 項自動化體檢", "一鍵即時診斷 API、資料庫連線、安全策略與快取")
        ], COLOR_AMBER, COLOR_PRIMARY, "系統管理員")
    ]

    for idx, (title, items, border_c, title_c, tag) in enumerate(modules):
        row = idx // 2
        col = idx % 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.85 + row * 2.65)
        add_card(s4, x, y, Inches(5.75), Inches(2.45), title, items, border_c, title_c, tag)

    s4.notes_slide.notes_text_frame.text = (
        "【第 4 頁講稿】：\n"
        "這張投影片是本專題的『功能全景地圖』，涵蓋四大模組、三十餘項功能：\n"
        "第一區塊是學生生活服務：從個人課表、修課地圖、畢業門檻雷達圖到宿舍床位與置物櫃線上登記；\n"
        "第二區塊是導師工作台：提供具備已讀未讀回執的班級通知、高隱私度的導生晤談紀錄與操行評定；\n"
        "第三區塊是行政線上申辦：具備多關卡階層式電子印鑑章簽核、活動候補簽到與臨時調課推播；\n"
        "第四區塊是超級管理員中樞：具備 AI 決策洞察、全校會議衝突排程、審計日誌與全站自動化體檢。"
    )

    # ==========================================
    # SLIDE 5: 學生端亮點 — 智慧修課與畢業門檻審查
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, COLOR_BG)
    add_header(s5, "Student Academics", "學生端亮點：個人化智慧課表與畢業門檻審查", "提供即時修課檢視、先修擋修視覺化圖解、多維度畢業門檻雷達圖與獎助學金比對")

    cards_s5 = [
        ("個人化動態課表與空堂查詢", [
            ("週課表即時渲染", "以週為單位直觀呈現每節次課程名稱、授課教師與上課教室"),
            ("空堂智慧分析", "自動標示每日無課時段，方便學生規劃自主學習、圖書館自習或社團活動"),
            ("課表隨身攜帶", "支援加入手機主畫面，手機即開即查，下課換教室不再迷路"),
            ("課務異動同步", "整合臨時停調課通知，課堂變更第一時間於課表上方醒目提示")
        ], COLOR_BLUE, COLOR_PRIMARY, "動態課表"),
        ("課程地圖與先修擋修圖解", [
            ("全系課程路徑樹", "完整收錄資管科各學期專業必修、專業選修、共同必修與通識課程"),
            ("擋修規則嚴密校驗", "如：修習『進階程式設計』前必須先通過『基礎程式設計』，視覺化高亮標記"),
            ("修課進度即時檢視", "已及格綠色標記、未及格紅色警示、當期修習中藍色標記"),
            ("避免盲目選課", "讓學生清楚掌握四年/五年間的修課順序，杜絕選錯課程導致延畢")
        ], COLOR_SKY, COLOR_PRIMARY, "修課地圖"),
        ("多維度畢業門檻即時審查", [
            ("學分達成率雷達圖", "動態計算專業必修、專業選修、通識學分累計值與畢業標準差距"),
            ("四大學位標準檢視", "畢業總學分 (128/220)、操行成績標準、專業證照點數、服務學習時數"),
            ("預警標籤即時提示", "當學分缺口過大時，首頁自動出現『⚠️ 畢業學分不足預警』"),
            ("歷年成績明細查詢", "完整調閱歷學期修課科目、原始成績、GP 與及格註記")
        ], COLOR_EMERALD, COLOR_PRIMARY, "畢業審查"),
        ("獎助學金智慧比對與推薦", [
            ("條件自動媒合引擎", "自動比對學生成績 GPA、操行、學期與特殊身分別（低收/中低收/原住民）"),
            ("一覽式申請資訊", "彙整金額、申請期限、應備證明文件與承辦處室窗口"),
            ("符合資格高亮標籤", "符合條件者顯示『✅ 符合申請條件』，不再錯過任何助學資源"),
            ("無紙化線上導引", "直接連結申請表單下載或線上登記頁面，減少行政臨櫃往返")
        ], COLOR_AMBER, COLOR_PRIMARY, "獎助學金")
    ]

    for idx, (title, items, border_c, title_c, tag) in enumerate(cards_s5):
        row = idx // 2
        col = idx % 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.85 + row * 2.65)
        add_card(s5, x, y, Inches(5.75), Inches(2.45), title, items, border_c, title_c, tag)

    s5.notes_slide.notes_text_frame.text = (
        "【第 5 頁講稿】：\n"
        "在學生端的核心亮點上，我們解決了學生最關心的『課表』與『能否順利畢業』：\n"
        "課表模組除了渲染每週上課教室，更能自動標示空堂時段；\n"
        "課程地圖模組則以視覺化方式呈現先修與後修擋修鏈，避免學生盲目選課；\n"
        "畢業審查模組即時統計必修、選修與通識學分差距，並繪製達成率雷達圖，若有不足提早預警；\n"
        "獎助學金模組更會依據學生的 GPA、操行及身分別（如低收入戶、原住民），自動標示『符合申請資格』，大幅提升助學資訊的觸及率。"
    )

    # ==========================================
    # SLIDE 6: 學生端亮點 — 校園生活與資源申辦
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6, COLOR_BG)
    add_header(s6, "Campus Life", "學生端亮點：校園生活服務與口語化法規搜尋", "落實智慧宿舍選填、置物櫃線上租借、常用規章下載與同義詞對照搜尋")

    cards_s6 = [
        ("宿舍床位線上選填與抽籤管理", [
            ("多階段申請流程", "涵蓋身分資格審查、線上抽籤、中籤床位自選與繳費確認階段"),
            ("房型與床位動態狀態", "即時呈現各棟宿舍、各房號剩餘床位（A/B/C/D床），防重複選填"),
            ("舍監管理端聯動", "宿舍幹部可在後台即時審核入住資格，匯出寢室名冊與簽核報表"),
            ("申辦進度即時可視", "學生登入即可查看自身申請狀態（待審核、已中籤、已分配）")
        ], COLOR_BLUE, COLOR_PRIMARY, "宿舍管理"),
        ("校園置物櫃線上租借與登記", [
            ("大樓區域櫃位圖", "收錄教學大樓 A、C 棟各樓層置物櫃分佈與編號"),
            ("租借狀態一目了然", "綠色代表可租借、灰色代表已租用，支援在線選櫃送出"),
            ("租期自動控管", "系統記錄租借起始與歸還期限，屆期前自動於學生首頁提醒歸還"),
            ("免臨櫃人工登記", "取代傳統在學務處大排長龍人工填單，提升行政辦事效率")
        ], COLOR_SKY, COLOR_PRIMARY, "置物櫃"),
        ("口語化校規同義詞搜尋引擎", [
            ("同義詞智慧映射", "輸入學生口語如『被當』自動對照『成績不及格』、『重補修辦法』"),
            ("輸入『不上課』對照『請假規則』", "輸入『休學』對照『保留學籍與退費標準』，徹底消除搜尋壁壘"),
            ("精準法規出處引註", "檢索結果附帶標準規章名稱、出處文件、條號與頁碼，杜絕假訊息"),
            ("未命中詞自主收錄", "搜尋未命中的關鍵字自動記錄，管理員可一鍵採納擴充字典")
        ], COLOR_EMERALD, COLOR_PRIMARY, "知識庫搜尋"),
        ("表單下載專區與常用文件收藏", [
            ("分類權限過濾", "依教務、學務、總務等處室分類，並依身分過濾公開與專屬表單"),
            ("一鍵即時下載", "提供補考申請表、修業證明、折抵學分表等標準格式檔案"),
            ("個人常用收藏夾", "常用表單支援點擊『星號收藏』，收錄至個人專區隨取隨用"),
            ("下載歷程審計", "系統記錄各文件下載次數與時戳，做為處室文件熱門度分析")
        ], COLOR_AMBER, COLOR_PRIMARY, "表單專區")
    ]

    for idx, (title, items, border_c, title_c, tag) in enumerate(cards_s6):
        row = idx // 2
        col = idx % 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.85 + row * 2.65)
        add_card(s6, x, y, Inches(5.75), Inches(2.45), title, items, border_c, title_c, tag)

    s6.notes_slide.notes_text_frame.text = (
        "【第 6 頁講稿】：\n"
        "除了課業外，生活日常也是 Smart UKN 的重心：\n"
        "在住宿方面，我們實現了多階段宿舍申請與線上床位即時選填，不再需要紙本排隊抽籤；\n"
        "在置物櫃方面，學生可在線查看 A 棟、C 棟各樓層置物櫃即時使用狀態並直接送出租借；\n"
        "在法規知識庫方面，我們設計了『同義詞映射引擎』，學生輸入『當掉』、『請假』等口語詞，系統能精準對照出官方學則規章與條號；\n"
        "表單專區更提供一鍵下載與個人星號收藏功能，全方位打造數位化校園生活。"
    )

    # ==========================================
    # SLIDE 7: 導師與教學工作台 — 班級輔導與精準通知
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7, COLOR_BG)
    add_header(s7, "Teacher Workbench", "導師工作台：班級精準推播、晤談關懷與操行評定", "專為導師與授課教師設計的一站式輔導後台，嚴格隔離隱私數據，掌握全班動態")

    cards_s7 = [
        ("班級通知推播與閱讀回執追蹤", [
            ("精準群體推播", "導師可針對所屬輔導班級發布緊急事項、週會提醒與重要通知"),
            ("已讀/未讀統計儀表板", "即時列出全班各學生的查閱時戳，精確掌握『誰看了、誰還沒看』"),
            ("一鍵提醒催簽", "針對尚未閱讀的學生，支援一鍵發送催讀催簽提醒，確保訊息必達"),
            ("重要附件安全附掛", "支援上傳相關簡章或佐證檔案，僅限班級成員下載")
        ], COLOR_BLUE, COLOR_PRIMARY, "班級推播"),
        ("導生關懷晤談紀錄與隱私權限隔離", [
            ("晤談多管道記錄", "支援記錄面談、電話、線上或家長聯繫等多種晤談形式與主題（學業/身心/生活）"),
            ("追蹤機制與待辦提醒", "標記『需要追蹤』與預定追蹤日期，首頁自動列入待辦工作清單"),
            ("高規格隱私保護", "晤談內容屬高敏個資，系統設有防護罩，學生與家長端完全不可見"),
            ("班級跨期追蹤", "記錄學生各學期的成長歷程與輔導紀錄，做為畢業關懷的重要依據")
        ], COLOR_SKY, COLOR_PRIMARY, "晤談輔導"),
        ("班級幹部名冊與輔導群組管理", [
            ("班級幹部動態指派", "靈活指派班代、副班代、學藝、風紀等幹部職務與任期"),
            ("職務權限差異化", "班代可協助導師維護班務，群組設定動態連動，落實自治管理"),
            ("群組成員名冊維護", "支援將特定學生加入輔導專案群組，方便分組教學與專案追蹤"),
            ("幹部紀錄匯出", "學期結束可一鍵匯出幹部名單，直接送交學務處作為嘉獎登記依據")
        ], COLOR_EMERALD, COLOR_PRIMARY, "班級治理"),
        ("操行成績評核與獎懲審核聯動", [
            ("加減分即時登錄", "依學生日常優良事蹟或違規行為登錄操行加減分，理由充分記載"),
            ("缺曠出勤自動扣分", "交叉比對學生出缺勤紀錄，自動計算曠課扣分建議，避免人工疏漏"),
            ("學期操行即時試算", "基準分 80 分起算，隨時試算最終操行等第，及早關懷瀕臨不及格學生"),
            ("獎懲案件歷程紀錄", "申誡、小過、嘉獎等紀錄留痕，提供導師最客觀的輔導數據依據")
        ], COLOR_AMBER, COLOR_PRIMARY, "操行評核")
    ]

    for idx, (title, items, border_c, title_c, tag) in enumerate(cards_s7):
        row = idx // 2
        col = idx % 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.85 + row * 2.65)
        add_card(s7, x, y, Inches(5.75), Inches(2.45), title, items, border_c, title_c, tag)

    s7.notes_slide.notes_text_frame.text = (
        "【第 7 頁講稿】：\n"
        "在教學與導師端，我們打造了高效率的『導師輔導工作台』：\n"
        "第一，班級通知支援『閱讀回執儀表板』，導師發出重要公告後，可以清楚看見誰已讀、誰未讀，並能一鍵催簽；\n"
        "第二，導生晤談紀錄嚴格隔離，保護學生隱私，導師可設定後續追蹤日期，系統自動排入待辦；\n"
        "第三，班級幹部與群組動態指派，方便分組管理；\n"
        "第四，操行成績評定與缺曠統計聯動，自動建議加減分，讓導師能客觀且即時掌握每位學生的身心狀況。"
    )

    # ==========================================
    # SLIDE 8: 行政作業端 — 多關卡線上申辦與電子簽章
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8, COLOR_BG)
    add_header(s8, "E-Workflow & E-Seal", "行政端亮點：多關卡線上申辦流程與動態電子簽章", "建立 100% 無紙化行政審核通道，動態關卡推進、電子印鑑覆核與調課即時推播")

    cards_s8 = [
        ("線上多關卡審核流程 (E-Workflow)", [
            ("自動關卡排程", "依申請種類（請假/補考/抵免/退學）自動建立審核流水線：送件->導師->主任->處室"),
            ("表單資料防呆校驗", "必填欄位完整性驗證、重複送件攔截、佐證文件附檔檢核"),
            ("退件補件即時通知", "審核人員可退回案件並附註補件原因，申請人可補件後一鍵重新送審"),
            ("全程狀態即時可視", "具備視覺化 Stepper 流程進度條，當前審核卡在哪一關一目了然")
        ], COLOR_BLUE, COLOR_PRIMARY, "線上申辦"),
        ("動態電子印章機制 (Digital E-Seal)", [
            ("專屬印鑑章管理", "每位教師與行政主管均可上傳並綁定專屬長形或方形電子簽章圖檔"),
            ("簽章動態蓋印", "審核通過時，系統自動將審核人姓名、職稱、時戳與電子印章合成蓋印於表單"),
            ("簽章防偽與不可否認性", "記錄簽核當下的登入帳號、IP 位址與簽核狀態，杜絕冒簽或偽造"),
            ("匯出標準 PDF 歸檔", "審核完成後可一鍵下載含完整電子印章之標準申請審核報表 PDF 檔案")
        ], COLOR_SKY, COLOR_PRIMARY, "電子簽章"),
        ("臨時停課／調課通知 (course_changes)", [
            ("課務異動迅速送審", "教師因公假或研習臨時需要停課或調課時，可於線上快速填單"),
            ("完整異動欄位規劃", "涵蓋原上課日期節次/教室、調課後補課日期節次/教室與異動事由"),
            ("班級學生即時推播", "課務審核通過後，系統自動將調課通知推播至該班學生首頁與課表"),
            ("避免學生撲空跑錯教室", "徹底解決以往教室門口貼紙本臨時公告、學生未看到白跑一趟的窘境")
        ], COLOR_EMERALD, COLOR_PRIMARY, "停調課推播"),
        ("校園活動發布、候補與 QR 簽到", [
            ("活動多維度發布", "主辦單位可發布活動時間、地點、容納名額、候補上限與對象資格限制"),
            ("智慧候補推進機制", "正取人員取消報名時，系統自動依序遞補第一順位候補人員並發送通知"),
            ("QR Code 快速簽到", "活動現場提供專屬報到 QR Code，學生手機掃描 1 秒即時完成簽到"),
            ("問卷回饋與滿意度分析", "活動結束後線上填寫回饋問卷，自動統計滿意度評分與改善建議")
        ], COLOR_AMBER, COLOR_PRIMARY, "活動管理")
    ]

    for idx, (title, items, border_c, title_c, tag) in enumerate(cards_s8):
        row = idx // 2
        col = idx % 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.85 + row * 2.65)
        add_card(s8, x, y, Inches(5.75), Inches(2.45), title, items, border_c, title_c, tag)

    s8.notes_slide.notes_text_frame.text = (
        "【第 8 頁講稿】：\n"
        "在行政作業上，我們實現了真正的『100% 無紙化行政流程』：\n"
        "第一，多關卡線上審核流水線：學生送件後，依序由導師、系主任、教務處等單位線上審批，有退件或補件需求可一鍵反饋；\n"
        "第二，動態電子印鑑章：各級主管審核通過時，系統會自動加蓋帶有時戳與身份雜湊的電子印章，最後能匯出標準 PDF 存檔；\n"
        "第三，在課務上，我們新增了 course_changes 模組，教師線上申請調課，審核通過後全班課表即時更新，學生不會撲空；\n"
        "第四，校園活動模組更具備自動候補遞補與現場 QR Code 簽到機制，極大減輕主辦單位的行政負擔。"
    )

    # ==========================================
    # SLIDE 9: 管理員核心亮點 — 智慧校園 AI 決策與異常預警中樞
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9, COLOR_BG)
    add_header(s9, "AI Insights & Decision Hub", "管理員核心亮點：智慧校園 AI 決策與異常預警中樞", "四大 AI 交叉推論預警模型：橫向突破傳統系統被動紀錄缺陷，賦予校園管理主動預測智慧")

    cards_s9 = [
        ("AI 模型一：擋修鏈斷裂風險預警", [
            ("前瞻追蹤先修條件", "系統交叉比對學生歷年修課成績與課程地圖 (course_map) 先修/擋修規則"),
            ("及早發掘受阻學生", "當先修科目（如基礎程式）不及格時，自動推論下學期進階課程受阻風險"),
            ("主動名單產出", "列出受影響學生學號、姓名、受阻課程名稱，標記 ⚠️『高風險擋修』"),
            ("啟動暑修/重修輔導", "管理員可一鍵通知系所科助與導師，提早開設重修輔導專班，避免延畢")
        ], COLOR_BLUE, COLOR_PRIMARY, "擋修預警"),
        ("AI 模型二：1/3 缺課扣考危機警示", [
            ("實時缺曠時數比對", "自動比對學生出缺勤紀錄 (attendance_records) 與課程學期總授課時數"),
            ("扣考門檻前哨預警", "當特定科目曠缺課時數累積達學期總時數 1/4 (警戒線) 或 1/3 (扣考線) 時警示"),
            ("預防性關懷通知", "不再等到期末被扣考才遺憾，期中即時發送警示通知學生與班導師"),
            ("降低全校退學率", "透過前置介入關懷，有效遏止學生因長期缺課導致學業危機")
        ], COLOR_AMBER, COLOR_PRIMARY, "扣考警戒"),
        ("AI 模型三：搜尋意圖自主學習成長", [
            ("未命中詞聚類統計", "深度分析學生在知識庫搜尋時未能命中的口語詞彙（如「借筆電」、「校巴」）"),
            ("智慧同義詞關聯推薦", "AI 演算法自動分析搜尋情境，推薦最合適的關聯官方規章分類與條目"),
            ("前後台一鍵採納生效", "管理員在後台點選『一鍵採納為同義詞』，系統立即寫入字典並即刻生效"),
            ("自主演進知識中樞", "平台使用次數越多，知識庫檢索能力越聰明、越精準")
        ], COLOR_EMERALD, COLOR_PRIMARY, "意圖學習"),
        ("AI 模型四：校園空間與資源利用率優化", [
            ("教室與會議室閒置偵測", "分析 class_schedule 與 room_bookings，揪出黃金時段閒置空間"),
            ("高頻尖峰預約建議", "針對借用需求極高之電腦教室或大會議室，主動給予時段分流建議"),
            ("節能與資源最大化", "輔助總務處調度水電空調，降低校園營運能耗與浪費"),
            ("數據驅動決策", "以客觀數據替代主觀猜測，大幅提升校園空間與資產運轉效率")
        ], COLOR_SKY, COLOR_PRIMARY, "資源優化")
    ]

    for idx, (title, items, border_c, title_c, tag) in enumerate(cards_s9):
        row = idx // 2
        col = idx % 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.85 + row * 2.65)
        add_card(s9, x, y, Inches(5.75), Inches(2.45), title, items, border_c, title_c, tag)

    s9.notes_slide.notes_text_frame.text = (
        "【第 9 頁講稿】：\n"
        "這是本專題最核心的創新亮點——『智慧校園 AI 決策中樞』！\n"
        "傳統校務系統最大的問題是『被動紀錄』，等學生被扣考或延畢時，一切都太遲了。我們設計了四大 AI 推論模型：\n"
        "第一，擋修鏈斷裂預警：系統橫向比對修課成績與課程地圖，及早揪出下學期會被擋修的學生名單；\n"
        "第二，缺課扣考預警：交叉比對出勤與學期時數，在缺課達到 1/4 警戒線時主動提醒，避免期末直接扣考；\n"
        "第三，未命中詞自主學習：學生搜尋找不到的口語詞，系統自動匯總，管理員點選『一鍵採納』立即擴充同義詞字典，系統會越用越聰明；\n"
        "第四，空間資源優化：即時分析教室與會議室閒置狀況，提出分流建議。\n"
        "這套機制讓校方從被動處理轉型為『主動關懷預防』！"
    )

    # ==========================================
    # SLIDE 10: 管理員核心亮點 — 全校線上會議中控台與時段衝突演算
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10, COLOR_BG)
    add_header(s10, "Meeting Central & Collision Algorithm", "管理員核心亮點：全校線上會議中控台與時段衝突演算", "整合輕量級 Jitsi 視訊中樞，實現跨處室時段重疊衝突偵測演算與穿透式審查")

    cards_s10 = [
        ("Jitsi 全校視訊會議快速整合", [
            ("零門檻即開即會", "採用 Jitsi Meet 輕量架構，全校師生免安裝額外軟體，點擊連結瀏覽器即刻加入"),
            ("會議房號動態防偽生成", "系統自動為每場會議生成專屬隨機房號與存取權限，杜絕校外人士亂入"),
            ("會議歷史完整留痕", "完整記錄發起人、發起處室、會議主題、開始結束時間與會期狀態"),
            ("橫跨全校各處室整合", "教務會議、導師會報、專題口試、學生諮商均可建立專屬線上會議室")
        ], COLOR_BLUE, COLOR_PRIMARY, "視訊中樞"),
        ("時段重疊衝突偵測演算法 (Collision Detection)", [
            ("O(N log N) 區間排序演算", "後端即時掃描當日全校會議時段區間 [start_time, end_time]"),
            ("自動標記 ⚠️「時段衝突」", "當兩場或多場會議在同一個空間或重疊時間召開時，系統自動標註醒目警告徽章"),
            ("即時防撞期提醒", "後台即刻提示管理員衝突處室、重疊時間段與受影響會議主題"),
            ("支援跨處室協調取消", "管理員擁有全校協調權限，可於中控台一鍵取消或調整衝突會議，恢復排程秩序")
        ], COLOR_AMBER, COLOR_PRIMARY, "衝突演算法"),
        ("穿透式與會名單審查 (Drill-down Audit)", [
            ("跨表關聯穿透透視", "會議卡片點擊即可即時穿透調閱 meeting_members 與 users 資料表"),
            ("出席角色全貌呈現", "清晰展示出席人員姓名、帳號、所屬處室/班級及是否已入會狀態"),
            ("避免人員分身乏術", "協助管理員審查是否同一位行政主管或教師被排入同時段兩場會議"),
            ("無縫權限整合保護", "普通成員僅能看到自己受邀之會議，超級管理員具備全局穿透視角")
        ], COLOR_SKY, COLOR_PRIMARY, "穿透審查"),
        ("系統運行效益與成果數據", [
            ("全校會議歷史一目了然", "徹底告別過往各處室自己開 Zoom/Teams 導致的時段混亂與資源互撞"),
            ("演算法 100% 準確率", "經由單元測試 test_admin_cases.py 與自動化驗證，重疊區間檢測零漏報"),
            ("會議行政成本降低 60%", "線上快速召開、名單一鍵匯總，大幅節省紙本開會通知與場地布置成本"),
            ("整合行事曆同步聯動", "會議排程自動同步至校園行事曆 (academic_calendar)，確保全校步調一致")
        ], COLOR_EMERALD, COLOR_PRIMARY, "實施效益")
    ]

    for idx, (title, items, border_c, title_c, tag) in enumerate(cards_s10):
        row = idx // 2
        col = idx % 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.85 + row * 2.65)
        add_card(s10, x, y, Inches(5.75), Inches(2.45), title, items, border_c, title_c, tag)

    s10.notes_slide.notes_text_frame.text = (
        "【第 10 頁講稿】：\n"
        "在遠距教學與跨處室行政協調上，我們開發了『全校線上會議中控台』：\n"
        "第一，無縫整合 Jitsi Meet，師生不必額外安裝 App，在瀏覽器裡點擊就能加入會議；\n"
        "第二，最核心的亮點是我們實現了『時段重疊衝突偵測演算法』：系統會在後端即時掃描全校排程，一旦有兩場會議時段撞期，系統會自動標記 ⚠️『時段衝突』黃色警示，提醒管理員協調；\n"
        "第三，具備『穿透式審查』能力，點擊會議就能穿透查看所有與會人員的名單與身分，避免主管在同一個時段被排入兩場會議；\n"
        "這項演算法完全通過了自動化測試，為全校會議排程提供了最穩健的保障。"
    )

    # ==========================================
    # SLIDE 11: 系統安全防禦、防呆機制與審計追蹤
    # ==========================================
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11, COLOR_BG)
    add_header(s11, "Security & Foolproofing", "系統安全防禦、防呆機制與不可篡改審計追蹤", "落實身分隔離、管理員鎖定保護、輸入防呆與金融級操作軌跡留痕")

    cards_s11 = [
        ("RBAC 七大角色權限嚴密隔離", [
            ("角色矩陣嚴格把關", "劃分學生、家長、教師、導師、行政、科助與超級管理員 7 大角色"),
            ("API 階層權限中介層", "後端 API 均掛載 @require_role 裝飾器，嚴禁越權存取 (Vertical Privilege Escalation)"),
            ("前端 UI 權限過濾", "依角色動態渲染導航選單與功能按鈕，非權限功能完全自 DOM 節點移除"),
            ("水平權限隔離 (BOLA)", "學生只能看自己成績、導師只能看自己班級，跨班跨系資料嚴格阻隔")
        ], COLOR_BLUE, COLOR_PRIMARY, "權限隔離"),
        ("超級管理員 admin 帳號安全鎖定", [
            ("防止誤刪防護罩", "系統層級鎖定 admin 帳號，後台禁止刪除、停用或修改其核心最高權限"),
            ("處室中立原則治理", "admin 帳號 office 欄位固定為空，維持全校最高中立監管身分，不隸屬特定處室"),
            ("身分標籤純化", "後台登入資訊僅顯示『管理員』，去除冗餘處室綴詞，保持介面簡潔"),
            ("最高權限存取留痕", "admin 執行的所有高權限指令全數記入審計日誌，確保權力受透明監控")
        ], COLOR_SKY, COLOR_PRIMARY, "管理員防護"),
        ("密碼安全與全站防呆攔截 (Foolproofing)", [
            ("中文與全形密碼攔截", "登入與密碼修改表單前端及後端即時阻擋中文字元與全形符號，避免誤輸造成死鎖"),
            ("直觀純數字密碼支援", "考量長輩與低年級學生習慣，系統支援 6 位半形純數字密碼並妥善雜湊"),
            ("預設密碼防呆欄位", "users 表保留 default_password 欄位，方便管理員為新生批次重設與告知"),
            ("防暴力破解與限流", "連續密碼錯誤觸發暫時鎖定機制，有效防禦字典檔與暴力嘗試攻擊")
        ], COLOR_EMERALD, COLOR_PRIMARY, "密碼防呆"),
        ("不可篡改 Audit Log 審計追蹤", [
            ("完整操作行為錄案", "所有關鍵資料（案件、活動、公告、法規、帳號）之增刪改均全自動留痕"),
            ("前/後數據 JSON 記錄", "精確記錄『變更前 JSON』與『變更後 JSON』，提供最完整的變更對比軌跡"),
            ("網路環境數據補捉", "記錄操作者真實 IP 位址、身分角色、使用者名稱與精確伺服器時間戳記"),
            ("防竄改只讀保護", "審計日誌僅支援查詢檢視與統計分析，任何角色（含 admin）均無權修改或刪除")
        ], COLOR_AMBER, COLOR_PRIMARY, "審計日誌")
    ]

    for idx, (title, items, border_c, title_c, tag) in enumerate(cards_s11):
        row = idx // 2
        col = idx % 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.85 + row * 2.65)
        add_card(s11, x, y, Inches(5.75), Inches(2.45), title, items, border_c, title_c, tag)

    s11.notes_slide.notes_text_frame.text = (
        "【第 11 頁講稿】：\n"
        "在資訊安全與系統穩健性上，我們做了非常紮實的防呆與防禦設計：\n"
        "第一，RBAC 7 大角色權限隔離，確保學生看自己、導師看所屬班級，絕無越權可能；\n"
        "第二，超級管理員 admin 帳號鎖定機制，防止人為誤刪或停用，並維持中立處室屬性；\n"
        "第三，密碼輸入防呆：攔截中文字元與全形符號，避免學生不小心在中文輸入法下設定密碼導致日後無法登入；\n"
        "第四，金融級不可篡改 Audit Log：記錄每一次新增、修改、刪除的前後 JSON、IP 與時間，任何操作都有跡可循！"
    )

    # ==========================================
    # SLIDE 12: 資料庫架構治理與 3NF 正規化
    # ==========================================
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12, COLOR_BG)
    add_header(s12, "Database Normalization", "資料庫架構治理與 3NF 正規化標準", "完成全校 62 張標準資料表治理，落實嚴格第三正規化 (3NF) 與 36 條實體外鍵防護")

    # 左側：統計數據卡片
    left_top = Inches(1.85)
    db_metrics = [
        ("62", "標準資料表 (Tables)", "完全消除資料冗餘與異常更新", COLOR_BLUE),
        ("36", "實體外鍵約束 (Foreign Keys)", "100% 關聯無暇，零孤立外鍵資料", COLOR_EMERALD),
        ("922", "學生修課成績筆數", "完整支撐先修擋修與畢業審查", COLOR_SKY),
        ("75", "真實全校學籍資料", "完整涵蓋 5 位示範生與 70 位真實學生", COLOR_AMBER)
    ]
    for idx, (val, label, desc, color) in enumerate(db_metrics):
        my = left_top + idx * Inches(1.28)
        card = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), my, Inches(3.6), Inches(1.15))
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD_BG
        card.line.color.rgb = COLOR_CARD_BORDER
        card.line.width = Pt(1)

        # 側邊色條
        bar = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), my, Inches(0.08), Inches(1.15))
        bar.fill.solid()
        bar.fill.fore_color.rgb = color
        bar.line.fill.background()

        tb = s12.shapes.add_textbox(Inches(1.05), my + Inches(0.1), Inches(3.2), Inches(0.95))
        tf = tb.text_frame
        tf.word_wrap = True
        p_val = tf.paragraphs[0]
        p_val.text = val
        p_val.font.name = FONT_MAIN
        p_val.font.size = Pt(26)
        p_val.font.bold = True
        p_val.font.color.rgb = color

        p_lbl = tf.add_paragraph()
        p_lbl.text = f"{label} ｜ {desc}"
        p_lbl.font.name = FONT_MAIN
        p_lbl.font.size = Pt(9.5)
        p_lbl.font.color.rgb = COLOR_TEXT_MUTED

    # 右側：核心資料庫群組劃分與 3NF 說明
    right_card = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.6), Inches(1.85), Inches(7.9), Inches(5.1))
    right_card.fill.solid()
    right_card.fill.fore_color.rgb = COLOR_CARD_BG
    right_card.line.color.rgb = COLOR_CARD_BORDER
    right_card.line.width = Pt(1)

    rtb = s12.shapes.add_textbox(Inches(4.85), Inches(2.0), Inches(7.4), Inches(4.7))
    rtf = rtb.text_frame
    rtf.word_wrap = True

    rp0 = rtf.paragraphs[0]
    rp0.text = "【62 張資料表業務模組劃分與 3NF 正規化治理實務】"
    rp0.font.name = FONT_MAIN
    rp0.font.size = Pt(14)
    rp0.font.bold = True
    rp0.font.color.rgb = COLOR_PRIMARY
    rp0.space_after = Pt(10)

    db_groups = [
        ("基礎學籍與帳號群 (users, students, departments)", "遵循 3NF 消除遞移相依，將學生個資、帳號登入雜湊與科系學院代碼完全解耦。"),
        ("課程地圖與修課成績群 (course_map, student_credits, class_schedule)", "以學期、課程代碼為主外鍵鍵值，支援擋修關聯遞迴查詢與動態課表排程。"),
        ("課務調課通知群 (course_changes)", "本次整併新增之專題模組，支援臨時停課／調課通知發布，含完整節次、教室與審核者欄位。"),
        ("導師與班級輔導群 (counseling_records, class_notices, conduct_records)", "晤談紀錄、通知回執與操行獎懲獨立成表，確保個人輔導敏感資料受行級安全隔離。"),
        ("線上申辦與電子簽章群 (online_applications, checklist_items, admin_cases)", "以通用工作流結構儲存申請表單、關卡流水線、承辦處室與動態印鑑蓋章歷史。"),
        ("校園活動與生活設施群 (events, event_registrations, dorm_applications, lockers)", "管理正取候補名額、簽到狀態、床位多階段抽籤選填與置物櫃在線租借。"),
        ("系統審計與知識庫群 (audit_logs, knowledge_base, synonym_dictionary, meetings)", "儲存不可篡改日誌、口語同義詞映射字典、全校視訊會議排程與時段衝突紀錄。")
    ]

    for g_title, g_desc in db_groups:
        gp = rtf.add_paragraph()
        gp.font.name = FONT_MAIN
        gp.font.size = Pt(11)
        gp.space_after = Pt(5)
        r_gt = gp.add_run()
        r_gt.text = f"• {g_title}："
        r_gt.font.bold = True
        r_gt.font.color.rgb = COLOR_TEXT_MAIN
        r_gd = gp.add_run()
        r_gd.text = f" {g_desc}"
        r_gd.font.color.rgb = COLOR_TEXT_MUTED

    s12.notes_slide.notes_text_frame.text = (
        "【第 12 頁講稿】：\n"
        "資料庫是整套系統的靈魂。我們完成了非常嚴格的『3NF 第三正規化治理』：\n"
        "全系統共有 62 張標準資料表，完全解除了遞移相依；\n"
        "我們建立了 36 條實體 Foreign Key 外鍵約束，經過自動化測試驗證，100% 合法、無任何孤立外鍵資料；\n"
        "資料庫內建有 75 位完整學籍、922 筆真實學分成績與 97 位使用者帳號；\n"
        "特別是剛剛整併完成的 course_changes（臨時停調課表），讓課表與調課通知實現無縫整合！"
    )

    # ==========================================
    # SLIDE 13: 軟體工程品質保證與自動化測試
    # ==========================================
    s13 = prs.slides.add_slide(blank_layout)
    set_slide_background(s13, COLOR_BG)
    add_header(s13, "Software Quality Assurance", "軟體工程品質保證與自動化測試成果", "全系統 2,689 項單元與整合測試 100% 通過，56 項一鍵全站健康體檢，展現最高工程穩定度")

    cards_s13 = [
        ("全系統 2,689 項自動化測試通過", [
            ("超大規模測試套件", "覆蓋權限隔離、表單流程、電子簽章、AI 預警推論、資料庫正規化"),
            ("100% 測試成功率", "執行 pytest 耗時 125 秒，全數 2,689 passed (0 failed, 45 xfailed)"),
            ("回歸防禦保證", "每次新功能加入或資料庫整併均全量回歸，確保零意外破壞 (Zero Regression)"),
            ("專案特設 test_sql_merge.py", "自動化校驗 62 表與 36 外鍵完整性，守護資料品質")
        ], COLOR_EMERALD, COLOR_PRIMARY, "自動化測試"),
        ("後台 56 項一鍵全功能健康體檢", [
            ("端點即時連通診斷", "自動掃描全校 56 個重要 API 端點與靜態頁面服務可用性"),
            ("資料庫連線池健康檢測", "檢驗 MySQL/MariaDB 讀寫效能、外鍵約束狀態與表格筆數"),
            ("資安策略合規掃描", "驗證 Session 存活時間、CSRF 防護、密碼雜湊強度與管理員鎖定"),
            ("即時體檢報告", "管理員於後台點擊『一鍵系統體檢』，3 秒產出完整綠色健康報告")
        ], COLOR_BLUE, COLOR_PRIMARY, "全站健康診斷"),
        ("PWA 漸進快取升級架構 (Service Worker v54)", [
            ("版本化快取策略", "採用 smart-ukn-v54 版本識別，靜態資源秒速快取，離線順暢存取"),
            ("自動無感更新機制", "當伺服器發布新版本時，Service Worker 自動後台更新，不造成白屏"),
            ("極致壓縮傳輸", "全站 JS/CSS 與 JSON 資料均經結構優化，節省行動網路流量"),
            ("手機主畫面無痕整合", "提供 manifest.json 與全套 App 圖示，體驗媲美原生 App")
        ], COLOR_SKY, COLOR_PRIMARY, "PWA 離線快取"),
        ("標準化版本控制與團隊協作規範", [
            ("Git 多人分支流轉", "建立 23-1126 等專題任務分支，嚴格落實 Commit 審查與合併流程"),
            ("Conventional Commits", "規範 feat / fix / refactor / test 語意化提交日誌，脈絡清晰"),
            ("程式碼風格一律標準化", "遵守 PEP8 與繁體中文台灣習慣用語，無拼貼雜亂程式碼"),
            ("持續交付 (Continuous Delivery)", "程式碼、測試與資料庫 Migration 腳本完全同步，具備商用交付水準")
        ], COLOR_AMBER, COLOR_PRIMARY, "工程規範")
    ]

    for idx, (title, items, border_c, title_c, tag) in enumerate(cards_s13):
        row = idx // 2
        col = idx % 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.85 + row * 2.65)
        add_card(s13, x, y, Inches(5.75), Inches(2.45), title, items, border_c, title_c, tag)

    s13.notes_slide.notes_text_frame.text = (
        "【第 13 頁講稿】：\n"
        "我們非常重視系統的『工程穩定度』與『軟體品質』：\n"
        "第一，全系統撰寫了多達 2,689 項自動化單元與整合測試，包含權限、申辦、資料庫與 AI 預警，全數 100% 通過！\n"
        "第二，後台內建了『56 項一鍵全功能健康體檢』，3 秒鐘之內就能診斷全站 API 與資料庫健康狀態；\n"
        "第三，PWA 快取架構已推進至 v54，支援離線存取且能自動平滑更新；\n"
        "第四，全專案嚴格遵循 Git 分支規範與 Conventional Commits，確保每一行程式碼都有跡可循、品質堅若磐石。"
    )

    # ==========================================
    # SLIDE 14: 專題小組分工與進度里程碑
    # ==========================================
    s14 = prs.slides.add_slide(blank_layout)
    set_slide_background(s14, COLOR_BG)
    add_header(s14, "Team Contributions & Status", "專題小組成員分工與里程碑進度表", "四位專題生通力合作，負責項目全數達成 100% 開發完畢、功能測試與自動化驗證")

    team_members = [
        ("張晴茹 (111534117)", "學生端生活與核心服務", [
            ("個人首頁與畢業門檻查詢", "建立 PWA 首頁與門檻查詢，支援手機加入主畫面"),
            ("獎助學金資格比對與推薦", "比對低收/原民/成績條件，自動標記符合項目"),
            ("課程地圖與修課檢視", "專業必選修路徑樹圖解，先修後修擋修標記"),
            ("口語化校規法規搜尋", "同義詞對照引擎，口語自動轉換官方規章條文"),
            ("宿舍床位與置物櫃申辦", "多階段線上抽籤、床位自選、校園置物櫃租借"),
            ("常用表單下載專區", "權限分類過濾、表單下載與個人常用收藏")
        ], COLOR_BLUE, "進度 100%"),
        ("陳奕臻 (111534121)", "教學、導師與行政申辦", [
            ("個人化動態課表與空堂分析", "週課表渲染、空堂時段分析與上課教室提示"),
            ("線上申辦與動態電子簽章", "補考、抵免、請假等階層送審與主管電子印章"),
            ("導師班級通知與回執追蹤", "推播班級公告，實時掌握學生已讀/未讀並催簽"),
            ("導生關懷晤談紀錄", "晤談紀錄建檔、待辦追蹤與敏感個資隱私隔離"),
            ("班級幹部與群組管理", "動態維護幹部名冊、職務指派與專案分組"),
            ("校園活動報名與簽到", "名額管控、自動候補遞補與 QR Code 簽到")
        ], COLOR_SKY, "進度 100%"),
        ("王博慶 (111534123)", "AI 決策、系統安全與資料庫", [
            ("智慧校園 AI 決策預警中樞", "擋修鏈斷裂、缺課扣考預警與未命中詞自主採納"),
            ("全校線上會議時段衝突演算", "Jitsi 視訊整合、O(N log N) 重疊演算與穿透名單"),
            ("帳號權限管理與全站防呆", "RBAC 角色矩陣、admin 防誤刪與中文密碼攔截"),
            ("不可篡改 Audit Log 審計", "全自動記錄變更前/後 JSON、IP 與時間戳記"),
            ("全站 56 項自動化體檢中樞", "一鍵即時診斷 API 端點、資料庫與安全策略"),
            ("資料庫 3NF 正規化治理", "62 表結構治理、36 外鍵校驗與 2689 測試守護")
        ], COLOR_EMERALD, "進度 100%"),
        ("呂泑禎 (111534130)", "課務異動與校務行政支援", [
            ("臨時停課／調課通知 (course_changes)", "教師線上填報調課事由，班級首頁與課表即時推播"),
            ("校曆與個人行事曆同步", "同步學校官方行事曆與國定假日，支援個人排程"),
            ("校園知識庫分類管理", "維護教務、學務、總務等知識庫分類與法規條文"),
            ("常用表單與報告維護", "上架與整理全校各處室最新表單檔案與使用權限"),
            ("訪客參訪線上預約", "校外人士預約流程、人數容量限制與預約確認"),
            ("資料庫整合協同驗證", "協同 31 匯出檔與 smart_ukn.sql 資料整併驗收")
        ], COLOR_AMBER, "進度 100%")
    ]

    for idx, (name, role_title, items, border_c, prog_tag) in enumerate(team_members):
        x = Inches(0.8 + idx * 2.95)
        y = Inches(1.85)
        add_card(s14, x, y, Inches(2.85), Inches(5.1), name, items, border_c, COLOR_PRIMARY, prog_tag)

    s14.notes_slide.notes_text_frame.text = (
        "【第 14 頁講稿】：\n"
        "在專題分工上，我們四位組員各司其職、緊密協作，目前所有規劃功能達成率均為 100%：\n"
        "張晴茹負責學生生活服務，包括首頁、課表、畢業門檻、獎助學金與宿舍；\n"
        "陳奕臻負責教學與行政流轉，包括電子簽章、導生晤談、班級推播與活動候補；\n"
        "我（王博慶）負責系統核心架構、AI 決策預警中樞、線上會議衝突演算法、全站安全防呆與資料庫 3NF 治理；\n"
        "呂泑禎負責課務調課通知 course_changes、校曆行事曆與知識庫表單維護。\n"
        "全組成員緊密配合，讓每一項功能都具備最高的實用性與穩定度。"
    )

    # ==========================================
    # SLIDE 15: 專題效益與創新價值總結
    # ==========================================
    s15 = prs.slides.add_slide(blank_layout)
    set_slide_background(s15, COLOR_BG)
    add_header(s15, "Project Impact & Future", "專題效益評估、創新價值與未來展望", "從行政無紙化、學生生活賦能到數據智慧決策，全面推動康寧大學智慧校園數位轉型")

    impacts = [
        ("一、實質效益評估 (Measurable Impact)", [
            ("行政無紙化達成 100%", "申辦、核章、調課、置物櫃租借全數線上化，年節省紙張逾 30,000 張"),
            ("查詢與申辦效率提升 80%", "學生不再需要四處跑處室問規章，單一平臺 30 秒完成送件與進度查閱"),
            ("師生溝通零時差", "班級通知已讀未讀即時掌握，重要訊息催簽率提升至 95% 以上"),
            ("跨處室會議衝突歸零", "時段重疊衝突偵測演算法實時把關，徹底根除會議撞期排程混亂")
        ], COLOR_BLUE, COLOR_PRIMARY, "實質效益"),
        ("二、核心創新價值 (Core Innovation)", [
            ("從被動處置轉型為主動預警", "突破傳統系統事後紀錄限制，導入擋修與扣考 AI 推論前瞻預警"),
            ("同義詞自主進化架構", "搜尋未命中詞自主學習收錄，讓系統隨著全校使用不斷自我優化"),
            ("高規格金融級安全防護", "RBAC 7 大角色隔離、admin 誤刪鎖定、中文密碼攔截與不可篡改 Audit Log"),
            ("標準正規化 3NF 資料庫", "62 表無冗餘架構、36 外鍵強約束，具備極高商業級擴充彈性")
        ], COLOR_SKY, COLOR_PRIMARY, "創新價值"),
        ("三、未來擴充展望 (Future Roadmap)", [
            ("校園實體 IoT 門禁連動", "置物櫃與宿舍選填後，自動連動學生證悠遊卡或 QR 門禁扣款開門"),
            ("LINE 官方帳號智慧推播", "整合 LINE Messaging API，重要扣考預警與調課直接推播至學生手機 LINE"),
            ("生成式 AI 智慧校園秘書", "整合 LLM 大型語言模型，提供 24 小時自然語言校務問答與選課諮詢"),
            ("跨校區智慧能源監控", "進一步結合教室課表與冷氣電力開關，實現智慧節能綠色校園")
        ], COLOR_EMERALD, COLOR_PRIMARY, "未來藍圖"),
        ("四、總結 (Conclusion)", [
            ("完整落實軟體工程全生命週期", "從需求訪談、架構設計、3NF 正規化、單元測試到系統上線全數完成"),
            ("2,689 項測試守護品質", "零重大缺失，系統運作流暢穩健，充分展現資管專題之技術實力"),
            ("真正解決校園真實痛點", "非空泛展示玩具，每一項模組均切合康寧大學校園日常業務需求"),
            ("已具備正式導入校園能力", "完善的部署腳本與種子數據，隨時可上線為全校師生提供智慧服務")
        ], COLOR_AMBER, COLOR_PRIMARY, "總結評價")
    ]

    for idx, (title, items, border_c, title_c, tag) in enumerate(impacts):
        row = idx // 2
        col = idx % 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.85 + row * 2.65)
        add_card(s15, x, y, Inches(5.75), Inches(2.45), title, items, border_c, title_c, tag)

    s15.notes_slide.notes_text_frame.text = (
        "【第 15 頁講稿】：\n"
        "總結本專題的成果與效益：\n"
        "在實質效益上，我們實現了校務申辦 100% 無紙化，學生查詢效率提升 80%，跨處室會議衝突率降為零；\n"
        "在創新價值上，我們讓系統從『被動紀錄』躍升為『主動 AI 預警』，並建立自主進化的搜尋同義詞字典；\n"
        "在未來展望上，本架構隨時可對接 LINE 官方帳號推播、IoT 門禁設備或生成式 AI 秘書；\n"
        "Smart UKN 不僅是一個畢業專題，更是一套成熟、穩定、具備即刻導入上線水準的商業級校園智慧平台！"
    )

    # ==========================================
    # SLIDE 16: 實機展示規劃與 Q&A
    # ==========================================
    s16 = prs.slides.add_slide(blank_layout)
    set_slide_background(s16, COLOR_NAVY)

    # 頂部標題
    top_t = s16.shapes.add_textbox(Inches(1.2), Inches(1.0), Inches(11), Inches(1.2))
    ttf = top_t.text_frame
    tp0 = ttf.paragraphs[0]
    tp0.text = "LIVE DEMONSTRATION & Q&A"
    tp0.font.name = FONT_MAIN
    tp0.font.size = Pt(14)
    tp0.font.bold = True
    tp0.font.color.rgb = COLOR_SKY

    tp1 = ttf.add_paragraph()
    tp1.text = "實機功能展示與審查委員問答"
    tp1.font.name = FONT_MAIN
    tp1.font.size = Pt(36)
    tp1.font.bold = True
    tp1.font.color.rgb = RGBColor(255, 255, 255)
    tp1.space_before = Pt(4)

    # 四大展示動線卡片
    demo_steps = [
        ("步驟一：學生端體驗", "student1 / 123456", [
            "展示個人首頁 PWA 課表與空堂分析",
            "展示畢業門檻學分達成率雷達圖",
            "展示獎助學金比對與宿舍床位線上選填",
            "示範補考線上申辦送件流程"
        ], COLOR_BLUE),
        ("步驟二：導師端審核", "teacher1 / 123456", [
            "展示班級通知發布與已讀未讀回執",
            "展示導生晤談紀錄（隱私隔離展示）",
            "展示學生申辦第一關線上電子簽章蓋印",
            "展示操行評核與獎懲審核流程"
        ], COLOR_SKY),
        ("步驟三：行政端協同", "staff1 / 123456", [
            "展示線上申辦第二關/最終關卡覆核蓋章",
            "展示臨時停課／調課通知發布與課表連動",
            "展示校園活動候補遞補與 QR 簽到",
            "展示重要規章表單下載與收藏"
        ], COLOR_EMERALD),
        ("步驟四：AI 決策管理", "admin / admin123", [
            "展示【智慧校園 AI 決策預警洞察中樞】",
            "展示【全校線上會議時段衝突演算】⚠️",
            "展示未命中詞一鍵採納為同義詞即時生效",
            "展示不可篡改 Audit Log 審計追蹤紀錄"
        ], COLOR_AMBER)
    ]

    for idx, (step_title, cred, items, border_c) in enumerate(demo_steps):
        x = Inches(1.2 + idx * 2.75)
        y = Inches(2.6)
        card = s16.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(2.6), Inches(3.6))
        card.fill.solid()
        card.fill.fore_color.rgb = RGBColor(30, 41, 59)
        card.line.color.rgb = border_c
        card.line.width = Pt(1.5)

        ctb = s16.shapes.add_textbox(x + Inches(0.15), y + Inches(0.15), Inches(2.3), Inches(3.3))
        ctf = ctb.text_frame
        ctf.word_wrap = True

        cp0 = ctf.paragraphs[0]
        cp0.text = step_title
        cp0.font.name = FONT_MAIN
        cp0.font.size = Pt(13)
        cp0.font.bold = True
        cp0.font.color.rgb = RGBColor(255, 255, 255)

        cp_sub = ctf.add_paragraph()
        cp_sub.text = f"測試帳號: {cred}"
        cp_sub.font.name = FONT_MAIN
        cp_sub.font.size = Pt(10)
        cp_sub.font.color.rgb = border_c
        cp_sub.space_after = Pt(8)

        for item in items:
            p_it = ctf.add_paragraph()
            p_it.font.name = FONT_MAIN
            p_it.font.size = Pt(10)
            p_it.space_after = Pt(4)
            r = p_it.add_run()
            r.text = f"✔ {item}"
            r.font.color.rgb = RGBColor(203, 213, 225)

    # 感謝結尾
    thanks_box = s16.shapes.add_textbox(Inches(1.2), Inches(6.4), Inches(10.9), Inches(0.6))
    tf_th = thanks_box.text_frame
    p_th = tf_th.paragraphs[0]
    p_th.text = "感謝 指導老師 彭賓鈺 老師 及各位審查委員的悉心指導！ 敬請 各位師長批評指教。"
    p_th.alignment = PP_ALIGN.CENTER
    p_th.font.name = FONT_MAIN
    p_th.font.size = Pt(13)
    p_th.font.bold = True
    p_th.font.color.rgb = RGBColor(241, 245, 249)

    s16.notes_slide.notes_text_frame.text = (
        "【結尾與實機展示講稿】：\n"
        "感謝各位老師與委員的聆聽。接下來我們將進行實機功能展示，動線規劃如下：\n"
        "第一步，我們用學生帳號登入，展示 PWA 課表、畢業門檻雷達圖與線上申辦送件；\n"
        "第二步，切換導師帳號，展示班級通知閱讀回執、導生晤談紀錄與第一關電子簽章；\n"
        "第三步，切換行政承辦帳號，展示最終核章、活動候補與最新完成的臨時調課通知；\n"
        "第四步，也是最關鍵的高潮：切換超級管理員 admin 帳號，展示『AI 智慧校園決策預警洞察中樞』的四大預警卡片，以及『全校線上會議時段衝突排程演算』的 ⚠️ 衝突警示效果！\n"
        "簡報到此結束，敬請各位審查委員指教，謝謝大家！"
    )

    output_filename = "校園智慧服務平台_專題成果簡報.pptx"
    prs.save(output_filename)
    print(f"✅ 簡報成功產出: {output_filename} (共 {len(prs.slides)} 頁投影片)")

create_deck()
