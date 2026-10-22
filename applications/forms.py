"""
申辦表單範本：同一份定義同時產生
- 可列印 / 下載 Word 的空白表單與「填寫範例」(/forms/<code>)
- 線上申請要填的欄位 (欄位 example 也當成輸入框的提示)
- 線上申請的簽核關卡 (signers 依序簽核，最後一位核准即完成)

signers 的 role：老師 = 導師班老師可簽 (教職員/管理員也可代為處理)；教職員 = 處室承辦人
"""

# 每張表單都有的申請人基本資料 (線上申請時由登入帳號自動帶入，電話由學生填)
COMMON_FIELDS = [
    {"key": "student_id", "label": "學號", "example": "S112001", "auto": True},
    {"key": "full_name", "label": "姓名", "example": "王小明", "auto": True},
    {"key": "class_name", "label": "班級", "example": "資管四忠", "auto": True},
    {"key": "phone", "label": "聯絡電話", "example": "0912-345-678", "tip": "填自己的手機，處室有問題才找得到你"},
]

SUBMIT_STAGE = {"name": "線上送出", "icon": "📤", "role": "學生"}
DONE_STAGE = {"name": "完成", "icon": "✅", "role": None}

FORMS = {
    "course_withdraw_form": {
        "title": "學生課程停修申請單",
        "office": "教務處課務組",
        "intro": "每學期停修以 2 科為限，停修後修習學分不得低於該學期最低應修學分；請於第 12 週週五前送達課務組。",
        "fields": [
            {"key": "semester", "label": "學年度 / 學期", "example": "115 學年度第 1 學期"},
            {"key": "course_code", "label": "停修科目代碼", "example": "CS201", "tip": "代碼在選課清單或課表最左欄"},
            {"key": "course_name", "label": "停修科目名稱", "example": "資料結構"},
            {"key": "credits", "label": "學分數", "example": "3"},
            {"key": "teacher", "label": "任課教師", "example": "林志明 老師"},
            {"key": "reason", "label": "停修原因", "example": "期中考後評估跟不上進度，擬於下學期重新修習，以免影響本學期其他科目。",
             "long": True, "tip": "寫具體原因與之後的修課計畫，空泛的原因 (例如「不想上」) 會被退件"},
        ],
        "signers": [
            {"name": "任課教師簽核", "icon": "👨‍🏫", "role": "老師"},
            {"name": "導師簽核", "icon": "🧑‍🏫", "role": "老師"},
            {"name": "科主任簽核", "icon": "🏫", "role": "老師"},
            {"name": "課務組核備", "icon": "🏢", "role": "教職員"},
        ],
        "attachments": ["歷年成績單正本 1 份"],
        "notes": ["停修科目成績欄註記「停修」，不列入學期成績計算。", "已停修之科目不得申請撤回停修。"],
    },
    "leave_application_form": {
        "title": "學生請假單",
        "office": "學務處生活輔導組",
        "intro": "請於請假日起 3 日內完成；病假請附就醫證明，超過 3 日由生輔組組長複核。",
        "fields": [
            {"key": "leave_type", "label": "假別", "example": "病假", "tip": "病假、事假、公假、喪假、生理假擇一"},
            {"key": "dates", "label": "請假日期", "example": "2026-10-20 至 2026-10-21"},
            {"key": "periods", "label": "節次", "example": "第 1-4 節", "tip": "整天就寫「全天」"},
            {"key": "reason", "label": "事由", "example": "發燒 38.5 度，至診所就醫並在家休養。", "long": True},
            {"key": "proof", "label": "證明文件", "example": "診所就醫證明 1 張"},
        ],
        "signers": [
            {"name": "導師簽核", "icon": "🧑‍🏫", "role": "老師"},
            {"name": "生輔組登錄", "icon": "🏢", "role": "教職員"},
        ],
        "attachments": ["健保特約就醫證明或就診收據影本"],
        "notes": ["逾期未請假者以曠課論。", "也可直接在首頁「線上請假」送出假單。"],
    },
    "english_waiver_form": {
        "title": "通識外語證照免修 / 學分抵免申請書",
        "office": "通識教育中心",
        "intro": "請於開學前至加退選截止前提出，並攜帶檢定成績單正本到通識中心查驗。",
        "fields": [
            {"key": "exam_name", "label": "檢定名稱", "example": "TOEIC 多益測驗", "tip": "全民英檢請寫級數，例如「全民英檢中級」"},
            {"key": "score", "label": "成績 / 級數", "example": "650 分"},
            {"key": "exam_date", "label": "測驗日期", "example": "2026-06-14"},
            {"key": "course_name", "label": "申請抵免科目", "example": "英文 (一)  EN101  2 學分"},
        ],
        "signers": [
            {"name": "通識中心查驗", "icon": "🏫", "role": "教職員"},
            {"name": "課務組複審", "icon": "🏢", "role": "教職員"},
        ],
        "attachments": ["檢定成績單正本 (查驗後歸還)", "檢定成績單影本 1 份"],
        "notes": ["檢定成績須為 2 年內有效。", "同一張成績單僅能抵免一次。"],
    },
    "graduation_audit_form": {
        "title": "畢業學分資格預審表",
        "office": "教務處註冊組",
        "intro": "大四 (五專五年級) 第 8-16 週辦理；請先登入畢業審查系統核對學分。",
        "fields": [
            {"key": "total_credits", "label": "已修及格總學分", "example": "196 學分", "tip": "看首頁「畢業門檻」就有"},
            {"key": "required_credits", "label": "專業必修學分", "example": "120 學分"},
            {"key": "elective_credits", "label": "專業選修學分", "example": "48 學分"},
            {"key": "general_credits", "label": "通識學分", "example": "28 學分"},
            {"key": "english", "label": "英文畢業門檻", "example": "已通過 (TOEIC 650 分)"},
            {"key": "project", "label": "畢業專題", "example": "已通過 (題目：校園服務平台)"},
        ],
        "signers": [
            {"name": "導師初審", "icon": "🧑‍🏫", "role": "老師"},
            {"name": "科主任簽核", "icon": "🏫", "role": "老師"},
            {"name": "註冊組決審", "icon": "🏢", "role": "教職員"},
        ],
        "attachments": ["歷年成績單正本", "外語檢定通過證明影本"],
        "notes": ["學分不足者請於下學期補修，預審結果不代表已准予畢業。"],
    },
    "certificate_reward_form": {
        "title": "專業證照 / 競賽獲獎獎勵金申請表",
        "office": "研發處實習就業組",
        "intro": "每學期第 1-5 週受理；同一張證照僅能申請一次。",
        "fields": [
            {"key": "cert_name", "label": "證照 / 競賽名稱", "example": "網頁設計乙級技術士"},
            {"key": "cert_no", "label": "證書字號", "example": "113-012345"},
            {"key": "issuer", "label": "發證單位", "example": "勞動部勞動力發展署"},
            {"key": "issued_date", "label": "取得日期", "example": "2026-07-20"},
            {"key": "advisor", "label": "指導老師 (選填)", "example": "陳雅婷 老師", "optional": True},
            {"key": "account", "label": "郵局帳號", "example": "0001234-0567890", "tip": "須為申請人本人帳戶"},
        ],
        "signers": [
            {"name": "導師確認", "icon": "🧑‍🏫", "role": "老師"},
            {"name": "研發處審核", "icon": "🏢", "role": "教職員"},
            {"name": "出納撥款", "icon": "💰", "role": "教職員"},
        ],
        "attachments": ["證書正反面影本", "郵局存摺封面影本", "印領清冊 (親筆簽名)"],
        "notes": ["獎勵金額依「學生取得專業證照獎勵辦法」核定。"],
    },
}

