//+------------------------------------------------------------------+
//|                                     Onicorn_AutoJournal_MT4.mq4  |
//|                        Copyright 2026, Onicorn Trade Dashboard   |
//|                                   https://onicorn-trade.pages.dev|
//+------------------------------------------------------------------+
#property copyright   "Copyright 2026, Onicorn Trade Dashboard"
#property link        "https://onicorn-trade.pages.dev"
#property version     "1.00"
#property strict
#property description "EA สำหรับบันทึกออเดอร์ Forex & Gold เข้าสู่ Onicorn Trade Dashboard อัตโนมัติ"
#property description "เมื่อมีการเปิดไม้หรือปิดไม้ในบัญชี MT4 จะส่งข้อมูลไปยังระบบเว็บทันที"

//+------------------------------------------------------------------+
//| INPUT PARAMETERS (ค่าตัวแปรที่สามารถตั้งค่าได้ในหน้าต่าง Inputs)     |
//+------------------------------------------------------------------+
input string InpSectionAuth      = "=== บัญชีผู้ใช้ Onicorn Trade ==="; // -------------------------------------
input string InpUsername         = "pattarawin";                        // 👤 Username บนเว็บ Onicorn Trade
input string InpApiToken         = "123456";                            // 🔑 รหัสผ่าน หรือ Token ของผู้ใช้
input string InpServerUrl        = "https://onicorn-trade.pages.dev/api/ea-sync"; // 🌐 Server API URL

input string InpSectionFilter    = "=== เงื่อนไขการบันทึกออเดอร์ ==="; // -------------------------------------
input bool   InpTrackManual      = true;                                // 📱 บันทึกการเทรดมือ/มือถือ (Magic = 0)
input int    InpMagicFilter      = 0;                                   // 🎯 กรอง Magic Number (0 = บันทึกทั้งหมด)
input int    InpCheckIntervalSec = 3;                                   // ⏱️ ความถี่ตรวจเช็คออเดอร์ (วินาที)
input bool   InpDebugLog         = true;                                // 📝 แสดงข้อความแจ้งเตือนใน Experts Tab

//+------------------------------------------------------------------+
//| โครงสร้างจัดเก็บสถานะออเดอร์เพื่อตรวจจับการเปลี่ยนแปลง                   |
//+------------------------------------------------------------------+
struct TrackedOrder
{
   int      ticket;
   string   symbol;
   string   type;
   double   lots;
   double   openPrice;
   datetime openTime;
   double   sl;
   double   tp;
   long     magic;
   string   comment;
};

TrackedOrder g_trackedOrders[];

//+------------------------------------------------------------------+
//| ฟังก์ชันส่งข้อมูล JSON ไปยัง Onicorn Trade Web API ผ่าน WebRequest   |
//+------------------------------------------------------------------+
bool SendJsonToApi(string jsonPayload, string &responseMsg)
{
   string headers = "Content-Type: application/json\r\n";
   char postData[];
   char resultData[];
   string resultHeaders;
   
   StringToCharArray(jsonPayload, postData, 0, WHOLE_ARRAY, CP_UTF8);
   // ลบ null terminator ตัวสุดท้ายออกเพื่อให้ JSON สมบูรณ์
   int dataSize = ArraySize(postData) - 1;
   if(dataSize <= 0) return false;
   ArrayResize(postData, dataSize);

   ResetLastError();
   int timeoutMs = 5000;
   int res = WebRequest("POST", InpServerUrl, headers, timeoutMs, postData, resultData, resultHeaders);

   if(res == -1)
   {
      int err = GetLastError();
      if(err == 4060)
      {
         Print("❌ [Onicorn EA Error]: WebRequest ไม่ได้รับอนุญาต กรุณาไปที่ Tools -> Options -> Expert Advisors และติ๊ก 'Allow WebRequest for listed URL' จากนั้นเพิ่ม: 'https://onicorn-trade.pages.dev'");
         Alert("⚠️ กรุณาอนุญาต WebRequest ใน MT4 Options เพื่อให้ EA ส่งข้อมูลได้");
      }
      else
      {
         Print("⚠️ [Onicorn EA Error]: WebRequest ล้มเหลว Code: ", err, " | URL: ", InpServerUrl);
      }
      return false;
   }

   responseMsg = CharArrayToString(resultData, 0, WHOLE_ARRAY, CP_UTF8);
   if(InpDebugLog)
   {
      Print("📡 [Onicorn API Response (HTTP ", res, ")]: ", responseMsg);
   }

   return (res >= 200 && res < 300);
}

