# -*- coding: utf-8 -*-
"""
build_clean_presentation.py
為《校園智慧服務平台 (Smart UKN)》打造極簡專業、大圖表展示版專題簡報 (16:9 高畫質 PPTX)。
特色：
1. 字數大幅精簡、直觀俐落、重點加粗。
2. 預留大面積【系統功能畫面截圖 / 架構圖表展示區】（模擬現代瀏覽器/App視窗外框，方便直接貼圖）。
3. 每頁保留完整「演講者備忘講稿 (Speaker Notes)」，上台報告看稿不漏講。
"""

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

# 專業科技感色彩
COLOR_BG = RGBColor(248, 250, 252)          # #F8FAFC
COLOR_NAVY = RGBColor(15, 23, 42)           # #0F172A
COLOR_PRIMARY = RGBColor(30, 58, 138)       # #1E3A8A
COLOR_BLUE = RGBColor(37, 99, 235)          # #2563EB
COLOR_SKY = RGBColor(2, 132, 199)           # #0284C7
COLOR_EMERALD = RGBColor(5, 150, 105)       # #059669
COLOR_AMBER = RGBColor(217, 119, 6)         # #D97706
COLOR_CARD_BG = RGBColor(255, 255, 255)     # #FFFFFF
COLOR_BORDER = RGBColor(226, 232, 240)      # #E2E8F0
COLOR_TEXT_MAIN = RGBColor(15, 23, 42)      # #0F172A
COLOR_TEXT_MUTED = RGBColor(100, 116, 139)  # #64748B
COLOR_MOCKUP_BG = RGBColor(241, 245, 249)   # #F1F5F9
COLOR_MOCKUP_BAR = RGBColor(226, 232, 240)  # #E2E8F0

