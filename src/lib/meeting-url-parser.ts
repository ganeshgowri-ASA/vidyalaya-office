import { MeetingPlatform } from '@/store/meeting-bot-store';

export interface ParsedMeetingUrl {
  platform: MeetingPlatform;
  isValid: boolean;
  meetingId?: string;
  label: string;
  icon: string;
  color: string;
}

const PLATFORM_PATTERNS: {
  platform: MeetingPlatform;
  patterns: RegExp[];
  label: string;
  icon: string;
  color: string;
}[] = [
  {
    platform: 'zoom',
    patterns: [
      /zoom\.us\/j\/(\d+)/i,
      /zoom\.us\/my\/([a-zA-Z0-9._-]+)/i,
      /zoom\.us\/s\/(\d+)/i,
    ],
    label: 'Zoom',
    icon: '📹',
    color: '#2D8CFF',
  },
  {
    platform: 'gmeet',
    patterns: [
      /meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/i,
      /meet\.google\.com\/([a-zA-Z0-9_-]+)/i,
    ],
    label: 'Google Meet',
    icon: '🟢',
    color: '#00897B',
  },
  {
    platform: 'teams',
    patterns: [
      /teams\.microsoft\.com\/l\/meetup-join\/([a-zA-Z0-9%_-]+)/i,
      /teams\.microsoft\.com\/meet\/([a-zA-Z0-9_-]+)/i,
      /teams\.live\.com\/meet\/([a-zA-Z0-9_-]+)/i,
    ],
    label: 'Microsoft Teams',
    icon: '🟣',
    color: '#6264A7',
  },
  {
    platform: 'webex',
    patterns: [
      /webex\.com\/meet\/([a-zA-Z0-9._-]+)/i,
      /webex\.com\/join\/([a-zA-Z0-9._-]+)/i,
      /\.webex\.com\/([a-zA-Z0-9._-]+)/i,
    ],
    label: 'Webex',
    icon: '🔵',
    color: '#07C160',
  },
  {
    platform: 'vidyalaya',
    patterns: [
      /vidyalaya\.dev\/meet\/([a-zA-Z0-9_-]+)/i,
      /meet\.vidyalaya\.dev\/([a-zA-Z0-9_-]+)/i,
    ],
    label: 'Vidyalaya Meet',
    icon: '🟡',
    color: '#6366f1',
  },
];

export function parseMeetingUrl(url: string): ParsedMeetingUrl {
  const trimmed = url.trim();

  if (!trimmed) {
    return { platform: 'unknown', isValid: false, label: 'Unknown', icon: '❓', color: '#6b7280' };
  }

  for (const entry of PLATFORM_PATTERNS) {
    for (const pattern of entry.patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        return {
          platform: entry.platform,
          isValid: true,
          meetingId: match[1],
          label: entry.label,
          icon: entry.icon,
          color: entry.color,
        };
      }
    }
  }

  // Check if it looks like a URL at all
  const isUrl = /^https?:\/\//i.test(trimmed);

  return {
    platform: 'unknown',
    isValid: isUrl,
    label: isUrl ? 'Unknown Platform' : 'Invalid URL',
    icon: '❓',
    color: '#6b7280',
  };
}

export function getPlatformInfo(platform: MeetingPlatform): { label: string; icon: string; color: string } {
  const entry = PLATFORM_PATTERNS.find((p) => p.platform === platform);
  if (entry) {
    return { label: entry.label, icon: entry.icon, color: entry.color };
  }
  return { label: 'Unknown', icon: '❓', color: '#6b7280' };
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