//+------------------------------------------------------------------+
//| ทดสอบการเชื่อมต่อกับเซิร์ฟเวอร์ (PING)                              |
//+------------------------------------------------------------------+
void TestApiConnection()
{
   string json = "{"
      + "\"username\":\"" + InpUsername + "\","
      + "\"token\":\"" + InpApiToken + "\","
      + "\"event\":\"PING\""
      + "}";
      
   string res;
   if(SendJsonToApi(json, res))
   {
      Print("✅ [Onicorn EA]: เชื่อมต่อกับ Onicorn Trade Dashboard สำเร็จเรียบร้อย!");
   }
   else
   {
      Print("⚠️ [Onicorn EA]: ยังไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบ Username, Token หรือ URL");
   }
}

//+------------------------------------------------------------------+
//| ฟังก์ชันส่งข้อมูลเมื่อมีการเปิดออเดอร์ (ORDER_OPEN)                   |
//+------------------------------------------------------------------+
void SendOrderOpen(int ticket, string symbol, string type, double lots, double openPrice, datetime openTime, double sl, double tp, long magic, string comment)
{
   string timeStr = TimeToStr(openTime, TIME_DATE|TIME_SECONDS);
   string json = "{"
      + "\"username\":\"" + InpUsername + "\","
      + "\"token\":\"" + InpApiToken + "\","
      + "\"event\":\"ORDER_OPEN\","
      + "\"platform\":\"MT4\","
      + "\"ticket\":" + IntegerToString(ticket) + ","
      + "\"symbol\":\"" + symbol + "\","
      + "\"order_type\":\"" + type + "\","
      + "\"lots\":" + DoubleToStr(lots, 2) + ","
      + "\"open_price\":" + DoubleToStr(openPrice, (int)MarketInfo(symbol, MODE_DIGITS)) + ","
      + "\"open_time\":\"" + timeStr + "\","
      + "\"sl\":" + (sl > 0 ? DoubleToStr(sl, (int)MarketInfo(symbol, MODE_DIGITS)) : "null") + ","
      + "\"tp\":" + (tp > 0 ? DoubleToStr(tp, (int)MarketInfo(symbol, MODE_DIGITS)) : "null") + ","
      + "\"magic\":" + IntegerToString(magic) + ","
      + "\"comment\":\"" + comment + "\""
      + "}";

   string res;
   if(SendJsonToApi(json, res))
   {
      Print("🚀 [Onicorn EA]: บันทึกเปิดไม้สำเร็จ Ticket #", ticket, " [", type, " ", symbol, " ", DoubleToStr(lots, 2), " Lot @ ", openPrice, "]");
   }
}

//+------------------------------------------------------------------+
//| ฟังก์ชันส่งข้อมูลเมื่อมีการแก้ไขออเดอร์ (ORDER_MODIFY)                 |
//+------------------------------------------------------------------+
void SendOrderModify(int ticket, string symbol, double sl, double tp)
{
   string json = "{"
      + "\"username\":\"" + InpUsername + "\","
      + "\"token\":\"" + InpApiToken + "\","
      + "\"event\":\"ORDER_MODIFY\","
      + "\"platform\":\"MT4\","
      + "\"ticket\":" + IntegerToString(ticket) + ","
      + "\"symbol\":\"" + symbol + "\","
      + "\"sl\":" + (sl > 0 ? DoubleToStr(sl, (int)MarketInfo(symbol, MODE_DIGITS)) : "null") + ","
      + "\"tp\":" + (tp > 0 ? DoubleToStr(tp, (int)MarketInfo(symbol, MODE_DIGITS)) : "null") + "\""
      + "}";

   string res;
   SendJsonToApi(json, res);
}

