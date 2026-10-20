#!/bin/bash
# ==============================================================================
# Onicorn Trade - VPS Telegram Alert Runner
# Runs with 0s latency directly on your VPS.
# Automatically synchronizes with Cloudflare D1 & GitHub Actions backup.
# ==============================================================================

set -e

# Force Bangkok Timezone
export TZ="Asia/Bangkok"
export RUNNER_ENV="vps"

# Resolve script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Locate python3 executable (prefer virtual environment if present)
if [ -f "$PROJECT_ROOT/venv/bin/python3" ]; then
    PYTHON_BIN="$PROJECT_ROOT/venv/bin/python3"
elif [ -f "$PROJECT_ROOT/.venv/bin/python3" ]; then
    PYTHON_BIN="$PROJECT_ROOT/.venv/bin/python3"
elif command -v python3 &>/dev/null; then
    PYTHON_BIN="$(command -v python3)"
else
    echo "❌ Error: python3 is not installed or not found in PATH." >&2
    exit 1
fi

NOW=$(date '+%Y-%m-%d %H:%M:%S')
TASK="${1:-all}"
EXTRA_FLAG="${2:-}"

echo "============================================================"
echo "🚀 Onicorn Trade Alert Runner [VPS Mode]"
echo "⏰ Time (Asia/Bangkok): $NOW"
echo "🎯 Task: $TASK $EXTRA_FLAG"
echo "🐍 Python: $PYTHON_BIN"
echo "============================================================"

case "$TASK" in
    morning)
        echo "🌅 [1/4] Running Gold News Digest..."
        $PYTHON_BIN "$SCRIPT_DIR/send_gold_news.py" $EXTRA_FLAG || true

        echo "📈 [2/4] Running Daily Top Thai Stocks..."
        $PYTHON_BIN "$SCRIPT_DIR/send_thai_stock_alerts.py" --type daily_stocks $EXTRA_FLAG || true

        DAY_OF_WEEK=$(date +%u) # 1=Mon, 2=Tue
        DAY_OF_MONTH=$(date +%-d)

        if [ "$DAY_OF_WEEK" = "1" ] || [ "$EXTRA_FLAG" = "--force" ]; then
            echo "⚡ [3/4] Running Weekly Sector Rotation (Monday)..."
            $PYTHON_BIN "$SCRIPT_DIR/send_thai_stock_alerts.py" --type weekly_sector $EXTRA_FLAG || true
        else
            echo "⏩ [3/4] Skipping Weekly Sector (only runs on Mondays)"
        fi

        if [ "$DAY_OF_MONTH" = "1" ] || [ "$EXTRA_FLAG" = "--force" ]; then
            echo "🗓️ [4/4] Running Monthly Sector Outlook (1st of month)..."
            $PYTHON_BIN "$SCRIPT_DIR/send_thai_stock_alerts.py" --type monthly_sector $EXTRA_FLAG || true
        else
            echo "⏩ [4/4] Skipping Monthly Sector (only runs on 1st of month)"
        fi
        ;;

    gold_news)
        $PYTHON_BIN "$SCRIPT_DIR/send_gold_news.py" $EXTRA_FLAG
        ;;

    oil_chart)
        echo "🛢️ Running WTI Crude Oil Chart..."
        $PYTHON_BIN "$SCRIPT_DIR/send_oil_chart.py" $EXTRA_FLAG
        ;;

    daily_stocks)
        echo "📈 Running Daily Top Thai Stocks..."
        $PYTHON_BIN "$SCRIPT_DIR/send_thai_stock_alerts.py" --type daily_stocks $EXTRA_FLAG
        ;;

    weekly_sector)
        echo "⚡ Running Weekly Sector Rotation..."
        $PYTHON_BIN "$SCRIPT_DIR/send_thai_stock_alerts.py" --type weekly_sector $EXTRA_FLAG
        ;;

    monthly_sector)
        echo "🗓️ Running Monthly Sector Outlook..."
        $PYTHON_BIN "$SCRIPT_DIR/send_thai_stock_alerts.py" --type monthly_sector $EXTRA_FLAG
        ;;

    intraday)
        echo "⚡ Running Intraday Breakout & Volume Spikes..."
        $PYTHON_BIN "$SCRIPT_DIR/send_thai_stock_alerts.py" --type intraday_alert $EXTRA_FLAG
        ;;

    market_wrap)
        echo "📊 Running End-of-Day Market Wrap..."
        $PYTHON_BIN "$SCRIPT_DIR/send_thai_stock_alerts.py" --type market_wrap $EXTRA_FLAG
        ;;

    test)
        echo "🔔 Testing Telegram Connection (Force mode)..."
        $PYTHON_BIN -c "
import sys; sys.path.insert(0, '$SCRIPT_DIR')
from alert_utils import get_runner_name, get_bkk_now
print('✅ VPS Runner Environment:', get_runner_name())
print('⏰ Current BKK Time:', get_bkk_now())
"
        $PYTHON_BIN "$SCRIPT_DIR/send_thai_stock_alerts.py" --type daily_stocks --force
        ;;

    status)
        echo "📊 Checking Central Alert Status on Cloudflare D1..."
        $PYTHON_BIN -c "
import urllib.request, json, ssl
ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request('https://onicorn-trade.pages.dev/api/alert-status', headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx, timeout=8) as r:
        data = json.loads(r.read().decode())
        print(json.dumps(data, indent=2, ensure_ascii=False))
except Exception as e:
    print('Error checking status:', e)
"
        ;;

    *)
        echo "Usage: $0 {morning|gold_news|oil_chart|daily_stocks|weekly_sector|monthly_sector|intraday|market_wrap|test|status} [--force]"
        exit 1
        ;;
esac

echo "✅ Task '$TASK' completed at $(date '+%Y-%m-%d %H:%M:%S')"
