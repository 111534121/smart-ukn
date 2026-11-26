window.FEATURE_GUIDE = {
  "features": [
    {
      "id": "auth",
      "name": "登入與身分驗證",
      "group": "系統",
      "summary": "驗證帳密與身分，建立登入工作階段。",
      "routes": [
        {
          "url": "/api/auth/login",
          "methods": [
            "POST"
          ],
          "file": "app.py",
          "line": 964,
          "function": "auth_login",
          "tables": [
            {
              "name": "users",
              "file": "app.py",
              "line": 985,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 95
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 985,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "departments",
              "file": "app.py",
              "line": 985,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 53
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 964,
              "function": "auth_login"
            },
            {
              "file": "app.py",
              "line": 959,
              "function": "_clear_login_failures"
            },
            {
              "file": "app.py",
              "line": 955,
              "function": "_record_login_failure"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 947,
              "function": "_login_too_many"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/auth/logout",
          "methods": [
            "POST"
          ],
          "file": "app.py",
          "line": 1052,
          "function": "auth_logout",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 1052,
              "function": "auth_logout"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/auth/me",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 1057,
          "function": "auth_me",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 1057,
              "function": "auth_me"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/visitor/register",
          "methods": [
            "POST"
          ],
          "file": "app.py",
          "line": 1086,
          "function": "register_visitor",
          "tables": [
            {
              "name": "visitor_logs",
              "file": "app.py",
              "line": 1105,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 364
                },
                {
                  "file": "init_db.py",
                  "line": 317
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 1086,
              "function": "register_visitor"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin-workbench.html",
          "line": 4
        },
        {
          "file": "static/index.html",
          "line": 2209
        },
        {
          "file": "static/login.html",
          "line": 327
        },
        {
          "file": "static/login.html",
          "line": 367
        },
        {
          "file": "static/js/activities.js",
          "line": 55
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 119
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 106
        },
        {
          "file": "static/js/events-admin.js",
          "line": 118
        },
        {
          "file": "static/js/graduation-projects.js",
          "line": 47
        },
        {
          "file": "static/js/office-resources.js",
          "line": 24
        },
        {
          "file": "static/js/student-cases.js",
          "line": 86
        }
      ]
    },
    {
      "id": "dashboard",
      "name": "學生首頁與請假",
      "group": "學習",
      "summary": "整合學習資訊，送出請假並由有權限的人員審核。",
      "routes": [
        {
          "url": "/api/student/dashboard",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 4342,
          "function": "get_student_dashboard",
          "tables": [
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 120,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 129,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 140,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 97,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 136,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "course_map",
              "file": "app.py",
              "line": 4171,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 122
                },
                {
                  "file": "init_db.py",
                  "line": 84
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 4325,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 214,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "assignments",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 497
                }
              ]
            },
            {
              "name": "assignment_submissions",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 512
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 168,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 169,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 211,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 243,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 256,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 268,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 282,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 291,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 297,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 4342,
              "function": "get_student_dashboard"
            },
            {
              "file": "app.py",
              "line": 4152,
              "function": "get_attendance_source"
            },
            {
              "file": "attendance/sources.py",
              "line": 86,
              "function": "MySQLAttendanceSource"
            },
            {
              "file": "attendance/sources.py",
              "line": 43,
              "function": "_normalize"
            },
            {
              "file": "app.py",
              "line": 4283,
              "function": "moodle_error_message"
            },
            {
              "file": "app.py",
              "line": 4165,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1146,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4170,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4161,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "moodle_sync/assignments.py",
              "line": 90,
              "function": "MoodleMergedSource"
            },
            {
              "file": "moodle_sync/assignments.py",
              "line": 68,
              "function": "get_cached_assignments"
            },
            {
              "file": "moodle_sync/assignments.py",
              "line": 37,
              "function": "fetch_assignments"
            },
            {
              "file": "moodle_sync/assignments.py",
              "line": 24,
              "function": "short_course_name"
            },
            {
              "file": "moodle_sync/assignments.py",
              "line": 30,
              "function": "_is_submitted"
            },
            {
              "file": "attendance/policy.py",
              "line": 38,
              "function": "summarize_attendance"
            },
            {
              "file": "attendance/policy.py",
              "line": 27,
              "function": "record_semester"
            },
            {
              "file": "attendance/policy.py",
              "line": 23,
              "function": "_round"
            },
            {
              "file": "attendance/policy.py",
              "line": 15,
              "function": "_number"
            },
            {
              "file": "dashboard/summary.py",
              "line": 95,
              "function": "build_dashboard"
            },
            {
              "file": "dashboard/summary.py",
              "line": 88,
              "function": "summarize_leave"
            },
            {
              "file": "dashboard/summary.py",
              "line": 61,
              "function": "summarize_assignments"
            },
            {
              "file": "dashboard/summary.py",
              "line": 51,
              "function": "summarize_announcements"
            },
            {
              "file": "dashboard/summary.py",
              "line": 35,
              "function": "summarize_schedule"
            },
            {
              "file": "dashboard/summary.py",
              "line": 16,
              "function": "_class_item"
            },
            {
              "file": "app.py",
              "line": 4324,
              "function": "student_class_name"
            },
            {
              "file": "app.py",
              "line": 4292,
              "function": "moodle_status_for"
            },
            {
              "file": "app.py",
              "line": 4272,
              "function": "get_dashboard_source"
            },
            {
              "file": "dashboard/sources.py",
              "line": 156,
              "function": "MySQLDashboardSource"
            },
            {
              "file": "dashboard/sources.py",
              "line": 62,
              "function": "_fmt"
            },
            {
              "file": "app.py",
              "line": 4331,
              "function": "parse_dashboard_now"
            },
            {
              "file": "app.py",
              "line": 2014,
              "function": "current_student_id"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/student/announcements/<int:announcement_id>/read",
          "methods": [
            "POST"
          ],
          "file": "app.py",
          "line": 4381,
          "function": "mark_announcement_read",
          "tables": [
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 214,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "assignments",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 497
                }
              ]
            },
            {
              "name": "assignment_submissions",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 512
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 168,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 169,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 211,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 243,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 256,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 268,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 282,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 291,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 297,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 4381,
              "function": "mark_announcement_read"
            },
            {
              "file": "app.py",
              "line": 4272,
              "function": "get_dashboard_source"
            },
            {
              "file": "dashboard/sources.py",
              "line": 156,
              "function": "MySQLDashboardSource"
            },
            {
              "file": "dashboard/sources.py",
              "line": 62,
              "function": "_fmt"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/student/leave-requests",
          "methods": [
            "POST"
          ],
          "file": "app.py",
          "line": 4417,
          "function": "submit_leave_request",
          "tables": [
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 214,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "assignments",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 497
                }
              ]
            },
            {
              "name": "assignment_submissions",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 512
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 168,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 169,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 211,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 243,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 256,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 268,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 282,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 291,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 297,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 4417,
              "function": "submit_leave_request"
            },
            {
              "file": "app.py",
              "line": 4272,
              "function": "get_dashboard_source"
            },
            {
              "file": "dashboard/sources.py",
              "line": 156,
              "function": "MySQLDashboardSource"
            },
            {
              "file": "dashboard/sources.py",
              "line": 62,
              "function": "_fmt"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/student/leave-requests/<int:leave_id>",
          "methods": [
            "DELETE"
          ],
          "file": "app.py",
          "line": 4450,
          "function": "cancel_leave_request",
          "tables": [
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 214,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "assignments",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 497
                }
              ]
            },
            {
              "name": "assignment_submissions",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 512
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 168,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 169,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 211,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 243,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 256,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 268,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 282,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 291,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 297,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 4450,
              "function": "cancel_leave_request"
            },
            {
              "file": "app.py",
              "line": 4272,
              "function": "get_dashboard_source"
            },
            {
              "file": "dashboard/sources.py",
              "line": 156,
              "function": "MySQLDashboardSource"
            },
            {
              "file": "dashboard/sources.py",
              "line": 62,
              "function": "_fmt"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/leave-requests/review",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 4457,
          "function": "list_leave_requests_for_review",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 4158,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 214,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "assignments",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 497
                }
              ]
            },
            {
              "name": "assignment_submissions",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 512
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 168,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 169,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 211,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 243,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 256,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 268,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 282,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 291,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 297,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2482,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 4457,
              "function": "list_leave_requests_for_review"
            },
            {
              "file": "app.py",
              "line": 4157,
              "function": "list_students"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4272,
              "function": "get_dashboard_source"
            },
            {
              "file": "dashboard/sources.py",
              "line": 156,
              "function": "MySQLDashboardSource"
            },
            {
              "file": "dashboard/sources.py",
              "line": 62,
              "function": "_fmt"
            },
            {
              "file": "app.py",
              "line": 4401,
              "function": "reviewable_student_ids"
            },
            {
              "file": "app.py",
              "line": 2481,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/leave-requests/<int:leave_id>/review",
          "methods": [
            "POST"
          ],
          "file": "app.py",
          "line": 4476,
          "function": "review_leave_request",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2482,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 214,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "assignments",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 497
                }
              ]
            },
            {
              "name": "assignment_submissions",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 512
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 168,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 169,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 211,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 243,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 256,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 268,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 282,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 291,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 297,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 4476,
              "function": "review_leave_request"
            },
            {
              "file": "app.py",
              "line": 4407,
              "function": "notify_leave_result"
            },
            {
              "file": "attendance/notify.py",
              "line": 73,
              "function": "get_mailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 32,
              "function": "ConsoleMailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 46,
              "function": "SmtpMailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 27,
              "function": "campus_email"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 4401,
              "function": "reviewable_student_ids"
            },
            {
              "file": "app.py",
              "line": 2481,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 4272,
              "function": "get_dashboard_source"
            },
            {
              "file": "dashboard/sources.py",
              "line": 156,
              "function": "MySQLDashboardSource"
            },
            {
              "file": "dashboard/sources.py",
              "line": 62,
              "function": "_fmt"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/index.html",
          "line": 420
        },
        {
          "file": "static/index.html",
          "line": 2018
        },
        {
          "file": "static/index.html",
          "line": 2033
        },
        {
          "file": "static/index.html",
          "line": 2075
        },
        {
          "file": "static/index.html",
          "line": 2091
        },
        {
          "file": "static/index.html",
          "line": 2106
        },
        {
          "file": "static/index.html",
          "line": 2141
        }
      ]
    },
    {
      "id": "course",
      "name": "修業進度與擋修",
      "group": "學習",
      "summary": "比對已修科目與先修規則，計算修業進度與擋修影響。",
      "routes": [
        {
          "url": "/api/courses",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 2040,
          "function": "get_all_courses",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 2040,
              "function": "get_all_courses"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/courses/check",
          "methods": [
            "POST",
            "GET"
          ],
          "file": "app.py",
          "line": 2048,
          "function": "check_courses_prerequisites",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2006,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 153
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 2048,
              "function": "check_courses_prerequisites"
            },
            {
              "file": "app.py",
              "line": 2003,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2022,
              "function": "hide_untaken_demo_courses"
            },
            {
              "file": "app.py",
              "line": 2029,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2014,
              "function": "current_student_id"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/student/courses/personalized",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 2130,
          "function": "get_personalized_courses",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2006,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 153
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 2130,
              "function": "get_personalized_courses"
            },
            {
              "file": "app.py",
              "line": 2029,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2003,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 2014,
              "function": "current_student_id"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/courses/what-if",
          "methods": [
            "POST"
          ],
          "file": "app.py",
          "line": 2230,
          "function": "what_if_course_failed",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 2230,
              "function": "what_if_course_failed"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/index.html",
          "line": 2389
        },
        {
          "file": "static/index.html",
          "line": 2390
        },
        {
          "file": "static/index.html",
          "line": 3137
        },
        {
          "file": "static/js/campus-features.js",
          "line": 501
        }
      ]
    },
    {
      "id": "plan",
      "name": "選課檢查",
      "group": "學習",
      "summary": "讀取開課資料，檢查所選課程的限制與衝突。",
      "routes": [
        {
          "url": "/api/campus/course-plan/recommendations",
          "methods": [
            "GET"
          ],
          "file": "campus/courses_ext.py",
          "line": 88,
          "function": "recommendations",
          "tables": [
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 214,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "assignments",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 497
                }
              ]
            },
            {
              "name": "assignment_submissions",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 512
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 168,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 169,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 211,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 243,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 256,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 268,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 282,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 291,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 297,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2006,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 153
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/courses_ext.py",
              "line": 88,
              "function": "recommendations"
            },
            {
              "file": "campus/courses_ext.py",
              "line": 72,
              "function": "schedule_checks"
            },
            {
              "file": "campus/courses_ext.py",
              "line": 37,
              "function": "slot_text"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/courses_ext.py",
              "line": 42,
              "function": "offerings_with_course"
            },
            {
              "file": "campus/courses_ext.py",
              "line": 64,
              "function": "actual_schedule"
            },
            {
              "file": "app.py",
              "line": 4272,
              "function": "get_dashboard_source"
            },
            {
              "file": "dashboard/sources.py",
              "line": 156,
              "function": "MySQLDashboardSource"
            },
            {
              "file": "dashboard/sources.py",
              "line": 62,
              "function": "_fmt"
            },
            {
              "file": "campus/courses_ext.py",
              "line": 56,
              "function": "student_passed_ids"
            },
            {
              "file": "app.py",
              "line": 2003,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2029,
              "function": "summarize_credits"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/course-plan/offerings",
          "methods": [
            "GET"
          ],
          "file": "campus/courses_ext.py",
          "line": 112,
          "function": "list_offerings",
          "tables": [],
          "files": [
            {
              "file": "campus/courses_ext.py",
              "line": 112,
              "function": "list_offerings"
            },
            {
              "file": "campus/courses_ext.py",
              "line": 42,
              "function": "offerings_with_course"
            },
            {
              "file": "campus/courses_ext.py",
              "line": 37,
              "function": "slot_text"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/course-plan/check",
          "methods": [
            "POST"
          ],
          "file": "campus/courses_ext.py",
          "line": 117,
          "function": "check_plan",
          "tables": [
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 214,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "assignments",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 497
                }
              ]
            },
            {
              "name": "assignment_submissions",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 512
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 168,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 169,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 211,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 243,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 256,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 268,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 282,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 291,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 297,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2006,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 153
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/courses_ext.py",
              "line": 117,
              "function": "check_plan"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/courses_ext.py",
              "line": 72,
              "function": "schedule_checks"
            },
            {
              "file": "campus/courses_ext.py",
              "line": 37,
              "function": "slot_text"
            },
            {
              "file": "campus/courses_ext.py",
              "line": 42,
              "function": "offerings_with_course"
            },
            {
              "file": "campus/courses_ext.py",
              "line": 64,
              "function": "actual_schedule"
            },
            {
              "file": "app.py",
              "line": 4272,
              "function": "get_dashboard_source"
            },
            {
              "file": "dashboard/sources.py",
              "line": 156,
              "function": "MySQLDashboardSource"
            },
            {
              "file": "dashboard/sources.py",
              "line": 62,
              "function": "_fmt"
            },
            {
              "file": "campus/courses_ext.py",
              "line": 56,
              "function": "student_passed_ids"
            },
            {
              "file": "app.py",
              "line": 2003,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2029,
              "function": "summarize_credits"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/js/campus-features.js",
          "line": 501
        },
        {
          "file": "static/js/campus-features.js",
          "line": 536
        },
        {
          "file": "static/js/campus-features.js",
          "line": 565
        }
      ]
    },
    {
      "id": "graduation",
      "name": "畢業門檻",
      "group": "學習",
      "summary": "彙整學分與證照，計算畢業門檻達成情形。",
      "routes": [
        {
          "url": "/api/student/graduation-audit",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 2202,
          "function": "graduation_audit",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 2214,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 214,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "assignments",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 497
                }
              ]
            },
            {
              "name": "assignment_submissions",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 512
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 168,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 169,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 211,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 243,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 256,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 268,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 282,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 291,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 297,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2006,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 153
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2314,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "departments",
              "file": "app.py",
              "line": 2314,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 53
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 2202,
              "function": "graduation_audit"
            },
            {
              "file": "app.py",
              "line": 4272,
              "function": "get_dashboard_source"
            },
            {
              "file": "dashboard/sources.py",
              "line": 156,
              "function": "MySQLDashboardSource"
            },
            {
              "file": "dashboard/sources.py",
              "line": 62,
              "function": "_fmt"
            },
            {
              "file": "app.py",
              "line": 2003,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 3711,
              "function": "teacher_can_view_student"
            },
            {
              "file": "app.py",
              "line": 2313,
              "function": "_load_student_info"
            },
            {
              "file": "curriculum/audit.py",
              "line": 17,
              "function": "load_curriculum"
            },
            {
              "file": "curriculum/audit.py",
              "line": 54,
              "function": "audit"
            },
            {
              "file": "curriculum/audit.py",
              "line": 25,
              "function": "normalize"
            },
            {
              "file": "curriculum/audit.py",
              "line": 38,
              "function": "_best_requirement"
            },
            {
              "file": "curriculum/audit.py",
              "line": 48,
              "function": "_is_complete"
            },
            {
              "file": "curriculum/audit.py",
              "line": 30,
              "function": "_match_length"
            },
            {
              "file": "app.py",
              "line": 1146,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 2299,
              "function": "_resolve_graduation_target_student"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/student/graduation/dashboard",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 2432,
          "function": "student_graduation_dashboard",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2006,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 153
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            },
            {
              "name": "graduation_requirements",
              "file": "app.py",
              "line": 2345,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 299
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2324,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "certificates",
              "file": "app.py",
              "line": 2325,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2325,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "certificates",
              "file": "app.py",
              "line": 2332,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2332,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2314,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "departments",
              "file": "app.py",
              "line": 2314,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 53
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 2432,
              "function": "student_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 2421,
              "function": "_graduation_target_or_error"
            },
            {
              "file": "app.py",
              "line": 2350,
              "function": "_compute_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2003,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2344,
              "function": "_load_dept_requirements"
            },
            {
              "file": "app.py",
              "line": 2322,
              "function": "_load_cohort"
            },
            {
              "file": "app.py",
              "line": 2029,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2313,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 2299,
              "function": "_resolve_graduation_target_student"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/student/graduation/export.csv",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 2440,
          "function": "export_graduation_dashboard_csv",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2006,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 153
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            },
            {
              "name": "graduation_requirements",
              "file": "app.py",
              "line": 2345,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 299
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2324,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "certificates",
              "file": "app.py",
              "line": 2325,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2325,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "certificates",
              "file": "app.py",
              "line": 2332,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2332,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2314,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "departments",
              "file": "app.py",
              "line": 2314,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 53
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 2440,
              "function": "export_graduation_dashboard_csv"
            },
            {
              "file": "app.py",
              "line": 2421,
              "function": "_graduation_target_or_error"
            },
            {
              "file": "app.py",
              "line": 2350,
              "function": "_compute_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2003,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2344,
              "function": "_load_dept_requirements"
            },
            {
              "file": "app.py",
              "line": 2322,
              "function": "_load_cohort"
            },
            {
              "file": "app.py",
              "line": 2029,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2313,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 2299,
              "function": "_resolve_graduation_target_student"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/teacher/class-summary",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 2489,
          "function": "teacher_class_summary",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2006,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 153
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            },
            {
              "name": "graduation_requirements",
              "file": "app.py",
              "line": 2345,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 299
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2324,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "certificates",
              "file": "app.py",
              "line": 2325,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2325,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "certificates",
              "file": "app.py",
              "line": 2332,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2332,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2314,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "departments",
              "file": "app.py",
              "line": 2314,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 53
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2482,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 2489,
              "function": "teacher_class_summary"
            },
            {
              "file": "app.py",
              "line": 2350,
              "function": "_compute_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2003,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2344,
              "function": "_load_dept_requirements"
            },
            {
              "file": "app.py",
              "line": 2322,
              "function": "_load_cohort"
            },
            {
              "file": "app.py",
              "line": 2029,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2313,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 2481,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/index.html",
          "line": 779
        },
        {
          "file": "static/index.html",
          "line": 3066
        },
        {
          "file": "static/index.html",
          "line": 3401
        },
        {
          "file": "static/index.html",
          "line": 3429
        },
        {
          "file": "static/index.html",
          "line": 3603
        },
        {
          "file": "static/index.html",
          "line": 3694
        }
      ]
    },
    {
      "id": "attendance",
      "name": "班級與個人出缺勤",
      "group": "導師班",
      "summary": "讀取出缺勤紀錄，依規則計算提醒並處理通知。",
      "routes": [
        {
          "url": "/api/teacher/class-attendance",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 2523,
          "function": "teacher_class_attendance",
          "tables": [
            {
              "name": "course_map",
              "file": "app.py",
              "line": 4171,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 122
                },
                {
                  "file": "init_db.py",
                  "line": 84
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 214,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "assignments",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 497
                }
              ]
            },
            {
              "name": "assignment_submissions",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 512
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 168,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 169,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 211,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 243,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 256,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 268,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 282,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 291,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 297,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 4158,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2516,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2482,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 120,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 129,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 140,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 97,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 136,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 2523,
              "function": "teacher_class_attendance"
            },
            {
              "file": "app.py",
              "line": 4165,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1146,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4170,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4272,
              "function": "get_dashboard_source"
            },
            {
              "file": "dashboard/sources.py",
              "line": 156,
              "function": "MySQLDashboardSource"
            },
            {
              "file": "dashboard/sources.py",
              "line": 62,
              "function": "_fmt"
            },
            {
              "file": "app.py",
              "line": 4157,
              "function": "list_students"
            },
            {
              "file": "attendance/policy.py",
              "line": 38,
              "function": "summarize_attendance"
            },
            {
              "file": "attendance/policy.py",
              "line": 27,
              "function": "record_semester"
            },
            {
              "file": "attendance/policy.py",
              "line": 23,
              "function": "_round"
            },
            {
              "file": "attendance/policy.py",
              "line": 15,
              "function": "_number"
            },
            {
              "file": "app.py",
              "line": 2515,
              "function": "_list_class_names"
            },
            {
              "file": "app.py",
              "line": 2481,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 4152,
              "function": "get_attendance_source"
            },
            {
              "file": "attendance/sources.py",
              "line": 86,
              "function": "MySQLAttendanceSource"
            },
            {
              "file": "attendance/sources.py",
              "line": 43,
              "function": "_normalize"
            },
            {
              "file": "app.py",
              "line": 4161,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/student/attendance",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 4176,
          "function": "get_my_attendance",
          "tables": [
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 120,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 129,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 140,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 97,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 136,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "course_map",
              "file": "app.py",
              "line": 4171,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 122
                },
                {
                  "file": "init_db.py",
                  "line": 84
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 4176,
              "function": "get_my_attendance"
            },
            {
              "file": "app.py",
              "line": 4152,
              "function": "get_attendance_source"
            },
            {
              "file": "attendance/sources.py",
              "line": 86,
              "function": "MySQLAttendanceSource"
            },
            {
              "file": "attendance/sources.py",
              "line": 43,
              "function": "_normalize"
            },
            {
              "file": "app.py",
              "line": 4165,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1146,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4170,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4161,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "attendance/policy.py",
              "line": 38,
              "function": "summarize_attendance"
            },
            {
              "file": "attendance/policy.py",
              "line": 27,
              "function": "record_semester"
            },
            {
              "file": "attendance/policy.py",
              "line": 23,
              "function": "_round"
            },
            {
              "file": "attendance/policy.py",
              "line": 15,
              "function": "_number"
            },
            {
              "file": "app.py",
              "line": 2014,
              "function": "current_student_id"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/attendance",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "app.py",
          "line": 4192,
          "function": "manage_attendance_records",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 4158,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 120,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 129,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 140,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 97,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 136,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 4192,
              "function": "manage_attendance_records"
            },
            {
              "file": "app.py",
              "line": 4161,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "attendance/notify.py",
              "line": 73,
              "function": "get_mailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 32,
              "function": "ConsoleMailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 46,
              "function": "SmtpMailer"
            },
            {
              "file": "app.py",
              "line": 4157,
              "function": "list_students"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 4152,
              "function": "get_attendance_source"
            },
            {
              "file": "attendance/sources.py",
              "line": 86,
              "function": "MySQLAttendanceSource"
            },
            {
              "file": "attendance/sources.py",
              "line": 43,
              "function": "_normalize"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/attendance/notify",
          "methods": [
            "POST"
          ],
          "file": "app.py",
          "line": 4245,
          "function": "notify_attendance_now",
          "tables": [
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 120,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 129,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 140,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 97,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 136,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 4245,
              "function": "notify_attendance_now"
            },
            {
              "file": "app.py",
              "line": 4152,
              "function": "get_attendance_source"
            },
            {
              "file": "attendance/sources.py",
              "line": 86,
              "function": "MySQLAttendanceSource"
            },
            {
              "file": "attendance/sources.py",
              "line": 43,
              "function": "_normalize"
            },
            {
              "file": "attendance/notify.py",
              "line": 88,
              "function": "send_pending_notifications"
            },
            {
              "file": "attendance/notify.py",
              "line": 27,
              "function": "campus_email"
            },
            {
              "file": "attendance/notify.py",
              "line": 73,
              "function": "get_mailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 32,
              "function": "ConsoleMailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 46,
              "function": "SmtpMailer"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 2243
        },
        {
          "file": "static/admin.html",
          "line": 2286
        },
        {
          "file": "static/admin.html",
          "line": 2312
        },
        {
          "file": "static/index.html",
          "line": 576
        },
        {
          "file": "static/index.html",
          "line": 2164
        },
        {
          "file": "static/js/campus-features.js",
          "line": 857
        },
        {
          "file": "static/js/campus-features.js",
          "line": 871
        }
      ]
    },
    {
      "id": "class",
      "name": "我的導師班與學生總覽",
      "group": "導師班",
      "summary": "檢查導師班與學生授權，整合班級或學生的學習狀況。",
      "routes": [
        {
          "url": "/api/teacher/class-overview",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 2581,
          "function": "teacher_class_overview",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2006,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 153
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            },
            {
              "name": "student_privacy_settings",
              "file": "app.py",
              "line": 2877,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 285
                }
              ]
            },
            {
              "name": "course_map",
              "file": "app.py",
              "line": 4171,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 122
                },
                {
                  "file": "init_db.py",
                  "line": 84
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 4158,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2516,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 120,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 129,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 140,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 97,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 136,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2482,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 2581,
              "function": "teacher_class_overview"
            },
            {
              "file": "app.py",
              "line": 2961,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2029,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2003,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2874,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 4165,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1146,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4170,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 4157,
              "function": "list_students"
            },
            {
              "file": "attendance/policy.py",
              "line": 38,
              "function": "summarize_attendance"
            },
            {
              "file": "attendance/policy.py",
              "line": 27,
              "function": "record_semester"
            },
            {
              "file": "attendance/policy.py",
              "line": 23,
              "function": "_round"
            },
            {
              "file": "attendance/policy.py",
              "line": 15,
              "function": "_number"
            },
            {
              "file": "app.py",
              "line": 2515,
              "function": "_list_class_names"
            },
            {
              "file": "app.py",
              "line": 4152,
              "function": "get_attendance_source"
            },
            {
              "file": "attendance/sources.py",
              "line": 86,
              "function": "MySQLAttendanceSource"
            },
            {
              "file": "attendance/sources.py",
              "line": 43,
              "function": "_normalize"
            },
            {
              "file": "app.py",
              "line": 4161,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 2481,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/teacher/student-profile",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 2650,
          "function": "teacher_student_profile",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 2642,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 214,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "assignments",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 497
                }
              ]
            },
            {
              "name": "assignment_submissions",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 512
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 168,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 169,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 211,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 243,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 256,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 268,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 282,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 291,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 297,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 120,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 129,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 140,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 97,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 136,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2006,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 153
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            },
            {
              "name": "student_privacy_settings",
              "file": "app.py",
              "line": 2877,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 285
                }
              ]
            },
            {
              "name": "course_map",
              "file": "app.py",
              "line": 4171,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 122
                },
                {
                  "file": "init_db.py",
                  "line": 84
                }
              ]
            },
            {
              "name": "graduation_requirements",
              "file": "app.py",
              "line": 2345,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 299
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2324,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "certificates",
              "file": "app.py",
              "line": 2325,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2325,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "certificates",
              "file": "app.py",
              "line": 2332,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2332,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2314,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "departments",
              "file": "app.py",
              "line": 2314,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 53
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 2650,
              "function": "teacher_student_profile"
            },
            {
              "file": "app.py",
              "line": 2641,
              "function": "_student_parent_phone"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4272,
              "function": "get_dashboard_source"
            },
            {
              "file": "dashboard/sources.py",
              "line": 156,
              "function": "MySQLDashboardSource"
            },
            {
              "file": "dashboard/sources.py",
              "line": 62,
              "function": "_fmt"
            },
            {
              "file": "app.py",
              "line": 4152,
              "function": "get_attendance_source"
            },
            {
              "file": "attendance/sources.py",
              "line": 86,
              "function": "MySQLAttendanceSource"
            },
            {
              "file": "attendance/sources.py",
              "line": 43,
              "function": "_normalize"
            },
            {
              "file": "app.py",
              "line": 2961,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 2029,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2003,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2874,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 4165,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1146,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4170,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 4161,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 2350,
              "function": "_compute_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 2344,
              "function": "_load_dept_requirements"
            },
            {
              "file": "app.py",
              "line": 2322,
              "function": "_load_cohort"
            },
            {
              "file": "app.py",
              "line": 2313,
              "function": "_load_student_info"
            },
            {
              "file": "attendance/policy.py",
              "line": 38,
              "function": "summarize_attendance"
            },
            {
              "file": "attendance/policy.py",
              "line": 27,
              "function": "record_semester"
            },
            {
              "file": "attendance/policy.py",
              "line": 23,
              "function": "_round"
            },
            {
              "file": "attendance/policy.py",
              "line": 15,
              "function": "_number"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/js/campus-features.js",
          "line": 1137
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1149
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1265
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1276
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1420
        }
      ]
    },
    {
      "id": "counseling",
      "name": "導生關懷紀錄",
      "group": "導師班",
      "summary": "檢查班級與紀錄權限，儲存晤談、追蹤進度並提供匯出。",
      "routes": [
        {
          "url": "/api/campus/counseling",
          "methods": [
            "GET"
          ],
          "file": "campus/counseling.py",
          "line": 203,
          "function": "list_counseling",
          "tables": [
            {
              "name": "counseling_records",
              "file": "campus/counseling.py",
              "line": 53,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 506
                },
                {
                  "file": "init_db.py",
                  "line": 853
                }
              ]
            },
            {
              "name": "counseling_records",
              "file": "campus/counseling.py",
              "line": 37,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 506
                },
                {
                  "file": "init_db.py",
                  "line": 853
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/counseling.py",
              "line": 203,
              "function": "list_counseling"
            },
            {
              "file": "campus/counseling.py",
              "line": 143,
              "function": "can_edit"
            },
            {
              "file": "campus/counseling.py",
              "line": 49,
              "function": "load_records"
            },
            {
              "file": "campus/counseling.py",
              "line": 40,
              "function": "_row"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/counseling.py",
              "line": 36,
              "function": "use_db"
            },
            {
              "file": "campus/counseling.py",
              "line": 120,
              "function": "scope_class"
            },
            {
              "file": "campus/counseling.py",
              "line": 116,
              "function": "class_names"
            }
          ],
          "storage": [
            "data/campus_store.json → counseling"
          ]
        },
        {
          "url": "/api/campus/counseling",
          "methods": [
            "POST"
          ],
          "file": "campus/counseling.py",
          "line": 233,
          "function": "create_counseling",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "counseling_records",
              "file": "campus/counseling.py",
              "line": 75,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 506
                },
                {
                  "file": "init_db.py",
                  "line": 853
                }
              ]
            },
            {
              "name": "counseling_records",
              "file": "campus/counseling.py",
              "line": 67,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 506
                },
                {
                  "file": "init_db.py",
                  "line": 853
                }
              ]
            },
            {
              "name": "counseling_records",
              "file": "campus/counseling.py",
              "line": 37,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 506
                },
                {
                  "file": "init_db.py",
                  "line": 853
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/counseling.py",
              "line": 233,
              "function": "create_counseling"
            },
            {
              "file": "campus/counseling.py",
              "line": 192,
              "function": "audit_summary"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "campus/counseling.py",
              "line": 72,
              "function": "insert_record"
            },
            {
              "file": "campus/counseling.py",
              "line": 65,
              "function": "find_record"
            },
            {
              "file": "campus/counseling.py",
              "line": 40,
              "function": "_row"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/counseling.py",
              "line": 36,
              "function": "use_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/counseling.py",
              "line": 147,
              "function": "clean"
            },
            {
              "file": "campus/counseling.py",
              "line": 131,
              "function": "student_in_scope"
            }
          ],
          "storage": [
            "data/campus_store.json → counseling"
          ]
        },
        {
          "url": "/api/campus/counseling/<int:record_id>",
          "methods": [
            "PUT",
            "DELETE"
          ],
          "file": "campus/counseling.py",
          "line": 255,
          "function": "edit_counseling",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "counseling_records",
              "file": "campus/counseling.py",
              "line": 104,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 506
                },
                {
                  "file": "init_db.py",
                  "line": 853
                }
              ]
            },
            {
              "name": "counseling_records",
              "file": "campus/counseling.py",
              "line": 37,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 506
                },
                {
                  "file": "init_db.py",
                  "line": 853
                }
              ]
            },
            {
              "name": "counseling_records",
              "file": "campus/counseling.py",
              "line": 93,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 506
                },
                {
                  "file": "init_db.py",
                  "line": 853
                }
              ]
            },
            {
              "name": "counseling_records",
              "file": "campus/counseling.py",
              "line": 67,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 506
                },
                {
                  "file": "init_db.py",
                  "line": 853
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/counseling.py",
              "line": 255,
              "function": "edit_counseling"
            },
            {
              "file": "campus/counseling.py",
              "line": 192,
              "function": "audit_summary"
            },
            {
              "file": "campus/counseling.py",
              "line": 131,
              "function": "student_in_scope"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "campus/counseling.py",
              "line": 102,
              "function": "delete_record"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/counseling.py",
              "line": 36,
              "function": "use_db"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/counseling.py",
              "line": 143,
              "function": "can_edit"
            },
            {
              "file": "campus/counseling.py",
              "line": 89,
              "function": "update_record"
            },
            {
              "file": "campus/counseling.py",
              "line": 40,
              "function": "_row"
            },
            {
              "file": "campus/counseling.py",
              "line": 65,
              "function": "find_record"
            },
            {
              "file": "campus/counseling.py",
              "line": 147,
              "function": "clean"
            }
          ],
          "storage": [
            "data/campus_store.json → counseling"
          ]
        },
        {
          "url": "/api/campus/counseling/export.csv",
          "methods": [
            "GET"
          ],
          "file": "campus/counseling.py",
          "line": 278,
          "function": "export_counseling",
          "tables": [
            {
              "name": "counseling_records",
              "file": "campus/counseling.py",
              "line": 53,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 506
                },
                {
                  "file": "init_db.py",
                  "line": 853
                }
              ]
            },
            {
              "name": "counseling_records",
              "file": "campus/counseling.py",
              "line": 37,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 506
                },
                {
                  "file": "init_db.py",
                  "line": 853
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/counseling.py",
              "line": 278,
              "function": "export_counseling"
            },
            {
              "file": "campus/counseling.py",
              "line": 49,
              "function": "load_records"
            },
            {
              "file": "campus/counseling.py",
              "line": 40,
              "function": "_row"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/counseling.py",
              "line": 36,
              "function": "use_db"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "campus/counseling.py",
              "line": 120,
              "function": "scope_class"
            },
            {
              "file": "campus/counseling.py",
              "line": 116,
              "function": "class_names"
            }
          ],
          "storage": [
            "data/campus_store.json → counseling"
          ]
        }
      ],
      "frontend": [
        {
          "file": "static/js/campus-features.js",
          "line": 973
        },
        {
          "file": "static/js/campus-features.js",
          "line": 994
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1006
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1114
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1116
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1126
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1132
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1421
        }
      ]
    },
    {
      "id": "warning",
      "name": "學業預警",
      "group": "學習",
      "summary": "檢查查詢權限與授權，分析未通過科目和擋修風險。",
      "routes": [
        {
          "url": "/api/student/early-warning",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 3020,
          "function": "get_student_early_warning",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2006,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 153
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2314,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "departments",
              "file": "app.py",
              "line": 2314,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 53
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            },
            {
              "name": "users",
              "file": "app.py",
              "line": 2956,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 95
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            },
            {
              "name": "student_privacy_settings",
              "file": "app.py",
              "line": 2877,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 285
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 3020,
              "function": "get_student_early_warning"
            },
            {
              "file": "app.py",
              "line": 2961,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2029,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2003,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2313,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 2954,
              "function": "find_class_advisor"
            },
            {
              "file": "app.py",
              "line": 2874,
              "function": "load_privacy_settings"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/index.html",
          "line": 3648
        },
        {
          "file": "static/index.html",
          "line": 3667
        },
        {
          "file": "static/index.html",
          "line": 3672
        }
      ]
    },
    {
      "id": "certs",
      "name": "證照與競賽成果",
      "group": "學習",
      "summary": "上傳成果並保存紀錄，由授權人員審核與統計。",
      "routes": [
        {
          "url": "/api/certificates",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "app.py",
          "line": 3724,
          "function": "manage_certificates",
          "tables": [
            {
              "name": "certificates",
              "file": "app.py",
              "line": 3811,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "certificates",
              "file": "app.py",
              "line": 3753,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "certificates",
              "file": "app.py",
              "line": 3821,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2314,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "departments",
              "file": "app.py",
              "line": 2314,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 53
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 3724,
              "function": "manage_certificates"
            },
            {
              "file": "app.py",
              "line": 3711,
              "function": "teacher_can_view_student"
            },
            {
              "file": "app.py",
              "line": 2313,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3717,
              "function": "portfolio_row_dates"
            },
            {
              "file": "app.py",
              "line": 3389,
              "function": "_date_str"
            },
            {
              "file": "app.py",
              "line": 119,
              "function": "save_uploaded_file"
            },
            {
              "file": "app.py",
              "line": 116,
              "function": "allowed_file"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/certificates/<int:cert_id>",
          "methods": [
            "DELETE"
          ],
          "file": "app.py",
          "line": 3854,
          "function": "delete_certificate",
          "tables": [
            {
              "name": "certificates",
              "file": "app.py",
              "line": 3866,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "certificates",
              "file": "app.py",
              "line": 3874,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 3854,
              "function": "delete_certificate"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/competitions",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "app.py",
          "line": 3898,
          "function": "manage_competitions",
          "tables": [
            {
              "name": "competitions",
              "file": "app.py",
              "line": 3968,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 221
                }
              ]
            },
            {
              "name": "competitions",
              "file": "app.py",
              "line": 3927,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 221
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2314,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "departments",
              "file": "app.py",
              "line": 2314,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 53
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 3898,
              "function": "manage_competitions"
            },
            {
              "file": "app.py",
              "line": 3711,
              "function": "teacher_can_view_student"
            },
            {
              "file": "app.py",
              "line": 2313,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3717,
              "function": "portfolio_row_dates"
            },
            {
              "file": "app.py",
              "line": 3389,
              "function": "_date_str"
            },
            {
              "file": "app.py",
              "line": 119,
              "function": "save_uploaded_file"
            },
            {
              "file": "app.py",
              "line": 116,
              "function": "allowed_file"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/competitions/<int:comp_id>",
          "methods": [
            "DELETE"
          ],
          "file": "app.py",
          "line": 4002,
          "function": "delete_competition",
          "tables": [
            {
              "name": "competitions",
              "file": "app.py",
              "line": 4014,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 221
                }
              ]
            },
            {
              "name": "competitions",
              "file": "app.py",
              "line": 4022,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 221
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 4002,
              "function": "delete_competition"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/certs/mine",
          "methods": [
            "GET"
          ],
          "file": "campus/certificates.py",
          "line": 212,
          "function": "my_certs",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 62,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 87,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/certificates.py",
              "line": 212,
              "function": "my_certs"
            },
            {
              "file": "campus/certificates.py",
              "line": 110,
              "function": "submissions"
            },
            {
              "file": "campus/certificates.py",
              "line": 68,
              "function": "_row_to_item"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/certificates.py",
              "line": 156,
              "function": "_json_submissions"
            },
            {
              "file": "campus/certificates.py",
              "line": 61,
              "function": "use_db"
            },
            {
              "file": "campus/certificates.py",
              "line": 96,
              "function": "_import_json_once"
            },
            {
              "file": "campus/certificates.py",
              "line": 85,
              "function": "_insert_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            }
          ],
          "storage": [
            "data/campus_store.json → cert_submissions"
          ]
        },
        {
          "url": "/api/campus/certs",
          "methods": [
            "POST"
          ],
          "file": "campus/certificates.py",
          "line": 221,
          "function": "create_cert",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 62,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 87,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/certificates.py",
              "line": 221,
              "function": "create_cert"
            },
            {
              "file": "app.py",
              "line": 119,
              "function": "save_uploaded_file"
            },
            {
              "file": "app.py",
              "line": 116,
              "function": "allowed_file"
            },
            {
              "file": "campus/certificates.py",
              "line": 120,
              "function": "add_submission"
            },
            {
              "file": "campus/certificates.py",
              "line": 110,
              "function": "submissions"
            },
            {
              "file": "campus/certificates.py",
              "line": 68,
              "function": "_row_to_item"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/certificates.py",
              "line": 156,
              "function": "_json_submissions"
            },
            {
              "file": "campus/certificates.py",
              "line": 61,
              "function": "use_db"
            },
            {
              "file": "campus/certificates.py",
              "line": 96,
              "function": "_import_json_once"
            },
            {
              "file": "campus/certificates.py",
              "line": 85,
              "function": "_insert_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            }
          ],
          "storage": [
            "data/campus_store.json → cert_submissions"
          ]
        },
        {
          "url": "/api/campus/certs/<int:item_id>",
          "methods": [
            "DELETE"
          ],
          "file": "campus/certificates.py",
          "line": 256,
          "function": "delete_cert",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 62,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 87,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 135,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/certificates.py",
              "line": 256,
              "function": "delete_cert"
            },
            {
              "file": "campus/certificates.py",
              "line": 110,
              "function": "submissions"
            },
            {
              "file": "campus/certificates.py",
              "line": 68,
              "function": "_row_to_item"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/certificates.py",
              "line": 156,
              "function": "_json_submissions"
            },
            {
              "file": "campus/certificates.py",
              "line": 61,
              "function": "use_db"
            },
            {
              "file": "campus/certificates.py",
              "line": 96,
              "function": "_import_json_once"
            },
            {
              "file": "campus/certificates.py",
              "line": 85,
              "function": "_insert_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/certificates.py",
              "line": 133,
              "function": "remove_submission"
            }
          ],
          "storage": [
            "data/campus_store.json → cert_submissions"
          ]
        },
        {
          "url": "/api/campus/certs/review",
          "methods": [
            "GET"
          ],
          "file": "campus/certificates.py",
          "line": 269,
          "function": "review_list",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 62,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 87,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/certificates.py",
              "line": 269,
              "function": "review_list"
            },
            {
              "file": "campus/certificates.py",
              "line": 203,
              "function": "can_review"
            },
            {
              "file": "campus/certificates.py",
              "line": 110,
              "function": "submissions"
            },
            {
              "file": "campus/certificates.py",
              "line": 68,
              "function": "_row_to_item"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/certificates.py",
              "line": 156,
              "function": "_json_submissions"
            },
            {
              "file": "campus/certificates.py",
              "line": 61,
              "function": "use_db"
            },
            {
              "file": "campus/certificates.py",
              "line": 96,
              "function": "_import_json_once"
            },
            {
              "file": "campus/certificates.py",
              "line": 85,
              "function": "_insert_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            }
          ],
          "storage": [
            "data/campus_store.json → cert_submissions"
          ]
        },
        {
          "url": "/api/campus/certs/<int:item_id>/review",
          "methods": [
            "POST"
          ],
          "file": "campus/certificates.py",
          "line": 282,
          "function": "review",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 62,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 87,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 146,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/certificates.py",
              "line": 282,
              "function": "review"
            },
            {
              "file": "campus/certificates.py",
              "line": 110,
              "function": "submissions"
            },
            {
              "file": "campus/certificates.py",
              "line": 68,
              "function": "_row_to_item"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/certificates.py",
              "line": 156,
              "function": "_json_submissions"
            },
            {
              "file": "campus/certificates.py",
              "line": 61,
              "function": "use_db"
            },
            {
              "file": "campus/certificates.py",
              "line": 96,
              "function": "_import_json_once"
            },
            {
              "file": "campus/certificates.py",
              "line": 85,
              "function": "_insert_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/certificates.py",
              "line": 203,
              "function": "can_review"
            },
            {
              "file": "campus/certificates.py",
              "line": 184,
              "function": "sync_to_graduation"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "campus/certificates.py",
              "line": 143,
              "function": "save_review"
            }
          ],
          "storage": [
            "data/campus_store.json → cert_submissions"
          ]
        },
        {
          "url": "/api/campus/certs/exemption-reminder",
          "methods": [
            "GET"
          ],
          "file": "campus/certificates.py",
          "line": 309,
          "function": "exemption_reminder_route",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 62,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 87,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/certificates.py",
              "line": 309,
              "function": "exemption_reminder_route"
            },
            {
              "file": "campus/certificates.py",
              "line": 46,
              "function": "exemption_reminder"
            },
            {
              "file": "campus/certificates.py",
              "line": 110,
              "function": "submissions"
            },
            {
              "file": "campus/certificates.py",
              "line": 68,
              "function": "_row_to_item"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/certificates.py",
              "line": 156,
              "function": "_json_submissions"
            },
            {
              "file": "campus/certificates.py",
              "line": 61,
              "function": "use_db"
            },
            {
              "file": "campus/certificates.py",
              "line": 96,
              "function": "_import_json_once"
            },
            {
              "file": "campus/certificates.py",
              "line": 85,
              "function": "_insert_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            }
          ],
          "storage": [
            "data/campus_store.json → cert_submissions"
          ]
        },
        {
          "url": "/api/campus/certs/stats",
          "methods": [
            "GET"
          ],
          "file": "campus/certificates.py",
          "line": 316,
          "function": "stats",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 62,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            },
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 87,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 183
                },
                {
                  "file": "init_db.py",
                  "line": 121
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/certificates.py",
              "line": 316,
              "function": "stats"
            },
            {
              "file": "campus/certificates.py",
              "line": 110,
              "function": "submissions"
            },
            {
              "file": "campus/certificates.py",
              "line": 68,
              "function": "_row_to_item"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/certificates.py",
              "line": 156,
              "function": "_json_submissions"
            },
            {
              "file": "campus/certificates.py",
              "line": 61,
              "function": "use_db"
            },
            {
              "file": "campus/certificates.py",
              "line": 96,
              "function": "_import_json_once"
            },
            {
              "file": "campus/certificates.py",
              "line": 85,
              "function": "_insert_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            }
          ],
          "storage": [
            "data/campus_store.json → cert_submissions"
          ]
        }
      ],
      "frontend": [
        {
          "file": "static/js/campus-features.js",
          "line": 671
        },
        {
          "file": "static/js/campus-features.js",
          "line": 713
        },
        {
          "file": "static/js/campus-features.js",
          "line": 732
        },
        {
          "file": "static/js/campus-features.js",
          "line": 744
        },
        {
          "file": "static/js/campus-features.js",
          "line": 751
        },
        {
          "file": "static/js/campus-features.js",
          "line": 777
        },
        {
          "file": "static/js/campus-features.js",
          "line": 787
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 545
        }
      ]
    },
    {
      "id": "review",
      "name": "學期自評表",
      "group": "學習",
      "summary": "依登入學生與學期讀取、儲存或刪除自評內容。",
      "routes": [
        {
          "url": "/api/self-review",
          "methods": [
            "GET"
          ],
          "file": "self_review/__init__.py",
          "line": 97,
          "function": "list_reviews",
          "tables": [
            {
              "name": "self_reviews",
              "file": "self_review/__init__.py",
              "line": 89,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 615
                }
              ]
            }
          ],
          "files": [
            {
              "file": "self_review/__init__.py",
              "line": 97,
              "function": "list_reviews"
            },
            {
              "file": "self_review/__init__.py",
              "line": 88,
              "function": "load_reviews"
            },
            {
              "file": "self_review/__init__.py",
              "line": 61,
              "function": "_semester_key"
            },
            {
              "file": "self_review/__init__.py",
              "line": 66,
              "function": "_row_to_review"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "self_review/__init__.py",
              "line": 52,
              "function": "_owner"
            },
            {
              "file": "self_review/__init__.py",
              "line": 48,
              "function": "_error"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/self-review/<semester>",
          "methods": [
            "GET",
            "PUT",
            "DELETE"
          ],
          "file": "self_review/__init__.py",
          "line": 140,
          "function": "review",
          "tables": [
            {
              "name": "self_reviews",
              "file": "self_review/__init__.py",
              "line": 172,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 615
                }
              ]
            },
            {
              "name": "self_reviews",
              "file": "self_review/__init__.py",
              "line": 157,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 615
                }
              ]
            },
            {
              "name": "self_reviews",
              "file": "self_review/__init__.py",
              "line": 89,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 615
                }
              ]
            }
          ],
          "files": [
            {
              "file": "self_review/__init__.py",
              "line": 140,
              "function": "review"
            },
            {
              "file": "self_review/__init__.py",
              "line": 88,
              "function": "load_reviews"
            },
            {
              "file": "self_review/__init__.py",
              "line": 61,
              "function": "_semester_key"
            },
            {
              "file": "self_review/__init__.py",
              "line": 66,
              "function": "_row_to_review"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "self_review/__init__.py",
              "line": 48,
              "function": "_error"
            },
            {
              "file": "self_review/__init__.py",
              "line": 111,
              "function": "_parse"
            },
            {
              "file": "self_review/__init__.py",
              "line": 52,
              "function": "_owner"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/js/self-review.js",
          "line": 30
        },
        {
          "file": "static/js/self-review.js",
          "line": 154
        },
        {
          "file": "static/js/self-review.js",
          "line": 184
        }
      ]
    },
    {
      "id": "faculty",
      "name": "教師專長與我的課表",
      "group": "學習",
      "summary": "查詢教師專長、課表與辦公室資料，提供個人或管理端維護。",
      "routes": [
        {
          "url": "/api/campus/teachers",
          "methods": [
            "GET"
          ],
          "file": "campus/facilities.py",
          "line": 171,
          "function": "teachers",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 100,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 171,
              "function": "teachers"
            },
            {
              "file": "campus/facilities.py",
              "line": 149,
              "function": "teacher_status"
            },
            {
              "file": "campus/facilities.py",
              "line": 104,
              "function": "period_at"
            },
            {
              "file": "campus/facilities.py",
              "line": 99,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/facilities.py",
              "line": 90,
              "function": "parse_now"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/faculty",
          "methods": [
            "GET"
          ],
          "file": "faculty/__init__.py",
          "line": 101,
          "function": "search_faculty",
          "tables": [
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 71,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 596
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 100,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            }
          ],
          "files": [
            {
              "file": "faculty/__init__.py",
              "line": 101,
              "function": "search_faculty"
            },
            {
              "file": "faculty/__init__.py",
              "line": 95,
              "function": "_teacher_name"
            },
            {
              "file": "faculty/__init__.py",
              "line": 70,
              "function": "load_profiles"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "faculty/__init__.py",
              "line": 79,
              "function": "_decorate"
            },
            {
              "file": "campus/facilities.py",
              "line": 149,
              "function": "teacher_status"
            },
            {
              "file": "campus/facilities.py",
              "line": 104,
              "function": "period_at"
            },
            {
              "file": "campus/facilities.py",
              "line": 99,
              "function": "load_schedule"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/faculty/me",
          "methods": [
            "GET",
            "PUT"
          ],
          "file": "faculty/__init__.py",
          "line": 183,
          "function": "my_profile",
          "tables": [
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 71,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 596
                }
              ]
            },
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 176,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 596
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "faculty/__init__.py",
              "line": 183,
              "function": "my_profile"
            },
            {
              "file": "faculty/__init__.py",
              "line": 70,
              "function": "load_profiles"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "faculty/__init__.py",
              "line": 66,
              "function": "_error"
            },
            {
              "file": "faculty/__init__.py",
              "line": 174,
              "function": "_save"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "faculty/__init__.py",
              "line": 136,
              "function": "_parse_profile"
            },
            {
              "file": "faculty/__init__.py",
              "line": 95,
              "function": "_teacher_name"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/faculty",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "faculty/__init__.py",
          "line": 214,
          "function": "admin_faculty",
          "tables": [
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 229,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 596
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 71,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 596
                }
              ]
            }
          ],
          "files": [
            {
              "file": "faculty/__init__.py",
              "line": 214,
              "function": "admin_faculty"
            },
            {
              "file": "faculty/__init__.py",
              "line": 66,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "faculty/__init__.py",
              "line": 136,
              "function": "_parse_profile"
            },
            {
              "file": "faculty/__init__.py",
              "line": 70,
              "function": "load_profiles"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "faculty/__init__.py",
              "line": 205,
              "function": "_require_admin"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/faculty/<int:profile_id>",
          "methods": [
            "PUT",
            "DELETE"
          ],
          "file": "faculty/__init__.py",
          "line": 241,
          "function": "admin_faculty_item",
          "tables": [
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 251,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 596
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 176,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 596
                }
              ]
            },
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 71,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 596
                }
              ]
            }
          ],
          "files": [
            {
              "file": "faculty/__init__.py",
              "line": 241,
              "function": "admin_faculty_item"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "faculty/__init__.py",
              "line": 66,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "faculty/__init__.py",
              "line": 174,
              "function": "_save"
            },
            {
              "file": "faculty/__init__.py",
              "line": 136,
              "function": "_parse_profile"
            },
            {
              "file": "faculty/__init__.py",
              "line": 70,
              "function": "load_profiles"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "faculty/__init__.py",
              "line": 205,
              "function": "_require_admin"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 1383
        },
        {
          "file": "static/admin.html",
          "line": 1449
        },
        {
          "file": "static/admin.html",
          "line": 1460
        },
        {
          "file": "static/js/campus-features.js",
          "line": 810
        },
        {
          "file": "static/js/campus-features.js",
          "line": 816
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1418
        },
        {
          "file": "static/js/campus-life.js",
          "line": 534
        },
        {
          "file": "static/js/faculty.js",
          "line": 55
        },
        {
          "file": "static/js/faculty.js",
          "line": 128
        },
        {
          "file": "static/js/faculty.js",
          "line": 152
        }
      ]
    },
    {
      "id": "assistant",
      "name": "申請問題小幫手",
      "group": "校務",
      "summary": "比對申請流程與規章，依設定產生問題回覆。",
      "routes": [
        {
          "url": "/api/assistant/ask",
          "methods": [
            "POST"
          ],
          "file": "assistant/__init__.py",
          "line": 142,
          "function": "ask",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "app.py",
              "line": 1576,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 255
                }
              ]
            },
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 3132,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 291
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "knowledge_base",
              "file": "app.py",
              "line": 3196,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 262
                },
                {
                  "file": "init_db.py",
                  "line": 163
                }
              ]
            },
            {
              "name": "knowledge_categories",
              "file": "app.py",
              "line": 3196,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 244
                },
                {
                  "file": "init_db.py",
                  "line": 152
                }
              ]
            },
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2756,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 318
                },
                {
                  "file": "init_db.py",
                  "line": 195
                }
              ]
            },
            {
              "name": "search_logs",
              "file": "app.py",
              "line": 1527,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 407
                }
              ]
            }
          ],
          "files": [
            {
              "file": "assistant/__init__.py",
              "line": 142,
              "function": "ask"
            },
            {
              "file": "assistant/__init__.py",
              "line": 134,
              "function": "_rule_payload"
            },
            {
              "file": "assistant/__init__.py",
              "line": 128,
              "function": "_flow_payload"
            },
            {
              "file": "assistant/__init__.py",
              "line": 85,
              "function": "ask_claude"
            },
            {
              "file": "assistant/__init__.py",
              "line": 70,
              "function": "_context_text"
            },
            {
              "file": "assistant/__init__.py",
              "line": 61,
              "function": "_get_client"
            },
            {
              "file": "assistant/__init__.py",
              "line": 51,
              "function": "claude_enabled"
            },
            {
              "file": "app.py",
              "line": 1572,
              "function": "record_unmatched_query"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3130,
              "function": "load_synonyms"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 3193,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 2754,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1521,
              "function": "log_search"
            },
            {
              "file": "assistant/__init__.py",
              "line": 116,
              "function": "_too_many"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/assistant/status",
          "methods": [
            "GET"
          ],
          "file": "assistant/__init__.py",
          "line": 181,
          "function": "status",
          "tables": [],
          "files": [
            {
              "file": "assistant/__init__.py",
              "line": 181,
              "function": "status"
            },
            {
              "file": "assistant/__init__.py",
              "line": 51,
              "function": "claude_enabled"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/js/assistant.js",
          "line": 21
        },
        {
          "file": "static/js/assistant.js",
          "line": 58
        }
      ]
    },
    {
      "id": "rules",
      "name": "智慧校規與搜尋",
      "group": "校務",
      "summary": "接收關鍵字，比對規章與同義詞，回傳結果並記錄回饋。",
      "routes": [
        {
          "url": "/api/search",
          "methods": [
            "POST"
          ],
          "file": "app.py",
          "line": 1611,
          "function": "search_knowledge",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 1625,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 291
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "knowledge_base",
              "file": "app.py",
              "line": 1629,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 262
                },
                {
                  "file": "init_db.py",
                  "line": 163
                }
              ]
            },
            {
              "name": "knowledge_categories",
              "file": "app.py",
              "line": 1629,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 244
                },
                {
                  "file": "init_db.py",
                  "line": 152
                }
              ]
            },
            {
              "name": "search_logs",
              "file": "app.py",
              "line": 1527,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 407
                }
              ]
            },
            {
              "name": "unmatched_queries",
              "file": "app.py",
              "line": 1576,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 255
                }
              ]
            },
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2756,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 318
                },
                {
                  "file": "init_db.py",
                  "line": 195
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 1611,
              "function": "search_knowledge"
            },
            {
              "file": "app.py",
              "line": 182,
              "function": "format_updated_at"
            },
            {
              "file": "app.py",
              "line": 1521,
              "function": "log_search"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1572,
              "function": "record_unmatched_query"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 2754,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/feedback",
          "methods": [
            "POST"
          ],
          "file": "app.py",
          "line": 1721,
          "function": "submit_search_feedback",
          "tables": [
            {
              "name": "search_feedback",
              "file": "app.py",
              "line": 1744,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 270
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 1721,
              "function": "submit_search_feedback"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/search/feedback",
          "methods": [
            "POST"
          ],
          "file": "app.py",
          "line": 1721,
          "function": "submit_search_feedback",
          "tables": [
            {
              "name": "search_feedback",
              "file": "app.py",
              "line": 1744,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 270
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 1721,
              "function": "submit_search_feedback"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/categories",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 3078,
          "function": "get_categories",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 3078,
              "function": "get_categories"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/synonyms",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "app.py",
          "line": 3152,
          "function": "manage_synonyms",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 3132,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 291
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 3139,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 291
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 3152,
              "function": "manage_synonyms"
            },
            {
              "file": "app.py",
              "line": 3130,
              "function": "load_synonyms"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3135,
              "function": "add_synonym"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "write_roles_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/synonyms/<int:synonym_id>",
          "methods": [
            "DELETE"
          ],
          "file": "app.py",
          "line": 3175,
          "function": "delete_synonym",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 3181,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 291
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 3132,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 291
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 3175,
              "function": "delete_synonym"
            },
            {
              "file": "app.py",
              "line": 3130,
              "function": "load_synonyms"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/rules",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "app.py",
          "line": 3230,
          "function": "manage_rules",
          "tables": [
            {
              "name": "knowledge_base",
              "file": "app.py",
              "line": 3241,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 262
                },
                {
                  "file": "init_db.py",
                  "line": 163
                }
              ]
            },
            {
              "name": "knowledge_base",
              "file": "app.py",
              "line": 3196,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 262
                },
                {
                  "file": "init_db.py",
                  "line": 163
                }
              ]
            },
            {
              "name": "knowledge_categories",
              "file": "app.py",
              "line": 3196,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 244
                },
                {
                  "file": "init_db.py",
                  "line": 152
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 3230,
              "function": "manage_rules"
            },
            {
              "file": "app.py",
              "line": 3193,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 3200,
              "function": "parse_rule_payload"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "write_roles_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/rules/<int:rule_id>",
          "methods": [
            "PUT",
            "DELETE"
          ],
          "file": "app.py",
          "line": 3257,
          "function": "update_or_delete_rule",
          "tables": [
            {
              "name": "knowledge_base",
              "file": "app.py",
              "line": 3266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 262
                },
                {
                  "file": "init_db.py",
                  "line": 163
                }
              ]
            },
            {
              "name": "knowledge_base",
              "file": "app.py",
              "line": 3279,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 262
                },
                {
                  "file": "init_db.py",
                  "line": 163
                }
              ]
            },
            {
              "name": "knowledge_base",
              "file": "app.py",
              "line": 3196,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 262
                },
                {
                  "file": "init_db.py",
                  "line": 163
                }
              ]
            },
            {
              "name": "knowledge_categories",
              "file": "app.py",
              "line": 3196,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 244
                },
                {
                  "file": "init_db.py",
                  "line": 152
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 3257,
              "function": "update_or_delete_rule"
            },
            {
              "file": "app.py",
              "line": 3193,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 3200,
              "function": "parse_rule_payload"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/rules/suggest",
          "methods": [
            "GET"
          ],
          "file": "campus/rules_ext.py",
          "line": 62,
          "function": "suggest",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "campus/rules_ext.py",
              "line": 17,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 291
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "knowledge_base",
              "file": "campus/rules_ext.py",
              "line": 12,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 262
                },
                {
                  "file": "init_db.py",
                  "line": 163
                }
              ]
            },
            {
              "name": "knowledge_categories",
              "file": "campus/rules_ext.py",
              "line": 12,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 244
                },
                {
                  "file": "init_db.py",
                  "line": 152
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/rules_ext.py",
              "line": 62,
              "function": "suggest"
            },
            {
              "file": "campus/rules_ext.py",
              "line": 42,
              "function": "_phrases"
            },
            {
              "file": "campus/rules_ext.py",
              "line": 16,
              "function": "load_synonyms"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/rules_ext.py",
              "line": 10,
              "function": "load_kb"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/rules/candidates",
          "methods": [
            "GET"
          ],
          "file": "campus/rules_ext.py",
          "line": 92,
          "function": "candidates",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "campus/rules_ext.py",
              "line": 17,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 291
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "knowledge_base",
              "file": "campus/rules_ext.py",
              "line": 12,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 262
                },
                {
                  "file": "init_db.py",
                  "line": 163
                }
              ]
            },
            {
              "name": "knowledge_categories",
              "file": "campus/rules_ext.py",
              "line": 12,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 244
                },
                {
                  "file": "init_db.py",
                  "line": 152
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/rules_ext.py",
              "line": 92,
              "function": "candidates"
            },
            {
              "file": "campus/rules_ext.py",
              "line": 86,
              "function": "_bigrams"
            },
            {
              "file": "campus/rules_ext.py",
              "line": 26,
              "function": "rule_card"
            },
            {
              "file": "campus/rules_ext.py",
              "line": 21,
              "function": "related_checklist"
            },
            {
              "file": "campus/rules_ext.py",
              "line": 16,
              "function": "load_synonyms"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/rules_ext.py",
              "line": 10,
              "function": "load_kb"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/rules/tree",
          "methods": [
            "GET"
          ],
          "file": "campus/rules_ext.py",
          "line": 125,
          "function": "tree",
          "tables": [
            {
              "name": "knowledge_base",
              "file": "campus/rules_ext.py",
              "line": 12,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 262
                },
                {
                  "file": "init_db.py",
                  "line": 163
                }
              ]
            },
            {
              "name": "knowledge_categories",
              "file": "campus/rules_ext.py",
              "line": 12,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 244
                },
                {
                  "file": "init_db.py",
                  "line": 152
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/rules_ext.py",
              "line": 125,
              "function": "tree"
            },
            {
              "file": "campus/rules_ext.py",
              "line": 26,
              "function": "rule_card"
            },
            {
              "file": "campus/rules_ext.py",
              "line": 21,
              "function": "related_checklist"
            },
            {
              "file": "campus/rules_ext.py",
              "line": 10,
              "function": "load_kb"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 1136
        },
        {
          "file": "static/admin.html",
          "line": 1165
        },
        {
          "file": "static/admin.html",
          "line": 1882
        },
        {
          "file": "static/admin.html",
          "line": 1924
        },
        {
          "file": "static/admin.html",
          "line": 1938
        },
        {
          "file": "static/admin.html",
          "line": 1949
        },
        {
          "file": "static/index.html",
          "line": 2266
        },
        {
          "file": "static/index.html",
          "line": 2290
        },
        {
          "file": "static/index.html",
          "line": 2363
        },
        {
          "file": "static/js/campus-features.js",
          "line": 273
        },
        {
          "file": "static/js/campus-features.js",
          "line": 325
        },
        {
          "file": "static/js/campus-features.js",
          "line": 375
        },
        {
          "file": "static/js/campus-features.js",
          "line": 395
        },
        {
          "file": "static/js/home-portal.js",
          "line": 66
        }
      ]
    },
    {
      "id": "checklist",
      "name": "行政申請流程",
      "group": "校務",
      "summary": "讀取申請步驟與應備文件，保存個人的勾選進度。",
      "routes": [
        {
          "url": "/api/checklist/progress",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "app.py",
          "line": 2801,
          "function": "manage_checklist_progress",
          "tables": [
            {
              "name": "checklist_progress",
              "file": "app.py",
              "line": 2768,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 420
                }
              ]
            },
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2756,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 318
                },
                {
                  "file": "init_db.py",
                  "line": 195
                }
              ]
            },
            {
              "name": "checklist_progress",
              "file": "app.py",
              "line": 2783,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 420
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 2801,
              "function": "manage_checklist_progress"
            },
            {
              "file": "app.py",
              "line": 2765,
              "function": "load_checklist_progress"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2754,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 2778,
              "function": "save_checklist_step"
            },
            {
              "file": "app.py",
              "line": 2014,
              "function": "current_student_id"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/student/my-applications",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 2836,
          "function": "get_my_applications",
          "tables": [
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2756,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 318
                },
                {
                  "file": "init_db.py",
                  "line": 195
                }
              ]
            },
            {
              "name": "checklist_progress",
              "file": "app.py",
              "line": 2768,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 420
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 2836,
              "function": "get_my_applications"
            },
            {
              "file": "app.py",
              "line": 2754,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2765,
              "function": "load_checklist_progress"
            },
            {
              "file": "app.py",
              "line": 2014,
              "function": "current_student_id"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/checklists",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "app.py",
          "line": 3083,
          "function": "manage_checklists",
          "tables": [
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 3113,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 318
                },
                {
                  "file": "init_db.py",
                  "line": 195
                }
              ]
            },
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2756,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 318
                },
                {
                  "file": "init_db.py",
                  "line": 195
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 3083,
              "function": "manage_checklists"
            },
            {
              "file": "app.py",
              "line": 2754,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "write_roles_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/checklist-docs",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "campus/services.py",
          "line": 78,
          "function": "checklist_docs",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 78,
              "function": "checklist_docs"
            }
          ],
          "storage": [
            "data/campus_store.json → checklist_docs"
          ]
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 1191
        },
        {
          "file": "static/index.html",
          "line": 567
        },
        {
          "file": "static/index.html",
          "line": 3189
        },
        {
          "file": "static/index.html",
          "line": 3193
        },
        {
          "file": "static/index.html",
          "line": 3195
        },
        {
          "file": "static/index.html",
          "line": 3295
        },
        {
          "file": "static/index.html",
          "line": 3333
        },
        {
          "file": "static/js/campus-features.js",
          "line": 468
        },
        {
          "file": "static/js/campus-features.js",
          "line": 487
        }
      ]
    },
    {
      "id": "calendar",
      "name": "行事曆與期限提醒",
      "group": "校務",
      "summary": "整合校曆、申辦期限與個人行程，依日期回傳事件。",
      "routes": [
        {
          "url": "/api/calendar/current-week",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 1202,
          "function": "get_current_week",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 1202,
              "function": "get_current_week"
            },
            {
              "file": "app.py",
              "line": 1174,
              "function": "calendar_highlights"
            },
            {
              "file": "app.py",
              "line": 1146,
              "function": "current_academic_term"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/deadlines",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "app.py",
          "line": 1276,
          "function": "manage_deadlines",
          "tables": [
            {
              "name": "deadlines",
              "file": "app.py",
              "line": 1285,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 402
                },
                {
                  "file": "init_db.py",
                  "line": 342
                }
              ]
            },
            {
              "name": "deadlines",
              "file": "app.py",
              "line": 1325,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 402
                },
                {
                  "file": "init_db.py",
                  "line": 342
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 1276,
              "function": "manage_deadlines"
            },
            {
              "file": "app.py",
              "line": 1228,
              "function": "_compute_deadline_status"
            },
            {
              "file": "app.py",
              "line": 1220,
              "function": "_deadline_visible_to_role"
            },
            {
              "file": "app.py",
              "line": 1266,
              "function": "normalize_deadline_row"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "write_roles_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/calendar/now",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 1401,
          "function": "get_calendar_now",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1358,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1362,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 1401,
              "function": "get_calendar_now"
            },
            {
              "file": "app.py",
              "line": 1351,
              "function": "fetch_calendar_events"
            },
            {
              "file": "app.py",
              "line": 1343,
              "function": "normalize_calendar_row"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/academic-calendar",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "app.py",
          "line": 1429,
          "function": "manage_academic_calendar",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1443,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1358,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1362,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 1429,
              "function": "manage_academic_calendar"
            },
            {
              "file": "app.py",
              "line": 1351,
              "function": "fetch_calendar_events"
            },
            {
              "file": "app.py",
              "line": 1343,
              "function": "normalize_calendar_row"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1371,
              "function": "parse_calendar_payload"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "write_roles_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/academic-calendar/<int:event_id>",
          "methods": [
            "PUT",
            "DELETE"
          ],
          "file": "app.py",
          "line": 1463,
          "function": "update_or_delete_academic_calendar",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1475,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1489,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1481,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1484,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 1463,
              "function": "update_or_delete_academic_calendar"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1343,
              "function": "normalize_calendar_row"
            },
            {
              "file": "app.py",
              "line": 1371,
              "function": "parse_calendar_payload"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/school-calendar",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 4072,
          "function": "get_school_calendar",
          "tables": [
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2756,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 318
                },
                {
                  "file": "init_db.py",
                  "line": 195
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 4072,
              "function": "get_school_calendar"
            },
            {
              "file": "app.py",
              "line": 3299,
              "function": "load_quick_links"
            },
            {
              "file": "app.py",
              "line": 4044,
              "function": "_calendar_event_detail"
            },
            {
              "file": "school_calendar/actions.py",
              "line": 44,
              "function": "match_actions"
            },
            {
              "file": "app.py",
              "line": 2754,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/school-calendar/sync",
          "methods": [
            "POST"
          ],
          "file": "app.py",
          "line": 4095,
          "function": "sync_school_calendar",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 4095,
              "function": "sync_school_calendar"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/calendar/sync",
          "methods": [
            "POST"
          ],
          "file": "campus/calendar_ext.py",
          "line": 130,
          "function": "sync_ukn_calendar",
          "tables": [],
          "files": [
            {
              "file": "campus/calendar_ext.py",
              "line": 130,
              "function": "sync_ukn_calendar"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 120,
              "function": "guess_category"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 80,
              "function": "parse_ics"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/calendar/month",
          "methods": [
            "GET"
          ],
          "file": "campus/calendar_ext.py",
          "line": 322,
          "function": "calendar_month",
          "tables": [
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 214,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "assignments",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 497
                }
              ]
            },
            {
              "name": "assignment_submissions",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 512
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 168,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 169,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 211,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 243,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 256,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 268,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 282,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 291,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 297,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 245,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 219,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 234,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "deadlines",
              "file": "campus/calendar_ext.py",
              "line": 206,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 402
                },
                {
                  "file": "init_db.py",
                  "line": 342
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1358,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1362,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "checklist_items",
              "file": "campus/calendar_ext.py",
              "line": 147,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 318
                },
                {
                  "file": "init_db.py",
                  "line": 195
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/calendar_ext.py",
              "line": 322,
              "function": "calendar_month"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 169,
              "function": "match_checklist"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 161,
              "function": "_core_words"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 180,
              "function": "checklist_detail"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 47,
              "function": "load_holidays"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 43,
              "function": "_iso"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 199,
              "function": "_to_date"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 280,
              "function": "_role_allowed"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 120,
              "function": "guess_category"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 291,
              "function": "staff_events"
            },
            {
              "file": "app.py",
              "line": 4272,
              "function": "get_dashboard_source"
            },
            {
              "file": "dashboard/sources.py",
              "line": 156,
              "function": "MySQLDashboardSource"
            },
            {
              "file": "dashboard/sources.py",
              "line": 62,
              "function": "_fmt"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 240,
              "function": "list_my_events"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 218,
              "function": "_events_db"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 232,
              "function": "_insert_event"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 205,
              "function": "load_deadlines"
            },
            {
              "file": "app.py",
              "line": 1351,
              "function": "fetch_calendar_events"
            },
            {
              "file": "app.py",
              "line": 1343,
              "function": "normalize_calendar_row"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 146,
              "function": "load_checklists"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/my-events",
          "methods": [
            "POST"
          ],
          "file": "campus/calendar_ext.py",
          "line": 407,
          "function": "add_my_event",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 245,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 219,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 234,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/calendar_ext.py",
              "line": 407,
              "function": "add_my_event"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 240,
              "function": "list_my_events"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 218,
              "function": "_events_db"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 232,
              "function": "_insert_event"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 199,
              "function": "_to_date"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 252,
              "function": "add_event"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 210,
              "function": "my_events_bucket"
            }
          ],
          "storage": [
            "data/campus_store.json → my_events"
          ]
        },
        {
          "url": "/api/campus/my-events/<int:event_id>",
          "methods": [
            "DELETE"
          ],
          "file": "campus/calendar_ext.py",
          "line": 430,
          "function": "delete_my_event",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 268,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 266,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 219,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 234,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/calendar_ext.py",
              "line": 430,
              "function": "delete_my_event"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 263,
              "function": "remove_event"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 210,
              "function": "my_events_bucket"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 218,
              "function": "_events_db"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 232,
              "function": "_insert_event"
            }
          ],
          "storage": [
            "data/campus_store.json → my_events"
          ]
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 960
        },
        {
          "file": "static/admin.html",
          "line": 1217
        },
        {
          "file": "static/admin.html",
          "line": 2063
        },
        {
          "file": "static/admin.html",
          "line": 2079
        },
        {
          "file": "static/admin.html",
          "line": 2093
        },
        {
          "file": "static/admin.html",
          "line": 2159
        },
        {
          "file": "static/admin.html",
          "line": 2179
        },
        {
          "file": "static/index.html",
          "line": 546
        },
        {
          "file": "static/index.html",
          "line": 1206
        },
        {
          "file": "static/index.html",
          "line": 1847
        },
        {
          "file": "static/index.html",
          "line": 2246
        },
        {
          "file": "static/index.html",
          "line": 2600
        },
        {
          "file": "static/index.html",
          "line": 2637
        },
        {
          "file": "static/index.html",
          "line": 3790
        },
        {
          "file": "static/js/campus-features.js",
          "line": 94
        },
        {
          "file": "static/js/campus-features.js",
          "line": 219
        },
        {
          "file": "static/js/campus-features.js",
          "line": 230
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 433
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 476
        }
      ]
    },
    {
      "id": "scholarship",
      "name": "獎助學金檢核",
      "group": "校務",
      "summary": "比對獎助學金條件與學生資料，回傳符合情況或發出提醒。",
      "routes": [
        {
          "url": "/api/scholarships/match",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 3541,
          "function": "match_scholarships",
          "tables": [
            {
              "name": "scholarships",
              "file": "app.py",
              "line": 3393,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 559
                }
              ]
            },
            {
              "name": "departments",
              "file": "app.py",
              "line": 3431,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 53
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            },
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 3422,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 153
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 3401,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 3541,
              "function": "match_scholarships"
            },
            {
              "file": "app.py",
              "line": 3386,
              "function": "_split_list"
            },
            {
              "file": "app.py",
              "line": 3472,
              "function": "evaluate_scholarship"
            },
            {
              "file": "app.py",
              "line": 3469,
              "function": "_fmt"
            },
            {
              "file": "app.py",
              "line": 3392,
              "function": "load_scholarships"
            },
            {
              "file": "app.py",
              "line": 3382,
              "function": "_num"
            },
            {
              "file": "app.py",
              "line": 3389,
              "function": "_date_str"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3430,
              "function": "department_names"
            },
            {
              "file": "app.py",
              "line": 3420,
              "function": "latest_semester_fails"
            },
            {
              "file": "app.py",
              "line": 3399,
              "function": "load_scholarship_profile"
            },
            {
              "file": "app.py",
              "line": 1146,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 2014,
              "function": "current_student_id"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/notify/scholarship-warning",
          "methods": [
            "POST"
          ],
          "file": "app.py",
          "line": 3644,
          "function": "notify_scholarship_and_warning",
          "tables": [
            {
              "name": "notification_log",
              "file": "app.py",
              "line": 3605,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "notification_log",
              "file": "app.py",
              "line": 3614,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 3422,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 153
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            },
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2006,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 153
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 3401,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "users",
              "file": "app.py",
              "line": 3597,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 95
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            },
            {
              "name": "student_privacy_settings",
              "file": "app.py",
              "line": 2877,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 285
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 4158,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "scholarships",
              "file": "app.py",
              "line": 3393,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 559
                }
              ]
            },
            {
              "name": "departments",
              "file": "app.py",
              "line": 3431,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 53
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 3644,
              "function": "notify_scholarship_and_warning"
            },
            {
              "file": "app.py",
              "line": 3472,
              "function": "evaluate_scholarship"
            },
            {
              "file": "app.py",
              "line": 3469,
              "function": "_fmt"
            },
            {
              "file": "app.py",
              "line": 3386,
              "function": "_split_list"
            },
            {
              "file": "attendance/notify.py",
              "line": 27,
              "function": "campus_email"
            },
            {
              "file": "app.py",
              "line": 3629,
              "function": "_notify_once"
            },
            {
              "file": "app.py",
              "line": 3603,
              "function": "already_notified"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3612,
              "function": "mark_notified"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 3620,
              "function": "_send_once"
            },
            {
              "file": "app.py",
              "line": 3420,
              "function": "latest_semester_fails"
            },
            {
              "file": "app.py",
              "line": 2961,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 2029,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2003,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 3399,
              "function": "load_scholarship_profile"
            },
            {
              "file": "app.py",
              "line": 1146,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 3382,
              "function": "_num"
            },
            {
              "file": "app.py",
              "line": 3595,
              "function": "find_parent_account"
            },
            {
              "file": "app.py",
              "line": 2874,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 4157,
              "function": "list_students"
            },
            {
              "file": "attendance/notify.py",
              "line": 73,
              "function": "get_mailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 32,
              "function": "ConsoleMailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 46,
              "function": "SmtpMailer"
            },
            {
              "file": "app.py",
              "line": 3392,
              "function": "load_scholarships"
            },
            {
              "file": "app.py",
              "line": 3389,
              "function": "_date_str"
            },
            {
              "file": "app.py",
              "line": 3430,
              "function": "department_names"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 2332
        },
        {
          "file": "static/index.html",
          "line": 1321
        },
        {
          "file": "static/js/campus-life.js",
          "line": 13
        },
        {
          "file": "static/js/campus-life.js",
          "line": 19
        }
      ]
    },
    {
      "id": "services",
      "name": "宿舍與總務申請",
      "group": "校務",
      "summary": "檢查申請內容與權限，記錄送件及審核進度。",
      "routes": [
        {
          "url": "/api/campus/dorm/beds",
          "methods": [
            "GET",
            "PUT"
          ],
          "file": "campus/services.py",
          "line": 151,
          "function": "dorm_bed_inventory",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/services.py",
              "line": 151,
              "function": "dorm_bed_inventory"
            },
            {
              "file": "campus/services.py",
              "line": 140,
              "function": "dorm_apps"
            },
            {
              "file": "campus/services.py",
              "line": 144,
              "function": "dorm_beds"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            }
          ],
          "storage": [
            "data/campus_store.json → dorm_beds"
          ]
        },
        {
          "url": "/api/campus/dorm/mine",
          "methods": [
            "GET"
          ],
          "file": "campus/services.py",
          "line": 189,
          "function": "dorm_mine",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 189,
              "function": "dorm_mine"
            },
            {
              "file": "campus/services.py",
              "line": 140,
              "function": "dorm_apps"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/dorm/apply",
          "methods": [
            "POST"
          ],
          "file": "campus/services.py",
          "line": 199,
          "function": "dorm_apply",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/services.py",
              "line": 199,
              "function": "dorm_apply"
            },
            {
              "file": "campus/services.py",
              "line": 140,
              "function": "dorm_apps"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/dorm/applications",
          "methods": [
            "GET"
          ],
          "file": "campus/services.py",
          "line": 235,
          "function": "dorm_all",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 235,
              "function": "dorm_all"
            },
            {
              "file": "campus/services.py",
              "line": 140,
              "function": "dorm_apps"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/dorm/applications/<int:app_id>",
          "methods": [
            "POST"
          ],
          "file": "campus/services.py",
          "line": 242,
          "function": "dorm_update",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/services.py",
              "line": 242,
              "function": "dorm_update"
            },
            {
              "file": "campus/services.py",
              "line": 140,
              "function": "dorm_apps"
            },
            {
              "file": "campus/services.py",
              "line": 144,
              "function": "dorm_beds"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            }
          ],
          "storage": [
            "data/campus_store.json → dorm_beds"
          ]
        }
      ],
      "frontend": [
        {
          "file": "static/js/campus-life.js",
          "line": 119
        },
        {
          "file": "static/js/campus-life.js",
          "line": 158
        },
        {
          "file": "static/js/campus-life.js",
          "line": 165
        },
        {
          "file": "static/js/campus-life.js",
          "line": 168
        },
        {
          "file": "static/js/campus-life.js",
          "line": 198
        },
        {
          "file": "static/js/campus-life.js",
          "line": 207
        },
        {
          "file": "static/js/campus-life.js",
          "line": 214
        },
        {
          "file": "static/js/campus-life.js",
          "line": 227
        }
      ]
    },
    {
      "id": "reports",
      "name": "報表與文件下載",
      "group": "校務",
      "summary": "依報表種類與查詢條件整理資料，提供檢視或下載。",
      "routes": [
        {
          "url": "/api/campus/reports/categories",
          "methods": [
            "GET"
          ],
          "file": "campus/reports.py",
          "line": 67,
          "function": "list_categories",
          "tables": [],
          "files": [
            {
              "file": "campus/reports.py",
              "line": 67,
              "function": "list_categories"
            },
            {
              "file": "campus/reports.py",
              "line": 28,
              "function": "files"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/reports",
          "methods": [
            "GET"
          ],
          "file": "campus/reports.py",
          "line": 73,
          "function": "list_files",
          "tables": [],
          "files": [
            {
              "file": "campus/reports.py",
              "line": 73,
              "function": "list_files"
            },
            {
              "file": "campus/reports.py",
              "line": 55,
              "function": "_public_file"
            },
            {
              "file": "campus/reports.py",
              "line": 51,
              "function": "_is_favorited"
            },
            {
              "file": "campus/reports.py",
              "line": 40,
              "function": "favorites"
            },
            {
              "file": "campus/reports.py",
              "line": 44,
              "function": "_can_access"
            },
            {
              "file": "campus/reports.py",
              "line": 28,
              "function": "files"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/reports/my/favorites",
          "methods": [
            "GET"
          ],
          "file": "campus/reports.py",
          "line": 86,
          "function": "my_favorites",
          "tables": [],
          "files": [
            {
              "file": "campus/reports.py",
              "line": 86,
              "function": "my_favorites"
            },
            {
              "file": "campus/reports.py",
              "line": 55,
              "function": "_public_file"
            },
            {
              "file": "campus/reports.py",
              "line": 51,
              "function": "_is_favorited"
            },
            {
              "file": "campus/reports.py",
              "line": 40,
              "function": "favorites"
            },
            {
              "file": "campus/reports.py",
              "line": 44,
              "function": "_can_access"
            },
            {
              "file": "campus/reports.py",
              "line": 28,
              "function": "files"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/reports/<int:file_id>",
          "methods": [
            "GET"
          ],
          "file": "campus/reports.py",
          "line": 96,
          "function": "get_file",
          "tables": [],
          "files": [
            {
              "file": "campus/reports.py",
              "line": 96,
              "function": "get_file"
            },
            {
              "file": "campus/reports.py",
              "line": 28,
              "function": "files"
            },
            {
              "file": "campus/reports.py",
              "line": 55,
              "function": "_public_file"
            },
            {
              "file": "campus/reports.py",
              "line": 51,
              "function": "_is_favorited"
            },
            {
              "file": "campus/reports.py",
              "line": 40,
              "function": "favorites"
            },
            {
              "file": "campus/reports.py",
              "line": 44,
              "function": "_can_access"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/reports",
          "methods": [
            "POST"
          ],
          "file": "campus/reports.py",
          "line": 108,
          "function": "upload_file",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/reports.py",
              "line": 108,
              "function": "upload_file"
            },
            {
              "file": "campus/reports.py",
              "line": 55,
              "function": "_public_file"
            },
            {
              "file": "campus/reports.py",
              "line": 51,
              "function": "_is_favorited"
            },
            {
              "file": "campus/reports.py",
              "line": 40,
              "function": "favorites"
            },
            {
              "file": "campus/reports.py",
              "line": 219,
              "function": "notify_category_watchers"
            },
            {
              "file": "attendance/notify.py",
              "line": 27,
              "function": "campus_email"
            },
            {
              "file": "campus/reports.py",
              "line": 28,
              "function": "files"
            },
            {
              "file": "attendance/notify.py",
              "line": 73,
              "function": "get_mailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 32,
              "function": "ConsoleMailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 46,
              "function": "SmtpMailer"
            },
            {
              "file": "campus/reports.py",
              "line": 36,
              "function": "download_logs"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 119,
              "function": "save_uploaded_file"
            },
            {
              "file": "app.py",
              "line": 116,
              "function": "allowed_file"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/reports/<int:file_id>",
          "methods": [
            "DELETE"
          ],
          "file": "campus/reports.py",
          "line": 141,
          "function": "delete_file",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/reports.py",
              "line": 141,
              "function": "delete_file"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/reports/<int:file_id>/download",
          "methods": [
            "GET"
          ],
          "file": "campus/reports.py",
          "line": 150,
          "function": "download_file",
          "tables": [],
          "files": [
            {
              "file": "campus/reports.py",
              "line": 150,
              "function": "download_file"
            },
            {
              "file": "campus/reports.py",
              "line": 28,
              "function": "files"
            },
            {
              "file": "campus/reports.py",
              "line": 44,
              "function": "_can_access"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/reports/<int:file_id>/favorite",
          "methods": [
            "POST"
          ],
          "file": "campus/reports.py",
          "line": 174,
          "function": "add_favorite",
          "tables": [],
          "files": [
            {
              "file": "campus/reports.py",
              "line": 174,
              "function": "add_favorite"
            },
            {
              "file": "campus/reports.py",
              "line": 28,
              "function": "files"
            },
            {
              "file": "campus/reports.py",
              "line": 51,
              "function": "_is_favorited"
            },
            {
              "file": "campus/reports.py",
              "line": 40,
              "function": "favorites"
            },
            {
              "file": "campus/reports.py",
              "line": 44,
              "function": "_can_access"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/reports/<int:file_id>/favorite",
          "methods": [
            "DELETE"
          ],
          "file": "campus/reports.py",
          "line": 189,
          "function": "remove_favorite",
          "tables": [],
          "files": [
            {
              "file": "campus/reports.py",
              "line": 189,
              "function": "remove_favorite"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/reports/<int:file_id>/stats",
          "methods": [
            "GET"
          ],
          "file": "campus/reports.py",
          "line": 196,
          "function": "file_stats",
          "tables": [],
          "files": [
            {
              "file": "campus/reports.py",
              "line": 196,
              "function": "file_stats"
            },
            {
              "file": "campus/reports.py",
              "line": 40,
              "function": "favorites"
            },
            {
              "file": "campus/reports.py",
              "line": 55,
              "function": "_public_file"
            },
            {
              "file": "campus/reports.py",
              "line": 51,
              "function": "_is_favorited"
            },
            {
              "file": "campus/reports.py",
              "line": 28,
              "function": "files"
            },
            {
              "file": "campus/reports.py",
              "line": 32,
              "function": "view_logs"
            },
            {
              "file": "campus/reports.py",
              "line": 36,
              "function": "download_logs"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/js/reports.js",
          "line": 16
        },
        {
          "file": "static/js/reports.js",
          "line": 17
        },
        {
          "file": "static/js/reports.js",
          "line": 73
        },
        {
          "file": "static/js/reports.js",
          "line": 97
        },
        {
          "file": "static/js/reports.js",
          "line": 145
        },
        {
          "file": "static/js/reports.js",
          "line": 160
        },
        {
          "file": "static/js/reports.js",
          "line": 168
        }
      ]
    },
    {
      "id": "rent",
      "name": "教室與櫃子租借",
      "group": "校園生活",
      "summary": "查詢空間與時段，檢查借用限制後保存預約。",
      "routes": [
        {
          "url": "/api/campus/rooms",
          "methods": [
            "GET"
          ],
          "file": "campus/facilities.py",
          "line": 194,
          "function": "rooms_availability",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 100,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 194,
              "function": "rooms_availability"
            },
            {
              "file": "campus/facilities.py",
              "line": 112,
              "function": "room_code"
            },
            {
              "file": "campus/facilities.py",
              "line": 189,
              "function": "bookings"
            },
            {
              "file": "campus/facilities.py",
              "line": 99,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/rooms/book",
          "methods": [
            "POST"
          ],
          "file": "campus/facilities.py",
          "line": 223,
          "function": "book_room",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 100,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 223,
              "function": "book_room"
            },
            {
              "file": "campus/facilities.py",
              "line": 112,
              "function": "room_code"
            },
            {
              "file": "campus/facilities.py",
              "line": 189,
              "function": "bookings"
            },
            {
              "file": "campus/facilities.py",
              "line": 99,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/rooms/bookings",
          "methods": [
            "GET"
          ],
          "file": "campus/facilities.py",
          "line": 269,
          "function": "my_bookings",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 269,
              "function": "my_bookings"
            },
            {
              "file": "campus/facilities.py",
              "line": 189,
              "function": "bookings"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/rooms/bookings/<int:booking_id>",
          "methods": [
            "POST"
          ],
          "file": "campus/facilities.py",
          "line": 284,
          "function": "update_booking",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 284,
              "function": "update_booking"
            },
            {
              "file": "campus/facilities.py",
              "line": 189,
              "function": "bookings"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/lockers",
          "methods": [
            "GET"
          ],
          "file": "campus/facilities.py",
          "line": 327,
          "function": "list_lockers",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 327,
              "function": "list_lockers"
            },
            {
              "file": "campus/facilities.py",
              "line": 314,
              "function": "expire_holds"
            },
            {
              "file": "campus/facilities.py",
              "line": 310,
              "function": "lockers"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/lockers/<locker_id>/reserve",
          "methods": [
            "POST"
          ],
          "file": "campus/facilities.py",
          "line": 347,
          "function": "reserve_locker",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 347,
              "function": "reserve_locker"
            },
            {
              "file": "campus/facilities.py",
              "line": 314,
              "function": "expire_holds"
            },
            {
              "file": "campus/facilities.py",
              "line": 310,
              "function": "lockers"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/lockers/<locker_id>/cancel",
          "methods": [
            "POST"
          ],
          "file": "campus/facilities.py",
          "line": 365,
          "function": "cancel_locker",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 365,
              "function": "cancel_locker"
            },
            {
              "file": "campus/facilities.py",
              "line": 310,
              "function": "lockers"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/lockers/admin",
          "methods": [
            "GET"
          ],
          "file": "campus/facilities.py",
          "line": 379,
          "function": "lockers_admin",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 379,
              "function": "lockers_admin"
            },
            {
              "file": "campus/facilities.py",
              "line": 314,
              "function": "expire_holds"
            },
            {
              "file": "campus/facilities.py",
              "line": 310,
              "function": "lockers"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/lockers/<locker_id>/paid",
          "methods": [
            "POST"
          ],
          "file": "campus/facilities.py",
          "line": 398,
          "function": "locker_paid",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 398,
              "function": "locker_paid"
            },
            {
              "file": "campus/facilities.py",
              "line": 310,
              "function": "lockers"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 971
        },
        {
          "file": "static/admin.html",
          "line": 988
        },
        {
          "file": "static/admin.html",
          "line": 1019
        },
        {
          "file": "static/admin.html",
          "line": 1034
        },
        {
          "file": "static/js/campus-life.js",
          "line": 323
        },
        {
          "file": "static/js/campus-life.js",
          "line": 378
        },
        {
          "file": "static/js/campus-life.js",
          "line": 388
        },
        {
          "file": "static/js/campus-life.js",
          "line": 402
        },
        {
          "file": "static/js/campus-life.js",
          "line": 413
        },
        {
          "file": "static/js/campus-life.js",
          "line": 442
        },
        {
          "file": "static/js/campus-life.js",
          "line": 448
        }
      ]
    },
    {
      "id": "map",
      "name": "地圖、辦公室與交通",
      "group": "校園生活",
      "summary": "讀取校園地點或外部資訊，整理成地圖與生活資訊。",
      "routes": [
        {
          "url": "/api/campus/map",
          "methods": [
            "GET"
          ],
          "file": "campus/facilities.py",
          "line": 119,
          "function": "campus_map",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 119,
              "function": "campus_map"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/map/find",
          "methods": [
            "GET"
          ],
          "file": "campus/facilities.py",
          "line": 125,
          "function": "find_place",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 125,
              "function": "find_place"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/crowd",
          "methods": [
            "GET"
          ],
          "file": "campus/facilities.py",
          "line": 421,
          "function": "crowd",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 100,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 421,
              "function": "crowd"
            },
            {
              "file": "campus/facilities.py",
              "line": 99,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/facilities.py",
              "line": 90,
              "function": "parse_now"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/weather",
          "methods": [
            "GET"
          ],
          "file": "campus/info.py",
          "line": 115,
          "function": "weather",
          "tables": [],
          "files": [
            {
              "file": "campus/info.py",
              "line": 115,
              "function": "weather"
            },
            {
              "file": "campus/info.py",
              "line": 95,
              "function": "load_cwa"
            },
            {
              "file": "campus/info.py",
              "line": 50,
              "function": "_advice"
            },
            {
              "file": "campus/info.py",
              "line": 35,
              "function": "_get_json"
            },
            {
              "file": "campus/info.py",
              "line": 41,
              "function": "_cached"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/js/campus-life.js",
          "line": 460
        },
        {
          "file": "static/js/campus-life.js",
          "line": 508
        },
        {
          "file": "static/js/campus-life.js",
          "line": 587
        },
        {
          "file": "static/js/campus-life.js",
          "line": 628
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 450
        }
      ]
    },
    {
      "id": "links",
      "name": "常用系統連結",
      "group": "校園生活",
      "summary": "讀取或維護常用連結，供使用者開啟外部系統。",
      "routes": [
        {
          "url": "/api/links",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "app.py",
          "line": 3335,
          "function": "manage_quick_links",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 3335,
              "function": "manage_quick_links"
            },
            {
              "file": "app.py",
              "line": 3305,
              "function": "save_quick_links"
            },
            {
              "file": "app.py",
              "line": 3312,
              "function": "parse_link_payload"
            },
            {
              "file": "app.py",
              "line": 3299,
              "function": "load_quick_links"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "write_roles_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/links/<int:link_id>",
          "methods": [
            "PUT",
            "DELETE"
          ],
          "file": "app.py",
          "line": 3352,
          "function": "update_or_delete_quick_link",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 3352,
              "function": "update_or_delete_quick_link"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 3305,
              "function": "save_quick_links"
            },
            {
              "file": "app.py",
              "line": 3312,
              "function": "parse_link_payload"
            },
            {
              "file": "app.py",
              "line": 3299,
              "function": "load_quick_links"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 1961
        },
        {
          "file": "static/admin.html",
          "line": 2028
        },
        {
          "file": "static/admin.html",
          "line": 2048
        },
        {
          "file": "static/index.html",
          "line": 1437
        },
        {
          "file": "static/index.html",
          "line": 1772
        },
        {
          "file": "static/js/home-portal.js",
          "line": 66
        }
      ]
    },
    {
      "id": "notices",
      "name": "班級通知與幹部紀錄",
      "group": "導師班",
      "summary": "檢查發送對象與班級權限，保存通知、群組及幹部紀錄。",
      "routes": [
        {
          "url": "/api/campus/notices",
          "methods": [
            "POST"
          ],
          "file": "campus/messaging.py",
          "line": 364,
          "function": "send_notice",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 191,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 197,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 95,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 103,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 89,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 111,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 119,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 120,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 364,
              "function": "send_notice"
            },
            {
              "file": "campus/messaging.py",
              "line": 268,
              "function": "can_manage"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "campus/messaging.py",
              "line": 184,
              "function": "add_notice"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 77,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 87,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 135,
              "function": "member_ids"
            },
            {
              "file": "campus/messaging.py",
              "line": 130,
              "function": "roster_ids"
            },
            {
              "file": "campus/messaging.py",
              "line": 126,
              "function": "find_class"
            },
            {
              "file": "campus/messaging.py",
              "line": 116,
              "function": "all_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_fmt_time"
            }
          ],
          "storage": [
            "data/campus_store.json → classes",
            "data/campus_store.json → notices"
          ]
        },
        {
          "url": "/api/campus/notices/sent",
          "methods": [
            "GET"
          ],
          "file": "campus/messaging.py",
          "line": 406,
          "function": "sent",
          "tables": [
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 215,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 224,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 218,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 95,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 103,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 89,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 111,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 406,
              "function": "sent"
            },
            {
              "file": "campus/messaging.py",
              "line": 207,
              "function": "load_notices"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_fmt_time"
            },
            {
              "file": "campus/messaging.py",
              "line": 237,
              "function": "_target_fields"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 77,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 87,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 55,
              "function": "student_names"
            }
          ],
          "storage": [
            "data/campus_store.json → notices"
          ]
        },
        {
          "url": "/api/campus/notices/inbox",
          "methods": [
            "GET"
          ],
          "file": "campus/messaging.py",
          "line": 421,
          "function": "inbox",
          "tables": [
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 215,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 224,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 218,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 95,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 103,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 89,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 111,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 421,
              "function": "inbox"
            },
            {
              "file": "campus/messaging.py",
              "line": 207,
              "function": "load_notices"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_fmt_time"
            },
            {
              "file": "campus/messaging.py",
              "line": 237,
              "function": "_target_fields"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 77,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 87,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            }
          ],
          "storage": [
            "data/campus_store.json → notices"
          ]
        },
        {
          "url": "/api/campus/notices/<int:notice_id>/read",
          "methods": [
            "POST"
          ],
          "file": "campus/messaging.py",
          "line": 431,
          "function": "mark_read",
          "tables": [
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 246,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 251,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 95,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 103,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 89,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 111,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 431,
              "function": "mark_read"
            },
            {
              "file": "campus/messaging.py",
              "line": 242,
              "function": "mark_notice_read"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/messaging.py",
              "line": 77,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 87,
              "function": "_import_into_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            }
          ],
          "storage": [
            "data/campus_store.json → notices"
          ]
        },
        {
          "url": "/api/campus/notices/<int:notice_id>/reply",
          "methods": [
            "POST"
          ],
          "file": "campus/messaging.py",
          "line": 681,
          "function": "reply_notice",
          "tables": [
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 694,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 215,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 224,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 218,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 95,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 103,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 89,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 111,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 681,
              "function": "reply_notice"
            },
            {
              "file": "campus/messaging.py",
              "line": 207,
              "function": "load_notices"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_fmt_time"
            },
            {
              "file": "campus/messaging.py",
              "line": 237,
              "function": "_target_fields"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 77,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 87,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            }
          ],
          "storage": [
            "data/campus_store.json → notices"
          ]
        },
        {
          "url": "/api/campus/notices/<int:notice_id>/remind",
          "methods": [
            "POST"
          ],
          "file": "campus/messaging.py",
          "line": 707,
          "function": "remind_notice",
          "tables": [
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 215,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 224,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 218,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 95,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 103,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 89,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 111,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 191,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 197,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 707,
              "function": "remind_notice"
            },
            {
              "file": "campus/messaging.py",
              "line": 207,
              "function": "load_notices"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_fmt_time"
            },
            {
              "file": "campus/messaging.py",
              "line": 237,
              "function": "_target_fields"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 77,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 87,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "campus/messaging.py",
              "line": 184,
              "function": "add_notice"
            }
          ],
          "storage": [
            "data/campus_store.json → notices"
          ]
        },
        {
          "url": "/api/campus/records/cadres",
          "methods": [
            "GET"
          ],
          "file": "campus/records.py",
          "line": 141,
          "function": "class_cadres",
          "tables": [
            {
              "name": "student_records",
              "file": "campus/records.py",
              "line": 69,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 886
                }
              ]
            },
            {
              "name": "student_records",
              "file": "campus/records.py",
              "line": 54,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 886
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/records.py",
              "line": 141,
              "function": "class_cadres"
            },
            {
              "file": "campus/records.py",
              "line": 61,
              "function": "load_records"
            },
            {
              "file": "campus/records.py",
              "line": 57,
              "function": "_json_items"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/records.py",
              "line": 53,
              "function": "use_db"
            },
            {
              "file": "campus/records.py",
              "line": 31,
              "function": "current_semester"
            }
          ],
          "storage": [
            "data/campus_store.json → student_records"
          ]
        },
        {
          "url": "/api/campus/records/cadres",
          "methods": [
            "POST"
          ],
          "file": "campus/records.py",
          "line": 159,
          "function": "set_cadre",
          "tables": [
            {
              "name": "student_records",
              "file": "campus/records.py",
              "line": 69,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 886
                }
              ]
            },
            {
              "name": "student_records",
              "file": "campus/records.py",
              "line": 54,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 886
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "student_records",
              "file": "campus/records.py",
              "line": 102,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 886
                }
              ]
            },
            {
              "name": "student_records",
              "file": "campus/records.py",
              "line": 82,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 886
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/records.py",
              "line": 159,
              "function": "set_cadre"
            },
            {
              "file": "campus/records.py",
              "line": 61,
              "function": "load_records"
            },
            {
              "file": "campus/records.py",
              "line": 57,
              "function": "_json_items"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/records.py",
              "line": 53,
              "function": "use_db"
            },
            {
              "file": "campus/records.py",
              "line": 131,
              "function": "_audit"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "campus/records.py",
              "line": 100,
              "function": "delete_record"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/records.py",
              "line": 77,
              "function": "add_cadre"
            },
            {
              "file": "campus/records.py",
              "line": 31,
              "function": "current_semester"
            }
          ],
          "storage": [
            "data/campus_store.json → student_records"
          ]
        },
        {
          "url": "/api/campus/records/<int:record_id>",
          "methods": [
            "DELETE"
          ],
          "file": "campus/records.py",
          "line": 191,
          "function": "remove_cadre",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "student_records",
              "file": "campus/records.py",
              "line": 102,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 886
                }
              ]
            },
            {
              "name": "student_records",
              "file": "campus/records.py",
              "line": 54,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 886
                }
              ]
            },
            {
              "name": "student_records",
              "file": "campus/records.py",
              "line": 95,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 886
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/records.py",
              "line": 191,
              "function": "remove_cadre"
            },
            {
              "file": "campus/records.py",
              "line": 131,
              "function": "_audit"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "campus/records.py",
              "line": 100,
              "function": "delete_record"
            },
            {
              "file": "campus/records.py",
              "line": 57,
              "function": "_json_items"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/records.py",
              "line": 53,
              "function": "use_db"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/records.py",
              "line": 93,
              "function": "find_record"
            }
          ],
          "storage": [
            "data/campus_store.json → student_records"
          ]
        },
        {
          "url": "/api/campus/records/mine",
          "methods": [
            "GET"
          ],
          "file": "campus/records.py",
          "line": 204,
          "function": "my_records",
          "tables": [
            {
              "name": "student_records",
              "file": "campus/records.py",
              "line": 69,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 886
                }
              ]
            },
            {
              "name": "student_records",
              "file": "campus/records.py",
              "line": 54,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 886
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/records.py",
              "line": 204,
              "function": "my_records"
            },
            {
              "file": "campus/records.py",
              "line": 126,
              "function": "profile"
            },
            {
              "file": "campus/records.py",
              "line": 110,
              "function": "summarize"
            },
            {
              "file": "campus/records.py",
              "line": 61,
              "function": "load_records"
            },
            {
              "file": "campus/records.py",
              "line": 57,
              "function": "_json_items"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/records.py",
              "line": 53,
              "function": "use_db"
            }
          ],
          "storage": [
            "data/campus_store.json → student_records"
          ]
        }
      ],
      "frontend": [
        {
          "file": "static/js/campus-features.js",
          "line": 680
        },
        {
          "file": "static/js/campus-features.js",
          "line": 684
        },
        {
          "file": "static/js/campus-features.js",
          "line": 857
        },
        {
          "file": "static/js/campus-features.js",
          "line": 963
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1201
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1207
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1243
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1245
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1252
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1422
        },
        {
          "file": "static/js/campus-life.js",
          "line": 674
        },
        {
          "file": "static/js/campus-life.js",
          "line": 703
        },
        {
          "file": "static/js/campus-life.js",
          "line": 740
        },
        {
          "file": "static/js/campus-life.js",
          "line": 800
        },
        {
          "file": "static/js/campus-life.js",
          "line": 923
        },
        {
          "file": "static/js/campus-life.js",
          "line": 971
        },
        {
          "file": "static/js/campus-life.js",
          "line": 979
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 502
        }
      ]
    },
    {
      "id": "privacy",
      "name": "個人偏好、授權與聯絡資料",
      "group": "系統",
      "summary": "依帳號讀取或更新科系偏好、資料授權及緊急聯絡資料。",
      "routes": [
        {
          "url": "/api/student/privacy-consent",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "app.py",
          "line": 2887,
          "function": "manage_privacy_consent",
          "tables": [
            {
              "name": "student_privacy_settings",
              "file": "app.py",
              "line": 2908,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 285
                }
              ]
            },
            {
              "name": "student_privacy_settings",
              "file": "app.py",
              "line": 2877,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 285
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 2887,
              "function": "manage_privacy_consent"
            },
            {
              "file": "app.py",
              "line": 2874,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 2014,
              "function": "current_student_id"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/student/emergency-contact",
          "methods": [
            "GET",
            "PUT"
          ],
          "file": "app.py",
          "line": 2925,
          "function": "manage_emergency_contact",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 2946,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2939,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 2925,
              "function": "manage_emergency_contact"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 2014,
              "function": "current_student_id"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/departments",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 3435,
          "function": "list_departments_with_intro",
          "tables": [
            {
              "name": "departments",
              "file": "app.py",
              "line": 3437,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 53
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 3435,
              "function": "list_departments_with_intro"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/me/preferences",
          "methods": [
            "GET",
            "PUT"
          ],
          "file": "preferences/__init__.py",
          "line": 93,
          "function": "preferences",
          "tables": [
            {
              "name": "user_preferences",
              "file": "preferences/__init__.py",
              "line": 112,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 582
                }
              ]
            },
            {
              "name": "students",
              "file": "preferences/__init__.py",
              "line": 45,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "user_preferences",
              "file": "preferences/__init__.py",
              "line": 60,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 582
                }
              ]
            },
            {
              "name": "departments",
              "file": "preferences/__init__.py",
              "line": 32,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 53
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            }
          ],
          "files": [
            {
              "file": "preferences/__init__.py",
              "line": 93,
              "function": "preferences"
            },
            {
              "file": "preferences/__init__.py",
              "line": 36,
              "function": "_has_account"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "preferences/__init__.py",
              "line": 70,
              "function": "current_preference"
            },
            {
              "file": "preferences/__init__.py",
              "line": 41,
              "function": "official_dept_id"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "preferences/__init__.py",
              "line": 56,
              "function": "_saved_preference"
            },
            {
              "file": "preferences/__init__.py",
              "line": 31,
              "function": "list_departments"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/index.html",
          "line": 3745
        },
        {
          "file": "static/index.html",
          "line": 3754
        },
        {
          "file": "static/index.html",
          "line": 3769
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 739
        },
        {
          "file": "static/js/dept-scope.js",
          "line": 27
        },
        {
          "file": "static/js/dept-scope.js",
          "line": 75
        }
      ]
    },
    {
      "id": "anniversary",
      "name": "校慶活動與祝福",
      "group": "校園生活",
      "summary": "查詢活動與祝福內容，由管理端維護與審核。",
      "routes": [
        {
          "url": "/api/anniversary/marquee",
          "methods": [
            "GET"
          ],
          "file": "anniversary/__init__.py",
          "line": 125,
          "function": "get_marquee",
          "tables": [
            {
              "name": "anniversary_events",
              "file": "anniversary/__init__.py",
              "line": 72,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 701
                }
              ]
            },
            {
              "name": "anniversary_wishes",
              "file": "anniversary/__init__.py",
              "line": 81,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 717
                }
              ]
            }
          ],
          "files": [
            {
              "file": "anniversary/__init__.py",
              "line": 125,
              "function": "get_marquee"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 71,
              "function": "load_events"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 64,
              "function": "_serialize"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 78,
              "function": "load_wishes"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/anniversary/wishes",
          "methods": [
            "POST"
          ],
          "file": "anniversary/__init__.py",
          "line": 155,
          "function": "post_wish",
          "tables": [
            {
              "name": "anniversary_events",
              "file": "anniversary/__init__.py",
              "line": 72,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 701
                }
              ]
            },
            {
              "name": "anniversary_wishes",
              "file": "anniversary/__init__.py",
              "line": 94,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 717
                }
              ]
            }
          ],
          "files": [
            {
              "file": "anniversary/__init__.py",
              "line": 155,
              "function": "post_wish"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 52,
              "function": "_error"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 71,
              "function": "load_events"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 64,
              "function": "_serialize"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 92,
              "function": "add_wish"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 110,
              "function": "_too_many_posts"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/anniversary",
          "methods": [
            "GET"
          ],
          "file": "anniversary/__init__.py",
          "line": 181,
          "function": "admin_overview",
          "tables": [
            {
              "name": "anniversary_wishes",
              "file": "anniversary/__init__.py",
              "line": 81,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 717
                }
              ]
            },
            {
              "name": "anniversary_events",
              "file": "anniversary/__init__.py",
              "line": 72,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 701
                }
              ]
            }
          ],
          "files": [
            {
              "file": "anniversary/__init__.py",
              "line": 181,
              "function": "admin_overview"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 52,
              "function": "_error"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 78,
              "function": "load_wishes"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 64,
              "function": "_serialize"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 71,
              "function": "load_events"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 56,
              "function": "_require_admin"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/anniversary/events",
          "methods": [
            "POST"
          ],
          "file": "anniversary/__init__.py",
          "line": 234,
          "function": "create_event",
          "tables": [
            {
              "name": "anniversary_events",
              "file": "anniversary/__init__.py",
              "line": 242,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 701
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "anniversary/__init__.py",
              "line": 234,
              "function": "create_event"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 52,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 205,
              "function": "_parse_event"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 56,
              "function": "_require_admin"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/anniversary/events/<int:event_id>",
          "methods": [
            "PUT",
            "DELETE"
          ],
          "file": "anniversary/__init__.py",
          "line": 254,
          "function": "update_event",
          "tables": [
            {
              "name": "anniversary_events",
              "file": "anniversary/__init__.py",
              "line": 273,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 701
                }
              ]
            },
            {
              "name": "anniversary_events",
              "file": "anniversary/__init__.py",
              "line": 263,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 701
                }
              ]
            },
            {
              "name": "anniversary_events",
              "file": "anniversary/__init__.py",
              "line": 72,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 701
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "anniversary/__init__.py",
              "line": 254,
              "function": "update_event"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 71,
              "function": "load_events"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 64,
              "function": "_serialize"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 52,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 205,
              "function": "_parse_event"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 56,
              "function": "_require_admin"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/anniversary/wishes/<int:wish_id>",
          "methods": [
            "PUT",
            "DELETE"
          ],
          "file": "anniversary/__init__.py",
          "line": 283,
          "function": "moderate_wish",
          "tables": [
            {
              "name": "anniversary_wishes",
              "file": "anniversary/__init__.py",
              "line": 300,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 717
                }
              ]
            },
            {
              "name": "anniversary_wishes",
              "file": "anniversary/__init__.py",
              "line": 292,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 717
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "anniversary_wishes",
              "file": "anniversary/__init__.py",
              "line": 104,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 717
                }
              ]
            }
          ],
          "files": [
            {
              "file": "anniversary/__init__.py",
              "line": 283,
              "function": "moderate_wish"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 52,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 103,
              "function": "find_wish"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 64,
              "function": "_serialize"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 56,
              "function": "_require_admin"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 1480
        },
        {
          "file": "static/admin.html",
          "line": 1537
        },
        {
          "file": "static/admin.html",
          "line": 1549
        },
        {
          "file": "static/admin.html",
          "line": 1583
        },
        {
          "file": "static/js/anniversary.js",
          "line": 1
        },
        {
          "file": "static/js/anniversary.js",
          "line": 70
        },
        {
          "file": "static/js/anniversary.js",
          "line": 180
        }
      ]
    },
    {
      "id": "visits",
      "name": "訪客預約與參訪",
      "group": "校園生活",
      "summary": "查詢可預約時段，建立或取消參訪紀錄。",
      "routes": [
        {
          "url": "/api/campus/visits/slots",
          "methods": [
            "GET"
          ],
          "file": "campus/visits.py",
          "line": 26,
          "function": "slots",
          "tables": [],
          "files": [
            {
              "file": "campus/visits.py",
              "line": 26,
              "function": "slots"
            },
            {
              "file": "campus/visits.py",
              "line": 21,
              "function": "bookings"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/visits",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "campus/visits.py",
          "line": 41,
          "function": "visits_route",
          "tables": [],
          "files": [
            {
              "file": "campus/visits.py",
              "line": 41,
              "function": "visits_route"
            },
            {
              "file": "campus/visits.py",
              "line": 21,
              "function": "bookings"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/visits/<int:visit_id>",
          "methods": [
            "POST"
          ],
          "file": "campus/visits.py",
          "line": 91,
          "function": "update_visit",
          "tables": [],
          "files": [
            {
              "file": "campus/visits.py",
              "line": 91,
              "function": "update_visit"
            },
            {
              "file": "campus/visits.py",
              "line": 21,
              "function": "bookings"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 995
        },
        {
          "file": "static/admin.html",
          "line": 1012
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 786
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 802
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 810
        }
      ]
    },
    {
      "id": "affairs",
      "name": "校務送件與獎學金資料",
      "group": "校務",
      "summary": "查詢申辦資料、檢查送件內容並保存申請。",
      "routes": [
        {
          "url": "/api/campus/affairs/mine",
          "methods": [
            "GET"
          ],
          "file": "campus/services.py",
          "line": 359,
          "function": "affairs_mine",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 359,
              "function": "affairs_mine"
            },
            {
              "file": "campus/services.py",
              "line": 348,
              "function": "project_status"
            },
            {
              "file": "campus/services.py",
              "line": 312,
              "function": "affairs_submissions"
            }
          ],
          "storage": [
            "data/campus_store.json → affairs_submissions"
          ]
        },
        {
          "url": "/api/campus/affairs/check",
          "methods": [
            "POST"
          ],
          "file": "campus/services.py",
          "line": 368,
          "function": "affairs_check",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 368,
              "function": "affairs_check"
            },
            {
              "file": "campus/services.py",
              "line": 316,
              "function": "check_form"
            },
            {
              "file": "campus/services.py",
              "line": 312,
              "function": "affairs_submissions"
            }
          ],
          "storage": [
            "data/campus_store.json → affairs_submissions"
          ]
        },
        {
          "url": "/api/campus/affairs/submit",
          "methods": [
            "POST"
          ],
          "file": "campus/services.py",
          "line": 381,
          "function": "affairs_submit",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 381,
              "function": "affairs_submit"
            },
            {
              "file": "app.py",
              "line": 119,
              "function": "save_uploaded_file"
            },
            {
              "file": "app.py",
              "line": 116,
              "function": "allowed_file"
            },
            {
              "file": "campus/services.py",
              "line": 312,
              "function": "affairs_submissions"
            },
            {
              "file": "campus/services.py",
              "line": 316,
              "function": "check_form"
            }
          ],
          "storage": [
            "data/campus_store.json → affairs_submissions"
          ]
        },
        {
          "url": "/api/campus/scholarships",
          "methods": [
            "GET"
          ],
          "file": "campus/services.py",
          "line": 467,
          "function": "scholarships",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2006,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 153
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/services.py",
              "line": 467,
              "function": "scholarships"
            },
            {
              "file": "campus/services.py",
              "line": 447,
              "function": "auto_answers"
            },
            {
              "file": "app.py",
              "line": 2003,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/js/campus-life.js",
          "line": 52
        },
        {
          "file": "static/js/campus-life.js",
          "line": 244
        },
        {
          "file": "static/js/campus-life.js",
          "line": 291
        },
        {
          "file": "static/js/campus-life.js",
          "line": 302
        }
      ]
    },
    {
      "id": "messages",
      "name": "校園公告、班級與師生聯繫",
      "group": "導師班",
      "summary": "依身分與班級權限讀取公告、管理班級或傳遞訊息。",
      "routes": [
        {
          "url": "/api/campus/announcements",
          "methods": [
            "GET"
          ],
          "file": "campus/calendar_ext.py",
          "line": 457,
          "function": "list_announcements",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 245,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 219,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 234,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 214,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "assignments",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 497
                }
              ]
            },
            {
              "name": "assignment_submissions",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 512
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 168,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 169,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 211,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 243,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 256,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 268,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 282,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 291,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 297,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/calendar_ext.py",
              "line": 457,
              "function": "list_announcements"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 240,
              "function": "list_my_events"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 218,
              "function": "_events_db"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 232,
              "function": "_insert_event"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 4272,
              "function": "get_dashboard_source"
            },
            {
              "file": "dashboard/sources.py",
              "line": 156,
              "function": "MySQLDashboardSource"
            },
            {
              "file": "dashboard/sources.py",
              "line": 62,
              "function": "_fmt"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 441,
              "function": "guess_announcement_date"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 199,
              "function": "_to_date"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/classes",
          "methods": [
            "GET"
          ],
          "file": "campus/messaging.py",
          "line": 287,
          "function": "list_classes",
          "tables": [
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 119,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 120,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 95,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 103,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 89,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 111,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 287,
              "function": "list_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 135,
              "function": "member_ids"
            },
            {
              "file": "campus/messaging.py",
              "line": 130,
              "function": "roster_ids"
            },
            {
              "file": "campus/messaging.py",
              "line": 268,
              "function": "can_manage"
            },
            {
              "file": "campus/messaging.py",
              "line": 116,
              "function": "all_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_fmt_time"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 77,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 87,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 55,
              "function": "student_names"
            }
          ],
          "storage": [
            "data/campus_store.json → classes"
          ]
        },
        {
          "url": "/api/campus/classes",
          "methods": [
            "POST"
          ],
          "file": "campus/messaging.py",
          "line": 303,
          "function": "create_class",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 143,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 119,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 120,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 95,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 103,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 89,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 111,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 303,
              "function": "create_class"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "campus/messaging.py",
              "line": 140,
              "function": "add_class"
            },
            {
              "file": "campus/messaging.py",
              "line": 116,
              "function": "all_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_fmt_time"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/messaging.py",
              "line": 77,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 87,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 126,
              "function": "find_class"
            }
          ],
          "storage": [
            "data/campus_store.json → classes"
          ]
        },
        {
          "url": "/api/campus/classes/password",
          "methods": [
            "POST"
          ],
          "file": "campus/messaging.py",
          "line": 319,
          "function": "reset_password",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 155,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 119,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 120,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 95,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 103,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 89,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 111,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 319,
              "function": "reset_password"
            },
            {
              "file": "campus/messaging.py",
              "line": 268,
              "function": "can_manage"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "campus/messaging.py",
              "line": 153,
              "function": "set_class_password"
            },
            {
              "file": "campus/messaging.py",
              "line": 126,
              "function": "find_class"
            },
            {
              "file": "campus/messaging.py",
              "line": 116,
              "function": "all_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_fmt_time"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/messaging.py",
              "line": 77,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 87,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            }
          ],
          "storage": [
            "data/campus_store.json → classes"
          ]
        },
        {
          "url": "/api/campus/classes/join",
          "methods": [
            "POST"
          ],
          "file": "campus/messaging.py",
          "line": 340,
          "function": "join_class",
          "tables": [
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 164,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 119,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 120,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 95,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 103,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 89,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 111,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 340,
              "function": "join_class"
            },
            {
              "file": "campus/messaging.py",
              "line": 162,
              "function": "add_member"
            },
            {
              "file": "campus/messaging.py",
              "line": 126,
              "function": "find_class"
            },
            {
              "file": "campus/messaging.py",
              "line": 116,
              "function": "all_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_fmt_time"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 77,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 87,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 42,
              "function": "_join_class_too_many"
            }
          ],
          "storage": [
            "data/campus_store.json → classes"
          ]
        },
        {
          "url": "/api/campus/classes/leave",
          "methods": [
            "POST"
          ],
          "file": "campus/messaging.py",
          "line": 356,
          "function": "leave_class",
          "tables": [
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 175,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 119,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 120,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 95,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 103,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 89,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 111,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 356,
              "function": "leave_class"
            },
            {
              "file": "campus/messaging.py",
              "line": 173,
              "function": "remove_member"
            },
            {
              "file": "campus/messaging.py",
              "line": 126,
              "function": "find_class"
            },
            {
              "file": "campus/messaging.py",
              "line": 116,
              "function": "all_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_fmt_time"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 77,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 87,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            }
          ],
          "storage": [
            "data/campus_store.json → classes"
          ]
        },
        {
          "url": "/api/campus/broadcast/targets",
          "methods": [
            "GET"
          ],
          "file": "campus/messaging.py",
          "line": 523,
          "function": "broadcast_targets",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/messaging.py",
              "line": 452,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 119,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 120,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 95,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 103,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 89,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 111,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "departments",
              "file": "campus/messaging.py",
              "line": 494,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 53
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 523,
              "function": "broadcast_targets"
            },
            {
              "file": "campus/messaging.py",
              "line": 474,
              "function": "visible_courses"
            },
            {
              "file": "campus/messaging.py",
              "line": 456,
              "function": "course_table"
            },
            {
              "file": "campus/messaging.py",
              "line": 451,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 446,
              "function": "_plain_name"
            },
            {
              "file": "campus/messaging.py",
              "line": 484,
              "function": "course_recipients"
            },
            {
              "file": "campus/messaging.py",
              "line": 130,
              "function": "roster_ids"
            },
            {
              "file": "campus/messaging.py",
              "line": 135,
              "function": "member_ids"
            },
            {
              "file": "campus/messaging.py",
              "line": 126,
              "function": "find_class"
            },
            {
              "file": "campus/messaging.py",
              "line": 116,
              "function": "all_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_fmt_time"
            },
            {
              "file": "campus/messaging.py",
              "line": 77,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 87,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 493,
              "function": "department_names"
            }
          ],
          "storage": [
            "data/campus_store.json → classes"
          ]
        },
        {
          "url": "/api/campus/broadcast",
          "methods": [
            "POST"
          ],
          "file": "campus/messaging.py",
          "line": 545,
          "function": "send_broadcast",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 191,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 197,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 95,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 103,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 89,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 111,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "departments",
              "file": "campus/messaging.py",
              "line": 494,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 53
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "campus/messaging.py",
              "line": 452,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 119,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 120,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 545,
              "function": "send_broadcast"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "campus/messaging.py",
              "line": 184,
              "function": "add_notice"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 77,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 87,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 499,
              "function": "resolve_target"
            },
            {
              "file": "campus/messaging.py",
              "line": 493,
              "function": "department_names"
            },
            {
              "file": "campus/messaging.py",
              "line": 474,
              "function": "visible_courses"
            },
            {
              "file": "campus/messaging.py",
              "line": 456,
              "function": "course_table"
            },
            {
              "file": "campus/messaging.py",
              "line": 451,
              "function": "load_schedule"
            },
            {
              "file": "campus/messaging.py",
              "line": 446,
              "function": "_plain_name"
            },
            {
              "file": "campus/messaging.py",
              "line": 484,
              "function": "course_recipients"
            },
            {
              "file": "campus/messaging.py",
              "line": 130,
              "function": "roster_ids"
            },
            {
              "file": "campus/messaging.py",
              "line": 135,
              "function": "member_ids"
            },
            {
              "file": "campus/messaging.py",
              "line": 126,
              "function": "find_class"
            },
            {
              "file": "campus/messaging.py",
              "line": 116,
              "function": "all_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_fmt_time"
            }
          ],
          "storage": [
            "data/campus_store.json → classes",
            "data/campus_store.json → notices"
          ]
        },
        {
          "url": "/api/campus/advisor-messages",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "campus/messaging.py",
          "line": 625,
          "function": "advisor_messages_route",
          "tables": [
            {
              "name": "advisor_messages",
              "file": "campus/messaging.py",
              "line": 579,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 816
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 95,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 103,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 89,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 111,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "advisor_messages",
              "file": "campus/messaging.py",
              "line": 591,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 816
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 625,
              "function": "advisor_messages_route"
            },
            {
              "file": "campus/messaging.py",
              "line": 577,
              "function": "advisor_messages"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_fmt_time"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 77,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 87,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 585,
              "function": "add_advisor_message"
            }
          ],
          "storage": [
            "data/campus_store.json → advisor_messages"
          ]
        },
        {
          "url": "/api/campus/advisor-messages/<int:msg_id>/reply",
          "methods": [
            "POST"
          ],
          "file": "campus/messaging.py",
          "line": 660,
          "function": "reply_advisor_message",
          "tables": [
            {
              "name": "advisor_messages",
              "file": "campus/messaging.py",
              "line": 579,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 816
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 95,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 764
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 103,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 785
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 89,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 774
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 111,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 805
                }
              ]
            },
            {
              "name": "advisor_messages",
              "file": "campus/messaging.py",
              "line": 609,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 816
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 660,
              "function": "reply_advisor_message"
            },
            {
              "file": "campus/messaging.py",
              "line": 577,
              "function": "advisor_messages"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_fmt_time"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 77,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 87,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 604,
              "function": "reply_to_advisor_message"
            }
          ],
          "storage": [
            "data/campus_store.json → advisor_messages"
          ]
        }
      ],
      "frontend": [
        {
          "file": "static/js/campus-life.js",
          "line": 674
        },
        {
          "file": "static/js/campus-life.js",
          "line": 703
        },
        {
          "file": "static/js/campus-life.js",
          "line": 729
        },
        {
          "file": "static/js/campus-life.js",
          "line": 745
        },
        {
          "file": "static/js/campus-life.js",
          "line": 751
        },
        {
          "file": "static/js/campus-life.js",
          "line": 800
        },
        {
          "file": "static/js/campus-life.js",
          "line": 911
        },
        {
          "file": "static/js/campus-life.js",
          "line": 932
        },
        {
          "file": "static/js/campus-life.js",
          "line": 938
        },
        {
          "file": "static/js/campus-life.js",
          "line": 943
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 347
        },
        {
          "file": "static/js/home-portal.js",
          "line": 66
        }
      ]
    },
    {
      "id": "transport",
      "name": "交通資訊與校園偏好",
      "group": "校園生活",
      "summary": "提供交通資訊，讀取或儲存校園生活偏好。",
      "routes": [
        {
          "url": "/api/campus/transport",
          "methods": [
            "GET"
          ],
          "file": "campus/info.py",
          "line": 168,
          "function": "transport",
          "tables": [],
          "files": [
            {
              "file": "campus/info.py",
              "line": 168,
              "function": "transport"
            },
            {
              "file": "campus/info.py",
              "line": 41,
              "function": "_cached"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/prefs",
          "methods": [
            "GET",
            "PUT"
          ],
          "file": "campus/services.py",
          "line": 45,
          "function": "prefs",
          "tables": [
            {
              "name": "user_preferences",
              "file": "campus/services.py",
              "line": 51,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 582
                }
              ]
            },
            {
              "name": "user_preferences",
              "file": "campus/services.py",
              "line": 54,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 582
                }
              ]
            },
            {
              "name": "user_preferences",
              "file": "campus/services.py",
              "line": 23,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 582
                }
              ]
            },
            {
              "name": "user_preferences",
              "file": "campus/services.py",
              "line": 35,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 582
                }
              ]
            },
            {
              "name": "users",
              "file": "campus/services.py",
              "line": 33,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 95
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/services.py",
              "line": 45,
              "function": "prefs"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "campus/services.py",
              "line": 21,
              "function": "_prefs_db"
            }
          ],
          "storage": [
            "data/campus_store.json → prefs"
          ]
        }
      ],
      "frontend": [
        {
          "file": "static/js/campus-life.js",
          "line": 612
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 285
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 300
        },
        {
          "file": "static/js/student-lobby.js",
          "line": 58
        },
        {
          "file": "static/js/tour.js",
          "line": 2
        },
        {
          "file": "static/js/tour.js",
          "line": 161
        },
        {
          "file": "static/js/tour.js",
          "line": 177
        }
      ]
    },
    {
      "id": "admin-cases",
      "name": "行政案件工作台、補件與處室分工",
      "group": "校務",
      "summary": "學生送出申請後依類別分流；承辦處室可分派、要求補件、重新受理與結案，案件及附件依身分隔離。",
      "routes": [
        {
          "url": "/api/campus/admin-cases/config",
          "methods": [
            "GET",
            "PUT"
          ],
          "file": "campus/admin_cases.py",
          "line": 231,
          "function": "config",
          "tables": [
            {
              "name": "users",
              "file": "campus/admin_cases.py",
              "line": 44,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 95
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            },
            {
              "name": "users",
              "file": "campus/admin_cases.py",
              "line": 55,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 95
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            },
            {
              "name": "users",
              "file": "campus/admin_cases.py",
              "line": 33,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 95
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/admin_cases.py",
              "line": 231,
              "function": "config"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 39,
              "function": "assignments"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 58,
              "function": "cases"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 52,
              "function": "assistant_departments"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 62,
              "function": "offices"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 192,
              "function": "validate_workflow"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 32,
              "function": "accounts"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 66,
              "function": "workflows"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            }
          ],
          "storage": [
            "data/campus_store.json → admin_assistant_departments",
            "data/campus_store.json → admin_office_catalog",
            "data/campus_store.json → admin_offices",
            "data/campus_store.json → admin_workflows"
          ]
        },
        {
          "url": "/api/campus/admin-cases",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "campus/admin_cases.py",
          "line": 291,
          "function": "collection",
          "tables": [
            {
              "name": "users",
              "file": "campus/admin_cases.py",
              "line": 44,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 95
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/admin_cases.py",
              "line": 291,
              "function": "collection"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 24,
              "function": "today"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 66,
              "function": "workflows"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 93,
              "function": "visible"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 77,
              "function": "can_manage"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 39,
              "function": "assignments"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 71,
              "function": "owns"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 58,
              "function": "cases"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 98,
              "function": "payload"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 28,
              "function": "stamp"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 185,
              "function": "text"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 140,
              "function": "history"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 171,
              "function": "save_files"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 149,
              "function": "upload_root"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 153,
              "function": "read_uploads"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 178,
              "function": "form_data"
            }
          ],
          "storage": [
            "data/campus_store.json → admin_offices",
            "data/campus_store.json → admin_workflows"
          ]
        },
        {
          "url": "/api/campus/admin-cases/<int:case_id>",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "campus/admin_cases.py",
          "line": 353,
          "function": "case_detail",
          "tables": [
            {
              "name": "users",
              "file": "campus/admin_cases.py",
              "line": 44,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 95
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            },
            {
              "name": "users",
              "file": "campus/admin_cases.py",
              "line": 33,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 95
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/admin_cases.py",
              "line": 353,
              "function": "case_detail"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 24,
              "function": "today"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 39,
              "function": "assignments"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 32,
              "function": "accounts"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 62,
              "function": "offices"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 185,
              "function": "text"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 28,
              "function": "stamp"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 98,
              "function": "payload"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 71,
              "function": "owns"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 77,
              "function": "can_manage"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 58,
              "function": "cases"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 171,
              "function": "save_files"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 149,
              "function": "upload_root"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 153,
              "function": "read_uploads"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 93,
              "function": "visible"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 140,
              "function": "history"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 178,
              "function": "form_data"
            }
          ],
          "storage": [
            "data/campus_store.json → admin_office_catalog",
            "data/campus_store.json → admin_offices"
          ]
        },
        {
          "url": "/api/campus/admin-cases/<int:case_id>/files/<file_id>",
          "methods": [
            "GET"
          ],
          "file": "campus/admin_cases.py",
          "line": 457,
          "function": "download",
          "tables": [
            {
              "name": "users",
              "file": "campus/admin_cases.py",
              "line": 44,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 95
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/admin_cases.py",
              "line": 457,
              "function": "download"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 93,
              "function": "visible"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 77,
              "function": "can_manage"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 39,
              "function": "assignments"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 71,
              "function": "owns"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 58,
              "function": "cases"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 149,
              "function": "upload_root"
            }
          ],
          "storage": [
            "data/campus_store.json → admin_offices"
          ]
        },
        {
          "url": "/api/campus/admin-cases/<int:case_id>/certificate.pdf",
          "methods": [
            "GET"
          ],
          "file": "campus/demo_signoff.py",
          "line": 181,
          "function": "demo_certificate_pdf",
          "tables": [],
          "files": [
            {
              "file": "campus/demo_signoff.py",
              "line": 181,
              "function": "demo_certificate_pdf"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 91,
              "function": "integrity"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 22,
              "function": "digest"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 39,
              "function": "review_digest"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 28,
              "function": "evidence"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 60,
              "function": "valid_signoffs"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/admin-cases/<int:case_id>/certificate-qr.svg",
          "methods": [
            "GET"
          ],
          "file": "campus/demo_signoff.py",
          "line": 195,
          "function": "demo_certificate_qr",
          "tables": [],
          "files": [
            {
              "file": "campus/demo_signoff.py",
              "line": 195,
              "function": "demo_certificate_qr"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 91,
              "function": "integrity"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 22,
              "function": "digest"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 39,
              "function": "review_digest"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 28,
              "function": "evidence"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 60,
              "function": "valid_signoffs"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/admin-cases/<int:case_id>/certificate/reissue",
          "methods": [
            "POST"
          ],
          "file": "campus/demo_signoff.py",
          "line": 206,
          "function": "demo_certificate_reissue",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/demo_signoff.py",
              "line": 206,
              "function": "demo_certificate_reissue"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 28,
              "function": "evidence"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 91,
              "function": "integrity"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 22,
              "function": "digest"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 39,
              "function": "review_digest"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 60,
              "function": "valid_signoffs"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 25,
              "function": "supported"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 69,
              "function": "issue"
            },
            {
              "file": "public_portal.py",
              "line": 14,
              "function": "public_site_url"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 123,
              "function": "make_pdf"
            },
            {
              "file": "campus/demo_signoff.py",
              "line": 42,
              "function": "approve"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/js/admin-workbench.js",
          "line": 38
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 52
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 56
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 114
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 122
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 221
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 257
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 266
        },
        {
          "file": "static/js/assistant-home.js",
          "line": 49
        },
        {
          "file": "static/js/assistant-home.js",
          "line": 61
        },
        {
          "file": "static/js/assistant-home.js",
          "line": 92
        },
        {
          "file": "static/js/assistant-home.js",
          "line": 93
        },
        {
          "file": "static/js/assistant-home.js",
          "line": 119
        },
        {
          "file": "static/js/office-resources.js",
          "line": 37
        },
        {
          "file": "static/js/student-cases.js",
          "line": 46
        },
        {
          "file": "static/js/student-cases.js",
          "line": 55
        },
        {
          "file": "static/js/student-cases.js",
          "line": 58
        },
        {
          "file": "static/js/student-cases.js",
          "line": 64
        },
        {
          "file": "static/js/student-cases.js",
          "line": 74
        },
        {
          "file": "static/js/student-cases.js",
          "line": 88
        }
      ]
    },
    {
      "id": "public-site",
      "name": "公開網址、QR Code 與 LINE 分享",
      "group": "系統",
      "summary": "使用固定公開首頁網址產生 QR Code 與 LINE 分享入口，不包含個人資料。",
      "routes": [
        {
          "url": "/api/public-site",
          "methods": [
            "GET"
          ],
          "file": "public_portal.py",
          "line": 41,
          "function": "public_site",
          "tables": [],
          "files": [
            {
              "file": "public_portal.py",
              "line": 41,
              "function": "public_site"
            },
            {
              "file": "public_portal.py",
              "line": 14,
              "function": "public_site_url"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/public-site/qr.svg",
          "methods": [
            "GET"
          ],
          "file": "public_portal.py",
          "line": 52,
          "function": "public_site_qr",
          "tables": [],
          "files": [
            {
              "file": "public_portal.py",
              "line": 52,
              "function": "public_site_qr"
            },
            {
              "file": "public_portal.py",
              "line": 14,
              "function": "public_site_url"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/js/campus-access.js",
          "line": 27
        },
        {
          "file": "static/js/campus-access.js",
          "line": 46
        }
      ]
    },
    {
      "id": "admin",
      "name": "管理、稽核與系統狀態",
      "group": "系統",
      "summary": "依端點檢查權限，處理管理查詢、系統檢查或外部平台連結。",
      "routes": [
        {
          "url": "/api/admin/missed-queries",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 1765,
          "function": "get_missed_queries",
          "tables": [
            {
              "name": "search_logs",
              "file": "app.py",
              "line": 1767,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 407
                }
              ]
            },
            {
              "name": "search_feedback",
              "file": "app.py",
              "line": 1768,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 270
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 1765,
              "function": "get_missed_queries"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/search-stats",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 1797,
          "function": "get_search_stats",
          "tables": [
            {
              "name": "search_logs",
              "file": "app.py",
              "line": 1802,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 407
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 1797,
              "function": "get_search_stats"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/unmatched-queries",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 1822,
          "function": "get_unmatched_queries",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "app.py",
              "line": 1601,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 255
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 1822,
              "function": "get_unmatched_queries"
            },
            {
              "file": "app.py",
              "line": 1600,
              "function": "load_unmatched_queries"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/unmatched-queries/convert-synonym",
          "methods": [
            "POST"
          ],
          "file": "app.py",
          "line": 1828,
          "function": "convert_unmatched_to_synonym",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "app.py",
              "line": 1847,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 255
                }
              ]
            },
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 3139,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 291
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 1828,
              "function": "convert_unmatched_to_synonym"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3135,
              "function": "add_synonym"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/audit-logs",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 1862,
          "function": "get_audit_logs",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 1874,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 1862,
              "function": "get_audit_logs"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/self-check",
          "methods": [
            "POST"
          ],
          "file": "app.py",
          "line": 1891,
          "function": "run_self_check",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 1891,
              "function": "run_self_check"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/visitor-logs",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 1921,
          "function": "get_visitor_logs",
          "tables": [
            {
              "name": "visitor_logs",
              "file": "app.py",
              "line": 1901,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 364
                },
                {
                  "file": "init_db.py",
                  "line": 317
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 1921,
              "function": "get_visitor_logs"
            },
            {
              "file": "app.py",
              "line": 1908,
              "function": "mask_phone"
            },
            {
              "file": "app.py",
              "line": 1898,
              "function": "load_visitor_logs"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1913,
              "function": "_visitor_days"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/visitor-logs/export.csv",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 1945,
          "function": "export_visitor_logs",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "visitor_logs",
              "file": "app.py",
              "line": 1901,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 364
                },
                {
                  "file": "init_db.py",
                  "line": 317
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 1945,
              "function": "export_visitor_logs"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1898,
              "function": "load_visitor_logs"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 1913,
              "function": "_visitor_days"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/search-feedback/stats",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 1960,
          "function": "get_search_feedback_stats",
          "tables": [
            {
              "name": "search_feedback",
              "file": "app.py",
              "line": 1962,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 270
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 1960,
              "function": "get_search_feedback_stats"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/faq",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 3465,
          "function": "list_visitor_faq",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 3465,
              "function": "list_visitor_faq"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/health",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 4112,
          "function": "health_check",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 4112,
              "function": "health_check"
            },
            {
              "file": "app.py",
              "line": 175,
              "function": "is_db_available"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/stats",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 4132,
          "function": "get_stats",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "app.py",
              "line": 1601,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 255
                }
              ]
            },
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2756,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 318
                },
                {
                  "file": "init_db.py",
                  "line": 195
                }
              ]
            },
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 3132,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 291
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "knowledge_base",
              "file": "app.py",
              "line": 3196,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 262
                },
                {
                  "file": "init_db.py",
                  "line": 163
                }
              ]
            },
            {
              "name": "knowledge_categories",
              "file": "app.py",
              "line": 3196,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 244
                },
                {
                  "file": "init_db.py",
                  "line": 152
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 4132,
              "function": "get_stats"
            },
            {
              "file": "app.py",
              "line": 175,
              "function": "is_db_available"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1600,
              "function": "load_unmatched_queries"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 2754,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 3130,
              "function": "load_synonyms"
            },
            {
              "file": "app.py",
              "line": 3193,
              "function": "load_rules"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/student/moodle/link",
          "methods": [
            "POST",
            "DELETE"
          ],
          "file": "app.py",
          "line": 4301,
          "function": "link_moodle",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 4301,
              "function": "link_moodle"
            },
            {
              "file": "moodle_sync/client.py",
              "line": 46,
              "function": "MoodleClient"
            },
            {
              "file": "moodle_sync/client.py",
              "line": 15,
              "function": "MoodleError"
            },
            {
              "file": "moodle_sync/client.py",
              "line": 23,
              "function": "_post"
            },
            {
              "file": "moodle_sync/client.py",
              "line": 35,
              "function": "get_token"
            },
            {
              "file": "moodle_sync/assignments.py",
              "line": 85,
              "function": "clear_cache"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/staff/alerts",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 4512,
          "function": "staff_alerts",
          "tables": [
            {
              "name": "student_privacy_settings",
              "file": "app.py",
              "line": 2877,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 285
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 214,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "assignments",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 497
                }
              ]
            },
            {
              "name": "assignment_submissions",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 512
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 168,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 169,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 211,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 243,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 256,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 268,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 282,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 291,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 297,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2006,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 153
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2482,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 4158,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 4512,
              "function": "staff_alerts"
            },
            {
              "file": "app.py",
              "line": 2874,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4272,
              "function": "get_dashboard_source"
            },
            {
              "file": "dashboard/sources.py",
              "line": 156,
              "function": "MySQLDashboardSource"
            },
            {
              "file": "dashboard/sources.py",
              "line": 62,
              "function": "_fmt"
            },
            {
              "file": "app.py",
              "line": 2961,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 2029,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2003,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 4401,
              "function": "reviewable_student_ids"
            },
            {
              "file": "app.py",
              "line": 2481,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 4157,
              "function": "list_students"
            },
            {
              "file": "app.py",
              "line": 207,
              "function": "role_required"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/knowledge-documents",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "campus/knowledge_documents.py",
          "line": 62,
          "function": "collection",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/knowledge_documents.py",
              "line": 62,
              "function": "collection"
            },
            {
              "file": "campus/knowledge_documents.py",
              "line": 16,
              "function": "documents"
            },
            {
              "file": "campus/knowledge_documents.py",
              "line": 20,
              "function": "folder"
            },
            {
              "file": "campus/knowledge_documents.py",
              "line": 32,
              "function": "extract_pdf"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            }
          ],
          "storage": [
            "data/campus_store.json → knowledge_documents"
          ]
        },
        {
          "url": "/api/admin/knowledge-documents/<document_id>",
          "methods": [
            "POST"
          ],
          "file": "campus/knowledge_documents.py",
          "line": 89,
          "function": "update",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/knowledge_documents.py",
              "line": 89,
              "function": "update"
            },
            {
              "file": "campus/knowledge_documents.py",
              "line": 20,
              "function": "folder"
            },
            {
              "file": "campus/knowledge_documents.py",
              "line": 16,
              "function": "documents"
            },
            {
              "file": "campus/knowledge_documents.py",
              "line": 32,
              "function": "extract_pdf"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            }
          ],
          "storage": [
            "data/campus_store.json → knowledge_documents"
          ]
        },
        {
          "url": "/api/admin/knowledge-documents/<document_id>/file",
          "methods": [
            "GET"
          ],
          "file": "campus/knowledge_documents.py",
          "line": 113,
          "function": "download",
          "tables": [],
          "files": [
            {
              "file": "campus/knowledge_documents.py",
              "line": 113,
              "function": "download"
            },
            {
              "file": "campus/knowledge_documents.py",
              "line": 16,
              "function": "documents"
            },
            {
              "file": "campus/knowledge_documents.py",
              "line": 20,
              "function": "folder"
            }
          ],
          "storage": [
            "data/campus_store.json → knowledge_documents"
          ]
        },
        {
          "url": "/api/admin/conduct-settings",
          "methods": [
            "GET"
          ],
          "file": "conduct/__init__.py",
          "line": 430,
          "function": "get_settings",
          "tables": [
            {
              "name": "conduct_settings",
              "file": "conduct/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 684
                }
              ]
            }
          ],
          "files": [
            {
              "file": "conduct/__init__.py",
              "line": 430,
              "function": "get_settings"
            },
            {
              "file": "conduct/__init__.py",
              "line": 82,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "conduct/__init__.py",
              "line": 421,
              "function": "_settings_guard"
            },
            {
              "file": "conduct/__init__.py",
              "line": 67,
              "function": "_error"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/conduct-settings/preview",
          "methods": [
            "POST"
          ],
          "file": "conduct/__init__.py",
          "line": 439,
          "function": "preview_settings",
          "tables": [
            {
              "name": "conduct_settings",
              "file": "conduct/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 684
                }
              ]
            },
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 181,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 670
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 171,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 654
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 4158,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            }
          ],
          "files": [
            {
              "file": "conduct/__init__.py",
              "line": 439,
              "function": "preview_settings"
            },
            {
              "file": "conduct/__init__.py",
              "line": 82,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "conduct/__init__.py",
              "line": 403,
              "function": "compare_rules"
            },
            {
              "file": "conduct/__init__.py",
              "line": 190,
              "function": "build_report"
            },
            {
              "file": "app.py",
              "line": 4705,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1146,
              "function": "current_academic_term"
            },
            {
              "file": "conduct/__init__.py",
              "line": 76,
              "function": "grade_of"
            },
            {
              "file": "conduct/__init__.py",
              "line": 71,
              "function": "_semester_key"
            },
            {
              "file": "conduct/__init__.py",
              "line": 179,
              "function": "load_evaluations"
            },
            {
              "file": "conduct/__init__.py",
              "line": 169,
              "function": "load_records"
            },
            {
              "file": "app.py",
              "line": 4157,
              "function": "list_students"
            },
            {
              "file": "conduct/__init__.py",
              "line": 67,
              "function": "_error"
            },
            {
              "file": "conduct/__init__.py",
              "line": 119,
              "function": "validate_rules"
            },
            {
              "file": "conduct/__init__.py",
              "line": 109,
              "function": "_number"
            },
            {
              "file": "conduct/__init__.py",
              "line": 421,
              "function": "_settings_guard"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/conduct-settings",
          "methods": [
            "PUT"
          ],
          "file": "conduct/__init__.py",
          "line": 452,
          "function": "update_settings",
          "tables": [
            {
              "name": "conduct_settings",
              "file": "conduct/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 684
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "conduct_settings",
              "file": "conduct/__init__.py",
              "line": 161,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 684
                }
              ]
            },
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 181,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 670
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 171,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 654
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 4158,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            }
          ],
          "files": [
            {
              "file": "conduct/__init__.py",
              "line": 452,
              "function": "update_settings"
            },
            {
              "file": "conduct/__init__.py",
              "line": 82,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "conduct/__init__.py",
              "line": 67,
              "function": "_error"
            },
            {
              "file": "conduct/__init__.py",
              "line": 119,
              "function": "validate_rules"
            },
            {
              "file": "conduct/__init__.py",
              "line": 109,
              "function": "_number"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "conduct/__init__.py",
              "line": 157,
              "function": "save_rules"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "conduct/__init__.py",
              "line": 403,
              "function": "compare_rules"
            },
            {
              "file": "conduct/__init__.py",
              "line": 190,
              "function": "build_report"
            },
            {
              "file": "app.py",
              "line": 4705,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1146,
              "function": "current_academic_term"
            },
            {
              "file": "conduct/__init__.py",
              "line": 76,
              "function": "grade_of"
            },
            {
              "file": "conduct/__init__.py",
              "line": 71,
              "function": "_semester_key"
            },
            {
              "file": "conduct/__init__.py",
              "line": 179,
              "function": "load_evaluations"
            },
            {
              "file": "conduct/__init__.py",
              "line": 169,
              "function": "load_records"
            },
            {
              "file": "app.py",
              "line": 4157,
              "function": "list_students"
            },
            {
              "file": "conduct/__init__.py",
              "line": 421,
              "function": "_settings_guard"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin-knowledge-documents.html",
          "line": 13
        },
        {
          "file": "static/admin-knowledge-documents.html",
          "line": 14
        },
        {
          "file": "static/admin-knowledge-documents.html",
          "line": 15
        },
        {
          "file": "static/admin.html",
          "line": 1040
        },
        {
          "file": "static/admin.html",
          "line": 1092
        },
        {
          "file": "static/admin.html",
          "line": 1110
        },
        {
          "file": "static/admin.html",
          "line": 1267
        },
        {
          "file": "static/admin.html",
          "line": 1355
        },
        {
          "file": "static/admin.html",
          "line": 1361
        },
        {
          "file": "static/admin.html",
          "line": 1370
        },
        {
          "file": "static/admin.html",
          "line": 1383
        },
        {
          "file": "static/admin.html",
          "line": 1449
        },
        {
          "file": "static/admin.html",
          "line": 1460
        },
        {
          "file": "static/admin.html",
          "line": 1480
        },
        {
          "file": "static/admin.html",
          "line": 1537
        },
        {
          "file": "static/admin.html",
          "line": 1549
        },
        {
          "file": "static/admin.html",
          "line": 1583
        },
        {
          "file": "static/admin.html",
          "line": 1595
        },
        {
          "file": "static/admin.html",
          "line": 1627
        },
        {
          "file": "static/admin.html",
          "line": 1689
        },
        {
          "file": "static/admin.html",
          "line": 1721
        },
        {
          "file": "static/admin.html",
          "line": 2079
        },
        {
          "file": "static/admin.html",
          "line": 2189
        },
        {
          "file": "static/admin.html",
          "line": 2203
        },
        {
          "file": "static/admin.html",
          "line": 2243
        },
        {
          "file": "static/admin.html",
          "line": 2286
        },
        {
          "file": "static/admin.html",
          "line": 2312
        },
        {
          "file": "static/admin.html",
          "line": 2332
        },
        {
          "file": "static/index.html",
          "line": 2544
        },
        {
          "file": "static/index.html",
          "line": 2569
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1419
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 561
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 740
        }
      ]
    },
    {
      "id": "other",
      "name": "其他校園服務端點",
      "group": "系統",
      "summary": "依下方端點查看各項服務的實際處理程式。",
      "routes": [
        {
          "url": "/api/applications/form/<int:item_id>",
          "methods": [
            "GET"
          ],
          "file": "applications/__init__.py",
          "line": 179,
          "function": "application_form",
          "tables": [
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2756,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 318
                },
                {
                  "file": "init_db.py",
                  "line": 195
                }
              ]
            }
          ],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 179,
              "function": "application_form"
            },
            {
              "file": "applications/__init__.py",
              "line": 57,
              "function": "_error"
            },
            {
              "file": "applications/__init__.py",
              "line": 174,
              "function": "_find_item"
            },
            {
              "file": "app.py",
              "line": 2754,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/applications/mine",
          "methods": [
            "GET"
          ],
          "file": "applications/__init__.py",
          "line": 196,
          "function": "my_applications",
          "tables": [
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 89,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 633
                }
              ]
            }
          ],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 196,
              "function": "my_applications"
            },
            {
              "file": "applications/__init__.py",
              "line": 85,
              "function": "load_applications"
            },
            {
              "file": "applications/__init__.py",
              "line": 67,
              "function": "_row_to_app"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "applications/__init__.py",
              "line": 136,
              "function": "describe"
            },
            {
              "file": "applications/__init__.py",
              "line": 125,
              "function": "can_review"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/applications",
          "methods": [
            "POST"
          ],
          "file": "applications/__init__.py",
          "line": 210,
          "function": "submit_application",
          "tables": [
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 244,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 633
                }
              ]
            },
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 89,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 633
                }
              ]
            },
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 101,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 633
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2756,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 318
                },
                {
                  "file": "init_db.py",
                  "line": 195
                }
              ]
            }
          ],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 210,
              "function": "submit_application"
            },
            {
              "file": "applications/__init__.py",
              "line": 136,
              "function": "describe"
            },
            {
              "file": "applications/__init__.py",
              "line": 125,
              "function": "can_review"
            },
            {
              "file": "applications/__init__.py",
              "line": 85,
              "function": "load_applications"
            },
            {
              "file": "applications/__init__.py",
              "line": 67,
              "function": "_row_to_app"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "applications/__init__.py",
              "line": 57,
              "function": "_error"
            },
            {
              "file": "applications/__init__.py",
              "line": 100,
              "function": "get_application"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "applications/__init__.py",
              "line": 61,
              "function": "_now"
            },
            {
              "file": "applications/__init__.py",
              "line": 174,
              "function": "_find_item"
            },
            {
              "file": "app.py",
              "line": 2754,
              "function": "load_checklists"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/applications/<int:app_id>/withdraw",
          "methods": [
            "POST"
          ],
          "file": "applications/__init__.py",
          "line": 263,
          "function": "withdraw_application",
          "tables": [
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 111,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 633
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 101,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 633
                }
              ]
            }
          ],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 263,
              "function": "withdraw_application"
            },
            {
              "file": "applications/__init__.py",
              "line": 61,
              "function": "_now"
            },
            {
              "file": "applications/__init__.py",
              "line": 57,
              "function": "_error"
            },
            {
              "file": "applications/__init__.py",
              "line": 107,
              "function": "save_transition"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "applications/__init__.py",
              "line": 100,
              "function": "get_application"
            },
            {
              "file": "applications/__init__.py",
              "line": 67,
              "function": "_row_to_app"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/applications/review",
          "methods": [
            "GET"
          ],
          "file": "applications/__init__.py",
          "line": 283,
          "function": "review_list",
          "tables": [
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 89,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 633
                }
              ]
            }
          ],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 283,
              "function": "review_list"
            },
            {
              "file": "applications/__init__.py",
              "line": 136,
              "function": "describe"
            },
            {
              "file": "applications/__init__.py",
              "line": 125,
              "function": "can_review"
            },
            {
              "file": "applications/__init__.py",
              "line": 57,
              "function": "_error"
            },
            {
              "file": "applications/__init__.py",
              "line": 85,
              "function": "load_applications"
            },
            {
              "file": "applications/__init__.py",
              "line": 67,
              "function": "_row_to_app"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/applications/<int:app_id>/review",
          "methods": [
            "POST"
          ],
          "file": "applications/__init__.py",
          "line": 304,
          "function": "review_application",
          "tables": [
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 101,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 633
                }
              ]
            },
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 111,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 633
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 304,
              "function": "review_application"
            },
            {
              "file": "applications/__init__.py",
              "line": 100,
              "function": "get_application"
            },
            {
              "file": "applications/__init__.py",
              "line": 67,
              "function": "_row_to_app"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "applications/__init__.py",
              "line": 136,
              "function": "describe"
            },
            {
              "file": "applications/__init__.py",
              "line": 125,
              "function": "can_review"
            },
            {
              "file": "applications/__init__.py",
              "line": 61,
              "function": "_now"
            },
            {
              "file": "app.py",
              "line": 4683,
              "function": "notify_student"
            },
            {
              "file": "attendance/notify.py",
              "line": 73,
              "function": "get_mailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 32,
              "function": "ConsoleMailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 46,
              "function": "SmtpMailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 27,
              "function": "campus_email"
            },
            {
              "file": "applications/__init__.py",
              "line": 57,
              "function": "_error"
            },
            {
              "file": "applications/__init__.py",
              "line": 107,
              "function": "save_transition"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/activity-campaigns",
          "methods": [
            "GET"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 152,
          "function": "list_campaigns",
          "tables": [],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 152,
              "function": "list_campaigns"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 104,
              "function": "visible"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 22,
              "function": "campaigns"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 114,
              "function": "view"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 34,
              "function": "visitor_replies"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 43,
              "function": "answer_status"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 26,
              "function": "replies"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 30,
              "function": "approvals"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 110,
              "function": "manager"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 38,
              "function": "participants"
            }
          ],
          "storage": [
            "data/campus_store.json → activity_campaign_approvals",
            "data/campus_store.json → activity_campaign_replies",
            "data/campus_store.json → activity_campaign_visitor_replies",
            "data/campus_store.json → activity_campaigns"
          ]
        },
        {
          "url": "/api/campus/activity-campaigns/targets",
          "methods": [
            "GET"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 159,
          "function": "targets",
          "tables": [],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 159,
              "function": "targets"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 91,
              "function": "assistant_student_ids"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/activity-campaigns",
          "methods": [
            "POST"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 179,
          "function": "create_campaign",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 179,
              "function": "create_campaign"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 114,
              "function": "view"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 34,
              "function": "visitor_replies"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 43,
              "function": "answer_status"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 26,
              "function": "replies"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 30,
              "function": "approvals"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 110,
              "function": "manager"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 38,
              "function": "participants"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 22,
              "function": "campaigns"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 83,
              "function": "save_file"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 66,
              "function": "root"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 70,
              "function": "read_file"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 91,
              "function": "assistant_student_ids"
            }
          ],
          "storage": [
            "data/campus_store.json → activity_campaign_approvals",
            "data/campus_store.json → activity_campaign_replies",
            "data/campus_store.json → activity_campaign_visitor_replies",
            "data/campus_store.json → activity_campaigns"
          ]
        },
        {
          "url": "/api/campus/activity-campaigns/<int:campaign_id>/broadcast",
          "methods": [
            "POST"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 261,
          "function": "broadcast",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 261,
              "function": "broadcast"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 22,
              "function": "campaigns"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 110,
              "function": "manager"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            }
          ],
          "storage": [
            "data/campus_store.json → activity_campaigns"
          ]
        },
        {
          "url": "/api/campus/activity-campaigns/<int:campaign_id>/reply",
          "methods": [
            "POST"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 280,
          "function": "reply",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 280,
              "function": "reply"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 38,
              "function": "participants"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 34,
              "function": "visitor_replies"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 26,
              "function": "replies"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 43,
              "function": "answer_status"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 22,
              "function": "campaigns"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 51,
              "function": "promote"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 83,
              "function": "save_file"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 66,
              "function": "root"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 70,
              "function": "read_file"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            }
          ],
          "storage": [
            "data/campus_store.json → activity_campaign_replies",
            "data/campus_store.json → activity_campaign_visitor_replies",
            "data/campus_store.json → activity_campaigns"
          ]
        },
        {
          "url": "/api/campus/activity-campaigns/<int:campaign_id>/visitor-register",
          "methods": [
            "POST"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 327,
          "function": "visitor_register",
          "tables": [],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 327,
              "function": "visitor_register"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 34,
              "function": "visitor_replies"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 38,
              "function": "participants"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 26,
              "function": "replies"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 22,
              "function": "campaigns"
            }
          ],
          "storage": [
            "data/campus_store.json → activity_campaign_replies",
            "data/campus_store.json → activity_campaign_visitor_replies",
            "data/campus_store.json → activity_campaigns"
          ]
        },
        {
          "url": "/api/campus/activity-campaigns/<int:campaign_id>/visitor-cancel",
          "methods": [
            "POST"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 358,
          "function": "visitor_cancel",
          "tables": [],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 358,
              "function": "visitor_cancel"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 34,
              "function": "visitor_replies"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 22,
              "function": "campaigns"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 51,
              "function": "promote"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 38,
              "function": "participants"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 26,
              "function": "replies"
            }
          ],
          "storage": [
            "data/campus_store.json → activity_campaign_replies",
            "data/campus_store.json → activity_campaign_visitor_replies",
            "data/campus_store.json → activity_campaigns"
          ]
        },
        {
          "url": "/api/campus/activity-campaigns/<int:campaign_id>/replies",
          "methods": [
            "GET"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 377,
          "function": "list_replies",
          "tables": [],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 377,
              "function": "list_replies"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 43,
              "function": "answer_status"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 22,
              "function": "campaigns"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 26,
              "function": "replies"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 110,
              "function": "manager"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 34,
              "function": "visitor_replies"
            }
          ],
          "storage": [
            "data/campus_store.json → activity_campaign_replies",
            "data/campus_store.json → activity_campaign_visitor_replies",
            "data/campus_store.json → activity_campaigns"
          ]
        },
        {
          "url": "/api/campus/activity-campaigns/<int:campaign_id>/duplicate",
          "methods": [
            "POST"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 400,
          "function": "duplicate",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 400,
              "function": "duplicate"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 22,
              "function": "campaigns"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 114,
              "function": "view"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 34,
              "function": "visitor_replies"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 43,
              "function": "answer_status"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 26,
              "function": "replies"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 30,
              "function": "approvals"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 110,
              "function": "manager"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 38,
              "function": "participants"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            }
          ],
          "storage": [
            "data/campus_store.json → activity_campaign_approvals",
            "data/campus_store.json → activity_campaign_replies",
            "data/campus_store.json → activity_campaign_visitor_replies",
            "data/campus_store.json → activity_campaigns"
          ]
        },
        {
          "url": "/api/campus/activity-campaigns/<int:campaign_id>/approvals",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 425,
          "function": "campaign_approvals",
          "tables": [],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 425,
              "function": "campaign_approvals"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 30,
              "function": "approvals"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 22,
              "function": "campaigns"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 110,
              "function": "manager"
            }
          ],
          "storage": [
            "data/campus_store.json → activity_campaign_approvals",
            "data/campus_store.json → activity_campaigns"
          ]
        },
        {
          "url": "/api/campus/activity-campaigns/teacher-tasks",
          "methods": [
            "GET"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 453,
          "function": "teacher_tasks",
          "tables": [],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 453,
              "function": "teacher_tasks"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 30,
              "function": "approvals"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 22,
              "function": "campaigns"
            }
          ],
          "storage": [
            "data/campus_store.json → activity_campaign_approvals",
            "data/campus_store.json → activity_campaigns"
          ]
        },
        {
          "url": "/api/campus/activity-campaigns/teacher-tasks/<int:approval_id>",
          "methods": [
            "POST"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 471,
          "function": "review_task",
          "tables": [],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 471,
              "function": "review_task"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 30,
              "function": "approvals"
            }
          ],
          "storage": [
            "data/campus_store.json → activity_campaign_approvals"
          ]
        },
        {
          "url": "/api/campus/activity-campaigns/<int:campaign_id>/approvals/<int:approval_id>/remind",
          "methods": [
            "POST"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 490,
          "function": "remind_teacher",
          "tables": [],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 490,
              "function": "remind_teacher"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 30,
              "function": "approvals"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 22,
              "function": "campaigns"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 110,
              "function": "manager"
            }
          ],
          "storage": [
            "data/campus_store.json → activity_campaign_approvals",
            "data/campus_store.json → activity_campaigns"
          ]
        },
        {
          "url": "/api/campus/activity-campaigns/<int:campaign_id>/approvals/remind-pending",
          "methods": [
            "POST"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 507,
          "function": "remind_pending_teachers",
          "tables": [],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 507,
              "function": "remind_pending_teachers"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 30,
              "function": "approvals"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 22,
              "function": "campaigns"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 110,
              "function": "manager"
            }
          ],
          "storage": [
            "data/campus_store.json → activity_campaign_approvals",
            "data/campus_store.json → activity_campaigns"
          ]
        },
        {
          "url": "/api/campus/activity-campaigns/<int:campaign_id>/checkin",
          "methods": [
            "POST"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 524,
          "function": "checkin",
          "tables": [],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 524,
              "function": "checkin"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 26,
              "function": "replies"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 22,
              "function": "campaigns"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 110,
              "function": "manager"
            }
          ],
          "storage": [
            "data/campus_store.json → activity_campaign_replies",
            "data/campus_store.json → activity_campaigns"
          ]
        },
        {
          "url": "/api/campus/activity-campaigns/<int:campaign_id>/report.csv",
          "methods": [
            "GET"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 543,
          "function": "report",
          "tables": [],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 543,
              "function": "report"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 43,
              "function": "answer_status"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 22,
              "function": "campaigns"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 26,
              "function": "replies"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 110,
              "function": "manager"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 34,
              "function": "visitor_replies"
            }
          ],
          "storage": [
            "data/campus_store.json → activity_campaign_replies",
            "data/campus_store.json → activity_campaign_visitor_replies",
            "data/campus_store.json → activity_campaigns"
          ]
        },
        {
          "url": "/api/campus/activity-campaigns/<int:campaign_id>/checkin-qr",
          "methods": [
            "GET"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 570,
          "function": "checkin_qr",
          "tables": [],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 570,
              "function": "checkin_qr"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 22,
              "function": "campaigns"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 110,
              "function": "manager"
            }
          ],
          "storage": [
            "data/campus_store.json → activity_campaigns"
          ]
        },
        {
          "url": "/api/campus/activity-campaigns/<int:campaign_id>/self-checkin",
          "methods": [
            "POST"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 587,
          "function": "self_checkin",
          "tables": [],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 587,
              "function": "self_checkin"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 26,
              "function": "replies"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 34,
              "function": "visitor_replies"
            }
          ],
          "storage": [
            "data/campus_store.json → activity_campaign_replies",
            "data/campus_store.json → activity_campaign_visitor_replies"
          ]
        },
        {
          "url": "/api/campus/activity-campaigns/<int:campaign_id>/files/<kind>",
          "methods": [
            "GET"
          ],
          "file": "campus/activity_campaigns.py",
          "line": 614,
          "function": "download",
          "tables": [],
          "files": [
            {
              "file": "campus/activity_campaigns.py",
              "line": 614,
              "function": "download"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 26,
              "function": "replies"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 110,
              "function": "manager"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 22,
              "function": "campaigns"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 66,
              "function": "root"
            },
            {
              "file": "campus/activity_campaigns.py",
              "line": 104,
              "function": "visible"
            }
          ],
          "storage": [
            "data/campus_store.json → activity_campaign_replies",
            "data/campus_store.json → activity_campaigns"
          ]
        },
        {
          "url": "/api/campus/assistant/students",
          "methods": [
            "GET"
          ],
          "file": "campus/admin_cases.py",
          "line": 475,
          "function": "assistant_students",
          "tables": [
            {
              "name": "users",
              "file": "campus/admin_cases.py",
              "line": 55,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 95
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/admin_cases.py",
              "line": 475,
              "function": "assistant_students"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 52,
              "function": "assistant_departments"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            }
          ],
          "storage": [
            "data/campus_store.json → admin_assistant_departments"
          ]
        },
        {
          "url": "/api/campus/events",
          "methods": [
            "GET"
          ],
          "file": "campus/events.py",
          "line": 135,
          "function": "list_events",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 135,
              "function": "list_events"
            },
            {
              "file": "campus/events.py",
              "line": 101,
              "function": "event_view"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/events/<int:event_id>",
          "methods": [
            "GET"
          ],
          "file": "campus/events.py",
          "line": 165,
          "function": "get_event",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 165,
              "function": "get_event"
            },
            {
              "file": "campus/events.py",
              "line": 101,
              "function": "event_view"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/events",
          "methods": [
            "POST"
          ],
          "file": "campus/events.py",
          "line": 179,
          "function": "create_event",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/events.py",
              "line": 179,
              "function": "create_event"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "campus/events.py",
              "line": 30,
              "function": "clean_event"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/events/<int:event_id>",
          "methods": [
            "PUT"
          ],
          "file": "campus/events.py",
          "line": 194,
          "function": "update_event",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/events.py",
              "line": 194,
              "function": "update_event"
            },
            {
              "file": "campus/events.py",
              "line": 30,
              "function": "clean_event"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/events/<int:event_id>",
          "methods": [
            "DELETE"
          ],
          "file": "campus/events.py",
          "line": 219,
          "function": "cancel_event",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/events.py",
              "line": 219,
              "function": "cancel_event"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/events/<int:event_id>/register",
          "methods": [
            "POST"
          ],
          "file": "campus/events.py",
          "line": 282,
          "function": "register_event",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 282,
              "function": "register_event"
            },
            {
              "file": "campus/events.py",
              "line": 233,
              "function": "_confirmation_email"
            },
            {
              "file": "campus/events.py",
              "line": 123,
              "function": "send_mail_safely"
            },
            {
              "file": "attendance/notify.py",
              "line": 73,
              "function": "get_mailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 32,
              "function": "ConsoleMailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 46,
              "function": "SmtpMailer"
            },
            {
              "file": "campus/events.py",
              "line": 245,
              "function": "_add_registration"
            },
            {
              "file": "campus/events.py",
              "line": 77,
              "function": "clean_registration"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/events/<int:event_id>/registrations",
          "methods": [
            "POST"
          ],
          "file": "campus/events.py",
          "line": 297,
          "function": "add_registration",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 297,
              "function": "add_registration"
            },
            {
              "file": "campus/events.py",
              "line": 233,
              "function": "_confirmation_email"
            },
            {
              "file": "campus/events.py",
              "line": 123,
              "function": "send_mail_safely"
            },
            {
              "file": "attendance/notify.py",
              "line": 73,
              "function": "get_mailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 32,
              "function": "ConsoleMailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 46,
              "function": "SmtpMailer"
            },
            {
              "file": "campus/events.py",
              "line": 245,
              "function": "_add_registration"
            },
            {
              "file": "campus/events.py",
              "line": 77,
              "function": "clean_registration"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/events/<int:event_id>/registrations/<int:reg_id>/cancel",
          "methods": [
            "POST"
          ],
          "file": "campus/events.py",
          "line": 329,
          "function": "cancel_registration",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 329,
              "function": "cancel_registration"
            },
            {
              "file": "campus/events.py",
              "line": 311,
              "function": "_promote_next_waitlisted"
            },
            {
              "file": "campus/events.py",
              "line": 320,
              "function": "_notify_promoted"
            },
            {
              "file": "campus/events.py",
              "line": 123,
              "function": "send_mail_safely"
            },
            {
              "file": "attendance/notify.py",
              "line": 73,
              "function": "get_mailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 32,
              "function": "ConsoleMailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 46,
              "function": "SmtpMailer"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/events/<int:event_id>/registrations/<int:reg_id>",
          "methods": [
            "PUT"
          ],
          "file": "campus/events.py",
          "line": 360,
          "function": "edit_registration",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/events.py",
              "line": 360,
              "function": "edit_registration"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "campus/events.py",
              "line": 77,
              "function": "clean_registration"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/events/<int:event_id>/registrations/<int:reg_id>",
          "methods": [
            "DELETE"
          ],
          "file": "campus/events.py",
          "line": 384,
          "function": "delete_registration",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/events.py",
              "line": 384,
              "function": "delete_registration"
            },
            {
              "file": "campus/events.py",
              "line": 311,
              "function": "_promote_next_waitlisted"
            },
            {
              "file": "campus/events.py",
              "line": 320,
              "function": "_notify_promoted"
            },
            {
              "file": "campus/events.py",
              "line": 123,
              "function": "send_mail_safely"
            },
            {
              "file": "attendance/notify.py",
              "line": 73,
              "function": "get_mailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 32,
              "function": "ConsoleMailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 46,
              "function": "SmtpMailer"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/events/<int:event_id>/registrations/<int:reg_id>/notify",
          "methods": [
            "POST"
          ],
          "file": "campus/events.py",
          "line": 405,
          "function": "notify_registration",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 405,
              "function": "notify_registration"
            },
            {
              "file": "campus/events.py",
              "line": 233,
              "function": "_confirmation_email"
            },
            {
              "file": "campus/events.py",
              "line": 123,
              "function": "send_mail_safely"
            },
            {
              "file": "attendance/notify.py",
              "line": 73,
              "function": "get_mailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 32,
              "function": "ConsoleMailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 46,
              "function": "SmtpMailer"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/events/<int:event_id>/checkin",
          "methods": [
            "POST"
          ],
          "file": "campus/events.py",
          "line": 423,
          "function": "checkin",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 423,
              "function": "checkin"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/events/<int:event_id>/registrations",
          "methods": [
            "GET"
          ],
          "file": "campus/events.py",
          "line": 443,
          "function": "list_registrations",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 443,
              "function": "list_registrations"
            },
            {
              "file": "campus/events.py",
              "line": 101,
              "function": "event_view"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/events/send-reminders",
          "methods": [
            "POST"
          ],
          "file": "campus/events.py",
          "line": 456,
          "function": "send_reminders",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 456,
              "function": "send_reminders"
            },
            {
              "file": "attendance/notify.py",
              "line": 73,
              "function": "get_mailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 32,
              "function": "ConsoleMailer"
            },
            {
              "file": "attendance/notify.py",
              "line": 46,
              "function": "SmtpMailer"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/events/<int:event_id>/feedback",
          "methods": [
            "POST"
          ],
          "file": "campus/events.py",
          "line": 483,
          "function": "submit_feedback",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 483,
              "function": "submit_feedback"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/graduation-projects",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "campus/graduation_projects.py",
          "line": 80,
          "function": "collection",
          "tables": [],
          "files": [
            {
              "file": "campus/graduation_projects.py",
              "line": 80,
              "function": "collection"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 20,
              "function": "teams"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 64,
              "function": "team_view"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 24,
              "function": "submissions"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 60,
              "function": "manages"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 47,
              "function": "cs_teacher"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 41,
              "function": "cs_assistant"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 56,
              "function": "mine"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 36,
              "function": "cs_student"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 51,
              "function": "teacher_options"
            }
          ],
          "storage": [
            "data/campus_store.json → graduation_project_submissions",
            "data/campus_store.json → graduation_project_teams"
          ]
        },
        {
          "url": "/api/campus/graduation-projects/join",
          "methods": [
            "POST"
          ],
          "file": "campus/graduation_projects.py",
          "line": 108,
          "function": "join",
          "tables": [],
          "files": [
            {
              "file": "campus/graduation_projects.py",
              "line": 108,
              "function": "join"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 20,
              "function": "teams"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 64,
              "function": "team_view"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 24,
              "function": "submissions"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 36,
              "function": "cs_student"
            }
          ],
          "storage": [
            "data/campus_store.json → graduation_project_submissions",
            "data/campus_store.json → graduation_project_teams"
          ]
        },
        {
          "url": "/api/campus/graduation-projects/<int:team_id>/preferences",
          "methods": [
            "PUT"
          ],
          "file": "campus/graduation_projects.py",
          "line": 130,
          "function": "preferences",
          "tables": [],
          "files": [
            {
              "file": "campus/graduation_projects.py",
              "line": 130,
              "function": "preferences"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 20,
              "function": "teams"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 64,
              "function": "team_view"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 24,
              "function": "submissions"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 51,
              "function": "teacher_options"
            }
          ],
          "storage": [
            "data/campus_store.json → graduation_project_submissions",
            "data/campus_store.json → graduation_project_teams"
          ]
        },
        {
          "url": "/api/campus/graduation-projects/match",
          "methods": [
            "POST"
          ],
          "file": "campus/graduation_projects.py",
          "line": 150,
          "function": "match_teachers",
          "tables": [],
          "files": [
            {
              "file": "campus/graduation_projects.py",
              "line": 150,
              "function": "match_teachers"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 20,
              "function": "teams"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 51,
              "function": "teacher_options"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 41,
              "function": "cs_assistant"
            }
          ],
          "storage": [
            "data/campus_store.json → graduation_project_teams"
          ]
        },
        {
          "url": "/api/campus/graduation-projects/<int:team_id>/submissions/<stage>",
          "methods": [
            "POST"
          ],
          "file": "campus/graduation_projects.py",
          "line": 177,
          "function": "submit_stage",
          "tables": [],
          "files": [
            {
              "file": "campus/graduation_projects.py",
              "line": 177,
              "function": "submit_stage"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 24,
              "function": "submissions"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 32,
              "function": "file_root"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 20,
              "function": "teams"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 56,
              "function": "mine"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 36,
              "function": "cs_student"
            }
          ],
          "storage": [
            "data/campus_store.json → graduation_project_submissions",
            "data/campus_store.json → graduation_project_teams"
          ]
        },
        {
          "url": "/api/campus/graduation-projects/submissions/<int:submission_id>/file",
          "methods": [
            "GET"
          ],
          "file": "campus/graduation_projects.py",
          "line": 215,
          "function": "download",
          "tables": [],
          "files": [
            {
              "file": "campus/graduation_projects.py",
              "line": 215,
              "function": "download"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 60,
              "function": "manages"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 47,
              "function": "cs_teacher"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 41,
              "function": "cs_assistant"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 56,
              "function": "mine"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 36,
              "function": "cs_student"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 20,
              "function": "teams"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 24,
              "function": "submissions"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 32,
              "function": "file_root"
            }
          ],
          "storage": [
            "data/campus_store.json → graduation_project_submissions",
            "data/campus_store.json → graduation_project_teams"
          ]
        },
        {
          "url": "/api/campus/graduation-projects/submissions/<int:submission_id>/review",
          "methods": [
            "POST"
          ],
          "file": "campus/graduation_projects.py",
          "line": 230,
          "function": "review",
          "tables": [],
          "files": [
            {
              "file": "campus/graduation_projects.py",
              "line": 230,
              "function": "review"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 20,
              "function": "teams"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 24,
              "function": "submissions"
            }
          ],
          "storage": [
            "data/campus_store.json → graduation_project_submissions",
            "data/campus_store.json → graduation_project_teams"
          ]
        },
        {
          "url": "/api/campus/graduation-projects/teacher-tasks",
          "methods": [
            "GET"
          ],
          "file": "campus/graduation_projects.py",
          "line": 253,
          "function": "teacher_tasks",
          "tables": [],
          "files": [
            {
              "file": "campus/graduation_projects.py",
              "line": 253,
              "function": "teacher_tasks"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 28,
              "function": "reminders"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 24,
              "function": "submissions"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 20,
              "function": "teams"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 47,
              "function": "cs_teacher"
            }
          ],
          "storage": [
            "data/campus_store.json → graduation_project_reminders",
            "data/campus_store.json → graduation_project_submissions",
            "data/campus_store.json → graduation_project_teams"
          ]
        },
        {
          "url": "/api/campus/graduation-projects/submissions/<int:submission_id>/remind",
          "methods": [
            "POST"
          ],
          "file": "campus/graduation_projects.py",
          "line": 274,
          "function": "remind",
          "tables": [],
          "files": [
            {
              "file": "campus/graduation_projects.py",
              "line": 274,
              "function": "remind"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 20,
              "function": "teams"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 28,
              "function": "reminders"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 24,
              "function": "submissions"
            },
            {
              "file": "campus/graduation_projects.py",
              "line": 41,
              "function": "cs_assistant"
            }
          ],
          "storage": [
            "data/campus_store.json → graduation_project_reminders",
            "data/campus_store.json → graduation_project_submissions",
            "data/campus_store.json → graduation_project_teams"
          ]
        },
        {
          "url": "/api/campus/assistant/graduation-roster",
          "methods": [
            "GET"
          ],
          "file": "campus/graduation_roster.py",
          "line": 80,
          "function": "roster",
          "tables": [
            {
              "name": "student_credits",
              "file": "campus/graduation_roster.py",
              "line": 20,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 153
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/graduation_roster.py",
              "line": 20,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/graduation_roster.py",
              "line": 80,
              "function": "roster"
            },
            {
              "file": "campus/graduation_roster.py",
              "line": 14,
              "function": "rows"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2029,
              "function": "summarize_credits"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/assistant/graduation-roster.csv",
          "methods": [
            "GET"
          ],
          "file": "campus/graduation_roster.py",
          "line": 93,
          "function": "export",
          "tables": [
            {
              "name": "student_credits",
              "file": "campus/graduation_roster.py",
              "line": 20,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 153
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/graduation_roster.py",
              "line": 20,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/graduation_roster.py",
              "line": 93,
              "function": "export"
            },
            {
              "file": "campus/graduation_roster.py",
              "line": 14,
              "function": "rows"
            },
            {
              "file": "app.py",
              "line": 1998,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2029,
              "function": "summarize_credits"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/line/demo-status",
          "methods": [
            "GET"
          ],
          "file": "campus/line_notifications.py",
          "line": 48,
          "function": "line_demo_status",
          "tables": [],
          "files": [
            {
              "file": "campus/line_notifications.py",
              "line": 48,
              "function": "line_demo_status"
            },
            {
              "file": "campus/line_notifications.py",
              "line": 26,
              "function": "demo_ready"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/line/demo-send",
          "methods": [
            "POST"
          ],
          "file": "campus/line_notifications.py",
          "line": 54,
          "function": "line_demo_send",
          "tables": [],
          "files": [
            {
              "file": "campus/line_notifications.py",
              "line": 54,
              "function": "line_demo_send"
            },
            {
              "file": "campus/line_notifications.py",
              "line": 34,
              "function": "push_demo_message"
            },
            {
              "file": "campus/line_notifications.py",
              "line": 26,
              "function": "demo_ready"
            }
          ],
          "storage": [
            "data/campus_store.json → line_demo_last_send"
          ]
        },
        {
          "url": "/api/line/settings",
          "methods": [
            "GET",
            "PUT"
          ],
          "file": "campus/line_notifications.py",
          "line": 102,
          "function": "line_settings",
          "tables": [],
          "files": [
            {
              "file": "campus/line_notifications.py",
              "line": 102,
              "function": "line_settings"
            },
            {
              "file": "campus/line_notifications.py",
              "line": 22,
              "function": "channel_ready"
            },
            {
              "file": "campus/line_notifications.py",
              "line": 75,
              "function": "settings_for"
            }
          ],
          "storage": [
            "data/campus_store.json → line_preferences"
          ]
        },
        {
          "url": "/api/campus/office-resources",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "campus/office_resources.py",
          "line": 57,
          "function": "collection",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/office_resources.py",
              "line": 57,
              "function": "collection"
            },
            {
              "file": "campus/office_resources.py",
              "line": 18,
              "function": "resources"
            },
            {
              "file": "campus/office_resources.py",
              "line": 35,
              "function": "may_edit"
            },
            {
              "file": "campus/office_resources.py",
              "line": 26,
              "function": "my_office"
            },
            {
              "file": "campus/office_resources.py",
              "line": 39,
              "function": "upload"
            },
            {
              "file": "campus/office_resources.py",
              "line": 22,
              "function": "folder"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            }
          ],
          "storage": [
            "data/campus_store.json → office_resources"
          ]
        },
        {
          "url": "/api/campus/office-resources/<int:resource_id>",
          "methods": [
            "POST"
          ],
          "file": "campus/office_resources.py",
          "line": 91,
          "function": "update",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/office_resources.py",
              "line": 91,
              "function": "update"
            },
            {
              "file": "campus/office_resources.py",
              "line": 18,
              "function": "resources"
            },
            {
              "file": "campus/office_resources.py",
              "line": 39,
              "function": "upload"
            },
            {
              "file": "campus/office_resources.py",
              "line": 22,
              "function": "folder"
            },
            {
              "file": "campus/office_resources.py",
              "line": 35,
              "function": "may_edit"
            },
            {
              "file": "campus/office_resources.py",
              "line": 26,
              "function": "my_office"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            }
          ],
          "storage": [
            "data/campus_store.json → office_resources"
          ]
        },
        {
          "url": "/api/campus/office-resources/<int:resource_id>/file",
          "methods": [
            "GET"
          ],
          "file": "campus/office_resources.py",
          "line": 117,
          "function": "download",
          "tables": [],
          "files": [
            {
              "file": "campus/office_resources.py",
              "line": 117,
              "function": "download"
            },
            {
              "file": "campus/office_resources.py",
              "line": 18,
              "function": "resources"
            },
            {
              "file": "campus/office_resources.py",
              "line": 22,
              "function": "folder"
            }
          ],
          "storage": [
            "data/campus_store.json → office_resources"
          ]
        },
        {
          "url": "/api/student/lobby",
          "methods": [
            "GET"
          ],
          "file": "campus/student_lobby.py",
          "line": 15,
          "function": "lobby",
          "tables": [
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 200,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "announcement_reads",
              "file": "dashboard/sources.py",
              "line": 214,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 486
                }
              ]
            },
            {
              "name": "assignments",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 497
                }
              ]
            },
            {
              "name": "assignment_submissions",
              "file": "dashboard/sources.py",
              "line": 220,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 512
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 168,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 169,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "announcements",
              "file": "dashboard/sources.py",
              "line": 211,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 473
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 243,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 256,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 268,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 282,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 291,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            },
            {
              "name": "leave_requests",
              "file": "dashboard/sources.py",
              "line": 297,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 523
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/student_lobby.py",
              "line": 15,
              "function": "lobby"
            },
            {
              "file": "dashboard/summary.py",
              "line": 61,
              "function": "summarize_assignments"
            },
            {
              "file": "dashboard/summary.py",
              "line": 16,
              "function": "_class_item"
            },
            {
              "file": "app.py",
              "line": 4272,
              "function": "get_dashboard_source"
            },
            {
              "file": "dashboard/sources.py",
              "line": 156,
              "function": "MySQLDashboardSource"
            },
            {
              "file": "dashboard/sources.py",
              "line": 62,
              "function": "_fmt"
            },
            {
              "file": "campus/student_lobby.py",
              "line": 10,
              "function": "local_now"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/conduct/me",
          "methods": [
            "GET"
          ],
          "file": "conduct/__init__.py",
          "line": 278,
          "function": "my_conduct",
          "tables": [
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 181,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 670
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 171,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 654
                }
              ]
            },
            {
              "name": "conduct_settings",
              "file": "conduct/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 684
                }
              ]
            }
          ],
          "files": [
            {
              "file": "conduct/__init__.py",
              "line": 278,
              "function": "my_conduct"
            },
            {
              "file": "conduct/__init__.py",
              "line": 258,
              "function": "_payload"
            },
            {
              "file": "conduct/__init__.py",
              "line": 249,
              "function": "can_manage"
            },
            {
              "file": "conduct/__init__.py",
              "line": 190,
              "function": "build_report"
            },
            {
              "file": "app.py",
              "line": 4705,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1146,
              "function": "current_academic_term"
            },
            {
              "file": "conduct/__init__.py",
              "line": 76,
              "function": "grade_of"
            },
            {
              "file": "conduct/__init__.py",
              "line": 71,
              "function": "_semester_key"
            },
            {
              "file": "conduct/__init__.py",
              "line": 179,
              "function": "load_evaluations"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "conduct/__init__.py",
              "line": 169,
              "function": "load_records"
            },
            {
              "file": "conduct/__init__.py",
              "line": 82,
              "function": "load_rules"
            },
            {
              "file": "conduct/__init__.py",
              "line": 239,
              "function": "viewer_student_id"
            },
            {
              "file": "conduct/__init__.py",
              "line": 67,
              "function": "_error"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/conduct/students",
          "methods": [
            "GET"
          ],
          "file": "conduct/__init__.py",
          "line": 286,
          "function": "manageable_students",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 4158,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 73
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            }
          ],
          "files": [
            {
              "file": "conduct/__init__.py",
              "line": 286,
              "function": "manageable_students"
            },
            {
              "file": "app.py",
              "line": 4157,
              "function": "list_students"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "conduct/__init__.py",
              "line": 266,
              "function": "_role_guard"
            },
            {
              "file": "conduct/__init__.py",
              "line": 67,
              "function": "_error"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/conduct/students/<student_id>",
          "methods": [
            "GET"
          ],
          "file": "conduct/__init__.py",
          "line": 300,
          "function": "student_conduct",
          "tables": [
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 181,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 670
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 171,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 654
                }
              ]
            },
            {
              "name": "conduct_settings",
              "file": "conduct/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 684
                }
              ]
            }
          ],
          "files": [
            {
              "file": "conduct/__init__.py",
              "line": 300,
              "function": "student_conduct"
            },
            {
              "file": "conduct/__init__.py",
              "line": 258,
              "function": "_payload"
            },
            {
              "file": "conduct/__init__.py",
              "line": 249,
              "function": "can_manage"
            },
            {
              "file": "conduct/__init__.py",
              "line": 190,
              "function": "build_report"
            },
            {
              "file": "app.py",
              "line": 4705,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1146,
              "function": "current_academic_term"
            },
            {
              "file": "conduct/__init__.py",
              "line": 76,
              "function": "grade_of"
            },
            {
              "file": "conduct/__init__.py",
              "line": 71,
              "function": "_semester_key"
            },
            {
              "file": "conduct/__init__.py",
              "line": 179,
              "function": "load_evaluations"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "conduct/__init__.py",
              "line": 169,
              "function": "load_records"
            },
            {
              "file": "conduct/__init__.py",
              "line": 82,
              "function": "load_rules"
            },
            {
              "file": "conduct/__init__.py",
              "line": 67,
              "function": "_error"
            },
            {
              "file": "conduct/__init__.py",
              "line": 266,
              "function": "_role_guard"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/conduct/records",
          "methods": [
            "POST"
          ],
          "file": "conduct/__init__.py",
          "line": 313,
          "function": "add_record",
          "tables": [
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 339,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 654
                }
              ]
            },
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 181,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 670
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 171,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 654
                }
              ]
            },
            {
              "name": "conduct_settings",
              "file": "conduct/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 684
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "conduct/__init__.py",
              "line": 313,
              "function": "add_record"
            },
            {
              "file": "conduct/__init__.py",
              "line": 258,
              "function": "_payload"
            },
            {
              "file": "conduct/__init__.py",
              "line": 249,
              "function": "can_manage"
            },
            {
              "file": "conduct/__init__.py",
              "line": 190,
              "function": "build_report"
            },
            {
              "file": "app.py",
              "line": 4705,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1146,
              "function": "current_academic_term"
            },
            {
              "file": "conduct/__init__.py",
              "line": 76,
              "function": "grade_of"
            },
            {
              "file": "conduct/__init__.py",
              "line": 71,
              "function": "_semester_key"
            },
            {
              "file": "conduct/__init__.py",
              "line": 179,
              "function": "load_evaluations"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "conduct/__init__.py",
              "line": 169,
              "function": "load_records"
            },
            {
              "file": "conduct/__init__.py",
              "line": 82,
              "function": "load_rules"
            },
            {
              "file": "conduct/__init__.py",
              "line": 67,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "conduct/__init__.py",
              "line": 266,
              "function": "_role_guard"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/conduct/records/<int:record_id>",
          "methods": [
            "DELETE"
          ],
          "file": "conduct/__init__.py",
          "line": 352,
          "function": "delete_record",
          "tables": [
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 356,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 654
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 364,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 654
                }
              ]
            },
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 181,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 670
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 171,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 654
                }
              ]
            },
            {
              "name": "conduct_settings",
              "file": "conduct/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 684
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "conduct/__init__.py",
              "line": 352,
              "function": "delete_record"
            },
            {
              "file": "conduct/__init__.py",
              "line": 258,
              "function": "_payload"
            },
            {
              "file": "conduct/__init__.py",
              "line": 249,
              "function": "can_manage"
            },
            {
              "file": "conduct/__init__.py",
              "line": 190,
              "function": "build_report"
            },
            {
              "file": "app.py",
              "line": 4705,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1146,
              "function": "current_academic_term"
            },
            {
              "file": "conduct/__init__.py",
              "line": 76,
              "function": "grade_of"
            },
            {
              "file": "conduct/__init__.py",
              "line": 71,
              "function": "_semester_key"
            },
            {
              "file": "conduct/__init__.py",
              "line": 179,
              "function": "load_evaluations"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "conduct/__init__.py",
              "line": 169,
              "function": "load_records"
            },
            {
              "file": "conduct/__init__.py",
              "line": 82,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "conduct/__init__.py",
              "line": 67,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "conduct/__init__.py",
              "line": 266,
              "function": "_role_guard"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/conduct/evaluations/<student_id>/<semester>",
          "methods": [
            "PUT"
          ],
          "file": "conduct/__init__.py",
          "line": 370,
          "function": "save_evaluation",
          "tables": [
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 392,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 670
                }
              ]
            },
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 181,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 670
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 171,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 654
                }
              ]
            },
            {
              "name": "conduct_settings",
              "file": "conduct/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 684
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 266,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 271,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 346
                },
                {
                  "file": "init_db.py",
                  "line": 218
                },
                {
                  "file": "init_db.py",
                  "line": 362
                }
              ]
            }
          ],
          "files": [
            {
              "file": "conduct/__init__.py",
              "line": 370,
              "function": "save_evaluation"
            },
            {
              "file": "conduct/__init__.py",
              "line": 258,
              "function": "_payload"
            },
            {
              "file": "conduct/__init__.py",
              "line": 249,
              "function": "can_manage"
            },
            {
              "file": "conduct/__init__.py",
              "line": 190,
              "function": "build_report"
            },
            {
              "file": "app.py",
              "line": 4705,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1146,
              "function": "current_academic_term"
            },
            {
              "file": "conduct/__init__.py",
              "line": 76,
              "function": "grade_of"
            },
            {
              "file": "conduct/__init__.py",
              "line": 71,
              "function": "_semester_key"
            },
            {
              "file": "conduct/__init__.py",
              "line": 179,
              "function": "load_evaluations"
            },
            {
              "file": "app.py",
              "line": 1541,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "conduct/__init__.py",
              "line": 169,
              "function": "load_records"
            },
            {
              "file": "conduct/__init__.py",
              "line": 82,
              "function": "load_rules"
            },
            {
              "file": "conduct/__init__.py",
              "line": 67,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 248,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1557,
              "function": "db_execute"
            },
            {
              "file": "conduct/__init__.py",
              "line": 266,
              "function": "_role_guard"
            }
          ],
          "storage": []
        }
      ],
      "frontend": []
    }
  ],
  "routeCount": 243,
  "schemaCount": 50,
  "schema": {
    "departments": [
      {
        "file": "smart_ukn.sql",
        "line": 53
      },
      {
        "file": "init_db.py",
        "line": 41
      }
    ],
    "students": [
      {
        "file": "smart_ukn.sql",
        "line": 73
      },
      {
        "file": "init_db.py",
        "line": 51
      }
    ],
    "users": [
      {
        "file": "smart_ukn.sql",
        "line": 95
      },
      {
        "file": "init_db.py",
        "line": 66
      }
    ],
    "course_map": [
      {
        "file": "smart_ukn.sql",
        "line": 122
      },
      {
        "file": "init_db.py",
        "line": 84
      }
    ],
    "student_credits": [
      {
        "file": "smart_ukn.sql",
        "line": 153
      },
      {
        "file": "init_db.py",
        "line": 104
      }
    ],
    "certificates": [
      {
        "file": "smart_ukn.sql",
        "line": 183
      },
      {
        "file": "init_db.py",
        "line": 121
      }
    ],
    "competitions": [
      {
        "file": "smart_ukn.sql",
        "line": 221
      }
    ],
    "knowledge_categories": [
      {
        "file": "smart_ukn.sql",
        "line": 244
      },
      {
        "file": "init_db.py",
        "line": 152
      }
    ],
    "knowledge_base": [
      {
        "file": "smart_ukn.sql",
        "line": 262
      },
      {
        "file": "init_db.py",
        "line": 163
      }
    ],
    "synonym_dictionary": [
      {
        "file": "smart_ukn.sql",
        "line": 291
      },
      {
        "file": "init_db.py",
        "line": 182
      }
    ],
    "checklist_items": [
      {
        "file": "smart_ukn.sql",
        "line": 318
      },
      {
        "file": "init_db.py",
        "line": 195
      }
    ],
    "audit_logs": [
      {
        "file": "smart_ukn.sql",
        "line": 346
      },
      {
        "file": "init_db.py",
        "line": 218
      },
      {
        "file": "init_db.py",
        "line": 362
      }
    ],
    "visitor_logs": [
      {
        "file": "smart_ukn.sql",
        "line": 364
      },
      {
        "file": "init_db.py",
        "line": 317
      }
    ],
    "friction_reports": [
      {
        "file": "smart_ukn.sql",
        "line": 384
      }
    ],
    "deadlines": [
      {
        "file": "smart_ukn.sql",
        "line": 402
      },
      {
        "file": "init_db.py",
        "line": 342
      }
    ],
    "scholarship_conditions": [
      {
        "file": "smart_ukn.sql",
        "line": 435
      }
    ],
    "class_groups": [
      {
        "file": "smart_ukn.sql",
        "line": 455
      },
      {
        "file": "init_db.py",
        "line": 764
      }
    ],
    "class_group_members": [
      {
        "file": "smart_ukn.sql",
        "line": 464
      },
      {
        "file": "init_db.py",
        "line": 774
      }
    ],
    "class_notices": [
      {
        "file": "smart_ukn.sql",
        "line": 474
      },
      {
        "file": "init_db.py",
        "line": 785
      }
    ],
    "class_notice_recipients": [
      {
        "file": "smart_ukn.sql",
        "line": 494
      },
      {
        "file": "init_db.py",
        "line": 805
      }
    ],
    "counseling_records": [
      {
        "file": "smart_ukn.sql",
        "line": 506
      },
      {
        "file": "init_db.py",
        "line": 853
      }
    ],
    "dorm_applications": [
      {
        "file": "smart_ukn.sql",
        "line": 531
      }
    ],
    "application_progress": [
      {
        "file": "init_db.py",
        "line": 236
      }
    ],
    "unmatched_queries": [
      {
        "file": "init_db.py",
        "line": 255
      }
    ],
    "search_feedback": [
      {
        "file": "init_db.py",
        "line": 270
      }
    ],
    "student_privacy_settings": [
      {
        "file": "init_db.py",
        "line": 285
      }
    ],
    "graduation_requirements": [
      {
        "file": "init_db.py",
        "line": 299
      }
    ],
    "academic_calendar": [
      {
        "file": "init_db.py",
        "line": 386
      }
    ],
    "search_logs": [
      {
        "file": "init_db.py",
        "line": 407
      }
    ],
    "checklist_progress": [
      {
        "file": "init_db.py",
        "line": 420
      }
    ],
    "attendance_records": [
      {
        "file": "init_db.py",
        "line": 434
      }
    ],
    "class_schedule": [
      {
        "file": "init_db.py",
        "line": 454
      }
    ],
    "announcements": [
      {
        "file": "init_db.py",
        "line": 473
      }
    ],
    "announcement_reads": [
      {
        "file": "init_db.py",
        "line": 486
      }
    ],
    "assignments": [
      {
        "file": "init_db.py",
        "line": 497
      }
    ],
    "assignment_submissions": [
      {
        "file": "init_db.py",
        "line": 512
      }
    ],
    "leave_requests": [
      {
        "file": "init_db.py",
        "line": 523
      }
    ],
    "scholarships": [
      {
        "file": "init_db.py",
        "line": 559
      }
    ],
    "user_preferences": [
      {
        "file": "init_db.py",
        "line": 582
      }
    ],
    "faculty_profiles": [
      {
        "file": "init_db.py",
        "line": 596
      }
    ],
    "self_reviews": [
      {
        "file": "init_db.py",
        "line": 615
      }
    ],
    "online_applications": [
      {
        "file": "init_db.py",
        "line": 633
      }
    ],
    "conduct_records": [
      {
        "file": "init_db.py",
        "line": 654
      }
    ],
    "conduct_evaluations": [
      {
        "file": "init_db.py",
        "line": 670
      }
    ],
    "conduct_settings": [
      {
        "file": "init_db.py",
        "line": 684
      }
    ],
    "anniversary_events": [
      {
        "file": "init_db.py",
        "line": 701
      }
    ],
    "anniversary_wishes": [
      {
        "file": "init_db.py",
        "line": 717
      }
    ],
    "notification_log": [
      {
        "file": "init_db.py",
        "line": 734
      }
    ],
    "advisor_messages": [
      {
        "file": "init_db.py",
        "line": 816
      }
    ],
    "student_records": [
      {
        "file": "init_db.py",
        "line": 886
      }
    ]
  }
};
