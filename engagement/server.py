"""First-party feedback inbox and bounded anonymous operation counters."""
import argparse
from contextlib import contextmanager
from collections import OrderedDict
import datetime as dt
from email.message import EmailMessage
import hashlib
import hmac
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import re
import secrets
import smtplib
import sqlite3
import ssl
import threading
import time
import uuid

ORIGINS = {"https://afeiii.com": "portal", **{
    "https://" + site + ".afeiii.com": site for site in ("tools", "pdf", "convert", "check", "resume")}}
PHASES = {"entry", "start", "success", "failure", "download"}
ROOT = Path(__file__).resolve().parent


class Rejected(ValueError):
    def __init__(self, status, message):
        self.status, self.message = status, message


class Store:
    def __init__(self, state, catalog):
        self.state = Path(state)
        self.state.mkdir(parents=True, exist_ok=True)
        self.database = self.state / "engagement.sqlite3"
        self.catalog = json.loads(Path(catalog).read_text(encoding="utf-8"))
        self.lock = threading.Lock()
        self.secret = secrets.token_bytes(32)
        self.rates = OrderedDict()
        with self.connect() as db:
            db.executescript("""
            CREATE TABLE IF NOT EXISTS feedback (
              id TEXT PRIMARY KEY, created TEXT NOT NULL, site TEXT NOT NULL, tool TEXT NOT NULL,
              kind TEXT NOT NULL, message TEXT NOT NULL, contact TEXT NOT NULL,
              mail_state TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0,
              next_attempt INTEGER NOT NULL DEFAULT 0);
            CREATE TABLE IF NOT EXISTS counts (
              day TEXT, site TEXT, tool TEXT, phase TEXT, total INTEGER NOT NULL,
              PRIMARY KEY(day,site,tool,phase));
            CREATE TABLE IF NOT EXISTS dedup (id TEXT PRIMARY KEY, expires INTEGER NOT NULL);
            """)
        if os.name != "nt":
            os.chmod(self.database, 0o600)

    @contextmanager
    def connect(self):
        db = sqlite3.connect(self.database, timeout=3)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA secure_delete=ON")
        try:
            with db:
                yield db
        finally:
            db.close()

    def throttle(self, ip, channel):
        now = time.monotonic()
        key = hmac.new(self.secret, (ip + channel).encode(), hashlib.sha256).digest()
        with self.lock:
            bucket, count = self.rates.pop(key, (now, 0))
            if now - bucket >= 3600:
                bucket, count = now, 0
            self.rates[key] = (bucket, count + 1)
            while len(self.rates) > 10000:
                self.rates.popitem(last=False)
        if count >= (12 if channel == "feedback" else 600):
            raise Rejected(429, "操作过于频繁，请稍后再试。")

    def receive(self, origin, channel, data, ip):
        if not isinstance(data, dict):
            raise Rejected(400, "请求格式无效。")
        common = {"id", "site", "tool"}
        fields = common | ({"kind", "message", "contact", "website"} if channel == "feedback" else {"phase"})
        if set(data) - fields or not common <= set(data):
            raise Rejected(400, "请求包含不支持的字段。")
        site, tool = data.get("site"), data.get("tool")
        if not isinstance(site, str) or ORIGINS.get(origin) != site:
            raise Rejected(403, "来源无效。")
        if not isinstance(tool, str) or tool not in self.catalog.get(site, {}):
            raise Rejected(400, "工具标识无效。")
        try:
            request_id = str(uuid.UUID(data["id"]))
            if request_id != data["id"]:
                raise ValueError()
        except (ValueError, TypeError, AttributeError):
            raise Rejected(400, "请求标识无效。") from None
        if channel == "feedback":
            if data.get("website"):
                raise Rejected(400, "请使用页面中的反馈表单。")
            kind, message, contact = data.get("kind"), data.get("message"), data.get("contact", "")
            if not isinstance(kind, str) or kind not in ("issue", "idea", "other") or not isinstance(message, str) or not 5 <= len(message.strip()) <= 2000:
                raise Rejected(400, "请填写 5–2000 字的问题描述。")
            if not isinstance(contact, str) or len(contact) > 120 or (contact and not re.fullmatch(r"[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+", contact)):
                raise Rejected(400, "联系邮箱格式无效。")
            self.throttle(ip, channel)
            with self.connect() as db:
                existing = db.execute("SELECT * FROM feedback WHERE id=?", (request_id,)).fetchone()
                if existing:
                    if any(existing[k] != v for k, v in {"site": site, "tool": tool, "kind": kind, "message": message.strip(), "contact": contact}.items()):
                        raise Rejected(409, "请为新的反馈重新提交。")
                else:
                    if db.execute("SELECT count(*) FROM feedback WHERE created>=?", (self.cutoff(1),)).fetchone()[0] >= 300:
                        raise Rejected(503, "当前接收繁忙，请稍后再试或发送邮件。")
                    db.execute("INSERT INTO feedback(id,created,site,tool,kind,message,contact) VALUES(?,?,?,?,?,?,?)",
                               (request_id, dt.datetime.now(dt.timezone.utc).isoformat(), site, tool, kind, message.strip(), contact))
            return {"received": True, "id": request_id}
        phase = data.get("phase")
        if not isinstance(phase, str) or phase not in PHASES:
            raise Rejected(400, "操作类型无效。")
        self.throttle(ip, channel)
        # This ID belongs to one operation, never a persistent visitor identity.
        digest = hashlib.sha256((site + ":" + tool + ":" + request_id + ":" + phase).encode()).hexdigest()
        with self.connect() as db:
            now = int(time.time())
            db.execute("DELETE FROM dedup WHERE expires<?", (now,))
            if db.execute("SELECT count(*) FROM dedup").fetchone()[0] >= 100000:
                raise Rejected(503, "统计接收繁忙。")
            if db.execute("INSERT OR IGNORE INTO dedup VALUES(?,?)", (digest, now + 86400)).rowcount:
                day = dt.datetime.now(dt.timezone(dt.timedelta(hours=8))).date().isoformat()
                db.execute("INSERT INTO counts VALUES(?,?,?,?,1) ON CONFLICT(day,site,tool,phase) DO UPDATE SET total=total+1",
                           (day, site, tool, phase))
        return {"received": True}

    @staticmethod
    def cutoff(days):
        return (dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=days)).isoformat()

    def report(self):
        end_day = dt.datetime.now(dt.timezone(dt.timedelta(hours=8))).date()
        start_day = end_day - dt.timedelta(days=27)
        with self.connect() as db:
            counts = [dict(row) for row in db.execute("SELECT site,tool,phase,sum(total) AS total FROM counts WHERE day>=? GROUP BY site,tool,phase", (start_day.isoformat(),))]
            feedback = [dict(row) for row in db.execute("SELECT id,created,site,tool,kind,message,contact,mail_state FROM feedback ORDER BY created DESC LIMIT 100")]
            pending = db.execute("SELECT count(*) FROM feedback WHERE mail_state!='accepted'").fetchone()[0]
            oldest_pending = db.execute("SELECT min(created) FROM feedback WHERE mail_state!='accepted'").fetchone()[0]
        return {"updated_at": dt.datetime.now(dt.timezone.utc).isoformat(), "days": 28, "start_day": str(start_day), "end_day": str(end_day), "counts": counts, "feedback": feedback,
                "mail_pending": pending, "mail_oldest_pending": oldest_pending, "catalog": self.catalog,
                "note": "操作次数来自允许匿名统计的浏览器，非用户数；下载表示浏览器触发下载，不代表文件已保存。未接入操作不补零。"}

    def deliver(self, config_path):
        if not config_path:
            return
        path = Path(config_path)
        if os.name != "nt" and path.stat().st_mode & 0o077:
            raise ValueError("邮件配置权限必须为 0600")
        cfg = json.loads(path.read_text(encoding="utf-8"))
        with self.connect() as db:
            rows = db.execute("SELECT * FROM feedback WHERE mail_state!='accepted' AND attempts<5 AND next_attempt<=? ORDER BY created LIMIT 10", (int(time.time()),)).fetchall()
        for row in rows:
            msg = EmailMessage()
            msg["From"], msg["To"] = cfg["from"], cfg["to"]
            msg["Reply-To"] = "support@afeiii.com"
            msg["Subject"] = "十三月用户反馈｜" + row["site"] + "｜" + row["kind"]
            msg["Message-ID"] = "<feedback-" + row["id"] + "@notice.afeiii.com>"
            msg.set_content("工具：" + row["tool"] + "\n收到时间：" + row["created"] + "\n\n用户主动填写：\n" + row["message"] + "\n\n联系邮箱：" + (row["contact"] or "未提供") + "\n反馈编号：" + row["id"])
            accepted = False
            try:
                with smtplib.SMTP_SSL(cfg["host"], int(cfg["port"]), context=ssl.create_default_context(), timeout=15) as client:
                    client.login(cfg["username"], cfg["password"])
                    accepted = not client.send_message(msg)
            except (OSError, smtplib.SMTPException):
                pass
            with self.connect() as db:
                db.execute("UPDATE feedback SET mail_state=?,attempts=attempts+1,next_attempt=? WHERE id=?", ("accepted" if accepted else "failed", int(time.time()) + 3600, row["id"]))

    def maintain(self):
        with self.connect() as db:
            db.execute("DELETE FROM feedback WHERE created<?", (self.cutoff(90),))
            db.execute("DELETE FROM counts WHERE day<?", (self.cutoff(90)[:10],))
            db.execute("DELETE FROM dedup WHERE expires<?", (int(time.time()),))
        temporary = self.state / "report.tmp"
        temporary.write_text(json.dumps(self.report(), ensure_ascii=False), encoding="utf-8")
        if os.name != "nt":
            os.chmod(temporary, 0o640)
        temporary.replace(self.state / "report.json")


