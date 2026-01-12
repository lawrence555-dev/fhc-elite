import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Official TWSE Daily Prices (Includes live-ish data during market hours)
        const response = await fetch("https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL", {
            next: { revalidate: 60 } // Cache for 1 minute for "live" feel
        });

        if (!response.ok) {
            console.warn("TWSE API returned non-OK status.");
            return NextResponse.json([]);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.warn("TWSE API did not return JSON:", contentType);
            return NextResponse.json([]);
        }

        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.error("Failed to parse TWSE JSON:", e);
            return NextResponse.json([]);
        }

        if (!Array.isArray(data)) return NextResponse.json([]);

        // FHC Stock IDs we care about
        const fhcIds = ["2880", "2881", "2882", "2883", "2884", "2885", "2886", "2887", "2889", "2890", "2891", "2892", "5880"];

        const filtered = data
            .filter((s: any) => fhcIds.includes(s.Code))
            .map((s: any) => {
                const priceVal = parseFloat(s.ClosingPrice) || 0;
                const changeVal = parseFloat(s.Change) || 0;
                const prevClose = priceVal - changeVal;
                const pctChange = prevClose !== 0 ? (changeVal / prevClose) * 100 : 0;

                return {
                    id: s.Code,
                    name: s.Name,
                    price: priceVal,
                    diff: changeVal,
                    change: pctChange,
                    volume: parseInt(s.TradeVolume) || 0,
                    timestamp: new Date().toISOString()
                };
            });

        return NextResponse.json(filtered);
    } catch (error) {
        console.error("Stock Price API Error:", error);
        // Fallback to empty array instead of 500 to prevent frontend crash
        return NextResponse.json([]);
    }
}
