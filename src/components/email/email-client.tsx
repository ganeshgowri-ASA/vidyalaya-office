'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';

// ==================== TYPES ====================
interface Email {
  id: string;
  from: string;
  fromName: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  flagged: boolean;
  folder: string;
  labels: string[];
  attachments: Attachment[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  threadId?: string;
  replyTo?: string;
  signature?: string;
  scheduledAt?: string;
  readReceipt?: boolean;
  category: 'primary' | 'social' | 'promotions' | 'updates' | 'forums';
  retentionPolicy?: string;
  vaultDate?: string;
}

interface Attachment {
  name: string;
  size: string;
  type: string;
}

interface Folder {
  id: string;
  name: string;
  icon: string;
  count: number;
  color?: string;
  parentId?: string;
  isCustom?: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
}

interface Signature {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  department?: string;
  group: 'personal' | 'work' | 'company';
  avatar?: string;
}

interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  density: 'compact' | 'default' | 'comfortable';
  readingPane: 'right' | 'bottom' | 'off';
  highContrast: boolean;
  previewLines: 1 | 2 | 3;
}

interface FilterState {
  unreadOnly: boolean;
  hasAttachments: boolean;
  priority: string;
  dateFrom: string;
  dateTo: string;
  label: string;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  emailId: string | null;
}

interface AutoArchiveRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
}

// ==================== CONSTANTS ====================
const DEFAULT_FOLDERS: Folder[] = [
  { id: 'inbox', name: 'Inbox', icon: 'IN', count: 18 },
  { id: 'starred', name: 'Starred', icon: 'ST', count: 5 },
  { id: 'snoozed', name: 'Snoozed', icon: 'SN', count: 2 },
  { id: 'sent', name: 'Sent', icon: 'SE', count: 0 },
  { id: 'drafts', name: 'Drafts', icon: 'DR', count: 3 },
  { id: 'scheduled', name: 'Scheduled', icon: 'SC', count: 1 },
  { id: 'important', name: 'Important', icon: 'IM', count: 4 },
  { id: 'archive', name: 'Archive', icon: 'AR', count: 0 },
  { id: 'spam', name: 'Spam', icon: 'SP', count: 2 },
  { id: 'trash', name: 'Trash', icon: 'TR', count: 0 },
];

const VAULT_FOLDERS: Folder[] = [
  { id: 'vault-archived', name: 'Archived', icon: 'VA', count: 12 },
  { id: 'vault-legal', name: 'Legal Hold', icon: 'VL', count: 3 },
  { id: 'vault-compliance', name: 'Compliance', icon: 'VC', count: 7 },
  { id: 'vault-retention', name: 'Retention', icon: 'VR', count: 5 },
];

const CATEGORIES = [
  { id: 'primary', name: 'Primary', color: 'blue' },
  { id: 'social', name: 'Social', color: 'green' },
  { id: 'promotions', name: 'Promotions', color: 'yellow' },
  { id: 'updates', name: 'Updates', color: 'purple' },
  { id: 'forums', name: 'Forums', color: 'orange' },
];

const SIGNATURES: Signature[] = [
  {
    id: '1',
    name: 'Professional',
    content: 'Best regards,\nVidyalaya User\nSenior Developer\nPhone: +1 (555) 123-4567 | Email: user@vidyalaya.dev',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Casual',
    content: 'Cheers,\nVidyalaya User',
    isDefault: false,
  },
  {
    id: '3',
    name: 'Formal',
    content: 'Sincerely,\nVidyalaya User\nSenior Developer | Vidyalaya Technologies\nOffice: +1 (555) 123-4567 | Mobile: +1 (555) 987-6543\nwww.vidyalaya.dev',
    isDefault: false,
  },
];

const MOCK_CONTACTS: Contact[] = [
  { id: 'c1', name: 'Alice Johnson', email: 'alice@vidyalaya.dev', phone: '+1 555-0101', company: 'Vidyalaya', department: 'Engineering', group: 'work' },
  { id: 'c2', name: 'Bob Smith', email: 'bob@vidyalaya.dev', phone: '+1 555-0102', company: 'Vidyalaya', department: 'Design', group: 'work' },
  { id: 'c3', name: 'Carol White', email: 'carol@techcorp.com', phone: '+1 555-0103', company: 'TechCorp', department: 'Sales', group: 'company' },
  { id: 'c4', name: 'David Lee', email: 'david@startup.io', phone: '+1 555-0104', company: 'StartupIO', department: 'Product', group: 'company' },
  { id: 'c5', name: 'Emma Davis', email: 'emma.davis@gmail.com', phone: '+1 555-0105', group: 'personal' },
  { id: 'c6', name: 'Frank Miller', email: 'frank@vidyalaya.dev', phone: '+1 555-0106', company: 'Vidyalaya', department: 'HR', group: 'work' },
  { id: 'c7', name: 'Grace Chen', email: 'grace.chen@outlook.com', phone: '+1 555-0107', group: 'personal' },
  { id: 'c8', name: 'Henry Wilson', email: 'henry@partner.co', phone: '+1 555-0108', company: 'PartnerCo', department: 'Engineering', group: 'company' },
  { id: 'c9', name: 'Irene Taylor', email: 'irene@vidyalaya.dev', phone: '+1 555-0109', company: 'Vidyalaya', department: 'Marketing', group: 'work' },
  { id: 'c10', name: 'James Brown', email: 'james.b@yahoo.com', phone: '+1 555-0110', group: 'personal' },
];

const EMAIL_TEMPLATES: EmailTemplate[] = [
  { id: 't1', name: 'Follow-up', category: 'Business', subject: 'Following up on our conversation', body: 'Hi [Name],\n\nI wanted to follow up on our recent conversation regarding [topic]. I hope you had a chance to review the materials I shared.\n\nPlease let me know if you have any questions or if there\'s anything else I can help with.\n\nLooking forward to hearing from you.' },
  { id: 't2', name: 'Meeting Request', category: 'Business', subject: 'Meeting Request: [Topic]', body: 'Hi [Name],\n\nI would like to schedule a meeting to discuss [topic]. Could you please let me know your availability for this week?\n\nProposed times:\n- [Date/Time Option 1]\n- [Date/Time Option 2]\n- [Date/Time Option 3]\n\nPlease confirm which time works best for you.' },
  { id: 't3', name: 'Project Update', category: 'Business', subject: 'Project Update: [Project Name] - Week [X]', body: 'Hi Team,\n\nHere is the weekly project update:\n\nCompleted this week:\n- [Task 1]\n- [Task 2]\n\nIn Progress:\n- [Task 3]\n- [Task 4]\n\nBlockers:\n- [Blocker 1]\n\nNext Week Goals:\n- [Goal 1]\n- [Goal 2]\n\nPlease reach out if you have any questions.' },
  { id: 't4', name: 'Cold Outreach', category: 'Sales', subject: 'Quick question about [Company Name]', body: 'Hi [Name],\n\nI came across [Company Name] and was impressed by [specific detail]. I believe our product could help you with [specific benefit].\n\nWould you be open to a brief 15-minute call this week?\n\nBest regards,' },
  { id: 't5', name: 'Thank You', category: 'Business', subject: 'Thank you for [reason]', body: 'Hi [Name],\n\nThank you for taking the time to [specific action]. I really appreciate your help.\n\nPlease don\'t hesitate to reach out if you need anything.' },
];

const DEFAULT_AUTO_ARCHIVE_RULES: AutoArchiveRule[] = [
  { id: 'ar1', name: 'Old newsletters', condition: 'Label: newsletter, Older than 30 days', action: 'Move to Vault Archived', enabled: true },
  { id: 'ar2', name: 'Read promotions', condition: 'Category: Promotions, Read, Older than 14 days', action: 'Move to Vault Archived', enabled: false },
  { id: 'ar3', name: 'Completed threads', condition: 'Label: completed, Older than 60 days', action: 'Move to Vault Retention', enabled: true },
];

