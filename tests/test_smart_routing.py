from campus.smart_routing import predict


def test_routes_existing_workflow_with_reason():
    workflows = {'課務異動諮詢（課務組）': {'office': '課務組', 'roles': ['學生']}}
    result = predict('選課衝堂', '課表需要調整', workflows, '學生')
    assert result['kind'] == '課務異動諮詢（課務組）'
    assert result['office'] == '課務組'
    assert result['confidence'] == 'high'
    assert '選課' in result['reason']


def test_ambiguous_or_unauthorized_route_requires_manual_choice():
    workflows = {
        '住宿異動申請': {'office': '住宿服務組', 'roles': ['學生']},
        '設備報修申請（事務組）': {'office': '事務組', 'roles': ['學生']},
    }
    result = predict('宿舍報修', '', workflows, '學生')
    assert result['kind'] is None
    assert result['confidence'] == 'low'
    assert predict('宿舍報修', '', workflows, '訪客')['kind'] is None


def test_department_workflow_not_suggested_to_other_department():
    workflows = {'資訊管理科（五專）資料收件': {'office': '資訊管理科（五專）／科辦公室', 'roles': ['學生']}}
    assert predict('專題資料', '', workflows, '學生', 'CS')['kind']
    assert predict('專題資料', '', workflows, '學生', 'OTHER')['kind'] is None
