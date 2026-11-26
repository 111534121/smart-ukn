import io
import json

from assistant import ollama


def test_local_ollama_payload_and_grounded_context(monkeypatch):
    monkeypatch.setenv('ASSISTANT_AI', 'ollama')
    monkeypatch.setenv('OLLAMA_MODEL', 'local-test')
    captured = {}

    def fake_urlopen(request, timeout):
        captured['url'] = request.full_url
        captured['body'] = json.loads(request.data)
        captured['timeout'] = timeout
        return io.BytesIO(b'{"message":{"content":"supported answer"}}')

    monkeypatch.setattr(ollama, 'urlopen', fake_urlopen)
    assert ollama.chat('Only evidence', 'Question', 'Source page 2') == 'supported answer'
    assert captured['url'] == 'http://127.0.0.1:11434/api/chat'
    assert captured['body']['model'] == 'local-test'
    assert 'Source page 2' in captured['body']['messages'][1]['content']
    assert captured['body']['stream'] is False


def test_no_model_falls_back_without_guessing(monkeypatch):
    monkeypatch.setenv('ASSISTANT_AI', 'ollama')
    monkeypatch.setattr(ollama, 'urlopen', lambda *a, **k: (_ for _ in ()).throw(OSError('offline')))
    assert ollama.chat('system', 'question', 'evidence') is None
