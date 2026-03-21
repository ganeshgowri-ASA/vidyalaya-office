'use client';

import TranscriptionEngine from '@/components/meetings/transcription/transcription-engine';
import { useRouter } from 'next/navigation';

export default function TranscriptionPage() {
  const router = useRouter();

  return (
    <div className="h-full" style={{ backgroundColor: 'var(--background)' }}>
      <TranscriptionEngine
        meetingTitle="Meeting Transcription"
        onBack={() => router.push('/meetings')}
      />
    </div>
  );
}
