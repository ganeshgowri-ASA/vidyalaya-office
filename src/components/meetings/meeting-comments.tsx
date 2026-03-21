'use client';

import React, { useState } from 'react';
import { useMeetingIntegrationsStore } from '@/store/meeting-integrations-store';
import { X, Send, SmilePlus, Trash2, Reply, MessageCircle } from 'lucide-react';

const QUICK_REACTIONS = ['👍', '❤️', '🎉', '🚀', '✅', '👀', '💡', '🙏'];

export default function MeetingComments({ meetingId, onClose }: { meetingId: string; onClose: () => void }) {
  const { comments, addComment, toggleReaction, deleteComment } = useMeetingIntegrationsStore();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);

  const meetingComments = comments.filter((c) => c.meetingId === meetingId);
  const topLevelComments = meetingComments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => meetingComments.filter((c) => c.parentId === parentId);

  const handleSubmit = () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    addComment(meetingId, trimmed, replyingTo);
    setNewComment('');
    setReplyingTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderComment = (comment: typeof comments[0], isReply = false) => {
    const replies = getReplies(comment.id);
    return (
      <div key={comment.id} className={`${isReply ? 'ml-8 mt-2' : 'mb-3'}`}>
        <div className="group rounded-lg p-2.5 border transition-colors hover:border-blue-500/30" style={{ backgroundColor: 'var(--card, #111827)', borderColor: 'var(--border)' }}>
          {/* Author */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white">
              {comment.userAvatar}
            </div>
            <span className="text-[11px] font-medium">{comment.userName}</span>
            <span className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>
              {new Date(comment.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex-1" />
            <div className="hidden group-hover:flex items-center gap-1">
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="p-1 rounded hover:bg-white/10"
                title="Reply"
              >
                <Reply size={10} />
              </button>
              <button
                onClick={() => setShowReactions(showReactions === comment.id ? null : comment.id)}
                className="p-1 rounded hover:bg-white/10"
                title="React"
              >
                <SmilePlus size={10} />
              </button>
              {comment.userId === 'u1' && (
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="p-1 rounded hover:bg-red-500/20 text-red-400"
                  title="Delete"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          </div>

          {/* Text */}
          <div className="text-[11px] leading-relaxed ml-8">{comment.text}</div>

          {/* Reactions */}
          {comment.reactions.length > 0 && (
            <div className="flex items-center gap-1 mt-2 ml-8">
              {comment.reactions.map((r) => (
                <button
                  key={r.emoji}
                  onClick={() => toggleReaction(comment.id, r.emoji, 'u1')}
                  className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border transition-colors ${
                    r.users.includes('u1') ? 'border-blue-500/50 bg-blue-500/10' : ''
                  }`}
                  style={{ borderColor: r.users.includes('u1') ? undefined : 'var(--border)' }}
                >
                  <span>{r.emoji}</span>
                  <span>{r.users.length}</span>
                </button>
              ))}
            </div>
          )}

          {/* Quick Reactions Picker */}
          {showReactions === comment.id && (
            <div className="flex items-center gap-1 mt-2 ml-8 p-1 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { toggleReaction(comment.id, emoji, 'u1'); setShowReactions(null); }}
                  className="p-1 rounded hover:bg-white/10 text-sm"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Replies */}
        {replies.map((reply) => renderComment(reply, true))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-blue-400" />
          <h3 className="text-sm font-semibold">Comments</h3>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
            {meetingComments.length}
          </span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
          <X size={14} />
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-3">
        {topLevelComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center" style={{ color: 'var(--muted-foreground)' }}>
            <MessageCircle size={24} className="mb-2 opacity-50" />
            <p className="text-[11px]">No comments yet. Start the discussion!</p>
          </div>
        ) : (
          topLevelComments.map((comment) => renderComment(comment))
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        {replyingTo && (
          <div className="flex items-center gap-2 mb-2 px-2 py-1 rounded text-[10px]" style={{ backgroundColor: 'var(--card, #111827)' }}>
            <Reply size={10} className="text-blue-400" />
            <span style={{ color: 'var(--muted-foreground)' }}>
              Replying to {comments.find((c) => c.id === replyingTo)?.userName}
            </span>
            <button onClick={() => setReplyingTo(null)} className="ml-auto">
              <X size={10} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card, #111827)' }}>
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={replyingTo ? 'Write a reply...' : 'Add a comment...'}
            className="flex-1 bg-transparent text-xs outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
