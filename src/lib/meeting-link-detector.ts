/**
 * Meeting Link Auto-Detection Utility
 * Detects and parses meeting links from text for all major platforms.
 */

export type MeetingPlatform = 'zoom' | 'teams' | 'meet' | 'webex' | 'vidyalaya' | 'gotomeeting' | 'bluejeans' | 'chime' | 'unknown';

export interface DetectedMeetingLink {
  platform: MeetingPlatform;
  url: string;
  meetingId?: string;
  password?: string;
  label: string;
  icon: string;
  confidence: number; // 0-100
}

const PLATFORM_PATTERNS: Array<{
  platform: MeetingPlatform;
  patterns: RegExp[];
  label: string;
  icon: string;
  extractId?: (match: RegExpMatchArray) => string | undefined;
  extractPassword?: (url: string) => string | undefined;
}> = [
  {
    platform: 'zoom',
    patterns: [
      /https?:\/\/(?:[\w-]+\.)?zoom\.us\/j\/(\d{9,11})(?:[?&]pwd=([A-Za-z0-9_-]+))?/gi,
      /https?:\/\/(?:[\w-]+\.)?zoom\.us\/meeting\/(?:join\/)?(\d{9,11})/gi,
    ],
    label: 'Zoom',
    icon: '🔵',
    extractId: (m) => m[1],
    extractPassword: (url) => url.match(/[?&]pwd=([A-Za-z0-9_-]+)/)?.[1],
  },
  {
    platform: 'teams',
    patterns: [
      /https?:\/\/teams\.microsoft\.com\/l\/meetup-join\/[^\s"<>]+/gi,
      /https?:\/\/teams\.live\.com\/meet\/[^\s"<>]+/gi,
    ],
    label: 'Microsoft Teams',
    icon: '🟣',
  },
  {
    platform: 'meet',
    patterns: [
      /https?:\/\/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/gi,
    ],
    label: 'Google Meet',
    icon: '🟢',
    extractId: (m) => m[1],
  },
  {
    platform: 'webex',
    patterns: [
      /https?:\/\/(?:[\w-]+\.)?webex\.com\/(?:meet|join)\/([^\s"<>?]+)/gi,
      /https?:\/\/(?:[\w-]+\.)?cisco\.webex\.com\/[^\s"<>]+/gi,
    ],
    label: 'Cisco Webex',
    icon: '🟠',
    extractId: (m) => m[1],
  },
  {
    platform: 'vidyalaya',
    patterns: [
      /https?:\/\/meet\.vidyalaya\.dev\/([^\s"<>?/]+)/gi,
      /meet\.vidyalaya\.dev\/([^\s"<>?/]+)/gi,
    ],
    label: 'Vidyalaya Meet',
    icon: '🎥',
    extractId: (m) => m[1],
  },
  {
    platform: 'gotomeeting',
    patterns: [
      /https?:\/\/(?:global\.)?gotomeeting\.com\/join\/(\d+)/gi,
    ],
    label: 'GoToMeeting',
    icon: '🔴',
    extractId: (m) => m[1],
  },
  {
    platform: 'bluejeans',
    patterns: [
      /https?:\/\/bluejeans\.com\/(\d+)/gi,
    ],
    label: 'BlueJeans',
    icon: '🔵',
    extractId: (m) => m[1],
  },
  {
    platform: 'chime',
    patterns: [
      /https?:\/\/chime\.aws\/(\d+)/gi,
    ],
    label: 'Amazon Chime',
    icon: '🟡',
    extractId: (m) => m[1],
  },
];

/**
 * Detect all meeting links in a given text.
 */
export function detectMeetingLinks(text: string): DetectedMeetingLink[] {
  const results: DetectedMeetingLink[] = [];
  const seen = new Set<string>();

  for (const platform of PLATFORM_PATTERNS) {
    for (const pattern of platform.patterns) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        const url = match[0];
        if (seen.has(url)) continue;
        seen.add(url);

        const meetingId = platform.extractId?.(match);
        const password = platform.extractPassword?.(url);

        results.push({
          platform: platform.platform,
          url,
          meetingId,
          password,
          label: platform.label,
          icon: platform.icon,
          confidence: 95,
        });
      }
    }
  }

  return results;
}

/**
 * Detect the first meeting link in text (for quick display).
 */
export function detectFirstMeetingLink(text: string): DetectedMeetingLink | null {
  const links = detectMeetingLinks(text);
  return links.length > 0 ? links[0] : null;
}

/**
 * Check if text contains any meeting link.
 */
export function hasMeetingLink(text: string): boolean {
  for (const platform of PLATFORM_PATTERNS) {
    for (const pattern of platform.patterns) {
      const regex = new RegExp(pattern.source, pattern.flags);
      if (regex.test(text)) return true;
    }
  }
  return false;
}

/**
 * Format a detected meeting link for display.
 */
export function formatMeetingLink(link: DetectedMeetingLink): string {
  const parts: string[] = [link.label];
  if (link.meetingId) parts.push(`ID: ${link.meetingId}`);
  if (link.password) parts.push(`Pass: ${link.password}`);
  return parts.join(' · ');
}

/**
 * Extract meeting links from calendar event descriptions.
 */
export function extractFromCalendarEvent(event: {
  description?: string;
  location?: string;
  body?: string;
}): DetectedMeetingLink[] {
  const text = [event.description, event.location, event.body]
    .filter(Boolean)
    .join('\n');
  return detectMeetingLinks(text);
}
