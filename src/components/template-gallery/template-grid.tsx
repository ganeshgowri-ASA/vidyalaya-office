'use client';

import { Star, Heart, Eye, Play, Trash2 } from 'lucide-react';
import { useTemplateGalleryStore, TEMPLATE_CATEGORIES, type DiagramTemplate } from '@/store/template-gallery-store';

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(rating) ? '#f59e0b' : 'transparent'}
          stroke={i <= Math.round(rating) ? '#f59e0b' : 'var(--muted-foreground)'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function TemplateThumbnail({ template }: { template: DiagramTemplate }) {
  const cat = TEMPLATE_CATEGORIES.find(c => c.id === template.category);
  const color = cat?.color || '#3b82f6';

  return (
    <svg
      viewBox="0 0 600 400"
      className="w-full h-full"
      style={{ backgroundColor: `${color}08` }}
    >
      {/* Grid pattern */}
      <defs>
        <pattern id={`grid-${template.id}`} width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke={color} strokeWidth="0.3" opacity="0.15" />
        </pattern>
      </defs>
      <rect width="600" height="400" fill={`url(#grid-${template.id})`} />

      {/* Render shapes */}
      {template.shapes.map((shape, idx) => {
        const key = `${template.id}-shape-${idx}`;
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
                opacity={0.85}
              />
              <text
                x={shape.x + shape.width / 2}
                y={shape.y + shape.height / 2 + 4}
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="600"
              >
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
                opacity={0.85}
              />
              <text x={cx} y={cy + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="600">
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
              rx={6}
              fill={shape.fill}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
              opacity={0.85}
            />
            <text
              x={shape.x + shape.width / 2}
              y={shape.y + shape.height / 2 + 4}
              textAnchor="middle"
              fill="white"
              fontSize="11"
              fontWeight="600"
            >
              {shape.label}
            </text>
          </g>
        );
      })}

      {/* Connector lines between shapes */}
      {template.shapes.length > 1 && template.shapes.slice(0, -1).map((shape, idx) => {
        const next = template.shapes[idx + 1];
        if (!next) return null;
        const x1 = shape.x + shape.width / 2;
        const y1 = shape.y + shape.height;
        const x2 = next.x + next.width / 2;
        const y2 = next.y;
        return (
          <line
            key={`line-${template.id}-${idx}`}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={color}
            strokeWidth="1.5"
            opacity="0.4"
            strokeDasharray="4 3"
          />
        );
      })}
    </svg>
  );
}

function TemplateCard({ template }: { template: DiagramTemplate }) {
  const { setPreviewTemplate, toggleFavorite, favoriteIds, deleteCustomTemplate } = useTemplateGalleryStore();
  const cat = TEMPLATE_CATEGORIES.find(c => c.id === template.category);
  const color = cat?.color || '#3b82f6';
  const isFav = favoriteIds.includes(template.id);

  return (
    <div
      className="group rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:scale-[1.01]"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden">
        <TemplateThumbnail template={template} />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <button
            onClick={() => setPreviewTemplate(template)}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <Eye size={12} /> Preview
          </button>
          <button
            onClick={() => {
              // Navigate to graphics with template
              window.location.href = `/graphics?template=${encodeURIComponent(template.id)}`;
            }}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
            style={{ backgroundColor: color }}
          >
            <Play size={12} /> Use
          </button>
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(template.id); }}
          className="absolute top-2 right-2 rounded-full p-1.5 transition-all opacity-0 group-hover:opacity-100"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <Heart size={13} fill={isFav ? '#ef4444' : 'transparent'} stroke={isFav ? '#ef4444' : 'white'} />
        </button>

        {/* Category badge */}
        <div
          className="absolute top-2 left-2 rounded-md px-2 py-0.5 text-[10px] font-semibold"
          style={{ backgroundColor: `${color}dd`, color: 'white' }}
        >
          {cat?.name || template.category}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-1">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--card-foreground)' }}>
            {template.name}
          </p>
          {template.isCustom && (
            <button
              onClick={() => deleteCustomTemplate(template.id)}
              className="shrink-0 p-0.5 rounded hover:opacity-80"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
        <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: 'var(--muted-foreground)' }}>
          {template.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <StarRating rating={template.rating} size={10} />
            <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
              {template.rating.toFixed(1)} ({template.ratingCount})
            </span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${color}15`, color }}>
            {template.subcategory}
          </span>
        </div>
      </div>
    </div>
  );
}

function TemplateListRow({ template }: { template: DiagramTemplate }) {
  const { setPreviewTemplate, toggleFavorite, favoriteIds, deleteCustomTemplate } = useTemplateGalleryStore();
  const cat = TEMPLATE_CATEGORIES.find(c => c.id === template.category);
  const color = cat?.color || '#3b82f6';
  const isFav = favoriteIds.includes(template.id);

  return (
    <div
      className="flex items-center gap-4 px-4 py-3"
      style={{ borderColor: 'var(--border)' }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {template.thumbnail}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--card-foreground)' }}>
            {template.name}
          </p>
          {template.isCustom && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}>
              Custom
            </span>
          )}
        </div>
        <p className="text-[11px] truncate" style={{ color: 'var(--muted-foreground)' }}>
          {template.description}
        </p>
      </div>
      <div className="hidden md:flex items-center gap-1">
        <StarRating rating={template.rating} size={10} />
        <span className="text-[10px] ml-1" style={{ color: 'var(--muted-foreground)' }}>
          {template.rating.toFixed(1)}
        </span>
      </div>
      <span className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: `${color}15`, color }}>
        {cat?.name}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => toggleFavorite(template.id)}
          className="p-1.5 rounded-lg hover:opacity-80"
        >
          <Heart size={13} fill={isFav ? '#ef4444' : 'transparent'} stroke={isFav ? '#ef4444' : 'var(--muted-foreground)'} />
        </button>
        <button
          onClick={() => setPreviewTemplate(template)}
          className="p-1.5 rounded-lg hover:opacity-80"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <Eye size={13} />
        </button>
        <button
          onClick={() => { window.location.href = `/graphics?template=${encodeURIComponent(template.id)}`; }}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
          style={{ backgroundColor: color }}
        >
          Use
        </button>
        {template.isCustom && (
          <button
            onClick={() => deleteCustomTemplate(template.id)}
            className="p-1.5 rounded-lg hover:opacity-80"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

export function TemplateGrid() {
  const { viewMode, getFilteredTemplates } = useTemplateGalleryStore();
  const filtered = getFilteredTemplates();

  if (filtered.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center">
          <Star size={40} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>No templates found</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Try adjusting your search or category filters
          </p>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="rounded-xl border divide-y mx-4 my-2" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          {filtered.map((t) => (
            <TemplateListRow key={t.id} template={t} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>
    </div>
  );
}
