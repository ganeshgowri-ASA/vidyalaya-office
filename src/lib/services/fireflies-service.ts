/**
 * Fireflies.ai GraphQL API Service
 * Docs: https://docs.fireflies.ai/graphql-api
 */

const FIREFLIES_API_URL = 'https://api.fireflies.ai/graphql';

interface FirefliesConfig {
  apiKey: string;
}

interface FirefliesTranscriptRaw {
  id: string;
  title: string;
  date: string;
  duration: number;
  organizer_email: string;
  participants: string[];
  sentences: {
    speaker_name: string;
    text: string;
    raw_text: string;
    start_time: number;
    end_time: number;
  }[];
  summary: {
    overview: string;
    action_items: string[];
    shorthand_bullet: string[];
    keywords: string[];
  };
  meeting_attendees: {
    displayName: string;
    email: string;
  }[];
}

interface FirefliesUser {
  user_id: string;
  email: string;
  name: string;
  integrations: string[];
  minutes_consumed: number;
}

export class FirefliesService {
  private apiKey: string;

  constructor(config: FirefliesConfig) {
    this.apiKey = config.apiKey;
  }

  private async graphqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const response = await fetch(FIREFLIES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`Fireflies API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    if (json.errors) {
      throw new Error(`Fireflies GraphQL error: ${json.errors[0].message}`);
    }

    return json.data;
  }

  async getTranscripts(limit = 20): Promise<FirefliesTranscriptRaw[]> {
    const query = `
      query Transcripts($limit: Int) {
        transcripts(limit: $limit) {
          id
          title
          date
          duration
          organizer_email
          participants
          sentences {
            speaker_name
            text
            raw_text
            start_time
            end_time
          }
          summary {
            overview
            action_items
            shorthand_bullet
            keywords
          }
          meeting_attendees {
            displayName
            email
          }
        }
      }
    `;
    const data = await this.graphqlRequest<{ transcripts: FirefliesTranscriptRaw[] }>(query, { limit });
    return data.transcripts;
  }

  async getTranscriptById(id: string): Promise<FirefliesTranscriptRaw> {
    const query = `
      query Transcript($id: String!) {
        transcript(id: $id) {
          id
          title
          date
          duration
          organizer_email
          participants
          sentences {
            speaker_name
            text
            raw_text
            start_time
            end_time
          }
          summary {
            overview
            action_items
            shorthand_bullet
            keywords
          }
          meeting_attendees {
            displayName
            email
          }
        }
      }
    `;
    const data = await this.graphqlRequest<{ transcript: FirefliesTranscriptRaw }>(query, { id });
    return data.transcript;
  }

  async getUserInfo(): Promise<FirefliesUser> {
    const query = `
      query User {
        user {
          user_id
          email
          name
          integrations
          minutes_consumed
        }
      }
    `;
    const data = await this.graphqlRequest<{ user: FirefliesUser }>(query);
    return data.user;
  }

  async searchTranscripts(keyword: string): Promise<FirefliesTranscriptRaw[]> {
    // Fireflies doesn't have a native search query in their GraphQL API,
    // so we fetch all and filter client-side
    const transcripts = await this.getTranscripts(50);
    const lower = keyword.toLowerCase();
    return transcripts.filter(
      (t) =>
        t.title.toLowerCase().includes(lower) ||
        t.sentences.some((s) => s.text.toLowerCase().includes(lower)) ||
        (t.summary.overview && t.summary.overview.toLowerCase().includes(lower))
    );
  }
}

export function createFirefliesService(apiKey: string): FirefliesService {
  return new FirefliesService({ apiKey });
}
