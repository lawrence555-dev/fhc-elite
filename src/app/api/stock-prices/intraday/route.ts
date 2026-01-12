import { NextResponse } from "next/server";
import { getIntradayPrices } from "@/lib/services/sync-service";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const stockId = searchParams.get("stockId");

        if (!stockId) {
            return NextResponse.json({ error: "Stock ID is required" }, { status: 400 });
        }

        const timeline = await getIntradayPrices(stockId);
        return NextResponse.json(timeline);
    } catch (error) {
        console.error("Intraday API Error:", error);
        return NextResponse.json({ error: "Failed to fetch intraday data" }, { status: 500 });
    }
}
