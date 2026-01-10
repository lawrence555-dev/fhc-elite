import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const FHC_STOCKS = [
    { id: "2881", name: "富邦金", category: "民營", bookValue: 64.5, dividendPolicy: 0.45 },
    { id: "2882", name: "國泰金", category: "民營", bookValue: 58.2, dividendPolicy: 0.40 },
    { id: "2886", name: "兆豐金", category: "官股", bookValue: 24.8, dividendPolicy: 0.85 },
    { id: "2891", name: "中信金", category: "民營", bookValue: 26.5, dividendPolicy: 0.55 },
    { id: "2884", name: "玉山金", category: "民營", bookValue: 15.4, dividendPolicy: 0.82 },
    { id: "2892", name: "第一金", category: "官股", bookValue: 19.5, dividendPolicy: 0.78 },
    { id: "2885", name: "元大金", category: "民營", bookValue: 25.8, dividendPolicy: 0.58 },
    { id: "2880", name: "華南金", category: "官股", bookValue: 18.6, dividendPolicy: 0.81 },
    { id: "5880", name: "合庫金", category: "官股", bookValue: 17.5, dividendPolicy: 0.84 },
    { id: "2887", name: "台新金", category: "民營", bookValue: 16.8, dividendPolicy: 0.52 },
    { id: "2890", name: "永豐金", category: "民營", bookValue: 19.8, dividendPolicy: 0.62 },
    { id: "2883", name: "開發金", category: "民營", bookValue: 14.2, dividendPolicy: 0.48 },
    { id: "2888", name: "新光金", category: "民營", bookValue: 15.8, dividendPolicy: 0.35 },
];

async function main() {
    console.log('🌱 Starting Seeding...');

    for (const fhc of FHC_STOCKS) {
        // Create/Update Stock Info
        const stock = await prisma.stock.upsert({
            where: { stockId: fhc.id },
            update: {
                name: fhc.name,
                category: fhc.category,
                bookValue: fhc.bookValue,
                dividendPolicy: fhc.dividendPolicy,
            },
            create: {
                stockId: fhc.id,
                name: fhc.name,
                category: fhc.category,
                bookValue: fhc.bookValue,
                dividendPolicy: fhc.dividendPolicy,
            },
        });

        // Generate 5 years of daily price data (Simplified)
        // In a real app we'd fetch this, but for Phase 2 we mock realistic data
        const now = new Date();
        const startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 5);

        console.log(`📊 Generating 5 years of historical data for ${fhc.name}...`);

        // We'll insert weekly snapshots to avoid bloating the DB for developer MVP
        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 7)) {
            const randomPrice = Number(fhc.bookValue) * (1.0 + (Math.random() - 0.2) * 1.5); // Mean P/B around 1.3

            await prisma.dailyPrice.create({
                data: {
                    stockId: fhc.id,
                    timestamp: new Date(d),
                    price: randomPrice,
                    volume: BigInt(Math.floor(Math.random() * 1000000)),
                }
            });
        }
    }

    console.log('✅ Seeding Completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
