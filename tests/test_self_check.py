"""把 self_check.py 的全站自動檢測接進 pytest，每次跑 `python -m pytest` 都會一起跑到。

跟其他測試不一樣的地方：self_check.py 自己就會切換離線示範模式與假信箱
（跑在同一個流程裡，不靠 conftest.py 的 fixture），所以這裡不需要 client/login fixture，
直接呼叫 self_check.run_all() 即可。
"""
import self_check


def test_self_check_suite():
    report = self_check.run_all()
    failed = [r for r in report["results"] if r["status"] != "pass"]
    if failed:
        first = f"[{failed[0]['feature']}] {failed[0]['name']}: {failed[0]['detail'].splitlines()[0]}"
        detail = "\n".join(f"- [{r['feature']}] {r['name']}: {r['detail'].splitlines()[0]}" for r in failed)
        raise AssertionError(
            f"自動檢測發現 {len(failed)}/{report['total']} 項未通過（{first}）：\n{detail}"
        )