const MOCK_EMAILS: Email[] = [
  {
    id: '1', from: 'team@vidyalaya.dev', fromName: 'Project Team', to: 'user@vidyalaya.dev',
    cc: 'manager@vidyalaya.dev', subject: 'Sprint Planning - Q2 Objectives',
    body: 'Hi Team,\n\nPlease review the Q2 objectives and prepare your estimates for the upcoming sprint planning session.\n\nKey items:\n- Feature development roadmap\n- Performance optimization targets\n- User feedback integration\n\nBest regards,\nProject Lead',
    date: '2024-03-15 09:30', read: false, starred: true, flagged: true, folder: 'inbox',
    labels: ['work'], attachments: [{ name: 'sprint-plan.pdf', size: '2.4 MB', type: 'pdf' }],
    priority: 'high', threadId: 'th1', category: 'primary', readReceipt: true,
  },
  {
    id: '2', from: 'hr@vidyalaya.dev', fromName: 'HR Department', to: 'user@vidyalaya.dev',
    subject: 'Policy Update: Remote Work Guidelines',
    body: 'Dear Team,\n\nWe have updated our remote work policy effective April 1st. Please review the attached document and acknowledge receipt.\n\nKey changes:\n- Flexible hours from 7 AM to 7 PM\n- Mandatory camera-on for team meetings\n- Monthly in-office days: first Monday\n\nBest,\nHR Team',
    date: '2024-03-14 14:15', read: true, starred: false, flagged: false, folder: 'inbox',
    labels: ['hr'], attachments: [{ name: 'policy.pdf', size: '1.8 MB', type: 'pdf' }],
    priority: 'normal', threadId: 'th2', category: 'updates',
  },
  {
    id: '3', from: 'ci@github.com', fromName: 'GitHub Actions', to: 'user@vidyalaya.dev',
    subject: 'Build #482 Passed - main branch',
    body: 'All checks passed for commit abc123f on main branch.\n\nTests: 247 passed, 0 failed\nCoverage: 89.2%\nDeploy: staging.vidyalaya.dev',
    date: '2024-03-14 11:00', read: true, starred: false, flagged: false, folder: 'inbox',
    labels: ['dev'], attachments: [], priority: 'low', threadId: 'th3', category: 'updates',
  },
  {
    id: '4', from: 'user@vidyalaya.dev', fromName: 'You', to: 'client@company.com',
    cc: 'manager@vidyalaya.dev', subject: 'Re: Project Proposal - Phase 2',
    body: 'Hi,\n\nPlease find the updated proposal with revised timelines and budget estimates.\n\nHighlights:\n- Phase 2 delivery by Q3 2024\n- Budget: $150K (revised from $180K)\n- Team: 5 engineers + 1 designer',
    date: '2024-03-13 16:45', read: true, starred: false, flagged: false, folder: 'sent',
    labels: ['client'], attachments: [{ name: 'proposal-v2.docx', size: '3.2 MB', type: 'docx' }],
    priority: 'high', threadId: 'th4', category: 'primary',
  },
  {
    id: '5', from: 'newsletter@tech.io', fromName: 'Tech Weekly', to: 'user@vidyalaya.dev',
    subject: 'This Week in Tech: AI Advances',
    body: 'Top stories this week:\n\n1. New LLM benchmarks released\n2. Cloud computing trends for 2024\n3. Open source spotlight: Vidyalaya Office',
    date: '2024-03-13 08:00', read: false, starred: false, flagged: false, folder: 'inbox',
    labels: ['newsletter'], attachments: [], priority: 'low', threadId: 'th5', category: 'promotions',
  },
  {
    id: '6', from: 'ceo@vidyalaya.dev', fromName: 'CEO Office', to: 'all@vidyalaya.dev',
    subject: 'Company All-Hands: Q1 Results & Q2 Vision',
    body: 'Dear Team,\n\nPlease join us for our quarterly all-hands meeting.\n\nDate: March 20, 2024\nTime: 2:00 PM IST\nLink: meet.vidyalaya.dev/all-hands\n\nAgenda:\n- Q1 Revenue Results\n- Product Roadmap Q2\n- Team Achievements\n- Open Q&A',
    date: '2024-03-12 10:00', read: false, starred: true, flagged: true, folder: 'inbox',
    labels: ['company'], attachments: [{ name: 'q1-results.pptx', size: '5.1 MB', type: 'pptx' }],
    priority: 'urgent', threadId: 'th6', category: 'primary',
  },
  {
    id: '7', from: 'design@vidyalaya.dev', fromName: 'Design Team', to: 'user@vidyalaya.dev',
    subject: 'UI/UX Review: Email Module Mockups',
    body: 'Hi,\n\nThe email module mockups are ready for review. Please check the Figma link and provide feedback by EOD Friday.\n\nFigma: figma.com/vidyalaya-email\n\nKey screens:\n- Inbox view\n- Compose modal\n- Thread view\n- Settings page',
    date: '2024-03-11 15:30', read: true, starred: false, flagged: false, folder: 'inbox',
    labels: ['design'], attachments: [{ name: 'mockups.fig', size: '12.3 MB', type: 'fig' }],
    priority: 'normal', threadId: 'th7', category: 'primary',
  },
  {
    id: '8', from: 'linkedin@notifications.linkedin.com', fromName: 'LinkedIn', to: 'user@vidyalaya.dev',
    subject: '5 people viewed your profile this week',
    body: 'Your profile was viewed by:\n- Senior Recruiter at Google\n- CTO at StartupXYZ\n- Engineering Manager at Meta\n- VP Engineering at Stripe\n- Tech Lead at Vercel',
    date: '2024-03-11 09:00', read: true, starred: false, flagged: false, folder: 'inbox',
    labels: ['social'], attachments: [], priority: 'low', threadId: 'th8', category: 'social',
  },
];

// ==================== HELPER FUNCTIONS ====================
const getPriorityColor = (p: string) => {
  switch (p) {
    case 'urgent': return 'bg-red-600 text-white';
    case 'high': return 'bg-orange-500/20 text-orange-400';
    case 'normal': return 'bg-blue-500/20 text-blue-400';
    case 'low': return 'bg-gray-500/20 text-gray-400';
    default: return '';
  }
};