FONT_MAIN = "Microsoft JhengHei"

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    def set_bg(slide, color=COLOR_BG):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_header(slide, badge, title, subtitle=None):
        # 標題前導藍色裝飾塊
        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.4), Inches(0.25), Inches(0.08))
        bar.fill.solid()
        bar.fill.fore_color.rgb = COLOR_BLUE
        bar.line.fill.background()

        # Badge
        bb = slide.shapes.add_textbox(Inches(1.15), Inches(0.3), Inches(5), Inches(0.3))
        p_b = bb.text_frame.paragraphs[0]
        p_b.text = badge.upper()
        p_b.font.name = FONT_MAIN
        p_b.font.size = Pt(10)
        p_b.font.bold = True
        p_b.font.color.rgb = COLOR_BLUE

        # 主標題
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.55), Inches(11.7), Inches(0.65))
        p_t = tb.text_frame.paragraphs[0]
        p_t.text = title
        p_t.font.name = FONT_MAIN
        p_t.font.size = Pt(22)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_TEXT_MAIN

        # 副標題
        if subtitle:
            sb = slide.shapes.add_textbox(Inches(0.8), Inches(1.15), Inches(11.7), Inches(0.35))
            p_s = sb.text_frame.paragraphs[0]
            p_s.text = subtitle
            p_s.font.name = FONT_MAIN
            p_s.font.size = Pt(11)
            p_s.font.color.rgb = COLOR_TEXT_MUTED

    def add_placeholder_frame(slide, left, top, width, height, mockup_title, suggest_text):
        """建立極具設計感的 UI 畫面 / 圖表展示預留框 (類似瀏覽器視窗)"""
        # 外框
        container = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        container.fill.solid()
        container.fill.fore_color.rgb = COLOR_MOCKUP_BG
        container.line.color.rgb = RGBColor(203, 213, 225)
        container.line.width = Pt(1.5)

        # 頂部視窗控制列
        bar_h = Inches(0.38)
        top_bar = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, bar_h)
        top_bar.fill.solid()
        top_bar.fill.fore_color.rgb = COLOR_MOCKUP_BAR
        top_bar.line.fill.background()

        # 三顆視窗圓點
        dot_colors = [RGBColor(239, 68, 68), RGBColor(245, 158, 11), RGBColor(16, 185, 129)]
        for i, dc in enumerate(dot_colors):
            dot = slide.shapes.add_shape(MSO_SHAPE.OVAL, left + Inches(0.15 + i * 0.18), top + Inches(0.12), Inches(0.12), Inches(0.12))
            dot.fill.solid()
            dot.fill.fore_color.rgb = dc
            dot.line.fill.background()

        # 視窗網址/標題列
        url_tb = slide.shapes.add_textbox(left + Inches(0.8), top + Inches(0.06), width - Inches(1.0), Inches(0.28))
        up = url_tb.text_frame.paragraphs[0]
        up.text = f"🖥️  {mockup_title}"
        up.font.name = FONT_MAIN
        up.font.size = Pt(9.5)
        up.font.color.rgb = COLOR_TEXT_MUTED

        # 中心提示文字
        center_tb = slide.shapes.add_textbox(left + Inches(0.3), top + Inches(1.0), width - Inches(0.6), height - Inches(1.4))
        ctf = center_tb.text_frame
        ctf.word_wrap = True

        cp1 = ctf.paragraphs[0]
        cp1.alignment = PP_ALIGN.CENTER
        cp1.text = "📷 【系統功能畫面截圖 / 圖表展示區】"
        cp1.font.name = FONT_MAIN
        cp1.font.size = Pt(14)
        cp1.font.bold = True
        cp1.font.color.rgb = COLOR_SKY
        cp1.space_after = Pt(10)

        cp2 = ctf.add_paragraph()
        cp2.alignment = PP_ALIGN.CENTER
        cp2.text = f"👉 建議放置：{suggest_text}"
        cp2.font.name = FONT_MAIN
        cp2.font.size = Pt(12)
        cp2.font.bold = True
        cp2.font.color.rgb = COLOR_TEXT_MAIN
        cp2.space_after = Pt(8)

        cp3 = ctf.add_paragraph()
        cp3.alignment = PP_ALIGN.CENTER
        cp3.text = "( 點擊此區域，即可直接貼上或置換系統實際運行截圖 / 架構圖 )"
        cp3.font.name = FONT_MAIN
        cp3.font.size = Pt(10)
        cp3.font.color.rgb = COLOR_TEXT_MUTED

    def add_compact_card(slide, left, top, width, height, title, points, border_c=COLOR_BLUE, title_c=COLOR_PRIMARY):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD_BG
        card.line.color.rgb = COLOR_BORDER
        card.line.width = Pt(1)

        # 頂部彩色裝飾線
        bar = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, Inches(0.06))
        bar.fill.solid()
        bar.fill.fore_color.rgb = border_c
        bar.line.fill.background()

        tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.12), width - Inches(0.4), height - Inches(0.25))
        tf = tb.text_frame
        tf.word_wrap = True

        p0 = tf.paragraphs[0]
        p0.text = title
        p0.font.name = FONT_MAIN
        p0.font.size = Pt(13)
        p0.font.bold = True
        p0.font.color.rgb = title_c
        p0.space_after = Pt(6)

        for pt in points:
            p = tf.add_paragraph()
            p.font.name = FONT_MAIN
            p.font.size = Pt(10.5)
            p.space_after = Pt(3)
            if isinstance(pt, tuple):
                lead, desc = pt
                r1 = p.add_run()
                r1.text = f"• {lead}："
                r1.font.bold = True
                r1.font.color.rgb = COLOR_TEXT_MAIN
                r2 = p.add_run()
                r2.text = desc
                r2.font.color.rgb = COLOR_TEXT_MUTED
            else:
                r = p.add_run()
                r.text = f"• {pt}"
                r.font.color.rgb = COLOR_TEXT_MAIN

    # ==========================================
    # SLIDE 1: 專題成果發表封面 (大器、俐落)
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    set_bg(s1, COLOR_NAVY)

    # 標籤
    tag_b = s1.shapes.add_textbox(Inches(1.2), Inches(1.3), Inches(10), Inches(0.4))
    tp = tag_b.text_frame.paragraphs[0]
    tp.text = "111 級資訊管理科畢業專題成果審查 ｜ 資訊軟體開發"
    tp.font.name = FONT_MAIN
    tp.font.size = Pt(14)
    tp.font.bold = True
    tp.font.color.rgb = COLOR_SKY

    # 題目
    tb = s1.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(11), Inches(1.6))
    p1 = tb.text_frame.paragraphs[0]
    p1.text = "校園智慧服務平台"
    p1.font.name = FONT_MAIN
    p1.font.size = Pt(46)
    p1.font.bold = True
    p1.font.color.rgb = RGBColor(255, 255, 255)

    p2 = tb.text_frame.add_paragraph()
    p2.text = "Smart UKN — 一站式多角色校務生活服務與 AI 智慧決策中樞"
    p2.font.name = FONT_MAIN
    p2.font.size = Pt(18)
    p2.font.color.rgb = RGBColor(148, 163, 184)
    p2.space_before = Pt(8)

    # 4 大重點指標膠囊
    capsules = [
        ("62 張標準資料表", COLOR_BLUE),
        ("36 條實體外鍵防護", COLOR_SKY),
        ("2,689 項測試 100% 通過", COLOR_EMERALD),
        ("AI 預警推論決策", COLOR_AMBER)
    ]
    cx = 1.2
    for c_text, c_color in capsules:
        cap = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(cx), Inches(3.8), Inches(2.55), Inches(0.45))
        cap.fill.solid()
        cap.fill.fore_color.rgb = RGBColor(30, 41, 59)
        cap.line.color.rgb = c_color
        cap.line.width = Pt(1.5)
        cp = cap.text_frame.paragraphs[0]
        cp.text = c_text
        cp.alignment = PP_ALIGN.CENTER
        cp.font.name = FONT_MAIN
        cp.font.size = Pt(11)
        cp.font.bold = True
        cp.font.color.rgb = RGBColor(241, 245, 249)
        cx += 2.75

    # 組員卡片
    mc = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(4.7), Inches(10.9), Inches(1.9))
    mc.fill.solid()
    mc.fill.fore_color.rgb = RGBColor(30, 41, 59)
    mc.line.color.rgb = RGBColor(51, 65, 85)

    mtf = mc.text_frame
    mtf.word_wrap = True
    mp0 = mtf.paragraphs[0]
    mp0.text = "【專題研發團隊】"
    mp0.font.name = FONT_MAIN
    mp0.font.size = Pt(12)
    mp0.font.bold = True
    mp0.font.color.rgb = COLOR_SKY
    mp0.space_after = Pt(4)

    team_line1 = mtf.add_paragraph()
    team_line1.text = "• 專題組員：張晴茹 (111534117) ｜ 陳奕臻 (111534121) ｜ 王博慶 (111534123) ｜ 呂泑禎 (111534130)"
    team_line1.font.name = FONT_MAIN
    team_line1.font.size = Pt(12)
    team_line1.font.bold = True
    team_line1.font.color.rgb = RGBColor(255, 255, 255)

    team_line2 = mtf.add_paragraph()
    team_line2.text = "• 核心分工：學生生活服務 ｜ 導師行政流轉 ｜ AI 決策中樞與 DB 治理 ｜ 課務調課通知與知識庫"
    team_line2.font.name = FONT_MAIN
    team_line2.font.size = Pt(11)
    team_line2.font.color.rgb = RGBColor(203, 213, 225)
    team_line2.space_before = Pt(2)

    team_line3 = mtf.add_paragraph()
    team_line3.text = "• 指導教授：彭賓鈺 老師  ｜  學校單位：康寧大學 資訊管理科  ｜  審查日期：115 年 11 月"
    team_line3.font.name = FONT_MAIN
    team_line3.font.size = Pt(10.5)
    team_line3.font.color.rgb = RGBColor(148, 163, 184)
    team_line3.space_before = Pt(6)

    s1.notes_slide.notes_text_frame.text = (
        "【開場講稿】：\n"
        "各位評審委員好，我們是 111 級資管科專題組，組員為張晴茹、陳奕臻、王博慶與呂泑禎，指導老師為彭賓鈺老師。\n"
        "今天由我代表全組報告《校園智慧服務平台 (Smart UKN)》。\n"
        "我們以極簡流暢的一站式校園服務為核心，完成了 62 張標準資料表治理、全系統 2,689 項測試通過，並在管理端實作了 AI 決策預警與視訊會議時段衝突排程演算。"
    )

    # ==========================================
    # SLIDE 2: 現行校園四大痛點 (直觀對比)
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    set_bg(s2)
    add_header(s2, "Pain Points", "現行校園四大服務痛點分析", "傳統校園行政與資訊孤島現象，造成學生不便、行政耗時與管理被動")

    pains = [
        ("痛點 1：資訊孤島，法規查找難", [
            ("規章多為靜態 PDF", "分散於各處室網頁，學生難找"),
            ("口語搜尋無法命中", "輸入「被當」查不到正式學則"),
            ("缺乏單一整合入口", "校曆、成績、公告各行其是")
        ], COLOR_BLUE, COLOR_PRIMARY),
        ("痛點 2：紙本流程繁瑣，審核冗長", [
            ("跨處室奔波簽核", "補考、請假、折抵須跑多個單位"),
            ("進度不透明", "送件後不知卡在哪一關卡"),
            ("缺件退件溝通成本高", "缺乏線上即時補件提醒機制")
        ], COLOR_SKY, COLOR_PRIMARY),
        ("痛點 3：師生溝通割裂，隱私顧慮", [
            ("班級通知缺閱讀回執", "導師發公告不知學生誰看了沒"),
            ("輔導紀錄外洩風險", "學生晤談敏感情況需高度隔離"),
            ("生活申辦各自為政", "宿舍、置物櫃無統一管理管道")
        ], COLOR_EMERALD, COLOR_PRIMARY),
        ("痛點 4：管理被動，缺乏前瞻預警", [
            ("被動應對學業危機", "期末才發現被扣考或擋修延畢"),
            ("跨處室會議常撞期", "缺乏時段重疊衝突排程演算"),
            ("管理缺乏審計軌跡", "歷史異動無不可篡改日誌留痕")
        ], COLOR_AMBER, COLOR_PRIMARY)
    ]
    for idx, (title, pts, bc, tc) in enumerate(pains):
        r = idx // 2
        c = idx % 2
        add_compact_card(s2, Inches(0.8 + c * 5.95), Inches(1.7 + r * 2.7), Inches(5.75), Inches(2.45), title, pts, bc, tc)

    s2.notes_slide.notes_text_frame.text = (
        "【第 2 頁講稿】：\n"
        "我們深度歸納了校園四大痛點：規章像迷宮難查、紙本流程跑腿耗時、師生通知缺乏回執與隱私保護、以及管理端缺乏前瞻預警。\n"
        "Smart UKN 平台就是要將這些痛點化為智慧服務！"
    )

    # ==========================================
    # SLIDE 3: 系統總體架構 (左文字 + 右架構圖展示區)
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    set_bg(s3)
    add_header(s3, "Architecture", "系統總體架構與技術棧規劃", "前端 SPA+PWA ｜ 後端 Flask RESTful ｜ 資料庫 3NF ｜ RBAC 權限體系")

    # 左側：精簡技術層次 (寬度 5.2 吋)
    arch_pts = [
        ("前端展示層 (SPA + PWA)", "原生 HTML5/JS/CSS3，免大型框架，支援手機加入主畫面與離線快取 (v54)"),
        ("後端服務層 (RESTful API)", "Python Flask 模組化 Blueprint 設計，自研 AI 決策推論與會議衝突排程演算"),
        ("資料持久層 (MySQL 3NF)", "全校 62 張標準資料表、36 條實體 Foreign Key 強約束，零孤立資料"),
        ("安全防護層 (RBAC 矩陣)", "7 大角色隔離、admin 鎖定防誤刪、全站中文密碼防呆、不可篡改 Audit Log")
    ]
    add_compact_card(s3, Inches(0.8), Inches(1.7), Inches(5.2), Inches(5.2), "四層軟體工程架構", arch_pts, COLOR_BLUE, COLOR_PRIMARY)

    # 右側：【架構圖展示區】 (寬度 6.3 吋)
    add_placeholder_frame(
        s3,
        Inches(6.2), Inches(1.7), Inches(6.3), Inches(5.2),
        "smart-ukn.system-architecture.diagram",
        "系統總體技術架構圖 / 前後端與資料庫微服務拓撲圖"
    )

    s3.notes_slide.notes_text_frame.text = (
        "【第 3 頁講稿】：\n"
        "本平台遵循現代軟體工程規範：前端 PWA 支援離線與加入主畫面；後端以 Flask RESTful 實現 AI 預警；資料庫由 62 張正規化表與 36 條外鍵守護；最外層構築 RBAC 安全防線。"
    )

    # ==========================================
    # SLIDE 4: 系統核心功能全景地圖 (4 大象限)
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    set_bg(s4)
    add_header(s4, "Feature Landscape", "系統核心功能全景地圖 (四大模組 × 七大角色)", "涵蓋超過 30+ 項校務與生活功能，滿足學生、家長、導師、行政與管理員全方位需求")

    landscape = [
        ("一、學生智慧生活服務模組", [
            ("個人化動態課表", "週課表渲染、空堂智慧標示"),
            ("課程地圖與修課檢視", "專業必選修圖解、擋修路徑樹"),
            ("畢業門檻雷達圖", "學分、操行、證照、服務學習進度"),
            ("獎助學金智慧推薦", "依條件自動標記符合項目"),
            ("宿舍與置物櫃在線選填", "多階段抽籤、床位自選、租借登記")
        ], COLOR_BLUE, COLOR_PRIMARY),
        ("二、導師與教學工作台模組", [
            ("班級通知回執追蹤", "已讀/未讀名冊、一鍵催簽提醒"),
            ("導生晤談紀錄隔離", "輔導建檔、待辦追蹤、敏感隱私防護"),
            ("幹部名冊與群組指派", "動態任命幹部、專案輔導分組"),
            ("操行評核與獎懲審核", "日常加減分、曠缺自動扣分建議"),
            ("臨時停調課即時推播", "課表同步更新，杜絕撲空跑錯教室")
        ], COLOR_SKY, COLOR_PRIMARY),
        ("三、行政作業與線上申辦模組", [
            ("多關卡線上審批流水線", "補考/請假/折抵，自動排定審核關卡"),
            ("動態電子印鑑蓋印", "各級主管專屬電子印章、防偽時戳"),
            ("臨時停調課通知審核", "新增 course_changes 模組連動課表"),
            ("校園活動與候補簽到", "名額管控、自動候補遞補、QR 報到"),
            ("訪客預約與表單下載", "參訪人數限制、處室表單權限過濾")
        ], COLOR_EMERALD, COLOR_PRIMARY),
        ("四、系統管理與 AI 決策中樞", [
            ("四大 AI 決策預警洞察", "擋修鏈斷裂、缺課扣考、同義詞採納"),
            ("全校線上會議時段衝突演算", "Jitsi 視訊、衝突偵測 ⚠️、穿透名單"),
            ("帳號管理與全站安全防呆", "RBAC 矩陣、admin 防誤刪、中文防呆"),
            ("不可篡改 Audit Log", "全自動記錄變更前/後 JSON 與 IP"),
            ("56 項全功能健康體檢", "3 秒完成端點、DB 與安全策略診斷")
        ], COLOR_AMBER, COLOR_PRIMARY)
    ]
    for idx, (title, pts, bc, tc) in enumerate(landscape):
        r = idx // 2
        c = idx % 2
        add_compact_card(s4, Inches(0.8 + c * 5.95), Inches(1.7 + r * 2.7), Inches(5.75), Inches(2.45), title, pts, bc, tc)

    s4.notes_slide.notes_text_frame.text = (
        "【第 4 頁講稿】：\n"
        "這是我們的功能全景圖：四大維度、超過 30 項模組，貫穿學生入學、修課、申辦、生活到畢業全生命週期。"
    )

    # ==========================================
    # SLIDE 5: 學生端：動態課表與畢業審查 (左字 + 右圖展示區)
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    set_bg(s5)
    add_header(s5, "Student Academics", "學生端亮點：個人動態課表與畢業門檻審查", "週課表空堂分析 ｜ 課程地圖擋修圖解 ｜ 畢業學分雷達圖 ｜ 獎助學金比對")

    s5_pts = [
        ("個人動態課表與空堂", "視覺化渲染每週節次、教室與教師，自動標示無課空堂時段"),
        ("課程地圖擋修路徑樹", "清晰標記先修/後修關係（如基礎及格方可修進階），杜絕盲目選課"),
        ("多維度畢業審查雷達圖", "即時計算必修、選修、通識學分差距，學分不足主動標記 ⚠️ 預警"),
        ("獎助學金智慧媒合", "比對 GPA、操行與身分（低收/原民），自動標記『✅ 符合條件』")
    ]
    add_compact_card(s5, Inches(0.8), Inches(1.7), Inches(5.2), Inches(5.2), "核心修課與畢業功能", s5_pts, COLOR_BLUE, COLOR_PRIMARY)

    add_placeholder_frame(
        s5,
        Inches(6.2), Inches(1.7), Inches(6.3), Inches(5.2),
        "https://smart.ukn.edu.tw/student/schedule-and-audit",
        "學生週課表視覺化畫面 ＋ 畢業門檻學分雷達圖截圖"
    )

    s5.notes_slide.notes_text_frame.text = (
        "【第 5 頁講稿】：\n"
        "學生端最直觀的亮點是動態課表與畢業門檻雷達圖：不僅空堂一目了然，修課學分缺口也以視覺化雷達圖呈現，並具備獎助學金自動媒合。"
    )

    # ==========================================
    # SLIDE 6: 學生端：校園生活與宿舍選填 (左字 + 右圖展示區)
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    set_bg(s6)
    add_header(s6, "Campus Life", "學生端亮點：宿舍選填、置物櫃與口語化法規搜尋", "宿舍床位線上抽籤 ｜ 置物櫃在線租借 ｜ 口語同義詞搜尋 ｜ 表單星號收藏")

    s6_pts = [
        ("宿舍床位線上選填與抽籤", "多階段審核抽籤，即時呈現各棟宿舍剩餘床位 (A/B/C/D)，防重複選填"),
        ("校園置物櫃在線租借", "即時呈現 A、C 棟樓層置物櫃佔用狀態，線上選櫃直接送出"),
        ("口語化校規搜尋引擎", "輸入口語「被當」、「休學」自動對照官方「不及格重補修」、「保留學籍規章」"),
        ("表單一鍵下載與個人收藏", "依身分權限過濾表單檔案，支援星號常用收藏與下載歷程記錄")
    ]
    add_compact_card(s6, Inches(0.8), Inches(1.7), Inches(5.2), Inches(5.2), "校園生活與資源申請", s6_pts, COLOR_SKY, COLOR_PRIMARY)

    add_placeholder_frame(
        s6,
        Inches(6.2), Inches(1.7), Inches(6.3), Inches(5.2),
        "https://smart.ukn.edu.tw/campus/dorm-and-lockers",
        "宿舍床位多階段選填介面 ＋ 口語化法規搜尋命中結果截圖"
    )

    s6.notes_slide.notes_text_frame.text = (
        "【第 6 頁講稿】：\n"
        "生活服務模組提供宿舍線上床位即時選填與置物櫃在線租借；法規知識庫更具備同義詞映射，輸入口語也能秒查官方學則規章。"
    )

    # ==========================================
    # SLIDE 7: 導師端：班級輔導與通知回執 (左字 + 右圖展示區)
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    set_bg(s7)
    add_header(s7, "Teacher Workbench", "導師工作台：通知回執儀表板與晤談隱私隔離", "已讀未讀名單 ｜ 一鍵催簽 ｜ 導生晤談隱私隔離 ｜ 操行加減分聯動")

    s7_pts = [
        ("班級通知與閱讀回執追蹤", "發布班級重要公告，即時掌握全班『誰已讀、誰未讀』並支援一鍵催簽"),
        ("導生關懷晤談隱私保護", "記錄晤談形式與主題，高敏隱私資料隔離（學生與家長端完全不可見）"),
        ("班級幹部與群組動態指派", "靈活指派班代、副班代，自訂輔導專案群組落實分層班務治理"),
        ("操行成績與缺曠統計聯動", "日常表現加減分評定，自動比對曠課時數提供扣分建議，保障客觀公平")
    ]
    add_compact_card(s7, Inches(0.8), Inches(1.7), Inches(5.2), Inches(5.2), "導師班級治理工作台", s7_pts, COLOR_EMERALD, COLOR_PRIMARY)

    add_placeholder_frame(
        s7,
        Inches(6.2), Inches(1.7), Inches(6.3), Inches(5.2),
        "https://smart.ukn.edu.tw/teacher/notices-and-counseling",
        "班級通知【閱讀回執已讀未讀名單】儀表板 ＋ 晤談追蹤介面截圖"
    )

    s7.notes_slide.notes_text_frame.text = (
        "【第 7 頁講稿】：\n"
        "導師工作台解決了通知不透明的痛點：班級通知具備已讀未讀名單，可一鍵催簽；導生晤談紀錄受到嚴密隱私隔離，安全無虞。"
    )

    # ==========================================
    # SLIDE 8: 行政端：線上申辦與動態電子簽章 (左字 + 右圖展示區)
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    set_bg(s8)
    add_header(s8, "E-Workflow & E-Seal", "行政端亮點：多關卡線上申辦與動態電子簽章", "100% 無紙化流程 ｜ 階層式審批 ｜ 專屬電子印鑑章蓋印 ｜ 臨時調課推播")

    s8_pts = [
        ("線上多關卡審核流水線", "補考、折抵、請假依序推進（送件->導師->主任->處室），進度即時可視"),
        ("動態電子印章防偽蓋印", "審核通過自動加蓋主管專屬電子印鑑章，附帶帳號、IP 與時戳防偽"),
        ("臨時停課／調課推播 (新表)", "教師線上申請調課，課務審核通過即刻推播至班級課表，避免學生白跑"),
        ("活動候補遞補與 QR 簽到", "正取取消自動依序遞補候補名額，活動現場手機掃描 QR 碼 1 秒簽到")
    ]
    add_compact_card(s8, Inches(0.8), Inches(1.7), Inches(5.2), Inches(5.2), "無紙化申辦與調課推播", s8_pts, COLOR_BLUE, COLOR_PRIMARY)

    add_placeholder_frame(
        s8,
        Inches(6.2), Inches(1.7), Inches(6.3), Inches(5.2),
        "https://smart.ukn.edu.tw/admin/workflow-and-e-seal",
        "線上申辦【動態電子印章蓋印覆核】畫面 ＋ 臨時調課通知推播截圖"
    )

    s8.notes_slide.notes_text_frame.text = (
        "【第 8 頁講稿】：\n"
        "行政端實現了 100% 無紙化：多關卡審核流水線自動蓋上專屬主管電子印章；新增的 course_changes 讓教師調課直接推播至學生課表。"
    )

    # ==========================================
    # SLIDE 9: 管理端：AI 決策預警洞察中樞 (左字 + 右圖展示區)
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    set_bg(s9)
    add_header(s9, "AI Insights Hub", "管理端核心：智慧校園 AI 決策與異常預警中樞", "四大 AI 交叉推論模型 ｜ 主動預警 ｜ 搜尋未命中詞自主採納 ｜ 降低延畢扣考")

    s9_pts = [
        ("模型 1：擋修鏈斷裂風險預警", "比對先修科目及格狀態與課程地圖，提前發掘下學期選課受阻名單"),
        ("模型 2：1/3 缺課扣考警戒", "實時比對出缺勤與總學時，曠課達 1/4 (警戒) 與 1/3 (扣考) 主動警示"),
        ("模型 3：搜尋意圖自主學習成長", "統計學生未命中搜尋詞，後台點選『一鍵採納為同義詞』前後台即時生效"),
        ("模型 4：校園空間資源排程優化", "偵測教室與會議室閒置黃金時段，提出分流建議，降低能源浪費")
    ]
    add_compact_card(s9, Inches(0.8), Inches(1.7), Inches(5.2), Inches(5.2), "四大主動式 AI 預警模型", s9_pts, COLOR_AMBER, COLOR_PRIMARY)

    add_placeholder_frame(
        s9,
        Inches(6.2), Inches(1.7), Inches(6.3), Inches(5.2),
        "https://smart.ukn.edu.tw/admin/smart-insights",
        "【智慧校園 AI 決策中心】四大彩色預警卡片與一鍵採納功能介面截圖"
    )

    s9.notes_slide.notes_text_frame.text = (
        "【第 9 頁講稿】：\n"
        "這是我們的技術高潮——AI 決策中樞！四大模型打破傳統系統事後紀錄的被動缺陷：提前發掘擋修斷鏈學生、缺課扣考預警、未命中詞一鍵採納，讓系統越用越聰明！"
    )

    # ==========================================
    # SLIDE 10: 管理端：會議中控與時段衝突演算 (左字 + 右圖展示區)
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    set_bg(s10)
    add_header(s10, "Collision Algorithm", "管理端核心：全校會議中控台與時段衝突演算", "輕量 Jitsi 視訊整合 ｜ O(N log N) 區間排程重疊演算 ｜ ⚠️ 衝突標記 ｜ 穿透名單")

    s10_pts = [
        ("Jitsi 全校視訊會議整合", "免額外安裝 App，瀏覽器即開即會，動態產生會議房號確保資安"),
        ("時段重疊衝突偵測演算法", "後端即時掃描全日會議時段，重疊時自動標註 ⚠️「時段衝突」警示徽章"),
        ("穿透式與會名單審查", "點擊會議直接穿透調閱與會人員姓名、處室，避免主管同一時段被雙重排會"),
        ("全局管理與一鍵取消調度", "管理員擁有全校協調視角，可一鍵取消或調整衝突會議，恢復排程秩序")
    ]
    add_compact_card(s10, Inches(0.8), Inches(1.7), Inches(5.2), Inches(5.2), "視訊中控與排程演算", s10_pts, COLOR_SKY, COLOR_PRIMARY)

    add_placeholder_frame(
        s10,
        Inches(6.2), Inches(1.7), Inches(6.3), Inches(5.2),
        "https://smart.ukn.edu.tw/admin/meeting-central",
        "【全校線上會議中控台】⚠️ 時段衝突警告徽章 ＋ 穿透式與會名單截圖"
    )

    s10.notes_slide.notes_text_frame.text = (
        "【第 10 頁講稿】：\n"
        "我們整合了輕量 Jitsi 視訊，並自研『時段重疊衝突偵測演算法』：一旦兩場會議時間或場地撞期，系統自動跳出 ⚠️ 衝突警示，並支援穿透查看主管名單，防止會議撞期排程混亂！"
    )

    # ==========================================
    # SLIDE 11: 系統安全防禦與審計追蹤 (左字 + 右圖展示區)
    # ==========================================
    s11 = prs.slides.add_slide(blank_layout)
    set_bg(s11)
    add_header(s11, "Security & Audit", "系統安全防禦、防呆機制與不可篡改審計日誌", "RBAC 7 大角色隔離 ｜ admin 帳號鎖定 ｜ 中文密碼防呆攔截 ｜ 金融級 Audit Log")

    s11_pts = [
        ("RBAC 7 大角色嚴格隔離", "學生、家長、教師、導師、行政、科助與超級管理員，嚴防越權存取"),
        ("admin 帳號防誤刪保護", "超級管理員帳號系統層級鎖定，禁止刪除或停用，處室保持中立空值"),
        ("全站密碼輸入防呆攔截", "登入與改密表單前/後端即時攔截中文與全形字元，杜絕誤設死鎖"),
        ("不可篡改 Audit Log 審計", "自動留存操作人、真實 IP、變更前/後 JSON 與時戳，只讀防竄改")
    ]
    add_compact_card(s11, Inches(0.8), Inches(1.7), Inches(5.2), Inches(5.2), "多層資安防禦體系", s11_pts, COLOR_EMERALD, COLOR_PRIMARY)

    add_placeholder_frame(
        s11,
        Inches(6.2), Inches(1.7), Inches(6.3), Inches(5.2),
        "https://smart.ukn.edu.tw/admin/audit-logs",
        "【Audit Log 審計日誌】記錄變更前後 JSON 對比 ＋ 中文密碼攔截提示截圖"
    )

    s11.notes_slide.notes_text_frame.text = (
        "【第 11 頁講稿】：\n"
        "系統具備完善的資安與防呆：RBAC 七大角色隔離、admin 帳號誤刪防護鎖定、全站中文密碼防呆攔截，以及記錄變更前後 JSON 的不可篡改審計日誌。"
    )

    # ==========================================
    # SLIDE 12: 資料庫架構治理：62 表與 3NF 正規化 (左字 + 右圖展示區)
    # ==========================================
    s12 = prs.slides.add_slide(blank_layout)
    set_bg(s12)
    add_header(s12, "Database 3NF", "資料庫架構治理：62 表與嚴格第三正規化 (3NF)", "徹底消除資料冗餘與更新異常 ｜ 36 條實體外鍵零孤立 ｜ 922 筆學分 ｜ 75 位學生")

    s12_pts = [
        ("62 張標準資料表 (Tables)", "全面落實第三正規化 (3NF)，解耦學籍、帳號、課表、成績與申辦"),
        ("36 條實體外鍵約束 (FKs)", "100% 外鍵防護無瑕疵，嚴格阻絕 #1452 資料孤立不一致錯誤"),
        ("完整學籍與成績數據", "內含 75 位學生學籍、922 筆歷年學分成績、161 筆學生紀錄、97 位帳號"),
        ("新增 course_changes 模組", "成功整併 31 匯出檔中停調課通知表，包含 15 個完整欄位與複合索引")
    ]
    add_compact_card(s12, Inches(0.8), Inches(1.7), Inches(5.2), Inches(5.2), "資料庫治理關鍵數據", s12_pts, COLOR_BLUE, COLOR_PRIMARY)

    add_placeholder_frame(
        s12,
        Inches(6.2), Inches(1.7), Inches(6.3), Inches(5.2),
        "smart_ukn.database-er-model.schema",
        "62 張資料表 ER-Model 實體關聯圖 / 36 條外鍵拓撲關係圖"
    )

    s12.notes_slide.notes_text_frame.text = (
        "【第 12 頁講稿】：\n"
        "資料庫治理方面，我們維持了 62 張正規化表、36 條無暇外鍵約束，並保有 922 筆真實修課成績與 75 位學生學籍，同時成功納入 course_changes 停調課模組。"
    )

    # ==========================================
    # SLIDE 13: 軟體工程品質：2,689 測試與 56 項體檢 (左字 + 右圖展示區)
    # ==========================================
    s13 = prs.slides.add_slide(blank_layout)
    set_bg(s13)
    add_header(s13, "Software QA & Tests", "軟體工程品質保證：全系統 2,689 項自動化測試", "100% 測試成功率 ｜ 56 項一鍵全功能健康體檢 ｜ PWA v54 快取 ｜ Git 語意化規範")

    s13_pts = [
        ("全系統 2,689 項測試 100% 通過", "涵蓋權限、表單、簽章、AI 預警推論、資料庫外鍵，耗時 125s 全數通過"),
        ("後台 56 項一鍵全功能健康體檢", "自動掃描 API 端點、資料庫連線池、資安策略，3 秒產出健康報告"),
        ("PWA 漸進快取升級 (v54)", "Service Worker 版本化快取策略，確保離線可用且發布時平滑無感更新"),
        ("Git 規範與持續交付", "多人分支協同、Conventional Commits 語意化日誌，具備商業級交付水準")
    ]
    add_compact_card(s13, Inches(0.8), Inches(1.7), Inches(5.2), Inches(5.2), "工程品質與自動化驗證", s13_pts, COLOR_EMERALD, COLOR_PRIMARY)

    add_placeholder_frame(
        s13,
        Inches(6.2), Inches(1.7), Inches(6.3), Inches(5.2),
        "terminal.pytest-2689-passed.report",
        "Pytest 2,689 項測試 100% 通過終端輸出截圖 ＋ 56 項一鍵健康體檢報告"
    )

    s13.notes_slide.notes_text_frame.text = (
        "【第 13 頁講稿】：\n"
        "在工程品質上，全系統 2,689 項自動化測試 100% 通過，並內建 56 項一鍵全站健康體檢，展現極高技術穩定度與零回歸錯誤保證。"
    )

    # ==========================================
    # SLIDE 14: 專題小組分工與進度里程碑 (4 卡片)
    # ==========================================
    s14 = prs.slides.add_slide(blank_layout)
    set_bg(s14)
    add_header(s14, "Team Contributions", "專題小組成員分工與里程碑進度表", "四位專題生緊密合作，負責項目全數達成 100% 開發、功能測試與自動化驗證")

    team = [
        ("張晴茹 (111534117)", "學生端核心生活服務", [
            ("個人首頁與課表", "PWA 加入主畫面、動態課表"),
            ("畢業門檻雷達圖", "學分達成率計算與預警"),
            ("獎助學金智慧推薦", "身分成績條件智慧媒合"),
            ("宿舍與置物櫃申辦", "多階段床位選填與在線租借"),
            ("口語化法規搜尋", "同義詞映射與常用表單收藏")
        ], COLOR_BLUE, "進度 100%"),
        ("陳奕臻 (111534121)", "教學、導師與行政申辦", [
            ("個人動態課表分析", "空堂分析、上課教室即時提示"),
            ("線上申辦電子簽章", "多關卡審核流水線、電子印章"),
            ("班級通知回執催簽", "已讀未讀統計儀表板、催簽"),
            ("導生關懷晤談紀錄", "輔導建檔、待辦、敏感隱私隔離"),
            ("校園活動候補簽到", "活動名額控管、候補、QR 簽到")
        ], COLOR_SKY, "進度 100%"),
        ("王博慶 (111534123)", "AI 決策、系統安全與 DB", [
            ("AI 決策預警中樞", "擋修鏈斷裂、缺課扣考預警"),
            ("線上會議衝突演算", "Jitsi 視訊、O(N log N) 衝突演算"),
            ("帳號管理與全站防呆", "RBAC 矩陣、admin 防誤刪、中文防呆"),
            ("不可篡改 Audit Log", "記錄變更前/後 JSON 與時戳"),
            ("DB 3NF 架構治理", "62 表結構治理、36 外鍵校驗")
        ], COLOR_EMERALD, "進度 100%"),
        ("呂泑禎 (111534130)", "課務異動與校務行政", [
            ("臨時停調課通知", "新增 course_changes 模組與課表連動"),
            ("校曆與個人行事曆", "官方行事曆與國定假日排程同步"),
            ("知識庫法規分類管理", "教務、學務、總務法規條文維護"),
            ("常用表單檔案整理", "表單檔案分類上架與下載權限"),
            ("訪客參訪線上預約", "外賓參訪申請與名額容量審核")
        ], COLOR_AMBER, "進度 100%")
    ]
    for idx, (name, role, pts, bc, ptag) in enumerate(team):
        add_compact_card(s14, Inches(0.8 + idx * 2.95), Inches(1.7), Inches(2.85), Inches(5.2), f"{name}\n({role})", pts, bc, COLOR_PRIMARY)

    s14.notes_slide.notes_text_frame.text = (
        "【第 14 頁講稿】：\n"
        "本組四位成員各司其職、通力合作：張晴茹負責學生生活服務，陳奕臻負責教學與行政簽核，我（王博慶）負責 AI 決策中樞、會議衝突演算法與 DB 3NF 治理，呂泑禎負責課務調課通知與知識庫。全員達成率 100%！"
    )

    # ==========================================
    # SLIDE 15: 專題效益評估與未來展望 (4 象限)
    # ==========================================
    s15 = prs.slides.add_slide(blank_layout)
    set_bg(s15)
    add_header(s15, "Impact & Roadmap", "專題效益評估、創新價值與未來展望", "從行政無紙化、學生生活賦能到數據智慧決策，全面推動康寧大學智慧校園數位轉型")

    impacts = [
        ("實質量化效益 (Measurable Impact)", [
            ("行政無紙化達成 100%", "申辦、核章、調課線上化，年省逾 3 萬張紙"),
            ("查詢申辦效率提升 80%", "單一入口免跑處室，30 秒快速送件"),
            ("重要通知催簽率達 95%", "閱讀回執即時追蹤，確保重要訊息必達"),
            ("會議時段衝突率歸零", "演算法實時把關，徹底根除會議撞期排程混亂")
        ], COLOR_BLUE, COLOR_PRIMARY),
        ("核心創新價值 (Core Innovation)", [
            ("從被動處置轉型為主動預警", "擋修斷鏈與缺課扣考前瞻預警，降低延畢危機"),
            ("同義詞自主進化成長", "未命中搜尋詞自主學習，一鍵採納擴充字典"),
            ("金融級嚴密安全防禦", "RBAC 7 大角色隔離、admin 誤刪鎖定、審計日誌"),
            ("標準 3NF 高可擴充資料庫", "62 表標準正規化，具備商業級交付彈性")
        ], COLOR_SKY, COLOR_PRIMARY),
        ("未來功能藍圖 (Future Roadmap)", [
            ("實體 IoT 門禁連動", "宿舍選填連動學生證悠遊卡或 QR 扣款開門"),
            ("LINE 官方帳號推播", "扣考預警與調課通知直接傳送至學生手機 LINE"),
            ("生成式 AI 校園秘書", "整合 LLM 大型模型，提供 24 小時自然語言諮詢"),
            ("智慧綠色校園節能", "結合課表與教室空調電力，自動排程節能減碳")
        ], COLOR_EMERALD, COLOR_PRIMARY),
        ("專題總結 (Conclusion)", [
            ("完整落實軟體工程全生命週期", "需求、設計、3NF 正規化、測試到上線全數完成"),
            ("2,689 項測試守護品質", "零重大缺陷，系統運作流暢穩健，展現資管技術實力"),
            ("貼合康寧大學真實需求", "每一項模組皆切合師生日常校務痛點，具備上線水準"),
            ("成果圓滿，隨時可商用部署", "完善的自動化部署與種子數據，隨時準備就緒")
        ], COLOR_AMBER, COLOR_PRIMARY)
    ]
    for idx, (title, pts, bc, tc) in enumerate(impacts):
        r = idx // 2
        c = idx % 2
        add_compact_card(s15, Inches(0.8 + c * 5.95), Inches(1.7 + r * 2.7), Inches(5.75), Inches(2.45), title, pts, bc, tc)

    s15.notes_slide.notes_text_frame.text = (
        "【第 15 頁講稿】：\n"
        "總結本專題：實質效益上達成 100% 無紙化與效率提升 80%；創新上實現主動 AI 預警；未來更能對接 LINE 與 IoT 門禁設備。Smart UKN 已具備成熟上線水準！"
    )

    # ==========================================
    # SLIDE 16: 實機展示規劃與 Q&A (大器壓軸)
    # ==========================================
    s16 = prs.slides.add_slide(blank_layout)
    set_bg(s16, COLOR_NAVY)

    # 頂部標題
    tb16 = s16.shapes.add_textbox(Inches(1.2), Inches(0.9), Inches(11), Inches(1.2))
    p16_sub = tb16.text_frame.paragraphs[0]
    p16_sub.text = "LIVE DEMONSTRATION & Q&A"
    p16_sub.font.name = FONT_MAIN
    p16_sub.font.size = Pt(13)
    p16_sub.font.bold = True
    p16_sub.font.color.rgb = COLOR_SKY

    p16_t = tb16.text_frame.add_paragraph()
    p16_t.text = "實機功能展示與審查委員問答"
    p16_t.font.name = FONT_MAIN
    p16_t.font.size = Pt(36)
    p16_t.font.bold = True
    p16_t.font.color.rgb = RGBColor(255, 255, 255)
    p16_t.space_before = Pt(4)

    # 4 步驟實機展示卡片
    steps = [
        ("步驟一：學生端體驗", "student1 / 123456", [
            "PWA 個人課表與空堂分析",
            "畢業門檻學分雷達圖審查",
            "獎助學金比對與宿舍選填",
            "線上填寫補考申請表並送出"
        ], COLOR_BLUE),
        ("步驟二：導師端審核", "teacher1 / 123456", [
            "班級通知【閱讀回執與催簽】",
            "導生關懷晤談紀錄（隱私隔離）",
            "學生申辦第一關【電子印章蓋印】",
            "操行評核日常加減分評定"
        ], COLOR_SKY),
        ("步驟三：行政端協同", "staff1 / 123456", [
            "線上申辦處室覆核與 PDF 匯出",
            "臨時調課通知發布與課表連動",
            "活動自動候補遞補與 QR 簽到",
            "重要規章表單下載與收藏"
        ], COLOR_EMERALD),
        ("步驟四：AI 管理壓軸", "admin / admin123", [
            "【智慧校園 AI 決策預警中樞】",
            "【全校會議時段衝突排程演算 ⚠️】",
            "未命中詞一鍵採納為同義詞即時生效",
            "不可篡改 Audit Log 審計追蹤"
        ], COLOR_AMBER)
    ]
    for idx, (stitle, cred, pts, bc) in enumerate(steps):
        x = Inches(1.2 + idx * 2.75)
        y = Inches(2.4)
        c = s16.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(2.6), Inches(3.7))
        c.fill.solid()
        c.fill.fore_color.rgb = RGBColor(30, 41, 59)
        c.line.color.rgb = bc
        c.line.width = Pt(1.5)

        ctb = s16.shapes.add_textbox(x + Inches(0.15), y + Inches(0.15), Inches(2.3), Inches(3.4))
        ctf = ctb.text_frame
        ctf.word_wrap = True

        cp0 = ctf.paragraphs[0]
        cp0.text = stitle
        cp0.font.name = FONT_MAIN
        cp0.font.size = Pt(13)
        cp0.font.bold = True
        cp0.font.color.rgb = RGBColor(255, 255, 255)

        cp_sub = ctf.add_paragraph()
        cp_sub.text = f"帳號: {cred}"
        cp_sub.font.name = FONT_MAIN
        cp_sub.font.size = Pt(10)
        cp_sub.font.color.rgb = bc
        cp_sub.space_after = Pt(8)

        for pt in pts:
            p_it = ctf.add_paragraph()
            p_it.font.name = FONT_MAIN
            p_it.font.size = Pt(10)
            p_it.space_after = Pt(4)
            r = p_it.add_run()
            r.text = f"✔ {pt}"
            r.font.color.rgb = RGBColor(203, 213, 225)

    thanks_box = s16.shapes.add_textbox(Inches(1.2), Inches(6.35), Inches(10.9), Inches(0.6))
    p_th = thanks_box.text_frame.paragraphs[0]
    p_th.text = "感謝 指導教授 彭賓鈺 老師 及各位審查委員的悉心指導！ 敬請 批評指教。"
    p_th.alignment = PP_ALIGN.CENTER
    p_th.font.name = FONT_MAIN
    p_th.font.size = Pt(13)
    p_th.font.bold = True
    p_th.font.color.rgb = RGBColor(241, 245, 249)

    s16.notes_slide.notes_text_frame.text = (
        "【結尾與實機展示講稿】：\n"
        "感謝各位委員聆聽。接下來我們將進行實機功能展示：\n"
        "從學生端送件、導師端催簽與蓋印、行政端調課，到壓軸展示管理端的『AI 決策預警』與『線上會議時段衝突排程演算』。\n"
        "簡報到此結束，謝謝大家！"
    )

    out_file = "校園智慧服務平台_專題成果簡報.pptx"
    prs.save(out_file)
    print(f"✅ 極簡大圖版簡報成功產出: {out_file} (共 {len(prs.slides)} 頁投影片)")

create_deck()
