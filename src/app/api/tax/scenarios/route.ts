import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId") || "default-user";

        const scenarios = await prisma.taxScenario.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(scenarios);
    } catch (error) {
        console.error("Failed to fetch tax scenarios:", error);
        return NextResponse.json({ error: "Failed to fetch tax scenarios" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, stockId, stockName, shares, price, dividend, totalDividend, netDividend, nhiPremium, taxCredit } = body;

        const newScenario = await prisma.taxScenario.create({
            data: {
                userId: userId || "default-user",
                stockId,
                stockName,
                shares,
                price,
                dividend,
                totalDividend,
                netDividend,
                nhiPremium,
                taxCredit
            }
        });

        return NextResponse.json(newScenario);
    } catch (error) {
        console.error("Failed to save tax scenario:", error);
        return NextResponse.json({ error: "Failed to save tax scenario" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Scenario ID is required" }, { status: 400 });
        }

        await prisma.taxScenario.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete tax scenario:", error);
        return NextResponse.json({ error: "Failed to delete tax scenario" }, { status: 500 });
    }
}
