//+------------------------------------------------------------------+
//|                                     Onicorn_AutoJournal_MT5.mq5  |
//|                        Copyright 2026, Onicorn Trade Dashboard   |
//|                                   https://onicorn-trade.pages.dev|
//+------------------------------------------------------------------+
#property copyright   "Copyright 2026, Onicorn Trade Dashboard"
#property link        "https://onicorn-trade.pages.dev"
#property version     "1.00"
#property description "EA สำหรับบันทึกออเดอร์ Forex & Gold เข้าสู่ Onicorn Trade Dashboard อัตโนมัติ (สำหรับ MetaTrader 5)"
#property description "เมื่อมีการเปิดไม้ แก้ไข หรือปิดไม้ในบัญชี MT5 จะทำการส่งข้อมูลไปยังระบบเว็บทันที"

//+------------------------------------------------------------------+
//| INPUT PARAMETERS (ค่าตัวแปรที่สามารถตั้งค่าได้ในหน้าต่าง Inputs)     |
//+------------------------------------------------------------------+
input group "=== บัญชีผู้ใช้ Onicorn Trade ===";
input string InpUsername         = "pattarawin";                        // 👤 Username บนเว็บ Onicorn Trade
input string InpApiToken         = "123456";                            // 🔑 รหัสผ่าน หรือ Token ของผู้ใช้
input string InpServerUrl        = "https://onicorn-trade.pages.dev/api/ea-sync"; // 🌐 Server API URL

input group "=== เงื่อนไขการบันทึกออเดอร์ ===";
input bool   InpTrackManual      = true;                                // 📱 บันทึกการเทรดมือ/มือถือ (Magic = 0)
input ulong  InpMagicFilter      = 0;                                   // 🎯 กรอง Magic Number (0 = บันทึกทั้งหมด)
input int    InpCheckIntervalSec = 3;                                   // ⏱️ ความถี่ตรวจเช็คออเดอร์ (วินาที)
input bool   InpDebugLog         = true;                                // 📝 แสดงข้อความแจ้งเตือนใน Experts Tab

//+------------------------------------------------------------------+
//| โครงสร้างจัดเก็บสถานะออเดอร์/โพซิชันเพื่อตรวจจับการเปลี่ยนแปลง         |
//+------------------------------------------------------------------+
struct TrackedPosition
{
   ulong    ticket;
   ulong    positionId;
   string   symbol;
   string   type;
   double   lots;
   double   openPrice;
   datetime openTime;
   double   sl;
   double   tp;
   ulong    magic;
   string   comment;
};

TrackedPosition g_trackedPositions[];

//+------------------------------------------------------------------+
//| แปลงเวลา datetime เป็น String รูปแบบ YYYY-MM-DD HH:MM:SS          |
//+------------------------------------------------------------------+
string FormatDateTime(datetime dt)
{
   MqlDateTime mdt;
   TimeToStruct(dt, mdt);
   return StringFormat("%04d-%02d-%02d %02d:%02d:%02d", 
                       mdt.year, mdt.mon, mdt.day, mdt.hour, mdt.min, mdt.sec);
}

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
      if(err == 4014 || err == 5203 || err == 4060)
      {
         Print("❌ [Onicorn MT5 Error]: WebRequest ไม่ได้รับอนุญาต กรุณาไปที่ Tools -> Options -> Expert Advisors และติ๊ก 'Allow WebRequest for listed URL' จากนั้นเพิ่ม: 'https://onicorn-trade.pages.dev'");
         Alert("⚠️ กรุณาอนุญาต WebRequest URL: https://onicorn-trade.pages.dev ใน MT5 Options");
      }
      else
      {
         Print("⚠️ [Onicorn MT5 Error]: WebRequest ล้มเหลว Code: ", err, " | URL: ", InpServerUrl);
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
      Print("✅ [Onicorn MT5 EA]: เชื่อมต่อกับ Onicorn Trade Dashboard สำเร็จเรียบร้อย!");
   }
   else
   {
      Print("⚠️ [Onicorn MT5 EA]: ยังไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบ Username, Token หรือ URL");
   }
}

