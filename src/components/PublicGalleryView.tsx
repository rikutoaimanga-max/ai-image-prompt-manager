import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import type { AIImageEntry } from '../lib/types';
import { Gallery } from './Gallery';
import { ImageDetailModal } from './ImageDetailModal';
import { ImageIcon } from 'lucide-react';

export const PublicGalleryView: React.FC = () => {
    const [entries, setEntries] = useState<AIImageEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<AIImageEntry | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadEntries = async () => {
            try {
                // Fetch all entries. Since there's no folderId, it will fetch everything.
                // Assuming RLS allows public read access.
                const data = await db.getAllEntries();
                setEntries(data);
            } catch (err: any) {
                console.error("Failed to load entries", err);
                setError('画像を読み込めませんでした。');
            } finally {
                setIsLoading(false);
            }
        };

        loadEntries();
    }, []);

    if (isLoading) {
        return (
            <div className="flex-center" style={{ height: '100vh', color: 'var(--primary)' }}>
                読み込み中...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-center flex-col gap-4" style={{ height: '100vh', color: 'var(--text-muted)' }}>
                <ImageIcon size={48} style={{ opacity: 0.5 }} />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 className="text-2xl font-bold font-heading text-glow" style={{ display: 'inline-block' }}>
                        公開ギャラリー
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        保存された画像の一覧です（閲覧専用）
                    </p>
                </div>

                {entries.length > 0 ? (
                    <Gallery entries={entries} onEntryClick={setSelectedEntry} />
                ) : (
                    <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-muted)' }}>
                        <p>画像がまだありません。</p>
                    </div>
                )}
            </div>

            <ImageDetailModal
                entry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
                onDeleted={() => {}} // Dummy function as delete is disabled
                isReadOnly={true}
            />
        </div>
    );
};
