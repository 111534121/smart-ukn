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
          "line": 978,
          "function": "auth_login",
          "tables": [
            {
              "name": "users",
              "file": "app.py",
              "line": 1018,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "line": 1018,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 1018,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 1043,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "line": 978,
              "function": "auth_login"
            },
            {
              "file": "app.py",
              "line": 973,
              "function": "_clear_login_failures"
            },
            {
              "file": "app.py",
              "line": 969,
              "function": "_record_login_failure"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 961,
              "function": "_login_too_many"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/auth/logout",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "app.py",
          "line": 1121,
          "function": "auth_logout",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 1121,
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
          "line": 1128,
          "function": "auth_me",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 1128,
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
          "line": 1152,
          "function": "register_visitor",
          "tables": [
            {
              "name": "visitor_logs",
              "file": "app.py",
              "line": 1171,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3762
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
              "line": 1152,
              "function": "register_visitor"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/index.html",
          "line": 2988
        },
        {
          "file": "static/login.html",
          "line": 416
        },
        {
          "file": "static/login.html",
          "line": 456
        },
        {
          "file": "static/js/admin-core.js",
          "line": 161
        },
        {
          "file": "static/js/admin-core.js",
          "line": 194
        },
        {
          "file": "static/js/admin-core.js",
          "line": 2246
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 112
        },
        {
          "file": "static/js/admin-workbench.js",
          "line": 252
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 104
        },
        {
          "file": "static/js/events-admin.js",
          "line": 242
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
          "line": 4436,
          "function": "get_student_dashboard",
          "tables": [
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 120,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
              "line": 4245,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 4419,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
                  "line": 1188
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
                  "line": 205
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
                  "line": 234
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
                  "line": 234
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
                  "line": 258
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
                  "line": 287
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
                  "line": 1188
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
                  "line": 1749
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
                  "line": 205
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
              "line": 4436,
              "function": "get_student_dashboard"
            },
            {
              "file": "app.py",
              "line": 4226,
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
              "line": 4377,
              "function": "moodle_error_message"
            },
            {
              "file": "app.py",
              "line": 4239,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1212,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4244,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4235,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 2049,
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
              "line": 39,
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
              "line": 101,
              "function": "build_dashboard"
            },
            {
              "file": "dashboard/summary.py",
              "line": 94,
              "function": "summarize_leave"
            },
            {
              "file": "dashboard/summary.py",
              "line": 67,
              "function": "summarize_assignments"
            },
            {
              "file": "dashboard/summary.py",
              "line": 57,
              "function": "summarize_announcements"
            },
            {
              "file": "dashboard/summary.py",
              "line": 36,
              "function": "summarize_schedule"
            },
            {
              "file": "dashboard/summary.py",
              "line": 16,
              "function": "_class_item"
            },
            {
              "file": "app.py",
              "line": 4418,
              "function": "student_class_name"
            },
            {
              "file": "app.py",
              "line": 4386,
              "function": "moodle_status_for"
            },
            {
              "file": "app.py",
              "line": 4366,
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
              "line": 4425,
              "function": "parse_dashboard_now"
            },
            {
              "file": "app.py",
              "line": 2066,
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
          "line": 4475,
          "function": "mark_announcement_read",
          "tables": [
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1188
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
                  "line": 205
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
                  "line": 234
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
                  "line": 234
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
                  "line": 258
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
                  "line": 287
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
                  "line": 1188
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
                  "line": 1749
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
                  "line": 205
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
              "line": 4475,
              "function": "mark_announcement_read"
            },
            {
              "file": "app.py",
              "line": 4366,
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
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 4511,
          "function": "submit_leave_request",
          "tables": [
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1188
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
                  "line": 205
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
                  "line": 234
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
                  "line": 234
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
                  "line": 258
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
                  "line": 287
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
                  "line": 1188
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
                  "line": 1749
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
                  "line": 205
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
              "line": 4511,
              "function": "submit_leave_request"
            },
            {
              "file": "app.py",
              "line": 4366,
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
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 4544,
          "function": "cancel_leave_request",
          "tables": [
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1188
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
                  "line": 205
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
                  "line": 234
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
                  "line": 234
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
                  "line": 258
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
                  "line": 287
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
                  "line": 1188
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
                  "line": 1749
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
                  "line": 205
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
              "line": 4544,
              "function": "cancel_leave_request"
            },
            {
              "file": "app.py",
              "line": 4366,
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
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 4551,
          "function": "list_leave_requests_for_review",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 4232,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
                  "line": 1188
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
                  "line": 205
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
                  "line": 234
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
                  "line": 234
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
                  "line": 258
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
                  "line": 287
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
                  "line": 1188
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
                  "line": 1749
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
                  "line": 205
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
              "line": 2537,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 4551,
              "function": "list_leave_requests_for_review"
            },
            {
              "file": "app.py",
              "line": 4231,
              "function": "list_students"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4366,
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
              "line": 4495,
              "function": "reviewable_student_ids"
            },
            {
              "file": "app.py",
              "line": 2536,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 4570,
          "function": "review_leave_request",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 2537,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
                  "line": 1188
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
                  "line": 205
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
                  "line": 234
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
                  "line": 234
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
                  "line": 258
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
                  "line": 287
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
                  "line": 1188
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
                  "line": 1749
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
                  "line": 205
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
              "line": 4570,
              "function": "review_leave_request"
            },
            {
              "file": "app.py",
              "line": 4501,
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 4495,
              "function": "reviewable_student_ids"
            },
            {
              "file": "app.py",
              "line": 2536,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 4366,
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
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/index.html",
          "line": 717
        },
        {
          "file": "static/index.html",
          "line": 2776
        },
        {
          "file": "static/index.html",
          "line": 2791
        },
        {
          "file": "static/index.html",
          "line": 2833
        },
        {
          "file": "static/index.html",
          "line": 2849
        },
        {
          "file": "static/index.html",
          "line": 2860
        },
        {
          "file": "static/index.html",
          "line": 2895
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
          "line": 2093,
          "function": "get_all_courses",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 2093,
              "function": "get_all_courses"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
          "line": 2102,
          "function": "check_courses_prerequisites",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2058,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "line": 2102,
              "function": "check_courses_prerequisites"
            },
            {
              "file": "app.py",
              "line": 2055,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2074,
              "function": "hide_untaken_demo_courses"
            },
            {
              "file": "app.py",
              "line": 2082,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2066,
              "function": "current_student_id"
            },
            {
              "file": "app.py",
              "line": 2049,
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
          "line": 2184,
          "function": "get_personalized_courses",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2058,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "line": 2184,
              "function": "get_personalized_courses"
            },
            {
              "file": "app.py",
              "line": 2082,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2055,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 2066,
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
          "line": 2284,
          "function": "what_if_course_failed",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 2284,
              "function": "what_if_course_failed"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/index.html",
          "line": 3173
        },
        {
          "file": "static/index.html",
          "line": 3174
        },
        {
          "file": "static/index.html",
          "line": 4002
        },
        {
          "file": "static/js/campus-features.js",
          "line": 511
        }
      ]
    },
    {
      "id": "retake",
      "name": "重補修推薦",
      "group": "學習",
      "summary": "比對未通過科目與開課班別，排除課表衝突並提供修課建議。",
      "routes": [
        {
          "url": "/api/admin/notify/retake",
          "methods": [
            "POST"
          ],
          "file": "retake/__init__.py",
          "line": 62,
          "function": "notify_retake",
          "tables": [
            {
              "name": "notification_log",
              "file": "app.py",
              "line": 3679,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1956
                },
                {
                  "file": "init_db.py",
                  "line": 772
                }
              ]
            },
            {
              "name": "notification_log",
              "file": "app.py",
              "line": 3688,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1956
                },
                {
                  "file": "init_db.py",
                  "line": 772
                }
              ]
            },
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2058,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "line": 4232,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "file": "retake/__init__.py",
              "line": 62,
              "function": "notify_retake"
            },
            {
              "file": "app.py",
              "line": 3677,
              "function": "already_notified"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3686,
              "function": "mark_notified"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "retake/__init__.py",
              "line": 51,
              "function": "notifications_for"
            },
            {
              "file": "retake/__init__.py",
              "line": 32,
              "function": "recommendations_for"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 2055,
              "function": "load_student_credits"
            },
            {
              "file": "retake/__init__.py",
              "line": 28,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 4231,
              "function": "list_students"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/student/retake-recommendations",
          "methods": [
            "GET"
          ],
          "file": "retake/__init__.py",
          "line": 109,
          "function": "my_recommendations",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2058,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "file": "retake/__init__.py",
              "line": 109,
              "function": "my_recommendations"
            },
            {
              "file": "retake/__init__.py",
              "line": 28,
              "function": "_error"
            },
            {
              "file": "retake/__init__.py",
              "line": 32,
              "function": "recommendations_for"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2055,
              "function": "load_student_credits"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin-core.html",
          "line": 1417
        },
        {
          "file": "static/admin.html",
          "line": 1386
        },
        {
          "file": "static/js/admin-core.js",
          "line": 2303
        },
        {
          "file": "static/js/retake.js",
          "line": 12
        },
        {
          "file": "static/js/retake.js",
          "line": 22
        },
        {
          "file": "static/js/retake.js",
          "line": 109
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
          "line": 61,
          "function": "list_offerings",
          "tables": [],
          "files": [
            {
              "file": "campus/courses_ext.py",
              "line": 61,
              "function": "list_offerings"
            },
            {
              "file": "campus/courses_ext.py",
              "line": 38,
              "function": "offerings_with_course"
            },
            {
              "file": "campus/courses_ext.py",
              "line": 33,
              "function": "slot_text"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
          "line": 66,
          "function": "check_plan",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2058,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "line": 66,
              "function": "check_plan"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "campus/courses_ext.py",
              "line": 38,
              "function": "offerings_with_course"
            },
            {
              "file": "campus/courses_ext.py",
              "line": 33,
              "function": "slot_text"
            },
            {
              "file": "campus/courses_ext.py",
              "line": 52,
              "function": "student_passed_ids"
            },
            {
              "file": "app.py",
              "line": 2055,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2082,
              "function": "summarize_credits"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/js/campus-features.js",
          "line": 511
        },
        {
          "file": "static/js/campus-features.js",
          "line": 561
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
          "line": 2256,
          "function": "graduation_audit",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 2268,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
                  "line": 1188
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
                  "line": 205
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
                  "line": 234
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
                  "line": 234
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
                  "line": 258
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
                  "line": 287
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
                  "line": 1188
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
                  "line": 1749
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
                  "line": 205
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
              "line": 2058,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "line": 2368,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2368,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 2256,
              "function": "graduation_audit"
            },
            {
              "file": "app.py",
              "line": 4366,
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
              "line": 2055,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 3787,
              "function": "teacher_can_view_student"
            },
            {
              "file": "app.py",
              "line": 2367,
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
              "line": 1212,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 2353,
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
          "line": 2487,
          "function": "student_graduation_dashboard",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2058,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "line": 2399,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1669
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
              "line": 2378,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2379,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 675
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
              "line": 2379,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2386,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 675
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
              "line": 2386,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2368,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2368,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 2487,
              "function": "student_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 2476,
              "function": "_graduation_target_or_error"
            },
            {
              "file": "app.py",
              "line": 2405,
              "function": "_compute_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2055,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2398,
              "function": "_load_dept_requirements"
            },
            {
              "file": "app.py",
              "line": 2376,
              "function": "_load_cohort"
            },
            {
              "file": "app.py",
              "line": 2082,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2367,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 2353,
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
          "line": 2495,
          "function": "export_graduation_dashboard_csv",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2058,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "line": 2399,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1669
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
              "line": 2378,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2379,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 675
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
              "line": 2379,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2386,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 675
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
              "line": 2386,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2368,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2368,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 2495,
              "function": "export_graduation_dashboard_csv"
            },
            {
              "file": "app.py",
              "line": 2476,
              "function": "_graduation_target_or_error"
            },
            {
              "file": "app.py",
              "line": 2405,
              "function": "_compute_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2055,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2398,
              "function": "_load_dept_requirements"
            },
            {
              "file": "app.py",
              "line": 2376,
              "function": "_load_cohort"
            },
            {
              "file": "app.py",
              "line": 2082,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2367,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 2353,
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
          "line": 2544,
          "function": "teacher_class_summary",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2058,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "line": 2399,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1669
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
              "line": 2378,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2379,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 675
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
              "line": 2379,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2386,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 675
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
              "line": 2386,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2368,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2368,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 2537,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2544,
              "function": "teacher_class_summary"
            },
            {
              "file": "app.py",
              "line": 2405,
              "function": "_compute_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2055,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2398,
              "function": "_load_dept_requirements"
            },
            {
              "file": "app.py",
              "line": 2376,
              "function": "_load_cohort"
            },
            {
              "file": "app.py",
              "line": 2082,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2367,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 2536,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/index.html",
          "line": 1348
        },
        {
          "file": "static/index.html",
          "line": 3931
        },
        {
          "file": "static/index.html",
          "line": 4266
        },
        {
          "file": "static/index.html",
          "line": 4294
        },
        {
          "file": "static/index.html",
          "line": 4468
        },
        {
          "file": "static/index.html",
          "line": 4559
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
          "line": 2578,
          "function": "teacher_class_attendance",
          "tables": [
            {
              "name": "course_map",
              "file": "app.py",
              "line": 4245,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
                  "line": 1188
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
                  "line": 205
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
                  "line": 234
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
                  "line": 234
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
                  "line": 258
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
                  "line": 287
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
                  "line": 1188
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
                  "line": 1749
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
                  "line": 205
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
              "line": 4232,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2571,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2537,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
              "line": 2578,
              "function": "teacher_class_attendance"
            },
            {
              "file": "app.py",
              "line": 4239,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1212,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4244,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4366,
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
              "line": 4231,
              "function": "list_students"
            },
            {
              "file": "attendance/policy.py",
              "line": 39,
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
              "line": 2570,
              "function": "_list_class_names"
            },
            {
              "file": "app.py",
              "line": 2536,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 4226,
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
              "line": 4235,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 4250,
          "function": "get_my_attendance",
          "tables": [
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 120,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
              "line": 4245,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 4250,
              "function": "get_my_attendance"
            },
            {
              "file": "app.py",
              "line": 4226,
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
              "line": 4239,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1212,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4244,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4235,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "attendance/policy.py",
              "line": 39,
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
              "line": 2066,
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
          "line": 4267,
          "function": "manage_attendance_records",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 4232,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
              "line": 4267,
              "function": "manage_attendance_records"
            },
            {
              "file": "app.py",
              "line": 4235,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 4231,
              "function": "list_students"
            },
            {
              "file": "app.py",
              "line": 4322,
              "function": "notify_new_absence"
            },
            {
              "file": "attendance/notify.py",
              "line": 27,
              "function": "campus_email"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 4226,
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
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 4339,
          "function": "notify_attendance_now",
          "tables": [
            {
              "name": "attendance_records",
              "file": "attendance/sources.py",
              "line": 120,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
              "line": 4339,
              "function": "notify_attendance_now"
            },
            {
              "file": "app.py",
              "line": 4226,
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
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin-core.html",
          "line": 3969
        },
        {
          "file": "static/admin-core.html",
          "line": 4012
        },
        {
          "file": "static/admin-core.html",
          "line": 4038
        },
        {
          "file": "static/admin.html",
          "line": 4370
        },
        {
          "file": "static/admin.html",
          "line": 4413
        },
        {
          "file": "static/admin.html",
          "line": 4439
        },
        {
          "file": "static/index.html",
          "line": 1107
        },
        {
          "file": "static/index.html",
          "line": 2934
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1689
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1010
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1024
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
          "line": 2636,
          "function": "teacher_class_overview",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2058,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "line": 2932,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3301
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
              "line": 4245,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 4232,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2571,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
              "line": 2537,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2636,
              "function": "teacher_class_overview"
            },
            {
              "file": "app.py",
              "line": 3016,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2082,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2055,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2929,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 4239,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1212,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4244,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 4231,
              "function": "list_students"
            },
            {
              "file": "attendance/policy.py",
              "line": 39,
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
              "line": 2570,
              "function": "_list_class_names"
            },
            {
              "file": "app.py",
              "line": 4226,
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
              "line": 4235,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 2536,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 2705,
          "function": "teacher_student_profile",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 2697,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
                  "line": 1188
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
                  "line": 205
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
                  "line": 234
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
                  "line": 234
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
                  "line": 258
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
                  "line": 287
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
                  "line": 1188
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
                  "line": 1749
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
                  "line": 205
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
                  "line": 310
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
              "line": 2058,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "line": 2932,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3301
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
              "line": 4245,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 2399,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1669
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
              "line": 2378,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2379,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 675
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
              "line": 2379,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2386,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 675
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
              "line": 2386,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2368,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2368,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 2705,
              "function": "teacher_student_profile"
            },
            {
              "file": "app.py",
              "line": 2696,
              "function": "_student_parent_phone"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 4366,
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
              "line": 4226,
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
              "line": 3016,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 2082,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2055,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2929,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 4239,
              "function": "current_attendance_semester"
            },
            {
              "file": "app.py",
              "line": 1212,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 4244,
              "function": "course_semester_hours"
            },
            {
              "file": "app.py",
              "line": 4235,
              "function": "course_weekly_hours"
            },
            {
              "file": "app.py",
              "line": 2405,
              "function": "_compute_graduation_dashboard"
            },
            {
              "file": "app.py",
              "line": 2398,
              "function": "_load_dept_requirements"
            },
            {
              "file": "app.py",
              "line": 2376,
              "function": "_load_cohort"
            },
            {
              "file": "app.py",
              "line": 2367,
              "function": "_load_student_info"
            },
            {
              "file": "attendance/policy.py",
              "line": 39,
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
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/js/campus-features.js",
          "line": 1290
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1302
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1418
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1429
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1570
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
                  "line": 1289
                },
                {
                  "file": "init_db.py",
                  "line": 891
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
                  "line": 1289
                },
                {
                  "file": "init_db.py",
                  "line": 891
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
                  "line": 1289
                },
                {
                  "file": "init_db.py",
                  "line": 891
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
                  "line": 1289
                },
                {
                  "file": "init_db.py",
                  "line": 891
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
                  "line": 1289
                },
                {
                  "file": "init_db.py",
                  "line": 891
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/counseling.py",
              "line": 36,
              "function": "use_db"
            },
            {
              "file": "app.py",
              "line": 1620,
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
                  "line": 1289
                },
                {
                  "file": "init_db.py",
                  "line": 891
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
                  "line": 1289
                },
                {
                  "file": "init_db.py",
                  "line": 891
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
                  "line": 1289
                },
                {
                  "file": "init_db.py",
                  "line": 891
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
                  "line": 1289
                },
                {
                  "file": "init_db.py",
                  "line": 891
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "campus/counseling.py",
              "line": 102,
              "function": "delete_record"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "campus/counseling.py",
              "line": 36,
              "function": "use_db"
            },
            {
              "file": "app.py",
              "line": 1604,
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
                  "line": 1289
                },
                {
                  "file": "init_db.py",
                  "line": 891
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
                  "line": 1289
                },
                {
                  "file": "init_db.py",
                  "line": 891
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "campus/counseling.py",
              "line": 36,
              "function": "use_db"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
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
          "line": 1126
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1147
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1159
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1267
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1269
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1279
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1285
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1571
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
          "line": 3075,
          "function": "get_student_early_warning",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2058,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "line": 2368,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2368,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 3011,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "line": 2932,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3301
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
              "line": 3075,
              "function": "get_student_early_warning"
            },
            {
              "file": "app.py",
              "line": 3016,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2082,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2055,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 2367,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 3009,
              "function": "find_class_advisor"
            },
            {
              "file": "app.py",
              "line": 2929,
              "function": "load_privacy_settings"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/index.html",
          "line": 4513
        },
        {
          "file": "static/index.html",
          "line": 4532
        },
        {
          "file": "static/index.html",
          "line": 4537
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
          "line": 3800,
          "function": "manage_certificates",
          "tables": [
            {
              "name": "certificates",
              "file": "app.py",
              "line": 3886,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 675
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
              "line": 3828,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 675
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
              "line": 3896,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 675
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
              "line": 2368,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2368,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 3800,
              "function": "manage_certificates"
            },
            {
              "file": "app.py",
              "line": 3787,
              "function": "teacher_can_view_student"
            },
            {
              "file": "app.py",
              "line": 2367,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3793,
              "function": "portfolio_row_dates"
            },
            {
              "file": "app.py",
              "line": 3448,
              "function": "_date_str"
            },
            {
              "file": "app.py",
              "line": 121,
              "function": "save_uploaded_file"
            },
            {
              "file": "app.py",
              "line": 118,
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
          "line": 3929,
          "function": "delete_certificate",
          "tables": [
            {
              "name": "certificates",
              "file": "app.py",
              "line": 3941,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 675
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
              "line": 3949,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 675
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
              "line": 3929,
              "function": "delete_certificate"
            },
            {
              "file": "app.py",
              "line": 220,
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
          "line": 3973,
          "function": "manage_competitions",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 2368,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2368,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 3973,
              "function": "manage_competitions"
            },
            {
              "file": "app.py",
              "line": 3787,
              "function": "teacher_can_view_student"
            },
            {
              "file": "app.py",
              "line": 2367,
              "function": "_load_student_info"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3793,
              "function": "portfolio_row_dates"
            },
            {
              "file": "app.py",
              "line": 3448,
              "function": "_date_str"
            },
            {
              "file": "app.py",
              "line": 121,
              "function": "save_uploaded_file"
            },
            {
              "file": "app.py",
              "line": 118,
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
          "line": 4076,
          "function": "delete_competition",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 4076,
              "function": "delete_competition"
            },
            {
              "file": "app.py",
              "line": 220,
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
                  "line": 675
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
                  "line": 2258
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
                  "line": 675
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
                  "line": 675
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
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
                  "line": 675
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
                  "line": 2258
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
                  "line": 675
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
                  "line": 675
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
              "line": 121,
              "function": "save_uploaded_file"
            },
            {
              "file": "app.py",
              "line": 118,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
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
                  "line": 675
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
                  "line": 2258
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
                  "line": 675
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
                  "line": 675
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
                  "line": 675
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
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
          "url": "/api/campus/certs/board",
          "methods": [
            "GET"
          ],
          "file": "campus/certificates.py",
          "line": 280,
          "function": "get_board",
          "tables": [],
          "files": [
            {
              "file": "campus/certificates.py",
              "line": 280,
              "function": "get_board"
            },
            {
              "file": "campus/certificates.py",
              "line": 274,
              "function": "board_layout"
            }
          ],
          "storage": [
            "data/campus_store.json → cert_board"
          ]
        },
        {
          "url": "/api/campus/certs/board",
          "methods": [
            "PUT"
          ],
          "file": "campus/certificates.py",
          "line": 287,
          "function": "save_board",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 675
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
                  "line": 2258
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
                  "line": 675
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
                  "line": 675
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
              "line": 287,
              "function": "save_board"
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
              "function": "db_execute"
            }
          ],
          "storage": [
            "data/campus_store.json → cert_board",
            "data/campus_store.json → cert_submissions"
          ]
        },
        {
          "url": "/api/campus/certs/review",
          "methods": [
            "GET"
          ],
          "file": "campus/certificates.py",
          "line": 312,
          "function": "review_list",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 675
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
                  "line": 2258
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
                  "line": 675
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
                  "line": 675
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
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
          "line": 325,
          "function": "review",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 675
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
                  "line": 2258
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
                  "line": 675
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
                  "line": 675
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
                  "line": 675
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
              "line": 325,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
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
          "line": 352,
          "function": "exemption_reminder_route",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 675
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
                  "line": 2258
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
                  "line": 675
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
                  "line": 675
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
              "line": 352,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
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
          "line": 359,
          "function": "stats",
          "tables": [
            {
              "name": "certificates",
              "file": "campus/certificates.py",
              "line": 114,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 675
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
                  "line": 2258
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
                  "line": 675
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
                  "line": 675
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
              "line": 359,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
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
          "line": 675
        },
        {
          "file": "static/js/campus-features.js",
          "line": 717
        },
        {
          "file": "static/js/campus-features.js",
          "line": 737
        },
        {
          "file": "static/js/campus-features.js",
          "line": 749
        },
        {
          "file": "static/js/campus-features.js",
          "line": 765
        },
        {
          "file": "static/js/campus-features.js",
          "line": 869
        },
        {
          "file": "static/js/campus-features.js",
          "line": 904
        },
        {
          "file": "static/js/campus-features.js",
          "line": 930
        },
        {
          "file": "static/js/campus-features.js",
          "line": 940
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 584
        }
      ]
    },
    {
      "id": "faculty",
      "name": "教師專長與我的課表",
      "group": "學習",
      "summary": "查詢教師專長、課表與辦公室資料，提供個人或管理端維護；教職員送出的老師名錄異動由管理員審核。",
      "routes": [
        {
          "url": "/api/campus/teachers",
          "methods": [
            "GET"
          ],
          "file": "campus/facilities.py",
          "line": 191,
          "function": "teachers",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 106,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1188
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
              "line": 191,
              "function": "teachers"
            },
            {
              "file": "campus/facilities.py",
              "line": 169,
              "function": "teacher_status"
            },
            {
              "file": "campus/facilities.py",
              "line": 110,
              "function": "period_at"
            },
            {
              "file": "campus/facilities.py",
              "line": 123,
              "function": "published_teachers"
            },
            {
              "file": "campus/facilities.py",
              "line": 105,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "campus/facilities.py",
              "line": 96,
              "function": "parse_now"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/teachers",
          "methods": [
            "GET"
          ],
          "file": "campus/teacher_admin.py",
          "line": 81,
          "function": "list_teachers",
          "tables": [],
          "files": [
            {
              "file": "campus/teacher_admin.py",
              "line": 81,
              "function": "list_teachers"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/teachers",
          "methods": [
            "POST"
          ],
          "file": "campus/teacher_admin.py",
          "line": 92,
          "function": "create_teacher",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "file": "campus/teacher_admin.py",
              "line": 92,
              "function": "create_teacher"
            },
            {
              "file": "campus/teacher_admin.py",
              "line": 74,
              "function": "_reviewer_meta"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "campus/teacher_admin.py",
              "line": 65,
              "function": "_name_taken"
            },
            {
              "file": "campus/teacher_admin.py",
              "line": 23,
              "function": "_parse"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/teachers/<int:teacher_id>",
          "methods": [
            "PUT"
          ],
          "file": "campus/teacher_admin.py",
          "line": 113,
          "function": "update_teacher",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "file": "campus/teacher_admin.py",
              "line": 113,
              "function": "update_teacher"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "campus/teacher_admin.py",
              "line": 65,
              "function": "_name_taken"
            },
            {
              "file": "campus/teacher_admin.py",
              "line": 23,
              "function": "_parse"
            },
            {
              "file": "campus/teacher_admin.py",
              "line": 61,
              "function": "_find"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/teachers/<int:teacher_id>",
          "methods": [
            "DELETE"
          ],
          "file": "campus/teacher_admin.py",
          "line": 143,
          "function": "delete_teacher",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "file": "campus/teacher_admin.py",
              "line": 143,
              "function": "delete_teacher"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "campus/teacher_admin.py",
              "line": 61,
              "function": "_find"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/teachers/<int:teacher_id>/review",
          "methods": [
            "POST"
          ],
          "file": "campus/teacher_admin.py",
          "line": 162,
          "function": "review_teacher",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "file": "campus/teacher_admin.py",
              "line": 162,
              "function": "review_teacher"
            },
            {
              "file": "campus/teacher_admin.py",
              "line": 74,
              "function": "_reviewer_meta"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "campus/teacher_admin.py",
              "line": 61,
              "function": "_find"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/teachers/photo",
          "methods": [
            "POST"
          ],
          "file": "campus/teacher_admin.py",
          "line": 197,
          "function": "upload_photo",
          "tables": [],
          "files": [
            {
              "file": "campus/teacher_admin.py",
              "line": 197,
              "function": "upload_photo"
            },
            {
              "file": "app.py",
              "line": 121,
              "function": "save_uploaded_file"
            },
            {
              "file": "app.py",
              "line": 118,
              "function": "allowed_file"
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
          "line": 104,
          "function": "search_faculty",
          "tables": [
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 71,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1633
                },
                {
                  "file": "init_db.py",
                  "line": 616
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 106,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1188
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
              "line": 104,
              "function": "search_faculty"
            },
            {
              "file": "faculty/__init__.py",
              "line": 97,
              "function": "_teacher_name"
            },
            {
              "file": "faculty/__init__.py",
              "line": 79,
              "function": "_decorate"
            },
            {
              "file": "campus/facilities.py",
              "line": 169,
              "function": "teacher_status"
            },
            {
              "file": "campus/facilities.py",
              "line": 110,
              "function": "period_at"
            },
            {
              "file": "faculty/__init__.py",
              "line": 70,
              "function": "load_profiles"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "campus/facilities.py",
              "line": 123,
              "function": "published_teachers"
            },
            {
              "file": "campus/facilities.py",
              "line": 105,
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
          "line": 194,
          "function": "my_profile",
          "tables": [
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 71,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1633
                },
                {
                  "file": "init_db.py",
                  "line": 616
                }
              ]
            },
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 187,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1633
                },
                {
                  "file": "init_db.py",
                  "line": 616
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 194,
              "function": "my_profile"
            },
            {
              "file": "faculty/__init__.py",
              "line": 70,
              "function": "load_profiles"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "faculty/__init__.py",
              "line": 66,
              "function": "_error"
            },
            {
              "file": "faculty/__init__.py",
              "line": 185,
              "function": "_save"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "faculty/__init__.py",
              "line": 147,
              "function": "_parse_profile"
            },
            {
              "file": "faculty/__init__.py",
              "line": 97,
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
          "line": 223,
          "function": "admin_faculty",
          "tables": [
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 238,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1633
                },
                {
                  "file": "init_db.py",
                  "line": 616
                }
              ]
            },
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 106,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1188
                },
                {
                  "file": "init_db.py",
                  "line": 454
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
                  "line": 1633
                },
                {
                  "file": "init_db.py",
                  "line": 616
                }
              ]
            }
          ],
          "files": [
            {
              "file": "faculty/__init__.py",
              "line": 223,
              "function": "admin_faculty"
            },
            {
              "file": "campus/facilities.py",
              "line": 123,
              "function": "published_teachers"
            },
            {
              "file": "campus/facilities.py",
              "line": 105,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "faculty/__init__.py",
              "line": 66,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "faculty/__init__.py",
              "line": 147,
              "function": "_parse_profile"
            },
            {
              "file": "faculty/__init__.py",
              "line": 70,
              "function": "load_profiles"
            },
            {
              "file": "faculty/__init__.py",
              "line": 214,
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
          "line": 250,
          "function": "admin_faculty_item",
          "tables": [
            {
              "name": "faculty_profiles",
              "file": "faculty/__init__.py",
              "line": 260,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1633
                },
                {
                  "file": "init_db.py",
                  "line": 616
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 187,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1633
                },
                {
                  "file": "init_db.py",
                  "line": 616
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
                  "line": 1633
                },
                {
                  "file": "init_db.py",
                  "line": 616
                }
              ]
            }
          ],
          "files": [
            {
              "file": "faculty/__init__.py",
              "line": 250,
              "function": "admin_faculty_item"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "faculty/__init__.py",
              "line": 66,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "faculty/__init__.py",
              "line": 185,
              "function": "_save"
            },
            {
              "file": "faculty/__init__.py",
              "line": 147,
              "function": "_parse_profile"
            },
            {
              "file": "faculty/__init__.py",
              "line": 70,
              "function": "load_profiles"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "faculty/__init__.py",
              "line": 214,
              "function": "_require_admin"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin-core.html",
          "line": 3111
        },
        {
          "file": "static/admin-core.html",
          "line": 3177
        },
        {
          "file": "static/admin-core.html",
          "line": 3188
        },
        {
          "file": "static/admin.html",
          "line": 3444
        },
        {
          "file": "static/admin.html",
          "line": 3510
        },
        {
          "file": "static/admin.html",
          "line": 3521
        },
        {
          "file": "static/js/campus-features.js",
          "line": 963
        },
        {
          "file": "static/js/campus-features.js",
          "line": 969
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1568
        },
        {
          "file": "static/js/campus-life.js",
          "line": 702
        },
        {
          "file": "static/js/faculty.js",
          "line": 47
        },
        {
          "file": "static/js/faculty.js",
          "line": 56
        },
        {
          "file": "static/js/faculty.js",
          "line": 131
        },
        {
          "file": "static/js/faculty.js",
          "line": 155
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
              "line": 1639,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3573
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
              "line": 3187,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 3251,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1696
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
              "line": 3251,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1726
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
              "line": 2811,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 929
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
              "line": 1590,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2212
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
              "line": 1635,
              "function": "record_unmatched_query"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3185,
              "function": "load_synonyms"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 3248,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 2809,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1584,
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
          "line": 1675,
          "function": "search_knowledge",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 1689,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 1693,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1696
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
              "line": 1693,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1726
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
              "line": 1590,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2212
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
              "line": 1639,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3573
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
              "line": 2811,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 929
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
              "line": 1675,
              "function": "search_knowledge"
            },
            {
              "file": "app.py",
              "line": 241,
              "function": "format_updated_at"
            },
            {
              "file": "app.py",
              "line": 1584,
              "function": "log_search"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1635,
              "function": "record_unmatched_query"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 2809,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1604,
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
          "line": 1783,
          "function": "submit_search_feedback",
          "tables": [
            {
              "name": "search_feedback",
              "file": "app.py",
              "line": 1805,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2187
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
              "line": 1783,
              "function": "submit_search_feedback"
            },
            {
              "file": "app.py",
              "line": 220,
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
          "line": 1783,
          "function": "submit_search_feedback",
          "tables": [
            {
              "name": "search_feedback",
              "file": "app.py",
              "line": 1805,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2187
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
              "line": 1783,
              "function": "submit_search_feedback"
            },
            {
              "file": "app.py",
              "line": 220,
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
          "line": 3133,
          "function": "get_categories",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 3133,
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
          "line": 3207,
          "function": "manage_synonyms",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 3187,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 3194,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 3207,
              "function": "manage_synonyms"
            },
            {
              "file": "app.py",
              "line": 3185,
              "function": "load_synonyms"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3190,
              "function": "add_synonym"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 289,
              "function": "write_roles_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 3230,
          "function": "delete_synonym",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "app.py",
              "line": 3236,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 3187,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "function": "delete_synonym"
            },
            {
              "file": "app.py",
              "line": 3185,
              "function": "load_synonyms"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 3285,
          "function": "manage_rules",
          "tables": [
            {
              "name": "knowledge_base",
              "file": "app.py",
              "line": 3296,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1696
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
              "line": 3251,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1696
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
              "line": 3251,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1726
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 3285,
              "function": "manage_rules"
            },
            {
              "file": "app.py",
              "line": 3248,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 3255,
              "function": "parse_rule_payload"
            },
            {
              "file": "app.py",
              "line": 289,
              "function": "write_roles_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 3312,
          "function": "update_or_delete_rule",
          "tables": [
            {
              "name": "knowledge_base",
              "file": "app.py",
              "line": 3321,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1696
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
              "line": 3334,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1696
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
              "line": 3251,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1696
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
              "line": 3251,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1726
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 3312,
              "function": "update_or_delete_rule"
            },
            {
              "file": "app.py",
              "line": 3248,
              "function": "load_rules"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 3255,
              "function": "parse_rule_payload"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 63,
          "function": "suggest",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "campus/rules_ext.py",
              "line": 17,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
                  "line": 1696
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
                  "line": 1726
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
              "line": 63,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
          "line": 95,
          "function": "candidates",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "campus/rules_ext.py",
              "line": 17,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
                  "line": 1696
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
                  "line": 1726
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
              "line": 95,
              "function": "candidates"
            },
            {
              "file": "campus/rules_ext.py",
              "line": 88,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
          "line": 128,
          "function": "tree",
          "tables": [
            {
              "name": "knowledge_base",
              "file": "campus/rules_ext.py",
              "line": 12,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1696
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
                  "line": 1726
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
              "line": 128,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin-core.html",
          "line": 2860
        },
        {
          "file": "static/admin-core.html",
          "line": 2889
        },
        {
          "file": "static/admin-core.html",
          "line": 3608
        },
        {
          "file": "static/admin-core.html",
          "line": 3650
        },
        {
          "file": "static/admin-core.html",
          "line": 3664
        },
        {
          "file": "static/admin-core.html",
          "line": 3675
        },
        {
          "file": "static/admin.html",
          "line": 3071
        },
        {
          "file": "static/admin.html",
          "line": 3982
        },
        {
          "file": "static/admin.html",
          "line": 4025
        },
        {
          "file": "static/admin.html",
          "line": 4063
        },
        {
          "file": "static/index.html",
          "line": 3050
        },
        {
          "file": "static/index.html",
          "line": 3074
        },
        {
          "file": "static/index.html",
          "line": 3147
        },
        {
          "file": "static/js/campus-features.js",
          "line": 282
        },
        {
          "file": "static/js/campus-features.js",
          "line": 334
        },
        {
          "file": "static/js/campus-features.js",
          "line": 378
        },
        {
          "file": "static/js/campus-features.js",
          "line": 385
        },
        {
          "file": "static/js/campus-features.js",
          "line": 405
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
      "summary": "讀取申請步驟與應備文件，保存個人的勾選進度；表單可隨時查詢並加入常用。",
      "routes": [
        {
          "url": "/api/checklist/progress",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "app.py",
          "line": 2856,
          "function": "manage_checklist_progress",
          "tables": [
            {
              "name": "checklist_progress",
              "file": "app.py",
              "line": 2823,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 964
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
              "line": 2811,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 929
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
              "line": 2838,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 964
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
              "line": 2856,
              "function": "manage_checklist_progress"
            },
            {
              "file": "app.py",
              "line": 2820,
              "function": "load_checklist_progress"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2809,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 2833,
              "function": "save_checklist_step"
            },
            {
              "file": "app.py",
              "line": 2066,
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
          "line": 2891,
          "function": "get_my_applications",
          "tables": [
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2811,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 929
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
              "line": 2823,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 964
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
              "line": 2891,
              "function": "get_my_applications"
            },
            {
              "file": "app.py",
              "line": 2809,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 2820,
              "function": "load_checklist_progress"
            },
            {
              "file": "app.py",
              "line": 2066,
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
          "line": 3138,
          "function": "manage_checklists",
          "tables": [
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 3168,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 929
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
              "line": 2811,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 929
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 3138,
              "function": "manage_checklists"
            },
            {
              "file": "app.py",
              "line": 2809,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 289,
              "function": "write_roles_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/forms",
          "methods": [
            "GET"
          ],
          "file": "campus/services.py",
          "line": 177,
          "function": "forms_list",
          "tables": [
            {
              "name": "user_preferences",
              "file": "campus/services.py",
              "line": 169,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3729
                },
                {
                  "file": "init_db.py",
                  "line": 601
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/services.py",
              "line": 177,
              "function": "forms_list"
            },
            {
              "file": "campus/services.py",
              "line": 158,
              "function": "_form_matches"
            },
            {
              "file": "campus/services.py",
              "line": 130,
              "function": "_all_forms"
            },
            {
              "file": "campus/services.py",
              "line": 166,
              "function": "_favorite_forms"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/forms/favorites",
          "methods": [
            "PUT"
          ],
          "file": "campus/services.py",
          "line": 189,
          "function": "forms_favorites",
          "tables": [
            {
              "name": "user_preferences",
              "file": "campus/services.py",
              "line": 203,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3729
                },
                {
                  "file": "init_db.py",
                  "line": 601
                }
              ]
            },
            {
              "name": "user_preferences",
              "file": "campus/services.py",
              "line": 169,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3729
                },
                {
                  "file": "init_db.py",
                  "line": 601
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/services.py",
              "line": 189,
              "function": "forms_favorites"
            },
            {
              "file": "campus/services.py",
              "line": 130,
              "function": "_all_forms"
            },
            {
              "file": "campus/services.py",
              "line": 166,
              "function": "_favorite_forms"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            }
          ],
          "storage": [
            "data/campus_store.json → favorite_forms"
          ]
        },
        {
          "url": "/api/campus/checklist-docs",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "campus/services.py",
          "line": 219,
          "function": "checklist_docs",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 219,
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
          "file": "static/admin-core.html",
          "line": 2915
        },
        {
          "file": "static/admin.html",
          "line": 3108
        },
        {
          "file": "static/admin.html",
          "line": 3192
        },
        {
          "file": "static/admin.html",
          "line": 3205
        },
        {
          "file": "static/index.html",
          "line": 1096
        },
        {
          "file": "static/index.html",
          "line": 4054
        },
        {
          "file": "static/index.html",
          "line": 4058
        },
        {
          "file": "static/index.html",
          "line": 4060
        },
        {
          "file": "static/index.html",
          "line": 4160
        },
        {
          "file": "static/index.html",
          "line": 4198
        },
        {
          "file": "static/js/campus-features.js",
          "line": 478
        },
        {
          "file": "static/js/campus-features.js",
          "line": 497
        },
        {
          "file": "static/js/forms-finder.js",
          "line": 25
        },
        {
          "file": "static/js/forms-finder.js",
          "line": 30
        },
        {
          "file": "static/js/forms-finder.js",
          "line": 67
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
          "line": 1268,
          "function": "get_current_week",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 1268,
              "function": "get_current_week"
            },
            {
              "file": "app.py",
              "line": 1240,
              "function": "calendar_highlights"
            },
            {
              "file": "app.py",
              "line": 1212,
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
          "line": 1342,
          "function": "manage_deadlines",
          "tables": [
            {
              "name": "deadlines",
              "file": "app.py",
              "line": 1350,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1466
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
              "line": 1390,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1466
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 1342,
              "function": "manage_deadlines"
            },
            {
              "file": "app.py",
              "line": 1294,
              "function": "_compute_deadline_status"
            },
            {
              "file": "app.py",
              "line": 1286,
              "function": "_deadline_visible_to_role"
            },
            {
              "file": "app.py",
              "line": 1332,
              "function": "normalize_deadline_row"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 289,
              "function": "write_roles_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 1466,
          "function": "get_calendar_now",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1423,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 30
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
              "line": 1427,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 30
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
              "line": 1466,
              "function": "get_calendar_now"
            },
            {
              "file": "app.py",
              "line": 1416,
              "function": "fetch_calendar_events"
            },
            {
              "file": "app.py",
              "line": 1408,
              "function": "normalize_calendar_row"
            },
            {
              "file": "app.py",
              "line": 220,
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
          "line": 1494,
          "function": "manage_academic_calendar",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1507,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 30
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
              "line": 1423,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 30
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
              "line": 1427,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 30
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 1494,
              "function": "manage_academic_calendar"
            },
            {
              "file": "app.py",
              "line": 1416,
              "function": "fetch_calendar_events"
            },
            {
              "file": "app.py",
              "line": 1408,
              "function": "normalize_calendar_row"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1436,
              "function": "parse_calendar_payload"
            },
            {
              "file": "app.py",
              "line": 289,
              "function": "write_roles_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 1527,
          "function": "update_or_delete_academic_calendar",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "app.py",
              "line": 1538,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 30
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
              "line": 1552,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 30
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
              "line": 1544,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 30
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
              "line": 1547,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 30
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 1527,
              "function": "update_or_delete_academic_calendar"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1408,
              "function": "normalize_calendar_row"
            },
            {
              "file": "app.py",
              "line": 1436,
              "function": "parse_calendar_payload"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 4146,
          "function": "get_school_calendar",
          "tables": [
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2811,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 929
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
              "line": 4146,
              "function": "get_school_calendar"
            },
            {
              "file": "app.py",
              "line": 3354,
              "function": "load_quick_links"
            },
            {
              "file": "app.py",
              "line": 4118,
              "function": "_calendar_event_detail"
            },
            {
              "file": "school_calendar/actions.py",
              "line": 44,
              "function": "match_actions"
            },
            {
              "file": "app.py",
              "line": 2809,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
          "line": 4169,
          "function": "sync_school_calendar",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 4169,
              "function": "sync_school_calendar"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 375,
          "function": "calendar_month",
          "tables": [
            {
              "name": "class_schedule",
              "file": "dashboard/sources.py",
              "line": 192,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1188
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
                  "line": 205
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
                  "line": 234
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
                  "line": 234
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
                  "line": 258
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
                  "line": 287
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
                  "line": 1188
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
                  "line": 1749
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
                  "line": 205
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 30
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
                  "line": 30
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
                  "line": 30
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
                  "line": 1466
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
              "line": 1423,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 30
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
              "line": 1427,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 30
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
                  "line": 929
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
              "line": 375,
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
              "line": 349,
              "function": "notice_events"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 320,
              "function": "meeting_events"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 290,
              "function": "staff_events"
            },
            {
              "file": "app.py",
              "line": 4366,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 204,
              "function": "load_deadlines"
            },
            {
              "file": "app.py",
              "line": 1416,
              "function": "fetch_calendar_events"
            },
            {
              "file": "app.py",
              "line": 1408,
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
          "line": 463,
          "function": "add_my_event",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 244,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 30
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
                  "line": 30
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
                  "line": 30
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
              "line": 463,
              "function": "add_my_event"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 239,
              "function": "list_my_events"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
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
          "line": 486,
          "function": "delete_my_event",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 267,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 30
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
                  "line": 30
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
                  "line": 30
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
                  "line": 30
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
              "line": 486,
              "function": "delete_my_event"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 262,
              "function": "remove_event"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 209,
              "function": "my_events_bucket"
            },
            {
              "file": "app.py",
              "line": 1620,
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
          "file": "static/admin-core.html",
          "line": 2684
        },
        {
          "file": "static/admin-core.html",
          "line": 2941
        },
        {
          "file": "static/admin-core.html",
          "line": 3789
        },
        {
          "file": "static/admin-core.html",
          "line": 3805
        },
        {
          "file": "static/admin-core.html",
          "line": 3819
        },
        {
          "file": "static/admin-core.html",
          "line": 3885
        },
        {
          "file": "static/admin-core.html",
          "line": 3905
        },
        {
          "file": "static/admin.html",
          "line": 2882
        },
        {
          "file": "static/admin.html",
          "line": 3215
        },
        {
          "file": "static/admin.html",
          "line": 3276
        },
        {
          "file": "static/admin.html",
          "line": 3288
        },
        {
          "file": "static/admin.html",
          "line": 4188
        },
        {
          "file": "static/admin.html",
          "line": 4204
        },
        {
          "file": "static/admin.html",
          "line": 4218
        },
        {
          "file": "static/admin.html",
          "line": 4284
        },
        {
          "file": "static/admin.html",
          "line": 4304
        },
        {
          "file": "static/index.html",
          "line": 1073
        },
        {
          "file": "static/index.html",
          "line": 1842
        },
        {
          "file": "static/index.html",
          "line": 2604
        },
        {
          "file": "static/index.html",
          "line": 3030
        },
        {
          "file": "static/index.html",
          "line": 3384
        },
        {
          "file": "static/index.html",
          "line": 3421
        },
        {
          "file": "static/index.html",
          "line": 4655
        },
        {
          "file": "static/js/campus-features.js",
          "line": 96
        },
        {
          "file": "static/js/campus-features.js",
          "line": 228
        },
        {
          "file": "static/js/campus-features.js",
          "line": 239
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 472
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 515
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
          "line": 3615,
          "function": "match_scholarships",
          "tables": [
            {
              "name": "scholarships",
              "file": "app.py",
              "line": 3452,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2147
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
              "line": 3490,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 3481,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "line": 3460,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 3615,
              "function": "match_scholarships"
            },
            {
              "file": "app.py",
              "line": 3445,
              "function": "_split_list"
            },
            {
              "file": "app.py",
              "line": 3532,
              "function": "evaluate_scholarship"
            },
            {
              "file": "app.py",
              "line": 3528,
              "function": "_fmt"
            },
            {
              "file": "app.py",
              "line": 3451,
              "function": "load_scholarships"
            },
            {
              "file": "app.py",
              "line": 3441,
              "function": "_num"
            },
            {
              "file": "app.py",
              "line": 3448,
              "function": "_date_str"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3489,
              "function": "department_names"
            },
            {
              "file": "app.py",
              "line": 3479,
              "function": "latest_semester_fails"
            },
            {
              "file": "app.py",
              "line": 3458,
              "function": "load_scholarship_profile"
            },
            {
              "file": "app.py",
              "line": 1212,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 2066,
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
          "line": 3718,
          "function": "notify_scholarship_and_warning",
          "tables": [
            {
              "name": "notification_log",
              "file": "app.py",
              "line": 3679,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1956
                },
                {
                  "file": "init_db.py",
                  "line": 772
                }
              ]
            },
            {
              "name": "notification_log",
              "file": "app.py",
              "line": 3688,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1956
                },
                {
                  "file": "init_db.py",
                  "line": 772
                }
              ]
            },
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 3481,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "line": 2058,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "line": 3460,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 3671,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "line": 2932,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3301
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
              "line": 4232,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 3452,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2147
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
              "line": 3490,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 3718,
              "function": "notify_scholarship_and_warning"
            },
            {
              "file": "app.py",
              "line": 3532,
              "function": "evaluate_scholarship"
            },
            {
              "file": "app.py",
              "line": 3528,
              "function": "_fmt"
            },
            {
              "file": "app.py",
              "line": 3445,
              "function": "_split_list"
            },
            {
              "file": "attendance/notify.py",
              "line": 27,
              "function": "campus_email"
            },
            {
              "file": "app.py",
              "line": 3703,
              "function": "_notify_once"
            },
            {
              "file": "app.py",
              "line": 3677,
              "function": "already_notified"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3686,
              "function": "mark_notified"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 3694,
              "function": "_send_once"
            },
            {
              "file": "app.py",
              "line": 3479,
              "function": "latest_semester_fails"
            },
            {
              "file": "app.py",
              "line": 3016,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 2082,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2055,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 3458,
              "function": "load_scholarship_profile"
            },
            {
              "file": "app.py",
              "line": 1212,
              "function": "current_academic_term"
            },
            {
              "file": "app.py",
              "line": 3441,
              "function": "_num"
            },
            {
              "file": "app.py",
              "line": 3669,
              "function": "find_parent_accounts"
            },
            {
              "file": "app.py",
              "line": 2929,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 4231,
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
              "line": 3451,
              "function": "load_scholarships"
            },
            {
              "file": "app.py",
              "line": 3448,
              "function": "_date_str"
            },
            {
              "file": "app.py",
              "line": 3489,
              "function": "department_names"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/scholarships/<int:sch_id>/apply",
          "methods": [
            "POST"
          ],
          "file": "scholarship_apply/__init__.py",
          "line": 195,
          "function": "apply",
          "tables": [
            {
              "name": "scholarship_applications",
              "file": "scholarship_apply/__init__.py",
              "line": 218,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 580
                }
              ]
            },
            {
              "name": "scholarship_applications",
              "file": "scholarship_apply/__init__.py",
              "line": 95,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 580
                }
              ]
            },
            {
              "name": "scholarship_applications",
              "file": "scholarship_apply/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 580
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "file": "scholarship_apply/__init__.py",
              "line": 195,
              "function": "apply"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 94,
              "function": "get_application"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 72,
              "function": "_row"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 168,
              "function": "public_view"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 83,
              "function": "load_applications"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 47,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 51,
              "function": "_now"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 146,
              "function": "store_files"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 119,
              "function": "check_files"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/scholarships/applications/mine",
          "methods": [
            "GET"
          ],
          "file": "scholarship_apply/__init__.py",
          "line": 234,
          "function": "mine",
          "tables": [
            {
              "name": "scholarship_applications",
              "file": "scholarship_apply/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 580
                }
              ]
            }
          ],
          "files": [
            {
              "file": "scholarship_apply/__init__.py",
              "line": 234,
              "function": "mine"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 83,
              "function": "load_applications"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 72,
              "function": "_row"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 168,
              "function": "public_view"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 47,
              "function": "_error"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 177,
              "function": "_auth"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/scholarships/applications/<int:app_id>/withdraw",
          "methods": [
            "POST"
          ],
          "file": "scholarship_apply/__init__.py",
          "line": 245,
          "function": "withdraw",
          "tables": [
            {
              "name": "scholarship_applications",
              "file": "scholarship_apply/__init__.py",
              "line": 104,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 580
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "name": "scholarship_applications",
              "file": "scholarship_apply/__init__.py",
              "line": 95,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 580
                }
              ]
            }
          ],
          "files": [
            {
              "file": "scholarship_apply/__init__.py",
              "line": 245,
              "function": "withdraw"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 47,
              "function": "_error"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 101,
              "function": "save_status"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 94,
              "function": "get_application"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 72,
              "function": "_row"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 177,
              "function": "_auth"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/scholarships/applications/<int:app_id>/files/<int:index>",
          "methods": [
            "GET"
          ],
          "file": "scholarship_apply/__init__.py",
          "line": 259,
          "function": "download_file",
          "tables": [
            {
              "name": "scholarship_applications",
              "file": "scholarship_apply/__init__.py",
              "line": 95,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 580
                }
              ]
            }
          ],
          "files": [
            {
              "file": "scholarship_apply/__init__.py",
              "line": 259,
              "function": "download_file"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 186,
              "function": "_can_view"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 94,
              "function": "get_application"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 72,
              "function": "_row"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 177,
              "function": "_auth"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 47,
              "function": "_error"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/scholarship-applications",
          "methods": [
            "GET"
          ],
          "file": "scholarship_apply/__init__.py",
          "line": 273,
          "function": "review_list",
          "tables": [
            {
              "name": "scholarship_applications",
              "file": "scholarship_apply/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 580
                }
              ]
            }
          ],
          "files": [
            {
              "file": "scholarship_apply/__init__.py",
              "line": 273,
              "function": "review_list"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 168,
              "function": "public_view"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 83,
              "function": "load_applications"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 72,
              "function": "_row"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 177,
              "function": "_auth"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 47,
              "function": "_error"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/scholarship-applications/<int:app_id>/review",
          "methods": [
            "POST"
          ],
          "file": "scholarship_apply/__init__.py",
          "line": 283,
          "function": "review",
          "tables": [
            {
              "name": "scholarship_applications",
              "file": "scholarship_apply/__init__.py",
              "line": 95,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 580
                }
              ]
            },
            {
              "name": "scholarship_applications",
              "file": "scholarship_apply/__init__.py",
              "line": 104,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 580
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "file": "scholarship_apply/__init__.py",
              "line": 283,
              "function": "review"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 94,
              "function": "get_application"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 72,
              "function": "_row"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 168,
              "function": "public_view"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 47,
              "function": "_error"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 101,
              "function": "save_status"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 159,
              "function": "make_stamp"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 51,
              "function": "_now"
            },
            {
              "file": "app.py",
              "line": 4763,
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
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 177,
              "function": "_auth"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/scholarships/stamp/<code>",
          "methods": [
            "GET"
          ],
          "file": "scholarship_apply/__init__.py",
          "line": 352,
          "function": "verify_stamp",
          "tables": [
            {
              "name": "scholarship_applications",
              "file": "scholarship_apply/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "init_db.py",
                  "line": 580
                }
              ]
            }
          ],
          "files": [
            {
              "file": "scholarship_apply/__init__.py",
              "line": 352,
              "function": "verify_stamp"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 159,
              "function": "make_stamp"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 83,
              "function": "load_applications"
            },
            {
              "file": "scholarship_apply/__init__.py",
              "line": 72,
              "function": "_row"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin-core.html",
          "line": 4058
        },
        {
          "file": "static/admin.html",
          "line": 4459
        },
        {
          "file": "static/index.html",
          "line": 1985
        },
        {
          "file": "static/js/campus-life.js",
          "line": 13
        },
        {
          "file": "static/js/campus-life.js",
          "line": 19
        },
        {
          "file": "static/js/campus-life.js",
          "line": 88
        },
        {
          "file": "static/js/campus-life.js",
          "line": 140
        },
        {
          "file": "static/js/campus-life.js",
          "line": 149
        },
        {
          "file": "static/js/campus-life.js",
          "line": 155
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
            "GET"
          ],
          "file": "campus/services.py",
          "line": 312,
          "function": "dorm_beds",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 312,
              "function": "dorm_beds"
            },
            {
              "file": "campus/services.py",
              "line": 296,
              "function": "dorm_bed_catalog"
            },
            {
              "file": "campus/services.py",
              "line": 279,
              "function": "dorm_apps"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/dorm/mine",
          "methods": [
            "GET"
          ],
          "file": "campus/services.py",
          "line": 318,
          "function": "dorm_mine",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 318,
              "function": "dorm_mine"
            },
            {
              "file": "campus/services.py",
              "line": 279,
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
          "line": 328,
          "function": "dorm_apply",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 328,
              "function": "dorm_apply"
            },
            {
              "file": "campus/services.py",
              "line": 279,
              "function": "dorm_apps"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
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
          "line": 364,
          "function": "dorm_all",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 364,
              "function": "dorm_all"
            },
            {
              "file": "campus/services.py",
              "line": 279,
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
          "line": 371,
          "function": "dorm_update",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 371,
              "function": "dorm_update"
            },
            {
              "file": "campus/services.py",
              "line": 279,
              "function": "dorm_apps"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/js/campus-life.js",
          "line": 226
        },
        {
          "file": "static/js/campus-life.js",
          "line": 265
        },
        {
          "file": "static/js/campus-life.js",
          "line": 278
        },
        {
          "file": "static/js/campus-life.js",
          "line": 337
        },
        {
          "file": "static/js/campus-life.js",
          "line": 387
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 121,
              "function": "save_uploaded_file"
            },
            {
              "file": "app.py",
              "line": 118,
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
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
          "line": 216,
          "function": "rooms_availability",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 106,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1188
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
              "line": 216,
              "function": "rooms_availability"
            },
            {
              "file": "campus/facilities.py",
              "line": 118,
              "function": "room_code"
            },
            {
              "file": "campus/facilities.py",
              "line": 211,
              "function": "bookings"
            },
            {
              "file": "campus/facilities.py",
              "line": 105,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
          "line": 245,
          "function": "book_room",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 106,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1188
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
              "line": 245,
              "function": "book_room"
            },
            {
              "file": "campus/facilities.py",
              "line": 118,
              "function": "room_code"
            },
            {
              "file": "campus/facilities.py",
              "line": 211,
              "function": "bookings"
            },
            {
              "file": "campus/facilities.py",
              "line": 105,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
          "line": 291,
          "function": "my_bookings",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 291,
              "function": "my_bookings"
            },
            {
              "file": "campus/facilities.py",
              "line": 211,
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
          "line": 306,
          "function": "update_booking",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 306,
              "function": "update_booking"
            },
            {
              "file": "campus/facilities.py",
              "line": 211,
              "function": "bookings"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
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
          "line": 349,
          "function": "list_lockers",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 349,
              "function": "list_lockers"
            },
            {
              "file": "campus/facilities.py",
              "line": 336,
              "function": "expire_holds"
            },
            {
              "file": "campus/facilities.py",
              "line": 332,
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
          "line": 369,
          "function": "reserve_locker",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 369,
              "function": "reserve_locker"
            },
            {
              "file": "campus/facilities.py",
              "line": 336,
              "function": "expire_holds"
            },
            {
              "file": "campus/facilities.py",
              "line": 332,
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
          "line": 387,
          "function": "cancel_locker",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 387,
              "function": "cancel_locker"
            },
            {
              "file": "campus/facilities.py",
              "line": 332,
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
          "line": 401,
          "function": "lockers_admin",
          "tables": [],
          "files": [
            {
              "file": "campus/facilities.py",
              "line": 401,
              "function": "lockers_admin"
            },
            {
              "file": "campus/facilities.py",
              "line": 336,
              "function": "expire_holds"
            },
            {
              "file": "campus/facilities.py",
              "line": 332,
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
          "line": 420,
          "function": "locker_paid",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 420,
              "function": "locker_paid"
            },
            {
              "file": "campus/facilities.py",
              "line": 332,
              "function": "lockers"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin-core.html",
          "line": 2695
        },
        {
          "file": "static/admin-core.html",
          "line": 2712
        },
        {
          "file": "static/admin-core.html",
          "line": 2743
        },
        {
          "file": "static/admin-core.html",
          "line": 2758
        },
        {
          "file": "static/admin.html",
          "line": 2893
        },
        {
          "file": "static/admin.html",
          "line": 2910
        },
        {
          "file": "static/admin.html",
          "line": 2941
        },
        {
          "file": "static/admin.html",
          "line": 2956
        },
        {
          "file": "static/js/campus-life.js",
          "line": 482
        },
        {
          "file": "static/js/campus-life.js",
          "line": 537
        },
        {
          "file": "static/js/campus-life.js",
          "line": 547
        },
        {
          "file": "static/js/campus-life.js",
          "line": 561
        },
        {
          "file": "static/js/campus-life.js",
          "line": 572
        },
        {
          "file": "static/js/campus-life.js",
          "line": 601
        },
        {
          "file": "static/js/campus-life.js",
          "line": 607
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
          "line": 137,
          "function": "campus_map",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 106,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1188
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
              "line": 137,
              "function": "campus_map"
            },
            {
              "file": "campus/facilities.py",
              "line": 123,
              "function": "published_teachers"
            },
            {
              "file": "campus/facilities.py",
              "line": 105,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
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
          "line": 144,
          "function": "find_place",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/facilities.py",
              "line": 106,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1188
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
              "line": 144,
              "function": "find_place"
            },
            {
              "file": "campus/facilities.py",
              "line": 123,
              "function": "published_teachers"
            },
            {
              "file": "campus/facilities.py",
              "line": 105,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
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
          "line": 619
        },
        {
          "file": "static/js/campus-life.js",
          "line": 667
        },
        {
          "file": "static/js/campus-life.js",
          "line": 779
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 489
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
          "line": 3390,
          "function": "manage_quick_links",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 3390,
              "function": "manage_quick_links"
            },
            {
              "file": "app.py",
              "line": 3360,
              "function": "save_quick_links"
            },
            {
              "file": "app.py",
              "line": 3367,
              "function": "parse_link_payload"
            },
            {
              "file": "app.py",
              "line": 3354,
              "function": "load_quick_links"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 289,
              "function": "write_roles_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 3407,
          "function": "update_or_delete_quick_link",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 3407,
              "function": "update_or_delete_quick_link"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 3360,
              "function": "save_quick_links"
            },
            {
              "file": "app.py",
              "line": 3367,
              "function": "parse_link_payload"
            },
            {
              "file": "app.py",
              "line": 3354,
              "function": "load_quick_links"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin-core.html",
          "line": 3687
        },
        {
          "file": "static/admin-core.html",
          "line": 3754
        },
        {
          "file": "static/admin-core.html",
          "line": 3774
        },
        {
          "file": "static/admin.html",
          "line": 4075
        },
        {
          "file": "static/admin.html",
          "line": 4152
        },
        {
          "file": "static/admin.html",
          "line": 4173
        },
        {
          "file": "static/index.html",
          "line": 2133
        },
        {
          "file": "static/index.html",
          "line": 2527
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
      "summary": "檢查發送對象與班級權限，保存通知、群組及幹部紀錄；臨時停課／調課通知可一鍵加入個人行事曆。",
      "routes": [
        {
          "url": "/api/campus/course-changes",
          "methods": [
            "GET"
          ],
          "file": "campus/course_changes.py",
          "line": 165,
          "function": "my_course_changes",
          "tables": [],
          "files": [
            {
              "file": "campus/course_changes.py",
              "line": 165,
              "function": "my_course_changes"
            },
            {
              "file": "campus/course_changes.py",
              "line": 136,
              "function": "summary"
            },
            {
              "file": "campus/course_changes.py",
              "line": 131,
              "function": "_when"
            },
            {
              "file": "campus/course_changes.py",
              "line": 145,
              "function": "calendar_entries"
            },
            {
              "file": "campus/course_changes.py",
              "line": 124,
              "function": "changes_for_student"
            },
            {
              "file": "campus/course_changes.py",
              "line": 94,
              "function": "all_changes"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "campus/course_changes.py",
              "line": 86,
              "function": "_decode"
            },
            {
              "file": "campus/course_changes.py",
              "line": 53,
              "function": "use_db"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "campus/course_changes.py",
              "line": 117,
              "function": "_my_courses"
            }
          ],
          "storage": [
            "data/campus_store.json → course_changes"
          ]
        },
        {
          "url": "/api/campus/course-changes/<int:change_id>/calendar",
          "methods": [
            "POST"
          ],
          "file": "campus/course_changes.py",
          "line": 186,
          "function": "add_change_to_calendar",
          "tables": [],
          "files": [
            {
              "file": "campus/course_changes.py",
              "line": 186,
              "function": "add_change_to_calendar"
            },
            {
              "file": "campus/course_changes.py",
              "line": 124,
              "function": "changes_for_student"
            },
            {
              "file": "campus/course_changes.py",
              "line": 94,
              "function": "all_changes"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "campus/course_changes.py",
              "line": 86,
              "function": "_decode"
            },
            {
              "file": "campus/course_changes.py",
              "line": 53,
              "function": "use_db"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "campus/course_changes.py",
              "line": 117,
              "function": "_my_courses"
            },
            {
              "file": "campus/course_changes.py",
              "line": 145,
              "function": "calendar_entries"
            },
            {
              "file": "campus/course_changes.py",
              "line": 136,
              "function": "summary"
            },
            {
              "file": "campus/course_changes.py",
              "line": 131,
              "function": "_when"
            }
          ],
          "storage": [
            "data/campus_store.json → course_changes"
          ]
        },
        {
          "url": "/api/campus/course-changes",
          "methods": [
            "POST"
          ],
          "file": "campus/course_changes.py",
          "line": 226,
          "function": "create_course_change",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "file": "campus/course_changes.py",
              "line": 226,
              "function": "create_course_change"
            },
            {
              "file": "campus/course_changes.py",
              "line": 136,
              "function": "summary"
            },
            {
              "file": "campus/course_changes.py",
              "line": 131,
              "function": "_when"
            },
            {
              "file": "campus/course_changes.py",
              "line": 214,
              "function": "_valid_periods"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "campus/course_changes.py",
              "line": 100,
              "function": "insert_change"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "campus/course_changes.py",
              "line": 53,
              "function": "use_db"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/course_changes.py",
              "line": 204,
              "function": "_valid_day"
            }
          ],
          "storage": [
            "data/campus_store.json → course_changes"
          ]
        },
        {
          "url": "/api/campus/notices",
          "methods": [
            "POST"
          ],
          "file": "campus/messaging.py",
          "line": 371,
          "function": "send_notice",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 2258
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 371,
              "function": "send_notice"
            },
            {
              "file": "campus/messaging.py",
              "line": 268,
              "function": "can_manage"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "campus/messaging.py",
              "line": 184,
              "function": "add_notice"
            },
            {
              "file": "app.py",
              "line": 1620,
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
              "line": 1604,
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
          "line": 413,
          "function": "sent",
          "tables": [
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 215,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 2258
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 413,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
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
          "line": 428,
          "function": "inbox",
          "tables": [
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 215,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 2258
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 428,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
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
          "line": 438,
          "function": "mark_read",
          "tables": [
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 246,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 2258
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 438,
              "function": "mark_read"
            },
            {
              "file": "campus/messaging.py",
              "line": 242,
              "function": "mark_notice_read"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1604,
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
          "line": 688,
          "function": "reply_notice",
          "tables": [
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 701,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 2258
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 688,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
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
          "line": 714,
          "function": "remind_notice",
          "tables": [
            {
              "name": "class_notice_recipients",
              "file": "campus/messaging.py",
              "line": 215,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 2258
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 714,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
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
                  "line": 3324
                },
                {
                  "file": "init_db.py",
                  "line": 924
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
                  "line": 3324
                },
                {
                  "file": "init_db.py",
                  "line": 924
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
                  "line": 3324
                },
                {
                  "file": "init_db.py",
                  "line": 924
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
                  "line": 3324
                },
                {
                  "file": "init_db.py",
                  "line": 924
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
                  "line": 3324
                },
                {
                  "file": "init_db.py",
                  "line": 924
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
                  "line": 3324
                },
                {
                  "file": "init_db.py",
                  "line": 924
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "campus/records.py",
              "line": 100,
              "function": "delete_record"
            },
            {
              "file": "app.py",
              "line": 1620,
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
                  "line": 3324
                },
                {
                  "file": "init_db.py",
                  "line": 924
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
                  "line": 3324
                },
                {
                  "file": "init_db.py",
                  "line": 924
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
                  "line": 3324
                },
                {
                  "file": "init_db.py",
                  "line": 924
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
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
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "campus/records.py",
              "line": 53,
              "function": "use_db"
            },
            {
              "file": "app.py",
              "line": 1604,
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
                  "line": 3324
                },
                {
                  "file": "init_db.py",
                  "line": 924
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
                  "line": 3324
                },
                {
                  "file": "init_db.py",
                  "line": 924
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
          "line": 684
        },
        {
          "file": "static/js/campus-features.js",
          "line": 688
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1010
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1116
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1354
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1360
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1396
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1398
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1405
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1572
        },
        {
          "file": "static/js/campus-life.js",
          "line": 844
        },
        {
          "file": "static/js/campus-life.js",
          "line": 845
        },
        {
          "file": "static/js/campus-life.js",
          "line": 874
        },
        {
          "file": "static/js/campus-life.js",
          "line": 875
        },
        {
          "file": "static/js/campus-life.js",
          "line": 939
        },
        {
          "file": "static/js/campus-life.js",
          "line": 963
        },
        {
          "file": "static/js/campus-life.js",
          "line": 1023
        },
        {
          "file": "static/js/campus-life.js",
          "line": 1584
        },
        {
          "file": "static/js/campus-life.js",
          "line": 1632
        },
        {
          "file": "static/js/campus-life.js",
          "line": 1640
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 541
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
          "line": 2942,
          "function": "manage_privacy_consent",
          "tables": [
            {
              "name": "student_privacy_settings",
              "file": "app.py",
              "line": 2963,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3301
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
              "line": 2932,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3301
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 2942,
              "function": "manage_privacy_consent"
            },
            {
              "file": "app.py",
              "line": 2929,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 2066,
              "function": "current_student_id"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 2980,
          "function": "manage_emergency_contact",
          "tables": [
            {
              "name": "students",
              "file": "app.py",
              "line": 3001,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2994,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2980,
              "function": "manage_emergency_contact"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 2066,
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
          "line": 3494,
          "function": "list_departments_with_intro",
          "tables": [
            {
              "name": "departments",
              "file": "app.py",
              "line": 3496,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 3494,
              "function": "list_departments_with_intro"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
                  "line": 3729
                },
                {
                  "file": "init_db.py",
                  "line": 601
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
                  "line": 2258
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
                  "line": 3729
                },
                {
                  "file": "init_db.py",
                  "line": 601
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
                  "line": 1497
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
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1604,
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
          "line": 4610
        },
        {
          "file": "static/index.html",
          "line": 4619
        },
        {
          "file": "static/index.html",
          "line": 4634
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 768
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
                  "line": 165
                },
                {
                  "file": "init_db.py",
                  "line": 739
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
                  "line": 190
                },
                {
                  "file": "init_db.py",
                  "line": 755
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
                  "line": 165
                },
                {
                  "file": "init_db.py",
                  "line": 739
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
                  "line": 190
                },
                {
                  "file": "init_db.py",
                  "line": 755
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 92,
              "function": "add_wish"
            },
            {
              "file": "app.py",
              "line": 1620,
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
                  "line": 190
                },
                {
                  "file": "init_db.py",
                  "line": 755
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
                  "line": 165
                },
                {
                  "file": "init_db.py",
                  "line": 739
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
                  "line": 165
                },
                {
                  "file": "init_db.py",
                  "line": 739
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1620,
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
                  "line": 165
                },
                {
                  "file": "init_db.py",
                  "line": 739
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
                  "line": 165
                },
                {
                  "file": "init_db.py",
                  "line": 739
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
                  "line": 165
                },
                {
                  "file": "init_db.py",
                  "line": 739
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 52,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
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
                  "line": 190
                },
                {
                  "file": "init_db.py",
                  "line": 755
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
                  "line": 190
                },
                {
                  "file": "init_db.py",
                  "line": 755
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
                  "line": 190
                },
                {
                  "file": "init_db.py",
                  "line": 755
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
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "anniversary/__init__.py",
              "line": 52,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
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
              "line": 1604,
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
          "file": "static/admin-core.html",
          "line": 3208
        },
        {
          "file": "static/admin-core.html",
          "line": 3265
        },
        {
          "file": "static/admin-core.html",
          "line": 3277
        },
        {
          "file": "static/admin-core.html",
          "line": 3311
        },
        {
          "file": "static/admin.html",
          "line": 3541
        },
        {
          "file": "static/admin.html",
          "line": 3613
        },
        {
          "file": "static/admin.html",
          "line": 3626
        },
        {
          "file": "static/admin.html",
          "line": 3660
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
          "line": 30,
          "function": "slots",
          "tables": [],
          "files": [
            {
              "file": "campus/visits.py",
              "line": 30,
              "function": "slots"
            },
            {
              "file": "campus/visits.py",
              "line": 25,
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
          "line": 45,
          "function": "visits_route",
          "tables": [],
          "files": [
            {
              "file": "campus/visits.py",
              "line": 45,
              "function": "visits_route"
            },
            {
              "file": "campus/visits.py",
              "line": 25,
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
          "line": 104,
          "function": "update_visit",
          "tables": [],
          "files": [
            {
              "file": "campus/visits.py",
              "line": 104,
              "function": "update_visit"
            },
            {
              "file": "campus/visits.py",
              "line": 25,
              "function": "bookings"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/admin-core.html",
          "line": 2719
        },
        {
          "file": "static/admin-core.html",
          "line": 2736
        },
        {
          "file": "static/admin.html",
          "line": 2917
        },
        {
          "file": "static/admin.html",
          "line": 2934
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 826
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 847
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 863
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 871
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
          "line": 474,
          "function": "affairs_mine",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 474,
              "function": "affairs_mine"
            },
            {
              "file": "campus/services.py",
              "line": 463,
              "function": "project_status"
            },
            {
              "file": "campus/services.py",
              "line": 427,
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
          "line": 483,
          "function": "affairs_check",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 483,
              "function": "affairs_check"
            },
            {
              "file": "campus/services.py",
              "line": 431,
              "function": "check_form"
            },
            {
              "file": "campus/services.py",
              "line": 427,
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
          "line": 496,
          "function": "affairs_submit",
          "tables": [],
          "files": [
            {
              "file": "campus/services.py",
              "line": 496,
              "function": "affairs_submit"
            },
            {
              "file": "app.py",
              "line": 121,
              "function": "save_uploaded_file"
            },
            {
              "file": "app.py",
              "line": 118,
              "function": "allowed_file"
            },
            {
              "file": "campus/services.py",
              "line": 427,
              "function": "affairs_submissions"
            },
            {
              "file": "campus/services.py",
              "line": 431,
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
          "line": 582,
          "function": "scholarships",
          "tables": [
            {
              "name": "student_credits",
              "file": "app.py",
              "line": 2058,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "line": 582,
              "function": "scholarships"
            },
            {
              "file": "campus/services.py",
              "line": 562,
              "function": "auto_answers"
            },
            {
              "file": "app.py",
              "line": 2055,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        }
      ],
      "frontend": [
        {
          "file": "static/js/campus-life.js",
          "line": 162
        },
        {
          "file": "static/js/campus-life.js",
          "line": 403
        },
        {
          "file": "static/js/campus-life.js",
          "line": 450
        },
        {
          "file": "static/js/campus-life.js",
          "line": 461
        }
      ]
    },
    {
      "id": "messages",
      "name": "校園公告、班級與師生聯繫",
      "group": "導師班",
      "summary": "依身分與班級權限讀取公告、管理班級或傳遞訊息；開線上會議並以邀請或邀請碼加入，會中文字討論、出席與會議紀錄依保存期限留存。",
      "routes": [
        {
          "url": "/api/campus/announcements",
          "methods": [
            "GET"
          ],
          "file": "campus/calendar_ext.py",
          "line": 513,
          "function": "list_announcements",
          "tables": [
            {
              "name": "academic_calendar",
              "file": "campus/calendar_ext.py",
              "line": 244,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 30
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
                  "line": 30
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
                  "line": 30
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
                  "line": 1188
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
                  "line": 205
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
                  "line": 234
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
                  "line": 234
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
                  "line": 258
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
                  "line": 287
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
                  "line": 1188
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
                  "line": 1749
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
                  "line": 205
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
              "line": 513,
              "function": "list_announcements"
            },
            {
              "file": "campus/calendar_ext.py",
              "line": 239,
              "function": "list_my_events"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 4366,
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
              "line": 497,
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
          "url": "/api/campus/meetings",
          "methods": [
            "GET"
          ],
          "file": "campus/meetings.py",
          "line": 169,
          "function": "my_meetings",
          "tables": [],
          "files": [
            {
              "file": "campus/meetings.py",
              "line": 169,
              "function": "my_meetings"
            },
            {
              "file": "campus/meetings.py",
              "line": 142,
              "function": "_describe"
            },
            {
              "file": "campus/meetings.py",
              "line": 38,
              "function": "jitsi_config"
            },
            {
              "file": "campus/meetings.py",
              "line": 96,
              "function": "_parse_time"
            },
            {
              "file": "campus/meetings.py",
              "line": 71,
              "function": "invitable_classes"
            },
            {
              "file": "campus/meetings.py",
              "line": 42,
              "function": "share_base"
            },
            {
              "file": "public_portal.py",
              "line": 14,
              "function": "public_site_url"
            },
            {
              "file": "campus/meetings.py",
              "line": 331,
              "function": "purge_expired_logs"
            },
            {
              "file": "campus/meetings.py",
              "line": 314,
              "function": "_end_of"
            },
            {
              "file": "campus/meetings.py",
              "line": 307,
              "function": "add_months"
            },
            {
              "file": "campus/meetings.py",
              "line": 319,
              "function": "log_state"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/meetings/people",
          "methods": [
            "GET"
          ],
          "file": "campus/meetings.py",
          "line": 186,
          "function": "search_people",
          "tables": [
            {
              "name": "users",
              "file": "campus/meetings.py",
              "line": 64,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "file": "campus/meetings.py",
              "line": 186,
              "function": "search_people"
            },
            {
              "file": "campus/meetings.py",
              "line": 60,
              "function": "_people"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/meetings",
          "methods": [
            "POST"
          ],
          "file": "campus/meetings.py",
          "line": 198,
          "function": "create_meeting",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "name": "users",
              "file": "campus/meetings.py",
              "line": 64,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "file": "campus/meetings.py",
              "line": 198,
              "function": "create_meeting"
            },
            {
              "file": "campus/meetings.py",
              "line": 89,
              "function": "_new_code"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "campus/meetings.py",
              "line": 120,
              "function": "_invite"
            },
            {
              "file": "campus/meetings.py",
              "line": 84,
              "function": "class_member_keys"
            },
            {
              "file": "campus/meetings.py",
              "line": 60,
              "function": "_people"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/meetings.py",
              "line": 107,
              "function": "_check_invitees"
            },
            {
              "file": "campus/meetings.py",
              "line": 71,
              "function": "invitable_classes"
            },
            {
              "file": "campus/meetings.py",
              "line": 96,
              "function": "_parse_time"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/meetings/<int:meeting_id>/invite",
          "methods": [
            "POST"
          ],
          "file": "campus/meetings.py",
          "line": 235,
          "function": "invite_more",
          "tables": [
            {
              "name": "users",
              "file": "campus/meetings.py",
              "line": 64,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "file": "campus/meetings.py",
              "line": 235,
              "function": "invite_more"
            },
            {
              "file": "campus/meetings.py",
              "line": 120,
              "function": "_invite"
            },
            {
              "file": "campus/meetings.py",
              "line": 84,
              "function": "class_member_keys"
            },
            {
              "file": "campus/meetings.py",
              "line": 60,
              "function": "_people"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "campus/meetings.py",
              "line": 107,
              "function": "_check_invitees"
            },
            {
              "file": "campus/meetings.py",
              "line": 71,
              "function": "invitable_classes"
            },
            {
              "file": "campus/meetings.py",
              "line": 103,
              "function": "_find"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/meetings/join",
          "methods": [
            "POST"
          ],
          "file": "campus/meetings.py",
          "line": 254,
          "function": "join_by_code",
          "tables": [],
          "files": [
            {
              "file": "campus/meetings.py",
              "line": 254,
              "function": "join_by_code"
            },
            {
              "file": "campus/meetings.py",
              "line": 96,
              "function": "_parse_time"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/meetings/<int:meeting_id>/cancel",
          "methods": [
            "POST"
          ],
          "file": "campus/meetings.py",
          "line": 274,
          "function": "cancel_meeting",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "file": "campus/meetings.py",
              "line": 274,
              "function": "cancel_meeting"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "campus/meetings.py",
              "line": 103,
              "function": "_find"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/meetings/<int:meeting_id>/leave",
          "methods": [
            "POST"
          ],
          "file": "campus/meetings.py",
          "line": 287,
          "function": "leave_meeting",
          "tables": [],
          "files": [
            {
              "file": "campus/meetings.py",
              "line": 287,
              "function": "leave_meeting"
            },
            {
              "file": "campus/meetings.py",
              "line": 103,
              "function": "_find"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/meetings/<int:meeting_id>/enter",
          "methods": [
            "POST"
          ],
          "file": "campus/meetings.py",
          "line": 364,
          "function": "enter_meeting",
          "tables": [],
          "files": [
            {
              "file": "campus/meetings.py",
              "line": 364,
              "function": "enter_meeting"
            },
            {
              "file": "campus/meetings.py",
              "line": 38,
              "function": "jitsi_config"
            },
            {
              "file": "campus/meetings.py",
              "line": 314,
              "function": "_end_of"
            },
            {
              "file": "campus/meetings.py",
              "line": 96,
              "function": "_parse_time"
            },
            {
              "file": "campus/meetings.py",
              "line": 339,
              "function": "_member_meeting"
            },
            {
              "file": "campus/meetings.py",
              "line": 103,
              "function": "_find"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/meetings/<int:meeting_id>/chat",
          "methods": [
            "GET"
          ],
          "file": "campus/meetings.py",
          "line": 381,
          "function": "meeting_chat",
          "tables": [],
          "files": [
            {
              "file": "campus/meetings.py",
              "line": 381,
              "function": "meeting_chat"
            },
            {
              "file": "campus/meetings.py",
              "line": 352,
              "function": "_can_chat"
            },
            {
              "file": "campus/meetings.py",
              "line": 314,
              "function": "_end_of"
            },
            {
              "file": "campus/meetings.py",
              "line": 96,
              "function": "_parse_time"
            },
            {
              "file": "campus/meetings.py",
              "line": 357,
              "function": "_message_out"
            },
            {
              "file": "campus/meetings.py",
              "line": 319,
              "function": "log_state"
            },
            {
              "file": "campus/meetings.py",
              "line": 307,
              "function": "add_months"
            },
            {
              "file": "campus/meetings.py",
              "line": 339,
              "function": "_member_meeting"
            },
            {
              "file": "campus/meetings.py",
              "line": 103,
              "function": "_find"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/meetings/<int:meeting_id>/chat",
          "methods": [
            "POST"
          ],
          "file": "campus/meetings.py",
          "line": 398,
          "function": "post_chat",
          "tables": [],
          "files": [
            {
              "file": "campus/meetings.py",
              "line": 398,
              "function": "post_chat"
            },
            {
              "file": "campus/meetings.py",
              "line": 357,
              "function": "_message_out"
            },
            {
              "file": "campus/meetings.py",
              "line": 352,
              "function": "_can_chat"
            },
            {
              "file": "campus/meetings.py",
              "line": 314,
              "function": "_end_of"
            },
            {
              "file": "campus/meetings.py",
              "line": 96,
              "function": "_parse_time"
            },
            {
              "file": "campus/meetings.py",
              "line": 339,
              "function": "_member_meeting"
            },
            {
              "file": "campus/meetings.py",
              "line": 103,
              "function": "_find"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/meetings/<int:meeting_id>/record",
          "methods": [
            "GET"
          ],
          "file": "campus/meetings.py",
          "line": 440,
          "function": "meeting_record",
          "tables": [],
          "files": [
            {
              "file": "campus/meetings.py",
              "line": 440,
              "function": "meeting_record"
            },
            {
              "file": "campus/meetings.py",
              "line": 414,
              "function": "build_record"
            },
            {
              "file": "campus/meetings.py",
              "line": 357,
              "function": "_message_out"
            },
            {
              "file": "campus/meetings.py",
              "line": 314,
              "function": "_end_of"
            },
            {
              "file": "campus/meetings.py",
              "line": 96,
              "function": "_parse_time"
            },
            {
              "file": "campus/meetings.py",
              "line": 319,
              "function": "log_state"
            },
            {
              "file": "campus/meetings.py",
              "line": 307,
              "function": "add_months"
            },
            {
              "file": "campus/meetings.py",
              "line": 339,
              "function": "_member_meeting"
            },
            {
              "file": "campus/meetings.py",
              "line": 103,
              "function": "_find"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/meetings/<int:meeting_id>/record",
          "methods": [
            "PUT"
          ],
          "file": "campus/meetings.py",
          "line": 449,
          "function": "save_meeting_record",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "file": "campus/meetings.py",
              "line": 449,
              "function": "save_meeting_record"
            },
            {
              "file": "campus/meetings.py",
              "line": 314,
              "function": "_end_of"
            },
            {
              "file": "campus/meetings.py",
              "line": 96,
              "function": "_parse_time"
            },
            {
              "file": "campus/meetings.py",
              "line": 307,
              "function": "add_months"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "campus/meetings.py",
              "line": 319,
              "function": "log_state"
            },
            {
              "file": "campus/meetings.py",
              "line": 339,
              "function": "_member_meeting"
            },
            {
              "file": "campus/meetings.py",
              "line": 103,
              "function": "_find"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/meetings/<int:meeting_id>/record/download",
          "methods": [
            "GET"
          ],
          "file": "campus/meetings.py",
          "line": 503,
          "function": "download_meeting_record",
          "tables": [],
          "files": [
            {
              "file": "campus/meetings.py",
              "line": 503,
              "function": "download_meeting_record"
            },
            {
              "file": "campus/meetings.py",
              "line": 414,
              "function": "build_record"
            },
            {
              "file": "campus/meetings.py",
              "line": 357,
              "function": "_message_out"
            },
            {
              "file": "campus/meetings.py",
              "line": 314,
              "function": "_end_of"
            },
            {
              "file": "campus/meetings.py",
              "line": 96,
              "function": "_parse_time"
            },
            {
              "file": "campus/meetings.py",
              "line": 319,
              "function": "log_state"
            },
            {
              "file": "campus/meetings.py",
              "line": 307,
              "function": "add_months"
            },
            {
              "file": "campus/meetings.py",
              "line": 476,
              "function": "record_text"
            },
            {
              "file": "campus/meetings.py",
              "line": 339,
              "function": "_member_meeting"
            },
            {
              "file": "campus/meetings.py",
              "line": 103,
              "function": "_find"
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 2258
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 2258
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
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
              "line": 1604,
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
              "line": 1620,
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 2258
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
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
              "line": 1604,
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
              "line": 1620,
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 2258
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
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
          "line": 363,
          "function": "leave_class",
          "tables": [
            {
              "name": "class_group_members",
              "file": "campus/messaging.py",
              "line": 175,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 2258
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 363,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
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
          "line": 530,
          "function": "broadcast_targets",
          "tables": [
            {
              "name": "class_schedule",
              "file": "campus/messaging.py",
              "line": 459,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1188
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 2258
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
                }
              ]
            },
            {
              "name": "departments",
              "file": "campus/messaging.py",
              "line": 501,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 530,
              "function": "broadcast_targets"
            },
            {
              "file": "campus/messaging.py",
              "line": 481,
              "function": "visible_courses"
            },
            {
              "file": "campus/messaging.py",
              "line": 463,
              "function": "course_table"
            },
            {
              "file": "campus/messaging.py",
              "line": 458,
              "function": "load_schedule"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "campus/messaging.py",
              "line": 453,
              "function": "_plain_name"
            },
            {
              "file": "campus/messaging.py",
              "line": 491,
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
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 500,
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
          "line": 552,
          "function": "send_broadcast",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 2258
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
                }
              ]
            },
            {
              "name": "departments",
              "file": "campus/messaging.py",
              "line": 501,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 459,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1188
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 552,
              "function": "send_broadcast"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "campus/messaging.py",
              "line": 184,
              "function": "add_notice"
            },
            {
              "file": "app.py",
              "line": 1620,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 506,
              "function": "resolve_target"
            },
            {
              "file": "campus/messaging.py",
              "line": 500,
              "function": "department_names"
            },
            {
              "file": "campus/messaging.py",
              "line": 481,
              "function": "visible_courses"
            },
            {
              "file": "campus/messaging.py",
              "line": 463,
              "function": "course_table"
            },
            {
              "file": "campus/messaging.py",
              "line": 458,
              "function": "load_schedule"
            },
            {
              "file": "campus/messaging.py",
              "line": 453,
              "function": "_plain_name"
            },
            {
              "file": "campus/messaging.py",
              "line": 491,
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
          "line": 632,
          "function": "advisor_messages_route",
          "tables": [
            {
              "name": "advisor_messages",
              "file": "campus/messaging.py",
              "line": 586,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 136
                },
                {
                  "file": "init_db.py",
                  "line": 854
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 2258
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
                }
              ]
            },
            {
              "name": "advisor_messages",
              "file": "campus/messaging.py",
              "line": 598,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 136
                },
                {
                  "file": "init_db.py",
                  "line": 854
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 632,
              "function": "advisor_messages_route"
            },
            {
              "file": "campus/messaging.py",
              "line": 584,
              "function": "advisor_messages"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_fmt_time"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 592,
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
          "line": 667,
          "function": "reply_advisor_message",
          "tables": [
            {
              "name": "advisor_messages",
              "file": "campus/messaging.py",
              "line": 586,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 136
                },
                {
                  "file": "init_db.py",
                  "line": 854
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 987
                },
                {
                  "file": "init_db.py",
                  "line": 802
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
                  "line": 1040
                },
                {
                  "file": "init_db.py",
                  "line": 823
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
                  "line": 2258
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
                  "line": 1015
                },
                {
                  "file": "init_db.py",
                  "line": 812
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
                  "line": 1100
                },
                {
                  "file": "init_db.py",
                  "line": 843
                }
              ]
            },
            {
              "name": "advisor_messages",
              "file": "campus/messaging.py",
              "line": 616,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 136
                },
                {
                  "file": "init_db.py",
                  "line": 854
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/messaging.py",
              "line": 667,
              "function": "reply_advisor_message"
            },
            {
              "file": "campus/messaging.py",
              "line": 584,
              "function": "advisor_messages"
            },
            {
              "file": "campus/messaging.py",
              "line": 67,
              "function": "_fmt_time"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "campus/messaging.py",
              "line": 59,
              "function": "seed_classes"
            },
            {
              "file": "campus/messaging.py",
              "line": 611,
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
          "file": "static/announcements.html",
          "line": 53
        },
        {
          "file": "static/js/campus-life.js",
          "line": 844
        },
        {
          "file": "static/js/campus-life.js",
          "line": 874
        },
        {
          "file": "static/js/campus-life.js",
          "line": 952
        },
        {
          "file": "static/js/campus-life.js",
          "line": 968
        },
        {
          "file": "static/js/campus-life.js",
          "line": 974
        },
        {
          "file": "static/js/campus-life.js",
          "line": 1023
        },
        {
          "file": "static/js/campus-life.js",
          "line": 1572
        },
        {
          "file": "static/js/campus-life.js",
          "line": 1593
        },
        {
          "file": "static/js/campus-life.js",
          "line": 1599
        },
        {
          "file": "static/js/campus-life.js",
          "line": 1604
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 386
        },
        {
          "file": "static/js/home-portal.js",
          "line": 65
        },
        {
          "file": "static/js/meetings.js",
          "line": 24
        },
        {
          "file": "static/js/meetings.js",
          "line": 82
        },
        {
          "file": "static/js/meetings.js",
          "line": 136
        },
        {
          "file": "static/js/meetings.js",
          "line": 159
        },
        {
          "file": "static/js/meetings.js",
          "line": 169
        },
        {
          "file": "static/js/meetings.js",
          "line": 198
        },
        {
          "file": "static/js/meetings.js",
          "line": 206
        },
        {
          "file": "static/js/meetings.js",
          "line": 273
        },
        {
          "file": "static/js/meetings.js",
          "line": 302
        },
        {
          "file": "static/js/meetings.js",
          "line": 323
        },
        {
          "file": "static/js/meetings.js",
          "line": 335
        },
        {
          "file": "static/js/meetings.js",
          "line": 344
        },
        {
          "file": "static/js/meetings.js",
          "line": 349
        },
        {
          "file": "static/js/meetings.js",
          "line": 366
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
          "line": 79,
          "function": "prefs",
          "tables": [
            {
              "name": "user_preferences",
              "file": "campus/services.py",
              "line": 97,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3729
                },
                {
                  "file": "init_db.py",
                  "line": 601
                }
              ]
            },
            {
              "name": "user_preferences",
              "file": "campus/services.py",
              "line": 94,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3729
                },
                {
                  "file": "init_db.py",
                  "line": 601
                }
              ]
            },
            {
              "name": "user_preferences",
              "file": "campus/services.py",
              "line": 55,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3729
                },
                {
                  "file": "init_db.py",
                  "line": 601
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
                  "line": 3729
                },
                {
                  "file": "init_db.py",
                  "line": 601
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
                  "line": 3729
                },
                {
                  "file": "init_db.py",
                  "line": 601
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
                  "line": 3604
                },
                {
                  "file": "init_db.py",
                  "line": 66
                }
              ]
            },
            {
              "name": "user_preferences",
              "file": "campus/services.py",
              "line": 66,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3729
                },
                {
                  "file": "init_db.py",
                  "line": 601
                }
              ]
            }
          ],
          "files": [
            {
              "file": "campus/services.py",
              "line": 79,
              "function": "prefs"
            },
            {
              "file": "campus/services.py",
              "line": 51,
              "function": "get_pinned"
            },
            {
              "file": "campus/services.py",
              "line": 43,
              "function": "_json_prefs_key"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "campus/services.py",
              "line": 21,
              "function": "_prefs_db"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "campus/services.py",
              "line": 63,
              "function": "set_pinned"
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
          "line": 804
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 303
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 339
        },
        {
          "file": "static/js/tour.js",
          "line": 2
        },
        {
          "file": "static/js/tour.js",
          "line": 173
        },
        {
          "file": "static/js/tour.js",
          "line": 189
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
                  "line": 3604
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
                  "line": 3604
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
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
                  "line": 3604
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
                  "line": 3604
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
                  "line": 3604
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
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
                  "line": 3604
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
          "line": 28
        },
        {
          "file": "static/js/campus-access.js",
          "line": 47
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
          "line": 157,
          "function": "get_db_status",
          "tables": [],
          "files": [
            {
              "file": "admin_core.py",
              "line": 157,
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
          "line": 194,
          "function": "list_users",
          "tables": [
            {
              "name": "users",
              "file": "admin_core.py",
              "line": 199,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "line": 199,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 194,
              "function": "list_users"
            },
            {
              "file": "admin_core.py",
              "line": 50,
              "function": "_sanitize_permissions"
            },
            {
              "file": "admin_core.py",
              "line": 42,
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
          "line": 236,
          "function": "create_user",
          "tables": [
            {
              "name": "users",
              "file": "admin_core.py",
              "line": 282,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "line": 295,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "line": 287,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 289,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 236,
              "function": "create_user"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
              "function": "_get_effective_role"
            },
            {
              "file": "admin_core.py",
              "line": 50,
              "function": "_sanitize_permissions"
            },
            {
              "file": "admin_core.py",
              "line": 42,
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
          "line": 328,
          "function": "update_user",
          "tables": [
            {
              "name": "users",
              "file": "admin_core.py",
              "line": 331,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "line": 377,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "line": 396,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 409,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "line": 415,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "line": 398,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 328,
              "function": "update_user"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
              "function": "_get_effective_role"
            },
            {
              "file": "admin_core.py",
              "line": 50,
              "function": "_sanitize_permissions"
            },
            {
              "file": "admin_core.py",
              "line": 42,
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
          "line": 450,
          "function": "delete_user",
          "tables": [
            {
              "name": "users",
              "file": "admin_core.py",
              "line": 451,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "line": 468,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "line": 462,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "line": 450,
              "function": "delete_user"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/credentials/query",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 485,
          "function": "query_user_credentials",
          "tables": [
            {
              "name": "users",
              "file": "admin_core.py",
              "line": 491,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "line": 491,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 485,
              "function": "query_user_credentials"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/users/<int:user_id>/reset-password",
          "methods": [
            "POST"
          ],
          "file": "admin_core.py",
          "line": 566,
          "function": "reset_user_password",
          "tables": [
            {
              "name": "users",
              "file": "admin_core.py",
              "line": 572,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "line": 589,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "line": 566,
              "function": "reset_user_password"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/users/<int:user_id>/credential-info",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 618,
          "function": "get_user_credential_info",
          "tables": [
            {
              "name": "users",
              "file": "admin_core.py",
              "line": 620,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "line": 620,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 618,
              "function": "get_user_credential_info"
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
          "line": 682,
          "function": "list_departments",
          "tables": [
            {
              "name": "students",
              "file": "admin_core.py",
              "line": 683,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 683,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 683,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 682,
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
          "line": 694,
          "function": "create_department",
          "tables": [
            {
              "name": "departments",
              "file": "admin_core.py",
              "line": 708,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 712,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 716,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 694,
              "function": "create_department"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
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
          "line": 735,
          "function": "update_department",
          "tables": [
            {
              "name": "departments",
              "file": "admin_core.py",
              "line": 738,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 749,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 753,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 735,
              "function": "update_department"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
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
          "line": 773,
          "function": "delete_department",
          "tables": [
            {
              "name": "departments",
              "file": "admin_core.py",
              "line": 775,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 780,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 781,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 782,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1669
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
              "line": 792,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 773,
              "function": "delete_department"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
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
          "line": 825,
          "function": "list_course_map",
          "tables": [
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 830,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 830,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 825,
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
          "line": 859,
          "function": "create_course",
          "tables": [
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 885,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 898,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 903,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 893,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 900,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 819,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 859,
              "function": "create_course"
            },
            {
              "file": "admin_core.py",
              "line": 807,
              "function": "_has_circular_prerequisite"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
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
          "line": 927,
          "function": "update_course",
          "tables": [
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 930,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 962,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 952,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 819,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 927,
              "function": "update_course"
            },
            {
              "file": "admin_core.py",
              "line": 807,
              "function": "_has_circular_prerequisite"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
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
          "line": 990,
          "function": "delete_course",
          "tables": [
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 992,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 997,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 1006,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "line": 1013,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 990,
              "function": "delete_course"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
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
          "line": 1063,
          "function": "list_graduation_requirements",
          "tables": [
            {
              "name": "graduation_requirements",
              "file": "admin_core.py",
              "line": 1064,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1669
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
              "line": 1064,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1497
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
              "line": 1063,
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
          "line": 1074,
          "function": "create_graduation_requirement",
          "tables": [
            {
              "name": "graduation_requirements",
              "file": "admin_core.py",
              "line": 1092,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1669
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
              "line": 1111,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1669
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
              "line": 1095,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1669
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
              "line": 1074,
              "function": "create_graduation_requirement"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
              "function": "_get_effective_role"
            },
            {
              "file": "admin_core.py",
              "line": 1028,
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
          "line": 1132,
          "function": "update_graduation_requirement",
          "tables": [
            {
              "name": "graduation_requirements",
              "file": "admin_core.py",
              "line": 1134,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1669
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
              "line": 1143,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1669
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
              "line": 1132,
              "function": "update_graduation_requirement"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
              "function": "_get_effective_role"
            },
            {
              "file": "admin_core.py",
              "line": 1028,
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
          "line": 1165,
          "function": "delete_graduation_requirement",
          "tables": [
            {
              "name": "graduation_requirements",
              "file": "admin_core.py",
              "line": 1166,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1669
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
              "line": 1170,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1669
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
              "line": 1165,
              "function": "delete_graduation_requirement"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
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
          "line": 1187,
          "function": "list_knowledge_categories",
          "tables": [
            {
              "name": "knowledge_base",
              "file": "admin_core.py",
              "line": 1188,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1696
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
              "line": 1188,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 1188,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1726
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
              "line": 1187,
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
          "line": 1199,
          "function": "create_knowledge_category",
          "tables": [
            {
              "name": "knowledge_categories",
              "file": "admin_core.py",
              "line": 1213,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1726
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
              "line": 1217,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1726
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
              "line": 1199,
              "function": "create_knowledge_category"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
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
          "line": 1237,
          "function": "update_knowledge_category",
          "tables": [
            {
              "name": "knowledge_categories",
              "file": "admin_core.py",
              "line": 1239,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1726
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
              "line": 1255,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1726
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
              "line": 1259,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1726
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
              "line": 1237,
              "function": "update_knowledge_category"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
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
          "line": 1279,
          "function": "delete_knowledge_category",
          "tables": [
            {
              "name": "knowledge_categories",
              "file": "admin_core.py",
              "line": 1280,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1726
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
              "line": 1285,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1696
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
              "line": 1286,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 1295,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1726
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
              "line": 1279,
              "function": "delete_knowledge_category"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
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
          "line": 1312,
          "function": "list_synonyms",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 1316,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 1316,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1726
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
              "line": 1312,
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
          "line": 1338,
          "function": "create_synonym",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 1359,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 1363,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 1346,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1726
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
              "line": 1338,
              "function": "create_synonym"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
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
          "line": 1386,
          "function": "update_synonym",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 1388,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 1404,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 1408,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 1386,
              "function": "update_synonym"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
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
          "line": 1428,
          "function": "delete_synonym",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 1429,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 1433,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 1428,
              "function": "delete_synonym"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/core/audit-logs",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 1455,
          "function": "list_audit_logs",
          "tables": [
            {
              "name": "audit_logs",
              "file": "admin_core.py",
              "line": 1464,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 1455,
              "function": "list_audit_logs"
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
          "line": 1455,
          "function": "list_audit_logs",
          "tables": [
            {
              "name": "audit_logs",
              "file": "admin_core.py",
              "line": 1464,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 1455,
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
          "line": 1495,
          "function": "list_search_logs",
          "tables": [
            {
              "name": "search_logs",
              "file": "admin_core.py",
              "line": 1502,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2212
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
              "line": 1513,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2212
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
              "line": 1520,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2212
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
              "line": 1495,
              "function": "list_search_logs"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/core/unmatched-queries",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 1547,
          "function": "list_unmatched_queries",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "admin_core.py",
              "line": 1549,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3573
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
              "line": 1547,
              "function": "list_unmatched_queries"
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
          "line": 1547,
          "function": "list_unmatched_queries",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "admin_core.py",
              "line": 1549,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3573
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
              "line": 1547,
              "function": "list_unmatched_queries"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/core/unmatched-queries/convert-synonym",
          "methods": [
            "POST"
          ],
          "file": "admin_core.py",
          "line": 1561,
          "function": "convert_unmatched_to_synonym",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 1579,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 1582,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 1586,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 1594,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3573
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
              "line": 1598,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3573
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
              "line": 1561,
              "function": "convert_unmatched_to_synonym"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
              "function": "_get_effective_role"
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
          "line": 1561,
          "function": "convert_unmatched_to_synonym",
          "tables": [
            {
              "name": "synonym_dictionary",
              "file": "admin_core.py",
              "line": 1579,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 1582,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 1586,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 1594,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3573
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
              "line": 1598,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3573
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
              "line": 1561,
              "function": "convert_unmatched_to_synonym"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/core/unmatched-queries/<int:query_id>/status",
          "methods": [
            "PUT"
          ],
          "file": "admin_core.py",
          "line": 1625,
          "function": "update_unmatched_status",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "admin_core.py",
              "line": 1631,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3573
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
              "line": 1635,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3573
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
              "line": 1625,
              "function": "update_unmatched_status"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
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
          "line": 1625,
          "function": "update_unmatched_status",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "admin_core.py",
              "line": 1631,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3573
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
              "line": 1635,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3573
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
              "line": 1625,
              "function": "update_unmatched_status"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/core/visitor-logs",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 1655,
          "function": "list_visitor_logs",
          "tables": [
            {
              "name": "visitor_logs",
              "file": "admin_core.py",
              "line": 1662,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3762
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
              "line": 1655,
              "function": "list_visitor_logs"
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
          "line": 1655,
          "function": "list_visitor_logs",
          "tables": [
            {
              "name": "visitor_logs",
              "file": "admin_core.py",
              "line": 1662,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3762
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
              "line": 1655,
              "function": "list_visitor_logs"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/core/visitor-logs/export.csv",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 1676,
          "function": "export_visitor_logs",
          "tables": [
            {
              "name": "visitor_logs",
              "file": "admin_core.py",
              "line": 1677,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3762
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
              "line": 1676,
              "function": "export_visitor_logs"
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
          "line": 1676,
          "function": "export_visitor_logs",
          "tables": [
            {
              "name": "visitor_logs",
              "file": "admin_core.py",
              "line": 1677,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3762
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
              "line": 1676,
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
          "line": 1695,
          "function": "list_student_credits",
          "tables": [
            {
              "name": "student_credits",
              "file": "admin_core.py",
              "line": 1701,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "line": 1701,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 1701,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 1695,
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
          "line": 1750,
          "function": "list_attendance_records",
          "tables": [
            {
              "name": "attendance_records",
              "file": "admin_core.py",
              "line": 1755,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 310
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
              "line": 1755,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 1750,
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
          "line": 1796,
          "function": "list_student_records",
          "tables": [
            {
              "name": "student_records",
              "file": "admin_core.py",
              "line": 1802,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3324
                },
                {
                  "file": "init_db.py",
                  "line": 924
                }
              ]
            },
            {
              "name": "students",
              "file": "admin_core.py",
              "line": 1802,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 1796,
              "function": "list_student_records"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/meetings",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 1848,
          "function": "admin_list_meetings",
          "tables": [],
          "files": [
            {
              "file": "admin_core.py",
              "line": 1848,
              "function": "admin_list_meetings"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/meetings/<int:meeting_id>/cancel",
          "methods": [
            "POST"
          ],
          "file": "admin_core.py",
          "line": 1979,
          "function": "admin_cancel_meeting",
          "tables": [],
          "files": [
            {
              "file": "admin_core.py",
              "line": 1979,
              "function": "admin_cancel_meeting"
            },
            {
              "file": "admin_core.py",
              "line": 87,
              "function": "_get_current_actor"
            },
            {
              "file": "admin_core.py",
              "line": 73,
              "function": "_get_effective_role"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/records/overview",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 2005,
          "function": "admin_records_overview",
          "tables": [
            {
              "name": "audit_logs",
              "file": "admin_core.py",
              "line": 2014,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "file": "admin_core.py",
              "line": 2015,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3762
                },
                {
                  "file": "init_db.py",
                  "line": 317
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "admin_core.py",
              "line": 2016,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 310
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
              "file": "admin_core.py",
              "line": 2005,
              "function": "admin_records_overview"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/admin/smart-insights",
          "methods": [
            "GET"
          ],
          "file": "admin_core.py",
          "line": 2037,
          "function": "admin_smart_insights",
          "tables": [
            {
              "name": "student_credits",
              "file": "admin_core.py",
              "line": 2042,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
              "line": 2042,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
                },
                {
                  "file": "init_db.py",
                  "line": 84
                }
              ]
            },
            {
              "name": "students",
              "file": "admin_core.py",
              "line": 2042,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "attendance_records",
              "file": "admin_core.py",
              "line": 2073,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 310
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
              "line": 2073,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
                },
                {
                  "file": "init_db.py",
                  "line": 51
                }
              ]
            },
            {
              "name": "unmatched_queries",
              "file": "admin_core.py",
              "line": 2094,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3573
                },
                {
                  "file": "init_db.py",
                  "line": 255
                }
              ]
            },
            {
              "name": "course_map",
              "file": "admin_core.py",
              "line": 2052,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1325
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
              "line": 2037,
              "function": "admin_smart_insights"
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
          "line": 1826,
          "function": "get_missed_queries",
          "tables": [
            {
              "name": "search_logs",
              "file": "app.py",
              "line": 1828,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2212
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
              "line": 1829,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2187
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
              "line": 1826,
              "function": "get_missed_queries"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 1858,
          "function": "get_search_stats",
          "tables": [
            {
              "name": "search_logs",
              "file": "app.py",
              "line": 1863,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2212
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
              "line": 1858,
              "function": "get_search_stats"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 1883,
          "function": "get_unmatched_queries",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "app.py",
              "line": 1664,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3573
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
              "line": 1883,
              "function": "get_unmatched_queries"
            },
            {
              "file": "app.py",
              "line": 1663,
              "function": "load_unmatched_queries"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 1889,
          "function": "convert_unmatched_to_synonym",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "app.py",
              "line": 1908,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3573
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
              "line": 3194,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 1889,
              "function": "convert_unmatched_to_synonym"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3190,
              "function": "add_synonym"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 1923,
          "function": "get_audit_logs",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 1925,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 1923,
              "function": "get_audit_logs"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 1942,
          "function": "run_self_check",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 1942,
              "function": "run_self_check"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 1972,
          "function": "get_visitor_logs",
          "tables": [
            {
              "name": "visitor_logs",
              "file": "app.py",
              "line": 1952,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3762
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
              "line": 1972,
              "function": "get_visitor_logs"
            },
            {
              "file": "app.py",
              "line": 1959,
              "function": "mask_phone"
            },
            {
              "file": "app.py",
              "line": 1949,
              "function": "load_visitor_logs"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1964,
              "function": "_visitor_days"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 1996,
          "function": "export_visitor_logs",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 1952,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3762
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
              "line": 1996,
              "function": "export_visitor_logs"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1949,
              "function": "load_visitor_logs"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 1964,
              "function": "_visitor_days"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 2011,
          "function": "get_search_feedback_stats",
          "tables": [
            {
              "name": "search_feedback",
              "file": "app.py",
              "line": 2013,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2187
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
              "line": 2011,
              "function": "get_search_feedback_stats"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 3524,
          "function": "list_visitor_faq",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 3524,
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
          "line": 4186,
          "function": "health_check",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 4186,
              "function": "health_check"
            },
            {
              "file": "app.py",
              "line": 234,
              "function": "is_db_available"
            },
            {
              "file": "app.py",
              "line": 220,
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
          "line": 4206,
          "function": "get_stats",
          "tables": [
            {
              "name": "unmatched_queries",
              "file": "app.py",
              "line": 1664,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3573
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
              "line": 2811,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 929
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
              "line": 3187,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3509
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
              "line": 3251,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1696
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
              "line": 3251,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1726
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
              "line": 4206,
              "function": "get_stats"
            },
            {
              "file": "app.py",
              "line": 234,
              "function": "is_db_available"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 1663,
              "function": "load_unmatched_queries"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 2809,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 3185,
              "function": "load_synonyms"
            },
            {
              "file": "app.py",
              "line": 3248,
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
          "line": 4395,
          "function": "link_moodle",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 4395,
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
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 4606,
          "function": "staff_alerts",
          "tables": [
            {
              "name": "student_privacy_settings",
              "file": "app.py",
              "line": 2932,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3301
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
              "line": 2058,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2358
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
                  "line": 1188
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
                  "line": 205
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
                  "line": 234
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
                  "line": 234
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
                  "line": 258
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
                  "line": 287
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
                  "line": 1188
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
                  "line": 1749
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
                  "line": 205
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
                  "line": 1749
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
              "line": 4232,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 2537,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 4606,
              "function": "staff_alerts"
            },
            {
              "file": "app.py",
              "line": 2929,
              "function": "load_privacy_settings"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 3016,
              "function": "compute_early_warning"
            },
            {
              "file": "app.py",
              "line": 2049,
              "function": "load_course_map"
            },
            {
              "file": "app.py",
              "line": 2082,
              "function": "summarize_credits"
            },
            {
              "file": "app.py",
              "line": 2055,
              "function": "load_student_credits"
            },
            {
              "file": "app.py",
              "line": 4366,
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
              "line": 4231,
              "function": "list_students"
            },
            {
              "file": "app.py",
              "line": 4495,
              "function": "reviewable_student_ids"
            },
            {
              "file": "app.py",
              "line": 2536,
              "function": "_get_class_student_ids"
            },
            {
              "file": "app.py",
              "line": 273,
              "function": "role_required"
            },
            {
              "file": "app.py",
              "line": 255,
              "function": "_expand_roles"
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
          "line": 430,
          "function": "get_settings",
          "tables": [
            {
              "name": "conduct_settings",
              "file": "conduct/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1276
                },
                {
                  "file": "init_db.py",
                  "line": 722
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
                  "file": "smart_ukn.sql",
                  "line": 1276
                },
                {
                  "file": "init_db.py",
                  "line": 722
                }
              ]
            },
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 181,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1243
                },
                {
                  "file": "init_db.py",
                  "line": 708
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 171,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1258
                },
                {
                  "file": "init_db.py",
                  "line": 692
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 4232,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 4788,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1212,
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
              "line": 4231,
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
                  "file": "smart_ukn.sql",
                  "line": 1276
                },
                {
                  "file": "init_db.py",
                  "line": 722
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
                  "file": "smart_ukn.sql",
                  "line": 1276
                },
                {
                  "file": "init_db.py",
                  "line": 722
                }
              ]
            },
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 181,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1243
                },
                {
                  "file": "init_db.py",
                  "line": 708
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 171,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1258
                },
                {
                  "file": "init_db.py",
                  "line": 692
                }
              ]
            },
            {
              "name": "students",
              "file": "app.py",
              "line": 4232,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "conduct/__init__.py",
              "line": 157,
              "function": "save_rules"
            },
            {
              "file": "app.py",
              "line": 1620,
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
              "line": 4788,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1212,
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
              "line": 4231,
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
          "file": "static/admin-core.html",
          "line": 1417
        },
        {
          "file": "static/admin-core.html",
          "line": 2764
        },
        {
          "file": "static/admin-core.html",
          "line": 2816
        },
        {
          "file": "static/admin-core.html",
          "line": 2834
        },
        {
          "file": "static/admin-core.html",
          "line": 2995
        },
        {
          "file": "static/admin-core.html",
          "line": 3083
        },
        {
          "file": "static/admin-core.html",
          "line": 3089
        },
        {
          "file": "static/admin-core.html",
          "line": 3098
        },
        {
          "file": "static/admin-core.html",
          "line": 3111
        },
        {
          "file": "static/admin-core.html",
          "line": 3177
        },
        {
          "file": "static/admin-core.html",
          "line": 3188
        },
        {
          "file": "static/admin-core.html",
          "line": 3208
        },
        {
          "file": "static/admin-core.html",
          "line": 3265
        },
        {
          "file": "static/admin-core.html",
          "line": 3277
        },
        {
          "file": "static/admin-core.html",
          "line": 3311
        },
        {
          "file": "static/admin-core.html",
          "line": 3323
        },
        {
          "file": "static/admin-core.html",
          "line": 3355
        },
        {
          "file": "static/admin-core.html",
          "line": 3415
        },
        {
          "file": "static/admin-core.html",
          "line": 3447
        },
        {
          "file": "static/admin-core.html",
          "line": 3805
        },
        {
          "file": "static/admin-core.html",
          "line": 3915
        },
        {
          "file": "static/admin-core.html",
          "line": 3929
        },
        {
          "file": "static/admin-core.html",
          "line": 3969
        },
        {
          "file": "static/admin-core.html",
          "line": 4012
        },
        {
          "file": "static/admin-core.html",
          "line": 4038
        },
        {
          "file": "static/admin-core.html",
          "line": 4058
        },
        {
          "file": "static/admin.html",
          "line": 1386
        },
        {
          "file": "static/admin.html",
          "line": 2962
        },
        {
          "file": "static/admin.html",
          "line": 3025
        },
        {
          "file": "static/admin.html",
          "line": 3045
        },
        {
          "file": "static/admin.html",
          "line": 3328
        },
        {
          "file": "static/admin.html",
          "line": 3416
        },
        {
          "file": "static/admin.html",
          "line": 3422
        },
        {
          "file": "static/admin.html",
          "line": 3431
        },
        {
          "file": "static/admin.html",
          "line": 3444
        },
        {
          "file": "static/admin.html",
          "line": 3510
        },
        {
          "file": "static/admin.html",
          "line": 3521
        },
        {
          "file": "static/admin.html",
          "line": 3541
        },
        {
          "file": "static/admin.html",
          "line": 3613
        },
        {
          "file": "static/admin.html",
          "line": 3626
        },
        {
          "file": "static/admin.html",
          "line": 3660
        },
        {
          "file": "static/admin.html",
          "line": 3672
        },
        {
          "file": "static/admin.html",
          "line": 3704
        },
        {
          "file": "static/admin.html",
          "line": 3764
        },
        {
          "file": "static/admin.html",
          "line": 3796
        },
        {
          "file": "static/admin.html",
          "line": 4046
        },
        {
          "file": "static/admin.html",
          "line": 4048
        },
        {
          "file": "static/admin.html",
          "line": 4204
        },
        {
          "file": "static/admin.html",
          "line": 4314
        },
        {
          "file": "static/admin.html",
          "line": 4328
        },
        {
          "file": "static/admin.html",
          "line": 4370
        },
        {
          "file": "static/admin.html",
          "line": 4413
        },
        {
          "file": "static/admin.html",
          "line": 4439
        },
        {
          "file": "static/admin.html",
          "line": 4459
        },
        {
          "file": "static/index.html",
          "line": 3328
        },
        {
          "file": "static/index.html",
          "line": 3353
        },
        {
          "file": "static/js/admin-core.js",
          "line": 90
        },
        {
          "file": "static/js/admin-core.js",
          "line": 254
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
          "line": 624
        },
        {
          "file": "static/js/admin-core.js",
          "line": 683
        },
        {
          "file": "static/js/admin-core.js",
          "line": 702
        },
        {
          "file": "static/js/admin-core.js",
          "line": 720
        },
        {
          "file": "static/js/admin-core.js",
          "line": 832
        },
        {
          "file": "static/js/admin-core.js",
          "line": 835
        },
        {
          "file": "static/js/admin-core.js",
          "line": 852
        },
        {
          "file": "static/js/admin-core.js",
          "line": 891
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1035
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1038
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1056
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1071
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1173
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1176
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1188
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1203
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1303
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1306
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1323
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1343
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1425
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1428
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1440
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1464
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1575
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1634
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1689
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1736
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1787
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1876
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1898
        },
        {
          "file": "static/js/admin-core.js",
          "line": 1927
        },
        {
          "file": "static/js/admin-core.js",
          "line": 2066
        },
        {
          "file": "static/js/admin-core.js",
          "line": 2303
        },
        {
          "file": "static/js/campus-features.js",
          "line": 1569
        },
        {
          "file": "static/js/campus-life.js",
          "line": 140
        },
        {
          "file": "static/js/campus-life.js",
          "line": 149
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 600
        },
        {
          "file": "static/js/campus-shell.js",
          "line": 769
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
          "url": "/api/user/seal",
          "methods": [
            "GET",
            "POST"
          ],
          "file": "app.py",
          "line": 151,
          "function": "user_seal_endpoint",
          "tables": [],
          "files": [
            {
              "file": "app.py",
              "line": 151,
              "function": "user_seal_endpoint"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/applications/form/<int:item_id>",
          "methods": [
            "GET"
          ],
          "file": "applications/__init__.py",
          "line": 414,
          "function": "application_form",
          "tables": [
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2811,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 929
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
              "line": 414,
              "function": "application_form"
            },
            {
              "file": "applications/__init__.py",
              "line": 196,
              "function": "_error"
            },
            {
              "file": "applications/__init__.py",
              "line": 400,
              "function": "_find_item"
            },
            {
              "file": "app.py",
              "line": 2809,
              "function": "load_checklists"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
          "line": 431,
          "function": "my_applications",
          "tables": [
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 228,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1989
                },
                {
                  "file": "init_db.py",
                  "line": 653
                }
              ]
            }
          ],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 431,
              "function": "my_applications"
            },
            {
              "file": "applications/__init__.py",
              "line": 389,
              "function": "is_past_retention"
            },
            {
              "file": "applications/__init__.py",
              "line": 377,
              "function": "retention"
            },
            {
              "file": "applications/__init__.py",
              "line": 370,
              "function": "_add_months"
            },
            {
              "file": "applications/__init__.py",
              "line": 224,
              "function": "load_applications"
            },
            {
              "file": "applications/__init__.py",
              "line": 206,
              "function": "_row_to_app"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "applications/__init__.py",
              "line": 321,
              "function": "describe"
            },
            {
              "file": "applications/__init__.py",
              "line": 264,
              "function": "reviewer_label"
            },
            {
              "file": "applications/__init__.py",
              "line": 310,
              "function": "can_review"
            },
            {
              "file": "applications/__init__.py",
              "line": 293,
              "function": "stamps_of"
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
          "line": 445,
          "function": "submit_application",
          "tables": [
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 228,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1989
                },
                {
                  "file": "init_db.py",
                  "line": 653
                }
              ]
            },
            {
              "name": "checklist_items",
              "file": "app.py",
              "line": 2811,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 929
                },
                {
                  "file": "init_db.py",
                  "line": 195
                }
              ]
            },
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 240,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1989
                },
                {
                  "file": "init_db.py",
                  "line": 653
                }
              ]
            },
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 506,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1989
                },
                {
                  "file": "init_db.py",
                  "line": 653
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 445,
              "function": "submit_application"
            },
            {
              "file": "applications/__init__.py",
              "line": 321,
              "function": "describe"
            },
            {
              "file": "applications/__init__.py",
              "line": 264,
              "function": "reviewer_label"
            },
            {
              "file": "applications/__init__.py",
              "line": 310,
              "function": "can_review"
            },
            {
              "file": "applications/__init__.py",
              "line": 377,
              "function": "retention"
            },
            {
              "file": "applications/__init__.py",
              "line": 370,
              "function": "_add_months"
            },
            {
              "file": "applications/__init__.py",
              "line": 293,
              "function": "stamps_of"
            },
            {
              "file": "applications/__init__.py",
              "line": 224,
              "function": "load_applications"
            },
            {
              "file": "applications/__init__.py",
              "line": 206,
              "function": "_row_to_app"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "applications/__init__.py",
              "line": 196,
              "function": "_error"
            },
            {
              "file": "applications/__init__.py",
              "line": 400,
              "function": "_find_item"
            },
            {
              "file": "app.py",
              "line": 2809,
              "function": "load_checklists"
            },
            {
              "file": "applications/__init__.py",
              "line": 239,
              "function": "get_application"
            },
            {
              "file": "applications/__init__.py",
              "line": 500,
              "function": "insert_application"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "applications/__init__.py",
              "line": 200,
              "function": "_now"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/applications/upload-options",
          "methods": [
            "GET"
          ],
          "file": "applications/__init__.py",
          "line": 525,
          "function": "upload_options",
          "tables": [],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 525,
              "function": "upload_options"
            },
            {
              "file": "applications/__init__.py",
              "line": 142,
              "function": "upload_form_code"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/applications/upload",
          "methods": [
            "POST"
          ],
          "file": "applications/__init__.py",
          "line": 561,
          "function": "submit_upload",
          "tables": [
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 240,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1989
                },
                {
                  "file": "init_db.py",
                  "line": 653
                }
              ]
            },
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 506,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1989
                },
                {
                  "file": "init_db.py",
                  "line": 653
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 561,
              "function": "submit_upload"
            },
            {
              "file": "applications/__init__.py",
              "line": 239,
              "function": "get_application"
            },
            {
              "file": "applications/__init__.py",
              "line": 206,
              "function": "_row_to_app"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "applications/__init__.py",
              "line": 321,
              "function": "describe"
            },
            {
              "file": "applications/__init__.py",
              "line": 264,
              "function": "reviewer_label"
            },
            {
              "file": "applications/__init__.py",
              "line": 310,
              "function": "can_review"
            },
            {
              "file": "applications/__init__.py",
              "line": 377,
              "function": "retention"
            },
            {
              "file": "applications/__init__.py",
              "line": 370,
              "function": "_add_months"
            },
            {
              "file": "applications/__init__.py",
              "line": 293,
              "function": "stamps_of"
            },
            {
              "file": "applications/__init__.py",
              "line": 196,
              "function": "_error"
            },
            {
              "file": "applications/__init__.py",
              "line": 500,
              "function": "insert_application"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "applications/__init__.py",
              "line": 200,
              "function": "_now"
            },
            {
              "file": "applications/__init__.py",
              "line": 534,
              "function": "check_upload_files"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/applications/<int:app_id>/files/<int:index>",
          "methods": [
            "GET"
          ],
          "file": "applications/__init__.py",
          "line": 599,
          "function": "download_upload",
          "tables": [
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 240,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1989
                },
                {
                  "file": "init_db.py",
                  "line": 653
                }
              ]
            }
          ],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 599,
              "function": "download_upload"
            },
            {
              "file": "applications/__init__.py",
              "line": 298,
              "function": "can_view"
            },
            {
              "file": "applications/__init__.py",
              "line": 196,
              "function": "_error"
            },
            {
              "file": "applications/__init__.py",
              "line": 394,
              "function": "_retention_error"
            },
            {
              "file": "applications/__init__.py",
              "line": 389,
              "function": "is_past_retention"
            },
            {
              "file": "applications/__init__.py",
              "line": 377,
              "function": "retention"
            },
            {
              "file": "applications/__init__.py",
              "line": 370,
              "function": "_add_months"
            },
            {
              "file": "applications/__init__.py",
              "line": 239,
              "function": "get_application"
            },
            {
              "file": "applications/__init__.py",
              "line": 206,
              "function": "_row_to_app"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
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
          "line": 619,
          "function": "withdraw_application",
          "tables": [
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 250,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1989
                },
                {
                  "file": "init_db.py",
                  "line": 653
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 240,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1989
                },
                {
                  "file": "init_db.py",
                  "line": 653
                }
              ]
            }
          ],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 619,
              "function": "withdraw_application"
            },
            {
              "file": "applications/__init__.py",
              "line": 200,
              "function": "_now"
            },
            {
              "file": "applications/__init__.py",
              "line": 196,
              "function": "_error"
            },
            {
              "file": "applications/__init__.py",
              "line": 246,
              "function": "save_transition"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "applications/__init__.py",
              "line": 239,
              "function": "get_application"
            },
            {
              "file": "applications/__init__.py",
              "line": 206,
              "function": "_row_to_app"
            },
            {
              "file": "app.py",
              "line": 1604,
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
          "line": 639,
          "function": "review_list",
          "tables": [
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 228,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1989
                },
                {
                  "file": "init_db.py",
                  "line": 653
                }
              ]
            }
          ],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 639,
              "function": "review_list"
            },
            {
              "file": "applications/__init__.py",
              "line": 321,
              "function": "describe"
            },
            {
              "file": "applications/__init__.py",
              "line": 264,
              "function": "reviewer_label"
            },
            {
              "file": "applications/__init__.py",
              "line": 310,
              "function": "can_review"
            },
            {
              "file": "applications/__init__.py",
              "line": 377,
              "function": "retention"
            },
            {
              "file": "applications/__init__.py",
              "line": 370,
              "function": "_add_months"
            },
            {
              "file": "applications/__init__.py",
              "line": 293,
              "function": "stamps_of"
            },
            {
              "file": "applications/__init__.py",
              "line": 389,
              "function": "is_past_retention"
            },
            {
              "file": "applications/__init__.py",
              "line": 196,
              "function": "_error"
            },
            {
              "file": "applications/__init__.py",
              "line": 224,
              "function": "load_applications"
            },
            {
              "file": "applications/__init__.py",
              "line": 206,
              "function": "_row_to_app"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
          "line": 662,
          "function": "review_application",
          "tables": [
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 240,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1989
                },
                {
                  "file": "init_db.py",
                  "line": 653
                }
              ]
            },
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 250,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1989
                },
                {
                  "file": "init_db.py",
                  "line": 653
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 662,
              "function": "review_application"
            },
            {
              "file": "applications/__init__.py",
              "line": 239,
              "function": "get_application"
            },
            {
              "file": "applications/__init__.py",
              "line": 206,
              "function": "_row_to_app"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "applications/__init__.py",
              "line": 264,
              "function": "reviewer_label"
            },
            {
              "file": "applications/__init__.py",
              "line": 321,
              "function": "describe"
            },
            {
              "file": "applications/__init__.py",
              "line": 310,
              "function": "can_review"
            },
            {
              "file": "applications/__init__.py",
              "line": 377,
              "function": "retention"
            },
            {
              "file": "applications/__init__.py",
              "line": 370,
              "function": "_add_months"
            },
            {
              "file": "applications/__init__.py",
              "line": 293,
              "function": "stamps_of"
            },
            {
              "file": "app.py",
              "line": 4763,
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
              "line": 196,
              "function": "_error"
            },
            {
              "file": "applications/__init__.py",
              "line": 246,
              "function": "save_transition"
            },
            {
              "file": "applications/__init__.py",
              "line": 200,
              "function": "_now"
            },
            {
              "file": "app.py",
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "applications/__init__.py",
              "line": 287,
              "function": "make_stamp"
            },
            {
              "file": "applications/__init__.py",
              "line": 269,
              "function": "stamp_code"
            },
            {
              "file": "applications/__init__.py",
              "line": 279,
              "function": "current_seal"
            },
            {
              "file": "applications/__init__.py",
              "line": 192,
              "function": "seal_store"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/applications/stamp/<code>",
          "methods": [
            "GET"
          ],
          "file": "applications/__init__.py",
          "line": 758,
          "function": "verify_stamp",
          "tables": [
            {
              "name": "online_applications",
              "file": "applications/__init__.py",
              "line": 228,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1989
                },
                {
                  "file": "init_db.py",
                  "line": 653
                }
              ]
            }
          ],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 758,
              "function": "verify_stamp"
            },
            {
              "file": "applications/__init__.py",
              "line": 269,
              "function": "stamp_code"
            },
            {
              "file": "applications/__init__.py",
              "line": 293,
              "function": "stamps_of"
            },
            {
              "file": "applications/__init__.py",
              "line": 224,
              "function": "load_applications"
            },
            {
              "file": "applications/__init__.py",
              "line": 206,
              "function": "_row_to_app"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/seals/mine",
          "methods": [
            "GET"
          ],
          "file": "applications/__init__.py",
          "line": 785,
          "function": "my_seal",
          "tables": [],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 785,
              "function": "my_seal"
            },
            {
              "file": "applications/__init__.py",
              "line": 279,
              "function": "current_seal"
            },
            {
              "file": "applications/__init__.py",
              "line": 192,
              "function": "seal_store"
            },
            {
              "file": "applications/__init__.py",
              "line": 776,
              "function": "_seal_auth"
            },
            {
              "file": "applications/__init__.py",
              "line": 196,
              "function": "_error"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/seals/mine",
          "methods": [
            "POST"
          ],
          "file": "applications/__init__.py",
          "line": 800,
          "function": "upload_my_seal",
          "tables": [],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 800,
              "function": "upload_my_seal"
            },
            {
              "file": "applications/__init__.py",
              "line": 192,
              "function": "seal_store"
            },
            {
              "file": "applications/__init__.py",
              "line": 196,
              "function": "_error"
            },
            {
              "file": "applications/__init__.py",
              "line": 776,
              "function": "_seal_auth"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/seals/mine",
          "methods": [
            "DELETE"
          ],
          "file": "applications/__init__.py",
          "line": 814,
          "function": "reset_my_seal",
          "tables": [],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 814,
              "function": "reset_my_seal"
            },
            {
              "file": "applications/__init__.py",
              "line": 192,
              "function": "seal_store"
            },
            {
              "file": "applications/__init__.py",
              "line": 776,
              "function": "_seal_auth"
            },
            {
              "file": "applications/__init__.py",
              "line": 196,
              "function": "_error"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/seals/mine/image",
          "methods": [
            "GET"
          ],
          "file": "applications/__init__.py",
          "line": 823,
          "function": "my_seal_image",
          "tables": [],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 823,
              "function": "my_seal_image"
            },
            {
              "file": "applications/__init__.py",
              "line": 192,
              "function": "seal_store"
            },
            {
              "file": "applications/__init__.py",
              "line": 196,
              "function": "_error"
            },
            {
              "file": "applications/__init__.py",
              "line": 776,
              "function": "_seal_auth"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/seals/sign-link",
          "methods": [
            "POST"
          ],
          "file": "applications/__init__.py",
          "line": 853,
          "function": "create_sign_link",
          "tables": [],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 853,
              "function": "create_sign_link"
            },
            {
              "file": "applications/__init__.py",
              "line": 847,
              "function": "_sign_url"
            },
            {
              "file": "applications/__init__.py",
              "line": 192,
              "function": "seal_store"
            },
            {
              "file": "applications/__init__.py",
              "line": 776,
              "function": "_seal_auth"
            },
            {
              "file": "applications/__init__.py",
              "line": 196,
              "function": "_error"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/seals/sign-link/<token>/qr.svg",
          "methods": [
            "GET"
          ],
          "file": "applications/__init__.py",
          "line": 871,
          "function": "sign_link_qr",
          "tables": [],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 871,
              "function": "sign_link_qr"
            },
            {
              "file": "applications/__init__.py",
              "line": 847,
              "function": "_sign_url"
            },
            {
              "file": "applications/__init__.py",
              "line": 835,
              "function": "_qr_svg"
            },
            {
              "file": "applications/__init__.py",
              "line": 196,
              "function": "_error"
            },
            {
              "file": "applications/__init__.py",
              "line": 865,
              "function": "_own_token"
            },
            {
              "file": "applications/__init__.py",
              "line": 192,
              "function": "seal_store"
            },
            {
              "file": "applications/__init__.py",
              "line": 776,
              "function": "_seal_auth"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/seals/sign-link/<token>/status",
          "methods": [
            "GET"
          ],
          "file": "applications/__init__.py",
          "line": 884,
          "function": "sign_link_status",
          "tables": [],
          "files": [
            {
              "file": "applications/__init__.py",
              "line": 884,
              "function": "sign_link_status"
            },
            {
              "file": "applications/__init__.py",
              "line": 196,
              "function": "_error"
            },
            {
              "file": "applications/__init__.py",
              "line": 865,
              "function": "_own_token"
            },
            {
              "file": "applications/__init__.py",
              "line": 192,
              "function": "seal_store"
            },
            {
              "file": "applications/__init__.py",
              "line": 776,
              "function": "_seal_auth"
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
          "line": 147,
          "function": "list_events",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 147,
              "function": "list_events"
            },
            {
              "file": "campus/events.py",
              "line": 108,
              "function": "event_view"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/events/mine",
          "methods": [
            "GET"
          ],
          "file": "campus/events.py",
          "line": 178,
          "function": "my_registrations",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 178,
              "function": "my_registrations"
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
          "line": 198,
          "function": "get_event",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 198,
              "function": "get_event"
            },
            {
              "file": "campus/events.py",
              "line": 108,
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
          "line": 214,
          "function": "create_event",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 214,
              "function": "create_event"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "campus/events.py",
              "line": 33,
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
          "line": 229,
          "function": "update_event",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 229,
              "function": "update_event"
            },
            {
              "file": "campus/events.py",
              "line": 33,
              "function": "clean_event"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
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
          "line": 254,
          "function": "cancel_event",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 254,
              "function": "cancel_event"
            },
            {
              "file": "campus/events.py",
              "line": 140,
              "function": "_record_notified"
            },
            {
              "file": "campus/events.py",
              "line": 130,
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
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
          "line": 329,
          "function": "register_event",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 329,
              "function": "register_event"
            },
            {
              "file": "campus/events.py",
              "line": 276,
              "function": "_confirmation_email"
            },
            {
              "file": "campus/events.py",
              "line": 130,
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
              "line": 140,
              "function": "_record_notified"
            },
            {
              "file": "campus/events.py",
              "line": 291,
              "function": "_add_registration"
            },
            {
              "file": "campus/events.py",
              "line": 84,
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
          "line": 348,
          "function": "add_registration",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 348,
              "function": "add_registration"
            },
            {
              "file": "campus/events.py",
              "line": 276,
              "function": "_confirmation_email"
            },
            {
              "file": "campus/events.py",
              "line": 130,
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
              "line": 140,
              "function": "_record_notified"
            },
            {
              "file": "campus/events.py",
              "line": 291,
              "function": "_add_registration"
            },
            {
              "file": "campus/events.py",
              "line": 84,
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
          "line": 382,
          "function": "cancel_registration",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 382,
              "function": "cancel_registration"
            },
            {
              "file": "campus/events.py",
              "line": 363,
              "function": "_promote_next_waitlisted"
            },
            {
              "file": "campus/events.py",
              "line": 372,
              "function": "_notify_promoted"
            },
            {
              "file": "campus/events.py",
              "line": 140,
              "function": "_record_notified"
            },
            {
              "file": "campus/events.py",
              "line": 130,
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
          "line": 413,
          "function": "edit_registration",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 413,
              "function": "edit_registration"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "campus/events.py",
              "line": 84,
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
          "line": 437,
          "function": "delete_registration",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 437,
              "function": "delete_registration"
            },
            {
              "file": "campus/events.py",
              "line": 363,
              "function": "_promote_next_waitlisted"
            },
            {
              "file": "campus/events.py",
              "line": 372,
              "function": "_notify_promoted"
            },
            {
              "file": "campus/events.py",
              "line": 140,
              "function": "_record_notified"
            },
            {
              "file": "campus/events.py",
              "line": 130,
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
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
          "line": 458,
          "function": "notify_registration",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 458,
              "function": "notify_registration"
            },
            {
              "file": "campus/events.py",
              "line": 276,
              "function": "_confirmation_email"
            },
            {
              "file": "campus/events.py",
              "line": 130,
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
              "line": 140,
              "function": "_record_notified"
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
          "line": 478,
          "function": "checkin",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 478,
              "function": "checkin"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/campus/events/<int:event_id>/registrations/<int:reg_id>/qr.svg",
          "methods": [
            "GET"
          ],
          "file": "campus/events.py",
          "line": 498,
          "function": "registration_qr",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 498,
              "function": "registration_qr"
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
          "line": 522,
          "function": "list_registrations",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 522,
              "function": "list_registrations"
            },
            {
              "file": "campus/events.py",
              "line": 108,
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
          "line": 541,
          "function": "send_reminders",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 541,
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
          "url": "/api/campus/events/<int:event_id>/notify-custom",
          "methods": [
            "POST"
          ],
          "file": "campus/events.py",
          "line": 568,
          "function": "notify_custom",
          "tables": [
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 568,
              "function": "notify_custom"
            },
            {
              "file": "campus/events.py",
              "line": 140,
              "function": "_record_notified"
            },
            {
              "file": "campus/events.py",
              "line": 130,
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
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
          "line": 613,
          "function": "submit_feedback",
          "tables": [],
          "files": [
            {
              "file": "campus/events.py",
              "line": 613,
              "function": "submit_feedback"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/line/bind/start",
          "methods": [
            "POST"
          ],
          "file": "campus/line_binding.py",
          "line": 87,
          "function": "bind_start",
          "tables": [],
          "files": [
            {
              "file": "campus/line_binding.py",
              "line": 87,
              "function": "bind_start"
            },
            {
              "file": "campus/line_binding.py",
              "line": 72,
              "function": "_bindings"
            }
          ],
          "storage": [
            "data/campus_store.json → line_bind_codes",
            "data/campus_store.json → line_bindings"
          ]
        },
        {
          "url": "/api/line/bind/confirm",
          "methods": [
            "POST"
          ],
          "file": "campus/line_binding.py",
          "line": 106,
          "function": "bind_confirm",
          "tables": [],
          "files": [
            {
              "file": "campus/line_binding.py",
              "line": 106,
              "function": "bind_confirm"
            },
            {
              "file": "campus/line_binding.py",
              "line": 72,
              "function": "_bindings"
            },
            {
              "file": "campus/line_binding.py",
              "line": 57,
              "function": "verify_line_id_token"
            },
            {
              "file": "campus/line_binding.py",
              "line": 52,
              "function": "_liff_channel_id"
            }
          ],
          "storage": [
            "data/campus_store.json → line_bind_codes",
            "data/campus_store.json → line_bindings"
          ]
        },
        {
          "url": "/api/line/unbind",
          "methods": [
            "POST"
          ],
          "file": "campus/line_binding.py",
          "line": 128,
          "function": "unbind",
          "tables": [],
          "files": [
            {
              "file": "campus/line_binding.py",
              "line": 128,
              "function": "unbind"
            },
            {
              "file": "campus/line_binding.py",
              "line": 72,
              "function": "_bindings"
            },
            {
              "file": "campus/line_binding.py",
              "line": 57,
              "function": "verify_line_id_token"
            },
            {
              "file": "campus/line_binding.py",
              "line": 52,
              "function": "_liff_channel_id"
            }
          ],
          "storage": [
            "data/campus_store.json → line_bindings"
          ]
        },
        {
          "url": "/api/line/menu",
          "methods": [
            "GET",
            "PUT"
          ],
          "file": "campus/line_binding.py",
          "line": 140,
          "function": "line_menu",
          "tables": [
            {
              "name": "users",
              "file": "campus/line_binding.py",
              "line": 37,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "file": "campus/line_binding.py",
              "line": 140,
              "function": "line_menu"
            },
            {
              "file": "campus/line_binding.py",
              "line": 81,
              "function": "_id_token_from_request"
            },
            {
              "file": "campus/line_binding.py",
              "line": 36,
              "function": "_role_for_username"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "campus/line_binding.py",
              "line": 76,
              "function": "username_for_line_user"
            },
            {
              "file": "campus/line_binding.py",
              "line": 72,
              "function": "_bindings"
            },
            {
              "file": "campus/line_binding.py",
              "line": 57,
              "function": "verify_line_id_token"
            },
            {
              "file": "campus/line_binding.py",
              "line": 52,
              "function": "_liff_channel_id"
            }
          ],
          "storage": [
            "data/campus_store.json → line_bindings"
          ]
        },
        {
          "url": "/api/line/schedule",
          "methods": [
            "GET"
          ],
          "file": "campus/line_binding.py",
          "line": 157,
          "function": "line_schedule",
          "tables": [
            {
              "name": "users",
              "file": "campus/line_binding.py",
              "line": 45,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "file": "campus/line_binding.py",
              "line": 157,
              "function": "line_schedule"
            },
            {
              "file": "campus/line_binding.py",
              "line": 81,
              "function": "_id_token_from_request"
            },
            {
              "file": "campus/line_binding.py",
              "line": 44,
              "function": "_student_id_for_username"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "campus/line_binding.py",
              "line": 76,
              "function": "username_for_line_user"
            },
            {
              "file": "campus/line_binding.py",
              "line": 72,
              "function": "_bindings"
            },
            {
              "file": "campus/line_binding.py",
              "line": 57,
              "function": "verify_line_id_token"
            },
            {
              "file": "campus/line_binding.py",
              "line": 52,
              "function": "_liff_channel_id"
            }
          ],
          "storage": [
            "data/campus_store.json → line_bindings"
          ]
        },
        {
          "url": "/api/line/notices",
          "methods": [
            "GET"
          ],
          "file": "campus/line_binding.py",
          "line": 177,
          "function": "line_notices",
          "tables": [
            {
              "name": "users",
              "file": "campus/line_binding.py",
              "line": 45,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 3604
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
              "file": "campus/line_binding.py",
              "line": 177,
              "function": "line_notices"
            },
            {
              "file": "campus/line_binding.py",
              "line": 81,
              "function": "_id_token_from_request"
            },
            {
              "file": "campus/line_binding.py",
              "line": 44,
              "function": "_student_id_for_username"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
              "function": "get_db_connection"
            },
            {
              "file": "campus/line_binding.py",
              "line": 76,
              "function": "username_for_line_user"
            },
            {
              "file": "campus/line_binding.py",
              "line": 72,
              "function": "_bindings"
            },
            {
              "file": "campus/line_binding.py",
              "line": 57,
              "function": "verify_line_id_token"
            },
            {
              "file": "campus/line_binding.py",
              "line": 52,
              "function": "_liff_channel_id"
            }
          ],
          "storage": [
            "data/campus_store.json → line_bindings"
          ]
        },
        {
          "url": "/api/line/oa",
          "methods": [
            "GET"
          ],
          "file": "campus/line_binding.py",
          "line": 204,
          "function": "line_oa",
          "tables": [],
          "files": [
            {
              "file": "campus/line_binding.py",
              "line": 204,
              "function": "line_oa"
            },
            {
              "file": "campus/line_binding.py",
              "line": 198,
              "function": "_oa_id"
            }
          ],
          "storage": []
        },
        {
          "url": "/api/line/oa-qr.svg",
          "methods": [
            "GET"
          ],
          "file": "campus/line_binding.py",
          "line": 212,
          "function": "line_oa_qr",
          "tables": [],
          "files": [
            {
              "file": "campus/line_binding.py",
              "line": 212,
              "function": "line_oa_qr"
            },
            {
              "file": "campus/line_binding.py",
              "line": 198,
              "function": "_oa_id"
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
          "line": 278,
          "function": "my_conduct",
          "tables": [
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 181,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1243
                },
                {
                  "file": "init_db.py",
                  "line": 708
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 171,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1258
                },
                {
                  "file": "init_db.py",
                  "line": 692
                }
              ]
            },
            {
              "name": "conduct_settings",
              "file": "conduct/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1276
                },
                {
                  "file": "init_db.py",
                  "line": 722
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
              "line": 4788,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1212,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 4232,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 2258
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
              "line": 4231,
              "function": "list_students"
            },
            {
              "file": "app.py",
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
                  "file": "smart_ukn.sql",
                  "line": 1243
                },
                {
                  "file": "init_db.py",
                  "line": 708
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 171,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1258
                },
                {
                  "file": "init_db.py",
                  "line": 692
                }
              ]
            },
            {
              "name": "conduct_settings",
              "file": "conduct/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1276
                },
                {
                  "file": "init_db.py",
                  "line": 722
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
              "line": 4788,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1212,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
                  "file": "smart_ukn.sql",
                  "line": 1258
                },
                {
                  "file": "init_db.py",
                  "line": 692
                }
              ]
            },
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 181,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1243
                },
                {
                  "file": "init_db.py",
                  "line": 708
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 171,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1258
                },
                {
                  "file": "init_db.py",
                  "line": 692
                }
              ]
            },
            {
              "name": "conduct_settings",
              "file": "conduct/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1276
                },
                {
                  "file": "init_db.py",
                  "line": 722
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 4788,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1212,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1620,
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
                  "file": "smart_ukn.sql",
                  "line": 1258
                },
                {
                  "file": "init_db.py",
                  "line": 692
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 364,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1258
                },
                {
                  "file": "init_db.py",
                  "line": 692
                }
              ]
            },
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 181,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1243
                },
                {
                  "file": "init_db.py",
                  "line": 708
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 171,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1258
                },
                {
                  "file": "init_db.py",
                  "line": 692
                }
              ]
            },
            {
              "name": "conduct_settings",
              "file": "conduct/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1276
                },
                {
                  "file": "init_db.py",
                  "line": 722
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 4788,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1212,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 1620,
              "function": "db_execute"
            },
            {
              "file": "conduct/__init__.py",
              "line": 67,
              "function": "_error"
            },
            {
              "file": "app.py",
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
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
                  "file": "smart_ukn.sql",
                  "line": 1243
                },
                {
                  "file": "init_db.py",
                  "line": 708
                }
              ]
            },
            {
              "name": "conduct_evaluations",
              "file": "conduct/__init__.py",
              "line": 181,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1243
                },
                {
                  "file": "init_db.py",
                  "line": 708
                }
              ]
            },
            {
              "name": "conduct_records",
              "file": "conduct/__init__.py",
              "line": 171,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1258
                },
                {
                  "file": "init_db.py",
                  "line": 692
                }
              ]
            },
            {
              "name": "conduct_settings",
              "file": "conduct/__init__.py",
              "line": 84,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 1276
                },
                {
                  "file": "init_db.py",
                  "line": 722
                }
              ]
            },
            {
              "name": "audit_logs",
              "file": "app.py",
              "line": 338,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 343,
              "schema": [
                {
                  "file": "smart_ukn.sql",
                  "line": 493
                },
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
              "line": 4788,
              "function": "term_of"
            },
            {
              "file": "app.py",
              "line": 1212,
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
              "line": 1604,
              "function": "fetch_db_rows"
            },
            {
              "file": "app.py",
              "line": 220,
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
              "line": 320,
              "function": "write_audit_log"
            },
            {
              "file": "app.py",
              "line": 313,
              "function": "client_ip"
            },
            {
              "file": "app.py",
              "line": 1620,
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
  "routeCount": 305,
  "schemaCount": 63,
  "schema": {
    "academic_calendar": [
      {
        "file": "smart_ukn.sql",
        "line": 30
      },
      {
        "file": "init_db.py",
        "line": 386
      }
    ],
    "admin_cases": [
      {
        "file": "smart_ukn.sql",
        "line": 59
      }
    ],
    "advisor_messages": [
      {
        "file": "smart_ukn.sql",
        "line": 136
      },
      {
        "file": "init_db.py",
        "line": 854
      }
    ],
    "anniversary_events": [
      {
        "file": "smart_ukn.sql",
        "line": 165
      },
      {
        "file": "init_db.py",
        "line": 739
      }
    ],
    "anniversary_wishes": [
      {
        "file": "smart_ukn.sql",
        "line": 190
      },
      {
        "file": "init_db.py",
        "line": 755
      }
    ],
    "announcements": [
      {
        "file": "smart_ukn.sql",
        "line": 205
      },
      {
        "file": "init_db.py",
        "line": 471
      }
    ],
    "announcement_reads": [
      {
        "file": "smart_ukn.sql",
        "line": 234
      },
      {
        "file": "init_db.py",
        "line": 484
      }
    ],
    "assignments": [
      {
        "file": "smart_ukn.sql",
        "line": 258
      },
      {
        "file": "init_db.py",
        "line": 495
      }
    ],
    "assignment_submissions": [
      {
        "file": "smart_ukn.sql",
        "line": 287
      },
      {
        "file": "init_db.py",
        "line": 510
      }
    ],
    "attendance_records": [
      {
        "file": "smart_ukn.sql",
        "line": 310
      },
      {
        "file": "init_db.py",
        "line": 434
      }
    ],
    "audit_logs": [
      {
        "file": "smart_ukn.sql",
        "line": 493
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
        "line": 675
      },
      {
        "file": "init_db.py",
        "line": 121
      }
    ],
    "checklist_items": [
      {
        "file": "smart_ukn.sql",
        "line": 929
      },
      {
        "file": "init_db.py",
        "line": 195
      }
    ],
    "checklist_progress": [
      {
        "file": "smart_ukn.sql",
        "line": 964
      },
      {
        "file": "init_db.py",
        "line": 420
      }
    ],
    "class_groups": [
      {
        "file": "smart_ukn.sql",
        "line": 987
      },
      {
        "file": "init_db.py",
        "line": 802
      }
    ],
    "class_group_members": [
      {
        "file": "smart_ukn.sql",
        "line": 1015
      },
      {
        "file": "init_db.py",
        "line": 812
      }
    ],
    "class_notices": [
      {
        "file": "smart_ukn.sql",
        "line": 1040
      },
      {
        "file": "init_db.py",
        "line": 823
      }
    ],
    "class_notice_recipients": [
      {
        "file": "smart_ukn.sql",
        "line": 1100
      },
      {
        "file": "init_db.py",
        "line": 843
      }
    ],
    "class_schedule": [
      {
        "file": "smart_ukn.sql",
        "line": 1188
      },
      {
        "file": "init_db.py",
        "line": 454
      }
    ],
    "conduct_evaluations": [
      {
        "file": "smart_ukn.sql",
        "line": 1243
      },
      {
        "file": "init_db.py",
        "line": 708
      }
    ],
    "conduct_records": [
      {
        "file": "smart_ukn.sql",
        "line": 1258
      },
      {
        "file": "init_db.py",
        "line": 692
      }
    ],
    "conduct_settings": [
      {
        "file": "smart_ukn.sql",
        "line": 1276
      },
      {
        "file": "init_db.py",
        "line": 722
      }
    ],
    "counseling_records": [
      {
        "file": "smart_ukn.sql",
        "line": 1289
      },
      {
        "file": "init_db.py",
        "line": 891
      }
    ],
    "course_map": [
      {
        "file": "smart_ukn.sql",
        "line": 1325
      },
      {
        "file": "init_db.py",
        "line": 84
      }
    ],
    "deadlines": [
      {
        "file": "smart_ukn.sql",
        "line": 1466
      },
      {
        "file": "init_db.py",
        "line": 342
      }
    ],
    "departments": [
      {
        "file": "smart_ukn.sql",
        "line": 1497
      },
      {
        "file": "init_db.py",
        "line": 41
      }
    ],
    "dorm_applications": [
      {
        "file": "smart_ukn.sql",
        "line": 1523
      }
    ],
    "events": [
      {
        "file": "smart_ukn.sql",
        "line": 1561
      }
    ],
    "event_registrations": [
      {
        "file": "smart_ukn.sql",
        "line": 1592
      }
    ],
    "faculty_profiles": [
      {
        "file": "smart_ukn.sql",
        "line": 1633
      },
      {
        "file": "init_db.py",
        "line": 616
      }
    ],
    "graduation_requirements": [
      {
        "file": "smart_ukn.sql",
        "line": 1669
      },
      {
        "file": "init_db.py",
        "line": 299
      }
    ],
    "knowledge_base": [
      {
        "file": "smart_ukn.sql",
        "line": 1696
      },
      {
        "file": "init_db.py",
        "line": 163
      }
    ],
    "knowledge_categories": [
      {
        "file": "smart_ukn.sql",
        "line": 1726
      },
      {
        "file": "init_db.py",
        "line": 152
      }
    ],
    "leave_requests": [
      {
        "file": "smart_ukn.sql",
        "line": 1749
      },
      {
        "file": "init_db.py",
        "line": 521
      }
    ],
    "lockers": [
      {
        "file": "smart_ukn.sql",
        "line": 1780
      }
    ],
    "meetings": [
      {
        "file": "smart_ukn.sql",
        "line": 1867
      }
    ],
    "meeting_members": [
      {
        "file": "smart_ukn.sql",
        "line": 1900
      }
    ],
    "moodle_links": [
      {
        "file": "smart_ukn.sql",
        "line": 1935
      }
    ],
    "notification_log": [
      {
        "file": "smart_ukn.sql",
        "line": 1956
      },
      {
        "file": "init_db.py",
        "line": 772
      }
    ],
    "online_applications": [
      {
        "file": "smart_ukn.sql",
        "line": 1989
      },
      {
        "file": "init_db.py",
        "line": 653
      }
    ],
    "user_seals": [
      {
        "file": "smart_ukn.sql",
        "line": 2010
      },
      {
        "file": "init_db.py",
        "line": 675
      }
    ],
    "report_download_logs": [
      {
        "file": "smart_ukn.sql",
        "line": 2030
      }
    ],
    "report_favorites": [
      {
        "file": "smart_ukn.sql",
        "line": 2053
      }
    ],
    "report_files": [
      {
        "file": "smart_ukn.sql",
        "line": 2075
      }
    ],
    "report_view_logs": [
      {
        "file": "smart_ukn.sql",
        "line": 2103
      }
    ],
    "room_bookings": [
      {
        "file": "smart_ukn.sql",
        "line": 2116
      }
    ],
    "scholarships": [
      {
        "file": "smart_ukn.sql",
        "line": 2147
      },
      {
        "file": "init_db.py",
        "line": 557
      }
    ],
    "search_feedback": [
      {
        "file": "smart_ukn.sql",
        "line": 2187
      },
      {
        "file": "init_db.py",
        "line": 270
      }
    ],
    "search_logs": [
      {
        "file": "smart_ukn.sql",
        "line": 2212
      },
      {
        "file": "init_db.py",
        "line": 407
      }
    ],
    "self_reviews": [
      {
        "file": "smart_ukn.sql",
        "line": 2241
      },
      {
        "file": "init_db.py",
        "line": 635
      }
    ],
    "students": [
      {
        "file": "smart_ukn.sql",
        "line": 2258
      },
      {
        "file": "init_db.py",
        "line": 51
      }
    ],
    "student_credits": [
      {
        "file": "smart_ukn.sql",
        "line": 2358
      },
      {
        "file": "init_db.py",
        "line": 104
      }
    ],
    "student_privacy_settings": [
      {
        "file": "smart_ukn.sql",
        "line": 3301
      },
      {
        "file": "init_db.py",
        "line": 285
      }
    ],
    "student_records": [
      {
        "file": "smart_ukn.sql",
        "line": 3324
      },
      {
        "file": "init_db.py",
        "line": 924
      }
    ],
    "synonym_dictionary": [
      {
        "file": "smart_ukn.sql",
        "line": 3509
      },
      {
        "file": "init_db.py",
        "line": 182
      }
    ],
    "teacher_directory": [
      {
        "file": "smart_ukn.sql",
        "line": 3542
      }
    ],
    "unmatched_queries": [
      {
        "file": "smart_ukn.sql",
        "line": 3573
      },
      {
        "file": "init_db.py",
        "line": 255
      }
    ],
    "users": [
      {
        "file": "smart_ukn.sql",
        "line": 3604
      },
      {
        "file": "init_db.py",
        "line": 66
      }
    ],
    "user_preferences": [
      {
        "file": "smart_ukn.sql",
        "line": 3729
      },
      {
        "file": "init_db.py",
        "line": 601
      }
    ],
    "visitor_logs": [
      {
        "file": "smart_ukn.sql",
        "line": 3762
      },
      {
        "file": "init_db.py",
        "line": 317
      }
    ],
    "visit_bookings": [
      {
        "file": "smart_ukn.sql",
        "line": 3790
      }
    ],
    "application_progress": [
      {
        "file": "init_db.py",
        "line": 236
      }
    ],
    "scholarship_applications": [
      {
        "file": "init_db.py",
        "line": 580
      }
    ]
  }
};
