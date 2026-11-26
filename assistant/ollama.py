"""Local Ollama adapter. Never sends campus questions to a remote host."""
import json
import os
from urllib.request import Request, urlopen


def enabled():
    return os.getenv('ASSISTANT_AI', '').lower() == 'ollama'


def chat(system, question, evidence, *, timeout=30):
    if not enabled():
        return None
    model = os.getenv('OLLAMA_MODEL', 'qwen3:0.6b').strip()
    if not model or not evidence:
        return None
    body = json.dumps({'model': model, 'stream': False, 'think': False,
                       'options': {'temperature': 0},
                       'messages': [{'role': 'system', 'content': system},
                                    {'role': 'user', 'content': f'<資料>\n{evidence[:12000]}\n</資料>\n<問題>\n{question}\n</問題>'}]},
                      ensure_ascii=False).encode('utf-8')
    request = Request('http://127.0.0.1:11434/api/chat', body,
                      headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urlopen(request, timeout=timeout) as response:
            result = json.load(response)
    except (OSError, ValueError, KeyError):
        return None
    content = str((result.get('message') or {}).get('content') or '').strip()
    return content[:1600] or None
