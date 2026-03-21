'use client';

import { useState } from 'react';
import { X, Play, Heart, Star, Download, Share2, Tag } from 'lucide-react';
import { useTemplateGalleryStore, TEMPLATE_CATEGORIES } from '@/store/template-gallery-store';

export function TemplatePreviewModal() {
  const { previewTemplate, setPreviewTemplate, toggleFavorite, favoriteIds, rateTemplate } = useTemplateGalleryStore();
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  if (!previewTemplate) return null;

  const cat = TEMPLATE_CATEGORIES.find(c => c.id === previewTemplate.category);
  const color = cat?.color || '#3b82f6';
  const isFav = favoriteIds.includes(previewTemplate.id);

  const handleRate = (r: number) => {
    setUserRating(r);
    rateTemplate(previewTemplate.id, r);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewTemplate(null)} />
      <div
        className="relative z-10 w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* SVG Preview */}
        <div className="relative h-72 overflow-hidden" style={{ backgroundColor: `${color}08` }}>
          <svg viewBox="0 0 600 400" className="w-full h-full">
            <defs>
              <pattern id="preview-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke={color} strokeWidth="0.3" opacity="0.15" />
              </pattern>
            </defs>
            <rect width="600" height="400" fill={`url(#preview-grid)`} />
            {previewTemplate.shapes.map((shape, idx) => {
              const key = `preview-${idx}`;
              if (shape.type === 'ellipse') {
                return (
                  <g key={key}>
                    <ellipse
                      cx={shape.x + shape.width / 2}
                      cy={shape.y + shape.height / 2}
                      rx={shape.width / 2}
                      ry={shape.height / 2}
                      fill={shape.fill}
                      stroke={shape.stroke}
                      strokeWidth={shape.strokeWidth}
                      opacity={0.9}
                    />
                    <text x={shape.x + shape.width / 2} y={shape.y + shape.height / 2 + 5} textAnchor="middle" fill="white" fontSize="13" fontWeight="600">
                      {shape.label}
                    </text>
                  </g>
                );
              }
              if (shape.type === 'diamond') {
                const cx = shape.x + shape.width / 2;
                const cy = shape.y + shape.height / 2;
                return (
                  <g key={key}>
                    <polygon
                      points={`${cx},${shape.y} ${shape.x + shape.width},${cy} ${cx},${shape.y + shape.height} ${shape.x},${cy}`}
                      fill={shape.fill}
                      stroke={shape.stroke}
                      strokeWidth={shape.strokeWidth}
                      opacity={0.9}
                    />
                    <text x={cx} y={cy + 5} textAnchor="middle" fill="white" fontSize="12" fontWeight="600">
                      {shape.label}
                    </text>
                  </g>
                );
              }
              return (
                <g key={key}>
                  <rect
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    rx={8}
                    fill={shape.fill}
                    stroke={shape.stroke}
                    strokeWidth={shape.strokeWidth}
                    opacity={0.9}
                  />
                  <text x={shape.x + shape.width / 2} y={shape.y + shape.height / 2 + 5} textAnchor="middle" fill="white" fontSize="13" fontWeight="600">
                    {shape.label}
                  </text>
                </g>
              );
            })}
            {previewTemplate.shapes.length > 1 && previewTemplate.shapes.slice(0, -1).map((shape, idx) => {
              const next = previewTemplate.shapes[idx + 1];
              if (!next) return null;
              return (
                <line
                  key={`pline-${idx}`}
                  x1={shape.x + shape.width / 2} y1={shape.y + shape.height}
                  x2={next.x + next.width / 2} y2={next.y}
                  stroke={color} strokeWidth="2" opacity="0.4" strokeDasharray="5 4"
                />
              );
            })}
          </svg>

          {/* Category badge */}
          <div
            className="absolute top-3 left-3 rounded-lg px-2.5 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${color}dd`, color: 'white' }}
          >
            {cat?.name || previewTemplate.category}
          </div>
        </div>

        {/* Details */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--card-foreground)' }}>
                {previewTemplate.name}
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {previewTemplate.description}
              </p>
            </div>
            <button
              onClick={() => toggleFavorite(previewTemplate.id)}
              className="shrink-0 rounded-full p-2 border"
              style={{ borderColor: 'var(--border)' }}
            >
              <Heart size={18} fill={isFav ? '#ef4444' : 'transparent'} stroke={isFav ? '#ef4444' : 'var(--muted-foreground)'} />
            </button>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <Tag size={13} style={{ color: 'var(--muted-foreground)' }} />
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {previewTemplate.subcategory}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  size={14}
                  className="cursor-pointer transition-colors"
                  fill={(hoverRating || userRating || previewTemplate.rating) >= i ? '#f59e0b' : 'transparent'}
                  stroke={(hoverRating || userRating || previewTemplate.rating) >= i ? '#f59e0b' : 'var(--muted-foreground)'}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRate(i)}
                />
              ))}
              <span className="text-xs ml-1" style={{ color: 'var(--muted-foreground)' }}>
                {previewTemplate.rating.toFixed(1)} ({previewTemplate.ratingCount} reviews)
              </span>
            </div>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              by {previewTemplate.author}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {previewTemplate.tags.map(tag => (
              <span
                key={tag}
                className="rounded-full px-2 py-0.5 text-[10px]"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setPreviewTemplate(null)}
              className="flex-1 rounded-lg py-2.5 text-sm font-medium border"
              style={{ color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}
            >
              Close
            </button>
            <button
              className="flex items-center justify-center gap-1.5 rounded-lg py-2.5 px-4 text-sm font-medium border"
              style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}
            >
              <Download size={14} /> Export
            </button>
            <button
              className="flex items-center justify-center gap-1.5 rounded-lg py-2.5 px-4 text-sm font-medium border"
              style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}
            >
              <Share2 size={14} /> Share
            </button>
            <button
              onClick={() => {
                window.location.href = `/graphics?template=${encodeURIComponent(previewTemplate.id)}`;
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: color }}
            >
              <Play size={14} /> Use Template
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setPreviewTemplate(null)}
          className="absolute top-3 right-3 rounded-full p-1.5"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: 'white' }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
