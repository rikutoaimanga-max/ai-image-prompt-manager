import React from 'react';
import type { AIImageEntry } from '../lib/types';
import { ImageCard } from './ImageCard';

interface GalleryProps {
    entries: AIImageEntry[];
    onEntryClick: (entry: AIImageEntry) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ entries, onEntryClick }) => {
    return (
        <div className="grid-gallery">
            {entries.map((entry) => (
                <ImageCard key={entry.id} entry={entry} onClick={onEntryClick} />
            ))}
        </div>
    );
};