//+------------------------------------------------------------------+
//| ฟังก์ชันส่งข้อมูลเมื่อออเดอร์ปิดแล้ว (ORDER_CLOSE)                    |
//+------------------------------------------------------------------+
void SendOrderClose(int ticket, string symbol, string type, double lots, double openPrice, datetime openTime, 
                    double closePrice, datetime closeTime, double profit, double swap, double commission, long magic, string comment)
{
   string openTimeStr  = TimeToStr(openTime, TIME_DATE|TIME_SECONDS);
   string closeTimeStr = TimeToStr(closeTime, TIME_DATE|TIME_SECONDS);
   
   string json = "{"
      + "\"username\":\"" + InpUsername + "\","
      + "\"token\":\"" + InpApiToken + "\","
      + "\"event\":\"ORDER_CLOSE\","
      + "\"platform\":\"MT4\","
      + "\"ticket\":" + IntegerToString(ticket) + ","
      + "\"symbol\":\"" + symbol + "\","
      + "\"order_type\":\"" + type + "\","
      + "\"lots\":" + DoubleToStr(lots, 2) + ","
      + "\"open_price\":" + DoubleToStr(openPrice, (int)MarketInfo(symbol, MODE_DIGITS)) + ","
      + "\"open_time\":\"" + openTimeStr + "\","
      + "\"close_price\":" + DoubleToStr(closePrice, (int)MarketInfo(symbol, MODE_DIGITS)) + ","
      + "\"close_time\":\"" + closeTimeStr + "\","
      + "\"profit\":" + DoubleToStr(profit, 2) + ","
      + "\"swap\":" + DoubleToStr(swap, 2) + ","
      + "\"commission\":" + DoubleToStr(commission, 2) + ","
      + "\"magic\":" + IntegerToString(magic) + ","
      + "\"comment\":\"" + comment + "\""
      + "}";

   string res;
   if(SendJsonToApi(json, res))
   {
      double net = profit + swap + commission;
      Print("🏁 [Onicorn EA]: บันทึกปิดไม้สำเร็จ Ticket #", ticket, " [Net PnL: ", (net >= 0 ? "+$" : "-$"), DoubleToStr(MathAbs(net), 2), "]");
   }
}

//+------------------------------------------------------------------+
//| ตรวจสอบว่าออเดอร์ตรงตามเงื่อนไข Filter หรือไม่                       |
//+------------------------------------------------------------------+
bool IsOrderAllowed(long magic)
{
   if(magic == 0 && !InpTrackManual) return false;
   if(InpMagicFilter > 0 && magic != InpMagicFilter) return false;
   return true;
}

//+------------------------------------------------------------------+
//| ค้นหาออเดอร์ในรายการ Tracked List                                  |
//+------------------------------------------------------------------+
int FindTrackedIndex(int ticket)
{
   for(int i = 0; i < ArraySize(g_trackedOrders); i++)
   {
      if(g_trackedOrders[i].ticket == ticket) return i;
   }
   return -1;
}