# 範本以外的申辦項目 (後台自行新增的) 用這份通用欄位
GENERIC_FIELDS = [
    {"key": "reason", "label": "申請事項與原因", "example": "因○○需要，申請辦理本項業務。", "long": True},
]


def form_code_from_url(url):
    """/forms/course_withdraw_form.pdf → course_withdraw_form；不是本站範本回傳 None"""
    name = str(url or "").rstrip("/").rsplit("/", 1)[-1]
    for ext in (".pdf", ".doc", ".docx"):
        if name.endswith(ext):
            name = name[: -len(ext)]
    return name if name in FORMS else None


def template_for_item(item):
    """申辦項目 (checklist_items 一列) 對應的表單範本；沒有對應範本時以處室名稱產生通用版"""
    code = form_code_from_url(item.get("form_download_url"))
    if code:
        return code, FORMS[code]
    office = item.get("category_name") or "承辦單位"
    return None, {
        "title": item.get("business_name") or "申請表",
        "office": office,
        "intro": "",
        "fields": GENERIC_FIELDS,
        "signers": [{"name": f"{office}審核", "icon": "🏢", "role": "教職員"}],
        "attachments": [],
        "notes": [],
    }


def stages_for(template):
    """線上申請的完整關卡：送出 → 各簽核 → 完成"""
    return [SUBMIT_STAGE, *template["signers"], DONE_STAGE]
