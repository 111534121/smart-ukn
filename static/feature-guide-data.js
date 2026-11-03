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
          "line": 1022,
          "function": "auth_login",
          "tables": [
            {
              "name": "users",
              "file": "app.py",
              "line": 1044,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
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
              "line": 1044,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 1044,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
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
              "line": 1068,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
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
              "file": "app.py",
              "line": 1022,
              "function": "auth_login"
            },
            {
              "file": "app.py",
              "line": 1017,
              "function": "_clear_login_failures"
            },
            {
              "file": "app.py",
              "line": 1013,
              "function": "_record_login_failure"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1005,
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
          "line": 1150,
          "function": "auth_logout",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 1150,
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
          "line": 1155,
          "function": "auth_me",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 1155,
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
          "line": 1185,
          "function": "register_visitor",
          "tables": [
            {
              "name": "visitor_logs",
              "file": "app.py",
              "line": 1204,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2969
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
              "line": 1185,
              "function": "register_visitor"
            },
            {
              "file": "app.py",
              "line": 1778,
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
          "file": "static/index.html",
          "line": 2819
        },
        {
          "file": "static/login.html",
          "line": 312
        },
        {
          "file": "static/login.html",
          "line": 352
        },
        {
          "file": "static/js/admin-core.js",
          "line": 162
        },
        {
          "file": "static/js/admin-core.js",
          "line": 169
        },
        {
          "file": "static/js/admin-core.js",
          "line": 209
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1788
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 112
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 103
        },
        {
          "file": "static/js/events-admin.js",
          "line": 118
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
          "line": 4682,
          "function": "get_student_dashboard",
          "tables": [
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 120,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "course_map",
              "file": "app.py",
              "line": 4505,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
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
              "line": 4665,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 143
                },
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
                  "file": "smart_ukn.sql",
                  "line": 172
                },
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
              "line": 4682,
              "function": "get_student_dashboard"
            },
            {
              "file": "app.py",
              "line": 4486,
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
              "line": 4623,
              "function": "moodle_error_message"
            },
            {
              "file": "app.py",
              "line": 4499,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1245,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4504,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4495,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 2219,
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
              "line": 4664,
              "function": "student_class_name"
            },
            {
              "file": "app.py",
              "line": 4632,
              "function": "moodle_status_for"
            },
            {
              "file": "app.py",
              "line": 4612,
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
              "line": 4671,
              "function": "parse_dashboard_now"
            },
            {
              "file": "app.py",
              "line": 2235,
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
          "line": 4721,
          "function": "mark_announcement_read",
          "tables": [
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 143
                },
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
                  "file": "smart_ukn.sql",
                  "line": 172
                },
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
              "line": 4721,
              "function": "mark_announcement_read"
            },
            {
              "file": "app.py",
              "line": 4612,
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
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 4757,
          "function": "submit_leave_request",
          "tables": [
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 143
                },
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
                  "file": "smart_ukn.sql",
                  "line": 172
                },
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
              "line": 4757,
              "function": "submit_leave_request"
            },
            {
              "file": "app.py",
              "line": 4612,
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
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 4790,
          "function": "cancel_leave_request",
          "tables": [
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 143
                },
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
                  "file": "smart_ukn.sql",
                  "line": 172
                },
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
              "line": 4790,
              "function": "cancel_leave_request"
            },
            {
              "file": "app.py",
              "line": 4612,
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
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 4797,
          "function": "list_leave_requests_for_review",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 4492,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 143
                },
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
                  "file": "smart_ukn.sql",
                  "line": 172
                },
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
                {
                  "file": "init_db.py",
                  "line": 521
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2703,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 4797,
              "function": "list_leave_requests_for_review"
            },
            {
              "file": "app.py",
              "line": 4491,
              "function": "list_students"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4612,
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
              "line": 4741,
              "function": "reviewable_student_ids"
            },
            {
              "file": "app.py",
              "line": 2702,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 4816,
          "function": "review_leave_request",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 2703,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 143
                },
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
                  "file": "smart_ukn.sql",
                  "line": 172
                },
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
              "line": 4816,
              "function": "review_leave_request"
            },
            {
              "file": "app.py",
              "line": 4747,
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 4741,
              "function": "reviewable_student_ids"
            },
            {
              "file": "app.py",
              "line": 2702,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 4612,
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
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/index.html",
          "line": 836
        },
        {
          "file": "static/index.html",
          "line": 2632
        },
        {
          "file": "static/index.html",
          "line": 2647
        },
        {
          "file": "static/index.html",
          "line": 2689
        },
        {
          "file": "static/index.html",
          "line": 2705
        },
        {
          "file": "static/index.html",
          "line": 2716
        },
        {
          "file": "static/index.html",
          "line": 2751
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
          "line": 2261,
          "function": "get_all_courses",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 2261,
              "function": "get_all_courses"
            },
            {
              "file": "app.py",
              "line": 2219,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1752,
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
          "line": 2269,
          "function": "check_courses_prerequisites",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2227,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1609
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
              "line": 2269,
              "function": "check_courses_prerequisites"
            },
            {
              "file": "app.py",
              "line": 2224,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2243,
              "function": "hide_untaken_demo_courses"
            },
            {
              "file": "app.py",
              "line": 2250,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2235,
              "function": "current_student_id"
            },
            {
              "file": "app.py",
              "line": 2219,
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
          "line": 2351,
          "function": "get_personalized_courses",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2227,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1609
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
              "line": 2351,
              "function": "get_personalized_courses"
            },
            {
              "file": "app.py",
              "line": 2250,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2224,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2219,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 2235,
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
          "line": 2451,
          "function": "what_if_course_failed",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 2451,
              "function": "what_if_course_failed"
            },
            {
              "file": "app.py",
              "line": 2219,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1752,
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
          "line": 3004
        },
        {
          "file": "static/index.html",
          "line": 3005
        },
        {
          "file": "static/index.html",
          "line": 3770
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
              "line": 2219,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1752,
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
          "line": 70,
          "function": "check_plan",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2227,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1609
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
              "line": 2219,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1752,
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
              "line": 2224,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2250,
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
          "line": 2423,
          "function": "graduation_audit",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 2435,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 143
                },
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
                  "file": "smart_ukn.sql",
                  "line": 172
                },
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
                {
                  "file": "init_db.py",
                  "line": 521
                }
              ]
            },
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2227,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1609
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
              "line": 2535,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2535,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
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
              "line": 2423,
              "function": "graduation_audit"
            },
            {
              "file": "app.py",
              "line": 4612,
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
              "line": 2224,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2219,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 4045,
              "function": "teacher_can_view_student"
            },
            {
              "file": "app.py",
              "line": 2534,
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
              "line": 1245,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 2520,
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
          "line": 2653,
          "function": "student_graduation_dashboard",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2227,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1609
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
              "line": 2566,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1275
                },
                {
                  "file": "init_db.py",
                  "line": 299
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2545,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2546,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
              "line": 2546,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2553,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
              "line": 2553,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2535,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2535,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
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
              "line": 2653,
              "function": "student_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 2642,
              "function": "_graduation_target_or_error"
            },
            {
              "file": "app.py",
              "line": 2571,
              "function": "_compute_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 2219,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2224,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2565,
              "function": "_load_dept_requirements"
            },
            {
              "file": "app.py",
              "line": 2543,
              "function": "_load_cohort"
            },
            {
              "file": "app.py",
              "line": 2250,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2534,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 2520,
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
          "line": 2661,
          "function": "export_graduation_dashboard_csv",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2227,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1609
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
              "line": 2566,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1275
                },
                {
                  "file": "init_db.py",
                  "line": 299
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2545,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2546,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
              "line": 2546,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2553,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
              "line": 2553,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2535,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2535,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
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
              "line": 2661,
              "function": "export_graduation_dashboard_csv"
            },
            {
              "file": "app.py",
              "line": 2642,
              "function": "_graduation_target_or_error"
            },
            {
              "file": "app.py",
              "line": 2571,
              "function": "_compute_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 2219,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2224,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2565,
              "function": "_load_dept_requirements"
            },
            {
              "file": "app.py",
              "line": 2543,
              "function": "_load_cohort"
            },
            {
              "file": "app.py",
              "line": 2250,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2534,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 2520,
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
          "line": 2710,
          "function": "teacher_class_summary",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2227,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1609
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
              "line": 2566,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1275
                },
                {
                  "file": "init_db.py",
                  "line": 299
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2545,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2546,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
              "line": 2546,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2553,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
              "line": 2553,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2535,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2535,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
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
              "line": 2703,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2710,
              "function": "teacher_class_summary"
            },
            {
              "file": "app.py",
              "line": 2571,
              "function": "_compute_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 2219,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2224,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2565,
              "function": "_load_dept_requirements"
            },
            {
              "file": "app.py",
              "line": 2543,
              "function": "_load_cohort"
            },
            {
              "file": "app.py",
              "line": 2250,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2534,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 2702,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/index.html",
          "line": 1266
        },
        {
          "file": "static/index.html",
          "line": 3699
        },
        {
          "file": "static/index.html",
          "line": 4034
        },
        {
          "file": "static/index.html",
          "line": 4062
        },
        {
          "file": "static/index.html",
          "line": 4236
        },
        {
          "file": "static/index.html",
          "line": 4327
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
          "line": 2744,
          "function": "teacher_class_attendance",
          "tables": [
            {
              "name": "course_map",
              "file": "app.py",
              "line": 4505,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 143
                },
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
                  "file": "smart_ukn.sql",
                  "line": 172
                },
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
                {
                  "file": "init_db.py",
                  "line": 521
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 4492,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2737,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2703,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
              "line": 2744,
              "function": "teacher_class_attendance"
            },
            {
              "file": "app.py",
              "line": 4499,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1245,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4504,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4612,
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
              "line": 4491,
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
              "line": 2736,
              "function": "_list_class_names"
            },
            {
              "file": "app.py",
              "line": 2702,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 4486,
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
              "line": 4495,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 2219,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 4510,
          "function": "get_my_attendance",
          "tables": [
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 120,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "course_map",
              "file": "app.py",
              "line": 4505,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
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
              "line": 4510,
              "function": "get_my_attendance"
            },
            {
              "file": "app.py",
              "line": 4486,
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
              "line": 4499,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1245,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4504,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4495,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 2219,
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
              "line": 2235,
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
          "line": 4526,
          "function": "manage_attendance_records",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 4551,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 4492,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
              "line": 4526,
              "function": "manage_attendance_records"
            },
            {
              "file": "app.py",
              "line": 4495,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 2219,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1752,
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
              "line": 4491,
              "function": "list_students"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 4486,
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
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 4585,
          "function": "notify_attendance_now",
          "tables": [
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 120,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
              "line": 4585,
              "function": "notify_attendance_now"
            },
            {
              "file": "app.py",
              "line": 4486,
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
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 4098
        },
        {
          "file": "static/admin.html",
          "line": 4141
        },
        {
          "file": "static/admin.html",
          "line": 4167
        },
        {
          "file": "static/index.html",
          "line": 1025
        },
        {
          "file": "static/index.html",
          "line": 2774
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1550
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
          "line": 2802,
          "function": "teacher_class_overview",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2227,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1609
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
              "line": 3098,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2552
                },
                {
                  "file": "init_db.py",
                  "line": 285
                }
              ]
            },
            {
              "name": "course_map",
              "file": "app.py",
              "line": 4505,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
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
              "line": 4492,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2737,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2703,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2802,
              "function": "teacher_class_overview"
            },
            {
              "file": "app.py",
              "line": 3182,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 2219,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2250,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2224,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 3095,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 4499,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1245,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4504,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 4491,
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
              "line": 2736,
              "function": "_list_class_names"
            },
            {
              "file": "app.py",
              "line": 4486,
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
              "line": 4495,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 2702,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 2871,
          "function": "teacher_student_profile",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 2863,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 143
                },
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
                  "file": "smart_ukn.sql",
                  "line": 172
                },
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
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
                  "file": "smart_ukn.sql",
                  "line": 195
                },
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2227,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1609
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
              "line": 3098,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2552
                },
                {
                  "file": "init_db.py",
                  "line": 285
                }
              ]
            },
            {
              "name": "course_map",
              "file": "app.py",
              "line": 4505,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
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
              "line": 2566,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1275
                },
                {
                  "file": "init_db.py",
                  "line": 299
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 2545,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2546,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
              "line": 2546,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2553,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
              "line": 2553,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2535,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2535,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
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
              "line": 2871,
              "function": "teacher_student_profile"
            },
            {
              "file": "app.py",
              "line": 2862,
              "function": "_student_parent_phone"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4612,
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
              "line": 4486,
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
              "line": 3182,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 2219,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 2250,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2224,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 3095,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 4499,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1245,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4504,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 4495,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 2571,
              "function": "_compute_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 2565,
              "function": "_load_dept_requirements"
            },
            {
              "file": "app.py",
              "line": 2543,
              "function": "_load_cohort"
            },
            {
              "file": "app.py",
              "line": 2534,
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
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 1403
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
                  "line": 974
                },
                {
                  "file": "init_db.py",
                  "line": 851
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
                  "line": 974
                },
                {
                  "file": "init_db.py",
                  "line": 851
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
              "line": 1752,
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
                  "line": 974
                },
                {
                  "file": "init_db.py",
                  "line": 851
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
                  "line": 974
                },
                {
                  "file": "init_db.py",
                  "line": 851
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
                  "line": 974
                },
                {
                  "file": "init_db.py",
                  "line": 851
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
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
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/counseling.py",
              "line": 36,
              "function": "use_db"
            },
            {
              "file": "app.py",
              "line": 1778,
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
                  "line": 974
                },
                {
                  "file": "init_db.py",
                  "line": 851
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
                  "line": 974
                },
                {
                  "file": "init_db.py",
                  "line": 851
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
                  "line": 974
                },
                {
                  "file": "init_db.py",
                  "line": 851
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
                  "line": 974
                },
                {
                  "file": "init_db.py",
                  "line": 851
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "campus/counseling.py",
              "line": 102,
              "function": "delete_record"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "campus/counseling.py",
              "line": 36,
              "function": "use_db"
            },
            {
              "file": "app.py",
              "line": 1752,
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
                  "line": 974
                },
                {
                  "file": "init_db.py",
                  "line": 851
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
                  "line": 974
                },
                {
                  "file": "init_db.py",
                  "line": 851
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 1752,
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
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
          "line": 1404
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
          "line": 3241,
          "function": "get_student_early_warning",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2227,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1609
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
              "line": 2535,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2535,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
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
              "line": 3177,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
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
              "line": 3098,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2552
                },
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
              "line": 3241,
              "function": "get_student_early_warning"
            },
            {
              "file": "app.py",
              "line": 3182,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 2219,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2250,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2224,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2534,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 3175,
              "function": "find_class_advisor"
            },
            {
              "file": "app.py",
              "line": 3095,
              "function": "load_privacy_settings"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/index.html",
          "line": 4281
        },
        {
          "file": "static/index.html",
          "line": 4300
        },
        {
          "file": "static/index.html",
          "line": 4305
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
          "line": 4058,
          "function": "manage_certificates",
          "tables": [
            {
              "name": "certificates",
              "file": "app.py",
              "line": 4145,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
              "line": 4087,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
              "line": 4155,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
              "line": 2535,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2535,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
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
              "line": 4058,
              "function": "manage_certificates"
            },
            {
              "file": "app.py",
              "line": 4045,
              "function": "teacher_can_view_student"
            },
            {
              "file": "app.py",
              "line": 2534,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4051,
              "function": "portfolio_row_dates"
            },
            {
              "file": "app.py",
              "line": 3723,
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
          "line": 4188,
          "function": "delete_certificate",
          "tables": [
            {
              "name": "certificates",
              "file": "app.py",
              "line": 4200,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
              "line": 4208,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
              "line": 4188,
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
          "line": 4232,
          "function": "manage_competitions",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 2535,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2535,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
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
              "line": 4232,
              "function": "manage_competitions"
            },
            {
              "file": "app.py",
              "line": 4045,
              "function": "teacher_can_view_student"
            },
            {
              "file": "app.py",
              "line": 2534,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4051,
              "function": "portfolio_row_dates"
            },
            {
              "file": "app.py",
              "line": 3723,
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
          "line": 4336,
          "function": "delete_competition",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 4336,
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
          "line": 215,
          "function": "my_certs",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
                  "line": 1509
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
                  "line": 492
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
                  "line": 492
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
              "line": 215,
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
              "line": 1752,
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
              "line": 1778,
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
          "line": 224,
          "function": "create_cert",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
                  "line": 1509
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
                  "line": 492
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
                  "line": 492
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
              "line": 224,
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
              "line": 1752,
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
              "line": 1778,
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
          "line": 259,
          "function": "delete_cert",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
                  "line": 1509
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
                  "line": 492
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
                  "line": 492
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
                  "line": 492
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
              "line": 259,
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
              "line": 1752,
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
              "line": 1778,
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
          "line": 272,
          "function": "review_list",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
                  "line": 1509
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
                  "line": 492
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
                  "line": 492
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
              "line": 272,
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
              "line": 1752,
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
              "line": 1778,
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
          "line": 285,
          "function": "review",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
                  "line": 1509
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
                  "line": 492
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
                  "line": 492
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
                  "line": 492
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
              "line": 285,
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
              "line": 1752,
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
              "line": 1778,
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
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
          "line": 312,
          "function": "exemption_reminder_route",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
                  "line": 1509
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
                  "line": 492
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
                  "line": 492
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
              "line": 312,
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
              "line": 1752,
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
              "line": 1778,
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
          "line": 319,
          "function": "stats",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 492
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
                  "line": 1509
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
                  "line": 492
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
                  "line": 492
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
              "line": 319,
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
              "line": 1752,
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
              "line": 1778,
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
          "line": 538
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
                  "file": "smart_ukn.sql",
                  "line": 1492
                },
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
              "line": 1752,
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
                  "file": "smart_ukn.sql",
                  "line": 1492
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1492
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1492
                },
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
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1778,
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
          "line": 166,
          "function": "teachers",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 94,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
              "line": 166,
              "function": "teachers"
            },
            {
              "file": "campus/facilities.py",
              "line": 144,
              "function": "teacher_status"
            },
            {
              "file": "campus/facilities.py",
              "line": 98,
              "function": "period_at"
            },
            {
              "file": "campus/facilities.py",
              "line": 93,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/facilities.py",
              "line": 84,
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
                  "file": "smart_ukn.sql",
                  "line": 1239
                },
                {
                  "file": "init_db.py",
                  "line": 594
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 94,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
              "line": 1752,
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
              "line": 144,
              "function": "teacher_status"
            },
            {
              "file": "campus/facilities.py",
              "line": 98,
              "function": "period_at"
            },
            {
              "file": "campus/facilities.py",
              "line": 93,
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
          "line": 187,
          "function": "my_profile",
          "tables": [
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 71,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1239
                },
                {
                  "file": "init_db.py",
                  "line": 594
                }
              ]
            },
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 180,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1239
                },
                {
                  "file": "init_db.py",
                  "line": 594
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 187,
              "function": "my_profile"
            },
            {
              "file": "faculty/__init__.py",
              "line": 70,
              "function": "load_profiles"
            },
            {
              "file": "app.py",
              "line": 1752,
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
              "line": 178,
              "function": "_save"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
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
          "line": 216,
          "function": "admin_faculty",
          "tables": [
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 231,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1239
                },
                {
                  "file": "init_db.py",
                  "line": 594
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
                  "file": "smart_ukn.sql",
                  "line": 1239
                },
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
              "line": 216,
              "function": "admin_faculty"
            },
            {
              "file": "faculty/__init__.py",
              "line": 66,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1778,
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
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "faculty/__init__.py",
              "line": 207,
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
          "line": 243,
          "function": "admin_faculty_item",
          "tables": [
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 253,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1239
                },
                {
                  "file": "init_db.py",
                  "line": 594
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 180,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1239
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1239
                },
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
              "line": 243,
              "function": "admin_faculty_item"
            },
            {
              "file": "app.py",
              "line": 1778,
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "faculty/__init__.py",
              "line": 178,
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
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "faculty/__init__.py",
              "line": 207,
              "function": "_require_admin"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 3172
        },
        {
          "file": "static/admin.html",
          "line": 3238
        },
        {
          "file": "static/admin.html",
          "line": 3249
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
          "line": 1401
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
              "line": 1809,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2793
                },
                {
                  "file": "init_db.py",
                  "line": 255
                }
              ]
            },
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 3427,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
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
              "line": 3524,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1302
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
              "line": 3524,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1331
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
              "line": 2977,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 746
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
              "line": 1738,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1471
                },
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
              "line": 1805,
              "function": "record_unmatched_query"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3425,
              "function": "load_synonyms"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 3521,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 2975,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1732,
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
          "line": 1844,
          "function": "search_knowledge",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 1858,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
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
              "line": 1862,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1302
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
              "line": 1862,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1331
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
              "line": 1738,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1471
                },
                {
                  "file": "init_db.py",
                  "line": 407
                }
              ]
            },
            {
              "name": "unmatched_queries",
              "file": "app.py",
              "line": 1809,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2793
                },
                {
                  "file": "init_db.py",
                  "line": 255
                }
              ]
            },
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2977,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 746
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
              "line": 1844,
              "function": "search_knowledge"
            },
            {
              "file": "app.py",
              "line": 182,
              "function": "format_updated_at"
            },
            {
              "file": "app.py",
              "line": 1732,
              "function": "log_search"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1805,
              "function": "record_unmatched_query"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 2975,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1752,
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
          "line": 1952,
          "function": "submit_search_feedback",
          "tables": [
            {
              "name": "search_feedback",
              "file": "app.py",
              "line": 1975,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1446
                },
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
              "line": 1952,
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
          "line": 1952,
          "function": "submit_search_feedback",
          "tables": [
            {
              "name": "search_feedback",
              "file": "app.py",
              "line": 1975,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1446
                },
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
              "line": 1952,
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
          "line": 3299,
          "function": "get_categories",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 3299,
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
          "line": 3451,
          "function": "manage_synonyms",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 3427,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
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
              "line": 3438,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "knowledge_categories",
              "file": "app.py",
              "line": 3433,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1331
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 3451,
              "function": "manage_synonyms"
            },
            {
              "file": "app.py",
              "line": 3425,
              "function": "load_synonyms"
            },
            {
              "file": "app.py",
              "line": 1752,
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
              "function": "add_synonym"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_roles_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/synonyms/<int:synonym_id>",
          "methods": [
            "PUT",
            "DELETE"
          ],
          "file": "app.py",
          "line": 3474,
          "function": "delete_synonym",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 3504,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
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
              "line": 3482,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
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
              "line": 3427,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 3474,
              "function": "delete_synonym"
            },
            {
              "file": "app.py",
              "line": 3425,
              "function": "load_synonyms"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 3558,
          "function": "manage_rules",
          "tables": [
            {
              "name": "knowledge_base",
              "file": "app.py",
              "line": 3569,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1302
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
              "line": 3524,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1302
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
              "line": 3524,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1331
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 3558,
              "function": "manage_rules"
            },
            {
              "file": "app.py",
              "line": 3521,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 3528,
              "function": "parse_rule_payload"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_roles_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 3585,
          "function": "update_or_delete_rule",
          "tables": [
            {
              "name": "knowledge_base",
              "file": "app.py",
              "line": 3594,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1302
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
              "line": 3607,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1302
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
              "line": 3524,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1302
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
              "line": 3524,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1331
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 3585,
              "function": "update_or_delete_rule"
            },
            {
              "file": "app.py",
              "line": 3521,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 3528,
              "function": "parse_rule_payload"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
                  "line": 2760
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
                  "line": 1302
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
                  "line": 1331
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
              "line": 1752,
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
                  "line": 2760
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
                  "line": 1302
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
                  "line": 1331
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
              "line": 1752,
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
                  "line": 1302
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
                  "line": 1331
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
              "line": 1752,
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
          "line": 2801
        },
        {
          "file": "static/admin.html",
          "line": 3710
        },
        {
          "file": "static/admin.html",
          "line": 3753
        },
        {
          "file": "static/admin.html",
          "line": 3791
        },
        {
          "file": "static/index.html",
          "line": 2881
        },
        {
          "file": "static/index.html",
          "line": 2905
        },
        {
          "file": "static/index.html",
          "line": 2978
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
          "line": 3022,
          "function": "manage_checklist_progress",
          "tables": [
            {
              "name": "checklist_progress",
              "file": "app.py",
              "line": 2989,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 780
                },
                {
                  "file": "init_db.py",
                  "line": 420
                }
              ]
            },
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2977,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 746
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
              "line": 3004,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 780
                },
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
              "line": 3022,
              "function": "manage_checklist_progress"
            },
            {
              "file": "app.py",
              "line": 2986,
              "function": "load_checklist_progress"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2975,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 2999,
              "function": "save_checklist_step"
            },
            {
              "file": "app.py",
              "line": 2235,
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
          "line": 3057,
          "function": "get_my_applications",
          "tables": [
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2977,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 746
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
              "line": 2989,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 780
                },
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
              "line": 3057,
              "function": "get_my_applications"
            },
            {
              "file": "app.py",
              "line": 2975,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2986,
              "function": "load_checklist_progress"
            },
            {
              "file": "app.py",
              "line": 2235,
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
          "line": 3304,
          "function": "manage_checklists",
          "tables": [
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 3340,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 746
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
              "line": 2977,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 746
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 3304,
              "function": "manage_checklists"
            },
            {
              "file": "app.py",
              "line": 2975,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_roles_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/checklists/<int:item_id>",
          "methods": [
            "PUT",
            "DELETE"
          ],
          "file": "app.py",
          "line": 3361,
          "function": "update_or_delete_checklist",
          "tables": [
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 3407,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 746
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
              "line": 3370,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 746
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
              "line": 2977,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 746
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 3361,
              "function": "update_or_delete_checklist"
            },
            {
              "file": "app.py",
              "line": 2975,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 2838
        },
        {
          "file": "static/admin.html",
          "line": 2922
        },
        {
          "file": "static/admin.html",
          "line": 2935
        },
        {
          "file": "static/index.html",
          "line": 1014
        },
        {
          "file": "static/index.html",
          "line": 3822
        },
        {
          "file": "static/index.html",
          "line": 3826
        },
        {
          "file": "static/index.html",
          "line": 3828
        },
        {
          "file": "static/index.html",
          "line": 3928
        },
        {
          "file": "static/index.html",
          "line": 3966
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
          "line": 1301,
          "function": "get_current_week",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 1301,
              "function": "get_current_week"
            },
            {
              "file": "app.py",
              "line": 1273,
              "function": "calendar_highlights"
            },
            {
              "file": "app.py",
              "line": 1245,
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
          "line": 1375,
          "function": "manage_deadlines",
          "tables": [
            {
              "name": "deadlines",
              "file": "app.py",
              "line": 1384,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1151
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
              "line": 1424,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1151
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 1375,
              "function": "manage_deadlines"
            },
            {
              "file": "app.py",
              "line": 1327,
              "function": "_compute_deadline_status"
            },
            {
              "file": "app.py",
              "line": 1319,
              "function": "_deadline_visible_to_role"
            },
            {
              "file": "app.py",
              "line": 1365,
              "function": "normalize_deadline_row"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_roles_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/deadlines/<int:deadline_id>",
          "methods": [
            "PUT",
            "DELETE"
          ],
          "file": "app.py",
          "line": 1442,
          "function": "update_or_delete_deadline",
          "tables": [
            {
              "name": "deadlines",
              "file": "app.py",
              "line": 1444,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1151
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
              "line": 1489,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1151
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
              "line": 1452,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1151
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 1442,
              "function": "update_or_delete_deadline"
            },
            {
              "file": "app.py",
              "line": 1327,
              "function": "_compute_deadline_status"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1365,
              "function": "normalize_deadline_row"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 1573,
          "function": "get_calendar_now",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1536,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 21
                },
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1522,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 21
                },
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1526,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 21
                },
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
              "line": 1573,
              "function": "get_calendar_now"
            },
            {
              "file": "app.py",
              "line": 1515,
              "function": "fetch_calendar_events"
            },
            {
              "file": "app.py",
              "line": 1507,
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
          "line": 1601,
          "function": "manage_academic_calendar",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1615,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 21
                },
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1632,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 21
                },
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1536,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 21
                },
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1522,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 21
                },
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1526,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 21
                },
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 1601,
              "function": "manage_academic_calendar"
            },
            {
              "file": "app.py",
              "line": 1515,
              "function": "fetch_calendar_events"
            },
            {
              "file": "app.py",
              "line": 1507,
              "function": "normalize_calendar_row"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1543,
              "function": "parse_calendar_payload"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_roles_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 1650,
          "function": "update_or_delete_academic_calendar",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1662,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 21
                },
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1676,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 21
                },
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1695,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 21
                },
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1668,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 21
                },
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1671,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 21
                },
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1704,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 21
                },
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1699,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 21
                },
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 1650,
              "function": "update_or_delete_academic_calendar"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1507,
              "function": "normalize_calendar_row"
            },
            {
              "file": "app.py",
              "line": 1543,
              "function": "parse_calendar_payload"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 4406,
          "function": "get_school_calendar",
          "tables": [
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2977,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 746
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
              "line": 4406,
              "function": "get_school_calendar"
            },
            {
              "file": "app.py",
              "line": 3627,
              "function": "load_quick_links"
            },
            {
              "file": "app.py",
              "line": 4378,
              "function": "_calendar_event_detail"
            },
            {
              "file": "school_calendar/actions.py",
              "line": 44,
              "function": "match_actions"
            },
            {
              "file": "app.py",
              "line": 2975,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1752,
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
          "line": 4429,
          "function": "sync_school_calendar",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 4429,
              "function": "sync_school_calendar"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 143
                },
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
                  "file": "smart_ukn.sql",
                  "line": 172
                },
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 21
                },
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
                  "file": "smart_ukn.sql",
                  "line": 21
                },
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
                  "file": "smart_ukn.sql",
                  "line": 21
                },
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
                  "line": 1151
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
              "line": 1536,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 21
                },
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1522,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 21
                },
                {
                  "file": "init_db.py",
                  "line": 386
                }
              ]
            },
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1526,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 21
                },
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
                  "line": 746
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
              "line": 4612,
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
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
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
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 204,
              "function": "load_deadlines"
            },
            {
              "file": "app.py",
              "line": 1515,
              "function": "fetch_calendar_events"
            },
            {
              "file": "app.py",
              "line": 1507,
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
                  "file": "smart_ukn.sql",
                  "line": 21
                },
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
                  "file": "smart_ukn.sql",
                  "line": 21
                },
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
                  "file": "smart_ukn.sql",
                  "line": 21
                },
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
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
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
              "line": 1778,
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
                  "file": "smart_ukn.sql",
                  "line": 21
                },
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
                  "file": "smart_ukn.sql",
                  "line": 21
                },
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
                  "file": "smart_ukn.sql",
                  "line": 21
                },
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
                  "file": "smart_ukn.sql",
                  "line": 21
                },
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
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 209,
              "function": "my_events_bucket"
            },
            {
              "file": "app.py",
              "line": 1778,
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
          "line": 2612
        },
        {
          "file": "static/admin.html",
          "line": 2945
        },
        {
          "file": "static/admin.html",
          "line": 3006
        },
        {
          "file": "static/admin.html",
          "line": 3018
        },
        {
          "file": "static/admin.html",
          "line": 3916
        },
        {
          "file": "static/admin.html",
          "line": 3932
        },
        {
          "file": "static/admin.html",
          "line": 3946
        },
        {
          "file": "static/admin.html",
          "line": 4012
        },
        {
          "file": "static/admin.html",
          "line": 4032
        },
        {
          "file": "static/index.html",
          "line": 991
        },
        {
          "file": "static/index.html",
          "line": 1746
        },
        {
          "file": "static/index.html",
          "line": 2461
        },
        {
          "file": "static/index.html",
          "line": 2861
        },
        {
          "file": "static/index.html",
          "line": 3215
        },
        {
          "file": "static/index.html",
          "line": 3252
        },
        {
          "file": "static/index.html",
          "line": 4423
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
          "line": 426
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 469
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
          "line": 3875,
          "function": "match_scholarships",
          "tables": [
            {
              "name": "scholarships",
              "file": "app.py",
              "line": 3727,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1406
                },
                {
                  "file": "init_db.py",
                  "line": 557
                }
              ]
            },
            {
              "name": "departments",
              "file": "app.py",
              "line": 3765,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
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
              "line": 3756,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1609
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
              "line": 3735,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 3875,
              "function": "match_scholarships"
            },
            {
              "file": "app.py",
              "line": 3720,
              "function": "_split_list"
            },
            {
              "file": "app.py",
              "line": 3806,
              "function": "evaluate_scholarship"
            },
            {
              "file": "app.py",
              "line": 3803,
              "function": "_fmt"
            },
            {
              "file": "app.py",
              "line": 3726,
              "function": "load_scholarships"
            },
            {
              "file": "app.py",
              "line": 3716,
              "function": "_num"
            },
            {
              "file": "app.py",
              "line": 3723,
              "function": "_date_str"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3764,
              "function": "department_names"
            },
            {
              "file": "app.py",
              "line": 3754,
              "function": "latest_semester_fails"
            },
            {
              "file": "app.py",
              "line": 3733,
              "function": "load_scholarship_profile"
            },
            {
              "file": "app.py",
              "line": 1245,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 2235,
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
          "line": 3978,
          "function": "notify_scholarship_and_warning",
          "tables": [
            {
              "name": "notification_log",
              "file": "app.py",
              "line": 3939,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 732
                }
              ]
            },
            {
              "name": "notification_log",
              "file": "app.py",
              "line": 3948,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 732
                }
              ]
            },
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 3756,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1609
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
              "line": 2227,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1609
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
              "line": 3735,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 3931,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
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
              "line": 3098,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2552
                },
                {
                  "file": "init_db.py",
                  "line": 285
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 4492,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 3727,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1406
                },
                {
                  "file": "init_db.py",
                  "line": 557
                }
              ]
            },
            {
              "name": "departments",
              "file": "app.py",
              "line": 3765,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
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
              "line": 3978,
              "function": "notify_scholarship_and_warning"
            },
            {
              "file": "app.py",
              "line": 3806,
              "function": "evaluate_scholarship"
            },
            {
              "file": "app.py",
              "line": 3803,
              "function": "_fmt"
            },
            {
              "file": "app.py",
              "line": 3720,
              "function": "_split_list"
            },
            {
              "file": "attendance/notify.py",
              "line": 27,
              "function": "campus_email"
            },
            {
              "file": "app.py",
              "line": 3963,
              "function": "_notify_once"
            },
            {
              "file": "app.py",
              "line": 3937,
              "function": "already_notified"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3946,
              "function": "mark_notified"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 3954,
              "function": "_send_once"
            },
            {
              "file": "app.py",
              "line": 3754,
              "function": "latest_semester_fails"
            },
            {
              "file": "app.py",
              "line": 3182,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 2219,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 2250,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2224,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 3733,
              "function": "load_scholarship_profile"
            },
            {
              "file": "app.py",
              "line": 1245,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 3716,
              "function": "_num"
            },
            {
              "file": "app.py",
              "line": 3929,
              "function": "find_parent_account"
            },
            {
              "file": "app.py",
              "line": 3095,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 4491,
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
              "line": 3726,
              "function": "load_scholarships"
            },
            {
              "file": "app.py",
              "line": 3723,
              "function": "_date_str"
            },
            {
              "file": "app.py",
              "line": 3764,
              "function": "department_names"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 4187
        },
        {
          "file": "static/index.html",
          "line": 1889
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
          "line": 142,
          "function": "dorm_mine",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 142,
              "function": "dorm_mine"
            },
            {
              "file": "campus/services.py",
              "line": 136,
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
          "line": 152,
          "function": "dorm_apply",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 152,
              "function": "dorm_apply"
            },
            {
              "file": "campus/services.py",
              "line": 136,
              "function": "dorm_apps"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
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
          "line": 188,
          "function": "dorm_all",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 188,
              "function": "dorm_all"
            },
            {
              "file": "campus/services.py",
              "line": 136,
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
          "line": 195,
          "function": "dorm_update",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 195,
              "function": "dorm_update"
            },
            {
              "file": "campus/services.py",
              "line": 136,
              "function": "dorm_apps"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
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
          "line": 189,
          "function": "rooms_availability",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 94,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
              "line": 189,
              "function": "rooms_availability"
            },
            {
              "file": "campus/facilities.py",
              "line": 106,
              "function": "room_code"
            },
            {
              "file": "campus/facilities.py",
              "line": 184,
              "function": "bookings"
            },
            {
              "file": "campus/facilities.py",
              "line": 93,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1752,
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
          "line": 218,
          "function": "book_room",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 94,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
              "line": 218,
              "function": "book_room"
            },
            {
              "file": "campus/facilities.py",
              "line": 106,
              "function": "room_code"
            },
            {
              "file": "campus/facilities.py",
              "line": 184,
              "function": "bookings"
            },
            {
              "file": "campus/facilities.py",
              "line": 93,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1752,
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
          "line": 264,
          "function": "my_bookings",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 264,
              "function": "my_bookings"
            },
            {
              "file": "campus/facilities.py",
              "line": 184,
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
          "line": 279,
          "function": "update_booking",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 279,
              "function": "update_booking"
            },
            {
              "file": "campus/facilities.py",
              "line": 184,
              "function": "bookings"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
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
          "line": 322,
          "function": "list_lockers",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 322,
              "function": "list_lockers"
            },
            {
              "file": "campus/facilities.py",
              "line": 309,
              "function": "expire_holds"
            },
            {
              "file": "campus/facilities.py",
              "line": 305,
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
          "line": 345,
          "function": "reserve_locker",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 345,
              "function": "reserve_locker"
            },
            {
              "file": "campus/facilities.py",
              "line": 309,
              "function": "expire_holds"
            },
            {
              "file": "campus/facilities.py",
              "line": 305,
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
          "line": 364,
          "function": "cancel_locker",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 364,
              "function": "cancel_locker"
            },
            {
              "file": "campus/facilities.py",
              "line": 305,
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
          "line": 378,
          "function": "lockers_admin",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 378,
              "function": "lockers_admin"
            },
            {
              "file": "campus/facilities.py",
              "line": 309,
              "function": "expire_holds"
            },
            {
              "file": "campus/facilities.py",
              "line": 305,
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
          "line": 400,
          "function": "locker_paid",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 400,
              "function": "locker_paid"
            },
            {
              "file": "campus/facilities.py",
              "line": 305,
              "function": "lockers"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 2623
        },
        {
          "file": "static/admin.html",
          "line": 2640
        },
        {
          "file": "static/admin.html",
          "line": 2671
        },
        {
          "file": "static/admin.html",
          "line": 2686
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
          "line": 113,
          "function": "campus_map",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 113,
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
          "line": 120,
          "function": "find_place",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 120,
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
          "line": 424,
          "function": "crowd",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 94,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
              "line": 424,
              "function": "crowd"
            },
            {
              "file": "campus/facilities.py",
              "line": 93,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/facilities.py",
              "line": 84,
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
          "line": 443
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
          "line": 3669,
          "function": "manage_quick_links",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 3669,
              "function": "manage_quick_links"
            },
            {
              "file": "app.py",
              "line": 3633,
              "function": "save_quick_links"
            },
            {
              "file": "app.py",
              "line": 3640,
              "function": "parse_link_payload"
            },
            {
              "file": "app.py",
              "line": 3627,
              "function": "load_quick_links"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 237,
              "function": "write_roles_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 3686,
          "function": "update_or_delete_quick_link",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 3686,
              "function": "update_or_delete_quick_link"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 3633,
              "function": "save_quick_links"
            },
            {
              "file": "app.py",
              "line": 3640,
              "function": "parse_link_payload"
            },
            {
              "file": "app.py",
              "line": 3627,
              "function": "load_quick_links"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 3803
        },
        {
          "file": "static/admin.html",
          "line": 3880
        },
        {
          "file": "static/admin.html",
          "line": 3901
        },
        {
          "file": "static/index.html",
          "line": 2012
        },
        {
          "file": "static/index.html",
          "line": 2386
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
          "line": 364,
          "function": "send_notice",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 1509
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "campus/messaging.py",
              "line": 184,
              "function": "add_notice"
            },
            {
              "file": "app.py",
              "line": 1778,
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
              "line": 1752,
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 1509
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
              "line": 1752,
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
              "line": 1778,
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 1509
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
              "line": 1752,
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
              "line": 1778,
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 1509
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1752,
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 1509
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
              "line": 1752,
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
              "line": 1778,
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 1509
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
              "line": 1752,
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
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
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
                  "file": "smart_ukn.sql",
                  "line": 2575
                },
                {
                  "file": "init_db.py",
                  "line": 884
                }
              ]
            },
            {
              "name": "student_records",
              "file": "campus/records.py",
              "line": 54,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2575
                },
                {
                  "file": "init_db.py",
                  "line": 884
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
              "line": 1752,
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
                  "file": "smart_ukn.sql",
                  "line": 2575
                },
                {
                  "file": "init_db.py",
                  "line": 884
                }
              ]
            },
            {
              "name": "student_records",
              "file": "campus/records.py",
              "line": 54,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2575
                },
                {
                  "file": "init_db.py",
                  "line": 884
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
                  "file": "smart_ukn.sql",
                  "line": 2575
                },
                {
                  "file": "init_db.py",
                  "line": 884
                }
              ]
            },
            {
              "name": "student_records",
              "file": "campus/records.py",
              "line": 82,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2575
                },
                {
                  "file": "init_db.py",
                  "line": 884
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
              "line": 1752,
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "campus/records.py",
              "line": 100,
              "function": "delete_record"
            },
            {
              "file": "app.py",
              "line": 1778,
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
                  "file": "smart_ukn.sql",
                  "line": 2575
                },
                {
                  "file": "init_db.py",
                  "line": 884
                }
              ]
            },
            {
              "name": "student_records",
              "file": "campus/records.py",
              "line": 54,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2575
                },
                {
                  "file": "init_db.py",
                  "line": 884
                }
              ]
            },
            {
              "name": "student_records",
              "file": "campus/records.py",
              "line": 95,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2575
                },
                {
                  "file": "init_db.py",
                  "line": 884
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
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
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "campus/records.py",
              "line": 53,
              "function": "use_db"
            },
            {
              "file": "app.py",
              "line": 1752,
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
                  "file": "smart_ukn.sql",
                  "line": 2575
                },
                {
                  "file": "init_db.py",
                  "line": 884
                }
              ]
            },
            {
              "name": "student_records",
              "file": "campus/records.py",
              "line": 54,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2575
                },
                {
                  "file": "init_db.py",
                  "line": 884
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
              "line": 1752,
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
          "line": 1405
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
          "line": 495
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
          "line": 3108,
          "function": "manage_privacy_consent",
          "tables": [
            {
              "name": "student_privacy_settings",
              "file": "app.py",
              "line": 3129,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2552
                },
                {
                  "file": "init_db.py",
                  "line": 285
                }
              ]
            },
            {
              "name": "student_privacy_settings",
              "file": "app.py",
              "line": 3098,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2552
                },
                {
                  "file": "init_db.py",
                  "line": 285
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 3108,
              "function": "manage_privacy_consent"
            },
            {
              "file": "app.py",
              "line": 3095,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 2235,
              "function": "current_student_id"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 3146,
          "function": "manage_emergency_contact",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 3167,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 3160,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 3146,
              "function": "manage_emergency_contact"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 2235,
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
          "line": 3769,
          "function": "list_departments_with_intro",
          "tables": [
            {
              "name": "departments",
              "file": "app.py",
              "line": 3771,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
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
              "line": 3769,
              "function": "list_departments_with_intro"
            },
            {
              "file": "app.py",
              "line": 1752,
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
                  "file": "smart_ukn.sql",
                  "line": 2942
                },
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
                  "line": 1509
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
                  "file": "smart_ukn.sql",
                  "line": 2942
                },
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
                  "line": 1182
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
              "line": 1778,
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
              "line": 1752,
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
          "line": 4378
        },
        {
          "file": "static/index.html",
          "line": 4387
        },
        {
          "file": "static/index.html",
          "line": 4402
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 711
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
                  "file": "smart_ukn.sql",
                  "line": 50
                },
                {
                  "file": "init_db.py",
                  "line": 699
                }
              ]
            },
            {
              "name": "anniversary_wishes",
              "file": "anniversary/__init__.py",
              "line": 81,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 75
                },
                {
                  "file": "init_db.py",
                  "line": 715
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
              "line": 1752,
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
                  "file": "smart_ukn.sql",
                  "line": 50
                },
                {
                  "file": "init_db.py",
                  "line": 699
                }
              ]
            },
            {
              "name": "anniversary_wishes",
              "file": "anniversary/__init__.py",
              "line": 94,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 75
                },
                {
                  "file": "init_db.py",
                  "line": 715
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
              "line": 1752,
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
              "line": 1778,
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
                  "file": "smart_ukn.sql",
                  "line": 75
                },
                {
                  "file": "init_db.py",
                  "line": 715
                }
              ]
            },
            {
              "name": "anniversary_events",
              "file": "anniversary/__init__.py",
              "line": 72,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 50
                },
                {
                  "file": "init_db.py",
                  "line": 699
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
              "line": 1752,
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
                  "file": "smart_ukn.sql",
                  "line": 50
                },
                {
                  "file": "init_db.py",
                  "line": 699
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1778,
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
                  "file": "smart_ukn.sql",
                  "line": 50
                },
                {
                  "file": "init_db.py",
                  "line": 699
                }
              ]
            },
            {
              "name": "anniversary_events",
              "file": "anniversary/__init__.py",
              "line": 263,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 50
                },
                {
                  "file": "init_db.py",
                  "line": 699
                }
              ]
            },
            {
              "name": "anniversary_events",
              "file": "anniversary/__init__.py",
              "line": 72,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 50
                },
                {
                  "file": "init_db.py",
                  "line": 699
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 52,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
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
                  "file": "smart_ukn.sql",
                  "line": 75
                },
                {
                  "file": "init_db.py",
                  "line": 715
                }
              ]
            },
            {
              "name": "anniversary_wishes",
              "file": "anniversary/__init__.py",
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 75
                },
                {
                  "file": "init_db.py",
                  "line": 715
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
                  "file": "smart_ukn.sql",
                  "line": 75
                },
                {
                  "file": "init_db.py",
                  "line": 715
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
              "line": 1778,
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
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
              "line": 1752,
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
          "line": 3269
        },
        {
          "file": "static/admin.html",
          "line": 3341
        },
        {
          "file": "static/admin.html",
          "line": 3354
        },
        {
          "file": "static/admin.html",
          "line": 3388
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
          "line": 2647
        },
        {
          "file": "static/admin.html",
          "line": 2664
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 758
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 774
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 782
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
          "line": 298,
          "function": "affairs_mine",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 298,
              "function": "affairs_mine"
            },
            {
              "file": "campus/services.py",
              "line": 287,
              "function": "project_status"
            },
            {
              "file": "campus/services.py",
              "line": 251,
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
          "line": 307,
          "function": "affairs_check",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 307,
              "function": "affairs_check"
            },
            {
              "file": "campus/services.py",
              "line": 255,
              "function": "check_form"
            },
            {
              "file": "campus/services.py",
              "line": 251,
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
          "line": 320,
          "function": "affairs_submit",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 320,
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
              "line": 251,
              "function": "affairs_submissions"
            },
            {
              "file": "campus/services.py",
              "line": 255,
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
          "line": 406,
          "function": "scholarships",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2227,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1609
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
              "line": 406,
              "function": "scholarships"
            },
            {
              "file": "campus/services.py",
              "line": 386,
              "function": "auto_answers"
            },
            {
              "file": "app.py",
              "line": 2224,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 1752,
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
                  "file": "smart_ukn.sql",
                  "line": 21
                },
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
                  "file": "smart_ukn.sql",
                  "line": 21
                },
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
                  "file": "smart_ukn.sql",
                  "line": 21
                },
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 143
                },
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
                  "file": "smart_ukn.sql",
                  "line": 172
                },
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
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
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 4612,
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 1509
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
              "line": 1752,
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
              "line": 1778,
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 1509
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
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
              "line": 1752,
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
              "line": 1778,
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 1509
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
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
              "line": 1752,
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
              "line": 1778,
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 1509
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
              "line": 1752,
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
              "line": 1778,
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 1509
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
              "line": 1752,
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
              "line": 1778,
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 1509
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
                  "line": 1182
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
              "line": 1752,
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
              "line": 1778,
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 1509
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
                  "line": 1182
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "campus/messaging.py",
              "line": 184,
              "function": "add_notice"
            },
            {
              "file": "app.py",
              "line": 1778,
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
              "line": 1752,
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
                  "line": 814
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 1509
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
                  "line": 814
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
              "line": 1752,
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
              "line": 1778,
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
                  "line": 814
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 803
                },
                {
                  "file": "init_db.py",
                  "line": 762
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
                  "line": 854
                },
                {
                  "file": "init_db.py",
                  "line": 783
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
                  "line": 1509
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
                  "line": 830
                },
                {
                  "file": "init_db.py",
                  "line": 772
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
                  "line": 889
                },
                {
                  "file": "init_db.py",
                  "line": 803
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
                  "line": 814
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
              "line": 1752,
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
              "line": 1778,
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
          "line": 340
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
                  "file": "smart_ukn.sql",
                  "line": 2942
                },
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
                  "file": "smart_ukn.sql",
                  "line": 2942
                },
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
                  "file": "smart_ukn.sql",
                  "line": 2942
                },
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
                  "file": "smart_ukn.sql",
                  "line": 2942
                },
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
                  "line": 2820
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
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1778,
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
          "line": 278
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 293
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
          "line": 186,
          "function": "config",
          "tables": [
            {
              "name": "users",
              "file": "campus/admin_cases.py",
              "line": 42,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
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
              "line": 32,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 186,
              "function": "config"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 38,
              "function": "assignments"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 50,
              "function": "cases"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 54,
              "function": "offices"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 149,
              "function": "validate_workflow"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 31,
              "function": "accounts"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 58,
              "function": "workflows"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            }
          ],
          "storage": [
            "data/campus_store.json → admin_cases",
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
          "line": 243,
          "function": "collection",
          "tables": [
            {
              "name": "users",
              "file": "campus/admin_cases.py",
              "line": 42,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
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
              "line": 243,
              "function": "collection"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 23,
              "function": "today"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 58,
              "function": "workflows"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 50,
              "function": "cases"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 81,
              "function": "visible"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 69,
              "function": "can_manage"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 38,
              "function": "assignments"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 63,
              "function": "owns"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 86,
              "function": "payload"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 27,
              "function": "stamp"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 142,
              "function": "text"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 97,
              "function": "history"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 128,
              "function": "save_files"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 106,
              "function": "upload_root"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 110,
              "function": "read_uploads"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 135,
              "function": "form_data"
            }
          ],
          "storage": [
            "data/campus_store.json → admin_cases",
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
          "line": 294,
          "function": "case_detail",
          "tables": [
            {
              "name": "users",
              "file": "campus/admin_cases.py",
              "line": 42,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
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
              "line": 32,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 294,
              "function": "case_detail"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 23,
              "function": "today"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 38,
              "function": "assignments"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 31,
              "function": "accounts"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 54,
              "function": "offices"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 142,
              "function": "text"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 27,
              "function": "stamp"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 86,
              "function": "payload"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 63,
              "function": "owns"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 69,
              "function": "can_manage"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 50,
              "function": "cases"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 128,
              "function": "save_files"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 106,
              "function": "upload_root"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 110,
              "function": "read_uploads"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 81,
              "function": "visible"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 97,
              "function": "history"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 135,
              "function": "form_data"
            }
          ],
          "storage": [
            "data/campus_store.json → admin_cases",
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
          "line": 395,
          "function": "download",
          "tables": [
            {
              "name": "users",
              "file": "campus/admin_cases.py",
              "line": 42,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
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
              "line": 395,
              "function": "download"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 81,
              "function": "visible"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 69,
              "function": "can_manage"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 38,
              "function": "assignments"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 63,
              "function": "owns"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 50,
              "function": "cases"
            },
            {
              "file": "campus/admin_cases.py",
              "line": 106,
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
          "line": 107
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 115
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 201
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 237
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 246
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
          "url": "/api/admin/db-status",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 154,
          "function": "get_db_status",
          "tables": [],
          "files": [
            {
              "file": "admin_core.py",
              "line": 154,
              "function": "get_db_status"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/users",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 191,
          "function": "list_users",
          "tables": [
            {
              "name": "users",
              "file": "admin_core.py",
              "line": 196,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            },
            {
              "name": "students",
              "file": "admin_core.py",
              "line": 196,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "file": "admin_core.py",
              "line": 191,
              "function": "list_users"
            },
            {
              "file": "admin_core.py",
              "line": 47,
              "function": "_sanitize_permissions"
            },
            {
              "file": "admin_core.py",
              "line": 39,
              "function": "_default_permissions_for_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/users",
          "methods": [
            "POST"
          ],
          "file": "admin_core.py",
          "line": 232,
          "function": "create_user",
          "tables": [
            {
              "name": "users",
              "file": "admin_core.py",
              "line": 268,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            },
            {
              "name": "users",
              "file": "admin_core.py",
              "line": 281,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            },
            {
              "name": "students",
              "file": "admin_core.py",
              "line": 273,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "students",
              "file": "admin_core.py",
              "line": 275,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "file": "admin_core.py",
              "line": 232,
              "function": "create_user"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            },
            {
              "file": "admin_core.py",
              "line": 47,
              "function": "_sanitize_permissions"
            },
            {
              "file": "admin_core.py",
              "line": 39,
              "function": "_default_permissions_for_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/users/<int:user_id>",
          "methods": [
            "PUT"
          ],
          "file": "admin_core.py",
          "line": 314,
          "function": "update_user",
          "tables": [
            {
              "name": "users",
              "file": "admin_core.py",
              "line": 317,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            },
            {
              "name": "users",
              "file": "admin_core.py",
              "line": 354,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            },
            {
              "name": "students",
              "file": "admin_core.py",
              "line": 370,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "users",
              "file": "admin_core.py",
              "line": 383,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            },
            {
              "name": "users",
              "file": "admin_core.py",
              "line": 389,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            },
            {
              "name": "students",
              "file": "admin_core.py",
              "line": 372,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "file": "admin_core.py",
              "line": 314,
              "function": "update_user"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            },
            {
              "file": "admin_core.py",
              "line": 47,
              "function": "_sanitize_permissions"
            },
            {
              "file": "admin_core.py",
              "line": 39,
              "function": "_default_permissions_for_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/users/<int:user_id>",
          "methods": [
            "DELETE"
          ],
          "file": "admin_core.py",
          "line": 424,
          "function": "delete_user",
          "tables": [
            {
              "name": "users",
              "file": "admin_core.py",
              "line": 425,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            },
            {
              "name": "users",
              "file": "admin_core.py",
              "line": 442,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            },
            {
              "name": "users",
              "file": "admin_core.py",
              "line": 436,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2820
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
              "file": "admin_core.py",
              "line": 424,
              "function": "delete_user"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/departments",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 459,
          "function": "list_departments",
          "tables": [
            {
              "name": "students",
              "file": "admin_core.py",
              "line": 460,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 460,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
                },
                {
                  "file": "init_db.py",
                  "line": 84
                }
              ]
            },
            {
              "name": "departments",
              "file": "admin_core.py",
              "line": 460,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
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
              "file": "admin_core.py",
              "line": 459,
              "function": "list_departments"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/departments",
          "methods": [
            "POST"
          ],
          "file": "admin_core.py",
          "line": 471,
          "function": "create_department",
          "tables": [
            {
              "name": "departments",
              "file": "admin_core.py",
              "line": 485,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            },
            {
              "name": "departments",
              "file": "admin_core.py",
              "line": 489,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            },
            {
              "name": "departments",
              "file": "admin_core.py",
              "line": 493,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
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
              "file": "admin_core.py",
              "line": 471,
              "function": "create_department"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/departments/<string:dept_id>",
          "methods": [
            "PUT"
          ],
          "file": "admin_core.py",
          "line": 512,
          "function": "update_department",
          "tables": [
            {
              "name": "departments",
              "file": "admin_core.py",
              "line": 515,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            },
            {
              "name": "departments",
              "file": "admin_core.py",
              "line": 526,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            },
            {
              "name": "departments",
              "file": "admin_core.py",
              "line": 530,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
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
              "file": "admin_core.py",
              "line": 512,
              "function": "update_department"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/departments/<string:dept_id>",
          "methods": [
            "DELETE"
          ],
          "file": "admin_core.py",
          "line": 550,
          "function": "delete_department",
          "tables": [
            {
              "name": "departments",
              "file": "admin_core.py",
              "line": 552,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            },
            {
              "name": "students",
              "file": "admin_core.py",
              "line": 557,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 558,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
                },
                {
                  "file": "init_db.py",
                  "line": 84
                }
              ]
            },
            {
              "name": "graduation_requirements",
              "file": "admin_core.py",
              "line": 559,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1275
                },
                {
                  "file": "init_db.py",
                  "line": 299
                }
              ]
            },
            {
              "name": "departments",
              "file": "admin_core.py",
              "line": 569,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
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
              "file": "admin_core.py",
              "line": 550,
              "function": "delete_department"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/course-map",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 602,
          "function": "list_course_map",
          "tables": [
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 607,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
                },
                {
                  "file": "init_db.py",
                  "line": 84
                }
              ]
            },
            {
              "name": "departments",
              "file": "admin_core.py",
              "line": 607,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
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
              "file": "admin_core.py",
              "line": 602,
              "function": "list_course_map"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/course-map",
          "methods": [
            "POST"
          ],
          "file": "admin_core.py",
          "line": 636,
          "function": "create_course",
          "tables": [
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 662,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
                },
                {
                  "file": "init_db.py",
                  "line": 84
                }
              ]
            },
            {
              "name": "departments",
              "file": "admin_core.py",
              "line": 675,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            },
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 680,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
                },
                {
                  "file": "init_db.py",
                  "line": 84
                }
              ]
            },
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 670,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
                },
                {
                  "file": "init_db.py",
                  "line": 84
                }
              ]
            },
            {
              "name": "departments",
              "file": "admin_core.py",
              "line": 677,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
                },
                {
                  "file": "init_db.py",
                  "line": 41
                }
              ]
            },
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 596,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
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
              "file": "admin_core.py",
              "line": 636,
              "function": "create_course"
            },
            {
              "file": "admin_core.py",
              "line": 584,
              "function": "_has_circular_prerequisite"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/course-map/<string:course_id>",
          "methods": [
            "PUT"
          ],
          "file": "admin_core.py",
          "line": 704,
          "function": "update_course",
          "tables": [
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 707,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
                },
                {
                  "file": "init_db.py",
                  "line": 84
                }
              ]
            },
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 739,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
                },
                {
                  "file": "init_db.py",
                  "line": 84
                }
              ]
            },
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 729,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
                },
                {
                  "file": "init_db.py",
                  "line": 84
                }
              ]
            },
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 596,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
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
              "file": "admin_core.py",
              "line": 704,
              "function": "update_course"
            },
            {
              "file": "admin_core.py",
              "line": 584,
              "function": "_has_circular_prerequisite"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/course-map/<string:course_id>",
          "methods": [
            "DELETE"
          ],
          "file": "admin_core.py",
          "line": 767,
          "function": "delete_course",
          "tables": [
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 769,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
                },
                {
                  "file": "init_db.py",
                  "line": 84
                }
              ]
            },
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 774,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
                },
                {
                  "file": "init_db.py",
                  "line": 84
                }
              ]
            },
            {
              "name": "student_credits",
              "file": "admin_core.py",
              "line": 783,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1609
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            },
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 790,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
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
              "file": "admin_core.py",
              "line": 767,
              "function": "delete_course"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/graduation-requirements",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 840,
          "function": "list_graduation_requirements",
          "tables": [
            {
              "name": "graduation_requirements",
              "file": "admin_core.py",
              "line": 841,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1275
                },
                {
                  "file": "init_db.py",
                  "line": 299
                }
              ]
            },
            {
              "name": "departments",
              "file": "admin_core.py",
              "line": 841,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1182
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
              "file": "admin_core.py",
              "line": 840,
              "function": "list_graduation_requirements"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/graduation-requirements",
          "methods": [
            "POST"
          ],
          "file": "admin_core.py",
          "line": 851,
          "function": "create_graduation_requirement",
          "tables": [
            {
              "name": "graduation_requirements",
              "file": "admin_core.py",
              "line": 869,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1275
                },
                {
                  "file": "init_db.py",
                  "line": 299
                }
              ]
            },
            {
              "name": "graduation_requirements",
              "file": "admin_core.py",
              "line": 888,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1275
                },
                {
                  "file": "init_db.py",
                  "line": 299
                }
              ]
            },
            {
              "name": "graduation_requirements",
              "file": "admin_core.py",
              "line": 872,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1275
                },
                {
                  "file": "init_db.py",
                  "line": 299
                }
              ]
            }
          ],
          "files": [
            {
              "file": "admin_core.py",
              "line": 851,
              "function": "create_graduation_requirement"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            },
            {
              "file": "admin_core.py",
              "line": 805,
              "function": "_validate_grad_req_values"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/graduation-requirements/<int:req_id>",
          "methods": [
            "PUT"
          ],
          "file": "admin_core.py",
          "line": 909,
          "function": "update_graduation_requirement",
          "tables": [
            {
              "name": "graduation_requirements",
              "file": "admin_core.py",
              "line": 911,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1275
                },
                {
                  "file": "init_db.py",
                  "line": 299
                }
              ]
            },
            {
              "name": "graduation_requirements",
              "file": "admin_core.py",
              "line": 920,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1275
                },
                {
                  "file": "init_db.py",
                  "line": 299
                }
              ]
            }
          ],
          "files": [
            {
              "file": "admin_core.py",
              "line": 909,
              "function": "update_graduation_requirement"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            },
            {
              "file": "admin_core.py",
              "line": 805,
              "function": "_validate_grad_req_values"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/graduation-requirements/<int:req_id>",
          "methods": [
            "DELETE"
          ],
          "file": "admin_core.py",
          "line": 942,
          "function": "delete_graduation_requirement",
          "tables": [
            {
              "name": "graduation_requirements",
              "file": "admin_core.py",
              "line": 943,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1275
                },
                {
                  "file": "init_db.py",
                  "line": 299
                }
              ]
            },
            {
              "name": "graduation_requirements",
              "file": "admin_core.py",
              "line": 947,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1275
                },
                {
                  "file": "init_db.py",
                  "line": 299
                }
              ]
            }
          ],
          "files": [
            {
              "file": "admin_core.py",
              "line": 942,
              "function": "delete_graduation_requirement"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/knowledge-categories",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 964,
          "function": "list_knowledge_categories",
          "tables": [
            {
              "name": "knowledge_base",
              "file": "admin_core.py",
              "line": 965,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1302
                },
                {
                  "file": "init_db.py",
                  "line": 163
                }
              ]
            },
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 965,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "knowledge_categories",
              "file": "admin_core.py",
              "line": 965,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1331
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
              "file": "admin_core.py",
              "line": 964,
              "function": "list_knowledge_categories"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/knowledge-categories",
          "methods": [
            "POST"
          ],
          "file": "admin_core.py",
          "line": 976,
          "function": "create_knowledge_category",
          "tables": [
            {
              "name": "knowledge_categories",
              "file": "admin_core.py",
              "line": 990,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1331
                },
                {
                  "file": "init_db.py",
                  "line": 152
                }
              ]
            },
            {
              "name": "knowledge_categories",
              "file": "admin_core.py",
              "line": 994,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1331
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
              "file": "admin_core.py",
              "line": 976,
              "function": "create_knowledge_category"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/knowledge-categories/<int:category_id>",
          "methods": [
            "PUT"
          ],
          "file": "admin_core.py",
          "line": 1014,
          "function": "update_knowledge_category",
          "tables": [
            {
              "name": "knowledge_categories",
              "file": "admin_core.py",
              "line": 1016,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1331
                },
                {
                  "file": "init_db.py",
                  "line": 152
                }
              ]
            },
            {
              "name": "knowledge_categories",
              "file": "admin_core.py",
              "line": 1032,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1331
                },
                {
                  "file": "init_db.py",
                  "line": 152
                }
              ]
            },
            {
              "name": "knowledge_categories",
              "file": "admin_core.py",
              "line": 1036,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1331
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
              "file": "admin_core.py",
              "line": 1014,
              "function": "update_knowledge_category"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/knowledge-categories/<int:category_id>",
          "methods": [
            "DELETE"
          ],
          "file": "admin_core.py",
          "line": 1056,
          "function": "delete_knowledge_category",
          "tables": [
            {
              "name": "knowledge_categories",
              "file": "admin_core.py",
              "line": 1057,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1331
                },
                {
                  "file": "init_db.py",
                  "line": 152
                }
              ]
            },
            {
              "name": "knowledge_base",
              "file": "admin_core.py",
              "line": 1062,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1302
                },
                {
                  "file": "init_db.py",
                  "line": 163
                }
              ]
            },
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 1063,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "knowledge_categories",
              "file": "admin_core.py",
              "line": 1072,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1331
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
              "file": "admin_core.py",
              "line": 1056,
              "function": "delete_knowledge_category"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/synonyms",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 1089,
          "function": "list_synonyms",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 1093,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "knowledge_categories",
              "file": "admin_core.py",
              "line": 1093,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1331
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
              "file": "admin_core.py",
              "line": 1089,
              "function": "list_synonyms"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/synonyms",
          "methods": [
            "POST"
          ],
          "file": "admin_core.py",
          "line": 1115,
          "function": "create_synonym",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 1136,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 1140,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "knowledge_categories",
              "file": "admin_core.py",
              "line": 1123,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1331
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
              "file": "admin_core.py",
              "line": 1115,
              "function": "create_synonym"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/synonyms/<int:synonym_id>",
          "methods": [
            "PUT"
          ],
          "file": "admin_core.py",
          "line": 1163,
          "function": "update_synonym",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 1165,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 1181,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 1185,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            }
          ],
          "files": [
            {
              "file": "admin_core.py",
              "line": 1163,
              "function": "update_synonym"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/synonyms/<int:synonym_id>",
          "methods": [
            "DELETE"
          ],
          "file": "admin_core.py",
          "line": 1205,
          "function": "delete_synonym",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 1206,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 1210,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            }
          ],
          "files": [
            {
              "file": "admin_core.py",
              "line": 1205,
              "function": "delete_synonym"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/audit-logs",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 1231,
          "function": "list_audit_logs",
          "tables": [
            {
              "name": "audit_logs",
              "file": "admin_core.py",
              "line": 1240,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "file": "admin_core.py",
              "line": 1231,
              "function": "list_audit_logs"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/search-logs",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 1271,
          "function": "list_search_logs",
          "tables": [
            {
              "name": "search_logs",
              "file": "admin_core.py",
              "line": 1278,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1471
                },
                {
                  "file": "init_db.py",
                  "line": 407
                }
              ]
            },
            {
              "name": "search_logs",
              "file": "admin_core.py",
              "line": 1289,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1471
                },
                {
                  "file": "init_db.py",
                  "line": 407
                }
              ]
            },
            {
              "name": "search_logs",
              "file": "admin_core.py",
              "line": 1296,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1471
                },
                {
                  "file": "init_db.py",
                  "line": 407
                }
              ]
            }
          ],
          "files": [
            {
              "file": "admin_core.py",
              "line": 1271,
              "function": "list_search_logs"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/unmatched-queries",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 1322,
          "function": "list_unmatched_queries",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "admin_core.py",
              "line": 1324,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2793
                },
                {
                  "file": "init_db.py",
                  "line": 255
                }
              ]
            }
          ],
          "files": [
            {
              "file": "admin_core.py",
              "line": 1322,
              "function": "list_unmatched_queries"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/unmatched-queries/convert-synonym",
          "methods": [
            "POST"
          ],
          "file": "admin_core.py",
          "line": 1335,
          "function": "convert_unmatched_to_synonym",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 1353,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 1356,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 1360,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "unmatched_queries",
              "file": "admin_core.py",
              "line": 1368,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2793
                },
                {
                  "file": "init_db.py",
                  "line": 255
                }
              ]
            },
            {
              "name": "unmatched_queries",
              "file": "admin_core.py",
              "line": 1372,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2793
                },
                {
                  "file": "init_db.py",
                  "line": 255
                }
              ]
            }
          ],
          "files": [
            {
              "file": "admin_core.py",
              "line": 1335,
              "function": "convert_unmatched_to_synonym"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/unmatched-queries/<int:query_id>/status",
          "methods": [
            "PUT"
          ],
          "file": "admin_core.py",
          "line": 1398,
          "function": "update_unmatched_status",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "admin_core.py",
              "line": 1404,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2793
                },
                {
                  "file": "init_db.py",
                  "line": 255
                }
              ]
            },
            {
              "name": "unmatched_queries",
              "file": "admin_core.py",
              "line": 1408,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2793
                },
                {
                  "file": "init_db.py",
                  "line": 255
                }
              ]
            }
          ],
          "files": [
            {
              "file": "admin_core.py",
              "line": 1398,
              "function": "update_unmatched_status"
            },
            {
              "file": "admin_core.py",
              "line": 84,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 70,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/visitor-logs",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 1427,
          "function": "list_visitor_logs",
          "tables": [
            {
              "name": "visitor_logs",
              "file": "admin_core.py",
              "line": 1434,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2969
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
              "file": "admin_core.py",
              "line": 1427,
              "function": "list_visitor_logs"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/visitor-logs/export.csv",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 1447,
          "function": "export_visitor_logs",
          "tables": [
            {
              "name": "visitor_logs",
              "file": "admin_core.py",
              "line": 1448,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2969
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
              "file": "admin_core.py",
              "line": 1447,
              "function": "export_visitor_logs"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/student-credits",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 1466,
          "function": "list_student_credits",
          "tables": [
            {
              "name": "student_credits",
              "file": "admin_core.py",
              "line": 1472,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1609
                },
                {
                  "file": "init_db.py",
                  "line": 104
                }
              ]
            },
            {
              "name": "students",
              "file": "admin_core.py",
              "line": 1472,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 1472,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1010
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
              "file": "admin_core.py",
              "line": 1466,
              "function": "list_student_credits"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/attendance-records",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 1521,
          "function": "list_attendance_records",
          "tables": [
            {
              "name": "attendance_records",
              "file": "admin_core.py",
              "line": 1526,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 195
                },
                {
                  "file": "init_db.py",
                  "line": 434
                }
              ]
            },
            {
              "name": "students",
              "file": "admin_core.py",
              "line": 1526,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "file": "admin_core.py",
              "line": 1521,
              "function": "list_attendance_records"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/student-records",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 1567,
          "function": "list_student_records",
          "tables": [
            {
              "name": "student_records",
              "file": "admin_core.py",
              "line": 1573,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2575
                },
                {
                  "file": "init_db.py",
                  "line": 884
                }
              ]
            },
            {
              "name": "students",
              "file": "admin_core.py",
              "line": 1573,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "file": "admin_core.py",
              "line": 1567,
              "function": "list_student_records"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/missed-queries",
          "methods": [
            "GET"
          ],
          "file": "app.py",
          "line": 1996,
          "function": "get_missed_queries",
          "tables": [
            {
              "name": "search_logs",
              "file": "app.py",
              "line": 1998,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1471
                },
                {
                  "file": "init_db.py",
                  "line": 407
                }
              ]
            },
            {
              "name": "search_feedback",
              "file": "app.py",
              "line": 1999,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1446
                },
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
              "line": 1996,
              "function": "get_missed_queries"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 2028,
          "function": "get_search_stats",
          "tables": [
            {
              "name": "search_logs",
              "file": "app.py",
              "line": 2033,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1471
                },
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
              "line": 2028,
              "function": "get_search_stats"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 2053,
          "function": "get_unmatched_queries",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "app.py",
              "line": 1834,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2793
                },
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
              "line": 2053,
              "function": "get_unmatched_queries"
            },
            {
              "file": "app.py",
              "line": 1833,
              "function": "load_unmatched_queries"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 2059,
          "function": "convert_unmatched_to_synonym",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "app.py",
              "line": 2078,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2793
                },
                {
                  "file": "init_db.py",
                  "line": 255
                }
              ]
            },
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 3438,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
                },
                {
                  "file": "init_db.py",
                  "line": 182
                }
              ]
            },
            {
              "name": "knowledge_categories",
              "file": "app.py",
              "line": 3433,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1331
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 2059,
              "function": "convert_unmatched_to_synonym"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3430,
              "function": "add_synonym"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 2093,
          "function": "get_audit_logs",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 2095,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 2093,
              "function": "get_audit_logs"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 2112,
          "function": "run_self_check",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 2112,
              "function": "run_self_check"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 2142,
          "function": "get_visitor_logs",
          "tables": [
            {
              "name": "visitor_logs",
              "file": "app.py",
              "line": 2122,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2969
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
              "line": 2142,
              "function": "get_visitor_logs"
            },
            {
              "file": "app.py",
              "line": 2129,
              "function": "mask_phone"
            },
            {
              "file": "app.py",
              "line": 2119,
              "function": "load_visitor_logs"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2134,
              "function": "_visitor_days"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 2166,
          "function": "export_visitor_logs",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 2122,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2969
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
              "line": 2166,
              "function": "export_visitor_logs"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 2119,
              "function": "load_visitor_logs"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 2134,
              "function": "_visitor_days"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 2181,
          "function": "get_search_feedback_stats",
          "tables": [
            {
              "name": "search_feedback",
              "file": "app.py",
              "line": 2183,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1446
                },
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
              "line": 2181,
              "function": "get_search_feedback_stats"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 3799,
          "function": "list_visitor_faq",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 3799,
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
          "line": 4446,
          "function": "health_check",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 4446,
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
          "line": 4466,
          "function": "get_stats",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "app.py",
              "line": 1834,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2793
                },
                {
                  "file": "init_db.py",
                  "line": 255
                }
              ]
            },
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2977,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 746
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
              "line": 3427,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2760
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
              "line": 3524,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1302
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
              "line": 3524,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1331
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
              "line": 4466,
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
              "line": 1833,
              "function": "load_unmatched_queries"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 2975,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 3425,
              "function": "load_synonyms"
            },
            {
              "file": "app.py",
              "line": 3521,
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
          "line": 4641,
          "function": "link_moodle",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 4641,
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
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
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
          "line": 4852,
          "function": "staff_alerts",
          "tables": [
            {
              "name": "student_privacy_settings",
              "file": "app.py",
              "line": 3098,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2552
                },
                {
                  "file": "init_db.py",
                  "line": 285
                }
              ]
            },
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2227,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1609
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 119
                },
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
                  "file": "smart_ukn.sql",
                  "line": 143
                },
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
                  "file": "smart_ukn.sql",
                  "line": 172
                },
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
                  "file": "smart_ukn.sql",
                  "line": 919
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 90
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1354
                },
                {
                  "file": "init_db.py",
                  "line": 521
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 4492,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 2703,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 4852,
              "function": "staff_alerts"
            },
            {
              "file": "app.py",
              "line": 3095,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3182,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 2219,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 2250,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2224,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 4612,
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
              "line": 4491,
              "function": "list_students"
            },
            {
              "file": "app.py",
              "line": 4741,
              "function": "reviewable_student_ids"
            },
            {
              "file": "app.py",
              "line": 2702,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 202,
              "function": "_current_effective_role"
            },
            {
              "file": "app.py",
              "line": 194,
              "function": "_expand_allowed_roles"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/conduct-settings",
          "methods": [
            "GET"
          ],
          "file": "conduct/__init__.py",
          "line": 434,
          "function": "get_settings",
          "tables": [
            {
              "name": "conduct_settings",
              "file": "conduct/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 682
                }
              ]
            }
          ],
          "files": [
            {
              "file": "conduct/__init__.py",
              "line": 434,
              "function": "get_settings"
            },
            {
              "file": "conduct/__init__.py",
              "line": 82,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "conduct/__init__.py",
              "line": 425,
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
          "line": 443,
          "function": "preview_settings",
          "tables": [
            {
              "name": "conduct_settings",
              "file": "conduct/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 682
                }
              ]
            },
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 185,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 668
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 175,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 652
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 4492,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 443,
              "function": "preview_settings"
            },
            {
              "file": "conduct/__init__.py",
              "line": 82,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "conduct/__init__.py",
              "line": 407,
              "function": "compare_rules"
            },
            {
              "file": "conduct/__init__.py",
              "line": 194,
              "function": "build_report"
            },
            {
              "file": "app.py",
              "line": 5040,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1245,
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
              "line": 183,
              "function": "load_evaluations"
            },
            {
              "file": "conduct/__init__.py",
              "line": 173,
              "function": "load_records"
            },
            {
              "file": "app.py",
              "line": 4491,
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
              "line": 425,
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
          "line": 456,
          "function": "update_settings",
          "tables": [
            {
              "name": "conduct_settings",
              "file": "conduct/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 682
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 165,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 682
                }
              ]
            },
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 185,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 668
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 175,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 652
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 4492,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 456,
              "function": "update_settings"
            },
            {
              "file": "conduct/__init__.py",
              "line": 82,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 1752,
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "conduct/__init__.py",
              "line": 161,
              "function": "save_rules"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "conduct/__init__.py",
              "line": 407,
              "function": "compare_rules"
            },
            {
              "file": "conduct/__init__.py",
              "line": 194,
              "function": "build_report"
            },
            {
              "file": "app.py",
              "line": 5040,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1245,
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
              "line": 183,
              "function": "load_evaluations"
            },
            {
              "file": "conduct/__init__.py",
              "line": 173,
              "function": "load_records"
            },
            {
              "file": "app.py",
              "line": 4491,
              "function": "list_students"
            },
            {
              "file": "conduct/__init__.py",
              "line": 425,
              "function": "_settings_guard"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin.html",
          "line": 2692
        },
        {
          "file": "static/admin.html",
          "line": 2755
        },
        {
          "file": "static/admin.html",
          "line": 2775
        },
        {
          "file": "static/admin.html",
          "line": 3056
        },
        {
          "file": "static/admin.html",
          "line": 3144
        },
        {
          "file": "static/admin.html",
          "line": 3150
        },
        {
          "file": "static/admin.html",
          "line": 3159
        },
        {
          "file": "static/admin.html",
          "line": 3172
        },
        {
          "file": "static/admin.html",
          "line": 3238
        },
        {
          "file": "static/admin.html",
          "line": 3249
        },
        {
          "file": "static/admin.html",
          "line": 3269
        },
        {
          "file": "static/admin.html",
          "line": 3341
        },
        {
          "file": "static/admin.html",
          "line": 3354
        },
        {
          "file": "static/admin.html",
          "line": 3388
        },
        {
          "file": "static/admin.html",
          "line": 3400
        },
        {
          "file": "static/admin.html",
          "line": 3432
        },
        {
          "file": "static/admin.html",
          "line": 3492
        },
        {
          "file": "static/admin.html",
          "line": 3524
        },
        {
          "file": "static/admin.html",
          "line": 3774
        },
        {
          "file": "static/admin.html",
          "line": 3776
        },
        {
          "file": "static/admin.html",
          "line": 3932
        },
        {
          "file": "static/admin.html",
          "line": 4042
        },
        {
          "file": "static/admin.html",
          "line": 4056
        },
        {
          "file": "static/admin.html",
          "line": 4098
        },
        {
          "file": "static/admin.html",
          "line": 4141
        },
        {
          "file": "static/admin.html",
          "line": 4167
        },
        {
          "file": "static/admin.html",
          "line": 4187
        },
        {
          "file": "static/index.html",
          "line": 3159
        },
        {
          "file": "static/index.html",
          "line": 3184
        },
        {
          "file": "static/js/admin-core.js",
          "line": 90
        },
        {
          "file": "static/js/admin-core.js",
          "line": 266
        },
        {
          "file": "static/js/admin-core.js",
          "line": 519
        },
        {
          "file": "static/js/admin-core.js",
          "line": 522
        },
        {
          "file": "static/js/admin-core.js",
          "line": 545
        },
        {
          "file": "static/js/admin-core.js",
          "line": 566
        },
        {
          "file": "static/js/admin-core.js",
          "line": 581
        },
        {
          "file": "static/js/admin-core.js",
          "line": 693
        },
        {
          "file": "static/js/admin-core.js",
          "line": 696
        },
        {
          "file": "static/js/admin-core.js",
          "line": 713
        },
        {
          "file": "static/js/admin-core.js",
          "line": 752
        },
        {
          "file": "static/js/admin-core.js",
          "line": 896
        },
        {
          "file": "static/js/admin-core.js",
          "line": 899
        },
        {
          "file": "static/js/admin-core.js",
          "line": 917
        },
        {
          "file": "static/js/admin-core.js",
          "line": 932
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1034
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1037
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1049
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1064
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1164
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1167
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1184
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1204
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1286
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1289
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1301
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1325
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1436
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1495
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1550
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1597
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1402
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 554
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 712
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
              "line": 2977,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 746
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
              "line": 2975,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1752,
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
                  "line": 631
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
              "line": 1752,
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
                  "line": 631
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
                  "line": 631
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
                  "line": 631
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 2977,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 746
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
              "line": 1752,
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1778,
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
              "line": 2975,
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
                  "line": 631
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
                  "line": 631
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
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
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
              "line": 1752,
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
                  "line": 631
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
              "line": 1752,
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
                  "line": 631
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
                  "line": 631
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 1752,
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
              "line": 5018,
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
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/assistant/students",
          "methods": [
            "GET"
          ],
          "file": "campus/admin_cases.py",
          "line": 413,
          "function": "assistant_students",
          "tables": [],
          "files": [
            {
              "file": "campus/admin_cases.py",
              "line": 413,
              "function": "assistant_students"
            }
          ],
          "storage": []
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 262,
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
          "url": "/api/conduct/me",
          "methods": [
            "GET"
          ],
          "file": "conduct/__init__.py",
          "line": 282,
          "function": "my_conduct",
          "tables": [
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 185,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 668
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 175,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 652
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
                  "line": 682
                }
              ]
            }
          ],
          "files": [
            {
              "file": "conduct/__init__.py",
              "line": 282,
              "function": "my_conduct"
            },
            {
              "file": "conduct/__init__.py",
              "line": 262,
              "function": "_payload"
            },
            {
              "file": "conduct/__init__.py",
              "line": 253,
              "function": "can_manage"
            },
            {
              "file": "conduct/__init__.py",
              "line": 194,
              "function": "build_report"
            },
            {
              "file": "app.py",
              "line": 5040,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1245,
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
              "line": 183,
              "function": "load_evaluations"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "conduct/__init__.py",
              "line": 173,
              "function": "load_records"
            },
            {
              "file": "conduct/__init__.py",
              "line": 82,
              "function": "load_rules"
            },
            {
              "file": "conduct/__init__.py",
              "line": 243,
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
          "line": 290,
          "function": "manageable_students",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 4492,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1509
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
              "line": 290,
              "function": "manageable_students"
            },
            {
              "file": "app.py",
              "line": 4491,
              "function": "list_students"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "conduct/__init__.py",
              "line": 270,
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
          "line": 304,
          "function": "student_conduct",
          "tables": [
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 185,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 668
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 175,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 652
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
                  "line": 682
                }
              ]
            }
          ],
          "files": [
            {
              "file": "conduct/__init__.py",
              "line": 304,
              "function": "student_conduct"
            },
            {
              "file": "conduct/__init__.py",
              "line": 262,
              "function": "_payload"
            },
            {
              "file": "conduct/__init__.py",
              "line": 253,
              "function": "can_manage"
            },
            {
              "file": "conduct/__init__.py",
              "line": 194,
              "function": "build_report"
            },
            {
              "file": "app.py",
              "line": 5040,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1245,
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
              "line": 183,
              "function": "load_evaluations"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "conduct/__init__.py",
              "line": 173,
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
              "line": 270,
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
          "line": 317,
          "function": "add_record",
          "tables": [
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 343,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 652
                }
              ]
            },
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 185,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 668
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 175,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 652
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
                  "line": 682
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 317,
              "function": "add_record"
            },
            {
              "file": "conduct/__init__.py",
              "line": 262,
              "function": "_payload"
            },
            {
              "file": "conduct/__init__.py",
              "line": 253,
              "function": "can_manage"
            },
            {
              "file": "conduct/__init__.py",
              "line": 194,
              "function": "build_report"
            },
            {
              "file": "app.py",
              "line": 5040,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1245,
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
              "line": 183,
              "function": "load_evaluations"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "conduct/__init__.py",
              "line": 173,
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "conduct/__init__.py",
              "line": 270,
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
          "line": 356,
          "function": "delete_record",
          "tables": [
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 360,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 652
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 368,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 652
                }
              ]
            },
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 185,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 668
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 175,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 652
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
                  "line": 682
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 356,
              "function": "delete_record"
            },
            {
              "file": "conduct/__init__.py",
              "line": 262,
              "function": "_payload"
            },
            {
              "file": "conduct/__init__.py",
              "line": 253,
              "function": "can_manage"
            },
            {
              "file": "conduct/__init__.py",
              "line": 194,
              "function": "build_report"
            },
            {
              "file": "app.py",
              "line": 5040,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1245,
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
              "line": 183,
              "function": "load_evaluations"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "conduct/__init__.py",
              "line": 173,
              "function": "load_records"
            },
            {
              "file": "conduct/__init__.py",
              "line": 82,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "conduct/__init__.py",
              "line": 67,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "conduct/__init__.py",
              "line": 270,
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
          "line": 374,
          "function": "save_evaluation",
          "tables": [
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 396,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 668
                }
              ]
            },
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 185,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 668
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 175,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 652
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
                  "line": 682
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 292,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 378
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
              "line": 374,
              "function": "save_evaluation"
            },
            {
              "file": "conduct/__init__.py",
              "line": 262,
              "function": "_payload"
            },
            {
              "file": "conduct/__init__.py",
              "line": 253,
              "function": "can_manage"
            },
            {
              "file": "conduct/__init__.py",
              "line": 194,
              "function": "build_report"
            },
            {
              "file": "app.py",
              "line": 5040,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1245,
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
              "line": 183,
              "function": "load_evaluations"
            },
            {
              "file": "app.py",
              "line": 1752,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 161,
              "function": "get_db_connection"
            },
            {
              "file": "conduct/__init__.py",
              "line": 173,
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
              "line": 269,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 262,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1778,
              "function": "db_execute"
            },
            {
              "file": "conduct/__init__.py",
              "line": 270,
              "function": "_role_guard"
            }
          ],
          "storage": []
        }
      ],
      "frontend": []
    }
  ],
  "routeCount": 238,
  "schemaCount": 48,
  "schema": {
    "academic_calendar": [
      {
        "file": "smart_ukn.sql",
        "line": 21
      },
      {
        "file": "init_db.py",
        "line": 386
      }
    ],
    "anniversary_events": [
      {
        "file": "smart_ukn.sql",
        "line": 50
      },
      {
        "file": "init_db.py",
        "line": 699
      }
    ],
    "anniversary_wishes": [
      {
        "file": "smart_ukn.sql",
        "line": 75
      },
      {
        "file": "init_db.py",
        "line": 715
      }
    ],
    "announcements": [
      {
        "file": "smart_ukn.sql",
        "line": 90
      },
      {
        "file": "init_db.py",
        "line": 471
      }
    ],
    "announcement_reads": [
      {
        "file": "smart_ukn.sql",
        "line": 119
      },
      {
        "file": "init_db.py",
        "line": 484
      }
    ],
    "assignments": [
      {
        "file": "smart_ukn.sql",
        "line": 143
      },
      {
        "file": "init_db.py",
        "line": 495
      }
    ],
    "assignment_submissions": [
      {
        "file": "smart_ukn.sql",
        "line": 172
      },
      {
        "file": "init_db.py",
        "line": 510
      }
    ],
    "attendance_records": [
      {
        "file": "smart_ukn.sql",
        "line": 195
      },
      {
        "file": "init_db.py",
        "line": 434
      }
    ],
    "audit_logs": [
      {
        "file": "smart_ukn.sql",
        "line": 378
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
    "certificates": [
      {
        "file": "smart_ukn.sql",
        "line": 492
      },
      {
        "file": "init_db.py",
        "line": 121
      }
    ],
    "checklist_items": [
      {
        "file": "smart_ukn.sql",
        "line": 746
      },
      {
        "file": "init_db.py",
        "line": 195
      }
    ],
    "checklist_progress": [
      {
        "file": "smart_ukn.sql",
        "line": 780
      },
      {
        "file": "init_db.py",
        "line": 420
      }
    ],
    "class_groups": [
      {
        "file": "smart_ukn.sql",
        "line": 803
      },
      {
        "file": "init_db.py",
        "line": 762
      }
    ],
    "class_group_members": [
      {
        "file": "smart_ukn.sql",
        "line": 830
      },
      {
        "file": "init_db.py",
        "line": 772
      }
    ],
    "class_notices": [
      {
        "file": "smart_ukn.sql",
        "line": 854
      },
      {
        "file": "init_db.py",
        "line": 783
      }
    ],
    "class_notice_recipients": [
      {
        "file": "smart_ukn.sql",
        "line": 889
      },
      {
        "file": "init_db.py",
        "line": 803
      }
    ],
    "class_schedule": [
      {
        "file": "smart_ukn.sql",
        "line": 919
      },
      {
        "file": "init_db.py",
        "line": 454
      }
    ],
    "counseling_records": [
      {
        "file": "smart_ukn.sql",
        "line": 974
      },
      {
        "file": "init_db.py",
        "line": 851
      }
    ],
    "course_map": [
      {
        "file": "smart_ukn.sql",
        "line": 1010
      },
      {
        "file": "init_db.py",
        "line": 84
      }
    ],
    "deadlines": [
      {
        "file": "smart_ukn.sql",
        "line": 1151
      },
      {
        "file": "init_db.py",
        "line": 342
      }
    ],
    "departments": [
      {
        "file": "smart_ukn.sql",
        "line": 1182
      },
      {
        "file": "init_db.py",
        "line": 41
      }
    ],
    "dorm_applications": [
      {
        "file": "smart_ukn.sql",
        "line": 1208
      }
    ],
    "faculty_profiles": [
      {
        "file": "smart_ukn.sql",
        "line": 1239
      },
      {
        "file": "init_db.py",
        "line": 594
      }
    ],
    "graduation_requirements": [
      {
        "file": "smart_ukn.sql",
        "line": 1275
      },
      {
        "file": "init_db.py",
        "line": 299
      }
    ],
    "knowledge_base": [
      {
        "file": "smart_ukn.sql",
        "line": 1302
      },
      {
        "file": "init_db.py",
        "line": 163
      }
    ],
    "knowledge_categories": [
      {
        "file": "smart_ukn.sql",
        "line": 1331
      },
      {
        "file": "init_db.py",
        "line": 152
      }
    ],
    "leave_requests": [
      {
        "file": "smart_ukn.sql",
        "line": 1354
      },
      {
        "file": "init_db.py",
        "line": 521
      }
    ],
    "moodle_links": [
      {
        "file": "smart_ukn.sql",
        "line": 1385
      }
    ],
    "scholarships": [
      {
        "file": "smart_ukn.sql",
        "line": 1406
      },
      {
        "file": "init_db.py",
        "line": 557
      }
    ],
    "search_feedback": [
      {
        "file": "smart_ukn.sql",
        "line": 1446
      },
      {
        "file": "init_db.py",
        "line": 270
      }
    ],
    "search_logs": [
      {
        "file": "smart_ukn.sql",
        "line": 1471
      },
      {
        "file": "init_db.py",
        "line": 407
      }
    ],
    "self_reviews": [
      {
        "file": "smart_ukn.sql",
        "line": 1492
      },
      {
        "file": "init_db.py",
        "line": 613
      }
    ],
    "students": [
      {
        "file": "smart_ukn.sql",
        "line": 1509
      },
      {
        "file": "init_db.py",
        "line": 51
      }
    ],
    "student_credits": [
      {
        "file": "smart_ukn.sql",
        "line": 1609
      },
      {
        "file": "init_db.py",
        "line": 104
      }
    ],
    "student_privacy_settings": [
      {
        "file": "smart_ukn.sql",
        "line": 2552
      },
      {
        "file": "init_db.py",
        "line": 285
      }
    ],
    "student_records": [
      {
        "file": "smart_ukn.sql",
        "line": 2575
      },
      {
        "file": "init_db.py",
        "line": 884
      }
    ],
    "synonym_dictionary": [
      {
        "file": "smart_ukn.sql",
        "line": 2760
      },
      {
        "file": "init_db.py",
        "line": 182
      }
    ],
    "unmatched_queries": [
      {
        "file": "smart_ukn.sql",
        "line": 2793
      },
      {
        "file": "init_db.py",
        "line": 255
      }
    ],
    "users": [
      {
        "file": "smart_ukn.sql",
        "line": 2820
      },
      {
        "file": "init_db.py",
        "line": 66
      }
    ],
    "user_preferences": [
      {
        "file": "smart_ukn.sql",
        "line": 2942
      },
      {
        "file": "init_db.py",
        "line": 580
      }
    ],
    "visitor_logs": [
      {
        "file": "smart_ukn.sql",
        "line": 2969
      },
      {
        "file": "init_db.py",
        "line": 317
      }
    ],
    "application_progress": [
      {
        "file": "init_db.py",
        "line": 236
      }
    ],
    "online_applications": [
      {
        "file": "init_db.py",
        "line": 631
      }
    ],
    "conduct_records": [
      {
        "file": "init_db.py",
        "line": 652
      }
    ],
    "conduct_evaluations": [
      {
        "file": "init_db.py",
        "line": 668
      }
    ],
    "conduct_settings": [
      {
        "file": "init_db.py",
        "line": 682
      }
    ],
    "notification_log": [
      {
        "file": "init_db.py",
        "line": 732
      }
    ],
    "advisor_messages": [
      {
        "file": "init_db.py",
        "line": 814
      }
    ]
  }
};
