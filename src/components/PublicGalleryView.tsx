import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import type { AIImageEntry } from '../lib/types';
import { Gallery } from './Gallery';
import { ImageDetailModal } from './ImageDetailModal';
import { Layout } from './Layout';
import { Sidebar } from './Sidebar';

export const PublicGalleryView: React.FC = () => {
    const [entries, setEntries] = useState<AIImageEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<AIImageEntry | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

    useEffect(() => {
        const loadEntries = async () => {
            setIsLoading(true);
            try {
                const data = await db.getAllEntries(currentFolderId || undefined);
                setEntries(data);
            } catch (error) {
                console.error("Failed to load entries", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadEntries();
    }, [currentFolderId]);

    return (
        <Layout
            isReadOnly={true}
            onAddClick={() => {}} // Disabled in read-only mode
            sidebar={
                <Sidebar
                    isReadOnly={true}
                    currentFolderId={currentFolderId}
                    onFolderSelect={setCurrentFolderId}
                />
            }
        >
            {isLoading ? (
                <div className="flex-center" style={{ height: '200px', color: 'var(--text-muted)' }}>
                    読み込み中...
                </div>
            ) : entries.length > 0 ? (
                <Gallery entries={entries} onEntryClick={setSelectedEntry} />
            ) : (
                <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-muted)' }}>
                    <p>画像がありません。</p>
                </div>
            )}

            <ImageDetailModal
                entry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
                onDeleted={() => {}} // Disabled
                isReadOnly={true}
            />
        </Layout>
    );
};
