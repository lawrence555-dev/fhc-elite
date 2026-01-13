# FHC-Elite 數據來源說明 (Data Sources)

## 📖 目錄
- [1. 股價數據 (Stock Prices)](#1-股價數據-stock-prices)
- [2. 財務指標與估值 (Financial Metrics)](#2-財務指標與估值-financial-metrics)
- [3. 籌碼異動 (Institutional Trades)](#3-籌碼異動-institutional-trades)
- [4. AI 文本分析 (AI Content)](#4-ai-文本分析-ai-content)

## 1. 股價數據 (Stock Prices)
- **來源**: Yahoo Finance API
  - 即時股價: `/v8/finance/chart/{symbol}?interval=5m&range=1d`
  - 財務數據: `/v10/finance/quoteSummary/{symbol}?modules=defaultKeyStatistics`
- **更新頻率**: 
  - 開盤期間：每 30 秒自動輪詢
  - 分時數據：每 5 分鐘寫入資料庫
- **資料處理**: 自動轉換為台北時間 (GMT+8)，僅顯示今日 09:00 後的點位

## 2. 財務指標與估值 (Financial Metrics)
- **P/B 數據來源**: Yahoo Finance Book Value (每股淨值)
- **計算方式**: P/B = 股價 / Book Value
- **位階計算**: 基於 0.8-2.5 的典型 P/B 範圍進行分段百分位數計算
- **更新頻率**: 隨股價即時更新

## 3. 籌碼異動 (Institutional Trades)
- **來源**：
  - 外資、投信、自營商買賣超資料 (TWSE)。
  - 八大公股行庫買賣超數據。
- **呈現維度**：每日近 15 個交易日之淨流入/流出趨勢。

## 4. AI 文本分析 (AI Content)
- **技術供應商**：Google Gemini 1.5 Pro API。
- **原始數據**：包含 Google News 金融分項、鉅亨網 (Anue) 實時新聞及各行官方法說會 PDF 簡報。
