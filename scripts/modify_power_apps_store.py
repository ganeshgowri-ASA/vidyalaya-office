#!/usr/bin/env python3
"""Modify power-apps-store.ts to add desktop preview device and file attachment support."""

filepath = 'src/store/power-apps-store.ts'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Add 'desktop' to previewDevice type
content = content.replace(
    "  previewDevice: 'phone' | 'tablet';",
    "  previewDevice: 'phone' | 'tablet' | 'desktop';"
)

# 2. Update setPreviewDevice type
content = content.replace(
    "  setPreviewDevice: (device: 'phone' | 'tablet') => void;",
    "  setPreviewDevice: (device: 'phone' | 'tablet' | 'desktop') => void;"
)

with open(filepath, 'w') as f:
    f.write(content)

print("power-apps-store.ts modified successfully")
