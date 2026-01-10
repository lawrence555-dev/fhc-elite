export async function sendLineNotification(message: string) {
    const token = process.env.LINE_NOTIFY_TOKEN;
    if (!token) {
        console.warn("[Notification] Line Notify token not found. Skipping.");
        return false;
    }

    try {
        const response = await fetch("https://notify-api.line.me/api/notify", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Bearer ${token}`
            },
            body: new URLSearchParams({
                message: `\n[FHC-Elite 價值警報]\n${message}`
            })
        });

        return response.ok;
    } catch (error) {
        console.error("[Notification] Error sending Line message:", error);
        return false;
    }
}

export async function checkValueAlerts(stocks: any[]) {
    const alerts = [];
    for (const stock of stocks) {
        if (stock.pbPercentile < 15) {
            const msg = `🎯 標的：${stock.name} (${stock.id})\n📉 當前 P/B 之歷史分位：${stock.pbPercentile}%\n💡 評價：目前處於極度低估區間，具備高度安全邊際。`;
            const success = await sendLineNotification(msg);
            if (success) alerts.push(stock.id);
        }
    }
    return alerts;
}