//+------------------------------------------------------------------+
//| ฟังก์ชันส่งข้อมูลเมื่อมีการเปิดออเดอร์ (ORDER_OPEN)                   |
//+------------------------------------------------------------------+
void SendOrderOpen(ulong ticket, string symbol, string type, double lots, double openPrice, datetime openTime, double sl, double tp, ulong magic, string comment)
{
   int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   string timeStr = FormatDateTime(openTime);
   
   string json = "{"
      + "\"username\":\"" + InpUsername + "\","
      + "\"token\":\"" + InpApiToken + "\","
      + "\"event\":\"ORDER_OPEN\","
      + "\"platform\":\"MT5\","
      + "\"ticket\":" + IntegerToString(ticket) + ","
      + "\"symbol\":\"" + symbol + "\","
      + "\"order_type\":\"" + type + "\","
      + "\"lots\":" + DoubleToString(lots, 2) + ","
      + "\"open_price\":" + DoubleToString(openPrice, digits) + ","
      + "\"open_time\":\"" + timeStr + "\","
      + "\"sl\":" + (sl > 0 ? DoubleToString(sl, digits) : "null") + ","
      + "\"tp\":" + (tp > 0 ? DoubleToString(tp, digits) : "null") + ","
      + "\"magic\":" + IntegerToString(magic) + ","
      + "\"comment\":\"" + comment + "\""
      + "}";

   string res;
   if(SendJsonToApi(json, res))
   {
      Print("🚀 [Onicorn MT5]: บันทึกเปิดไม้สำเร็จ Ticket #", ticket, " [", type, " ", symbol, " ", DoubleToString(lots, 2), " Lot @ ", openPrice, "]");
   }
}

//+------------------------------------------------------------------+
//| ฟังก์ชันส่งข้อมูลเมื่อมีการแก้ไขออเดอร์ (ORDER_MODIFY)                 |
//+------------------------------------------------------------------+
void SendOrderModify(ulong ticket, string symbol, double sl, double tp)
{
   int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   string json = "{"
      + "\"username\":\"" + InpUsername + "\","
      + "\"token\":\"" + InpApiToken + "\","
      + "\"event\":\"ORDER_MODIFY\","
      + "\"platform\":\"MT5\","
      + "\"ticket\":" + IntegerToString(ticket) + ","
      + "\"symbol\":\"" + symbol + "\","
      + "\"sl\":" + (sl > 0 ? DoubleToString(sl, digits) : "null") + ","
      + "\"tp\":" + (tp > 0 ? DoubleToString(tp, digits) : "null")
      + "}";

   string res;
   SendJsonToApi(json, res);
}

//+------------------------------------------------------------------+
//| ฟังก์ชันส่งข้อมูลเมื่อออเดอร์ปิดแล้ว (ORDER_CLOSE)                    |
//+------------------------------------------------------------------+
void SendOrderClose(ulong ticket, string symbol, string type, double lots, double openPrice, datetime openTime, 
                    double closePrice, datetime closeTime, double profit, double swap, double commission, ulong magic, string comment)
{
   int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   string openTimeStr  = FormatDateTime(openTime);
   string closeTimeStr = FormatDateTime(closeTime);
   
   string json = "{"
      + "\"username\":\"" + InpUsername + "\","
      + "\"token\":\"" + InpApiToken + "\","
      + "\"event\":\"ORDER_CLOSE\","
      + "\"platform\":\"MT5\","
      + "\"ticket\":" + IntegerToString(ticket) + ","
      + "\"symbol\":\"" + symbol + "\","
      + "\"order_type\":\"" + type + "\","
      + "\"lots\":" + DoubleToString(lots, 2) + ","
      + "\"open_price\":" + DoubleToString(openPrice, digits) + ","
      + "\"open_time\":\"" + openTimeStr + "\","
      + "\"close_price\":" + DoubleToString(closePrice, digits) + ","
      + "\"close_time\":\"" + closeTimeStr + "\","
      + "\"profit\":" + DoubleToString(profit, 2) + ","
      + "\"swap\":" + DoubleToString(swap, 2) + ","
      + "\"commission\":" + DoubleToString(commission, 2) + ","
      + "\"magic\":" + IntegerToString(magic) + ","
      + "\"comment\":\"" + comment + "\""
      + "}";

   string res;
   if(SendJsonToApi(json, res))
   {
      double net = profit + swap + commission;
      Print("🏁 [Onicorn MT5]: บันทึกปิดไม้สำเร็จ Ticket #", ticket, " [Net PnL: ", (net >= 0 ? "+$" : "-$"), DoubleToString(MathAbs(net), 2), "]");
   }
}

//+------------------------------------------------------------------+
//| ตรวจสอบว่าออเดอร์ตรงตามเงื่อนไข Filter หรือไม่                       |
//+------------------------------------------------------------------+
bool IsPositionAllowed(ulong magic)
{
   if(magic == 0 && !InpTrackManual) return false;
   if(InpMagicFilter > 0 && magic != InpMagicFilter) return false;
   return true;
}

