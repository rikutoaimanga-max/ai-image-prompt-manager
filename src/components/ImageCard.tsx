import React from 'react';
import { Copy } from 'lucide-react';
import type { AIImageEntry } from '../lib/types';

interface ImageCardProps {
    entry: AIImageEntry;
    onClick: (entry: AIImageEntry) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ entry, onClick }) => {
    const imageUrl = entry.imageUrl;

    const copyPrompt = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(entry.prompt);
        // TODO: Show toast notification
    };

    return (
        <div
            className="glass-panel"
            style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                aspectRatio: '1 / 1.4', // Default aspect ratio for card container, image will cover
            }}
            onClick={() => onClick(entry)}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(0,0,0,0.5)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <img
                src={imageUrl}
                alt={entry.prompt}
                loading="lazy"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                }}
            />

            {/* Overlay on hover */}
            <div
                className="card-overlay"
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '16px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    height: '50%'
                }}
            >
                <p style={{
                    color: 'white',
                    fontSize: '0.85rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    marginBottom: '8px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                }}>
                    {entry.prompt}
                </p>

                <div className="flex-between">
                    <button
                        onClick={copyPrompt}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px',
                            color: 'white',
                            backdropFilter: 'blur(4px)',
                        }}
                        title="プロンプトをコピー"
                    >
                        <Copy size={16} />
                    </button>
                </div>
            </div>

            <style>{`
        .glass-panel:hover .card-overlay {
          opacity: 1;
        }
      `}</style>
        </div>
    );
};
