#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Onicorn Trade - VPS Self-Update Utility
Checks for updated alert scripts from the Onicorn Trade Cloud and updates
local Python scripts automatically.
"""

import os
import sys
import ssl
import json
import zipfile
import tempfile
import urllib.request
from datetime import datetime

ZIP_URL = "https://onicorn-trade.pages.dev/onicorn-vps-alerts.zip"
VERSION_FILE = ".vps_version.json"

def check_and_update(script_dir=None, quiet=False):
    if script_dir is None:
        script_dir = os.path.dirname(os.path.abspath(__file__))

    version_path = os.path.join(script_dir, VERSION_FILE)

    local_version = {}
    if os.path.exists(version_path):
        try:
            with open(version_path, "r", encoding="utf-8") as f:
                local_version = json.load(f)
        except Exception:
            local_version = {}

    local_etag = local_version.get("etag", "")
    local_last_modified = local_version.get("last_modified", "")

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    try:
        # Send HEAD request to check ETag / Last-Modified
        req = urllib.request.Request(ZIP_URL, method="HEAD", headers={"User-Agent": "Mozilla/5.0 Onicorn-VPSUpdater/1.0"})
        with urllib.request.urlopen(req, context=ctx, timeout=6) as resp:
            remote_etag = resp.headers.get("ETag", "").strip('"')
            remote_last_modified = resp.headers.get("Last-Modified", "")

        # Check if update is needed
        if local_etag and remote_etag and local_etag == remote_etag:
            if not quiet:
                print("✅ [Self-Update] VPS scripts are already up-to-date.")
            return False

        if local_last_modified and remote_last_modified and local_last_modified == remote_last_modified:
            if not quiet:
                print("✅ [Self-Update] VPS scripts are already up-to-date.")
            return False

        print("🔄 [Self-Update] New script version detected on Cloud! Downloading update...")

        # Download ZIP to temp file
        temp_zip = os.path.join(tempfile.gettempdir(), "onicorn_vps_update.zip")
        download_req = urllib.request.Request(ZIP_URL, headers={"User-Agent": "Mozilla/5.0 Onicorn-VPSUpdater/1.0"})
        with urllib.request.urlopen(download_req, context=ctx, timeout=20) as resp, open(temp_zip, "wb") as out_file:
            out_file.write(resp.read())

        # Extract only Python scripts and README
        updated_count = 0
        with zipfile.ZipFile(temp_zip, "r") as zf:
            for member in zf.namelist():
                filename = os.path.basename(member)
                if not filename:
                    continue
                # Update .py files, requirements.txt, and markdown guides
                if filename.endswith(".py") or filename.endswith(".txt") or filename.endswith(".md"):
                    target_path = os.path.join(script_dir, filename)
                    with zf.open(member) as src_file, open(target_path, "wb") as dst_file:
                        dst_file.write(src_file.read())
                    updated_count += 1

        # Save new version info
        new_version_info = {
            "etag": remote_etag,
            "last_modified": remote_last_modified,
            "updated_at": datetime.now().isoformat(),
            "updated_files_count": updated_count
        }
        with open(version_path, "w", encoding="utf-8") as f:
            json.dump(new_version_info, f, indent=2)

        print(f"🎉 [Self-Update] Successfully updated {updated_count} files to latest version!")
        try:
            os.remove(temp_zip)
        except Exception:
            pass
        return True

    except Exception as e:
        if not quiet:
            print(f"Notice: Self-update check skipped ({e}). Continuing with local scripts.")
        return False

if __name__ == "__main__":
    check_and_update(quiet=False)
