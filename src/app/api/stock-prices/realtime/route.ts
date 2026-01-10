import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Official TWSE After-hour Daily Last Prices (Stable public endpoint)
        const response = await fetch("https://oapi.twse.com.tw/v1/stock/afterhour_daily_last", {
            next: { revalidate: 300 } // Cache for 5 minutes
        });

        if (!response.ok) throw new Error("TWSE API unreachable");

        const data = await response.json();

        // FHC Stock IDs we care about
        const fhcIds = ["2880", "2881", "2882", "2883", "2884", "2885", "2886", "2887", "2889", "2890", "2891", "2892", "5880"];

        const filtered = data
            .filter((s: any) => fhcIds.includes(s.Code))
            .map((s: any) => ({
                id: s.Code,
                name: s.Name,
                price: parseFloat(s.ClosePrice),
                change: parseFloat(s.Change) || 0,
                volume: parseInt(s.TradeVolume),
                timestamp: new Date().toISOString()
            }));

        return NextResponse.json(filtered);
    } catch (error) {
        console.error("Stock Price API Error:", error);
        return NextResponse.json({ error: "Failed to fetch real-time data" }, { status: 500 });
    }
}
