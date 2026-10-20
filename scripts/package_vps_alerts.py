#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Helper script to package the VPS alert files into a clean onicorn-vps-alerts.zip.
Places the zip file into dashboard/public/ for direct download from the web UI.
"""

import os
import zipfile

def build_vps_package():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    public_dir = os.path.join(project_root, "dashboard", "public")
    dest_zip = os.path.join(public_dir, "onicorn-vps-alerts.zip")

    os.makedirs(public_dir, exist_ok=True)
    os.makedirs(os.path.join(public_dir, "vps"), exist_ok=True)

    # Define files to include
    files = [
        (os.path.join(script_dir, "alert_utils.py"), "onicorn-vps-alerts/alert_utils.py"),
        (os.path.join(script_dir, "send_thai_stock_alerts.py"), "onicorn-vps-alerts/send_thai_stock_alerts.py"),
        (os.path.join(script_dir, "send_gold_news.py"), "onicorn-vps-alerts/send_gold_news.py"),
        (os.path.join(script_dir, "send_oil_chart.py"), "onicorn-vps-alerts/send_oil_chart.py"),
        (os.path.join(script_dir, "requirements.txt"), "onicorn-vps-alerts/requirements.txt"),
        (os.path.join(script_dir, "run_vps_alert.sh"), "onicorn-vps-alerts/run_vps_alert.sh"),
        (os.path.join(script_dir, "vps_setup.sh"), "onicorn-vps-alerts/vps_setup.sh"),
        (os.path.join(script_dir, "vps_daemon.py"), "onicorn-vps-alerts/vps_daemon.py"),
        (os.path.join(script_dir, "crontab.txt"), "onicorn-vps-alerts/crontab.txt"),
        (os.path.join(script_dir, "VPS_GUIDE.md"), "onicorn-vps-alerts/README.md"),
    ]

    print("📦 Creating VPS Alert Package Zip...")
    with zipfile.ZipFile(dest_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        for src_path, arcname in files:
            if os.path.exists(src_path):
                # Set permissions to rwxr-xr-x for .sh files
                zinfo = zipfile.ZipInfo.from_file(src_path, arcname)
                if src_path.endswith(".sh"):
                    zinfo.external_attr = 0o755 << 16
                with open(src_path, "rb") as f:
                    zf.writestr(zinfo, f.read())
                print(f"  + Added: {arcname}")
            else:
                print(f"  ⚠️ Warning: {src_path} not found!")

    # Also duplicate into /public/vps/onicorn-vps-alerts.zip for compatibility
    alt_zip = os.path.join(public_dir, "vps", "onicorn-vps-alerts.zip")
    with open(dest_zip, "rb") as src_f, open(alt_zip, "wb") as dst_f:
        dst_f.write(src_f.read())

    size_kb = os.path.getsize(dest_zip) / 1024
    print(f"✅ Package created successfully: {dest_zip} ({size_kb:.1f} KB)")
    print(f"✅ Mirror created at: {alt_zip}")

if __name__ == "__main__":
    build_vps_package()
