#!/bin/bash
# ==============================================================================
# Onicorn Trade - Automated VPS Setup Script
# Installs Python dependencies, Playwright Chromium, and configures the environment.
# Tested on: Ubuntu 20.04 / 22.04 / 24.04 & Debian 11 / 12
# ==============================================================================

set -e

echo "============================================================"
echo "🚀 Onicorn Trade - Automated VPS Setup"
echo "============================================================"

# 1. Check Root / Sudo
if [ "$EUID" -ne 0 ]; then
    echo "⚠️ Notice: It is recommended to run this script as root or with sudo."
fi

# 2. Update packages and install python3, pip, curl
echo "📦 Updating package lists and installing prerequisites..."
if command -v apt-get &>/dev/null; then
    sudo apt-get update -y
    sudo apt-get install -y python3 python3-pip python3-venv curl
fi

# 3. Create marker file
if [ -d "/etc" ]; then
    sudo touch /etc/onicorn_vps 2>/dev/null || true
fi

# 4. Set Timezone to Asia/Bangkok
echo "⏰ Setting system timezone to Asia/Bangkok..."
if command -v timedatectl &>/dev/null; then
    sudo timedatectl set-timezone Asia/Bangkok || true
    echo "Current server time: $(date)"
fi

# 5. Setup Python Virtual Environment
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "🐍 Setting up Python environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r scripts/requirements.txt

# 6. Install Playwright Chromium (with system dependencies)
echo "🌐 Installing Playwright Chromium browser for Oil Chart screenshots..."
playwright install --with-deps chromium || echo "Notice: Playwright installation finished (or already installed)."

# 7. Make runner executable
chmod +x "$SCRIPT_DIR/run_vps_alert.sh"

echo "============================================================"
echo "🎉 VPS Setup Completed Successfully!"
echo "============================================================"
echo ""
echo "👉 ขั้นตอนถัดไปในการเปิดใช้งานระบบแจ้งเตือน:"
echo "1. ทดสอบการเชื่อมต่อ Telegram ด้วยคำสั่ง:"
echo "   $SCRIPT_DIR/run_vps_alert.sh test"
echo ""
echo "2. ตั้งเวลาอัตโนมัติด้วยคำสั่ง: crontab -e"
echo "   แล้วคัดลอกเนื้อหาจากไฟล์: $SCRIPT_DIR/crontab.txt ไปวาง"
echo ""