//+------------------------------------------------------------------+
//| ค้นหาโพซิชันในรายการ Tracked List โดยใช้ Position Identifier หรือ Ticket |
//+------------------------------------------------------------------+
int FindTrackedIndex(ulong ticket, ulong posId)
{
   for(int i = 0; i < ArraySize(g_trackedPositions); i++)
   {
      if(g_trackedPositions[i].ticket == ticket || 
        (posId > 0 && g_trackedPositions[i].positionId == posId))
      {
         return i;
      }
   }
   return -1;
}

//+------------------------------------------------------------------+
//| ตรวจเช็คสถานะโพซิชันปัจจุบันในพอร์ต MT5                             |
//+------------------------------------------------------------------+
void CheckPositions()
{
   ulong currentOpenTickets[];
   int total = PositionsTotal();
   
   for(int i = 0; i < total; i++)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      
      long type = PositionGetInteger(POSITION_TYPE);
      if(type != POSITION_TYPE_BUY && type != POSITION_TYPE_SELL) continue;
      
      ulong magic = (ulong)PositionGetInteger(POSITION_MAGIC);
      if(!IsPositionAllowed(magic)) continue;
      
      ulong posId = (ulong)PositionGetInteger(POSITION_IDENTIFIER);
      if(posId == 0) posId = ticket;
      
      // บันทึก Ticket ปัจจุบันไว้
      int size = ArraySize(currentOpenTickets);
      ArrayResize(currentOpenTickets, size + 1);
      currentOpenTickets[size] = ticket;
      
      string symbol    = PositionGetString(POSITION_SYMBOL);
      double lots      = PositionGetDouble(POSITION_VOLUME);
      double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
      datetime openTime = (datetime)PositionGetInteger(POSITION_TIME);
      double sl        = PositionGetDouble(POSITION_SL);
      double tp        = PositionGetDouble(POSITION_TP);
      string comment   = PositionGetString(POSITION_COMMENT);
      string typeStr   = (type == POSITION_TYPE_BUY ? "Buy" : "Sell");
      
      int idx = FindTrackedIndex(ticket, posId);
      
      if(idx == -1)
      {
         // ตรวจพบโพซิชันเปิดใหม่
         SendOrderOpen(ticket, symbol, typeStr, lots, openPrice, openTime, sl, tp, magic, comment);
         
         // เพิ่มเข้า Tracked List
         int tSize = ArraySize(g_trackedPositions);
         ArrayResize(g_trackedPositions, tSize + 1);
         g_trackedPositions[tSize].ticket     = ticket;
         g_trackedPositions[tSize].positionId = posId;
         g_trackedPositions[tSize].symbol     = symbol;
         g_trackedPositions[tSize].type       = typeStr;
         g_trackedPositions[tSize].lots       = lots;
         g_trackedPositions[tSize].openPrice  = openPrice;
         g_trackedPositions[tSize].openTime   = openTime;
         g_trackedPositions[tSize].sl         = sl;
         g_trackedPositions[tSize].tp         = tp;
         g_trackedPositions[tSize].magic      = magic;
         g_trackedPositions[tSize].comment    = comment;
      }
      else
      {
         // ตรวจสอบว่ามีการแก้ไข SL / TP หรือไม่
         double pt = SymbolInfoDouble(symbol, SYMBOL_POINT);
         if(pt <= 0) pt = 0.0001;
         
         if(MathAbs(g_trackedPositions[idx].sl - sl) > pt/2.0 || 
            MathAbs(g_trackedPositions[idx].tp - tp) > pt/2.0)
         {
            g_trackedPositions[idx].sl = sl;
            g_trackedPositions[idx].tp = tp;
            SendOrderModify(ticket, symbol, sl, tp);
         }
      }
   }
   
   // ตรวจสอบโพซิชันที่เคยเปิดอยู่ แต่ตอนนี้หายไปแล้ว (โพซิชันปิดแล้ว)
   for(int j = ArraySize(g_trackedPositions) - 1; j >= 0; j--)
   {
      ulong trackedTicket = g_trackedPositions[j].ticket;
      ulong trackedPosId  = g_trackedPositions[j].positionId;
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
         // ค้นหาข้อมูลปิดไม้จาก History Deal ของ MT5
         double closePrice = g_trackedPositions[j].openPrice;
         datetime closeTime = TimeCurrent();
         double profit = 0.0;
         double swap = 0.0;
         double commission = 0.0;
         bool dealFound = false;
         
         if(HistorySelectByPosition(trackedPosId > 0 ? trackedPosId : trackedTicket))
         {
            int dealsTotal = HistoryDealsTotal();
            for(int d = 0; d < dealsTotal; d++)
            {
               ulong dTicket = HistoryDealGetTicket(d);
               if(dTicket > 0)
               {
                  long dEntry = HistoryDealGetInteger(dTicket, DEAL_ENTRY);
                  if(dEntry == DEAL_ENTRY_OUT || dEntry == DEAL_ENTRY_INOUT || dEntry == DEAL_ENTRY_OUT_BY)
                  {
                     closePrice = HistoryDealGetDouble(dTicket, DEAL_PRICE);
                     closeTime  = (datetime)HistoryDealGetInteger(dTicket, DEAL_TIME);
                     dealFound  = true;
                  }
                  // รวมกำไร swap และ commission ทั้งหมดของ position นี้
                  profit     += HistoryDealGetDouble(dTicket, DEAL_PROFIT);
                  swap       += HistoryDealGetDouble(dTicket, DEAL_SWAP);
                  commission += HistoryDealGetDouble(dTicket, DEAL_COMMISSION);
               }
            }
         }
         
         SendOrderClose(trackedTicket, g_trackedPositions[j].symbol, g_trackedPositions[j].type, 
                        g_trackedPositions[j].lots, g_trackedPositions[j].openPrice, g_trackedPositions[j].openTime, 
                        closePrice, closeTime, profit, swap, commission, g_trackedPositions[j].magic, g_trackedPositions[j].comment);
         
         // ลบออกจาก Tracked List
         for(int m = j; m < ArraySize(g_trackedPositions) - 1; m++)
         {
            g_trackedPositions[m] = g_trackedPositions[m + 1];
         }
         ArrayResize(g_trackedPositions, ArraySize(g_trackedPositions) - 1);
      }
   }
}

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("=====================================================");
   Print("🚀 Onicorn Auto-Journal EA (MT5) Starting...");
   Print("👤 Username: ", InpUsername);
   Print("🌐 Target Server: ", InpServerUrl);
   Print("=====================================================");
   
   // โหลดออเดอร์/โพซิชันที่เปิดค้างอยู่ปัจจุบันเข้าสู่ Memory
   int total = PositionsTotal();
   for(int i = 0; i < total; i++)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      
      long type = PositionGetInteger(POSITION_TYPE);
      if(type != POSITION_TYPE_BUY && type != POSITION_TYPE_SELL) continue;
      
      ulong magic = (ulong)PositionGetInteger(POSITION_MAGIC);
      if(!IsPositionAllowed(magic)) continue;
      
      ulong posId = (ulong)PositionGetInteger(POSITION_IDENTIFIER);
      if(posId == 0) posId = ticket;
      
      int size = ArraySize(g_trackedPositions);
      ArrayResize(g_trackedPositions, size + 1);
      g_trackedPositions[size].ticket     = ticket;
      g_trackedPositions[size].positionId = posId;
      g_trackedPositions[size].symbol     = PositionGetString(POSITION_SYMBOL);
      g_trackedPositions[size].type       = (type == POSITION_TYPE_BUY ? "Buy" : "Sell");
      g_trackedPositions[size].lots       = PositionGetDouble(POSITION_VOLUME);
      g_trackedPositions[size].openPrice  = PositionGetDouble(POSITION_PRICE_OPEN);
      g_trackedPositions[size].openTime   = (datetime)PositionGetInteger(POSITION_TIME);
      g_trackedPositions[size].sl         = PositionGetDouble(POSITION_SL);
      g_trackedPositions[size].tp         = PositionGetDouble(POSITION_TP);
      g_trackedPositions[size].magic      = magic;
      g_trackedPositions[size].comment    = PositionGetString(POSITION_COMMENT);
   }
   
   Print("📊 ตรวจพบออเดอร์ที่กำลังถืออยู่ปัจจุบัน: ", ArraySize(g_trackedPositions), " ไม้");
   
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
   Print("🛑 Onicorn Auto-Journal EA (MT5) Stopped.");
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   CheckPositions();
}

//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
{
   CheckPositions();
}

//+------------------------------------------------------------------+
//| TradeTransaction function (ตรวจจับการซื้อขายทันทีใน MT5)           |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest &request,
                        const MqlTradeResult &result)
{
   // เมื่อมีธุรกรรมเกิดขึ้นบนพอร์ต ให้ตรวจสอบโพซิชันทันที
   if(trans.type == TRADE_TRANSACTION_DEAL_ADD || 
      trans.type == TRADE_TRANSACTION_ORDER_DELETE || 
      trans.type == TRADE_TRANSACTION_POSITION)
   {
      CheckPositions();
   }
}
//+------------------------------------------------------------------+
