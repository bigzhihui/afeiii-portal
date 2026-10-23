"""Offline release checks. Tool findings and new regressions are reported separately."""
from __future__ import annotations

import argparse
import base64
from collections import Counter
import datetime as dt
import hashlib
import io
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import urllib.parse
import urllib.request
import zipfile

LYCHEE_VERSION = "0.24.2"
VNU_VERSION = "26.10.12"
VNU_INTEGRITY = "Zg67G1zM28UGEVIOSn1ns6rFSZ6JVI/FNXhw+UJaXM02AQcDE84arp/b5c0OFrvzsgd/VcmpAd9B4hX38BeZvA=="


def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "afeiii-build-quality/1.0"}), timeout=45) as response:
        data = response.read(64 * 1024 * 1024 + 1)
    if len(data) > 64 * 1024 * 1024:
        raise ValueError("Tool package exceeds download limit")
    return data


def bootstrap(folder):
    folder.mkdir(parents=True, exist_ok=True)
    windows = os.name == "nt"
    machine = __import__("platform").machine().lower()
    platform = "x86_64-pc-windows-msvc.zip" if windows else ("aarch64-unknown-linux-gnu.tar.gz" if machine in ("aarch64", "arm64") else "x86_64-unknown-linux-gnu.tar.gz")
    binary = folder / ("lychee.exe" if windows else "lychee")
    if not binary.exists():
        url = f"https://github.com/lycheeverse/lychee/releases/download/lychee-v{LYCHEE_VERSION}/lychee-{platform}"
        data, checksum = fetch(url), fetch(url + ".sha256").decode()
        expected = re.search(r"\b[0-9a-fA-F]{64}\b", checksum)
        if not expected or hashlib.sha256(data).hexdigest() != expected[0].lower():
            raise ValueError("lychee official checksum mismatch")
        if windows:
            with zipfile.ZipFile(io.BytesIO(data)) as archive:
                names = [name for name in archive.namelist() if Path(name).name == "lychee.exe"]
                if len(names) != 1:
                    raise ValueError("Unexpected lychee archive")
                binary.write_bytes(archive.read(names[0]))
        else:
            with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
                members = [m for m in archive.getmembers() if m.isfile() and Path(m.name).name == "lychee"]
                if len(members) != 1:
                    raise ValueError("Unexpected lychee archive")
                binary.write_bytes(archive.extractfile(members[0]).read())
            binary.chmod(0o755)
    jar = folder / "vnu.jar"
    if not jar.exists():
        data = fetch(f"https://registry.npmjs.org/vnu-jar/-/vnu-jar-{VNU_VERSION}.tgz")
        if base64.b64encode(hashlib.sha512(data).digest()).decode() != VNU_INTEGRITY:
            raise ValueError("Nu package integrity mismatch")
        with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
            jar.write_bytes(archive.extractfile("package/build/dist/vnu.jar").read())
    return binary, jar


def ownership_file(root, url):
    """Only bare provider verification tokens are exempt from document validation."""
    path = urllib.parse.unquote(urllib.parse.urlsplit(url).path)
    if os.name == "nt" and re.match(r"^/[A-Za-z]:/", path):
        path = path[1:]
    file = Path(path).resolve()
    if not file.is_relative_to(root.resolve()) or not re.fullmatch(r"baidu_verify_[A-Za-z0-9_-]+\.html", file.name):
        return False
    return file.is_file() and bool(re.fullmatch(rb"[0-9a-fA-F]{16,128}\s*", file.read_bytes()))


def nu_counts(payload, root):
    if not isinstance(payload.get("messages"), list):
        raise ValueError("Invalid Nu report")
    return Counter(item["message"] for item in payload["messages"] if item.get("type") == "error" and not ownership_file(root, item.get("url", "")))


def compare(current, baseline):
    return {key: count - baseline.get(key, 0) for key, count in current.items() if count > baseline.get(key, 0)}


def check(root, binary, jar, java, baseline, output, capture_reason=None):
    root = root.resolve()
    pages = len(list(root.rglob("*.html")))
    if not root.is_dir() or not pages:
        raise ValueError("Generated HTML is missing; refusing an empty successful check")
    with tempfile.TemporaryDirectory(prefix="afeiii-build-quality-") as scratch:
        links = Path(scratch) / "links.json"
        command = [str(binary), "--offline", "--scheme=file", "--root-dir=" + str(root), "--index-files=index.html", "--fallback-extensions=html", "--include-fragments=anchor-only", "--format=json", "--output=" + str(links), "--no-progress", str(root / "**/*.html")]
        link_run = subprocess.run(command, capture_output=True, timeout=300)
        if link_run.returncode not in (0, 2) or not links.is_file():
            raise RuntimeError("lychee did not complete a valid offline check")
        link_report = json.loads(links.read_text(encoding="utf-8-sig"))
        nu = subprocess.run([java, "-Xmx512m", "-jar", str(jar), "--format", "json", "--skip-non-html", "--errors-only", str(root)], capture_output=True, timeout=300)
        if nu.returncode not in (0, 1):
            raise RuntimeError("Nu checker did not complete")
        nu_report = json.loads(nu.stderr.decode("utf-8-sig"))
    counts = nu_counts(nu_report, root)
    previous = json.loads(baseline.read_text(encoding="utf-8")) if baseline.is_file() else {"schema": 1, "nu_errors": {}, "minimum_pages": 1}
    if previous.get("schema") != 1:
        raise ValueError("Unknown build quality baseline schema")
    if capture_reason:
        previous = {"schema": 1, "created_at": dt.datetime.now(dt.timezone.utc).isoformat(), "reason": capture_reason,
                    "minimum_pages": pages, "nu_errors": dict(counts)}
        baseline.write_text(json.dumps(previous, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    new = compare(counts, previous["nu_errors"])
    errors = int(link_report["errors"])
    passed = not errors and not new and pages >= previous["minimum_pages"]
    report = {"schema": 1, "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(), "state": "passed" if passed else "failed",
              "html_pages": pages, "checked_links": link_report["total"], "broken_local_links": errors,
              "existing_html_findings": sum(counts.values()), "new_html_findings": new,
              "baseline_reason": previous.get("reason"), "tools": {"lychee": LYCHEE_VERSION, "nu": VNU_VERSION},
              "scope": "Generated HTML and local files/anchors; public HTTP and dynamic functions are checked separately."}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))
    return 0 if passed else 2


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--baseline", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--tools", type=Path, default=Path(tempfile.gettempdir()) / "afeiii-quality-tools")
    parser.add_argument("--bootstrap", action="store_true")
    parser.add_argument("--lychee", type=Path)
    parser.add_argument("--vnu-jar", type=Path)
    parser.add_argument("--java", default=shutil.which("java") or "java")
    parser.add_argument("--capture-baseline-reason")
    args = parser.parse_args()
    try:
        binary, jar = bootstrap(args.tools) if args.bootstrap else (args.lychee, args.vnu_jar)
        if not binary or not jar or not binary.is_file() or not jar.is_file():
            raise ValueError("Pinned checker tools are missing; use --bootstrap or explicit tool paths")
        return check(args.root, binary, jar, args.java, args.baseline, args.output, args.capture_baseline_reason)
    except Exception as exc:
        print("Build quality check failed: " + str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
