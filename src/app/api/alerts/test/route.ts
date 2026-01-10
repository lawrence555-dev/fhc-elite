import { NextResponse } from "next/server";
import { sendLineNotification } from "@/lib/notifications";

export async function POST() {
    const success = await sendLineNotification("這是一則來自 FHC-Elite 的測試警報。如果您看到這則訊息，代表您的 Line Notify 排程已正確串接！");

    if (success) {
        return NextResponse.json({ message: "Test alert sent successfully" });
    } else {
        return NextResponse.json({ error: "Failed to send test alert. Check token." }, { status: 500 });
    }
}
