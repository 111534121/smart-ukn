"""校規與申辦流程瀏覽：大分類 → 子分類 → 規章與對應申辦流程 (併入「申請問題小幫手」的瀏覽入口)。"""
from flask import Blueprint

from .calendar_ext import load_checklists, checklist_detail
from .common import deps, ok

bp = Blueprint("campus_rules", __name__)


def load_kb():
    rows = deps.fetch_db_rows(
        "SELECT k.*, c.category_name FROM knowledge_base k LEFT JOIN knowledge_categories c ON k.category_id = c.category_id")
    return rows if rows else deps.knowledge_base


def related_checklist(rule, checklists):
    return next((c for c in checklists if c.get("related_kb_id") == rule["id"]
                 or (rule.get("keyword") and rule["keyword"] in c["business_name"])), None)


def rule_card(rule, checklists):
    chk = related_checklist(rule, checklists)
    return {
        "kb_id": rule["id"],
        "title": rule.get("official_term") or rule.get("subcategory"),
        "keyword": rule.get("keyword", ""),
        "category_name": rule.get("category_name", ""),
        "subcategory": rule.get("subcategory", ""),
        "content": rule.get("content", ""),
        "source_doc": rule.get("doc_name", ""),
        "source_page": rule.get("page"),
        "source_url": rule.get("url", ""),
        "checklist": checklist_detail(chk),
    }


@bp.route("/api/campus/rules/tree", methods=["GET"])
def tree():
    """大分類 → 子分類 → 規章與對應申辦流程；也提供『全部流程』下拉選單的資料"""
    kb = load_kb()
    checklists = load_checklists()
    categories = []
    names = []
    for r in kb:
        if r.get("category_name") and r["category_name"] not in names:
            names.append(r["category_name"])
    icon_of = {c["category_name"]: c.get("icon", "") for c in deps.categories}
    for name in names:
        rules = [rule_card(r, checklists) for r in kb if r.get("category_name") == name]
        categories.append({"name": name, "icon": icon_of.get(name, "📄"), "rules": rules})
    processes = [checklist_detail(c) | {"audience": c.get("audience", ""), "deadline": c.get("deadline_week_info", "")}
                 for c in checklists]
    return ok(categories=categories, processes=processes)