def make_server(store, port):
    class Handler(BaseHTTPRequestHandler):
        server_version = "AfeiiiFeedback"

        def log_message(self, *_):
            pass

        def setup(self):
            super().setup()
            self.connection.settimeout(5)

        def reply(self, status, value=None):
            body = b"" if status == 204 else json.dumps(value or {}, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            origin = self.headers.get("Origin", "")
            if origin in ORIGINS:
                self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Cross-Origin-Resource-Policy", "cross-origin")
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)

        def valid_path(self):
            return self.path in ("/engagement/v1/feedback", "/engagement/v1/events")

        def do_OPTIONS(self):
            valid = self.valid_path() and self.headers.get("Origin") in ORIGINS and self.headers.get("Access-Control-Request-Method") == "POST"
            self.reply(204 if valid else 403)

        def do_POST(self):
            if not self.valid_path():
                return self.reply(404)
            if self.headers.get("Origin") not in ORIGINS:
                return self.reply(403, {"error": "来源无效。"})
            if self.headers.get("Content-Type", "").split(";")[0].strip() != "application/json" or self.headers.get("Transfer-Encoding"):
                return self.reply(415, {"error": "请求格式无效。"})
            try:
                length = int(self.headers.get("Content-Length", "0"))
                if not 0 < length <= 12000:
                    raise Rejected(413, "提交内容过长。")
                body = self.rfile.read(length)
                if len(body) != length:
                    raise Rejected(400, "请求不完整。")
                data = json.loads(body, parse_constant=lambda _: (_ for _ in ()).throw(ValueError()))
                # Caddy overwrites this header; this server listens only on loopback.
                ip = self.headers.get("X-Engagement-IP", self.client_address[0])
                result = store.receive(self.headers["Origin"], "feedback" if self.path.endswith("feedback") else "events", data, ip)
                self.reply(201 if self.path.endswith("feedback") else 200, result)
            except Rejected as exc:
                self.reply(exc.status, {"error": exc.message})
            except (ValueError, UnicodeError, TypeError):
                self.reply(400, {"error": "请求格式无效。"})
            except sqlite3.Error:
                self.reply(503, {"error": "暂时无法接收，请保留内容稍后再试。"})

        def do_GET(self):
            if self.path != "/healthz":
                return self.reply(404)
            try:
                with store.connect() as db:
                    db.execute("SELECT 1 FROM feedback LIMIT 1").fetchone()
                self.reply(200, {"status": "ok"})
            except sqlite3.Error:
                self.reply(503, {"status": "unavailable"})

        do_HEAD = do_GET

    class BoundedServer(ThreadingHTTPServer):
        daemon_threads = True
        request_queue_size = 16
        slots = threading.BoundedSemaphore(16)

        def process_request(self, request, client_address):
            if not self.slots.acquire(blocking=False):
                self.shutdown_request(request)
                return
            try:
                super().process_request(request, client_address)
            except BaseException:
                self.slots.release()
                raise

        def process_request_thread(self, request, client_address):
            try:
                super().process_request_thread(request, client_address)
            finally:
                self.slots.release()

    return BoundedServer(("127.0.0.1", port), Handler)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--state", type=Path, required=True)
    parser.add_argument("--catalog", type=Path, default=ROOT.parent / "public/engagement/catalog.json")
    parser.add_argument("--mail-config", type=Path)
    parser.add_argument("--port", type=int, default=18767)
    args = parser.parse_args()
    store = Store(args.state, args.catalog)
    store.maintain()

    def worker():
        while True:
            try:
                store.deliver(args.mail_config)
                store.maintain()
            except (OSError, ValueError, sqlite3.Error):
                print("反馈通知或报告更新失败；已接收内容保留在队列。", flush=True)
            time.sleep(60)

    threading.Thread(target=worker, daemon=True).start()
    with make_server(store, args.port) as server:
        server.serve_forever()


if __name__ == "__main__":
    main()
