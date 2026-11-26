"""Student mobile lobby: today's own classes, actionable tasks and explicit demo transit."""
from datetime import datetime, timedelta, timezone
from flask import Blueprint, make_response
from dashboard.summary import _class_item, summarize_assignments
from .common import current_user, deps, ok, require, store
from . import admin_cases, graduation_projects

bp=Blueprint('student_lobby',__name__)

def local_now():
    return datetime.now(timezone(timedelta(hours=8))).replace(tzinfo=None)

@bp.route('/api/student/lobby',methods=['GET'])
@require('學生')
def lobby():
    user=current_user();now=local_now();day=now.date().isoformat()
    data={'now':now.strftime('%Y-%m-%d %H:%M'),'date':day,'weekday':'週'+'一二三四五六日'[now.weekday()],
          'name':user['full_name'],'class_name':user['class_name'],'schedule':[],'tasks':[],
          'errors':{},'schedule_source':None,'demo_transit':None}
    try:
        source=deps.get_dashboard_source()
        data['schedule_source']=source.name
        rows=source.list_schedule(user['class_name'],user['student_id'])
        data['schedule']=[_class_item(row,day,now) for row in sorted(rows,key=lambda r:r['period_start']) if row['weekday']==now.isoweekday()]
        if source.name=='memory':
            data['demo_transit']={'mode':'demo','updated_at':data['now'],'date':day,
                'notice':'模擬快照，非真實接駁班次或到站預測；實際乘車請查官方交通資訊。',
                'arrivals':[{'route':'示範接駁 A','stop':'示範捷運接駁點 → 校門口','minutes':6},
                            {'route':'示範接駁 B','stop':'示範校門口 → 捷運接駁點','minutes':14}]}
        try:
            assignments=summarize_assignments(source.list_assignments(user['class_name'],user['student_id']),now)
            for task in assignments['items']:
                if task['overdue'] or task['due_at'][:10]<=day:
                    data['tasks'].append({'type':'作業','title':task['title'],'detail':task['course_name'],
                        'due_date':task['due_at'],'overdue':task['overdue'],'href':'/#home','action':'assignments'})
        except Exception:
            data['errors']['assignments']='學習待辦暫時無法載入'
    except Exception:
        data['errors']['schedule']='今日課表暫時無法載入'
    try:
        for case in admin_cases.cases():
            if admin_cases.owns(case,user) and case['status']=='待補件':
                data['tasks'].append({'type':'補件','title':case['kind']+'待補件','detail':case['office'],
                    'due_date':case['due_date'],'overdue':case['due_date']<day,'case_id':case['id'],'action':'case'})
    except Exception:
        data['errors']['cases']='申辦待辦暫時無法載入'
    try:
        if graduation_projects.cs_student(user):
            teams=[t for t in store.data.get('graduation_project_teams',[]) if user['student_id'] in t['member_ids']]
            for team in teams:
                latest={s['stage']:s for s in store.data.get('graduation_project_submissions',[]) if s['team_id']==team['id']}
                title=None
                if not team.get('teacher_username'): title='專題：完成指導老師志願與媒合'
                else:
                    for stage in graduation_projects.STAGES:
                        row=latest.get(stage)
                        if not row or row['status']=='退回修改': title='專題：'+stage+('修正後重送' if row else '準備送審');break
                        if row['status']!='已核准': break
                if title:
                    data['tasks'].append({'type':'專題','title':title,'detail':team['title'],'due_date':None,'overdue':False,'href':'/graduation-projects','action':'project'})
    except Exception:
        data['errors']['projects']='專題待辦暫時無法載入'
    data['tasks'].sort(key=lambda t:(not t['overdue'],t['due_date'] or '9999',t['title']))
    data['task_count']=len(data['tasks'])
    response=make_response(ok(data=data))
    response.headers['Cache-Control']='no-store'
    return response