//+------------------------------------------------------------------+
//| ตรวจเช็คสถานะออเดอร์ปัจจุบันในพอร์ต MT4                             |
//+------------------------------------------------------------------+
void CheckOrders()
{
   int currentOpenTickets[];
   int total = OrdersTotal();
   
   for(int i = 0; i < total; i++)
   {
      if(!OrderSelect(i, SELECT_BY_POS, MODE_TRADES)) continue;
      
      int type = OrderType();
      if(type != OP_BUY && type != OP_SELL) continue; // ข้าม Pending Orders
      
      int ticket = OrderTicket();
      long magic = OrderMagicNumber();
      if(!IsOrderAllowed(magic)) continue;
      
      // เก็บ Ticket ปัจจุบันไว้
      int size = ArraySize(currentOpenTickets);
      ArrayResize(currentOpenTickets, size + 1);
      currentOpenTickets[size] = ticket;
      
      string typeStr = (type == OP_BUY ? "Buy" : "Sell");
      int idx = FindTrackedIndex(ticket);
      
      if(idx == -1)
      {
         // ตรวจพบออเดอร์เปิดใหม่
         SendOrderOpen(ticket, OrderSymbol(), typeStr, OrderLots(), OrderOpenPrice(), 
                       OrderOpenTime(), OrderStopLoss(), OrderTakeProfit(), magic, OrderComment());
         
         // เพิ่มเข้า Tracked List
         int tSize = ArraySize(g_trackedOrders);
         ArrayResize(g_trackedOrders, tSize + 1);
         g_trackedOrders[tSize].ticket    = ticket;
         g_trackedOrders[tSize].symbol    = OrderSymbol();
         g_trackedOrders[tSize].type      = typeStr;
         g_trackedOrders[tSize].lots      = OrderLots();
         g_trackedOrders[tSize].openPrice = OrderOpenPrice();
         g_trackedOrders[tSize].openTime  = OrderOpenTime();
         g_trackedOrders[tSize].sl        = OrderStopLoss();
         g_trackedOrders[tSize].tp        = OrderTakeProfit();
         g_trackedOrders[tSize].magic     = magic;
         g_trackedOrders[tSize].comment   = OrderComment();
      }
      else
      {
         // ตรวจสอบว่ามีการแก้ไข SL / TP หรือไม่
         if(MathAbs(g_trackedOrders[idx].sl - OrderStopLoss()) > Point/2.0 || 
            MathAbs(g_trackedOrders[idx].tp - OrderTakeProfit()) > Point/2.0)
         {
            g_trackedOrders[idx].sl = OrderStopLoss();
            g_trackedOrders[idx].tp = OrderTakeProfit();
            SendOrderModify(ticket, OrderSymbol(), OrderStopLoss(), OrderTakeProfit());
         }
      }
   }
   
   // ตรวจสอบออเดอร์ที่เคยเปิดอยู่ แต่ตอนนี้หายไปแล้ว (ออเดอร์ปิดแล้ว)
   for(int j = ArraySize(g_trackedOrders) - 1; j >= 0; j--)
   {
      int trackedTicket = g_trackedOrders[j].ticket;
      bool isStillOpen = false;
      
      for(int k = 0; k < ArraySize(currentOpenTickets); k++)
      {
         if(currentOpenTickets[k] == trackedTicket)
         {
            isStillOpen = true;
            break;
         }
      }
      
      if(!isStillOpen)
      {
         // ค้นหาข้อมูลปิดไม้จาก History
         if(OrderSelect(trackedTicket, SELECT_BY_TICKET, MODE_HISTORY))
         {
            SendOrderClose(trackedTicket, OrderSymbol(), (OrderType() == OP_BUY ? "Buy" : "Sell"), 
                           OrderLots(), OrderOpenPrice(), OrderOpenTime(), 
                           OrderClosePrice(), OrderCloseTime(), OrderProfit(), 
                           OrderSwap(), OrderCommission(), OrderMagicNumber(), OrderComment());
         }
         
         // ลบออกจาก Tracked List
         for(int m = j; m < ArraySize(g_trackedOrders) - 1; m++)
         {
            g_trackedOrders[m] = g_trackedOrders[m + 1];
         }
         ArrayResize(g_trackedOrders, ArraySize(g_trackedOrders) - 1);
      }
   }
}

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("=====================================================");
   Print("🚀 Onicorn Auto-Journal EA (MT4) Starting...");
   Print("👤 Username: ", InpUsername);
   Print("🌐 Target Server: ", InpServerUrl);
   Print("=====================================================");
   
   // โหลดออเดอร์ที่เปิดค้างอยู่ปัจจุบันเข้าสู่ Memory
   int total = OrdersTotal();
   for(int i = 0; i < total; i++)
   {
      if(!OrderSelect(i, SELECT_BY_POS, MODE_TRADES)) continue;
      int type = OrderType();
      if(type != OP_BUY && type != OP_SELL) continue;
      
      long magic = OrderMagicNumber();
      if(!IsOrderAllowed(magic)) continue;
      
      int size = ArraySize(g_trackedOrders);
      ArrayResize(g_trackedOrders, size + 1);
      g_trackedOrders[size].ticket    = OrderTicket();
      g_trackedOrders[size].symbol    = OrderSymbol();
      g_trackedOrders[size].type      = (type == OP_BUY ? "Buy" : "Sell");
      g_trackedOrders[size].lots      = OrderLots();
      g_trackedOrders[size].openPrice = OrderOpenPrice();
      g_trackedOrders[size].openTime  = OrderOpenTime();
      g_trackedOrders[size].sl        = OrderStopLoss();
      g_trackedOrders[size].tp        = OrderTakeProfit();
      g_trackedOrders[size].magic     = magic;
      g_trackedOrders[size].comment   = OrderComment();
   }
   
   Print("📊 ตรวจพบออเดอร์ที่กำลังถืออยู่ปัจจุบัน: ", ArraySize(g_trackedOrders), " ไม้");
   
   // ทดสอบเชื่อมต่อ API
   TestApiConnection();
   
   // ตั้งเวลา Timer ตรวจสอบ
   EventSetTimer(InpCheckIntervalSec);
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   Print("🛑 Onicorn Auto-Journal EA (MT4) Stopped.");
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   CheckOrders();
}

//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
{
   CheckOrders();
}
//+------------------------------------------------------------------+
