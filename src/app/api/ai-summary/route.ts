import { NextResponse } from "next/server";
import { summarizeFhcNews } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { stockName, stockId, newsHeadlines } = await req.json();

        if (!stockName || !stockId) {
            return NextResponse.json({ error: "Missing stock information" }, { status: 400 });
        }

        // Default mock news if none provided
        const headlines = newsHeadlines || [
            `${stockName} 最新法說會公布去年獲利表現優異`,
            `外資對 ${stockName} 目標價調升`,
            `金融股近期受利率變動影響明顯`,
        ];

        const result = await summarizeFhcNews(stockName, stockId, headlines);
        return NextResponse.json(result);
    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
