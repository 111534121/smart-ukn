def test_grounded_answer_and_abstention(monkeypatch, tmp_path):
    import app
    from campus.common import store
    monkeypatch.setattr(app, 'get_db_connection', lambda: None)
    monkeypatch.setattr(store, 'data', {})
    monkeypatch.setattr(store, 'path', str(tmp_path / 'campus_store.json'))
    client = app.app.test_client()
    no_source = client.post('/api/admissions-consultation/ask', json={'question': '二專有夜間部嗎？'})
    assert no_source.status_code == 200
    assert no_source.json['matched'] is False
    assert no_source.json['sources'] == []

    store.section('knowledge_documents', list).append({
        'id': 'test-pdf', 'title': '招生問答測試', 'kind': '招生',
        'file_name': 'admissions.pdf', 'updated_at': '2026-11-09',
        'pages': [{'page': 1, 'text': 'Two year evening program is available.'}]
    })
    # The answer must come from an actual indexed page, not a similarly named document.
    found = client.post('/api/admissions-consultation/ask', json={'question': 'Two year evening program'})
    assert found.json['matched'] is True
    assert found.json['answer'] == 'Two year evening program is available.'
    assert found.json['sources'][0]['page'] == 1
    assert found.json['sources'][0]['document'] == 'admissions.pdf'
    unrelated = client.post('/api/admissions-consultation/ask', json={'question': '資管科畢業要幾學分？'})
    assert unrelated.json['matched'] is False


def test_chinese_questions_require_the_answer_in_a_cited_passage():
    from campus.admissions_consultation import answer
    base = {'subcategory': '招生', 'page': 2, 'url': '/official.pdf',
            'doc_name': '招生簡章.pdf', 'keyword': '二專夜間部招生'}
    assert answer('二專有夜間部嗎？', [{**base, 'content': '報名日期詳見公告。'}]) is None
    result = answer('二專有夜間部嗎？', [{**base, 'content': '本校設有二專夜間部招生。'}])
    assert result['sources'][0]['page'] == 2
    assert result['answer'] == '本校設有二專夜間部招生。'


def test_model_cannot_replace_cited_fact_with_unsupported_number(monkeypatch, tmp_path):
    import app
    from assistant import ollama
    from campus.common import store
    monkeypatch.setattr(app, 'get_db_connection', lambda: None)
    monkeypatch.setattr(store, 'data', {})
    monkeypatch.setattr(store, 'path', str(tmp_path / 'campus_store.json'))
    store.section('knowledge_documents', list).append({
        'id': 'test-pdf', 'title': '資管科招生', 'kind': '招生',
        'file_name': 'admissions.pdf', 'updated_at': '2026-11-09',
        'pages': [{'page': 5, 'text': '資訊管理科招生名額23名。'}]
    })
    monkeypatch.setattr(ollama, 'chat', lambda *args, **kwargs: '今年招收99名。')
    result = app.app.test_client().post('/api/admissions-consultation/ask', json={'question':'資管科招生名額'}).json
    assert result['matched'] is True
    assert result['mode'] == 'extractive'
    assert result['answer'] == '資訊管理科招生名額23名。'
    assert result['sources'][0]['page'] == 5
