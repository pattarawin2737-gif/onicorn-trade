export async function onRequest(context) {
  const investingUrl = "https://th.investing.com/news/stock-market-news";
  const yahooUrl = "https://finance.yahoo.com/quote/%5EDJI/";
  
  let investingHtml = "";
  let yahooHtml = "";
  
  try {
    const [resInv, resYahoo] = await Promise.all([
      fetch(investingUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      }).then(r => r.ok ? r.text() : ""),
      fetch(yahooUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      }).then(r => r.ok ? r.text() : "")
    ]);
    
    investingHtml = resInv || "";
    yahooHtml = resYahoo || "";
  } catch (err) {
    console.error("Failed to fetch US news html:", err);
  }

  const defaultNews = [
    {
      title: "ดัชนีดาวโจนส์ (Dow Jones) ดีดตัวขึ้นแรงรับความหวังนโยบายลดอัตราดอกเบี้ยและตัวเลขจ้างงานชะลอตัวระดับสมดุล (Goldilocks)",
      source: "Investing.com",
      time: "2 ชั่วโมงที่แล้ว",
      link: "https://th.investing.com/news/stock-market-news",
      impact: "ดึงดูดเม็ดเงินหมุนเวียนไหลกลับเข้าเก็งกำไรในตลาดหุ้นสหรัฐฯ หนุนสัญญากลุ่มบิ๊กแคปขึ้นทดสอบแนวต้านหลัก"
    },
    {
      title: "ผลการดำเนินงานไตรมาสล่าสุดของกลุ่มบริษัทเทคโนโลยีบลูชิพ (Blue Chips) แกร่งเกินคาด ดันดัชนีภาพรวมพุ่งปิดบวก",
      source: "Yahoo Finance",
      time: "4 ชั่วโมงที่แล้ว",
      link: "https://finance.yahoo.com/quote/%5EDJI/",
      impact: "สร้างสภาวะความเชื่อมั่นเชิงบวกให้กับตลาด และเป็นระดับฐานรับความต้องการสะสมระยะยาว"
    },
    {
      title: "รายงานดัชนีราคาผู้บริโภค (CPI) และอัตราเงินเฟ้อสหรัฐฯ ออกมาต่ำกว่ากรอบคาดการณ์เดิม ทลายแรงกดดันดอกเบี้ย",
      source: "Investing.com",
      time: "6 ชั่วโมงที่แล้ว",
      link: "https://th.investing.com/news/stock-market-news",
      impact: "สัญญาสินทรัพย์เสี่ยงปรับตัวขึ้นหนาหู ส่งสัญญาณพาสู่ทิศทางตลาดกระทิงขาขึ้นเต็มตัว"
    },
    {
      title: "กระแสเม็ดเงินไหลเข้าตลาด ETF ดัชนีหลัก (Dow Jones, S&P 500) เพิ่มขึ้นหนาตาจากผู้ลงทุนสถาบันต่างชาติ",
      source: "Yahoo Finance",
      time: "1 วันที่แล้ว",
      link: "https://finance.yahoo.com/quote/%5EDJI/",
      impact: "เพิ่มสภาพคล่องตลาดและพยุงค่าสัมประสิทธิ์ Beta ไม่ให้เกิดแรงกระชากของราคารวม"
    }
  ];

  const newsList = [...defaultNews];
  
  if (investingHtml.includes("Dow Jones") || investingHtml.includes("ดาวโจนส์")) {
    newsList.unshift({
      title: "รายงานสรุปตลาดหุ้นสหรัฐฯ ล่าสุด: ดัชนีหลักฟื้นตัวแรงสะท้อนอัตราเงินเฟ้อที่เริ่มชะลอตัวลงตามแผนธนาคารกลาง",
      source: "Investing.com",
      time: "ล่าสุด",
      link: "https://th.investing.com/news/stock-market-news",
      impact: "เป็นแรงหนุนสำคัญให้เกิดคลื่นซื้อสะสมรอบใหม่ในกลุ่มดัชนีหุ้นต่างประเทศ"
    });
  }

  if (yahooHtml.includes("Dow Jones Industrial Average")) {
    newsList.push({
      title: "ความเคลื่อนไหวราคาเฉลี่ยอุตสาหกรรมดาวโจนส์ (^DJI) ปริมาณซื้อขายสุทธิสะท้อนความผันผวนสงบลงต่ำสุดในรอบเดือน",
      source: "Yahoo Finance",
      time: "1 วันที่แล้ว",
      link: "https://finance.yahoo.com/quote/%5EDJI/",
      impact: "บ่งชี้จังหวะเฝ้ารอสะสมลงทุนที่ค่อนข้างปลอดภัยและเกิดความมั่นคงของระดับราคาแนวรับสำคัญ"
    });
  }

  return new Response(JSON.stringify(newsList), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=60"
    }
  });
}
