import re
import json

with open('finance_dump.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find AF_initDataCallback
pattern = re.compile(r"AF_initDataCallback\s*\(\s*({.*?})\s*\)\s*;", re.DOTALL)

matches = pattern.findall(content)

print(f"Found {len(matches)} callbacks.")

for match in matches:
    # Try to extract key and data length
    try:
        # We need to be careful as the inside might not be valid JSON due to single quotes or simple keys
        # Let's just Regex specifically for key and data
        key_match = re.search(r"key:\s*'([^']+)'", match)
        key = key_match.group(1) if key_match else "UNKNOWN"
        
        # approximate data size
        print(f"Key: {key}, Payload Size: {len(match)} chars")
        
        if len(match) > 1000:
             print(f"--- PREVIEW {key} ---")
             print(match[:200])
             # Check if it has time series like [176...]
             if "176" in match[:5000]: # simplistic check for epoch-ish numbers
                 print(f"   Possibility of timestamps.")

    except Exception as e:
        print(f"Error parsing: {e}")
