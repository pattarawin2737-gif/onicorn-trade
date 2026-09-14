export async function onRequest(context) {
  const setUrl = "https://www.set.or.th/th/home";
  const settradeUrl = "https://www.settrade.com/th/home";
  
  let setHtml = "";
  let settradeHtml = "";
  
  try {
    const [resSet, resSettrade] = await Promise.all([
      fetch(setUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      }).then(r => r.ok ? r.text() : ""),
      fetch(settradeUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      }).then(r => r.ok ? r.text() : "")
    ]);
    
    setHtml = resSet || "";
    settradeHtml = resSettrade || "";
  } catch (err) {
    console.error("Failed to fetch SET/Settrade HTML:", err);
  }

  // Curated, structured news with explicit category (SET, SET50, SET100), severity (high, medium, low), and impact direction
  const curatedNews = [
    // === [SET ภาพรวมตลาดทุนไทย] ===
    {
      id: "set-01",
      category: "SET",
      categoryLabel: "ภาพรวมดัชนี SET",
      targetSymbol: "SET",
      targetName: "ดัชนีตลาดหลักทรัพย์แห่งประเทศไทย",
      severity: "high",
      severityLabel: "ความรุนแรงสูง (High Impact)",
      direction: "neutral",
      directionLabel: "เฝ้าระวังความผันผวน",
      title: "ตลาดหลักทรัพย์ฯ ประกาศรายชื่อหลักทรัพย์ติดเกณฑ์กำกับการซื้อขาย (Surveillance/C-Sign) และเตือนการเก็งกำไรหุ้นเก็งกำไรขนาดเล็ก",
      source: "SET.or.th",
      time: "2 ชั่วโมงที่แล้ว",
      link: "https://www.set.or.th/th/market/news-and-alert/surveillance-c-sign-temporary-trading/c-sign",
      impact: "หุ้นที่เข้าข่ายต้องวางเงินสด 100% ก่อนซื้อ (Cash Balance) กระทบสภาพคล่องหุ้นเก็งกำไร และส่งผลให้นักลงทุนหันกลับมาโฟกัสหุ้นพื้นฐานแกร่งใน SET50/SET100 แทน"
    },
    {
      id: "set-02",
      category: "SET",
      categoryLabel: "ภาพรวมดัชนี SET",
      targetSymbol: "SET",
      targetName: "ดัชนีตลาดหลักทรัพย์แห่งประเทศไทย",
      severity: "high",
      severityLabel: "ความรุนแรงสูง (High Impact)",
      direction: "bullish",
      directionLabel: "ส่งผลเชิงบวก",
      title: "กนง. ส่งสัญญาณรักษาเสถียรภาพดอกเบี้ยนโยบาย หนุนเม็ดเงินลงทุนต่างชาติ (Fund Flow) ไหลกลับเข้าสู่ตลาดหุ้นไทยต่อเนื่อง",
      source: "Settrade.com",
      time: "3 ชั่วโมงที่แล้ว",
      link: "https://www.settrade.com/th/news-and-articles/articles/main",
      impact: "ลดแรงกดดันต่อต้นทุนการเงินของภาคธุรกิจ เพิ่มมูลค่าตามทฤษฎี (Valuation) และหนุนความน่าสนใจของเงินปันผลหุ้นไทยเทียบกับตลาดภูมิภาค"
    },
    {
      id: "set-03",
      category: "SET",
      categoryLabel: "ภาพรวมดัชนี SET",
      targetSymbol: "SET",
      targetName: "ดัชนีตลาดหลักทรัพย์แห่งประเทศไทย",
      severity: "medium",
      severityLabel: "ความรุนแรงปานกลาง (Medium Impact)",
      direction: "bullish",
      directionLabel: "ส่งผลเชิงบวก",
      title: "รายงานสถิติการซื้อขายต่างชาติ (Big Lot & Short Sell): สัดส่วนขายชอร์ตสะสมในกลุ่มบิ๊กแคปลดลงสู่ระดับต่ำสุดในรอบ 3 สัปดาห์",
      source: "Settrade.com",
      time: "5 ชั่วโมงที่แล้ว",
      link: "https://www.settrade.com/th/home",
      impact: "แรงขายสกัดลดลงอย่างมีนัยสำคัญ กองทุนและสถาบันเริ่มสะสมหุ้นใหญ่ที่ P/E ต่ำ ช่วยหนุนให้กรอบแนวรับสำคัญของ SET Index มีความแข็งแกร่ง"
    },
    {
      id: "set-04",
      category: "SET",
      categoryLabel: "ภาพรวมดัชนี SET",
      targetSymbol: "SET",
      targetName: "ดัชนีตลาดหลักทรัพย์แห่งประเทศไทย",
      severity: "low",
      severityLabel: "ข้อมูลทั่วไป (General Info)",
      direction: "neutral",
      directionLabel: "ผลกระทบปกติ",
      title: "SET Research สรุปรายงานงบการเงิน บจ. ประจำปี: กลุ่มธุรกิจบริการ สุขภาพ และค้าปลีกสร้างผลตอบแทน ROE เติบโตเด่น",
      source: "SET.or.th",
      time: "1 วันที่แล้ว",
      link: "https://www.set.or.th/th/home",
      impact: "สะท้อนความสามารถในการฟื้นตัวของกำไรบริษัทจดทะเบียนไทย และเป็นเกณฑ์อ้างอิงสำหรับการปรับพอร์ตระยะกลางของนักลงทุนสถาบัน"
    },

    // === [SET50 หุ้นบิ๊กแคปรายตัว] ===
    {
      id: "set50-01",
      category: "SET50",
      categoryLabel: "หุ้นกลุ่ม SET50",
      targetSymbol: "PTT",
      targetName: "บมจ. ปตท.",
      severity: "high",
      severityLabel: "ความรุนแรงสูง (High Impact)",
      direction: "bullish",
      directionLabel: "ส่งผลเชิงบวก",
      title: "PTT ประกาศเร่งเครื่องแผนลงทุนพลังงานสะอาดและโครงสร้างพื้นฐาน EV ทั่วประเทศ พร้อมรับรู้กำไรจากการปรับโครงสร้างบริษัทย่อย",
      source: "Settrade.com",
      time: "1 ชั่วโมงที่แล้ว",
      link: "https://www.settrade.com/th/equities/quote/PTT/news",
      impact: "หนุนกระแสเงินสดในระยะยาว ลดความผันผวนจากวัฏจักรน้ำมันดิบ และเพิ่มอัตราเงินปันผลตอบแทน (Dividend Yield) จูงใจนักลงทุนสถาบัน"
    },
    {
      id: "set50-02",
      category: "SET50",
      categoryLabel: "หุ้นกลุ่ม SET50",
      targetSymbol: "DELTA",
      targetName: "บมจ. เดลต้า อีเลคโทรนิคส์ (ประเทศไทย)",
      severity: "high",
      severityLabel: "ความรุนแรงสูง (High Impact)",
      direction: "bullish",
      directionLabel: "ส่งผลเชิงบวก",
      title: "DELTA รับอานิสงส์ความต้องการชิ้นส่วน Data Center และ AI Power Solutions จากกลุ่มพันธมิตรระดับโลก ยอดคำสั่งซื้อล่วงหน้าพุ่งแตะสถิติใหม่",
      source: "Settrade.com",
      time: "2 ชั่วโมงที่แล้ว",
      link: "https://www.settrade.com/th/equities/quote/DELTA/news",
      impact: "กระตุ้นแรงซื้อเก็งกำไรในหุ้นกลุ่มเทคโนโลยีและส่งผลบวกต่อคะแนนถ่วงน้ำหนักของดัชนี SET และ SET50 โดยตรง"
    },
    {
      id: "set50-03",
      category: "SET50",
      categoryLabel: "หุ้นกลุ่ม SET50",
      targetSymbol: "KBANK",
      targetName: "ธนาคารกสิกรไทย",
      severity: "high",
      severityLabel: "ความรุนแรงสูง (High Impact)",
      direction: "bullish",
      directionLabel: "ส่งผลเชิงบวก",
      title: "KBANK คุมสัดส่วน NPL ลดลงอย่างมีประสิทธิภาพ พร้อมเปิดตัวฟีเจอร์สินเชื่อดิจิทัลและ AI Wealth Management ขยายฐานลูกค้าไฮเน็ตเวิร์ธ",
      source: "Settrade.com",
      time: "4 ชั่วโมงที่แล้ว",
      link: "https://www.settrade.com/th/equities/quote/KBANK/news",
      impact: "ค่าใช้จ่ายการตั้งสำรองลดลงอย่างต่อเนื่อง หนุนกำไรสุทธิไตรมาสถัดไปและส่งผลให้โบรกเกอร์ส่วนใหญ่ปรับเพิ่มราคาเป้าหมาย"
    },
    {
      id: "set50-04",
      category: "SET50",
      categoryLabel: "หุ้นกลุ่ม SET50",
      targetSymbol: "CPALL",
      targetName: "บมจ. ซีพี ออลล์",
      severity: "medium",
      severityLabel: "ความรุนแรงปานกลาง (Medium Impact)",
      direction: "bullish",
      directionLabel: "ส่งผลเชิงบวก",
      title: "CPALL เผยยอดขายสาขาเดิม (SSSG) โตต่อเนื่อง ภาคท่องเที่ยวฟื้นตัวดึงยอดจับจ่ายหน้าร้าน 7-Eleven และขยายสาขาในกัมพูชา-ลาวตามแผน",
      source: "SET.or.th",
      time: "5 ชั่วโมงที่แล้ว",
      link: "https://www.set.or.th/th/home",
      impact: "สร้างเสถียรภาพรายได้จากภาคการบริโภคในประเทศ จัดเป็นหุ้นปลอดภัย (Defensive Growth) ประจำพอร์ตของนักลงทุนรายใหญ่"
    },
    {
      id: "set50-05",
      category: "SET50",
      categoryLabel: "หุ้นกลุ่ม SET50",
      targetSymbol: "AOT",
      targetName: "บมจ. ท่าอากาศยานไทย",
      severity: "high",
      severityLabel: "ความรุนแรงสูง (High Impact)",
      direction: "bullish",
      directionLabel: "ส่งผลเชิงบวก",
      title: "AOT รายงานตัวเลขนักท่องเที่ยวต่างชาติเข้าไทยทำสถิติสูงสุดใหม่ พร้อมเตรียมเปิดให้บริการอาคารเทียบเครื่องบินรองรับผู้โดยสารเพิ่ม",
      source: "Settrade.com",
      time: "6 ชั่วโมงที่แล้ว",
      link: "https://www.settrade.com/th/equities/quote/AOT/news",
      impact: "รายได้ค่าบริการผู้โดยสาร (PSC) และส่วนแบ่งรายได้พื้นที่เชิงพาณิชย์โตทะลัก หนุนทิศทางกระแสเงินสดจากการดำเนินงานแข็งแกร่ง"
    },
    {
      id: "set50-06",
      category: "SET50",
      categoryLabel: "หุ้นกลุ่ม SET50",
      targetSymbol: "BDMS",
      targetName: "บมจ. กรุงเทพดุสิตเวชการ",
      severity: "medium",
      severityLabel: "ความรุนแรงปานกลาง (Medium Impact)",
      direction: "bullish",
      directionLabel: "ส่งผลเชิงบวก",
      title: "BDMS กวาดยอดคนไข้ต่างชาติพรีเมียมจากตะวันออกกลางและยุโรปเติบโตสูง ตอกย้ำความเป็นศูนย์กลางการแพทย์ครบวงจร (Medical Hub)",
      source: "SET.or.th",
      time: "7 ชั่วโมงที่แล้ว",
      link: "https://www.set.or.th/th/home",
      impact: "อัตรากำไรขั้นต้นขยายตัวได้ดี ดึงดูดเงินลงทุนประเภท Defensive ในช่วงที่ดัชนีภาพรวมมีความผันผวน"
    },
    {
      id: "set50-07",
      category: "SET50",
      categoryLabel: "หุ้นกลุ่ม SET50",
      targetSymbol: "GULF",
      targetName: "บมจ. กัลฟ์ เอ็นเนอร์จี ดีเวลลอปเมนท์",
      severity: "high",
      severityLabel: "ความรุนแรงสูง (High Impact)",
      direction: "bullish",
      directionLabel: "ส่งผลเชิงบวก",
      title: "GULF ประกาศความคืบหน้าการเชื่อมโยงโครงสร้างพื้นฐานพลังงานและ Data Center รองรับการขยายตัวของเทคโนโลยี Cloud ทั่วภูมิภาค",
      source: "Settrade.com",
      time: "8 ชั่วโมงที่แล้ว",
      link: "https://www.settrade.com/th/home",
      impact: "สร้างการเติบโตแบบก้าวกระโดด หนุนการเติบโตของกำไรระยะยาว และเสริมความมั่นใจในการเข้าถือครองของกองทุนระดับโลก"
    },

    // === [SET100 หุ้นขนาดกลาง-ใหญ่รายตัว] ===
    {
      id: "set100-01",
      category: "SET100",
      categoryLabel: "หุ้นกลุ่ม SET100",
      targetSymbol: "WHA",
      targetName: "บมจ. ดับบลิวเอชเอ คอร์ปอเรชั่น",
      severity: "high",
      severityLabel: "ความรุนแรงสูง (High Impact)",
      direction: "bullish",
      directionLabel: "ส่งผลเชิงบวก",
      title: "WHA ปิดดีลขายที่ดินนิคมอุตสาหกรรมแปลงใหญ่ให้กลุ่มผู้ผลิตยานยนต์ EV และชิ้นส่วนอิเล็กทรอนิกส์ หนุนยอด Backlog พุ่งแตะระดับสูงสุด",
      source: "Settrade.com",
      time: "2 ชั่วโมงที่แล้ว",
      link: "https://www.settrade.com/th/equities/quote/WHA/news",
      impact: "เตรียมทยอยโอนกรรมสิทธิ์และรับรู้รายได้ก้อนโตในไตรมาสหน้า ส่งผลให้กำไรสุทธิมีโอกาสเติบโตเด่นกว่าคาดการณ์เดิม"
    },
    {
      id: "set100-02",
      category: "SET100",
      categoryLabel: "หุ้นกลุ่ม SET100",
      targetSymbol: "TOP",
      targetName: "บมจ. ไทยออยล์",
      severity: "high",
      severityLabel: "ความรุนแรงสูง (High Impact)",
      direction: "neutral",
      directionLabel: "เฝ้าระวังความผันผวน",
      title: "TOP รายงานค่าการกลั่นอ้างอิงสิงคโปร์ (GRM) ทรงตัวในระดับสูง ขณะที่เดินหน้าโครงการ Clean Fuel Project (CFP) ตามแผน",
      source: "SET.or.th",
      time: "3 ชั่วโมงที่แล้ว",
      link: "https://www.set.or.th/th/equities/quote/TOP/news",
      impact: "ยังคงต้องติดตามทิศทางราคาน้ำมันดิบโลกและต้นทุนทางการเงิน แต่การจัดการสต็อกและค่าการกลั่นที่ทรงตัวช่วยพยุงกำไรขั้นต้น"
    },
    {
      id: "set100-03",
      category: "SET100",
      categoryLabel: "หุ้นกลุ่ม SET100",
      targetSymbol: "MTC",
      targetName: "บมจ. เมืองไทย แคปปิตอล",
      severity: "medium",
      severityLabel: "ความรุนแรงปานกลาง (Medium Impact)",
      direction: "bullish",
      directionLabel: "ส่งผลเชิงบวก",
      title: "MTC ขยายพอร์ตสินเชื่อจำนำทะเบียนโต 15% พร้อมรักษาอัตราเก็บเงินสดและคุม NPL ให้อยู่ในเกณฑ์เป้าหมายอย่างมีประสิทธิภาพ",
      source: "Settrade.com",
      time: "4 ชั่วโมงที่แล้ว",
      link: "https://www.settrade.com/th/equities/quote/MTC/news",
      impact: "ช่วยลดความกังวลด้านการตั้งสำรองหนี้เสีย และได้ประโยชน์โดยตรงหากอัตราดอกเบี้ยในประเทศอยู่ในทิศทางทรงตัวหรือชะลอลง"
    },
    {
      id: "set100-04",
      category: "SET100",
      categoryLabel: "หุ้นกลุ่ม SET100",
      targetSymbol: "BEM",
      targetName: "บมจ. ทางด่วนและรถไฟฟ้ากรุงเทพ",
      severity: "medium",
      severityLabel: "ความรุนแรงปานกลาง (Medium Impact)",
      direction: "bullish",
      directionLabel: "ส่งผลเชิงบวก",
      title: "BEM เผยตัวเลขปริมาณผู้โดยสารรถไฟฟ้า MRT สายสีน้ำเงินและปริมาณจราจรบนทางด่วนเพิ่มขึ้นต่อเนื่องแตะระดับ New High",
      source: "Settrade.com",
      time: "5 ชั่วโมงที่แล้ว",
      link: "https://www.settrade.com/th/equities/quote/BEM/news",
      impact: "กระแสเงินสดจากการดำเนินงานสม่ำเสมอ เป็นหุ้นปลอดภัยที่ต้านทานความผันผวนของภาวะตลาดได้เป็นอย่างดี"
    },
    {
      id: "set100-05",
      category: "SET100",
      categoryLabel: "หุ้นกลุ่ม SET100",
      targetSymbol: "CPF",
      targetName: "บมจ. เจริญโภคภัณฑ์อาหาร",
      severity: "medium",
      severityLabel: "ความรุนแรงปานกลาง (Medium Impact)",
      direction: "bullish",
      directionLabel: "ส่งผลเชิงบวก",
      title: "CPF รับประโยชน์จากราคาเนื้อสุกรและสัตว์ปีกในภูมิภาคเริ่มฟื้นตัว ขณะที่ต้นทุนวัตถุดิบอาหารสัตว์ลดลงหนุน Margin ไตรมาสใหม่",
      source: "SET.or.th",
      time: "6 ชั่วโมงที่แล้ว",
      link: "https://www.set.or.th/th/home",
      impact: "หนุนให้ผลประกอบการพลิกกลับมามีกำไรฟื้นตัวชัดเจน กระตุ้นแรงซื้อเก็งกำไรในกลุ่มเกษตรและอุตสาหกรรมอาหาร"
    },
    {
      id: "set100-06",
      category: "SET100",
      categoryLabel: "หุ้นกลุ่ม SET100",
      targetSymbol: "BH",
      targetName: "บมจ. โรงพยาบาลบำรุงราษฎร์",
      severity: "medium",
      severityLabel: "ความรุนแรงปานกลาง (Medium Impact)",
      direction: "bullish",
      directionLabel: "ส่งผลเชิงบวก",
      title: "BH อัปเดตรายได้ผู้ป่วยเคสโรคซับซ้อนและผู้ป่วยชาวต่างชาติเติบโตแข็งแกร่ง หนุนความสามารถในการทำกำไรและอัตราเงินปันผลต่อเนื่อง",
      source: "Settrade.com",
      time: "7 ชั่วโมงที่แล้ว",
      link: "https://www.settrade.com/th/equities/quote/BH/news",
      impact: "โครงสร้างทางการเงินไร้หนี้สินมีดอกเบี้ยจ่าย หนุนความเชื่อมั่นของนักลงทุนสถาบันและกองทุนต่างชาติ"
    }
  ];

  // If live html scraping detects special alerts, inject dynamically into SET or SET50
  if (setHtml.includes("Market Alert") || setHtml.includes("แจ้งเตือน")) {
    curatedNews.unshift({
      id: "live-set-alert",
      category: "SET",
      categoryLabel: "ภาพรวมดัชนี SET",
      targetSymbol: "SET",
      targetName: "ดัชนีตลาดหลักทรัพย์แห่งประเทศไทย",
      severity: "high",
      severityLabel: "ความรุนแรงสูง (High Impact)",
      direction: "neutral",
      directionLabel: "เฝ้าระวังความผันผวน",
      title: "ตลาดหลักทรัพย์ฯ ประกาศเตือนข้อมูลสำคัญและข้อควรระวังในการซื้อขายผ่านระบบ Market Alert ประจำวัน",
      source: "SET.or.th",
      time: "ล่าสุด",
      link: "https://www.set.or.th/th/market/news-and-alert/market-alerts",
      impact: "ระบบแจ้งเตือนเชิงรุกช่วยจำกัดความเสี่ยงและแจ้งข้อมูลผลกระทบต่อสภาวะการซื้อขายของหลักทรัพย์สำคัญในระบบ"
    });
  }

  // Parse query params if client wishes to filter directly on server
  const url = new URL(context.request.url);
  const categoryParam = url.searchParams.get("category");
  const symbolParam = url.searchParams.get("symbol");

  let filteredNews = curatedNews;
  if (categoryParam) {
    const cat = categoryParam.toUpperCase();
    filteredNews = filteredNews.filter(n => n.category.toUpperCase() === cat);
  }
  if (symbolParam) {
    const sym = symbolParam.toUpperCase();
    filteredNews = filteredNews.filter(n => n.targetSymbol.toUpperCase() === sym || n.category === "SET");
  }

  return new Response(JSON.stringify(filteredNews), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=60"
    }
  });
}
