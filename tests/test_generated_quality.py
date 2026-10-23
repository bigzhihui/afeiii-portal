from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import check_generated_quality as quality


class QualityGateTests(unittest.TestCase):
    def test_new_and_increased_error_classes_block_known_debt(self):
        self.assertEqual(quality.compare({"known": 3}, {"known": 3}), {})
        self.assertEqual(quality.compare({"known": 2}, {"known": 3}), {})
        self.assertEqual(quality.compare({"known": 4, "new": 1}, {"known": 3}), {"known": 1, "new": 1})

    def test_only_bare_ownership_tokens_are_exempt(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            token = root / "baidu_verify_codeva-test.html"
            token.write_text("a" * 32)
            regular = root / "index.html"
            regular.write_text("a" * 32)
            self.assertTrue(quality.ownership_file(root, token.as_uri()))
            self.assertFalse(quality.ownership_file(root, regular.as_uri()))
            token.write_text("<html><bad-markup>")
            self.assertFalse(quality.ownership_file(root, token.as_uri()))
            self.assertFalse(quality.ownership_file(root / "subdir", regular.as_uri()))

    def test_unknown_checker_report_fails_closed(self):
        with self.assertRaises(ValueError):
            quality.nu_counts({}, Path.cwd())


if __name__ == "__main__":
    unittest.main()
