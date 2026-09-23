"""
缺曠課通知模組

找出 notified = 0 的紀錄，每位學生寄一封信到校園信箱，寄出成功後才標記為已通知。
為保護個資，信件只寫固定通知文字，不含日期、課程、缺曠類別等任何具體紀錄。

SMTP 設定 (環境變數)：
  SMTP_HOST           SMTP 主機；未設定時為 demo 模式，信件改印在終端機
  SMTP_PORT           預設 587
  SMTP_USER           登入帳號
  SMTP_PASSWORD       登入密碼
  SMTP_FROM           寄件者，預設同 SMTP_USER
  SMTP_SECURITY       starttls (預設) / ssl / none
  CAMPUS_EMAIL_DOMAIN 學生校園信箱網域，預設 stu.ukn.edu.tw (信箱 = 學號小寫@網域)

也可單獨執行 (例如排程每天寄一次)：python -m attendance.notify
"""
import os
import smtplib
from collections import OrderedDict
from email.message import EmailMessage

NOTIFY_SUBJECT = "【康寧大學】缺曠課紀錄通知"
NOTIFY_BODY = "您有新的缺曠課紀錄，請登入系統查看"


def campus_email(student_id):
    domain = os.getenv("CAMPUS_EMAIL_DOMAIN", "stu.ukn.edu.tw")
    return f"{student_id.lower()}@{domain}"


class ConsoleMailer:
    """demo 模式：未設定 SMTP 時把信件印在終端機"""

    mode = "console"

    def send(self, to_addr, subject, body):
        print("=" * 50)
        print("📧 [缺曠課通知 demo 模式，未實際寄出]")
        print(f"   收件者：{to_addr}")
        print(f"   主旨：{subject}")
        print(f"   內容：{body}")
        print("=" * 50, flush=True)


class SmtpMailer:
    mode = "smtp"

    def __init__(self, host, port, user, password, from_addr, security):
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        self.from_addr = from_addr
        self.security = security

    def send(self, to_addr, subject, body):
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = self.from_addr
        msg["To"] = to_addr
        msg.set_content(body)

        smtp_class = smtplib.SMTP_SSL if self.security == "ssl" else smtplib.SMTP
        with smtp_class(self.host, self.port, timeout=15) as server:
            if self.security == "starttls":
                server.starttls()
            if self.user:
                server.login(self.user, self.password)
            server.send_message(msg)


def get_mailer():
    host = os.getenv("SMTP_HOST")
    if not host:
        return ConsoleMailer()
    user = os.getenv("SMTP_USER", "")
    return SmtpMailer(
        host=host,
        port=int(os.getenv("SMTP_PORT", 587)),
        user=user,
        password=os.getenv("SMTP_PASSWORD", ""),
        from_addr=os.getenv("SMTP_FROM", user),
        security=os.getenv("SMTP_SECURITY", "starttls").lower()
    )


def send_pending_notifications(source, mailer=None):
    """寄出所有未通知紀錄的通知信 (每位學生一封)，回傳寄送結果摘要"""
    mailer = mailer or get_mailer()
    by_student = OrderedDict()
    for record in source.list_unnotified():
        by_student.setdefault(record["student_id"], []).append(record["id"])

    notified_students, notified_records, failed = [], 0, []
    for student_id, record_ids in by_student.items():
        try:
            mailer.send(campus_email(student_id), NOTIFY_SUBJECT, NOTIFY_BODY)
        except Exception as e:
            # 寄送失敗不標記，下次執行會再寄
            failed.append({"student_id": student_id, "error": f"{type(e).__name__}: {e}"})
            continue
        source.mark_notified(record_ids)
        notified_students.append(student_id)
        notified_records += len(record_ids)

    return {
        "mode": mailer.mode,
        "students_notified": len(notified_students),
        "records_notified": notified_records,
        "failed": failed
    }


if __name__ == "__main__":
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from app import get_attendance_source

    result = send_pending_notifications(get_attendance_source())
    print(f"寄送模式：{result['mode']}，通知 {result['students_notified']} 位學生 ({result['records_notified']} 筆紀錄)")
    for f in result["failed"]:
        print(f"⚠️ {f['student_id']} 寄送失敗：{f['error']}")
