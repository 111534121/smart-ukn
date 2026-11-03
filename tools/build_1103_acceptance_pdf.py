"""Build the printable five-feature acceptance sheet for the 2026-11-03 build."""
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'pdf' / '1103_五項功能驗收表.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('Kaiu', r'C:\Windows\Fonts\kaiu.ttf'))

INK = colors.HexColor('#17324f')
BLUE = colors.HexColor('#1e5a8a')
PALE = colors.HexColor('#edf4f9')
LINE = colors.HexColor('#a8b9c8')

title = ParagraphStyle('title', fontName='Kaiu', fontSize=19, leading=25, textColor=INK, alignment=TA_CENTER)
sub = ParagraphStyle('sub', fontName='Kaiu', fontSize=9, leading=15, textColor=INK)
head = ParagraphStyle('head', fontName='Kaiu', fontSize=10, leading=15, textColor=colors.white)
cell = ParagraphStyle('cell', fontName='Kaiu', fontSize=9, leading=15, textColor=INK)
small = ParagraphStyle('small', fontName='Kaiu', fontSize=8, leading=13, textColor=INK)

def P(value, style=cell):
    return Paragraph(value, style)

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(38, 40, A4[0]-38, 40)
    canvas.setFont('Kaiu', 8)
    canvas.setFillColor(INK)
    canvas.drawString(40, 27, 'Smart UKN  |  2026-11-03  |  五項功能驗收')
    canvas.drawRightString(A4[0]-40, 27, str(doc.page))
    canvas.restoreState()

doc = BaseDocTemplate(str(OUT), pagesize=A4, leftMargin=38, rightMargin=38,
                      topMargin=35, bottomMargin=52)
frame = Frame(38, 52, A4[0]-76, A4[1]-87, leftPadding=0, rightPadding=0,
              topPadding=0, bottomPadding=0)
doc.addPageTemplates(PageTemplate(id='main', frames=[frame], onPage=footer))

story = [
    P('Smart UKN 五項功能驗收表', title), Spacer(1, 9),
    P('版本：11/03 大家合併後續修正版　　驗收日期：＿＿＿＿年＿＿月＿＿日', sub),
    P('驗收方式：先核對正常操作、錯誤輸入／權限與輸出結果，再由指導老師實際審核並簽名。', sub),
    Spacer(1, 12),
]

rows = [[P('項目', head), P('正常操作與合理輸出', head), P('輸入／防呆與權限', head), P('老師判定', head)]]
features = [
    ('R1 學分診斷', '登入學生可看已修學分、220 學分門檻與擋修試算。', '未登入不能取得個人成績；手動模擬另行處理。'),
    ('R2 家長查詢', '家長只能看到綁定子女的學習摘要。', '查詢他人或導師班資料應拒絕。'),
    ('R3 規章搜尋', '關鍵字可找到規章說明、來源與更新日期。', '查無結果要清楚提示，不編造答案。'),
    ('R4 期限雷達', '只顯示適用身分／科系的期限與狀態。', '學生不能新增期限；逾期與未開始要區分。'),
    ('R5 後台修改紀錄', '管理員新增、修改、刪除規章後可查到紀錄。', '一般學生不能查看或修改後台紀錄。'),
]
for name, normal, guard in features:
    rows.append([P(name), P(normal), P(guard), P('□ 通過<br/>□ 待修')])

table = Table(rows, colWidths=[93, 175, 175, 76], rowHeights=[28]+[75]*5, repeatRows=1)
table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), BLUE),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('LEFTPADDING', (0,0), (-1,-1), 8), ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('GRID', (0,0), (-1,-1), 0.55, LINE),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, PALE]),
]))
story += [table, Spacer(1, 13),
          P('測試證據（自動測試，非老師簽核）', sub),
          P('全站自檢 56／56 通過；輸入、資料與整合相關測試 96／96 通過。'
            '畫面仍須由老師依上表逐項操作，確認顯示、輸入與結果。', small),
          Spacer(1, 15),
          P('老師意見：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿', sub),
          Spacer(1, 14),
          P('指導老師簽名：＿＿＿＿＿＿＿＿＿＿＿＿　　日期：＿＿＿＿年＿＿月＿＿日', sub),
          Spacer(1, 5),
          P('註：本表保留老師勾選與簽名；未經老師審核前，不代表正式驗收通過。', small),
]
doc.build(story)
print(OUT)
