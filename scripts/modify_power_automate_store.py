#!/usr/bin/env python3
"""Modify power-automate-store.ts to add flow type filter, connector toggle, and template categories."""

import re

filepath = 'src/store/power-automate-store.ts'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Add flowType to Flow interface
content = content.replace(
    "  status: 'active' | 'inactive' | 'draft';",
    "  status: 'active' | 'inactive' | 'draft';\n  flowType: 'cloud' | 'desktop';"
)

# 2. Add flowType to sample flows
content = content.replace(
    "    status: 'active',\n    trigger: 'When a file is created in SharePoint',",
    "    status: 'active',\n    flowType: 'cloud',\n    trigger: 'When a file is created in SharePoint',"
)
content = content.replace(
    "    status: 'active',\n    trigger: 'When a form response is submitted',",
    "    status: 'active',\n    flowType: 'cloud',\n    trigger: 'When a form response is submitted',"
)
content = content.replace(
    "    status: 'active',\n    trigger: 'Scheduled - Daily at 6:00 AM',",
    "    status: 'active',\n    flowType: 'desktop',\n    trigger: 'Scheduled - Daily at 6:00 AM',"
)
content = content.replace(
    "    status: 'inactive',\n    trigger: 'When an issue is created',",
    "    status: 'inactive',\n    flowType: 'desktop',\n    trigger: 'When an issue is created',"
)
content = content.replace(
    "    status: 'draft',\n    trigger: 'Scheduled - Weekly on Monday',",
    "    status: 'draft',\n    flowType: 'cloud',\n    trigger: 'Scheduled - Weekly on Monday',"
)

# 3. Add flowTypeFilter and flowDetailId to state interface
content = content.replace(
    "  searchQuery: string;",
    "  flowTypeFilter: 'all' | 'cloud' | 'desktop';\n  flowDetailId: string | null;\n  searchQuery: string;"
)

# 4. Add setter actions to interface
content = content.replace(
    "  setSearchQuery: (query: string) => void;",
    "  setFlowTypeFilter: (filter: PowerAutomateState['flowTypeFilter']) => void;\n  setFlowDetailId: (id: string | null) => void;\n  toggleConnector: (id: string) => void;\n  setSearchQuery: (query: string) => void;"
)

# 5. Add initial state values
content = content.replace(
    "  searchQuery: '',",
    "  flowTypeFilter: 'all',\n  flowDetailId: null,\n  searchQuery: '',"
)

# 6. Add setter implementations
content = content.replace(
    "  setSearchQuery: (query) => set({ searchQuery: query }),",
    "  setFlowTypeFilter: (filter) => set({ flowTypeFilter: filter }),\n  setFlowDetailId: (id) => set({ flowDetailId: id }),\n  toggleConnector: (id) => set((s) => ({ connectors: s.connectors.map((c) => c.id === id ? { ...c, connected: !c.connected } : c) })),\n  setSearchQuery: (query) => set({ searchQuery: query }),"
)

with open(filepath, 'w') as f:
    f.write(content)

print("power-automate-store.ts modified successfully")
