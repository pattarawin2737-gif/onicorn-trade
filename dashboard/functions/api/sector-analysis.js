export async function onRequest(context) {
  const url = new URL(context.request.url);
  const requestedTf = (url.searchParams.get("timeframe") || "weekly").toLowerCase();

  // 8 Core Industry Sectors in the Stock Exchange of Thailand (SET)
  const sectorData = {
    weekly: {
      timeframe: "weekly",
      title: "การวิเคราะห์กลุ่มอุตสาหกรรมที่น่าสนใจประจำสัปดาห์นี้ (Weekly Sector Rotation)",
      periodLabel: "ประจำสัปดาห์นี้ (Tactical Focus)",
      marketTheme: "ตลาดจับตาเม็ดเงิน Fund Flow สถาบันและข่าวด่วนรายกลุ่ม โดยเน้นหุ้นกลุ่มปลอดภัยและหุ้นที่มีตัวเร่งทางเทคนิคอลเฉพาะตัว",
      updatedAt: new Date().toISOString(),
      summary: "สัปดาห์นี้ กลุ่มพลังงานทดแทน-สาธารณูปโภค (Energy) และกลุ่มการแพทย์ (Healthcare) มีคะแนนนำโดดเด่นจากกระแสความต้องการ Data Center พลังงานสะอาดและยอดผู้ป่วยต่างชาติพรีเมียม ขณะที่กลุ่มนิคมอุตสาหกรรม (Industrial Estate) ได้แรงหนุนจากยอดจองที่ดิน EV ค่ายใหญ่",
      sectors: [
        {
          id: "energy",
          name: "พลังงาน & สาธารณูปโภค",
          englishName: "Energy & Utilities",
          icon: "⚡",
          rank: 1,
          score: 93,
          recommendation: "Overweight",
          recommendationLabel: "ดาวเด่นนำตลาด (Top Outperform)",
          recommendationColor: "#22c55e",
          recommendationBg: "rgba(34, 197, 94, 0.12)",
          sentiment: "bullish",
          weeklyNewsCount: 5,
          newsHighlights: "ราคาน้ำมันดิบโลกทรงตัวเหนือแนวรับสำคัญ ขณะที่ดีมานด์ไฟฟ้าสำหรับศูนย์ข้อมูล AI Data Center ในไทยขยายตัวสูงเป็นประวัติการณ์",
          catalysts: "ดีลโครงการพลังงานสะอาดและโครงสร้างพื้นฐาน Data Center รองรับบริษัทเทคโนโลยีระดับโลก, ค่าการกลั่น (GRM) ทรงตัวช่วยพยุงกำไรขั้นต้น",
          tacticalStrategy: "Buy on Breakout ในหุ้นโรงไฟฟ้าขนาดใหญ่ที่มีสัญญาระยะยาว และตั้งจุดรับแบบ Buy on Dip ในหุ้นพลังงานต้นน้ำที่ย่อตัวแตะแนวรับ",
          riskWatch: "ความผันผวนของราคาน้ำมันดิบตามสถานการณ์ภูมิรัฐศาสตร์ตะวันออกกลางและนโยบายกำกับดูแลค่าไฟฟ้าผันแปร (Ft)",
          topPicks: [
            { symbol: "GULF", name: "กัลฟ์ เอ็นเนอร์จี", role: "ผู้นำโรงไฟฟ้า & Cloud Data Center", bias: "Bullish Breakout", highlight: "ยอดคำสั่งซื้อไฟฟ้า Data Center พุ่ง" },
            { symbol: "PTTEP", name: "ปตท.สผ.", role: "ผู้ผลิตก๊าซและน้ำมันต้นน้ำ", bias: "Buy on Dip", highlight: "สเปรดราคาน้ำมันดิบทรงตัวในระดับสูง" },
            { symbol: "TOP", name: "ไทยออยล์", role: "โรงกลั่นครบวงจร", bias: "Accumulate", highlight: "เดินหน้าโครงการ CFP ขยายกำลังผลิต" }
          ]
        },
        {
          id: "healthcare",
          name: "การแพทย์ & โรงพยาบาล",
          englishName: "Healthcare & Hospitals",
          icon: "🏥",
          rank: 2,
          score: 91,
          recommendation: "Overweight",
          recommendationLabel: "ดาวเด่นนำตลาด (Top Outperform)",
          recommendationColor: "#22c55e",
          recommendationBg: "rgba(34, 197, 94, 0.12)",
          sentiment: "bullish",
          weeklyNewsCount: 4,
          newsHighlights: "ยอดผู้ป่วยชาวต่างชาติ (Expat & Fly-in Patients) โดยเฉพาะจากตะวันออกกลางและเอเชียใต้เพิ่มขึ้นต่อเนื่อง หนุนรายได้เฉลี่ยต่อบิลสูงขึ้น",
          catalysts: "สถานะหุ้นปลอดภัย (Defensive Growth) ประจำพอร์ต ปลอดจากความผันผวนของเศรษฐกิจมหภาค และการขยายศูนย์การแพทย์โรคซับซ้อนอัตรากำไรสูง",
          tacticalStrategy: "Run Trend ตามกรอบขาขึ้นในหุ้นผู้นำกลุ่ม และเก็งกำไรหุ้นโรงพยาบาลประกันสังคมที่ได้ประโยชน์จากการปรับฐานค่าบริการ",
          riskWatch: "การแข่งขันเปิดศูนย์แพทย์เฉพาะทางในเมืองใหญ่ และต้นทุนบุคลากรทางการแพทย์ที่ปรับสูงขึ้น",
          topPicks: [
            { symbol: "BH", name: "รพ.บำรุงราษฎร์", role: "ผู้นำศูนย์การแพทย์พรีเมียมต่างชาติ", bias: "Strong Uptrend", highlight: "ฐานะการเงินไร้หนี้สิน ดอกเบี้ยไม่กระทบ" },
            { symbol: "BDMS", name: "กรุงเทพดุสิตเวชการ", role: "เครือข่ายโรงพยาบาลอันดับ 1", bias: "Buy on Dip", highlight: "ขยายศูนย์รับผู้ป่วยต่างชาติแห่งใหม่" },
            { symbol: "PR9", name: "รพ.พระรามเก้า", role: "ศูนย์โรคไตและซับซ้อน", bias: "Growth Momentum", highlight: "มาร์จิ้นเติบโตต่อเนื่องตามผู้ป่วยพรีเมียม" }
          ]
        },
        {
          id: "ict",
          name: "เทคโนโลยีสารสนเทศ & โทรคมนาคม",
          englishName: "ICT & Technology",
          icon: "📡",
          rank: 3,
          score: 88,
          recommendation: "Overweight",
          recommendationLabel: "ดาวเด่นนำตลาด (Top Outperform)",
          recommendationColor: "#22c55e",
          recommendationBg: "rgba(34, 197, 94, 0.12)",
          sentiment: "bullish",
          weeklyNewsCount: 4,
          newsHighlights: "กระแสเทคโนโลยี AI Solutions, โครงข่ายคลาวด์องค์กร และดีมานด์ชิ้นส่วนอิเล็กทรอนิกส์เซิร์ฟเวอร์ยังคงเติบโตอย่างร้อนแรง",
          catalysts: "การเติบโตของรายได้เฉลี่ยต่อเลขหมาย (ARPU) ภายหลังการควบรวมกิจการโทรคมนาคม และยอดคำสั่งซื้อล่วงหน้าชิ้นส่วนอิเล็กทรอนิกส์ระดับโลก",
          tacticalStrategy: "Selective Buy หุ้นที่จ่ายเงินปันผลสูงสม่ำเสมอ และจับจังหวะเก็งกำไรในหุ้นอิเล็กทรอนิกส์ช่วงที่ราคาย่อตัวไม่หลุด EMA 50",
          riskWatch: "ความผันผวนของค่าเงินบาทต่อดอลลาร์สหรัฐที่อาจกระทบต่อมาร์จิ้นผู้ส่งออกชิ้นส่วนอิเล็กทรอนิกส์",
          topPicks: [
            { symbol: "ADVANC", name: "แอดวานซ์ อินโฟร์", role: "ผู้นำโทรคมนาคม & คลาวด์ AI", bias: "Bullish Trend", highlight: "กระแสเงินสดแกร่ง ปันผลสม่ำเสมอ" },
            { symbol: "DELTA", name: "เดลต้า อีเลคโทรนิคส์", role: "ผู้ผลิต Power Supply AI Data Center", bias: "Momentum Breakout", highlight: "ยอดสั่งซื้อ AI Power Solutions ทำสถิติ" },
            { symbol: "TRUE", name: "ทรู คอร์ปอเรชั่น", role: "โครงข่ายมือถือและบรอดแบนด์", bias: "Turnaround Recovery", highlight: "ควบคุมต้นทุนดำเนินงานลดลงต่อเนื่อง" }
          ]
        },
        {
          id: "property",
          name: "นิคมอุตสาหกรรม & อสังหาริมทรัพย์",
          englishName: "Industrial & Property",
          icon: "🏭",
          rank: 4,
          score: 86,
          recommendation: "Selective Buy",
          recommendationLabel: "ทยอยสะสมจังหวะย่อ (Selective Buy)",
          recommendationColor: "#60a5fa",
          recommendationBg: "rgba(96, 165, 250, 0.12)",
          sentiment: "bullish",
          weeklyNewsCount: 3,
          newsHighlights: "ยอดจองซื้อและโอนที่ดินนิคมอุตสาหกรรมแปลงใหญ่จากกลุ่มผู้ผลิตยานยนต์ EV และผู้ให้บริการ Data Center พุ่งทะลุเป้าหมายของปี",
          catalysts: "กระแส Relocation ย้ายฐานการผลิตออกจากความเสี่ยงภูมิรัฐศาสตร์เข้ามายังไทย, ยอด Backlog นิคมฯ สูงเป็นประวัติการณ์",
          tacticalStrategy: "เน้นหุ้นนิคมอุตสาหกรรมเป็นตัวนำพอร์ต และเลือกลงทุนเฉพาะหุ้นอสังหาฯ แนวราบที่มีอัตราปันผลตอบแทนสูงกว่า 7%",
          riskWatch: "กำลังซื้อภาคอสังหาฯ ที่อยู่อาศัยระดับกลาง-ล่างยังคงถูกกดดันจากยอดปฏิเสธสินเชื่อ (Rejection Rate) ของสถาบันการเงิน",
          topPicks: [
            { symbol: "WHA", name: "ดับบลิวเอชเอ คอร์ป", role: "ผู้นำนิคมอุตสาหกรรมและโลจิสติกส์", bias: "Strong Uptrend", highlight: "ยอด Backlog ขายที่ดิน EV สูงสุดประวัติการณ์" },
            { symbol: "AMATA", name: "อมตะ คอร์ปอเรชัน", role: "นิคมอุตสาหกรรมใน EEC", bias: "Accumulate", highlight: "ดีลลูกค้านักลงทุนจีนและไต้หวันขยายตัว" },
            { symbol: "CPN", name: "เซ็นทรัลพัฒนา", role: "ผู้นำศูนย์การค้าและ Mixed-use", bias: "Buy on Dip", highlight: "ทราฟฟิกศูนย์การค้าฟื้นตัวแกร่งต่อเนื่อง" }
          ]
        },
        {
          id: "banking",
          name: "ธนาคาร & การเงิน",
          englishName: "Banking & Financials",
          icon: "🏦",
          rank: 5,
          score: 84,
          recommendation: "Selective Buy",
          recommendationLabel: "ทยอยสะสมจังหวะย่อ (Selective Buy)",
          recommendationColor: "#60a5fa",
          recommendationBg: "rgba(96, 165, 250, 0.12)",
          sentiment: "neutral",
          weeklyNewsCount: 4,
          newsHighlights: "กนง. ส่งสัญญาณรักษาเสถียรภาพดอกเบี้ยนโยบาย ขณะที่ธนาคารพาณิชย์ขนาดใหญ่เร่งควบคุม NPL และลดค่าใช้จ่ายตั้งสำรอง",
          catalysts: "ส่วนต่างอัตราดอกเบี้ยสุทธิ (NIM) ยังทรงตัวอยู่ในระดับเอื้อต่อผลประกอบการ และการจ่ายเงินปันผลระหว่างกาลระดับสูง 5-7%",
          tacticalStrategy: "ดักซื้อสะสมเมื่อราคาปรับฐานเข้าหาแนวรับสถาบัน เน้นหุ้นธนาคารใหญ่ที่มีงบดุลแข็งแกร่งและสัดส่วนสำรองหนี้เสียสูง (Coverage Ratio)",
          riskWatch: "หนี้ครัวเรือนระดับสูงและคุณภาพสินเชื่อรายย่อย (SMEs & เช่าซื้อรถยนต์) ที่ยังต้องติดตามอย่างใกล้ชิด",
          topPicks: [
            { symbol: "KBANK", name: "กสิกรไทย", role: "ผู้นำดิจิทัลแบงก์กิ้ง & ไฮเน็ตเวิร์ธ", bias: "Consolidation Support", highlight: "คุมสัดส่วน NPL สำเร็จ ค่าใช้จ่ายสำรองลด" },
            { symbol: "SCB", name: "เอสซีบี เอกซ์", role: "ยานแม่กลุ่มการเงินและฟินเทค", bias: "Buy on Dip", highlight: "อัตราเงินปันผลตอบแทนสูงเกิน 6.5%" },
            { symbol: "KTB", name: "กรุงไทย", role: "ธนาคารภาครัฐและแอปเป๋าตัง", bias: "Range Bound", highlight: "พอร์ตสินเชื่อภาครัฐมั่นคง ความเสี่ยงต่ำ" }
          ]
        },
        {
          id: "transport",
          name: "ขนส่งและโลจิสติกส์ & ท่องเที่ยว",
          englishName: "Transportation & Tourism",
          icon: "✈️",
          rank: 6,
          score: 82,
          recommendation: "Selective Buy",
          recommendationLabel: "ทยอยสะสมจังหวะย่อ (Selective Buy)",
          recommendationColor: "#60a5fa",
          recommendationBg: "rgba(96, 165, 250, 0.12)",
          sentiment: "bullish",
          weeklyNewsCount: 3,
          newsHighlights: "จำนวนเที่ยวบินระหว่างประเทศและยอดผู้โดยสารผ่านท่าอากาศยานฟื้นตัวทะลุสถิติเดิม หนุนรายได้ค่าบริการสัมปทาน",
          catalysts: "นโยบายยกเว้นวีซ่า (Visa-Free) กระตุ้นนักท่องเที่ยวต่างชาติเข้าไทย และการฟื้นตัวของปริมาณการจราจรบนทางด่วนและรถไฟฟ้า",
          tacticalStrategy: "Swing Trade ตามรอบการฟื้นตัวของตัวเลขนักท่องเที่ยว และเก็งกำไรในหุ้นรถไฟฟ้าที่มีกระแสเงินสดจากการดำเนินงานสม่ำเสมอ",
          riskWatch: "ต้นทุนราคาน้ำมันอากาศยานและภาวะการชะลอตัวทางเศรษฐกิจของนักท่องเที่ยวในบางภูมิภาค",
          topPicks: [
            { symbol: "AOT", name: "ท่าอากาศยานไทย", role: "ผู้บริหารสนามบินหลัก 6 แห่ง", bias: "Uptrend Bounce", highlight: "จำนวนเที่ยวบินระหว่างประเทศทำ New High" },
            { symbol: "BEM", name: "ทางด่วนและรถไฟฟ้า", role: "สัมปทาน MRT และทางด่วน", bias: "Defensive Value", highlight: "ผู้โดยสารรถไฟฟ้าแตะสถิติใหม่ต่อเนื่อง" },
            { symbol: "MINT", name: "ไมเนอร์ อินเตอร์ฯ", role: "เชนโรงแรมระดับโลกและอาหาร", bias: "Rebound Momentum", highlight: "อัตราเข้าพักโรงแรมในยุโรปและไทยแข็งแกร่ง" }
          ]
        },
        {
          id: "commerce",
          name: "ค้าปลีก & สินค้าอุปโภค",
          englishName: "Commerce & Retail",
          icon: "🛍️",
          rank: 7,
          score: 79,
          recommendation: "Neutral",
          recommendationLabel: "เกาะกลุ่มดัชนี (Market Weight)",
          recommendationColor: "#eab308",
          recommendationBg: "rgba(234, 179, 8, 0.12)",
          sentiment: "neutral",
          weeklyNewsCount: 3,
          newsHighlights: "ยอดขายสาขาเดิม (SSSG) ในกลุ่มร้านสะดวกซื้อฟื้นตัวเด่นตามแหล่งท่องเที่ยว ขณะที่ห้างค้าปลีกสินค้าขนาดใหญ่ยังทรงตัว",
          catalysts: "การขยายสาขาในประเทศเพื่อนบ้าน (กัมพูชา/ลาว) และมาตรการกระตุ้นการใช้จ่ายช่วงปลายปีของภาครัฐ",
          tacticalStrategy: "ถือลงทุนเฉพาะหุ้นที่มีเครือข่ายร้านค้าปลีกแข็งแกร่งและควบคุมอัตรากำไรขั้นต้นได้ดี รอสะสมที่แนวรับราคาลึก",
          riskWatch: "กำลังซื้อของกลุ่มผู้มีรายได้น้อยในต่างจังหวัดที่ยังชะลอตัว และต้นทุนค่าแรงขั้นต่ำที่มีแนวโน้มปรับขึ้น",
          topPicks: [
            { symbol: "CPALL", name: "ซีพี ออลล์", role: "เจ้าของ 7-Eleven และเครือข่ายค้าปลีก", bias: "Accumulate Support", highlight: "ยอดขายสาขาเดิมโตต่อเนื่องตามท่องเที่ยว" },
            { symbol: "CPAXT", name: "ซีพี แอ็กซ์ตร้า", role: "ค้าส่ง Makro และ Lotus’s", bias: "Value Support", highlight: "ปรับโครงสร้างองค์กรเพิ่มประสิทธิภาพ" },
            { symbol: "CRC", name: "เซ็นทรัล รีเทล", role: "ห้างสรรพสินค้าและแฟชั่น", bias: "Range Play", highlight: "ยอดขายต่างประเทศในเวียดนามเริ่มฟื้นตัว" }
          ]
        },
        {
          id: "food",
          name: "อาหารและเครื่องดื่ม & เกษตร",
          englishName: "Food & Beverage",
          icon: "🌾",
          rank: 8,
          score: 72,
          recommendation: "Neutral",
          recommendationLabel: "เกาะกลุ่มดัชนี (Market Weight)",
          recommendationColor: "#eab308",
          recommendationBg: "rgba(234, 179, 8, 0.12)",
          sentiment: "neutral",
          weeklyNewsCount: 2,
          newsHighlights: "ราคาเนื้อสัตว์ในภูมิภาคเริ่มมีสัญญาณแตะจุดต่ำสุด ขณะที่ต้นทุนกากถั่วเหลืองและข้าวโพดอาหารสัตว์ปรับตัวลดลงช่วยหนุนมาร์จิ้น",
          catalysts: "ยอดส่งออกอาหารแปรรูปและเครื่องดื่มไปยังตลาดยุโรปและตะวันออกกลางเริ่มฟื้นตัว",
          tacticalStrategy: "Wait & See หรือเก็งกำไรระยะสั้นตามรอบการประกาศงบการเงินไตรมาสที่คาดว่าจะพลิกกลับมามีกำไรฟื้นตัว",
          riskWatch: "ความเสี่ยงด้านโรคระบาดในสัตว์ และความผันผวนของค่าเงินบาทที่แข็งค่าเร็วอาจกระทบยอดรับรู้เป็นเงินบาท",
          topPicks: [
            { symbol: "CPF", name: "ซีพีเอฟ", role: "ผู้นำเกษตรอุตสาหกรรมและอาหาร", bias: "Bottom Bounce", highlight: "ต้นทุนวัตถุดิบลดลง หนุนมาร์จิ้นไตรมาสใหม่" },
            { symbol: "TU", name: "ไทยยูเนี่ยน", role: "อาหารทะเลแปรรูปส่งออก", bias: "Consolidation", highlight: "ตลาดส่งออกสหรัฐฯ และยุโรปฟื้นตัว" },
            { symbol: "SAPPE", name: "เซ็ปเป้", role: "ผู้ส่งออกเครื่องดื่มเพื่อสุขภาพ", bias: "Selective Play", highlight: "ตลาดส่งออกเอเชียและยุโรปเติบโตดี" }
          ]
        }
      ]
    },
    monthly: {
      timeframe: "monthly",
      title: "การวิเคราะห์กลุ่มอุตสาหกรรมที่น่าสนใจประจำเดือนนี้ (Monthly Strategic Outlook)",
      periodLabel: "ประจำเดือนนี้ (Strategic Horizon)",
      marketTheme: "ทิศทางดอกเบี้ยนโยบายโลกและไทยเริ่มเข้าสู่วงจรสมดุล หนุนการจัดสรรพอร์ตระยะกลางไปยังกลุ่มโครงสร้างพื้นฐาน ยานยนต์ไฟฟ้า และการบริโภคระดับพรีเมียม",
      updatedAt: new Date().toISOString(),
      summary: "มุมมองรอบเดือนนี้ แนะนำจัดน้ำหนัก Overweight ในกลุ่มนิคมอุตสาหกรรม (Industrial Estate) และกลุ่มเทคโนโลยี-สื่อสาร (ICT/Tech) ซึ่งเป็นเป้าหมายหลักของการลงทุนโดยตรงจากต่างประเทศ (FDI) และ Data Center ควบคู่กับกลุ่มสาธารณูปโภคและสุขภาพที่ให้ผลตอบแทนมั่นคง",
      sectors: [
        {
          id: "property",
          name: "นิคมอุตสาหกรรม & อสังหาริมทรัพย์",
          englishName: "Industrial & Property",
          icon: "🏭",
          rank: 1,
          score: 95,
          recommendation: "Overweight",
          recommendationLabel: "ดาวเด่นนำตลาด (Top Outperform)",
          recommendationColor: "#22c55e",
          recommendationBg: "rgba(34, 197, 94, 0.12)",
          sentiment: "bullish",
          weeklyNewsCount: 8,
          newsHighlights: "ยอดขอรับการส่งเสริมการลงทุนจาก BOI และกระแสการย้ายฐานการผลิตของค่ายรถยนต์ไฟฟ้าและชิปเซมิคอนดักเตอร์สร้างสถิติสูงสุดใหม่",
          catalysts: "นโยบายสนับสนุนโครงการ EEC ระยะยาว และยอดโอนที่ดินอุตสาหกรรมที่รอรับรู้รายได้ (Backlog) สูงสุดเป็นประวัติการณ์",
          tacticalStrategy: "ถือครองเพื่อรันเทรนด์ระยะกลาง (Position Trading) ในหุ้นนิคมอุตสาหกรรมชั้นนำ และรอรับรู้เงินปันผลรอบปี",
          riskWatch: "ความล่าช้าในการพัฒนาโครงสร้างพื้นฐานเชื่อมโยงน้ำประปาและไฟฟ้าในบางโซนของ EEC",
          topPicks: [
            { symbol: "WHA", name: "ดับบลิวเอชเอ คอร์ป", role: "ผู้นำนิคมอุตสาหกรรมและโลจิสติกส์", bias: "Long-term Bullish", highlight: "รับรู้กำไรก้อนโตจากการโอนที่ดิน Data Center" },
            { symbol: "AMATA", name: "อมตะ คอร์ปอเรชัน", role: "นิคมอุตสาหกรรม EEC & เวียดนาม", bias: "Strategic Accumulate", highlight: "ลูกค้านานาชาติเซ็นสัญญาเช่า-ซื้อต่อเนื่อง" },
            { symbol: "CPN", name: "เซ็นทรัลพัฒนา", role: "ผู้พัฒนาศูนย์การค้า & คอนโดฯ", bias: "Core Holding", highlight: "แผนเปิดโครงการ Mixed-use ใหญ่กระตุ้นรายได้" }
          ]
        },
        {
          id: "energy",
          name: "พลังงาน & สาธารณูปโภค",
          englishName: "Energy & Utilities",
          icon: "⚡",
          rank: 2,
          score: 92,
          recommendation: "Overweight",
          recommendationLabel: "ดาวเด่นนำตลาด (Top Outperform)",
          recommendationColor: "#22c55e",
          recommendationBg: "rgba(34, 197, 94, 0.12)",
          sentiment: "bullish",
          weeklyNewsCount: 9,
          newsHighlights: "แผนพัฒนากำลังผลิตไฟฟ้าของประเทศ (PDP ฉบับใหม่) เพิ่มสัดส่วนพลังงานหมุนเวียน (Renewable Energy) และระบบกักเก็บพลังงาน BESS อย่างมีนัยสำคัญ",
          catalysts: "สัญญาจำหน่ายไฟฟ้าพลังงานสะอาดระยะยาว (Direct PPA) ให้แก่กลุ่ม Hyperscale Data Center ยักษ์ใหญ่ระดับโลก",
          tacticalStrategy: "ทยอยสะสมหุ้นโรงไฟฟ้าพลังงานหมุนเวียนและโรงไฟฟ้าก๊าซธรรมชาติที่มีกระแสเงินสดมั่นคงเป็นแกนหลักของพอร์ต",
          riskWatch: "นโยบายแทรกแซงราคาค่าไฟฟ้าของภาครัฐเพื่อลดภาระค่าครองชีพประชาชนในระยะสั้น",
          topPicks: [
            { symbol: "GULF", name: "กัลฟ์ เอ็นเนอร์จี", role: "โครงสร้างพื้นฐานพลังงาน & AI Cloud", bias: "Core Compounder", highlight: "ฐานกำไรเติบโตก้าวกระโดดจากหลายโครงการ" },
            { symbol: "PTT", name: "ปตท.", role: "กลุ่มพลังงานแห่งชาติ", bias: "High Dividend Value", highlight: "ฐานะการเงินแข็งแกร่ง ปันผลระดับ 5.5%+" },
            { symbol: "PTTEP", name: "ปตท.สผ.", role: "สำรวจและผลิตปิโตรเลียม", bias: "Cash Flow Giant", highlight: "ต้นทุนการผลิตต่อหน่วยอยู่ในระดับแข่งขันได้สูง" }
          ]
        },
        {
          id: "healthcare",
          name: "การแพทย์ & โรงพยาบาล",
          englishName: "Healthcare & Hospitals",
          icon: "🏥",
          rank: 3,
          score: 90,
          recommendation: "Overweight",
          recommendationLabel: "ดาวเด่นนำตลาด (Top Outperform)",
          recommendationColor: "#22c55e",
          recommendationBg: "rgba(34, 197, 94, 0.12)",
          sentiment: "bullish",
          weeklyNewsCount: 6,
          newsHighlights: "ประเทศไทยตอกย้ำความเป็นศูนย์กลางทางการแพทย์ระดับภูมิภาค (Medical Tourism Hub) ด้วยมาตรฐานสากลและค่าบริการแข่งขันได้",
          catalysts: "การเข้าสู่สังคมผู้สูงวัย (Aged Society) อย่างเต็มรูปแบบ และการเพิ่มขึ้นของสัดส่วนรายได้จากเคสการรักษาโรคซับซ้อนที่มี Margin สูง",
          tacticalStrategy: "จัดสรรเป็นพอร์ตเชิงรับ (Defensive Core) เพื่อลดความผันผวนของพอร์ตโดยรวมในภาวะที่ตลาดหุ้นต่างประเทศมีความไม่แน่นอน",
          riskWatch: "ความเสี่ยงด้านการขาดแคลนบุคลากรแพทย์เฉพาะทาง และการปรับระเบียบการเบิกจ่ายประกันสุขภาพ",
          topPicks: [
            { symbol: "BDMS", name: "กรุงเทพดุสิตเวชการ", role: "เครือข่ายโรงพยาบาลใหญ่สุดในอาเซียน", bias: "Steady Growth", highlight: "ผู้ป่วยต่างชาติพรีเมียมสร้าง New High" },
            { symbol: "BH", name: "รพ.บำรุงราษฎร์", role: "ศูนย์รักษาโรคยากระดับโลก", bias: "Premium Margin", highlight: "อัตรากำไรขั้นต้นและ ROE แข็งแกร่งที่สุด" },
            { symbol: "BCH", name: "บางกอก เชน ฮอสปิทอล", role: "รพ.ประกันสังคมและเงินสด", bias: "Value Play", highlight: "จำนวนผู้ประกันตนในระบบเพิ่มขึ้นตามเป้า" }
          ]
        },
        {
          id: "ict",
          name: "เทคโนโลยีสารสนเทศ & โทรคมนาคม",
          englishName: "ICT & Technology",
          icon: "📡",
          rank: 4,
          score: 87,
          recommendation: "Overweight",
          recommendationLabel: "ดาวเด่นนำตลาด (Top Outperform)",
          recommendationColor: "#22c55e",
          recommendationBg: "rgba(34, 197, 94, 0.12)",
          sentiment: "bullish",
          weeklyNewsCount: 7,
          newsHighlights: "การเปลี่ยนผ่านสู่เศรษฐกิจดิจิทัล (Digital Transformation) ผลักดันให้ภาคธุรกิจไทยลงทุนในระบบ Cyber Security, Cloud และ AI อย่างต่อเนื่อง",
          catalysts: "สงครามราคาในอุตสาหกรรมโทรคมนาคมสิ้นสุดลงหลังการควบรวมกิจการ ส่งผลให้ค่าบริการต่อผู้ใช้เฉลี่ย (ARPU) ทยอยปรับขึ้นตามธรรมชาติ",
          tacticalStrategy: "เลือกลงทุนในหุ้นที่มีกระแสเงินสดจากการดำเนินงานสม่ำเสมอ และจ่ายเงินปันผลสูงในอัตรา 4-6% ต่อปี",
          riskWatch: "ความเข้มงวดในการกำกับดูแลด้านการคุ้มครองข้อมูลส่วนบุคคล (PDPA) และความเสี่ยงไซเบอร์",
          topPicks: [
            { symbol: "ADVANC", name: "แอดวานซ์ อินโฟร์", role: "ผู้นำโทรคมนาคมและบริการดิจิทัล", bias: "Dividend & Growth", highlight: "ROE สูง กระแสเงินสดเสถียรที่สุดในกลุ่ม" },
            { symbol: "DELTA", name: "เดลต้า อีเลคโทรนิคส์", role: "เทคโนโลยี AI Power & EV Component", bias: "Secular Growth", highlight: "ดีมานด์ Data Center โลกผลักดันยอดขาย" },
            { symbol: "INTUCH", name: "อินทัช โฮลดิ้งส์", role: "บริษัทโฮลดิ้งด้านเทคโนโลยี", bias: "High Yield Play", highlight: "รับเงินปันผลเต็มเม็ดเต็มหน่วยจาก ADVANC" }
          ]
        },
        {
          id: "banking",
          name: "ธนาคาร & การเงิน",
          englishName: "Banking & Financials",
          icon: "🏦",
          rank: 5,
          score: 85,
          recommendation: "Selective Buy",
          recommendationLabel: "ทยอยสะสมจังหวะย่อ (Selective Buy)",
          recommendationColor: "#60a5fa",
          recommendationBg: "rgba(96, 165, 250, 0.12)",
          sentiment: "neutral",
          weeklyNewsCount: 8,
          newsHighlights: "ธนาคารพาณิชย์ขนาดใหญ่เพิ่มสัดส่วนเงินสำรองต่อหนี้สงสัยจะสูญ (Coverage Ratio) อยู่ในระดับสูงสุดเพื่อรองรับความเสี่ยงวัฏจักรเศรษฐกิจ",
          catalysts: "อัตราส่วนเงินปันผลตอบแทน (Dividend Yield) ในระดับสูงถึง 6-8% ซึ่งดึงดูดเม็ดเงินลงทุนระยะยาวจากกองทุนบำเหน็จบำนาญและสถาบัน",
          tacticalStrategy: "เน้นสะสมเพื่อรับเงินปันผล (Dividend Play) ในธนาคารขนาดใหญ่ที่มีความเสี่ยงด้านคุณภาพหนี้สินต่ำ",
          riskWatch: "การฟื้นตัวที่ช้าของภาคธุรกิจขนาดย่อม (SMEs) และการควบคุมสินเชื่อรายย่อยที่เข้มงวดอาจกระทบการเติบโตของสินเชื่อรวม",
          topPicks: [
            { symbol: "SCB", name: "เอสซีบี เอกซ์", role: "ยานแม่กลุ่มการเงินและเทคโนโลยี", bias: "Dividend Champion", highlight: "ปันผลสูงกว่า 7% ต่อปี งบดุลแข็งแกร่ง" },
            { symbol: "KBANK", name: "กสิกรไทย", role: "ผู้นำดิจิทัลแบงก์กิ้ง & ESG", bias: "Quality Banking", highlight: "ลดความเสี่ยง NPL สินเชื่อรายย่อยสำเร็จ" },
            { symbol: "BBL", name: "ธนาคารกรุงเทพ", role: "ผู้นำสินเชื่อธุรกิจขนาดใหญ่และข้ามชาติ", bias: "Conservative Stronghold", highlight: "Coverage Ratio สูงสุดในระบบธนาคารไทย" }
          ]
        },
        {
          id: "transport",
          name: "ขนส่งและโลจิสติกส์ & ท่องเที่ยว",
          englishName: "Transportation & Tourism",
          icon: "✈️",
          rank: 6,
          score: 83,
          recommendation: "Selective Buy",
          recommendationLabel: "ทยอยสะสมจังหวะย่อ (Selective Buy)",
          recommendationColor: "#60a5fa",
          recommendationBg: "rgba(96, 165, 250, 0.12)",
          sentiment: "bullish",
          weeklyNewsCount: 5,
          newsHighlights: "รายได้จากการท่องเที่ยวระหว่างประเทศมีแนวโน้มแตะเป้าหมายทั้งปีของ ททท. หนุนธุรกิจสนามบิน โรงแรม และการเดินทางครบวงจร",
          catalysts: "ฤดูกาลท่องเที่ยวช่วงไฮซีซั่นปลายปี (High Season) และการกลับมาเปิดเที่ยวบินตรงเชื่อมเมืองสำคัญของจีน ยุโรป และอินเดีย",
          tacticalStrategy: "ทยอยสะสมหุ้นกลุ่มท่องเที่ยวและบริการขนส่งล่วงหน้าก่อนเข้าสู่ช่วง High Season เพื่อรับส่วนต่างราคาและเงินปันผล",
          riskWatch: "ผลกระทบจากสภาพอากาศตามฤดูกาล และต้นทุนค่าพลังงานขนส่ง",
          topPicks: [
            { symbol: "AOT", name: "ท่าอากาศยานไทย", role: "โครงสร้างพื้นฐานการบินระดับชาติ", bias: "Monopoly Asset", highlight: "การปรับขึ้นค่า PSC หนุนกระแสเงินสดระยะยาว" },
            { symbol: "BEM", name: "ทางด่วนและรถไฟฟ้า", role: "ระบบขนส่งมวลชนในเขตเมือง", bias: "Steady Growth", highlight: "ปริมาณผู้โดยสารเติบโตตามสายสีน้ำเงิน" },
            { symbol: "MINT", name: "ไมเนอร์ อินเตอร์ฯ", role: "เครือข่ายโรงแรมระดับโลก", bias: "Global Rebound", highlight: "พอร์ตโรงแรมในยุโรปและไทยสร้างสถิติกำไร" }
          ]
        },
        {
          id: "commerce",
          name: "ค้าปลีก & สินค้าอุปโภค",
          englishName: "Commerce & Retail",
          icon: "🛍️",
          rank: 7,
          score: 81,
          recommendation: "Selective Buy",
          recommendationLabel: "ทยอยสะสมจังหวะย่อ (Selective Buy)",
          recommendationColor: "#60a5fa",
          recommendationBg: "rgba(96, 165, 250, 0.12)",
          sentiment: "neutral",
          weeklyNewsCount: 6,
          newsHighlights: "มาตรการแจกเงินและกระตุ้นการใช้จ่ายภาครัฐช่วยหนุนกำลังซื้อในระดับฐานราก และกระตุ้นยอดขายสินค้าอุปโภคบริโภคจำเป็น",
          catalysts: "การรวมศูนย์การจัดซื้อและการลดต้นทุนจากการ Synergy เครือข่ายค้าปลีกขนาดใหญ่",
          tacticalStrategy: "Selective Buy หุ้นค้าปลีกที่มีฐานร้านสะดวกซื้อและค้าส่งอาหารสดซึ่งเป็นสินค้าจำเป็นต่อการดำรงชีวิต",
          riskWatch: "หนี้ครัวเรือนที่อยู่ในระดับสูงกดดันการใช้จ่ายสินค้าฟุ่มเฟือย (Discretionary Goods)",
          topPicks: [
            { symbol: "CPALL", name: "ซีพี ออลล์", role: "ผู้นำร้านสะดวกซื้อและเครือข่ายค้าปลีก", bias: "Defensive Leader", highlight: "ขยายสาขาต่อเนื่อง ครองส่วนแบ่งตลาดสูงสุด" },
            { symbol: "CPAXT", name: "ซีพี แอ็กซ์ตร้า", role: "ค้าส่งและไฮเปอร์มาร์เก็ต", bias: "Synergy Integration", highlight: "เพิ่มกำไรขั้นต้นจากการบริหารต้นทุนร่วม" },
            { symbol: "HMPRO", name: "โฮม โปรดักส์ เซ็นเตอร์", role: "ศูนย์รวมวัสดุก่อสร้างและของแต่งบ้าน", bias: "High Dividend Value", highlight: "ปันผลสม่ำเสมอ คาดหวังกำลังซื้อฟื้นตัว" }
          ]
        },
        {
          id: "food",
          name: "อาหารและเครื่องดื่ม & เกษตร",
          englishName: "Food & Beverage",
          icon: "🌾",
          rank: 8,
          score: 75,
          recommendation: "Neutral",
          recommendationLabel: "เกาะกลุ่มดัชนี (Market Weight)",
          recommendationColor: "#eab308",
          recommendationBg: "rgba(234, 179, 8, 0.12)",
          sentiment: "neutral",
          weeklyNewsCount: 4,
          newsHighlights: "วงจรต้นทุนอาหารสัตว์โลกผ่านจุดสูงสุดและเริ่มปรับตัวลดลง ขณะที่ราคาเนื้อสุกรในภูมิภาคเอเชียเริ่มทรงตัวสะท้อนการปรับลดอุปทานส่วนเกิน",
          catalysts: "การขยายตลาดส่งออกอาหารพร้อมรับประทาน (Ready-to-Eat) ไปยังตลาดตะวันออกกลางและออสเตรเลีย",
          tacticalStrategy: "จับตาตัวเลขผลประกอบการไตรมาสถัดไปเพื่อยืนยันการฟื้นตัวของกำไรสุทธิ (Turnaround Confirmation) ก่อนเพิ่มน้ำหนักลงทุน",
          riskWatch: "ความผันผวนของอัตราแลกเปลี่ยนค่าเงินบาท และมาตรการกีดกันทางการค้าเกี่ยวกับมาตรฐานสิ่งแวดล้อม",
          topPicks: [
            { symbol: "CPF", name: "ซีพีเอฟ", role: "เกษตรอุตสาหกรรมและอาหารครบวงจร", bias: "Turnaround Target", highlight: "สเปรดราคาเนื้อสัตว์ฟื้นตัว ต้นทุนลดลง" },
            { symbol: "TU", name: "ไทยยูเนี่ยน", role: "อาหารทะเลกระป๋องและอาหารสัตว์เลี้ยง", bias: "Value Play", highlight: "ธุรกิจอาหารสัตว์เลี้ยงพรีเมียมเติบโตสูง" },
            { symbol: "SAPPE", name: "เซ็ปเป้", role: "เครื่องดื่มนวัตกรรมเพื่อสุขภาพ", bias: "Global Expansion", highlight: "ขยายฐานตัวแทนจำหน่ายในยุโรปและสหรัฐฯ" }
          ]
        }
      ]
    }
  };

  const payload = requestedTf === "monthly" ? sectorData.monthly : sectorData.weekly;

  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=60"
    }
  });
}
