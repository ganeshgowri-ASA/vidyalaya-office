'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TranscriptSegment, WebSocketMessage } from '@/types/transcription';

interface UseTranscriptWebSocketOptions {
  url?: string;
  sessionId: string | null;
  enabled: boolean;
  onSegment?: (segment: TranscriptSegment) => void;
  onStatusChange?: (status: string) => void;
  onError?: (error: string) => void;
}

interface UseTranscriptWebSocketReturn {
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  send: (message: WebSocketMessage) => void;
  connect: () => void;
  disconnect: () => void;
  lastError: string | null;
}

export function useTranscriptWebSocket(
  options: UseTranscriptWebSocketOptions
): UseTranscriptWebSocketReturn {
  const { url, sessionId, enabled, onSegment, onStatusChange, onError } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] =
    useState<UseTranscriptWebSocketReturn['connectionState']>('disconnected');
  const [lastError, setLastError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.onopen = null;
      if (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!enabled || !sessionId) return;

    // Default WebSocket URL (production would use wss://)
    const wsUrl = url || `ws://localhost:3001/ws/transcription/${sessionId}`;

    cleanup();
    setConnectionState('connecting');
    setLastError(null);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionState('connected');
        reconnectAttempts.current = 0;
        onStatusChange?.('connected');
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'transcript':
              if (onSegment) {
                onSegment(message.payload as TranscriptSegment);
              }
              break;
            case 'status':
              onStatusChange?.(message.payload as string);
              break;
            case 'error':
              const errorMsg = (message.payload as { message?: string })?.message || 'Unknown error';
              setLastError(errorMsg);
              onError?.(errorMsg);
              break;
            case 'ping':
              // Respond with pong
              send({ type: 'ping', payload: 'pong', timestamp: Date.now() });
              break;
          }
        } catch {
          // Non-JSON message, ignore
        }
      };

      ws.onerror = () => {
        setConnectionState('error');
        setLastError('WebSocket connection error');
        onError?.('WebSocket connection error');
      };

      ws.onclose = () => {
        setIsConnected(false);
        setConnectionState('disconnected');
        onStatusChange?.('disconnected');

        // Auto-reconnect with exponential backoff
        if (enabled && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch {
      setConnectionState('error');
      setLastError('Failed to create WebSocket connection');
    }
  }, [enabled, sessionId, url, cleanup, onSegment, onStatusChange, onError]);

  const disconnect = useCallback(() => {
    reconnectAttempts.current = maxReconnectAttempts; // prevent reconnect
    cleanup();
    setIsConnected(false);
    setConnectionState('disconnected');
  }, [cleanup]);

  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isConnected,
    connectionState,
    send,
    connect,
    disconnect,
    lastError,
  };
}
