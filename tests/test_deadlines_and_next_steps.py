from datetime import datetime, timezone, timedelta
import pytest
from campus.announcement_status import deadline_info
from campus import admin_cases

TZ = timezone(timedelta(hours=8))
NOW = datetime(2026, 10, 22, 12, tzinfo=TZ)

@pytest.mark.parametrize('title,pub,status,deadline', [
 ('活動 10/22 至 10/23', '2026-10-01', 'unknown', None),
 ('活動於 10/23 舉行', '2026-10-01', 'unknown', None),
 ('申請受理（至 10/24）','2026-10-01','soon','2026-10-24'),
 ('申請於 10/21 截止','2026-10-01','expired','2026-10-21'),
 ('10/22 17:00 截止','2026-10-01','soon','2026-10-22'),
 ('10/22 09:00 截止','2026-10-01','expired','2026-10-22'),
 ('9/20 開始受理，至 10/24','2026-09-01','soon','2026-10-24'),
 ('申請至 1/10','2026-12-01','open','2027-01-10'),
 ('至 2/30','2026-02-01','unknown',None),
])
def test_deadline_labels(title,pub,status,deadline):
 result=deadline_info({'title':title,'publish_date':pub},NOW)
 assert result['deadline_status']==status
 assert result['deadline_date']==deadline


def test_explicit_deadline_priority_and_timezone():
 result=deadline_info({'title':'至 10/24','deadline_at':'2026-10-22T03:00:00Z'},NOW)
 assert result['deadline_status']=='expired'
 assert result['deadline_at']=='2026-10-22T11:00:00+08:00'
 assert result['deadline_source']=='公告截止欄位'
 assert deadline_info({'deadline':'2026-10-22'},NOW)['deadline_status']=='soon'


@pytest.mark.parametrize('status,responsible,supplement',[
 ('待受理','教務處',False),('重新送審','教務處',False),('處理中','教務處',False),
 ('待補件','申請人',True),('已完成','已結案',False),('已退件','已結案',False),
])
def test_application_next_action(monkeypatch,status,responsible,supplement):
 monkeypatch.setattr(admin_cases,'can_manage',lambda item:False)
 monkeypatch.setattr(admin_cases,'owns',lambda item:True)
 item={'status':status,'due_date':'2026-10-25','office':'教務處','requirements':['補交證明'],
       'workflow':[{'name':'資料確認','office':'教務處'},{'name':'製發證明','office':'教務處'}], 'workflow_index':0}
 result=admin_cases.payload(item)['progress']
 assert result['responsible']==responsible
 assert result['requires_supplement']==supplement
 assert result['supplement_items']==(['補交證明'] if supplement else [])
 assert result['next_action']
 if status=='處理中': assert '製發證明' in result['next_action']
 if supplement: assert '重新送審' in result['next_action'] and result['deadline_kind']=='補件期限'
 assert 'progress' not in item
