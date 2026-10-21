import pytest
from attendance.policy import summarize_attendance


def risk(hours, kind='曠課', policy='ordinary', total=54):
    return summarize_attendance([{'course_name':'校規測試課','type':kind,'hours':hours,'exam_policy':policy}], {'校規測試課':3}, {'校規測試課':total})['courses'][0]


@pytest.mark.parametrize('hours,level', [(11,'ok'),(12,'warning'),(17,'warning'),(18,'banned'),(19,'banned')])
def test_official_one_third_boundary(hours, level):
    item=risk(hours)
    assert item['level']==level and not item['estimated']
    assert item['exam_ban_threshold_hours']==18 and item['official_decision'] is False


def test_ordinary_sick_leave_counts_toward_threshold():
    assert risk(18,'病假')['level']=='banned'
    assert risk(18,'事假')['counted_hours']==18


@pytest.mark.parametrize('hours,level',[(26,'warning'),(27,'banned'),(28,'banned')])
def test_verified_half_threshold(hours,level):
    item=risk(hours,'公假','half')
    assert item['threshold_ratio']=='1/2' and item['level']==level


def test_explicit_approved_exemption_is_not_counted():
    assert risk(40,'產假','exempt')['counted_hours']==0
    assert risk(40,'產假','ordinary')['manual_review'] is True


def test_mixed_special_and_ordinary_requires_review():
    result=summarize_attendance([{'course_name':'測試','type':'公假','hours':10,'exam_policy':'half'}, {'course_name':'測試','type':'曠課','hours':10}], {'測試':3},{'測試':54})['courses'][0]
    assert result['manual_review'] is True


def test_legacy_records_are_marked_estimated():
    item=summarize_attendance([{'course_name':'測試','type':'曠課'}],{'測試':3})['courses'][0]
    assert item['estimated'] is True and item['official_decision'] is False


def test_non_divisible_total_uses_exact_comparison():
    assert risk(18,total=55)['level']=='warning'
    assert risk(19,total=55)['level']=='banned'


def test_different_semesters_do_not_accumulate():
    rows=[{'course_name':'測試','type':'曠課','hours':18,'date':'2026-05-01'}, {'course_name':'測試','type':'曠課','hours':1,'date':'2026-10-20'}]
    item=summarize_attendance(rows,{'測試':3},{'測試':54},semester='115-1')['courses'][0]
    assert item['counted_hours']==1 and item['level']=='ok'
