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
          "line": 921,
          "function": "auth_login",
          "tables": [
            {
              "name": "users",
              "file": "app.py",
              "line": 936,
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
              "line": 936,
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
              "line": 936,
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
              "line": 921,
              "function": "auth_login"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
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
          "line": 999,
          "function": "auth_logout",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 999,
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
          "line": 1004,
          "function": "auth_me",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 1004,
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
          "line": 1026,
          "function": "register_visitor",
          "tables": [
            {
              "name": "visitor_logs",
              "file": "app.py",
              "line": 1042,
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
              "line": 1026,
              "function": "register_visitor"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/index.html",
          "line": 2126
        },
        {
          "file": "static/login.html",
          "line": 308
        },
        {
          "file": "static/login.html",
          "line": 348
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 104
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 101
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
          "line": 4254,
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
              "line": 4083,
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
              "line": 4237,
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
                  "line": 471
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
                  "line": 484
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
                  "line": 484
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
                  "line": 495
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
                  "line": 510
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
                  "line": 521
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
                  "line": 471
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 4254,
              "function": "get_student_dashboard"
            },
            {
              "file": "app.py",
              "line": 4064,
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
              "line": 4195,
              "function": "moodle_error_message"
            },
            {
              "file": "app.py",
              "line": 4077,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1083,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4082,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4073,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 1923,
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
              "line": 4236,
              "function": "student_class_name"
            },
            {
              "file": "app.py",
              "line": 4204,
              "function": "moodle_status_for"
            },
            {
              "file": "app.py",
              "line": 4184,
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
              "line": 4243,
              "function": "parse_dashboard_now"
            },
            {
              "file": "app.py",
              "line": 1939,
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
          "line": 4293,
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
                  "line": 471
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
                  "line": 484
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
                  "line": 484
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
                  "line": 495
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
                  "line": 510
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
                  "line": 521
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
                  "line": 471
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 4293,
              "function": "mark_announcement_read"
            },
            {
              "file": "app.py",
              "line": 4184,
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
              "line": 196,
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
          "line": 4329,
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
                  "line": 471
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
                  "line": 484
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
                  "line": 484
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
                  "line": 495
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
                  "line": 510
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
                  "line": 521
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
                  "line": 471
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 4329,
              "function": "submit_leave_request"
            },
            {
              "file": "app.py",
              "line": 4184,
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
              "line": 196,
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
          "line": 4362,
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
                  "line": 471
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
                  "line": 484
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
                  "line": 484
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
                  "line": 495
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
                  "line": 510
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
                  "line": 521
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
                  "line": 471
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 4362,
              "function": "cancel_leave_request"
            },
            {
              "file": "app.py",
              "line": 4184,
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
              "line": 196,
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
          "line": 4369,
          "function": "list_leave_requests_for_review",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 4070,
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
                  "line": 471
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
                  "line": 484
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
                  "line": 484
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
                  "line": 495
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
                  "line": 510
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
                  "line": 521
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
                  "line": 471
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2407,
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
              "line": 4369,
              "function": "list_leave_requests_for_review"
            },
            {
              "file": "app.py",
              "line": 4069,
              "function": "list_students"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4184,
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
              "line": 4313,
              "function": "reviewable_student_ids"
            },
            {
              "file": "app.py",
              "line": 2406,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 196,
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
          "line": 4385,
          "function": "review_leave_request",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 2407,
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
                  "line": 471
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
                  "line": 484
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
                  "line": 484
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
                  "line": 495
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
                  "line": 510
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
                  "line": 521
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
                  "line": 471
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
                }
              ]
            }
          ],
          "files": [
            {
              "file": "app.py",
              "line": 4385,
              "function": "review_leave_request"
            },
            {
              "file": "app.py",
              "line": 4319,
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
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 4313,
              "function": "reviewable_student_ids"
            },
            {
              "file": "app.py",
              "line": 2406,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 4184,
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
              "line": 196,
              "function": "role_required"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/index.html",
          "line": 402
        },
        {
          "file": "static/index.html",
          "line": 1939
        },
        {
          "file": "static/index.html",
          "line": 1954
        },
        {
          "file": "static/index.html",
          "line": 1996
        },
        {
          "file": "static/index.html",
          "line": 2012
        },
        {
          "file": "static/index.html",
          "line": 2023
        },
        {
          "file": "static/index.html",
          "line": 2058
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
          "line": 1965,
          "function": "get_all_courses",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 1965,
              "function": "get_all_courses"
            },
            {
              "file": "app.py",
              "line": 1923,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
          "line": 1973,
          "function": "check_courses_prerequisites",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 1931,
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
              "line": 1973,
              "function": "check_courses_prerequisites"
            },
            {
              "file": "app.py",
              "line": 1928,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1947,
              "function": "hide_untaken_demo_courses"
            },
            {
              "file": "app.py",
              "line": 1954,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 1939,
              "function": "current_student_id"
            },
            {
              "file": "app.py",
              "line": 1923,
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
          "line": 2055,
          "function": "get_personalized_courses",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 1931,
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
              "line": 2055,
              "function": "get_personalized_courses"
            },
            {
              "file": "app.py",
              "line": 1954,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 1928,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1923,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1939,
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
          "line": 2155,
          "function": "what_if_course_failed",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 2155,
              "function": "what_if_course_failed"
            },
            {
              "file": "app.py",
              "line": 1923,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/index.html",
          "line": 2306
        },
        {
          "file": "static/index.html",
          "line": 2307
        },
        {
          "file": "static/index.html",
          "line": 3054
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
          "url": "/api/campus/course-plan/offerings",
          "methods": [
            "GET"
          ],
          "file": "campus/courses_ext.py",
          "line": 65,
          "function": "list_offerings",
          "tables": [],
          "files": [
            {
              "file": "campus/courses_ext.py",
              "line": 65,
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
              "line": 1923,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
          "line": 70,
          "function": "check_plan",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 1931,
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
              "line": 70,
              "function": "check_plan"
            },
            {
              "file": "app.py",
              "line": 1923,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
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
              "file": "campus/courses_ext.py",
              "line": 56,
              "function": "student_passed_ids"
            },
            {
              "file": "app.py",
              "line": 1928,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 1954,
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
          "line": 551
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
          "line": 2127,
          "function": "graduation_audit",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 2139,
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
                  "line": 471
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
                  "line": 484
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
                  "line": 484
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
                  "line": 495
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
                  "line": 510
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
                  "line": 521
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
                  "line": 471
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
                }
              ]
            },
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 1931,
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
              "line": 2239,
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
              "line": 2239,
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
              "line": 2127,
              "function": "graduation_audit"
            },
            {
              "file": "app.py",
              "line": 4184,
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
              "line": 1928,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1923,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 3626,
              "function": "teacher_can_view_student"
            },
            {
              "file": "app.py",
              "line": 2238,
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
              "line": 1083,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 2224,
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
          "line": 2357,
          "function": "student_graduation_dashboard",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 1931,
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
              "line": 2270,
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
              "line": 2249,
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
              "line": 2250,
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
              "line": 2250,
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
              "line": 2257,
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
              "line": 2257,
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
              "line": 2239,
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
              "line": 2239,
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
              "line": 2357,
              "function": "student_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 2346,
              "function": "_graduation_target_or_error"
            },
            {
              "file": "app.py",
              "line": 2275,
              "function": "_compute_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 1923,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1928,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2269,
              "function": "_load_dept_requirements"
            },
            {
              "file": "app.py",
              "line": 2247,
              "function": "_load_cohort"
            },
            {
              "file": "app.py",
              "line": 1954,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2238,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 2224,
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
          "line": 2365,
          "function": "export_graduation_dashboard_csv",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 1931,
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
              "line": 2270,
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
              "line": 2249,
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
              "line": 2250,
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
              "line": 2250,
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
              "line": 2257,
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
              "line": 2257,
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
              "line": 2239,
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
              "line": 2239,
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
              "line": 2365,
              "function": "export_graduation_dashboard_csv"
            },
            {
              "file": "app.py",
              "line": 2346,
              "function": "_graduation_target_or_error"
            },
            {
              "file": "app.py",
              "line": 2275,
              "function": "_compute_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 1923,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1928,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2269,
              "function": "_load_dept_requirements"
            },
            {
              "file": "app.py",
              "line": 2247,
              "function": "_load_cohort"
            },
            {
              "file": "app.py",
              "line": 1954,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2238,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 2224,
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
          "line": 2414,
          "function": "teacher_class_summary",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 1931,
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
              "line": 2270,
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
              "line": 2249,
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
              "line": 2250,
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
              "line": 2250,
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
              "line": 2257,
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
              "line": 2257,
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
              "line": 2239,
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
              "line": 2239,
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
              "line": 2407,
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
              "line": 2414,
              "function": "teacher_class_summary"
            },
            {
              "file": "app.py",
              "line": 2275,
              "function": "_compute_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 1923,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1928,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2269,
              "function": "_load_dept_requirements"
            },
            {
              "file": "app.py",
              "line": 2247,
              "function": "_load_cohort"
            },
            {
              "file": "app.py",
              "line": 1954,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2238,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 2406,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 196,
              "function": "role_required"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/index.html",
          "line": 738
        },
        {
          "file": "static/index.html",
          "line": 2983
        },
        {
          "file": "static/index.html",
          "line": 3318
        },
        {
          "file": "static/index.html",
          "line": 3346
        },
        {
          "file": "static/index.html",
          "line": 3520
        },
        {
          "file": "static/index.html",
          "line": 3611
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
          "line": 2448,
          "function": "teacher_class_attendance",
          "tables": [
            {
              "name": "course_map",
              "file": "app.py",
              "line": 4083,
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
                  "line": 471
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
                  "line": 484
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
                  "line": 484
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
                  "line": 495
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
                  "line": 510
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
                  "line": 521
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
                  "line": 471
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 4070,
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
              "line": 2441,
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
              "line": 2407,
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
              "line": 2448,
              "function": "teacher_class_attendance"
            },
            {
              "file": "app.py",
              "line": 4077,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1083,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4082,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4184,
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
              "line": 4069,
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
              "line": 2440,
              "function": "_list_class_names"
            },
            {
              "file": "app.py",
              "line": 2406,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 4064,
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
              "line": 4073,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 1923,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 196,
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
          "line": 4088,
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
              "line": 4083,
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
              "line": 4088,
              "function": "get_my_attendance"
            },
            {
              "file": "app.py",
              "line": 4064,
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
              "line": 4077,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1083,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4082,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4073,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 1923,
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
              "line": 1939,
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
          "line": 4104,
          "function": "manage_attendance_records",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 4070,
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
              "line": 255,
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
              "line": 260,
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
              "line": 4104,
              "function": "manage_attendance_records"
            },
            {
              "file": "app.py",
              "line": 4073,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 1923,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
              "line": 4069,
              "function": "list_students"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 4064,
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
              "line": 196,
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
          "line": 4157,
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
              "line": 4157,
              "function": "notify_attendance_now"
            },
            {
              "file": "app.py",
              "line": 4064,
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
              "line": 196,
              "function": "role_required"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 2077
        },
        {
          "file": "static/admin.html",
          "line": 2120
        },
        {
          "file": "static/admin.html",
          "line": 2146
        },
        {
          "file": "static/index.html",
          "line": 535
        },
        {
          "file": "static/index.html",
          "line": 2081
        },
        {
          "file": "static/js/campus-features.js",
          "line": 843
        },
        {
          "file": "static/js/campus-features.js",
          "line": 857
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
          "line": 2506,
          "function": "teacher_class_overview",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 1931,
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
              "line": 2802,
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
              "line": 4083,
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
              "line": 4070,
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
              "line": 2441,
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
              "line": 2407,
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
              "line": 2506,
              "function": "teacher_class_overview"
            },
            {
              "file": "app.py",
              "line": 2883,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 1923,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1954,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 1928,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2799,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 4077,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1083,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4082,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 4069,
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
              "line": 2440,
              "function": "_list_class_names"
            },
            {
              "file": "app.py",
              "line": 4064,
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
              "line": 4073,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 2406,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 196,
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
          "line": 2575,
          "function": "teacher_student_profile",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 2567,
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
                  "line": 471
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
                  "line": 484
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
                  "line": 484
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
                  "line": 495
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
                  "line": 510
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
                  "line": 521
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
                  "line": 471
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
              "line": 1931,
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
              "line": 2802,
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
              "line": 4083,
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
              "line": 2270,
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
              "line": 2249,
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
              "line": 2250,
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
              "line": 2250,
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
              "line": 2257,
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
              "line": 2257,
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
              "line": 2239,
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
              "line": 2239,
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
              "line": 2575,
              "function": "teacher_student_profile"
            },
            {
              "file": "app.py",
              "line": 2566,
              "function": "_student_parent_phone"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4184,
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
              "line": 4064,
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
              "line": 2883,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 1923,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1954,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 1928,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2799,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 4077,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1083,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4082,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 4073,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 2275,
              "function": "_compute_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 2269,
              "function": "_load_dept_requirements"
            },
            {
              "file": "app.py",
              "line": 2247,
              "function": "_load_cohort"
            },
            {
              "file": "app.py",
              "line": 2238,
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
              "line": 196,
              "function": "role_required"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/js/campus-features.js",
          "line": 1123
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1135
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1251
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1262
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1367
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
                  "line": 762
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
                  "line": 762
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
              "line": 255,
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
              "line": 260,
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
                  "line": 762
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
                  "line": 762
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
                  "line": 762
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
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/counseling.py",
              "line": 36,
              "function": "use_db"
            },
            {
              "file": "app.py",
              "line": 1494,
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
              "line": 255,
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
              "line": 260,
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
                  "line": 762
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
                  "line": 762
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
                  "line": 762
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
                  "line": 762
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
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "campus/counseling.py",
              "line": 102,
              "function": "delete_record"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "campus/counseling.py",
              "line": 36,
              "function": "use_db"
            },
            {
              "file": "app.py",
              "line": 1478,
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
                  "line": 762
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
                  "line": 762
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/counseling.py",
              "line": 36,
              "function": "use_db"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
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
          "line": 959
        },
        {
          "file": "static/js/campus-features.js",
          "line": 980
        },
        {
          "file": "static/js/campus-features.js",
          "line": 992
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1100
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1102
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1112
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1118
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1368
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
          "line": 2942,
          "function": "get_student_early_warning",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 1931,
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
              "line": 2239,
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
              "line": 2239,
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
              "line": 2878,
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
              "line": 2802,
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
              "line": 2942,
              "function": "get_student_early_warning"
            },
            {
              "file": "app.py",
              "line": 2883,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 1923,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1954,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 1928,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2238,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 2876,
              "function": "find_class_advisor"
            },
            {
              "file": "app.py",
              "line": 2799,
              "function": "load_privacy_settings"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/index.html",
          "line": 3565
        },
        {
          "file": "static/index.html",
          "line": 3584
        },
        {
          "file": "static/index.html",
          "line": 3589
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
          "line": 3639,
          "function": "manage_certificates",
          "tables": [
            {
              "name": "certificates",
              "file": "app.py",
              "line": 3724,
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
              "line": 3668,
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
              "line": 3734,
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
              "line": 2239,
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
              "line": 2239,
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
              "line": 3639,
              "function": "manage_certificates"
            },
            {
              "file": "app.py",
              "line": 3626,
              "function": "teacher_can_view_student"
            },
            {
              "file": "app.py",
              "line": 2238,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3632,
              "function": "portfolio_row_dates"
            },
            {
              "file": "app.py",
              "line": 3304,
              "function": "_date_str"
            },
            {
              "file": "app.py",
              "line": 102,
              "function": "save_uploaded_file"
            },
            {
              "file": "app.py",
              "line": 99,
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
          "line": 3767,
          "function": "delete_certificate",
          "tables": [
            {
              "name": "certificates",
              "file": "app.py",
              "line": 3779,
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
              "line": 3787,
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
              "line": 3767,
              "function": "delete_certificate"
            },
            {
              "file": "app.py",
              "line": 154,
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
          "line": 3811,
          "function": "manage_competitions",
          "tables": [
            {
              "name": "competitions",
              "file": "app.py",
              "line": 3880,
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
              "line": 3840,
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
              "line": 2239,
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
              "line": 2239,
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
              "line": 3811,
              "function": "manage_competitions"
            },
            {
              "file": "app.py",
              "line": 3626,
              "function": "teacher_can_view_student"
            },
            {
              "file": "app.py",
              "line": 2238,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3632,
              "function": "portfolio_row_dates"
            },
            {
              "file": "app.py",
              "line": 3304,
              "function": "_date_str"
            },
            {
              "file": "app.py",
              "line": 102,
              "function": "save_uploaded_file"
            },
            {
              "file": "app.py",
              "line": 99,
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
          "line": 3914,
          "function": "delete_competition",
          "tables": [
            {
              "name": "competitions",
              "file": "app.py",
              "line": 3926,
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
              "line": 3934,
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
              "line": 3914,
              "function": "delete_competition"
            },
            {
              "file": "app.py",
              "line": 154,
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
          "line": 211,
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
              "line": 211,
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
              "line": 1494,
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
          "line": 220,
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
              "line": 220,
              "function": "create_cert"
            },
            {
              "file": "app.py",
              "line": 102,
              "function": "save_uploaded_file"
            },
            {
              "file": "app.py",
              "line": 99,
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
              "line": 1494,
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
          "line": 255,
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
              "line": 255,
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
              "line": 1494,
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
          "line": 268,
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
              "line": 268,
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
              "line": 1494,
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
          "line": 278,
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
              "line": 255,
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
              "line": 260,
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
              "line": 278,
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
              "line": 1494,
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
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
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
          "line": 302,
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
              "line": 302,
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
              "line": 1494,
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
          "line": 309,
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
              "line": 309,
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
              "line": 1494,
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
          "line": 657
        },
        {
          "file": "static/js/campus-features.js",
          "line": 699
        },
        {
          "file": "static/js/campus-features.js",
          "line": 718
        },
        {
          "file": "static/js/campus-features.js",
          "line": 730
        },
        {
          "file": "static/js/campus-features.js",
          "line": 737
        },
        {
          "file": "static/js/campus-features.js",
          "line": 763
        },
        {
          "file": "static/js/campus-features.js",
          "line": 773
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 536
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
                  "line": 613
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
                  "line": 613
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
                  "line": 613
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
                  "line": 613
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1494,
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
          "line": 159,
          "function": "teachers",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 88,
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
              "line": 159,
              "function": "teachers"
            },
            {
              "file": "campus/facilities.py",
              "line": 137,
              "function": "teacher_status"
            },
            {
              "file": "campus/facilities.py",
              "line": 92,
              "function": "period_at"
            },
            {
              "file": "campus/facilities.py",
              "line": 87,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/facilities.py",
              "line": 78,
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
                  "line": 594
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 88,
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "faculty/__init__.py",
              "line": 79,
              "function": "_decorate"
            },
            {
              "file": "campus/facilities.py",
              "line": 137,
              "function": "teacher_status"
            },
            {
              "file": "campus/facilities.py",
              "line": 92,
              "function": "period_at"
            },
            {
              "file": "campus/facilities.py",
              "line": 87,
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
                  "line": 594
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
                  "line": 594
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
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
          "line": 212,
          "function": "admin_faculty",
          "tables": [
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 227,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 594
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
                  "line": 594
                }
              ]
            }
          ],
          "files": [
            {
              "file": "faculty/__init__.py",
              "line": 212,
              "function": "admin_faculty"
            },
            {
              "file": "faculty/__init__.py",
              "line": 66,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1494,
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "faculty/__init__.py",
              "line": 203,
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
          "line": 239,
          "function": "admin_faculty_item",
          "tables": [
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 249,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 594
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
                  "line": 594
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
                  "line": 594
                }
              ]
            }
          ],
          "files": [
            {
              "file": "faculty/__init__.py",
              "line": 239,
              "function": "admin_faculty_item"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "faculty/__init__.py",
              "line": 66,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "faculty/__init__.py",
              "line": 203,
              "function": "_require_admin"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 1223
        },
        {
          "file": "static/admin.html",
          "line": 1289
        },
        {
          "file": "static/admin.html",
          "line": 1300
        },
        {
          "file": "static/js/campus-features.js",
          "line": 796
        },
        {
          "file": "static/js/campus-features.js",
          "line": 802
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1365
        },
        {
          "file": "static/js/campus-life.js",
          "line": 483
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
              "line": 1513,
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
              "line": 3050,
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
              "line": 3111,
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
              "line": 3111,
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
              "line": 2681,
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
              "line": 1464,
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
              "line": 1509,
              "function": "record_unmatched_query"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3048,
              "function": "load_synonyms"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 3108,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 2679,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1458,
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
          "line": 1548,
          "function": "search_knowledge",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 1562,
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
              "line": 1566,
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
              "line": 1566,
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
              "line": 1464,
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
              "line": 1513,
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
              "line": 2681,
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
              "line": 1548,
              "function": "search_knowledge"
            },
            {
              "file": "app.py",
              "line": 175,
              "function": "format_updated_at"
            },
            {
              "file": "app.py",
              "line": 1458,
              "function": "log_search"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1509,
              "function": "record_unmatched_query"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 2679,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1478,
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
          "line": 1656,
          "function": "submit_search_feedback",
          "tables": [
            {
              "name": "search_feedback",
              "file": "app.py",
              "line": 1679,
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
              "line": 1656,
              "function": "submit_search_feedback"
            },
            {
              "file": "app.py",
              "line": 154,
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
          "line": 1656,
          "function": "submit_search_feedback",
          "tables": [
            {
              "name": "search_feedback",
              "file": "app.py",
              "line": 1679,
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
              "line": 1656,
              "function": "submit_search_feedback"
            },
            {
              "file": "app.py",
              "line": 154,
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
          "line": 3000,
          "function": "get_categories",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 3000,
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
          "line": 3070,
          "function": "manage_synonyms",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 3050,
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
              "line": 3057,
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
              "line": 255,
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
              "line": 260,
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
              "line": 3070,
              "function": "manage_synonyms"
            },
            {
              "file": "app.py",
              "line": 3048,
              "function": "load_synonyms"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3053,
              "function": "add_synonym"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 209,
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
          "line": 3090,
          "function": "delete_synonym",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 3096,
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
              "line": 3050,
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
              "line": 255,
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
              "line": 260,
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
              "line": 3090,
              "function": "delete_synonym"
            },
            {
              "file": "app.py",
              "line": 3048,
              "function": "load_synonyms"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 196,
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
          "line": 3145,
          "function": "manage_rules",
          "tables": [
            {
              "name": "knowledge_base",
              "file": "app.py",
              "line": 3156,
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
              "line": 3111,
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
              "line": 3111,
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
              "line": 255,
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
              "line": 260,
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
              "line": 3145,
              "function": "manage_rules"
            },
            {
              "file": "app.py",
              "line": 3108,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 3115,
              "function": "parse_rule_payload"
            },
            {
              "file": "app.py",
              "line": 209,
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
          "line": 3172,
          "function": "update_or_delete_rule",
          "tables": [
            {
              "name": "knowledge_base",
              "file": "app.py",
              "line": 3181,
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
              "line": 3194,
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
              "line": 3111,
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
              "line": 3111,
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
              "line": 255,
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
              "line": 260,
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
              "line": 3172,
              "function": "update_or_delete_rule"
            },
            {
              "file": "app.py",
              "line": 3108,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 3115,
              "function": "parse_rule_payload"
            },
            {
              "file": "app.py",
              "line": 196,
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 1091
        },
        {
          "file": "static/admin.html",
          "line": 1120
        },
        {
          "file": "static/admin.html",
          "line": 1716
        },
        {
          "file": "static/admin.html",
          "line": 1758
        },
        {
          "file": "static/admin.html",
          "line": 1772
        },
        {
          "file": "static/admin.html",
          "line": 1783
        },
        {
          "file": "static/index.html",
          "line": 2183
        },
        {
          "file": "static/index.html",
          "line": 2207
        },
        {
          "file": "static/index.html",
          "line": 2280
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
          "line": 65
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
          "line": 2726,
          "function": "manage_checklist_progress",
          "tables": [
            {
              "name": "checklist_progress",
              "file": "app.py",
              "line": 2693,
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
              "line": 2681,
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
              "line": 2708,
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
              "line": 2726,
              "function": "manage_checklist_progress"
            },
            {
              "file": "app.py",
              "line": 2690,
              "function": "load_checklist_progress"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2679,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 2703,
              "function": "save_checklist_step"
            },
            {
              "file": "app.py",
              "line": 1939,
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
          "line": 2761,
          "function": "get_my_applications",
          "tables": [
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2681,
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
              "line": 2693,
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
              "line": 2761,
              "function": "get_my_applications"
            },
            {
              "file": "app.py",
              "line": 2679,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2690,
              "function": "load_checklist_progress"
            },
            {
              "file": "app.py",
              "line": 1939,
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
          "line": 3005,
          "function": "manage_checklists",
          "tables": [
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 3031,
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
              "line": 2681,
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
              "line": 255,
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
              "line": 260,
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
              "line": 3005,
              "function": "manage_checklists"
            },
            {
              "file": "app.py",
              "line": 2679,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 209,
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
          "line": 1146
        },
        {
          "file": "static/index.html",
          "line": 526
        },
        {
          "file": "static/index.html",
          "line": 3106
        },
        {
          "file": "static/index.html",
          "line": 3110
        },
        {
          "file": "static/index.html",
          "line": 3112
        },
        {
          "file": "static/index.html",
          "line": 3212
        },
        {
          "file": "static/index.html",
          "line": 3250
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
          "line": 1139,
          "function": "get_current_week",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 1139,
              "function": "get_current_week"
            },
            {
              "file": "app.py",
              "line": 1111,
              "function": "calendar_highlights"
            },
            {
              "file": "app.py",
              "line": 1083,
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
          "line": 1213,
          "function": "manage_deadlines",
          "tables": [
            {
              "name": "deadlines",
              "file": "app.py",
              "line": 1222,
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
              "line": 1262,
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
              "line": 255,
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
              "line": 260,
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
              "line": 1213,
              "function": "manage_deadlines"
            },
            {
              "file": "app.py",
              "line": 1165,
              "function": "_compute_deadline_status"
            },
            {
              "file": "app.py",
              "line": 1157,
              "function": "_deadline_visible_to_role"
            },
            {
              "file": "app.py",
              "line": 1203,
              "function": "normalize_deadline_row"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 209,
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
          "line": 1338,
          "function": "get_calendar_now",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1295,
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
              "line": 1299,
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
              "line": 1338,
              "function": "get_calendar_now"
            },
            {
              "file": "app.py",
              "line": 1288,
              "function": "fetch_calendar_events"
            },
            {
              "file": "app.py",
              "line": 1280,
              "function": "normalize_calendar_row"
            },
            {
              "file": "app.py",
              "line": 154,
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
          "line": 1366,
          "function": "manage_academic_calendar",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1380,
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
              "line": 1295,
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
              "line": 1299,
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
              "line": 255,
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
              "line": 260,
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
              "line": 1366,
              "function": "manage_academic_calendar"
            },
            {
              "file": "app.py",
              "line": 1288,
              "function": "fetch_calendar_events"
            },
            {
              "file": "app.py",
              "line": 1280,
              "function": "normalize_calendar_row"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1308,
              "function": "parse_calendar_payload"
            },
            {
              "file": "app.py",
              "line": 209,
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
          "line": 1400,
          "function": "update_or_delete_academic_calendar",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1412,
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
              "line": 1426,
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
              "line": 1418,
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
              "line": 1421,
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
              "line": 255,
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
              "line": 260,
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
              "line": 1400,
              "function": "update_or_delete_academic_calendar"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1280,
              "function": "normalize_calendar_row"
            },
            {
              "file": "app.py",
              "line": 1308,
              "function": "parse_calendar_payload"
            },
            {
              "file": "app.py",
              "line": 196,
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
          "line": 3984,
          "function": "get_school_calendar",
          "tables": [
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2681,
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
              "line": 3984,
              "function": "get_school_calendar"
            },
            {
              "file": "app.py",
              "line": 3214,
              "function": "load_quick_links"
            },
            {
              "file": "app.py",
              "line": 3956,
              "function": "_calendar_event_detail"
            },
            {
              "file": "school_calendar/actions.py",
              "line": 44,
              "function": "match_actions"
            },
            {
              "file": "app.py",
              "line": 2679,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
          "line": 4007,
          "function": "sync_school_calendar",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 4007,
              "function": "sync_school_calendar"
            },
            {
              "file": "app.py",
              "line": 196,
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
          "line": 129,
          "function": "sync_ukn_calendar",
          "tables": [],
          "files": [
            {
              "file": "campus/calendar_ext.py",
              "line": 129,
              "function": "sync_ukn_calendar"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 119,
              "function": "guess_category"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 79,
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
          "line": 321,
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
                  "line": 471
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
                  "line": 484
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
                  "line": 484
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
                  "line": 495
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
                  "line": 510
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
                  "line": 521
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
                  "line": 471
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 244,
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
              "line": 218,
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
              "line": 233,
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
              "line": 205,
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
              "line": 1295,
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
              "line": 1299,
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
              "line": 146,
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
              "line": 321,
              "function": "calendar_month"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 168,
              "function": "match_checklist"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 160,
              "function": "_core_words"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 179,
              "function": "checklist_detail"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 46,
              "function": "load_holidays"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 42,
              "function": "_iso"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 198,
              "function": "_to_date"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 279,
              "function": "_role_allowed"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 119,
              "function": "guess_category"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 290,
              "function": "staff_events"
            },
            {
              "file": "app.py",
              "line": 4184,
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
              "line": 239,
              "function": "list_my_events"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 217,
              "function": "_events_db"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 231,
              "function": "_insert_event"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 204,
              "function": "load_deadlines"
            },
            {
              "file": "app.py",
              "line": 1288,
              "function": "fetch_calendar_events"
            },
            {
              "file": "app.py",
              "line": 1280,
              "function": "normalize_calendar_row"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 145,
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
          "line": 406,
          "function": "add_my_event",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 244,
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
              "line": 218,
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
              "line": 233,
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
              "line": 406,
              "function": "add_my_event"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 239,
              "function": "list_my_events"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 217,
              "function": "_events_db"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 231,
              "function": "_insert_event"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 198,
              "function": "_to_date"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 251,
              "function": "add_event"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 209,
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
          "line": 429,
          "function": "delete_my_event",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 267,
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
              "line": 265,
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
              "line": 218,
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
              "line": 233,
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
              "line": 429,
              "function": "delete_my_event"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 262,
              "function": "remove_event"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 209,
              "function": "my_events_bucket"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 217,
              "function": "_events_db"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 231,
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
          "line": 915
        },
        {
          "file": "static/admin.html",
          "line": 1172
        },
        {
          "file": "static/admin.html",
          "line": 1897
        },
        {
          "file": "static/admin.html",
          "line": 1913
        },
        {
          "file": "static/admin.html",
          "line": 1927
        },
        {
          "file": "static/admin.html",
          "line": 1993
        },
        {
          "file": "static/admin.html",
          "line": 2013
        },
        {
          "file": "static/index.html",
          "line": 514
        },
        {
          "file": "static/index.html",
          "line": 1140
        },
        {
          "file": "static/index.html",
          "line": 1768
        },
        {
          "file": "static/index.html",
          "line": 2163
        },
        {
          "file": "static/index.html",
          "line": 2517
        },
        {
          "file": "static/index.html",
          "line": 2554
        },
        {
          "file": "static/index.html",
          "line": 3707
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
          "line": 424
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 467
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
          "line": 3456,
          "function": "match_scholarships",
          "tables": [
            {
              "name": "scholarships",
              "file": "app.py",
              "line": 3308,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 557
                }
              ]
            },
            {
              "name": "departments",
              "file": "app.py",
              "line": 3346,
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
              "line": 3337,
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
              "line": 3316,
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
              "line": 3456,
              "function": "match_scholarships"
            },
            {
              "file": "app.py",
              "line": 3301,
              "function": "_split_list"
            },
            {
              "file": "app.py",
              "line": 3387,
              "function": "evaluate_scholarship"
            },
            {
              "file": "app.py",
              "line": 3384,
              "function": "_fmt"
            },
            {
              "file": "app.py",
              "line": 3307,
              "function": "load_scholarships"
            },
            {
              "file": "app.py",
              "line": 3297,
              "function": "_num"
            },
            {
              "file": "app.py",
              "line": 3304,
              "function": "_date_str"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3345,
              "function": "department_names"
            },
            {
              "file": "app.py",
              "line": 3335,
              "function": "latest_semester_fails"
            },
            {
              "file": "app.py",
              "line": 3314,
              "function": "load_scholarship_profile"
            },
            {
              "file": "app.py",
              "line": 1083,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 1939,
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
          "line": 3559,
          "function": "notify_scholarship_and_warning",
          "tables": [
            {
              "name": "notification_log",
              "file": "app.py",
              "line": 3520,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 663
                }
              ]
            },
            {
              "name": "notification_log",
              "file": "app.py",
              "line": 3529,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 663
                }
              ]
            },
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 3337,
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
              "line": 1931,
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
              "line": 3316,
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
              "line": 3512,
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
              "line": 2802,
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
              "line": 4070,
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
              "line": 3308,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 557
                }
              ]
            },
            {
              "name": "departments",
              "file": "app.py",
              "line": 3346,
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
              "line": 3559,
              "function": "notify_scholarship_and_warning"
            },
            {
              "file": "app.py",
              "line": 3387,
              "function": "evaluate_scholarship"
            },
            {
              "file": "app.py",
              "line": 3384,
              "function": "_fmt"
            },
            {
              "file": "app.py",
              "line": 3301,
              "function": "_split_list"
            },
            {
              "file": "attendance/notify.py",
              "line": 27,
              "function": "campus_email"
            },
            {
              "file": "app.py",
              "line": 3544,
              "function": "_notify_once"
            },
            {
              "file": "app.py",
              "line": 3518,
              "function": "already_notified"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3527,
              "function": "mark_notified"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 3535,
              "function": "_send_once"
            },
            {
              "file": "app.py",
              "line": 3335,
              "function": "latest_semester_fails"
            },
            {
              "file": "app.py",
              "line": 2883,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 1923,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1954,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 1928,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 3314,
              "function": "load_scholarship_profile"
            },
            {
              "file": "app.py",
              "line": 1083,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 3297,
              "function": "_num"
            },
            {
              "file": "app.py",
              "line": 3510,
              "function": "find_parent_account"
            },
            {
              "file": "app.py",
              "line": 2799,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 4069,
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
              "line": 3307,
              "function": "load_scholarships"
            },
            {
              "file": "app.py",
              "line": 3304,
              "function": "_date_str"
            },
            {
              "file": "app.py",
              "line": 3345,
              "function": "department_names"
            },
            {
              "file": "app.py",
              "line": 196,
              "function": "role_required"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 2166
        },
        {
          "file": "static/index.html",
          "line": 1255
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
          "url": "/api/campus/dorm/mine",
          "methods": [
            "GET"
          ],
          "file": "campus/services.py",
          "line": 136,
          "function": "dorm_mine",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 136,
              "function": "dorm_mine"
            },
            {
              "file": "campus/services.py",
              "line": 130,
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
          "line": 146,
          "function": "dorm_apply",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 146,
              "function": "dorm_apply"
            },
            {
              "file": "campus/services.py",
              "line": 130,
              "function": "dorm_apps"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
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
          "line": 182,
          "function": "dorm_all",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 182,
              "function": "dorm_all"
            },
            {
              "file": "campus/services.py",
              "line": 130,
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
          "line": 189,
          "function": "dorm_update",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 189,
              "function": "dorm_update"
            },
            {
              "file": "campus/services.py",
              "line": 130,
              "function": "dorm_apps"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/js/campus-life.js",
          "line": 116
        },
        {
          "file": "static/js/campus-life.js",
          "line": 155
        },
        {
          "file": "static/js/campus-life.js",
          "line": 162
        },
        {
          "file": "static/js/campus-life.js",
          "line": 181
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
          "line": 66,
          "function": "list_categories",
          "tables": [],
          "files": [
            {
              "file": "campus/reports.py",
              "line": 66,
              "function": "list_categories"
            },
            {
              "file": "campus/reports.py",
              "line": 27,
              "function": "files"
            }
          ],
          "storage": [
            "data/campus_store.json → report_files"
          ]
        },
        {
          "url": "/api/campus/reports",
          "methods": [
            "GET"
          ],
          "file": "campus/reports.py",
          "line": 72,
          "function": "list_files",
          "tables": [],
          "files": [
            {
              "file": "campus/reports.py",
              "line": 72,
              "function": "list_files"
            },
            {
              "file": "campus/reports.py",
              "line": 54,
              "function": "_public_file"
            },
            {
              "file": "campus/reports.py",
              "line": 50,
              "function": "_is_favorited"
            },
            {
              "file": "campus/reports.py",
              "line": 39,
              "function": "favorites"
            },
            {
              "file": "campus/reports.py",
              "line": 43,
              "function": "_can_access"
            },
            {
              "file": "campus/reports.py",
              "line": 27,
              "function": "files"
            }
          ],
          "storage": [
            "data/campus_store.json → report_favorites",
            "data/campus_store.json → report_files"
          ]
        },
        {
          "url": "/api/campus/reports/my/favorites",
          "methods": [
            "GET"
          ],
          "file": "campus/reports.py",
          "line": 85,
          "function": "my_favorites",
          "tables": [],
          "files": [
            {
              "file": "campus/reports.py",
              "line": 85,
              "function": "my_favorites"
            },
            {
              "file": "campus/reports.py",
              "line": 54,
              "function": "_public_file"
            },
            {
              "file": "campus/reports.py",
              "line": 50,
              "function": "_is_favorited"
            },
            {
              "file": "campus/reports.py",
              "line": 39,
              "function": "favorites"
            },
            {
              "file": "campus/reports.py",
              "line": 43,
              "function": "_can_access"
            },
            {
              "file": "campus/reports.py",
              "line": 27,
              "function": "files"
            }
          ],
          "storage": [
            "data/campus_store.json → report_favorites",
            "data/campus_store.json → report_files"
          ]
        },
        {
          "url": "/api/campus/reports/<int:file_id>",
          "methods": [
            "GET"
          ],
          "file": "campus/reports.py",
          "line": 95,
          "function": "get_file",
          "tables": [],
          "files": [
            {
              "file": "campus/reports.py",
              "line": 95,
              "function": "get_file"
            },
            {
              "file": "campus/reports.py",
              "line": 31,
              "function": "view_logs"
            },
            {
              "file": "campus/reports.py",
              "line": 27,
              "function": "files"
            },
            {
              "file": "campus/reports.py",
              "line": 54,
              "function": "_public_file"
            },
            {
              "file": "campus/reports.py",
              "line": 50,
              "function": "_is_favorited"
            },
            {
              "file": "campus/reports.py",
              "line": 39,
              "function": "favorites"
            },
            {
              "file": "campus/reports.py",
              "line": 43,
              "function": "_can_access"
            }
          ],
          "storage": [
            "data/campus_store.json → report_favorites",
            "data/campus_store.json → report_files",
            "data/campus_store.json → report_view_logs"
          ]
        },
        {
          "url": "/api/campus/reports",
          "methods": [
            "POST"
          ],
          "file": "campus/reports.py",
          "line": 110,
          "function": "upload_file",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 110,
              "function": "upload_file"
            },
            {
              "file": "campus/reports.py",
              "line": 27,
              "function": "files"
            },
            {
              "file": "campus/reports.py",
              "line": 54,
              "function": "_public_file"
            },
            {
              "file": "campus/reports.py",
              "line": 50,
              "function": "_is_favorited"
            },
            {
              "file": "campus/reports.py",
              "line": 39,
              "function": "favorites"
            },
            {
              "file": "campus/reports.py",
              "line": 237,
              "function": "notify_category_watchers"
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
              "file": "campus/reports.py",
              "line": 35,
              "function": "download_logs"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 102,
              "function": "save_uploaded_file"
            },
            {
              "file": "app.py",
              "line": 99,
              "function": "allowed_file"
            }
          ],
          "storage": [
            "data/campus_store.json → report_download_logs",
            "data/campus_store.json → report_favorites",
            "data/campus_store.json → report_files"
          ]
        },
        {
          "url": "/api/campus/reports/<int:file_id>",
          "methods": [
            "DELETE"
          ],
          "file": "campus/reports.py",
          "line": 146,
          "function": "delete_file",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 146,
              "function": "delete_file"
            },
            {
              "file": "campus/reports.py",
              "line": 27,
              "function": "files"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            }
          ],
          "storage": [
            "data/campus_store.json → report_files"
          ]
        },
        {
          "url": "/api/campus/reports/<int:file_id>/download",
          "methods": [
            "GET"
          ],
          "file": "campus/reports.py",
          "line": 158,
          "function": "download_file",
          "tables": [],
          "files": [
            {
              "file": "campus/reports.py",
              "line": 158,
              "function": "download_file"
            },
            {
              "file": "campus/reports.py",
              "line": 35,
              "function": "download_logs"
            },
            {
              "file": "campus/reports.py",
              "line": 27,
              "function": "files"
            },
            {
              "file": "campus/reports.py",
              "line": 43,
              "function": "_can_access"
            }
          ],
          "storage": [
            "data/campus_store.json → report_download_logs",
            "data/campus_store.json → report_files"
          ]
        },
        {
          "url": "/api/campus/reports/<int:file_id>/favorite",
          "methods": [
            "POST"
          ],
          "file": "campus/reports.py",
          "line": 186,
          "function": "add_favorite",
          "tables": [],
          "files": [
            {
              "file": "campus/reports.py",
              "line": 186,
              "function": "add_favorite"
            },
            {
              "file": "campus/reports.py",
              "line": 39,
              "function": "favorites"
            },
            {
              "file": "campus/reports.py",
              "line": 27,
              "function": "files"
            },
            {
              "file": "campus/reports.py",
              "line": 50,
              "function": "_is_favorited"
            },
            {
              "file": "campus/reports.py",
              "line": 43,
              "function": "_can_access"
            }
          ],
          "storage": [
            "data/campus_store.json → report_favorites",
            "data/campus_store.json → report_files"
          ]
        },
        {
          "url": "/api/campus/reports/<int:file_id>/favorite",
          "methods": [
            "DELETE"
          ],
          "file": "campus/reports.py",
          "line": 202,
          "function": "remove_favorite",
          "tables": [],
          "files": [
            {
              "file": "campus/reports.py",
              "line": 202,
              "function": "remove_favorite"
            },
            {
              "file": "campus/reports.py",
              "line": 39,
              "function": "favorites"
            }
          ],
          "storage": [
            "data/campus_store.json → report_favorites"
          ]
        },
        {
          "url": "/api/campus/reports/<int:file_id>/stats",
          "methods": [
            "GET"
          ],
          "file": "campus/reports.py",
          "line": 214,
          "function": "file_stats",
          "tables": [],
          "files": [
            {
              "file": "campus/reports.py",
              "line": 214,
              "function": "file_stats"
            },
            {
              "file": "campus/reports.py",
              "line": 39,
              "function": "favorites"
            },
            {
              "file": "campus/reports.py",
              "line": 54,
              "function": "_public_file"
            },
            {
              "file": "campus/reports.py",
              "line": 50,
              "function": "_is_favorited"
            },
            {
              "file": "campus/reports.py",
              "line": 27,
              "function": "files"
            },
            {
              "file": "campus/reports.py",
              "line": 31,
              "function": "view_logs"
            },
            {
              "file": "campus/reports.py",
              "line": 35,
              "function": "download_logs"
            }
          ],
          "storage": [
            "data/campus_store.json → report_download_logs",
            "data/campus_store.json → report_favorites",
            "data/campus_store.json → report_files",
            "data/campus_store.json → report_view_logs"
          ]
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
          "line": 182,
          "function": "rooms_availability",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 88,
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
              "line": 182,
              "function": "rooms_availability"
            },
            {
              "file": "campus/facilities.py",
              "line": 100,
              "function": "room_code"
            },
            {
              "file": "campus/facilities.py",
              "line": 177,
              "function": "bookings"
            },
            {
              "file": "campus/facilities.py",
              "line": 87,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            }
          ],
          "storage": [
            "data/campus_store.json → room_bookings"
          ]
        },
        {
          "url": "/api/campus/rooms/book",
          "methods": [
            "POST"
          ],
          "file": "campus/facilities.py",
          "line": 211,
          "function": "book_room",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 88,
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
              "line": 211,
              "function": "book_room"
            },
            {
              "file": "campus/facilities.py",
              "line": 100,
              "function": "room_code"
            },
            {
              "file": "campus/facilities.py",
              "line": 177,
              "function": "bookings"
            },
            {
              "file": "campus/facilities.py",
              "line": 87,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            }
          ],
          "storage": [
            "data/campus_store.json → room_bookings"
          ]
        },
        {
          "url": "/api/campus/rooms/bookings",
          "methods": [
            "GET"
          ],
          "file": "campus/facilities.py",
          "line": 257,
          "function": "my_bookings",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 257,
              "function": "my_bookings"
            },
            {
              "file": "campus/facilities.py",
              "line": 177,
              "function": "bookings"
            }
          ],
          "storage": [
            "data/campus_store.json → room_bookings"
          ]
        },
        {
          "url": "/api/campus/rooms/bookings/<int:booking_id>",
          "methods": [
            "POST"
          ],
          "file": "campus/facilities.py",
          "line": 268,
          "function": "update_booking",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 268,
              "function": "update_booking"
            },
            {
              "file": "campus/facilities.py",
              "line": 177,
              "function": "bookings"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            }
          ],
          "storage": [
            "data/campus_store.json → room_bookings"
          ]
        },
        {
          "url": "/api/campus/lockers",
          "methods": [
            "GET"
          ],
          "file": "campus/facilities.py",
          "line": 317,
          "function": "list_lockers",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 317,
              "function": "list_lockers"
            },
            {
              "file": "campus/facilities.py",
              "line": 306,
              "function": "expire_holds"
            },
            {
              "file": "campus/facilities.py",
              "line": 291,
              "function": "lockers"
            }
          ],
          "storage": [
            "data/campus_store.json → lockers"
          ]
        },
        {
          "url": "/api/campus/lockers/<locker_id>/reserve",
          "methods": [
            "POST"
          ],
          "file": "campus/facilities.py",
          "line": 338,
          "function": "reserve_locker",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 338,
              "function": "reserve_locker"
            },
            {
              "file": "campus/facilities.py",
              "line": 306,
              "function": "expire_holds"
            },
            {
              "file": "campus/facilities.py",
              "line": 291,
              "function": "lockers"
            }
          ],
          "storage": [
            "data/campus_store.json → lockers"
          ]
        },
        {
          "url": "/api/campus/lockers/<locker_id>/cancel",
          "methods": [
            "POST"
          ],
          "file": "campus/facilities.py",
          "line": 357,
          "function": "cancel_locker",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 357,
              "function": "cancel_locker"
            },
            {
              "file": "campus/facilities.py",
              "line": 291,
              "function": "lockers"
            }
          ],
          "storage": [
            "data/campus_store.json → lockers"
          ]
        },
        {
          "url": "/api/campus/lockers/admin",
          "methods": [
            "GET"
          ],
          "file": "campus/facilities.py",
          "line": 372,
          "function": "lockers_admin",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 372,
              "function": "lockers_admin"
            },
            {
              "file": "campus/facilities.py",
              "line": 306,
              "function": "expire_holds"
            },
            {
              "file": "campus/facilities.py",
              "line": 291,
              "function": "lockers"
            }
          ],
          "storage": [
            "data/campus_store.json → lockers"
          ]
        },
        {
          "url": "/api/campus/lockers/<locker_id>/paid",
          "methods": [
            "POST"
          ],
          "file": "campus/facilities.py",
          "line": 392,
          "function": "locker_paid",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 392,
              "function": "locker_paid"
            },
            {
              "file": "campus/facilities.py",
              "line": 291,
              "function": "lockers"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            }
          ],
          "storage": [
            "data/campus_store.json → lockers"
          ]
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 926
        },
        {
          "file": "static/admin.html",
          "line": 943
        },
        {
          "file": "static/admin.html",
          "line": 974
        },
        {
          "file": "static/admin.html",
          "line": 989
        },
        {
          "file": "static/js/campus-life.js",
          "line": 274
        },
        {
          "file": "static/js/campus-life.js",
          "line": 329
        },
        {
          "file": "static/js/campus-life.js",
          "line": 339
        },
        {
          "file": "static/js/campus-life.js",
          "line": 353
        },
        {
          "file": "static/js/campus-life.js",
          "line": 364
        },
        {
          "file": "static/js/campus-life.js",
          "line": 393
        },
        {
          "file": "static/js/campus-life.js",
          "line": 399
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
          "line": 107,
          "function": "campus_map",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 107,
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
          "line": 113,
          "function": "find_place",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 113,
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
          "line": 416,
          "function": "crowd",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 88,
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
              "line": 416,
              "function": "crowd"
            },
            {
              "file": "campus/facilities.py",
              "line": 87,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/facilities.py",
              "line": 78,
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
          "line": 114,
          "function": "weather",
          "tables": [],
          "files": [
            {
              "file": "campus/info.py",
              "line": 114,
              "function": "weather"
            },
            {
              "file": "campus/info.py",
              "line": 94,
              "function": "load_cwa"
            },
            {
              "file": "campus/info.py",
              "line": 49,
              "function": "_advice"
            },
            {
              "file": "campus/info.py",
              "line": 34,
              "function": "_get_json"
            },
            {
              "file": "campus/info.py",
              "line": 40,
              "function": "_cached"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/js/campus-life.js",
          "line": 411
        },
        {
          "file": "static/js/campus-life.js",
          "line": 457
        },
        {
          "file": "static/js/campus-life.js",
          "line": 536
        },
        {
          "file": "static/js/campus-life.js",
          "line": 577
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 441
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
          "line": 3250,
          "function": "manage_quick_links",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 3250,
              "function": "manage_quick_links"
            },
            {
              "file": "app.py",
              "line": 3220,
              "function": "save_quick_links"
            },
            {
              "file": "app.py",
              "line": 3227,
              "function": "parse_link_payload"
            },
            {
              "file": "app.py",
              "line": 3214,
              "function": "load_quick_links"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 209,
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
          "line": 3267,
          "function": "update_or_delete_quick_link",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 3267,
              "function": "update_or_delete_quick_link"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 3220,
              "function": "save_quick_links"
            },
            {
              "file": "app.py",
              "line": 3227,
              "function": "parse_link_payload"
            },
            {
              "file": "app.py",
              "line": 3214,
              "function": "load_quick_links"
            },
            {
              "file": "app.py",
              "line": 196,
              "function": "role_required"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 1795
        },
        {
          "file": "static/admin.html",
          "line": 1862
        },
        {
          "file": "static/admin.html",
          "line": 1882
        },
        {
          "file": "static/index.html",
          "line": 1371
        },
        {
          "file": "static/index.html",
          "line": 1693
        },
        {
          "file": "static/js/home-portal.js",
          "line": 65
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
          "line": 342,
          "function": "send_notice",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 171,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 177,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 59,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 75,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 83,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 69,
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
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 91,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 100,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 342,
              "function": "send_notice"
            },
            {
              "file": "campus/messaging.py",
              "line": 248,
              "function": "can_manage"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "campus/messaging.py",
              "line": 164,
              "function": "add_notice"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 57,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/messaging.py",
              "line": 39,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 115,
              "function": "member_ids"
            },
            {
              "file": "campus/messaging.py",
              "line": 110,
              "function": "roster_ids"
            },
            {
              "file": "campus/messaging.py",
              "line": 106,
              "function": "find_class"
            },
            {
              "file": "campus/messaging.py",
              "line": 96,
              "function": "all_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 47,
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
          "line": 384,
          "function": "sent",
          "tables": [
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 195,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 204,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 198,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 59,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 75,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 83,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 69,
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
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 91,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 384,
              "function": "sent"
            },
            {
              "file": "campus/messaging.py",
              "line": 187,
              "function": "load_notices"
            },
            {
              "file": "campus/messaging.py",
              "line": 47,
              "function": "_fmt_time"
            },
            {
              "file": "campus/messaging.py",
              "line": 217,
              "function": "_target_fields"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 57,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 39,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 35,
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
          "line": 399,
          "function": "inbox",
          "tables": [
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 195,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 204,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 198,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 59,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 75,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 83,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 69,
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
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 91,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 399,
              "function": "inbox"
            },
            {
              "file": "campus/messaging.py",
              "line": 187,
              "function": "load_notices"
            },
            {
              "file": "campus/messaging.py",
              "line": 47,
              "function": "_fmt_time"
            },
            {
              "file": "campus/messaging.py",
              "line": 217,
              "function": "_target_fields"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 57,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 39,
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
          "line": 409,
          "function": "mark_read",
          "tables": [
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 226,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 231,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 59,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 75,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 83,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 69,
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
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 91,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 409,
              "function": "mark_read"
            },
            {
              "file": "campus/messaging.py",
              "line": 222,
              "function": "mark_notice_read"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/messaging.py",
              "line": 57,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_import_into_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 39,
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
          "line": 626,
          "function": "reply_notice",
          "tables": [
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 639,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 195,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 204,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 198,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 59,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 75,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 83,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 69,
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
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 91,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 626,
              "function": "reply_notice"
            },
            {
              "file": "campus/messaging.py",
              "line": 187,
              "function": "load_notices"
            },
            {
              "file": "campus/messaging.py",
              "line": 47,
              "function": "_fmt_time"
            },
            {
              "file": "campus/messaging.py",
              "line": 217,
              "function": "_target_fields"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 57,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 39,
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
          "line": 652,
          "function": "remind_notice",
          "tables": [
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 195,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 204,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 198,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 59,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 75,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 83,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 69,
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
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 91,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 171,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 177,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 652,
              "function": "remind_notice"
            },
            {
              "file": "campus/messaging.py",
              "line": 187,
              "function": "load_notices"
            },
            {
              "file": "campus/messaging.py",
              "line": 47,
              "function": "_fmt_time"
            },
            {
              "file": "campus/messaging.py",
              "line": 217,
              "function": "_target_fields"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 57,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 39,
              "function": "seed_classes"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "campus/messaging.py",
              "line": 164,
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
                  "line": 795
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
                  "line": 795
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
                  "line": 795
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
                  "line": 795
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
                  "line": 795
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
                  "line": 795
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "campus/records.py",
              "line": 100,
              "function": "delete_record"
            },
            {
              "file": "app.py",
              "line": 1494,
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
              "line": 255,
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
              "line": 260,
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
                  "line": 795
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
                  "line": 795
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
                  "line": 795
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
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
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
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "campus/records.py",
              "line": 53,
              "function": "use_db"
            },
            {
              "file": "app.py",
              "line": 1478,
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
                  "line": 795
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
                  "line": 795
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
          "line": 666
        },
        {
          "file": "static/js/campus-features.js",
          "line": 670
        },
        {
          "file": "static/js/campus-features.js",
          "line": 843
        },
        {
          "file": "static/js/campus-features.js",
          "line": 949
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1187
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1193
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1229
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1231
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1238
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1369
        },
        {
          "file": "static/js/campus-life.js",
          "line": 623
        },
        {
          "file": "static/js/campus-life.js",
          "line": 652
        },
        {
          "file": "static/js/campus-life.js",
          "line": 689
        },
        {
          "file": "static/js/campus-life.js",
          "line": 749
        },
        {
          "file": "static/js/campus-life.js",
          "line": 872
        },
        {
          "file": "static/js/campus-life.js",
          "line": 920
        },
        {
          "file": "static/js/campus-life.js",
          "line": 928
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 493
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
          "line": 2812,
          "function": "manage_privacy_consent",
          "tables": [
            {
              "name": "student_privacy_settings",
              "file": "app.py",
              "line": 2833,
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
              "line": 2802,
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
              "line": 255,
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
              "line": 260,
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
              "line": 2812,
              "function": "manage_privacy_consent"
            },
            {
              "file": "app.py",
              "line": 2799,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 1939,
              "function": "current_student_id"
            },
            {
              "file": "app.py",
              "line": 196,
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
          "line": 2850,
          "function": "manage_emergency_contact",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 2868,
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
              "line": 2861,
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
              "line": 2850,
              "function": "manage_emergency_contact"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 1939,
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
          "line": 3350,
          "function": "list_departments_with_intro",
          "tables": [
            {
              "name": "departments",
              "file": "app.py",
              "line": 3352,
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
              "line": 3350,
              "function": "list_departments_with_intro"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
                  "line": 580
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
                  "line": 580
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
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 154,
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
              "line": 1478,
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
          "line": 3662
        },
        {
          "file": "static/index.html",
          "line": 3671
        },
        {
          "file": "static/index.html",
          "line": 3686
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 698
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
                  "line": 630
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
                  "line": 646
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
                  "line": 630
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
                  "line": 646
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 92,
              "function": "add_wish"
            },
            {
              "file": "app.py",
              "line": 1494,
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
                  "line": 646
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
                  "line": 630
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
                  "line": 630
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1494,
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
                  "line": 630
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
                  "line": 630
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
                  "line": 630
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 52,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
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
                  "line": 646
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
                  "line": 646
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
                  "line": 646
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
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 52,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
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
              "line": 1478,
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
          "line": 1320
        },
        {
          "file": "static/admin.html",
          "line": 1377
        },
        {
          "file": "static/admin.html",
          "line": 1389
        },
        {
          "file": "static/admin.html",
          "line": 1423
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
          "line": 22,
          "function": "slots",
          "tables": [],
          "files": [
            {
              "file": "campus/visits.py",
              "line": 22,
              "function": "slots"
            },
            {
              "file": "campus/visits.py",
              "line": 17,
              "function": "bookings"
            }
          ],
          "storage": [
            "data/campus_store.json → visit_bookings"
          ]
        },
        {
          "url": "/api/campus/visits",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "campus/visits.py",
          "line": 37,
          "function": "visits_route",
          "tables": [],
          "files": [
            {
              "file": "campus/visits.py",
              "line": 37,
              "function": "visits_route"
            },
            {
              "file": "campus/visits.py",
              "line": 17,
              "function": "bookings"
            }
          ],
          "storage": [
            "data/campus_store.json → visit_bookings"
          ]
        },
        {
          "url": "/api/campus/visits/<int:visit_id>",
          "methods": [
            "POST"
          ],
          "file": "campus/visits.py",
          "line": 87,
          "function": "update_visit",
          "tables": [],
          "files": [
            {
              "file": "campus/visits.py",
              "line": 87,
              "function": "update_visit"
            },
            {
              "file": "campus/visits.py",
              "line": 17,
              "function": "bookings"
            }
          ],
          "storage": [
            "data/campus_store.json → visit_bookings"
          ]
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 950
        },
        {
          "file": "static/admin.html",
          "line": 967
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 745
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 761
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 769
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
          "line": 292,
          "function": "affairs_mine",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 292,
              "function": "affairs_mine"
            },
            {
              "file": "campus/services.py",
              "line": 281,
              "function": "project_status"
            },
            {
              "file": "campus/services.py",
              "line": 245,
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
          "line": 301,
          "function": "affairs_check",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 301,
              "function": "affairs_check"
            },
            {
              "file": "campus/services.py",
              "line": 249,
              "function": "check_form"
            },
            {
              "file": "campus/services.py",
              "line": 245,
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
          "line": 314,
          "function": "affairs_submit",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 314,
              "function": "affairs_submit"
            },
            {
              "file": "app.py",
              "line": 102,
              "function": "save_uploaded_file"
            },
            {
              "file": "app.py",
              "line": 99,
              "function": "allowed_file"
            },
            {
              "file": "campus/services.py",
              "line": 245,
              "function": "affairs_submissions"
            },
            {
              "file": "campus/services.py",
              "line": 249,
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
          "line": 400,
          "function": "scholarships",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 1931,
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
              "line": 400,
              "function": "scholarships"
            },
            {
              "file": "campus/services.py",
              "line": 380,
              "function": "auto_answers"
            },
            {
              "file": "app.py",
              "line": 1928,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
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
          "line": 195
        },
        {
          "file": "static/js/campus-life.js",
          "line": 242
        },
        {
          "file": "static/js/campus-life.js",
          "line": 253
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
          "line": 456,
          "function": "list_announcements",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 244,
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
              "line": 218,
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
              "line": 233,
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
                  "line": 471
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
                  "line": 484
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
                  "line": 484
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
                  "line": 495
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
                  "line": 510
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
                  "line": 521
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
                  "line": 471
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/calendar_ext.py",
              "line": 456,
              "function": "list_announcements"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 239,
              "function": "list_my_events"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 217,
              "function": "_events_db"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 231,
              "function": "_insert_event"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 4184,
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
              "line": 440,
              "function": "guess_announcement_date"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 198,
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
          "line": 267,
          "function": "list_classes",
          "tables": [
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 100,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 59,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 75,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 83,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 69,
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
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 91,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 267,
              "function": "list_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 115,
              "function": "member_ids"
            },
            {
              "file": "campus/messaging.py",
              "line": 110,
              "function": "roster_ids"
            },
            {
              "file": "campus/messaging.py",
              "line": 248,
              "function": "can_manage"
            },
            {
              "file": "campus/messaging.py",
              "line": 96,
              "function": "all_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 47,
              "function": "_fmt_time"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 57,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 39,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 35,
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
          "line": 283,
          "function": "create_class",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 123,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 100,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 59,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 75,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 83,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 69,
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
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 91,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 283,
              "function": "create_class"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "campus/messaging.py",
              "line": 120,
              "function": "add_class"
            },
            {
              "file": "campus/messaging.py",
              "line": 96,
              "function": "all_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 47,
              "function": "_fmt_time"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/messaging.py",
              "line": 57,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 39,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 106,
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
          "line": 299,
          "function": "reset_password",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 135,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 100,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 59,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 75,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 83,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 69,
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
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 91,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 299,
              "function": "reset_password"
            },
            {
              "file": "campus/messaging.py",
              "line": 248,
              "function": "can_manage"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "campus/messaging.py",
              "line": 133,
              "function": "set_class_password"
            },
            {
              "file": "campus/messaging.py",
              "line": 106,
              "function": "find_class"
            },
            {
              "file": "campus/messaging.py",
              "line": 96,
              "function": "all_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 47,
              "function": "_fmt_time"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/messaging.py",
              "line": 57,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 39,
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
          "line": 320,
          "function": "join_class",
          "tables": [
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 144,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 100,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 59,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 75,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 83,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 69,
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
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 91,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 320,
              "function": "join_class"
            },
            {
              "file": "campus/messaging.py",
              "line": 142,
              "function": "add_member"
            },
            {
              "file": "campus/messaging.py",
              "line": 106,
              "function": "find_class"
            },
            {
              "file": "campus/messaging.py",
              "line": 96,
              "function": "all_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 47,
              "function": "_fmt_time"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 57,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 39,
              "function": "seed_classes"
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
          "line": 334,
          "function": "leave_class",
          "tables": [
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 155,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 100,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 59,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 75,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 83,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 69,
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
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 91,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 334,
              "function": "leave_class"
            },
            {
              "file": "campus/messaging.py",
              "line": 153,
              "function": "remove_member"
            },
            {
              "file": "campus/messaging.py",
              "line": 106,
              "function": "find_class"
            },
            {
              "file": "campus/messaging.py",
              "line": 96,
              "function": "all_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 47,
              "function": "_fmt_time"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 57,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 39,
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
          "line": 501,
          "function": "broadcast_targets",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/messaging.py",
              "line": 430,
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
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 100,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 59,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 75,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 83,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 69,
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
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 91,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "departments",
              "file": "campus/messaging.py",
              "line": 472,
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
              "line": 501,
              "function": "broadcast_targets"
            },
            {
              "file": "campus/messaging.py",
              "line": 452,
              "function": "visible_courses"
            },
            {
              "file": "campus/messaging.py",
              "line": 434,
              "function": "course_table"
            },
            {
              "file": "campus/messaging.py",
              "line": 429,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 424,
              "function": "_plain_name"
            },
            {
              "file": "campus/messaging.py",
              "line": 462,
              "function": "course_recipients"
            },
            {
              "file": "campus/messaging.py",
              "line": 110,
              "function": "roster_ids"
            },
            {
              "file": "campus/messaging.py",
              "line": 115,
              "function": "member_ids"
            },
            {
              "file": "campus/messaging.py",
              "line": 106,
              "function": "find_class"
            },
            {
              "file": "campus/messaging.py",
              "line": 96,
              "function": "all_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 47,
              "function": "_fmt_time"
            },
            {
              "file": "campus/messaging.py",
              "line": 57,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 39,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 471,
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
          "line": 523,
          "function": "send_broadcast",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 171,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 177,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 59,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_groups",
              "file": "campus/messaging.py",
              "line": 75,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_notices",
              "file": "campus/messaging.py",
              "line": 83,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 474
                },
                {
                  "file": "init_db.py",
                  "line": 714
                }
              ]
            },
            {
              "name": "students",
              "file": "campus/messaging.py",
              "line": 69,
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
              "line": 79,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            },
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 91,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 494
                },
                {
                  "file": "init_db.py",
                  "line": 734
                }
              ]
            },
            {
              "name": "departments",
              "file": "campus/messaging.py",
              "line": 472,
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
              "line": 430,
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
              "line": 99,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 455
                },
                {
                  "file": "init_db.py",
                  "line": 693
                }
              ]
            },
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 100,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 464
                },
                {
                  "file": "init_db.py",
                  "line": 703
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 523,
              "function": "send_broadcast"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "campus/messaging.py",
              "line": 164,
              "function": "add_notice"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 57,
              "function": "use_db"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_import_into_db"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/messaging.py",
              "line": 39,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 477,
              "function": "resolve_target"
            },
            {
              "file": "campus/messaging.py",
              "line": 471,
              "function": "department_names"
            },
            {
              "file": "campus/messaging.py",
              "line": 452,
              "function": "visible_courses"
            },
            {
              "file": "campus/messaging.py",
              "line": 434,
              "function": "course_table"
            },
            {
              "file": "campus/messaging.py",
              "line": 429,
              "function": "load_schedule"
            },
            {
              "file": "campus/messaging.py",
              "line": 424,
              "function": "_plain_name"
            },
            {
              "file": "campus/messaging.py",
              "line": 462,
              "function": "course_recipients"
            },
            {
              "file": "campus/messaging.py",
              "line": 110,
              "function": "roster_ids"
            },
            {
              "file": "campus/messaging.py",
              "line": 115,
              "function": "member_ids"
            },
            {
              "file": "campus/messaging.py",
              "line": 106,
              "function": "find_class"
            },
            {
              "file": "campus/messaging.py",
              "line": 96,
              "function": "all_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 47,
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
          "line": 561,
          "function": "advisor_messages_route",
          "tables": [],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 561,
              "function": "advisor_messages_route"
            },
            {
              "file": "campus/messaging.py",
              "line": 555,
              "function": "advisor_messages"
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
          "line": 601,
          "function": "reply_advisor_message",
          "tables": [],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 601,
              "function": "reply_advisor_message"
            },
            {
              "file": "campus/messaging.py",
              "line": 555,
              "function": "advisor_messages"
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
          "line": 623
        },
        {
          "file": "static/js/campus-life.js",
          "line": 652
        },
        {
          "file": "static/js/campus-life.js",
          "line": 678
        },
        {
          "file": "static/js/campus-life.js",
          "line": 694
        },
        {
          "file": "static/js/campus-life.js",
          "line": 700
        },
        {
          "file": "static/js/campus-life.js",
          "line": 749
        },
        {
          "file": "static/js/campus-life.js",
          "line": 860
        },
        {
          "file": "static/js/campus-life.js",
          "line": 881
        },
        {
          "file": "static/js/campus-life.js",
          "line": 887
        },
        {
          "file": "static/js/campus-life.js",
          "line": 892
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 338
        },
        {
          "file": "static/js/home-portal.js",
          "line": 65
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
          "line": 167,
          "function": "transport",
          "tables": [],
          "files": [
            {
              "file": "campus/info.py",
              "line": 167,
              "function": "transport"
            },
            {
              "file": "campus/info.py",
              "line": 40,
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
                  "line": 580
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
                  "line": 580
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
                  "line": 580
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
                  "line": 580
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
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1494,
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
          "line": 561
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 276
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 291
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
          "line": 120,
          "function": "config",
          "tables": [
            {
              "name": "users",
              "file": "campus/admin_cases.py",
              "line": 39,
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
              "line": 30,
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
              "line": 255,
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
              "line": 260,
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
              "line": 120,
              "function": "config"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 36,
              "function": "assignments"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 29,
              "function": "accounts"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            }
          ],
          "storage": [
            "data/campus_store.json → admin_offices"
          ]
        },
        {
          "url": "/api/campus/admin-cases",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "campus/admin_cases.py",
          "line": 148,
          "function": "collection",
          "tables": [
            {
              "name": "users",
              "file": "campus/admin_cases.py",
              "line": 39,
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
              "line": 148,
              "function": "collection"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 21,
              "function": "today"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 42,
              "function": "cases"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 46,
              "function": "visible"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 36,
              "function": "assignments"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 53,
              "function": "payload"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 25,
              "function": "stamp"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 105,
              "function": "text"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 60,
              "function": "history"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 91,
              "function": "save_files"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 69,
              "function": "upload_root"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 73,
              "function": "read_uploads"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 98,
              "function": "form_data"
            }
          ],
          "storage": [
            "data/campus_store.json → admin_cases",
            "data/campus_store.json → admin_offices"
          ]
        },
        {
          "url": "/api/campus/admin-cases/<int:case_id>",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "campus/admin_cases.py",
          "line": 180,
          "function": "case_detail",
          "tables": [
            {
              "name": "users",
              "file": "campus/admin_cases.py",
              "line": 30,
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
              "line": 39,
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
              "line": 255,
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
              "line": 260,
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
              "line": 180,
              "function": "case_detail"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 29,
              "function": "accounts"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 36,
              "function": "assignments"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 105,
              "function": "text"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 21,
              "function": "today"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 25,
              "function": "stamp"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 53,
              "function": "payload"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 46,
              "function": "visible"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 42,
              "function": "cases"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 91,
              "function": "save_files"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 69,
              "function": "upload_root"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 73,
              "function": "read_uploads"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 60,
              "function": "history"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 98,
              "function": "form_data"
            }
          ],
          "storage": [
            "data/campus_store.json → admin_cases",
            "data/campus_store.json → admin_offices"
          ]
        },
        {
          "url": "/api/campus/admin-cases/<int:case_id>/files/<file_id>",
          "methods": [
            "GET"
          ],
          "file": "campus/admin_cases.py",
          "line": 263,
          "function": "download",
          "tables": [
            {
              "name": "users",
              "file": "campus/admin_cases.py",
              "line": 39,
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
              "line": 263,
              "function": "download"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 46,
              "function": "visible"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 36,
              "function": "assignments"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 42,
              "function": "cases"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 69,
              "function": "upload_root"
            }
          ],
          "storage": [
            "data/campus_store.json → admin_cases",
            "data/campus_store.json → admin_offices"
          ]
        }
      ],
      "frontend": [
        {
          "file": "static/js/admin-workbench.js",
          "line": 35
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 48
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 50
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 99
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 107
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 131
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 140
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
          "line": 1700,
          "function": "get_missed_queries",
          "tables": [
            {
              "name": "search_logs",
              "file": "app.py",
              "line": 1702,
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
              "line": 1703,
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
              "line": 1700,
              "function": "get_missed_queries"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 196,
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
          "line": 1732,
          "function": "get_search_stats",
          "tables": [
            {
              "name": "search_logs",
              "file": "app.py",
              "line": 1737,
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
              "line": 1732,
              "function": "get_search_stats"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 196,
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
          "line": 1757,
          "function": "get_unmatched_queries",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "app.py",
              "line": 1538,
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
              "line": 1757,
              "function": "get_unmatched_queries"
            },
            {
              "file": "app.py",
              "line": 1537,
              "function": "load_unmatched_queries"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 196,
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
          "line": 1763,
          "function": "convert_unmatched_to_synonym",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "app.py",
              "line": 1782,
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
              "line": 3057,
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
              "line": 255,
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
              "line": 260,
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
              "line": 1763,
              "function": "convert_unmatched_to_synonym"
            },
            {
              "file": "app.py",
              "line": 1494,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3053,
              "function": "add_synonym"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 196,
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
          "line": 1797,
          "function": "get_audit_logs",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 1799,
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
              "line": 1797,
              "function": "get_audit_logs"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 196,
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
          "line": 1816,
          "function": "run_self_check",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 1816,
              "function": "run_self_check"
            },
            {
              "file": "app.py",
              "line": 196,
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
          "line": 1846,
          "function": "get_visitor_logs",
          "tables": [
            {
              "name": "visitor_logs",
              "file": "app.py",
              "line": 1826,
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
              "line": 1846,
              "function": "get_visitor_logs"
            },
            {
              "file": "app.py",
              "line": 1833,
              "function": "mask_phone"
            },
            {
              "file": "app.py",
              "line": 1823,
              "function": "load_visitor_logs"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1838,
              "function": "_visitor_days"
            },
            {
              "file": "app.py",
              "line": 196,
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
          "line": 1870,
          "function": "export_visitor_logs",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 255,
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
              "line": 260,
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
              "line": 1826,
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
              "line": 1870,
              "function": "export_visitor_logs"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 230,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1823,
              "function": "load_visitor_logs"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 1838,
              "function": "_visitor_days"
            },
            {
              "file": "app.py",
              "line": 196,
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
          "line": 1885,
          "function": "get_search_feedback_stats",
          "tables": [
            {
              "name": "search_feedback",
              "file": "app.py",
              "line": 1887,
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
              "line": 1885,
              "function": "get_search_feedback_stats"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 196,
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
          "line": 3380,
          "function": "list_visitor_faq",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 3380,
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
          "line": 4024,
          "function": "health_check",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 4024,
              "function": "health_check"
            },
            {
              "file": "app.py",
              "line": 168,
              "function": "is_db_available"
            },
            {
              "file": "app.py",
              "line": 154,
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
          "line": 4044,
          "function": "get_stats",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "app.py",
              "line": 1538,
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
              "line": 2681,
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
              "line": 3050,
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
              "line": 3111,
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
              "line": 3111,
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
              "line": 4044,
              "function": "get_stats"
            },
            {
              "file": "app.py",
              "line": 168,
              "function": "is_db_available"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1537,
              "function": "load_unmatched_queries"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 2679,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 3048,
              "function": "load_synonyms"
            },
            {
              "file": "app.py",
              "line": 3108,
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
          "line": 4213,
          "function": "link_moodle",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 4213,
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
              "line": 196,
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
          "line": 4418,
          "function": "staff_alerts",
          "tables": [
            {
              "name": "student_privacy_settings",
              "file": "app.py",
              "line": 2802,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 285
                }
              ]
            },
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 1931,
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
                  "line": 471
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
                  "line": 484
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
                  "line": 484
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
                  "line": 495
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
                  "line": 510
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
                  "line": 521
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
                  "line": 471
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
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
                  "line": 521
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 4070,
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
              "line": 2407,
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
              "line": 4418,
              "function": "staff_alerts"
            },
            {
              "file": "app.py",
              "line": 2799,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 1478,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 154,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2883,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 1923,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1954,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 1928,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 4184,
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
              "line": 4069,
              "function": "list_students"
            },
            {
              "file": "app.py",
              "line": 4313,
              "function": "reviewable_student_ids"
            },
            {
              "file": "app.py",
              "line": 2406,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 196,
              "function": "role_required"
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
          "line": 1047
        },
        {
          "file": "static/admin.html",
          "line": 1065
        },
        {
          "file": "static/admin.html",
          "line": 1223
        },
        {
          "file": "static/admin.html",
          "line": 1289
        },
        {
          "file": "static/admin.html",
          "line": 1300
        },
        {
          "file": "static/admin.html",
          "line": 1320
        },
        {
          "file": "static/admin.html",
          "line": 1377
        },
        {
          "file": "static/admin.html",
          "line": 1389
        },
        {
          "file": "static/admin.html",
          "line": 1423
        },
        {
          "file": "static/admin.html",
          "line": 1435
        },
        {
          "file": "static/admin.html",
          "line": 1467
        },
        {
          "file": "static/admin.html",
          "line": 1523
        },
        {
          "file": "static/admin.html",
          "line": 1555
        },
        {
          "file": "static/admin.html",
          "line": 1913
        },
        {
          "file": "static/admin.html",
          "line": 2023
        },
        {
          "file": "static/admin.html",
          "line": 2037
        },
        {
          "file": "static/admin.html",
          "line": 2077
        },
        {
          "file": "static/admin.html",
          "line": 2120
        },
        {
          "file": "static/admin.html",
          "line": 2146
        },
        {
          "file": "static/admin.html",
          "line": 2166
        },
        {
          "file": "static/index.html",
          "line": 2461
        },
        {
          "file": "static/index.html",
          "line": 2486
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1366
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 552
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 699
        }
      ]
    }
  ],
  "routeCount": 167,
  "schemaCount": 45,
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
        "line": 693
      }
    ],
    "class_group_members": [
      {
        "file": "smart_ukn.sql",
        "line": 464
      },
      {
        "file": "init_db.py",
        "line": 703
      }
    ],
    "class_notices": [
      {
        "file": "smart_ukn.sql",
        "line": 474
      },
      {
        "file": "init_db.py",
        "line": 714
      }
    ],
    "class_notice_recipients": [
      {
        "file": "smart_ukn.sql",
        "line": 494
      },
      {
        "file": "init_db.py",
        "line": 734
      }
    ],
    "counseling_records": [
      {
        "file": "smart_ukn.sql",
        "line": 506
      },
      {
        "file": "init_db.py",
        "line": 762
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
        "line": 471
      }
    ],
    "announcement_reads": [
      {
        "file": "init_db.py",
        "line": 484
      }
    ],
    "assignments": [
      {
        "file": "init_db.py",
        "line": 495
      }
    ],
    "assignment_submissions": [
      {
        "file": "init_db.py",
        "line": 510
      }
    ],
    "leave_requests": [
      {
        "file": "init_db.py",
        "line": 521
      }
    ],
    "scholarships": [
      {
        "file": "init_db.py",
        "line": 557
      }
    ],
    "user_preferences": [
      {
        "file": "init_db.py",
        "line": 580
      }
    ],
    "faculty_profiles": [
      {
        "file": "init_db.py",
        "line": 594
      }
    ],
    "self_reviews": [
      {
        "file": "init_db.py",
        "line": 613
      }
    ],
    "anniversary_events": [
      {
        "file": "init_db.py",
        "line": 630
      }
    ],
    "anniversary_wishes": [
      {
        "file": "init_db.py",
        "line": 646
      }
    ],
    "notification_log": [
      {
        "file": "init_db.py",
        "line": 663
      }
    ],
    "student_records": [
      {
        "file": "init_db.py",
        "line": 795
      }
    ]
  }
};
