import json

import pytest

from campus import common


def test_store_recovers_from_temporary_windows_lock(tmp_path, monkeypatch):
    path = tmp_path / 'saved.json'
    store = common.JsonStore(str(path))
    replace = common.os.replace
    attempts = []

    def locked_once(src, dst):
        attempts.append(dst)
        if len(attempts) == 1:
            raise PermissionError('temporary lock')
        replace(src, dst)

    monkeypatch.setattr(common.os, 'replace', locked_once)
    monkeypatch.setattr(common.time, 'sleep', lambda _: None)
    store.data = {'message': '保留資料'}
    store.save()
    assert json.loads(path.read_text(encoding='utf-8')) == store.data
    assert len(attempts) == 2


def test_store_surfaces_persistent_lock_and_keeps_old_file(tmp_path, monkeypatch):
    path = tmp_path / 'saved.json'
    path.write_text('{"original": true}', encoding='utf-8')
    store = common.JsonStore(str(path))
    attempts = []

    def locked(src, dst):
        attempts.append(dst)
        raise PermissionError('persistent lock')

    monkeypatch.setattr(common.os, 'replace', locked)
    monkeypatch.setattr(common.time, 'sleep', lambda _: None)
    store.data = {'new': True}
    with pytest.raises(PermissionError):
        store.save()
    assert len(attempts) == 6
    assert json.loads(path.read_text(encoding='utf-8')) == {'original': True}
