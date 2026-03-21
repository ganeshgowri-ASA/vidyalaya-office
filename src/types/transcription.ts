// Types for Meeting Transcription Engine

export interface Speaker {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface TranscriptSegment {
  id: string;
  speakerId: string;
  speakerName: string;
  text: string;
  timestamp: number; // ms from start
  endTimestamp: number;
  confidence: number;
  language: string;
  isEdited: boolean;
  originalText?: string;
}

export interface TranscriptionSession {
  id: string;
  meetingId: string;
  meetingTitle: string;
  startedAt: string;
  endedAt?: string;
  status: 'idle' | 'recording' | 'paused' | 'completed' | 'processing';
  segments: TranscriptSegment[];
  speakers: Speaker[];
  language: string;
  duration: number;
  audioSource: 'microphone' | 'upload' | 'websocket';
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  fileSize: number;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  sessionId?: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  supported: boolean;
}

export interface TranscriptionConfig {
  language: string;
  enableDiarization: boolean;
  maxSpeakers: number;
  showCaptions: boolean;
  captionFontSize: 'small' | 'medium' | 'large';
  autoScroll: boolean;
  provider: 'browser' | 'deepgram' | 'assemblyai';
}

export interface WebSocketMessage {
  type: 'transcript' | 'speaker_change' | 'status' | 'error' | 'ping';
  payload: unknown;
  timestamp: number;
}
