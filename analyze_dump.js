import fs from 'fs';

try {
    const content = fs.readFileSync('finance_dump.html', 'utf8');

    // Pattern to find AF_initDataCallback
    // Note: The structure is usually AF_initDataCallback({key: '...', ...})
    const regex = /AF_initDataCallback\s*\(\s*({.*?})\s*\)\s*;/gs;
    let match;
    let count = 0;

    console.log("Starting analysis...");

    while ((match = regex.exec(content)) !== null) {
        count++;
        const fullMatch = match[0];
        const innerJson = match[1];

        // Extract Key
        const keyMatch = innerJson.match(/key:\s*'([^']+)'/);
        const key = keyMatch ? keyMatch[1] : "UNKNOWN";

        // Check size
        const size = fullMatch.length;

        console.log(`Key: ${key}, Payload Size: ${size} chars`);

        if (size > 2000) {
            console.log(`--- PREVIEW ${key} ---`);
            console.log(fullMatch.substring(0, 300));
            // Check for timestamps (17xxxxx)
            if (fullMatch.includes('1765')) {
                console.log("   *** Potential Time Series Data Found ***");
            }
        }
    }
    console.log(`Total callbacks found: ${count}`);

} catch (err) {
    console.error("Error:", err);
}
