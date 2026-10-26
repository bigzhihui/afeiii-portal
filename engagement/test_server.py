import concurrent.futures
import http.client
import json
from pathlib import Path
import smtplib
import tempfile
import threading
import unittest
from unittest.mock import patch
import uuid

from server import Store, Rejected, make_server


class FeedbackTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory(prefix="afeiii-engagement-test-")
        self.addCleanup(self.folder.cleanup)
        self.root = Path(self.folder.name)
        catalog = self.root / "catalog.json"
        catalog.write_text(json.dumps({"portal": {"home": "首页"}, "convert": {"convert": "转换"}}))
        self.store = Store(self.root / "state", catalog)

    def feedback(self, **extra):
        return {"id": str(uuid.uuid4()), "site": "portal", "tool": "home", "kind": "issue", "message": "测试反馈内容", "contact": "", **extra}

    def receive(self, data):
        return self.store.receive("https://afeiii.com", "feedback", data, "127.0.0.1")

    def rejected(self, status, data, channel="feedback", origin="https://afeiii.com"):
        with self.assertRaises(Rejected) as error:
            self.store.receive(origin, channel, data, "127.0.0.2")
        self.assertEqual(error.exception.status, status)

    def test_feedback_acknowledged_only_after_commit_and_idempotent(self):
        data = self.feedback(message="<script>alert('x')</script> 用户主动填写")
        self.assertTrue(self.receive(data)["received"])
        self.assertTrue(self.receive(data)["received"])
        report = self.store.report()
        self.assertEqual(len(report["feedback"]), 1)
        self.assertEqual(report["feedback"][0]["message"], data["message"])
        self.assertEqual(report["mail_pending"], 1)
        self.rejected(409, {**data, "message": "不相同的新内容"})

    def test_origin_and_site_must_match_exactly(self):
        for origin in ("https://evil.example", "null", "https://afeiii.com.evil.example", "http://afeiii.com", ""):
            with self.subTest(origin=origin):
                self.rejected(403, self.feedback(), origin=origin)
        self.rejected(403, self.feedback(site="convert"))

    def test_unknown_automatic_fields_rejected(self):
        for key in ("url", "path", "query", "filename", "file", "content", "user", "userAgent", "referrer", "resume", "error", "target"):
            with self.subTest(field=key):
                self.rejected(400, self.feedback(**{key: "SECRET"}))
        self.assertEqual(self.store.report()["feedback"], [])

    def test_validation_and_honeypot(self):
        for extra in ({"kind": []}, {"kind": "spam"}, {"message": "短"}, {"message": "x" * 2001}, {"contact": "a@b.com\r\nBcc:x@y.com"}, {"tool": "private/SECRET"}, {"id": "invalid"}, {"website": "spam"}, {"site": []}):
            with self.subTest(extra=extra): self.rejected(400 if extra != {"site": []} else 403, self.feedback(**extra))

    def test_throttled_feedback_keeps_received_items(self):
        for _ in range(12): self.receive(self.feedback())
        with self.assertRaises(Rejected) as error: self.receive(self.feedback())
        self.assertEqual(error.exception.status, 429)
        self.assertEqual(len(self.store.report()["feedback"]), 12)

    def test_events_only_store_counts_and_short_lived_digests(self):
        item = {"id": str(uuid.uuid4()), "site": "convert", "tool": "convert", "phase": "start"}
        for _ in range(2): self.store.receive("https://convert.afeiii.com", "events", item, "1.2.3.4")
        self.store.receive("https://convert.afeiii.com", "events", {**item, "phase": "success"}, "1.2.3.4")
        self.assertEqual([row["total"] for row in self.store.report()["counts"]], [1, 1])
        with self.store.connect() as db:
            self.assertNotIn(item["id"], str([tuple(r) for r in db.execute("SELECT * FROM dedup")]))
            self.assertNotIn("1.2.3.4", str([tuple(r) for r in db.execute("SELECT * FROM counts")]))
        self.rejected(400, {**item, "phase": "file_name"}, "events", "https://convert.afeiii.com")
        self.rejected(400, {**item, "filename": "SECRET.pdf"}, "events", "https://convert.afeiii.com")

    def test_parallel_retries_count_once(self):
        data = {"id": str(uuid.uuid4()), "site": "convert", "tool": "convert", "phase": "success"}
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(lambda _: self.store.receive("https://convert.afeiii.com", "events", data, "1.2.3.4"), range(16)))
        self.assertEqual(len(results), 16)
        self.assertEqual(self.store.report()["counts"][0]["total"], 1)

    def test_retention_and_private_report(self):
        self.receive(self.feedback())
        with self.store.connect() as db:
            db.execute("UPDATE feedback SET created='2000-01-01T00:00:00+00:00'")
            db.execute("INSERT INTO counts VALUES('2000-01-01','portal','home','entry',1)")
            db.execute("INSERT INTO dedup VALUES('expired',0)")
        self.store.maintain()
        self.assertEqual(self.store.report()["feedback"], [])
        self.assertEqual(self.store.report()["counts"], [])
        self.assertTrue((self.store.state / "report.json").is_file())

    def test_smtp_failure_preserves_feedback_and_does_not_claim_delivery(self):
        self.receive(self.feedback())
        config = self.root / "mail.json"
        config.write_text(json.dumps(dict(host="localhost", port=465, username="test", password="SECRET", **{"from": "test@example.com", "to": "owner@example.com"})))
        config.chmod(0o600)
        with patch("server.smtplib.SMTP_SSL", side_effect=smtplib.SMTPException("SECRET")):
            self.store.deliver(config)
        self.assertEqual(self.store.report()["mail_pending"], 1)
        self.assertEqual(self.store.report()["feedback"][0]["mail_state"], "failed")
        with self.store.connect() as db: db.execute("UPDATE feedback SET next_attempt=0")
        with patch("server.smtplib.SMTP_SSL") as smtp:
            smtp.return_value.__enter__.return_value.send_message.return_value = {}
            self.store.deliver(config)
        self.assertEqual(self.store.report()["mail_pending"], 0)

    def test_http_cors_body_limits_and_no_public_report(self):
        server = make_server(self.store, 0)
        worker = threading.Thread(target=server.serve_forever, daemon=True)
        worker.start()
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        def request(method, path, body=None, headers=None):
            conn = http.client.HTTPConnection("127.0.0.1", server.server_port, timeout=3)
            self.addCleanup(conn.close)
            conn.request(method, path, body=body, headers=headers or {})
            response = conn.getresponse()
            content = response.read()
            return response.status, dict(response.headers), content
        headers = {"Origin": "https://afeiii.com", "Content-Type": "application/json"}
        status, cors, _ = request("POST", "/engagement/v1/feedback", json.dumps(self.feedback()), headers)
        self.assertEqual(status, 201)
        self.assertEqual(cors["Access-Control-Allow-Origin"], "https://afeiii.com")
        self.assertEqual(request("GET", "/report")[0], 404)
        self.assertEqual(request("GET", "/report.json")[0], 404)
        self.assertEqual(request("POST", "/engagement/v1/events", "x" * 12001, headers)[0], 413)
        self.assertEqual(request("POST", "/engagement/v1/feedback", "{", headers)[0], 400)
        self.assertEqual(request("POST", "/engagement/v1/feedback", "{}", {"Content-Type": "application/json"})[0], 403)
        self.assertEqual(request("OPTIONS", "/engagement/v1/feedback", headers={"Origin": "https://afeiii.com", "Access-Control-Request-Method": "POST"})[0], 204)
        self.assertEqual(request("OPTIONS", "/engagement/v1/feedback", headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"})[0], 403)


if __name__ == "__main__":
    unittest.main()
