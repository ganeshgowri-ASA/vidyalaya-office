# CLAUDE.md - Vidyalaya Office Development Guide

## Project Overview
Vidyalaya Office is an AI-Native Office Suite built with Next.js 14 App Router, Tailwind CSS, Zustand, and lucide-react icons. It uses CSS variables for theming (dark mode by default). Deployed on Vercel.

## Tech Stack
- **Framework**: Next.js 14 (App Router, `'use client'` components)
- **Styling**: Tailwind CSS + CSS variables (`var(--background)`, `var(--foreground)`, `var(--primary)`, `var(--border)`, `var(--sidebar)`, `var(--sidebar-accent)`, `var(--sidebar-foreground)`)
- **State**: Zustand stores in `src/store/`
- **Icons**: lucide-react (ONLY use icons from this package)
- **Types**: TypeScript strict mode

## Architecture
```
src/
  app/              # Next.js routes (each editor = folder with page.tsx)
    document/       # Word processor
    spreadsheet/    # Excel-like
    presentation/   # PowerPoint-like
    pdf/            # PDF tools
    graphics/       # NEW: Flowchart/Diagram editor
    email/          # NEW: Email client
    chat/           # NEW: Chat engine
  components/       # React components per module
    layout/         # sidebar.tsx, topbar.tsx, theme-provider.tsx
    document/       # Document editor components
    spreadsheet/    # Spreadsheet components
    presentation/   # Presentation components
    pdf/            # PDF components
    graphics/       # NEW: Graphics/Flowchart components
    email/          # NEW: Email components
    chat/           # NEW: Chat components
    shared/         # Shared components
    ai-chat/        # AI assistant
    collaboration/  # Collab features
    dashboard/      # Dashboard
  store/            # Zustand stores
  lib/              # Utilities (cn function from clsx+tailwind-merge)
  styles/           # Global styles
  types/            # TypeScript types
```

## Patterns to Follow
1. **Page pattern**: Each `page.tsx` is `'use client'` and imports a main editor component
2. **Component pattern**: Main editor component contains ribbon toolbar, canvas/content area, panels
3. **Theming**: Use `style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}` etc.
4. **Sidebar**: Navigation defined in `src/components/layout/sidebar.tsx` with arrays of nav items
5. **State**: Zustand with `create` from zustand, no persist needed for now

## Sidebar Structure (sidebar.tsx)
Add items to these arrays:
- `mainNav` - Dashboard, File Manager, Search
- `editorNav` - Document, Spreadsheet, Presentation, **Graphics** (NEW), PDF Tools
- `communicateNav` (NEW) - Email, Chat
- `manageNav` - Templates, Template Gallery, Review & Approval, Doc Control, Trash
- `bottomNav` - Profile, Settings, Help

New icons to import: `Workflow, Mail, MessageSquare`

## CRITICAL RULES
- NO new npm packages. Use only existing deps.
- All components must be `'use client'`
- Use `cn()` from `@/lib/utils` for conditional classes
- Follow existing dark theme - background is dark, text is light
- Every file must compile without errors
- Test with `npm run build` before committing

---

## SESSION PROMPTS FOR CLAUDE CODE IDE

### Session 1: Graphics & Flowchart Editor
**Branch**: `feat/graphics-flowchart-editor` (already exists, has page.tsx stub)
**Prompt**:
```
Read CLAUDE.md and Issue #42 for context. Working on branch feat/graphics-flowchart-editor.

Build a complete Graphics & Flowchart Editor at /graphics inspired by SmartDraw, Visio, Visme.

Create these files:
1. src/store/graphics-store.ts - Zustand store with: shapes[], connectors[], selectedIds[], activeTool, zoom, pan, gridVisible, snapEnabled, layers[], history (undo/redo)
2. src/components/graphics/graphics-editor.tsx - Main editor layout: left ShapePanel + center Canvas + right PropertiesPanel + top Toolbar
3. src/components/graphics/toolbar.tsx - Ribbon with tabs: Home (Select/Pan/Connector/Text/Clipboard), Insert (Shape/Image/TextBox/Table/Icons), Design (Themes/PageSize/Background/Grid), Arrange (Align/Distribute/Group/Order/Lock), Review, View (Zoom/Rulers/Grid/Snap/Layers)
4. src/components/graphics/shape-panel.tsx - Left panel with collapsible categories: Flowchart (Process/Decision/Terminal/Data/Document/Connector/Delay), UML (Class/Actor/UseCase), Network (Server/Router/Cloud/Database/Firewall), OrgChart (Person/Department), BPMN (StartEvent/Task/Gateway/Pool), Basic (Rect/Circle/Diamond/Triangle/Star/Arrow/Line). Each shape draggable onto canvas.
5. src/components/graphics/canvas.tsx - SVG-based canvas with: pan/zoom (mouse wheel + drag), grid overlay, shape rendering (rect/ellipse/polygon/path), connector rendering with arrowheads, selection handles, drag to move/resize, snap-to-grid, multi-select with Shift
6. src/components/graphics/properties-panel.tsx - Right panel showing properties of selected shape: fill color, border color/width/style, text content/font/size/color/align, shadow, opacity, rotation, size (W/H), position (X/Y). For connectors: line style, thickness, arrowhead type.
7. src/components/graphics/layers-panel.tsx - Layer list with visibility toggle, lock toggle, reorder
8. src/components/graphics/template-modal.tsx - Startup modal with template thumbnails: Flowchart, OrgChart, MindMap, NetworkDiagram, BPMN, UML, ERDiagram, Wireframe
9. Update src/app/graphics/page.tsx to import GraphicsEditor

Make sure all shapes render as actual SVG elements. Include 3-4 sample shapes on canvas by default. Canvas must support click-to-select, drag-to-move, and the toolbar must visually show active tool. Dark theme throughout using CSS variables.

Run npm run build to verify no errors.
```