const getCategoryColor = (c: string) => {
  switch (c) {
    case 'primary': return 'border-blue-500';
    case 'social': return 'border-green-500';
    case 'promotions': return 'border-yellow-500';
    case 'updates': return 'border-purple-500';
    case 'forums': return 'border-orange-500';
    default: return 'border-transparent';
  }
};

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf': return '[PDF]';
    case 'docx': return '[DOC]';
    case 'pptx': return '[PPT]';
    case 'fig': return '[FIG]';
    default: return '[FILE]';
  }
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Yesterday';
  if (days < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getFontSize = (size: AccessibilitySettings['fontSize']) => {
  switch (size) {
    case 'small': return 'text-[10px]';
    case 'medium': return 'text-xs';
    case 'large': return 'text-sm';
    case 'xl': return 'text-base';
  }
};

const getDensityPadding = (density: AccessibilitySettings['density']) => {
  switch (density) {
    case 'compact': return 'py-1';
    case 'default': return 'py-2.5';
    case 'comfortable': return 'py-4';
  }
};

// ==================== COMPONENT ====================
export function EmailClient() {
  // Core state
  const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSignatures, setShowSignatures] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'split'>('split');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'sender'>('date');
  const [composeData, setComposeData] = useState({
    to: '', cc: '', bcc: '', subject: '', body: '', signature: SIGNATURES[0].content,
    scheduledAt: '', readReceipt: false, priority: 'normal' as string,
  });
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [grammarChecking, setGrammarChecking] = useState(false);

  // NEW: Address Book state
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [contacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [contactSearch, setContactSearch] = useState('');
  const [contactGroup, setContactGroup] = useState<'all' | 'personal' | 'work' | 'company'>('all');

  // NEW: Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, emailId: null });
  const [contextSubmenu, setContextSubmenu] = useState<string | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // NEW: Move-to-folder dropdown
  const [showMoveDropdown, setShowMoveDropdown] = useState(false);

  // NEW: Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    unreadOnly: false, hasAttachments: false, priority: 'all', dateFrom: '', dateTo: '', label: 'all',
  });

  // NEW: Accessibility settings
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [a11y, setA11y] = useState<AccessibilitySettings>({
    fontSize: 'medium', density: 'default', readingPane: 'right', highContrast: false, previewLines: 2,
  });

  // NEW: Custom folders
  const [customFolders, setCustomFolders] = useState<Folder[]>([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('blue');
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [folderContextMenu, setFolderContextMenu] = useState<{ visible: boolean; x: number; y: number; folderId: string | null }>({ visible: false, x: 0, y: 0, folderId: null });

  // NEW: Enterprise Vault state
  const [vaultSearch, setVaultSearch] = useState('');
  const [vaultDateFrom, setVaultDateFrom] = useState('');
  const [vaultDateTo, setVaultDateTo] = useState('');
  const [showAutoArchiveRules, setShowAutoArchiveRules] = useState(false);
  const [autoArchiveRules, setAutoArchiveRules] = useState<AutoArchiveRule[]>(DEFAULT_AUTO_ARCHIVE_RULES);

  const allFolders = useMemo(() => [...DEFAULT_FOLDERS, ...customFolders], [customFolders]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.unreadOnly) count++;
    if (filters.hasAttachments) count++;
    if (filters.priority !== 'all') count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.label !== 'all') count++;
    return count;
  }, [filters]);

  // Close context menu on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu({ visible: false, x: 0, y: 0, emailId: null });
        setContextSubmenu(null);
      }
      setFolderContextMenu({ visible: false, x: 0, y: 0, folderId: null });
      setShowMoveDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filtered & sorted emails
  const filteredEmails = useMemo(() => {
    let filtered = emails.filter(e => {
      const matchFolder = activeFolder === 'starred' ? e.starred
        : activeFolder === 'important' ? e.flagged
        : activeFolder === 'snoozed' ? false
        : activeFolder.startsWith('vault-') ? e.folder === activeFolder
        : e.folder === activeFolder;
      const matchSearch = searchQuery === '' ||
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.body.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = activeCategory === 'all' || e.category === activeCategory;
      // Advanced filters
      const matchUnread = !filters.unreadOnly || !e.read;
      const matchAttach = !filters.hasAttachments || e.attachments.length > 0;
      const matchPriority = filters.priority === 'all' || e.priority === filters.priority;
      const matchDateFrom = !filters.dateFrom || new Date(e.date) >= new Date(filters.dateFrom);
      const matchDateTo = !filters.dateTo || new Date(e.date) <= new Date(filters.dateTo);
      const matchLabel = filters.label === 'all' || e.labels.includes(filters.label);
      return matchFolder && matchSearch && matchCategory && matchUnread && matchAttach && matchPriority && matchDateFrom && matchDateTo && matchLabel;
    });
    filtered.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'priority') {
        const po: Record<string, number> = { urgent: 4, high: 3, normal: 2, low: 1 };
        return (po[b.priority] || 0) - (po[a.priority] || 0);
      }
      return a.fromName.localeCompare(b.fromName);
    });
    return filtered;
  }, [emails, activeFolder, searchQuery, activeCategory, sortBy, filters]);

  const unreadCount = useMemo(() => emails.filter(e => !e.read && e.folder === 'inbox').length, [emails]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchGroup = contactGroup === 'all' || c.group === contactGroup;
      const matchSearch = contactSearch === '' ||
        c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(contactSearch.toLowerCase());
      return matchGroup && matchSearch;
    });
  }, [contacts, contactGroup, contactSearch]);

  // Actions
  const toggleStar = useCallback((id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, starred: !e.starred } : e));
  }, []);

  const toggleFlag = useCallback((id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, flagged: !e.flagged } : e));
  }, []);

  const markRead = useCallback((id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
  }, []);

  const markUnread = useCallback((id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: false } : e));
  }, []);

  const moveToFolder = useCallback((id: string, folder: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, folder } : e));
    if (selectedEmail?.id === id) setSelectedEmail(null);
  }, [selectedEmail]);

  const toggleSelectEmail = useCallback((id: string) => {
    setSelectedEmails(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const selectAllEmails = useCallback(() => {
    if (selectedEmails.length === filteredEmails.length) setSelectedEmails([]);
    else setSelectedEmails(filteredEmails.map(e => e.id));
  }, [selectedEmails.length, filteredEmails]);

  const bulkAction = useCallback((action: string) => {
    if (action === 'read') setEmails(prev => prev.map(e => selectedEmails.includes(e.id) ? { ...e, read: true } : e));
    if (action === 'unread') setEmails(prev => prev.map(e => selectedEmails.includes(e.id) ? { ...e, read: false } : e));
    if (action === 'trash') setEmails(prev => prev.map(e => selectedEmails.includes(e.id) ? { ...e, folder: 'trash' } : e));
    if (action === 'archive') setEmails(prev => prev.map(e => selectedEmails.includes(e.id) ? { ...e, folder: 'archive' } : e));
    if (action === 'star') setEmails(prev => prev.map(e => selectedEmails.includes(e.id) ? { ...e, starred: true } : e));
    setSelectedEmails([]);
  }, [selectedEmails]);

  const applyTemplate = useCallback((template: EmailTemplate) => {
    setComposeData(prev => ({ ...prev, subject: template.subject, body: template.body }));
    setShowTemplates(false);
  }, []);

  const applySignature = useCallback((sig: Signature) => {
    setComposeData(prev => ({ ...prev, signature: sig.content }));
    setShowSignatures(false);
  }, []);

  const simulateAiDraft = useCallback(() => {
    setAiSuggestion('AI is composing a professional response based on the context...');
    setTimeout(() => {
      setAiSuggestion('');
      setComposeData(prev => ({
        ...prev,
        body: prev.body + '\n\nThank you for your message. I have reviewed the details and would like to schedule a follow-up discussion to align on next steps. Please let me know your availability this week.',
      }));
    }, 1500);
  }, []);

  const simulateGrammarCheck = useCallback(() => {
    setGrammarChecking(true);
    setTimeout(() => setGrammarChecking(false), 2000);
  }, []);

  const replyToEmail = useCallback((email: Email) => {
    setComposeData({
      to: email.from, cc: '', bcc: '', subject: `Re: ${email.subject}`,
      body: `\n\n---\nOn ${email.date}, ${email.fromName} wrote:\n${email.body}`,
      signature: SIGNATURES[0].content, scheduledAt: '', readReceipt: false, priority: 'normal',
    });
    setShowCompose(true);
  }, []);

  const forwardEmail = useCallback((email: Email) => {
    setComposeData({
      to: '', cc: '', bcc: '', subject: `Fwd: ${email.subject}`,
      body: `\n\n--- Forwarded Message ---\nFrom: ${email.fromName} <${email.from}>\nDate: ${email.date}\nSubject: ${email.subject}\n\n${email.body}`,
      signature: SIGNATURES[0].content, scheduledAt: '', readReceipt: false, priority: 'normal',
    });
    setShowCompose(true);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, emailId: string) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, emailId });
    setContextSubmenu(null);
  }, []);

  const addContactToCompose = useCallback((contact: Contact, field: 'to' | 'cc' | 'bcc') => {
    setComposeData(prev => {
      const current = prev[field];
      const newVal = current ? `${current}, ${contact.email}` : contact.email;
      return { ...prev, [field]: newVal };
    });
  }, []);

  const createCustomFolder = useCallback(() => {
    if (!newFolderName.trim()) return;
    const newFolder: Folder = {
      id: `custom-${Date.now()}`,
      name: newFolderName.trim(),
      icon: 'CF',
      count: 0,
      color: newFolderColor,
      isCustom: true,
    };
    setCustomFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setShowNewFolder(false);
  }, [newFolderName, newFolderColor]);

  const deleteCustomFolder = useCallback((folderId: string) => {
    setCustomFolders(prev => prev.filter(f => f.id !== folderId));
    if (activeFolder === folderId) setActiveFolder('inbox');
  }, [activeFolder]);

  const renameCustomFolder = useCallback((folderId: string, newName: string) => {
    setCustomFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: newName } : f));
    setEditingFolder(null);
  }, []);

  const recoverFromVault = useCallback((id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, folder: 'inbox' } : e));
    setSelectedEmail(null);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ unreadOnly: false, hasAttachments: false, priority: 'all', dateFrom: '', dateTo: '', label: 'all' });
  }, []);

  const toggleAutoArchiveRule = useCallback((ruleId: string) => {
    setAutoArchiveRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  }, []);

  const fontClass = getFontSize(a11y.fontSize);
  const densityClass = getDensityPadding(a11y.density);
  const highContrastBg = a11y.highContrast ? 'bg-black' : 'bg-[var(--bg-primary,#0a0f1a)]';
  const highContrastText = a11y.highContrast ? 'text-white' : 'text-[var(--text-primary,#e2e8f0)]';
  const highContrastBorder = a11y.highContrast ? 'border-white/30' : 'border-[var(--border-color,#334155)]';

  return (
    <div className={`flex flex-col h-full ${highContrastBg} ${highContrastText}`}>
      {/* ===== TOP RIBBON BAR ===== */}
      <div className={`flex items-center gap-2 px-4 py-2 border-b ${highContrastBorder} bg-[var(--bg-secondary,#111827)]`}>
        <h2 className="text-sm font-bold flex items-center gap-2">Email</h2>
        <div className={`flex items-center gap-1 px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] border ${highContrastBorder}`}>
          <span className="text-[10px] text-[var(--text-secondary,#94a3b8)]">Search</span>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search emails, contacts, subjects..."
            className="bg-transparent text-xs outline-none w-64 placeholder:text-[var(--text-secondary,#94a3b8)]" />
        </div>
        <div className="flex-1" />
        {/* Address Book toggle */}
        <button onClick={() => setShowAddressBook(!showAddressBook)}
          className={`px-2 py-1 rounded text-[10px] ${showAddressBook ? 'bg-blue-600/30 text-blue-400' : 'bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]'}`}>
          Contacts
        </button>
        {/* Filter toggle */}
        <button onClick={() => setShowFilters(!showFilters)}
          className={`px-2 py-1 rounded text-[10px] flex items-center gap-1 ${showFilters ? 'bg-blue-600/30 text-blue-400' : 'bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]'}`}>
          Filters {activeFilterCount > 0 && <span className="px-1 py-0 rounded-full bg-blue-600 text-white text-[8px]">{activeFilterCount}</span>}
        </button>
        {/* Accessibility */}
        <button onClick={() => setShowAccessibility(!showAccessibility)}
          className={`px-2 py-1 rounded text-[10px] ${showAccessibility ? 'bg-blue-600/30 text-blue-400' : 'bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]'}`}>
          Settings
        </button>
        {/* View & Sort controls */}
        <div className="flex items-center gap-1">
          <button onClick={() => setViewMode(viewMode === 'split' ? 'list' : 'split')}
            className="px-2 py-1 rounded text-[10px] bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]">
            {viewMode === 'split' ? 'List' : 'Split'}
          </button>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as 'date' | 'priority' | 'sender')}
            className={`px-2 py-1 rounded text-[10px] bg-[var(--bg-tertiary,#0f172a)] border ${highContrastBorder} ${highContrastText}`}>
            <option value="date">Sort: Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="sender">Sort: Sender</option>
          </select>
        </div>
        <button onClick={() => { setComposeData({ to: '', cc: '', bcc: '', subject: '', body: '', signature: SIGNATURES[0].content, scheduledAt: '', readReceipt: false, priority: 'normal' }); setShowCompose(true); }}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1">
          + Compose
        </button>
      </div>

      {/* ===== CATEGORY TABS (Gmail-style) ===== */}
      {activeFolder === 'inbox' && (
        <div className={`flex items-center gap-0 border-b ${highContrastBorder} bg-[var(--bg-secondary,#111827)]`}>
          <button onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 text-[10px] font-medium border-b-2 transition-colors ${activeCategory === 'all' ? 'border-blue-500 text-blue-400' : 'border-transparent text-[var(--text-secondary,#94a3b8)] hover:text-white'}`}>
            All Mail
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 text-[10px] font-medium border-b-2 transition-colors ${activeCategory === cat.id ? `border-${cat.color}-500 text-${cat.color}-400` : 'border-transparent text-[var(--text-secondary,#94a3b8)] hover:text-white'}`}>
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* ===== ADVANCED FILTER BAR ===== */}
      {showFilters && (
        <div className={`flex items-center gap-3 px-4 py-2 border-b ${highContrastBorder} bg-[var(--bg-secondary,#111827)]`}>
          <label className="flex items-center gap-1 text-[10px]">
            <input type="checkbox" checked={filters.unreadOnly} onChange={e => setFilters({ ...filters, unreadOnly: e.target.checked })} className="w-3 h-3" />
            Unread only
          </label>
          <label className="flex items-center gap-1 text-[10px]">
            <input type="checkbox" checked={filters.hasAttachments} onChange={e => setFilters({ ...filters, hasAttachments: e.target.checked })} className="w-3 h-3" />
            Has attachments
          </label>
          <select value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}
            className={`px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-tertiary,#0f172a)] border ${highContrastBorder} ${highContrastText}`}>
            <option value="all">All priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-[var(--text-secondary,#94a3b8)]">From:</span>
            <input type="date" value={filters.dateFrom} onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
              className={`px-1 py-0.5 rounded text-[10px] bg-[var(--bg-tertiary,#0f172a)] border ${highContrastBorder} ${highContrastText}`} />
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-[var(--text-secondary,#94a3b8)]">To:</span>
            <input type="date" value={filters.dateTo} onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
              className={`px-1 py-0.5 rounded text-[10px] bg-[var(--bg-tertiary,#0f172a)] border ${highContrastBorder} ${highContrastText}`} />
          </div>
          <select value={filters.label} onChange={e => setFilters({ ...filters, label: e.target.value })}
            className={`px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-tertiary,#0f172a)] border ${highContrastBorder} ${highContrastText}`}>
            <option value="all">All labels</option>
            {['work', 'hr', 'dev', 'client', 'newsletter', 'company', 'design', 'social'].map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <button onClick={clearFilters} className="px-2 py-0.5 rounded text-[10px] bg-red-600/20 hover:bg-red-600/30 text-red-400">
            Clear all
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* ===== FOLDERS SIDEBAR ===== */}
        <div className={`w-52 border-r ${highContrastBorder} bg-[var(--bg-secondary,#111827)] overflow-y-auto flex-shrink-0`}>
          <div className="p-2 space-y-0.5">
            {DEFAULT_FOLDERS.map(f => (
              <button key={f.id} onClick={() => { setActiveFolder(f.id); setSelectedEmail(null); setActiveCategory('all'); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${activeFolder === f.id ? 'bg-blue-600/20 text-blue-400 font-medium' : 'hover:bg-[var(--bg-hover,#334155)] text-[var(--text-secondary,#94a3b8)]'}`}>
                <span className="text-[9px] font-mono w-5">{f.icon}</span>
                <span className="flex-1 text-left">{f.name}</span>
                {f.id === 'inbox' && unreadCount > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-600/40 text-blue-300">{unreadCount}</span>}
                {f.count > 0 && f.id !== 'inbox' && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeFolder === f.id ? 'bg-blue-600/40' : 'bg-[var(--bg-tertiary,#0f172a)]'}`}>{f.count}</span>}
              </button>
            ))}
          </div>

          {/* Custom Folders */}
          <div className={`px-3 py-2 border-t ${highContrastBorder}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)] uppercase tracking-wider">Custom Folders</p>
              <button onClick={() => setShowNewFolder(true)} className="text-[10px] text-blue-400 hover:text-blue-300">+</button>
            </div>
            {showNewFolder && (
              <div className="flex items-center gap-1 mb-2">
                <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder name"
                  className={`flex-1 px-2 py-1 rounded text-[10px] bg-[var(--bg-tertiary,#0f172a)] border ${highContrastBorder} outline-none`}
                  onKeyDown={e => e.key === 'Enter' && createCustomFolder()} />
                <select value={newFolderColor} onChange={e => setNewFolderColor(e.target.value)}
                  className={`px-1 py-1 rounded text-[9px] bg-[var(--bg-tertiary,#0f172a)] border ${highContrastBorder}`}>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="red">Red</option>
                  <option value="purple">Purple</option>
                  <option value="orange">Orange</option>
                  <option value="pink">Pink</option>
                </select>
                <button onClick={createCustomFolder} className="text-[10px] text-green-400 hover:text-green-300 px-1">OK</button>
                <button onClick={() => { setShowNewFolder(false); setNewFolderName(''); }} className="text-[10px] text-red-400 hover:text-red-300 px-1">X</button>
              </div>
            )}
            {customFolders.map(f => (
              <div key={f.id} className="relative">
                <button onClick={() => { setActiveFolder(f.id); setSelectedEmail(null); }}
                  onContextMenu={(e) => { e.preventDefault(); setFolderContextMenu({ visible: true, x: e.clientX, y: e.clientY, folderId: f.id }); }}
                  className={`w-full flex items-center gap-2 py-1.5 px-2 rounded hover:bg-[var(--bg-hover,#334155)] text-xs cursor-pointer ${activeFolder === f.id ? 'bg-blue-600/20 text-blue-400' : 'text-[var(--text-secondary,#94a3b8)]'}`}>
                  <span className={`w-2 h-2 rounded-full bg-${f.color || 'blue'}-400`} />
                  {editingFolder === f.id ? (
                    <input autoFocus defaultValue={f.name}
                      onBlur={e => renameCustomFolder(f.id, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') renameCustomFolder(f.id, (e.target as HTMLInputElement).value); }}
                      className="flex-1 bg-transparent outline-none text-[10px]" />
                  ) : (
                    <span className="flex-1 text-left text-[10px]">{f.name}</span>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Labels */}
          <div className={`px-3 py-2 border-t ${highContrastBorder}`}>
            <p className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)] mb-2 uppercase tracking-wider">Labels</p>
            {['work', 'hr', 'dev', 'client', 'newsletter', 'company', 'design', 'social'].map(l => (
              <div key={l} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-[var(--bg-hover,#334155)] cursor-pointer">
                <span className={`w-2 h-2 rounded-full ${l === 'work' ? 'bg-blue-400' : l === 'hr' ? 'bg-green-400' : l === 'dev' ? 'bg-purple-400' : l === 'client' ? 'bg-orange-400' : l === 'company' ? 'bg-red-400' : l === 'design' ? 'bg-pink-400' : l === 'social' ? 'bg-cyan-400' : 'bg-gray-400'}`} />
                <span className="text-[10px] text-[var(--text-secondary,#94a3b8)] capitalize">{l}</span>
              </div>
            ))}
          </div>

          {/* Enterprise Vault */}
          <div className={`px-3 py-2 border-t ${highContrastBorder}`}>
            <p className="text-[10px] font-semibold text-amber-500/80 mb-2 uppercase tracking-wider">Enterprise Vault</p>
            {VAULT_FOLDERS.map(f => (
              <button key={f.id} onClick={() => { setActiveFolder(f.id); setSelectedEmail(null); setActiveCategory('all'); }}
                className={`w-full flex items-center gap-2 py-1.5 px-2 rounded text-[10px] transition-colors ${activeFolder === f.id ? 'bg-amber-600/20 text-amber-400 font-medium' : 'hover:bg-[var(--bg-hover,#334155)] text-[var(--text-secondary,#94a3b8)]'}`}>
                <span className="font-mono w-5 text-[9px]">{f.icon}</span>
                <span className="flex-1 text-left">{f.name}</span>
                <span className="text-[9px] px-1 py-0 rounded-full bg-[var(--bg-tertiary,#0f172a)]">{f.count}</span>
              </button>
            ))}
            {/* Vault Search */}
            <div className="mt-2 space-y-1">
              <input value={vaultSearch} onChange={e => setVaultSearch(e.target.value)} placeholder="Search vault..."
                className={`w-full px-2 py-1 rounded text-[9px] bg-[var(--bg-tertiary,#0f172a)] border ${highContrastBorder} outline-none`} />
              <div className="flex gap-1">
                <input type="date" value={vaultDateFrom} onChange={e => setVaultDateFrom(e.target.value)}
                  className={`flex-1 px-1 py-0.5 rounded text-[8px] bg-[var(--bg-tertiary,#0f172a)] border ${highContrastBorder}`} />
                <input type="date" value={vaultDateTo} onChange={e => setVaultDateTo(e.target.value)}
                  className={`flex-1 px-1 py-0.5 rounded text-[8px] bg-[var(--bg-tertiary,#0f172a)] border ${highContrastBorder}`} />
              </div>
            </div>
            <button onClick={() => setShowAutoArchiveRules(!showAutoArchiveRules)}
              className="w-full mt-2 px-2 py-1 rounded text-[9px] bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 text-left">
              Auto-Archive Rules
            </button>
          </div>

          {/* Storage indicator */}
          <div className={`px-3 py-2 border-t ${highContrastBorder}`}>
            <p className="text-[10px] text-[var(--text-secondary,#94a3b8)] mb-1">Storage</p>
            <div className="w-full h-1.5 bg-[var(--bg-tertiary,#0f172a)] rounded-full">
              <div className="w-1/3 h-full bg-blue-500 rounded-full" />
            </div>
            <p className="text-[9px] text-[var(--text-secondary,#94a3b8)] mt-1">2.4 GB of 15 GB used</p>
          </div>
        </div>

        {/* ===== EMAIL LIST ===== */}
        <div className={`${viewMode === 'split' ? 'w-96' : 'flex-1'} border-r ${highContrastBorder} overflow-y-auto flex-shrink-0`}>
          {/* Bulk action bar */}
          <div className={`flex items-center gap-2 px-3 py-1.5 border-b ${highContrastBorder} bg-[var(--bg-secondary,#111827)]`}>
            <input type="checkbox" checked={selectedEmails.length === filteredEmails.length && filteredEmails.length > 0}
              onChange={selectAllEmails} className="w-3 h-3 rounded" />
            {selectedEmails.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-blue-400">{selectedEmails.length} selected</span>
                <button onClick={() => bulkAction('read')} className="px-1.5 py-0.5 rounded text-[9px] bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]">Read</button>
                <button onClick={() => bulkAction('unread')} className="px-1.5 py-0.5 rounded text-[9px] bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]">Unread</button>
                <button onClick={() => bulkAction('archive')} className="px-1.5 py-0.5 rounded text-[9px] bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]">Archive</button>
                <button onClick={() => bulkAction('star')} className="px-1.5 py-0.5 rounded text-[9px] bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]">Star</button>
                <button onClick={() => bulkAction('trash')} className="px-1.5 py-0.5 rounded text-[9px] bg-red-600/20 hover:bg-red-600/40 text-red-400">Trash</button>
              </div>
            )}
            <div className="flex-1" />
            <span className="text-[10px] text-[var(--text-secondary,#94a3b8)]">{filteredEmails.length} emails</span>
          </div>

          {/* Email items */}
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[var(--text-secondary,#94a3b8)]">
              <p className="text-xs">No emails in this folder</p>
            </div>
          ) : filteredEmails.map(email => (
            <div key={email.id}
              onClick={() => { setSelectedEmail(email); markRead(email.id); }}
              onContextMenu={(e) => handleContextMenu(e, email.id)}
              className={`flex items-start gap-2 px-3 ${densityClass} border-b ${highContrastBorder} cursor-pointer transition-all border-l-[3px] ${getCategoryColor(email.category)} ${selectedEmail?.id === email.id ? 'bg-blue-600/10' : 'hover:bg-[var(--bg-hover,#334155)]'} ${!email.read ? 'bg-[var(--bg-tertiary,#0f172a)]' : ''}`}>
              <input type="checkbox" checked={selectedEmails.includes(email.id)}
                onChange={(e) => { e.stopPropagation(); toggleSelectEmail(email.id); }} className="w-3 h-3 mt-1 rounded flex-shrink-0" />
              <button onClick={(e) => { e.stopPropagation(); toggleStar(email.id); }} className="text-xs flex-shrink-0 mt-0.5">
                {email.starred ? '* ' : '  '}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                    {email.fromName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className={`${fontClass} truncate ${!email.read ? 'font-semibold text-white' : highContrastText}`}>{email.fromName}</span>
                      <span className="flex-1" />
                      <span className={`text-[9px] text-[var(--text-secondary,#94a3b8)] flex-shrink-0`}>{formatDate(email.date)}</span>
                    </div>
                    <p className={`text-[11px] truncate ${!email.read ? `font-medium ${highContrastText}` : 'text-[var(--text-secondary,#94a3b8)]'}`}>{email.subject}</p>
                    {a11y.previewLines >= 2 && (
                      <p className="text-[9px] text-[var(--text-secondary,#94a3b8)] truncate">{email.body.substring(0, 80)}...</p>
                    )}
                    <div className="flex items-center gap-1 mt-0.5">
                      {email.priority !== 'normal' && (
                        <span className={`text-[8px] px-1 py-0.5 rounded ${getPriorityColor(email.priority)}`}>{email.priority}</span>
                      )}
                      {email.flagged && <span className="text-[9px]">[!]</span>}
                      {email.attachments.length > 0 && <span className="text-[9px] text-[var(--text-secondary,#94a3b8)]">[Attach: {email.attachments.length}]</span>}
                      {email.readReceipt && <span className="text-[9px] text-green-400">RR</span>}
                      {email.retentionPolicy && <span className="text-[8px] px-1 py-0 rounded bg-amber-600/20 text-amber-400">{email.retentionPolicy}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== EMAIL VIEWER ===== */}
        {viewMode === 'split' && (
          <div className="flex-1 overflow-y-auto">
            {selectedEmail ? (
              <div className="p-4">
                {/* Action bar */}
                <div className={`flex items-center gap-2 mb-4 pb-3 border-b ${highContrastBorder}`}>
                  <button onClick={() => replyToEmail(selectedEmail)} className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-[10px]">Reply</button>
                  <button onClick={() => { setComposeData({ to: '', cc: selectedEmail.from, bcc: '', subject: `Re: ${selectedEmail.subject}`, body: '', signature: SIGNATURES[0].content, scheduledAt: '', readReceipt: false, priority: 'normal' }); setShowCompose(true); }}
                    className="px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)] text-[10px]">Reply All</button>
                  <button onClick={() => forwardEmail(selectedEmail)} className="px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)] text-[10px]">Forward</button>
                  {/* Move to folder dropdown */}
                  <div className="relative">
                    <button onClick={() => setShowMoveDropdown(!showMoveDropdown)}
                      className="px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)] text-[10px]">
                      Move to...
                    </button>
                    {showMoveDropdown && (
                      <div className={`absolute top-full left-0 mt-1 w-40 bg-[var(--bg-secondary,#111827)] border ${highContrastBorder} rounded-lg shadow-xl z-50 py-1 max-h-60 overflow-y-auto`}>
                        {allFolders.map(f => (
                          <button key={f.id} onClick={() => { moveToFolder(selectedEmail.id, f.id); setShowMoveDropdown(false); }}
                            className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[var(--bg-hover,#334155)] flex items-center gap-2">
                            <span className="font-mono text-[8px] w-5">{f.icon}</span>
                            {f.name}
                          </button>
                        ))}
                        {VAULT_FOLDERS.map(f => (
                          <button key={f.id} onClick={() => { moveToFolder(selectedEmail.id, f.id); setShowMoveDropdown(false); }}
                            className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[var(--bg-hover,#334155)] flex items-center gap-2 text-amber-400">
                            <span className="font-mono text-[8px] w-5">{f.icon}</span>
                            {f.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1" />
                  <button onClick={() => toggleFlag(selectedEmail.id)} className="px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)] text-[10px]">{selectedEmail.flagged ? 'Unflag' : 'Flag'}</button>
                  <button onClick={() => markUnread(selectedEmail.id)} className="px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)] text-[10px]">Unread</button>
                  <button onClick={() => moveToFolder(selectedEmail.id, 'archive')} className="px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)] text-[10px]">Archive</button>
                  {activeFolder.startsWith('vault-') && (
                    <button onClick={() => recoverFromVault(selectedEmail.id)} className="px-2 py-1 rounded bg-green-600/20 hover:bg-green-600/30 text-green-400 text-[10px]">Recover</button>
                  )}
                  <button onClick={() => moveToFolder(selectedEmail.id, 'trash')} className="px-2 py-1 rounded bg-red-600/20 hover:bg-red-600/40 text-red-400 text-[10px]">Delete</button>
                </div>

                {/* Email header */}
                <div className="mb-4">
                  <h3 className={`${a11y.fontSize === 'xl' ? 'text-xl' : a11y.fontSize === 'large' ? 'text-lg' : 'text-base'} font-semibold mb-2`}>{selectedEmail.subject}</h3>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {selectedEmail.fromName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{selectedEmail.fromName}</span>
                        <span className="text-[10px] text-[var(--text-secondary,#94a3b8)]">&lt;{selectedEmail.from}&gt;</span>
                        {/* Quick add contact button */}
                        <button onClick={() => setShowAddressBook(true)} className="text-[9px] text-blue-400 hover:text-blue-300">+ Add to Contacts</button>
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary,#94a3b8)]">
                        To: {selectedEmail.to}
                        {selectedEmail.cc && <span> | CC: {selectedEmail.cc}</span>}
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary,#94a3b8)] mt-0.5">{selectedEmail.date}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {selectedEmail.priority !== 'normal' && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${getPriorityColor(selectedEmail.priority)}`}>{selectedEmail.priority}</span>
                      )}
                      {selectedEmail.labels.map(l => (
                        <span key={l} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary,#0f172a)] text-[var(--text-secondary,#94a3b8)]">{l}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Retention Policy (if vault email) */}
                {selectedEmail.retentionPolicy && (
                  <div className={`mb-4 p-2 rounded-lg bg-amber-600/10 border border-amber-600/20 text-[10px] text-amber-400`}>
                    Retention Policy: {selectedEmail.retentionPolicy}
                    {selectedEmail.vaultDate && <span className="ml-2">| Archived: {selectedEmail.vaultDate}</span>}
                  </div>
                )}

                {/* Attachments */}
                {selectedEmail.attachments.length > 0 && (
                  <div className={`mb-4 p-3 rounded-lg bg-[var(--bg-secondary,#111827)] border ${highContrastBorder}`}>
                    <p className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)] mb-2">Attachments ({selectedEmail.attachments.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmail.attachments.map((a, i) => (
                        <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border ${highContrastBorder} hover:border-blue-500/50 cursor-pointer transition-colors`}>
                          <span className="text-[10px] font-mono">{getFileIcon(a.type)}</span>
                          <div>
                            <p className="text-[10px] font-medium">{a.name}</p>
                            <p className="text-[8px] text-[var(--text-secondary,#94a3b8)]">{a.size}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email body */}
                <div className={`prose prose-invert max-w-none ${fontClass === 'text-[10px]' ? 'text-xs' : fontClass === 'text-xs' ? 'text-sm' : fontClass === 'text-sm' ? 'text-base' : 'text-lg'} leading-relaxed whitespace-pre-wrap ${highContrastText}`}>
                  {selectedEmail.body}
                </div>

                {/* AI Quick Actions */}
                <div className="mt-6 p-3 rounded-lg bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20">
                  <p className="text-[10px] font-semibold text-purple-400 mb-2">AI Quick Actions</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button className="px-2 py-1 rounded text-[10px] bg-purple-600/20 hover:bg-purple-600/30 text-purple-300">Summarize</button>
                    <button onClick={() => replyToEmail(selectedEmail)} className="px-2 py-1 rounded text-[10px] bg-purple-600/20 hover:bg-purple-600/30 text-purple-300">Draft Reply</button>
                    <button className="px-2 py-1 rounded text-[10px] bg-purple-600/20 hover:bg-purple-600/30 text-purple-300">Extract Tasks</button>
                    <button className="px-2 py-1 rounded text-[10px] bg-purple-600/20 hover:bg-purple-600/30 text-purple-300">Extract Dates</button>
                    <button className="px-2 py-1 rounded text-[10px] bg-purple-600/20 hover:bg-purple-600/30 text-purple-300">Translate</button>
                    <button className="px-2 py-1 rounded text-[10px] bg-purple-600/20 hover:bg-purple-600/30 text-purple-300">Create Meeting</button>
                    <button className="px-2 py-1 rounded text-[10px] bg-purple-600/20 hover:bg-purple-600/30 text-purple-300">Add to Tasks</button>
                    <button className="px-2 py-1 rounded text-[10px] bg-purple-600/20 hover:bg-purple-600/30 text-purple-300">Sentiment</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary,#94a3b8)]">
                <p className="text-sm font-medium mt-4">Select an email to read</p>
                <p className="text-xs mt-1">Or compose a new message</p>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-[10px]">Keyboard shortcuts:</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary,#0f172a)]">C - Compose</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary,#0f172a)]">R - Reply</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary,#0f172a)]">E - Archive</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== ADDRESS BOOK PANEL ===== */}
        {showAddressBook && (
          <div className={`w-72 border-l ${highContrastBorder} bg-[var(--bg-secondary,#111827)] overflow-y-auto flex-shrink-0`}>
            <div className={`flex items-center justify-between p-3 border-b ${highContrastBorder}`}>
              <h3 className="text-xs font-semibold">Address Book</h3>
              <button onClick={() => setShowAddressBook(false)} className="text-[var(--text-secondary,#94a3b8)] hover:text-white text-sm">X</button>
            </div>
            <div className="p-2">
              <input value={contactSearch} onChange={e => setContactSearch(e.target.value)} placeholder="Search contacts..."
                className={`w-full px-2 py-1.5 rounded text-[10px] bg-[var(--bg-tertiary,#0f172a)] border ${highContrastBorder} outline-none mb-2`} />
              <div className="flex gap-1 mb-3">
                {(['all', 'personal', 'work', 'company'] as const).map(g => (
                  <button key={g} onClick={() => setContactGroup(g)}
                    className={`px-2 py-1 rounded text-[9px] capitalize ${contactGroup === g ? 'bg-blue-600/30 text-blue-400' : 'bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)] text-[var(--text-secondary,#94a3b8)]'}`}>
                    {g}
                  </button>
                ))}
              </div>
              <div className="space-y-1">
                {filteredContacts.map(c => (
                  <div key={c.id} className={`p-2 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border ${highContrastBorder} hover:border-blue-500/30 transition-colors`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${c.group === 'work' ? 'bg-blue-600' : c.group === 'company' ? 'bg-green-600' : 'bg-purple-600'}`}>
                        {c.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium truncate">{c.name}</p>
                        <p className="text-[9px] text-[var(--text-secondary,#94a3b8)] truncate">{c.email}</p>
                        {c.company && <p className="text-[8px] text-[var(--text-secondary,#94a3b8)]">{c.company} - {c.department}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1 mt-1.5">
                      <button onClick={() => { addContactToCompose(c, 'to'); if (!showCompose) setShowCompose(true); }}
                        className="px-1.5 py-0.5 rounded text-[8px] bg-blue-600/20 hover:bg-blue-600/30 text-blue-400">To</button>
                      <button onClick={() => { addContactToCompose(c, 'cc'); if (!showCompose) { setShowCompose(true); setShowCcBcc(true); } }}
                        className="px-1.5 py-0.5 rounded text-[8px] bg-[var(--bg-secondary,#111827)] hover:bg-[var(--bg-hover,#334155)]">CC</button>
                      <button onClick={() => { addContactToCompose(c, 'bcc'); if (!showCompose) { setShowCompose(true); setShowCcBcc(true); } }}
                        className="px-1.5 py-0.5 rounded text-[8px] bg-[var(--bg-secondary,#111827)] hover:bg-[var(--bg-hover,#334155)]">BCC</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== COMPOSE MODAL ===== */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
          <div className={`w-[560px] max-h-[90vh] bg-[var(--bg-secondary,#111827)] border ${highContrastBorder} rounded-xl shadow-2xl pointer-events-auto flex flex-col`}>
            <div className="flex items-center px-4 py-2 bg-[var(--bg-tertiary,#0f172a)] rounded-t-xl">
              <span className="text-xs font-semibold">New Message</span>
              <div className="flex-1" />
              <button onClick={() => setShowCompose(false)} className="text-[var(--text-secondary,#94a3b8)] hover:text-white text-sm">X</button>
            </div>
            <div className="flex flex-col gap-0 p-0 overflow-y-auto flex-1">
              <div className={`flex items-center border-b ${highContrastBorder} px-4 py-2`}>
                <span className="text-[10px] text-[var(--text-secondary,#94a3b8)] w-8">To</span>
                <input value={composeData.to} onChange={e => setComposeData({ ...composeData, to: e.target.value })}
                  placeholder="Recipients" className="flex-1 bg-transparent text-xs outline-none" />
                <button onClick={() => setShowCcBcc(!showCcBcc)} className="text-[9px] text-blue-400 hover:text-blue-300">CC/BCC</button>
              </div>
              {showCcBcc && (
                <>
                  <div className={`flex items-center border-b ${highContrastBorder} px-4 py-2`}>
                    <span className="text-[10px] text-[var(--text-secondary,#94a3b8)] w-8">CC</span>
                    <input value={composeData.cc} onChange={e => setComposeData({ ...composeData, cc: e.target.value })}
                      placeholder="CC recipients" className="flex-1 bg-transparent text-xs outline-none" />
                  </div>
                  <div className={`flex items-center border-b ${highContrastBorder} px-4 py-2`}>
                    <span className="text-[10px] text-[var(--text-secondary,#94a3b8)] w-8">BCC</span>
                    <input value={composeData.bcc} onChange={e => setComposeData({ ...composeData, bcc: e.target.value })}
                      placeholder="BCC recipients" className="flex-1 bg-transparent text-xs outline-none" />
                  </div>
                </>
              )}
              <div className={`flex items-center border-b ${highContrastBorder} px-4 py-2`}>
                <span className="text-[10px] text-[var(--text-secondary,#94a3b8)] w-8">Sub</span>
                <input value={composeData.subject} onChange={e => setComposeData({ ...composeData, subject: e.target.value })}
                  placeholder="Subject" className="flex-1 bg-transparent text-xs outline-none" />
                <select value={composeData.priority} onChange={e => setComposeData({ ...composeData, priority: e.target.value })}
                  className={`text-[9px] bg-transparent border ${highContrastBorder} rounded px-1 py-0.5 text-[var(--text-secondary,#94a3b8)]`}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <textarea value={composeData.body} onChange={e => setComposeData({ ...composeData, body: e.target.value })}
                placeholder="Write your message..." rows={8}
                className={`w-full px-4 py-3 bg-transparent text-xs resize-none outline-none border-b ${highContrastBorder}`} />
              {aiSuggestion && (
                <div className="px-4 py-2 text-[10px] text-purple-400 italic">{aiSuggestion}</div>
              )}
              <div className={`px-4 py-2 border-b ${highContrastBorder}`}>
                <p className="text-[9px] text-[var(--text-secondary,#94a3b8)] mb-1">Signature</p>
                <div className="text-[10px] text-[var(--text-secondary,#94a3b8)] whitespace-pre-wrap">{composeData.signature}</div>
              </div>
            </div>
            {showTemplates && (
              <div className={`mx-4 mb-2 max-h-48 overflow-y-auto rounded-lg border ${highContrastBorder} bg-[var(--bg-tertiary,#0f172a)]`}>
                <p className="px-3 py-1.5 text-[9px] font-semibold text-[var(--text-secondary,#94a3b8)] uppercase sticky top-0 bg-[var(--bg-tertiary,#0f172a)]">Email Templates</p>
                {EMAIL_TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => applyTemplate(t)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--bg-hover,#334155)] text-left">
                    <div>
                      <p className="text-[10px] font-medium">{t.name}</p>
                      <p className="text-[9px] text-[var(--text-secondary,#94a3b8)]">{t.category} - {t.subject.substring(0, 40)}...</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {showSignatures && (
              <div className={`mx-4 mb-2 rounded-lg border ${highContrastBorder} bg-[var(--bg-tertiary,#0f172a)]`}>
                {SIGNATURES.map(s => (
                  <button key={s.id} onClick={() => applySignature(s)}
                    className="w-full flex items-start gap-2 px-3 py-2 hover:bg-[var(--bg-hover,#334155)] text-left">
                    <div>
                      <p className="text-[10px] font-medium">{s.name} {s.isDefault && <span className="text-[8px] text-blue-400">(default)</span>}</p>
                      <p className="text-[9px] text-[var(--text-secondary,#94a3b8)] whitespace-pre-wrap">{s.content.substring(0, 60)}...</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {showSchedule && (
              <div className={`mx-4 mb-2 p-3 rounded-lg border ${highContrastBorder} bg-[var(--bg-tertiary,#0f172a)]`}>
                <p className="text-[10px] font-semibold mb-2">Schedule Send</p>
                <input type="datetime-local" value={composeData.scheduledAt}
                  onChange={e => setComposeData({ ...composeData, scheduledAt: e.target.value })}
                  className={`w-full px-2 py-1.5 rounded bg-[var(--bg-secondary,#111827)] border ${highContrastBorder} text-[10px]`} />
              </div>
            )}
            <div className={`flex items-center gap-1.5 px-4 py-2.5 border-t ${highContrastBorder} bg-[var(--bg-tertiary,#0f172a)] rounded-b-xl`}>
              <button onClick={simulateAiDraft} className="px-2 py-1 rounded bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-[9px]">AI Draft</button>
              <button onClick={simulateGrammarCheck} className={`px-2 py-1 rounded text-[9px] ${grammarChecking ? 'bg-yellow-600/20 text-yellow-300' : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'}`}>
                {grammarChecking ? 'Checking...' : 'Grammar'}
              </button>
              <button onClick={() => setShowTemplates(!showTemplates)} className="px-2 py-1 rounded bg-[var(--bg-secondary,#111827)] hover:bg-[var(--bg-hover,#334155)] text-[9px]">Templates</button>
              <button onClick={() => setShowSignatures(!showSignatures)} className="px-2 py-1 rounded bg-[var(--bg-secondary,#111827)] hover:bg-[var(--bg-hover,#334155)] text-[9px]">Signature</button>
              <button className="px-2 py-1 rounded bg-[var(--bg-secondary,#111827)] hover:bg-[var(--bg-hover,#334155)] text-[9px]">Attach</button>
              <div className="flex items-center gap-1 ml-0.5">
                <input type="checkbox" id="rr" checked={composeData.readReceipt}
                  onChange={e => setComposeData({ ...composeData, readReceipt: e.target.checked })} className="w-3 h-3" />
                <label htmlFor="rr" className="text-[9px] text-[var(--text-secondary,#94a3b8)]">Read receipt</label>
              </div>
              <div className="flex-1" />
              <button onClick={() => setShowSchedule(!showSchedule)} className="px-2 py-1 rounded bg-[var(--bg-secondary,#111827)] hover:bg-[var(--bg-hover,#334155)] text-[9px]">Schedule</button>
              <button onClick={() => setShowCompose(false)} className="px-3 py-1.5 rounded bg-[var(--bg-secondary,#111827)] hover:bg-[var(--bg-hover,#334155)] text-xs">Discard</button>
              <button onClick={() => setShowCompose(false)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium">
                {composeData.scheduledAt ? 'Schedule' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== RIGHT-CLICK CONTEXT MENU ===== */}
      {contextMenu.visible && contextMenu.emailId && (
        <div ref={contextMenuRef}
          style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 100 }}
          className={`w-48 bg-[var(--bg-secondary,#111827)] border ${highContrastBorder} rounded-lg shadow-xl py-1`}>
          <button onClick={() => { const em = emails.find(e => e.id === contextMenu.emailId); if (em) replyToEmail(em); setContextMenu({ visible: false, x: 0, y: 0, emailId: null }); }}
            className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[var(--bg-hover,#334155)]">Reply</button>
          <button onClick={() => { const em = emails.find(e => e.id === contextMenu.emailId); if (em) { setComposeData({ to: '', cc: em.from, bcc: '', subject: `Re: ${em.subject}`, body: '', signature: SIGNATURES[0].content, scheduledAt: '', readReceipt: false, priority: 'normal' }); setShowCompose(true); } setContextMenu({ visible: false, x: 0, y: 0, emailId: null }); }}
            className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[var(--bg-hover,#334155)]">Reply All</button>
          <button onClick={() => { const em = emails.find(e => e.id === contextMenu.emailId); if (em) forwardEmail(em); setContextMenu({ visible: false, x: 0, y: 0, emailId: null }); }}
            className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[var(--bg-hover,#334155)]">Forward</button>
          <div className={`my-1 border-t ${highContrastBorder}`} />
          {/* Move to submenu */}
          <div className="relative"
            onMouseEnter={() => setContextSubmenu('move')}
            onMouseLeave={() => setContextSubmenu(null)}>
            <button className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[var(--bg-hover,#334155)] flex items-center justify-between">
              Move to <span className="text-[8px]">&gt;</span>
            </button>
            {contextSubmenu === 'move' && (
              <div className={`absolute left-full top-0 w-40 bg-[var(--bg-secondary,#111827)] border ${highContrastBorder} rounded-lg shadow-xl py-1 max-h-48 overflow-y-auto`}>
                {allFolders.map(f => (
                  <button key={f.id} onClick={() => { if (contextMenu.emailId) moveToFolder(contextMenu.emailId, f.id); setContextMenu({ visible: false, x: 0, y: 0, emailId: null }); }}
                    className="w-full text-left px-3 py-1 text-[10px] hover:bg-[var(--bg-hover,#334155)]">{f.name}</button>
                ))}
              </div>
            )}
          </div>
          {/* Label submenu */}
          <div className="relative"
            onMouseEnter={() => setContextSubmenu('label')}
            onMouseLeave={() => setContextSubmenu(null)}>
            <button className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[var(--bg-hover,#334155)] flex items-center justify-between">
              Label <span className="text-[8px]">&gt;</span>
            </button>
            {contextSubmenu === 'label' && (
              <div className={`absolute left-full top-0 w-36 bg-[var(--bg-secondary,#111827)] border ${highContrastBorder} rounded-lg shadow-xl py-1`}>
                {['work', 'hr', 'dev', 'client', 'newsletter', 'company', 'design', 'social'].map(l => (
                  <button key={l} onClick={() => { if (contextMenu.emailId) setEmails(prev => prev.map(e => e.id === contextMenu.emailId ? { ...e, labels: e.labels.includes(l) ? e.labels.filter(x => x !== l) : [...e.labels, l] } : e)); setContextMenu({ visible: false, x: 0, y: 0, emailId: null }); }}
                    className="w-full text-left px-3 py-1 text-[10px] hover:bg-[var(--bg-hover,#334155)] capitalize">{l}</button>
                ))}
              </div>
            )}
          </div>
          <div className={`my-1 border-t ${highContrastBorder}`} />
          <button onClick={() => { if (contextMenu.emailId) { const em = emails.find(e => e.id === contextMenu.emailId); if (em && em.read) markUnread(contextMenu.emailId); else if (contextMenu.emailId) markRead(contextMenu.emailId); } setContextMenu({ visible: false, x: 0, y: 0, emailId: null }); }}
            className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[var(--bg-hover,#334155)]">Mark Read/Unread</button>
          <button onClick={() => { if (contextMenu.emailId) toggleStar(contextMenu.emailId); setContextMenu({ visible: false, x: 0, y: 0, emailId: null }); }}
            className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[var(--bg-hover,#334155)]">Star</button>
          <button onClick={() => { if (contextMenu.emailId) toggleFlag(contextMenu.emailId); setContextMenu({ visible: false, x: 0, y: 0, emailId: null }); }}
            className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[var(--bg-hover,#334155)]">Flag</button>
          <div className={`my-1 border-t ${highContrastBorder}`} />
          <button onClick={() => { if (contextMenu.emailId) moveToFolder(contextMenu.emailId, 'archive'); setContextMenu({ visible: false, x: 0, y: 0, emailId: null }); }}
            className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[var(--bg-hover,#334155)]">Archive</button>
          <button onClick={() => { if (contextMenu.emailId) moveToFolder(contextMenu.emailId, 'trash'); setContextMenu({ visible: false, x: 0, y: 0, emailId: null }); }}
            className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[var(--bg-hover,#334155)] text-red-400">Delete</button>
        </div>
      )}

      {/* ===== FOLDER CONTEXT MENU ===== */}
      {folderContextMenu.visible && folderContextMenu.folderId && (
        <div style={{ position: 'fixed', top: folderContextMenu.y, left: folderContextMenu.x, zIndex: 100 }}
          className={`w-36 bg-[var(--bg-secondary,#111827)] border ${highContrastBorder} rounded-lg shadow-xl py-1`}>
          <button onClick={() => { setEditingFolder(folderContextMenu.folderId); setFolderContextMenu({ visible: false, x: 0, y: 0, folderId: null }); }}
            className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[var(--bg-hover,#334155)]">Rename</button>
          <button onClick={() => { if (folderContextMenu.folderId) deleteCustomFolder(folderContextMenu.folderId); setFolderContextMenu({ visible: false, x: 0, y: 0, folderId: null }); }}
            className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[var(--bg-hover,#334155)] text-red-400">Delete</button>
        </div>
      )}

      {/* ===== ACCESSIBILITY SETTINGS PANEL ===== */}
      {showAccessibility && (
        <div className={`fixed right-0 top-0 h-full w-72 bg-[var(--bg-secondary,#111827)] border-l ${highContrastBorder} shadow-2xl z-50 flex flex-col`}>
          <div className={`flex items-center justify-between p-3 border-b ${highContrastBorder}`}>
            <h3 className="text-xs font-semibold">Display Settings</h3>
            <button onClick={() => setShowAccessibility(false)} className="text-[var(--text-secondary,#94a3b8)] hover:text-white text-sm">X</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            <div>
              <p className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)] mb-2 uppercase tracking-wider">Font Size</p>
              <div className="flex gap-1">
                {(['small', 'medium', 'large', 'xl'] as const).map(s => (
                  <button key={s} onClick={() => setA11y({ ...a11y, fontSize: s })}
                    className={`px-2 py-1 rounded text-[10px] capitalize ${a11y.fontSize === s ? 'bg-blue-600/30 text-blue-400' : 'bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)] mb-2 uppercase tracking-wider">Density</p>
              <div className="flex gap-1">
                {(['compact', 'default', 'comfortable'] as const).map(d => (
                  <button key={d} onClick={() => setA11y({ ...a11y, density: d })}
                    className={`px-2 py-1 rounded text-[10px] capitalize ${a11y.density === d ? 'bg-blue-600/30 text-blue-400' : 'bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)] mb-2 uppercase tracking-wider">Reading Pane</p>
              <div className="flex gap-1">
                {(['right', 'bottom', 'off'] as const).map(r => (
                  <button key={r} onClick={() => setA11y({ ...a11y, readingPane: r })}
                    className={`px-2 py-1 rounded text-[10px] capitalize ${a11y.readingPane === r ? 'bg-blue-600/30 text-blue-400' : 'bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-[10px]">
                <input type="checkbox" checked={a11y.highContrast} onChange={e => setA11y({ ...a11y, highContrast: e.target.checked })} className="w-3 h-3" />
                High Contrast Mode
              </label>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)] mb-2 uppercase tracking-wider">Preview Lines</p>
              <div className="flex gap-1">
                {([1, 2, 3] as const).map(n => (
                  <button key={n} onClick={() => setA11y({ ...a11y, previewLines: n })}
                    className={`px-3 py-1 rounded text-[10px] ${a11y.previewLines === n ? 'bg-blue-600/30 text-blue-400' : 'bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== AUTO-ARCHIVE RULES PANEL ===== */}
      {showAutoArchiveRules && (
        <div className={`fixed right-0 top-0 h-full w-80 bg-[var(--bg-secondary,#111827)] border-l ${highContrastBorder} shadow-2xl z-50 flex flex-col`}>
          <div className={`flex items-center justify-between p-3 border-b ${highContrastBorder}`}>
            <h3 className="text-xs font-semibold text-amber-400">Auto-Archive Rules</h3>
            <button onClick={() => setShowAutoArchiveRules(false)} className="text-[var(--text-secondary,#94a3b8)] hover:text-white text-sm">X</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {autoArchiveRules.map(rule => (
              <div key={rule.id} className={`p-3 rounded-lg border ${highContrastBorder} bg-[var(--bg-tertiary,#0f172a)]`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium">{rule.name}</span>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={rule.enabled} onChange={() => toggleAutoArchiveRule(rule.id)} className="w-3 h-3" />
                    <span className={`text-[9px] ${rule.enabled ? 'text-green-400' : 'text-[var(--text-secondary,#94a3b8)]'}`}>
                      {rule.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>
                <p className="text-[9px] text-[var(--text-secondary,#94a3b8)]">If: {rule.condition}</p>
                <p className="text-[9px] text-amber-400/70">Then: {rule.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== AI EMAIL ASSISTANT PANEL ===== */}
      {showAiPanel && (
        <div className={`fixed right-0 top-0 h-full w-80 bg-[var(--bg-secondary,#1e293b)] border-l ${highContrastBorder} shadow-2xl z-50 flex flex-col`}>
          <div className={`flex items-center justify-between p-3 border-b ${highContrastBorder}`}>
            <h3 className="text-sm font-semibold text-purple-400">AI Email Assistant</h3>
            <button onClick={() => setShowAiPanel(false)} className="text-[var(--text-secondary,#94a3b8)] hover:text-white">X</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary,#94a3b8)]">Quick Actions</p>
              <button onClick={() => { setShowCompose(true); setComposeData(prev => ({...prev, body: 'Dear Team,\n\nI hope this email finds you well. I wanted to follow up on our previous discussion regarding...\n\nBest regards'})); }} className={`w-full text-left px-3 py-2 rounded text-xs bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-600/20`}>Draft follow-up email</button>
              <button onClick={() => { setShowCompose(true); setComposeData(prev => ({...prev, subject: 'Meeting Request', body: 'Hi,\n\nI would like to schedule a meeting to discuss...\n\nPlease let me know your availability.\n\nBest regards'})); }} className={`w-full text-left px-3 py-2 rounded text-xs bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-600/20`}>Schedule meeting request</button>
              <button onClick={() => { setShowCompose(true); setComposeData(prev => ({...prev, subject: 'Project Update', body: 'Hi Team,\n\nHere is the weekly project update:\n\n1. Completed:\n2. In Progress:\n3. Blockers:\n4. Next Steps:\n\nRegards'})); }} className={`w-full text-left px-3 py-2 rounded text-xs bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-600/20`}>Generate project update</button>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary,#94a3b8)]">AI Analysis</p>
              <div className="px-3 py-2 rounded bg-[var(--bg-tertiary,#0f172a)] text-xs space-y-1">
                <div className="flex justify-between"><span className="text-[var(--text-secondary,#94a3b8)]">Unread emails</span><span className="text-blue-400 font-semibold">{emails.filter(e => !e.read).length}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary,#94a3b8)]">High priority</span><span className="text-red-400 font-semibold">{emails.filter(e => e.priority === 'high' || e.priority === 'urgent').length}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary,#94a3b8)]">Starred</span><span className="text-yellow-400 font-semibold">{emails.filter(e => e.starred).length}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary,#94a3b8)]">Total emails</span><span className="text-green-400 font-semibold">{emails.length}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
