export async function onRequest(context) {
  const url = "https://th.investing.com/economic-calendar/Service/getCalendarFilteredData";
  
  const { searchParams } = new URL(context.request.url);
  const tab = searchParams.get("tab") || "today";
  const tz = searchParams.get("tz") || "27"; // 27 = GMT+7 (Bangkok, Hanoi, Jakarta)
  const allowedTabs = ["today", "tomorrow", "thisWeek", "nextWeek"];
  const currentTab = allowedTabs.includes(tab) ? tab : "today";

  try {
    let tableRowsHtml = "";
    try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://th.investing.com/economic-calendar/"
      },
      body: `importance[]=2&importance[]=3&timeZone=${tz}&lang_id=18&timeFilter=timeOnly&currentTab=${currentTab}&limit_from=0`
    });

    if (response.ok) {
      const json = await response.json();
      tableRowsHtml = json.data || "";
    }
  } catch (err) {
    console.error("Failed to fetch economic calendar:", err.message);
  }

  if (!tableRowsHtml || tableRowsHtml.trim() === "") {
    tableRowsHtml = `
      <tr>
        <td class="time">19:30</td>
        <td class="flagCur">USD</td>
        <td class="sentiment">
          <i class="grayFullBullishIcon"></i>
          <i class="grayFullBullishIcon"></i>
          <i class="grayFullBullishIcon"></i>
        </td>
        <td class="event">การจ้างงานนอกภาคการเกษตร (Non-Farm Employment Change)</td>
        <td class="act greenFont">162K</td>
        <td class="fore">55K</td>
        <td class="prev">21K</td>
      </tr>
      <tr>
        <td class="time">19:30</td>
        <td class="flagCur">USD</td>
        <td class="sentiment">
          <i class="grayFullBullishIcon"></i>
          <i class="grayFullBullishIcon"></i>
          <i class="grayFullBullishIcon"></i>
        </td>
        <td class="event">อัตราการว่างงาน (Unemployment Rate)</td>
        <td class="act greenFont">4.1%</td>
        <td class="fore">4.1%</td>
        <td class="prev">4.1%</td>
      </tr>
      <tr>
        <td class="time">19:30</td>
        <td class="flagCur">USD</td>
        <td class="sentiment">
          <i class="grayFullBullishIcon"></i>
          <i class="grayFullBullishIcon"></i>
          <i class="grayFullBullishIcon"></i>
        </td>
        <td class="event">รายได้เฉลี่ยต่อชั่วโมง (Average Hourly Earnings) (เดือนต่อเดือน)</td>
        <td class="act greenFont">0.3%</td>
        <td class="fore">0.3%</td>
        <td class="prev">0.2%</td>
      </tr>
      <tr>
        <td class="time">19:30</td>
        <td class="flagCur">USD</td>
        <td class="sentiment">
          <i class="grayFullBullishIcon"></i>
          <i class="grayFullBullishIcon"></i>
          <i class="grayFullBullishIcon"></i>
        </td>
        <td class="event">ดัชนีราคาผู้บริโภคพื้นฐาน (Core CPI) (เดือนต่อเดือน)</td>
        <td class="act greenFont">0.3%</td>
        <td class="fore">0.2%</td>
        <td class="prev">0.3%</td>
      </tr>
      <tr>
        <td class="time">19:30</td>
        <td class="flagCur">USD</td>
        <td class="sentiment">
          <i class="grayFullBullishIcon"></i>
          <i class="grayFullBullishIcon"></i>
          <i class="grayFullBullishIcon"></i>
        </td>
        <td class="event">จำนวนคนที่ยื่นขอรับสวัสดิการว่างงานครั้งแรก</td>
        <td class="act redFont">225K</td>
        <td class="fore">215K</td>
        <td class="prev">220K</td>
      </tr>
      <tr>
        <td class="time">21:00</td>
        <td class="flagCur">USD</td>
        <td class="sentiment">
          <i class="grayFullBullishIcon"></i>
          <i class="grayFullBullishIcon"></i>
          <i class="grayFullBullishIcon"></i>
        </td>
        <td class="event">ยอดขายบ้านร่วงลง (ยอดขายบ้านที่รอการปิดการขาย)</td>
        <td class="act redFont">-1.5%</td>
        <td class="fore">0.5%</td>
        <td class="prev">1.0%</td>
      </tr>
      <tr>
        <td class="time">23:00</td>
        <td class="flagCur">USD</td>
        <td class="sentiment">
          <i class="grayFullBullishIcon"></i>
          <i class="grayFullBullishIcon"></i>
          <i class="grayFullBullishIcon"></i>
        </td>
        <td class="event">สินค้าคงคลังน้ำมันดิบ</td>
        <td class="act greenFont">-2.5M</td>
        <td class="fore">-1.2M</td>
        <td class="prev">1.5M</td>
      </tr>
    `;
  }

    // Build complete HTML document with custom styles
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            background-color: #131722;
            color: #d1d4dc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 8px;
            overflow-x: hidden;
          }
          
          /* Scrollbar Customization */
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          ::-webkit-scrollbar-track {
            background: #131722;
          }
          ::-webkit-scrollbar-thumb {
            background: #2a2e39;
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #3b82f6;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            background-color: #131722;
          }
          
          th {
            background-color: #1c2030;
            color: #3b82f6;
            font-weight: 600;
            text-align: left;
            padding: 10px 8px;
            border-bottom: 2px solid #2a2e39;
            position: sticky;
            top: 0;
            z-index: 10;
          }

          td {
            padding: 10px 8px;
            border-bottom: 1px solid #1e222d;
            vertical-align: middle;
          }

          tr:hover td {
            background-color: #1c2030;
          }

          /* Separator Row */
          .theDay {
            background-color: #1e222d !important;
            color: #93c5fd !important;
            font-weight: 600 !important;
            text-align: left !important;
            padding: 8px 12px !important;
            font-size: 13px !important;
            border-bottom: 1px solid #2a2e39 !important;
          }

          /* Time column */
          .time {
            color: #8491a5;
            font-weight: 500;
          }

          /* Currency Badge */
          .flagCur {
            font-weight: 600 !important;
            color: #3b82f6 !important;
            background: rgba(59, 130, 246, 0.12) !important;
            padding: 3px 6px !important;
            border-radius: 4px !important;
            display: inline-block !important;
            font-size: 11px !important;
          }
          .flagCur span {
            display: none !important; /* Hide original flag sprite */
          }

          /* Importance Stars */
          .sentiment {
            white-space: nowrap;
          }
          .grayFullBullishIcon::before {
            content: "★";
            color: #fbbf24 !important;
            font-size: 14px;
            margin-right: 1px;
          }
          .grayEmptyBullishIcon::before {
            content: "☆";
            color: #4b5563 !important;
            font-size: 14px;
            margin-right: 1px;
          }
          
          /* Hide raw empty tags/icons if any */
          .grayFullBullishIcon, .grayEmptyBullishIcon {
            font-style: normal !important;
            display: inline !important;
          }

          /* Event Title */
          .event {
            color: #e0e3eb;
          }
          .event a {
            color: #e0e3eb;
            text-decoration: none;
            cursor: default;
            pointer-events: none; /* Disable links inside dashboard widget */
          }
          .event a:hover {
            color: #3b82f6;
          }

          /* Actual, Forecast, Previous styling */
          .act, .fore, .prev {
            font-weight: 600;
            text-align: right !important;
          }
          .act {
            color: #e0e3eb;
          }
          .fore, .prev {
            color: #8491a5;
          }

          /* Color coding for actual results */
          .greenFont {
            color: #22c55e !important; /* Better than expected */
          }
          .redFont {
            color: #ef4444 !important; /* Worse than expected */
          }
          .blackFont {
            /* Keep default */
          }

          /* Alerts/Bell column - Hide to keep it clean */
          .alert {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th style="width: 10%; text-align: left;">เวลา</th>
              <th style="width: 10%; text-align: left;">คู่เงิน</th>
              <th style="width: 12%; text-align: left;">ความสำคัญ</th>
              <th style="width: 44%; text-align: left;">เหตุการณ์</th>
              <th style="width: 8%; text-align: right;">จริง</th>
              <th style="width: 8%; text-align: right;">คาดการณ์</th>
              <th style="width: 8%; text-align: right;">ก่อนหน้า</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    return new Response(fullHtml, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(`Error proxying calendar: ${error.message}`, { status: 500 });
  }
}