### Session 2: Email Client
**Branch**: `feat/email-client` (create from main)
**Prompt**:
```
Read CLAUDE.md and Issue #42 for context. Create branch feat/email-client from main.

Build a complete Email Client at /email inspired by Gmail, Outlook, Superhuman.

Create these files:
1. src/store/email-store.ts - Zustand store with: emails[], selectedEmailId, selectedFolder, searchQuery, composeOpen, labels[], signatures[]. Pre-populate with 15+ realistic professional mock emails across different threads (project updates, meeting invites, client proposals, team standup, HR announcements, vendor quotes, etc.) with varied states (read/unread/starred/attachments).
2. src/components/email/email-client.tsx - Main layout: left EmailSidebar (200px) + middle InboxList (350px) + right EmailThread (remaining)
3. src/components/email/email-sidebar.tsx - Compose button (prominent), folders: Inbox (count), Starred, Sent, Drafts, Spam, Trash. Custom labels section with colored dots. Storage indicator at bottom.
4. src/components/email/inbox-list.tsx - Email list: each row has checkbox, star toggle, sender avatar (colored circle with initials), sender name, subject (bold if unread), preview text (truncated), date, attachment icon. Search bar at top. Sortable by date.
5. src/components/email/email-thread.tsx - Full thread view: subject header, thread messages in cards (sender avatar, name, date, expand/collapse, full HTML body, attachments as chips, reply/forward/more actions). AI summary button at top. Quick reply bar at bottom.
6. src/components/email/compose-modal.tsx - Floating modal: To/CC/BCC with chip inputs, Subject, Rich text body (toolbar with B/I/U/lists/link/attach/emoji), Signature dropdown, Send/Schedule/SaveDraft buttons, AI Draft button (sparkle icon), Tone selector (Professional/Casual/Friendly), Discard.
7. src/components/email/email-toolbar.tsx - Top bar: Archive, Delete, Move to, Label, Mark read/unread, Snooze, More actions.
8. src/app/email/page.tsx - Imports EmailClient

Make the mock data realistic with actual names, companies, subjects. Include 3-4 email threads with multiple messages. Dark theme using CSS variables.

Run npm run build to verify no errors.
```

### Session 3: Professional Chat Engine
**Branch**: `feat/chat-engine` (create from main)
**Prompt**:
```
Read CLAUDE.md and Issue #42 for context. Create branch feat/chat-engine from main.

Build a Professional Chat Engine at /chat inspired by WhatsApp Business, Slack, LinkedIn Messaging, Telegram.

Create these files:
1. src/store/chat-store.ts - Zustand store with: conversations[], activeConversationId, messages{}, currentUser, searchQuery, statusFilter. Pre-populate with 10 conversations: 4 direct messages (with realistic professional contacts including title/company), 3 group chats (Engineering Team, Product Launch, Design Review), 3 channels (#general, #announcements, #random). Each with 10-20 messages of varied types.
2. src/components/chat/chat-engine.tsx - Main layout: left ConversationList (300px) + center ChatWindow (remaining) + optional right ContactPanel (280px)
3. src/components/chat/conversation-list.tsx - Search bar, filter tabs (All/Unread/Groups/Channels), conversation items: avatar (colored circle or group icon), name, last message preview, timestamp, unread badge, online status dot (green/yellow/gray), typing indicator, pinned icon.
4. src/components/chat/chat-window.tsx - Header (contact name, status, video/audio call buttons, info button), scrollable message area, input bar at bottom. Date separators between messages.
5. src/components/chat/message-bubble.tsx - Sent (right, blue/purple) vs received (left, dark gray). Shows: text, timestamp, read receipts (single tick, double tick, blue double tick), reactions row, reply-to quote, file/image attachments, code blocks. Context menu: Reply, Forward, React, Copy, Edit, Delete.
6. src/components/chat/chat-input.tsx - Multi-line input with: @mention autocomplete, emoji picker button, attach file button, voice record button, send button. Formatting toolbar (B/I/U/strikethrough/code/quote). Typing indicator broadcasts.
7. src/components/chat/contact-panel.tsx - Right panel: large avatar, name, title, company, email, phone, status, shared files list, shared links, notification settings, block/report.
8. src/components/chat/channel-modal.tsx - Create/edit channel: name, description, public/private toggle, member selection.
9. src/app/chat/page.tsx - Imports ChatEngine

Make mock data very realistic with professional context. Include message types: text, code snippets, file shares, image placeholders, reactions. Show read receipts and online statuses. Dark theme using CSS variables.

Run npm run build to verify no errors.
```

### Session 4: Sidebar Update + Integration
**Branch**: `feat/sidebar-communicate` (create from main)
**Prompt**:
```
Read CLAUDE.md for context. Create branch feat/sidebar-communicate from main.

Update src/components/layout/sidebar.tsx to add:
1. Import Workflow, Mail, MessageSquare from lucide-react
2. Add { label: 'Graphics', href: '/graphics', icon: Workflow } to editorNav array (before PDF Tools)
3. Create new communicateNav array: [{ label: 'Email', href: '/email', icon: Mail }, { label: 'Chat', href: '/chat', icon: MessageSquare }]
4. Add NavSection for communicateNav with label="Communicate" between EDITORS and MANAGE sections, with a divider

Run npm run build to verify no errors.
```

### Session 5: Merge All Branches
**After all sessions pass build**, merge in this order:
1. `feat/sidebar-communicate` -> main
2. `feat/graphics-flowchart-editor` -> main (resolve sidebar conflicts by keeping Session 4 version)
3. `feat/email-client` -> main
4. `feat/chat-engine` -> main
5. Verify Vercel deployment succeeds
