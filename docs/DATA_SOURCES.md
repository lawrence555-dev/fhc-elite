# FHC-Elite 數據來源說明 (Data Sources)

## 📖 目錄
- [1. 股價數據 (Stock Prices)](#1-股價數據-stock-prices)
- [2. 財務指標與估值 (Financial Metrics)](#2-財務指標與估值-financial-metrics)
- [3. 籌碼異動 (Institutional Trades)](#3-籌碼異動-institutional-trades)
- [4. AI 文本分析 (AI Content)](#4-ai-文本分析-ai-content)

## 1. 股價數據 (Stock Prices)
- **來源**：台灣證券交易所 (TWSE) Open Data API。
- **更新頻率**：每個交易日 09:00 - 13:30 每 5 分鐘同步一次。
- **處理邏輯**：系統會自動過濾除權息波動，確保存量數據的連續性。

## 2. 財務指標與估值 (Financial Metrics)
- **來源**：各金控公司公開資訊觀測站 (MOPS) 之季度合併報表。
- **歷史區間**：回測 2021 - 2026 累計五年的日結數據。
- **計算公式**：`P/B 位階 = (當前 PB - 5年最低 PB) / (5年最高 PB - 5年最低 PB) * 100%`。

## 3. 籌碼異動 (Institutional Trades)
- **來源**：
  - 外資、投信、自營商買賣超資料 (TWSE)。
  - 八大公股行庫買賣超數據。
- **呈現維度**：每日近 15 個交易日之淨流入/流出趨勢。

## 4. AI 文本分析 (AI Content)
- **技術供應商**：Google Gemini 1.5 Pro API。
- **原始數據**：包含 Google News 金融分項、鉅亨網 (Anue) 實時新聞及各行官方法說會 PDF 簡報。
