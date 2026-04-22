import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { AIImageEntry } from '../lib/types';
import { Button } from './Button';
import { Copy, FileText, Settings, Calendar, ImageIcon } from 'lucide-react';

export const SharedView: React.FC<{ shareId: string }> = ({ shareId }) => {
    const [entry, setEntry] = useState<AIImageEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSharedData = async () => {
            setLoading(true);
            try {
                const { data: row, error: fetchError } = await supabase
                    .from('images')
                    .select('*')
                    .eq('id', shareId)
                    .single();

                if (fetchError) throw fetchError;
                if (!row) throw new Error('Not found');

                setEntry({
                    id: row.id,
                    imageUrl: row.image_url,
                    prompt: row.prompt,
                    negativePrompt: row.negative_prompt,
                    parameters: row.parameters,
                    tags: row.tags,
                    width: row.width,
                    height: row.height,
                    createdAt: row.created_at,
                    folderId: row.folder_id
                });
            } catch (err: any) {
                console.error(err);
                setError('画像が見つからないか、公開されていません。');
            } finally {
                setLoading(false);
            }
        };

        fetchSharedData();
    }, [shareId]);

    const copyText = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    if (loading) {
        return <div className="flex-center" style={{ height: '100vh', color: 'var(--primary)' }}>読み込み中...</div>;
    }

    if (error || !entry) {
        return (
            <div className="flex-center flex-col gap-4" style={{ height: '100vh', color: 'var(--text-muted)' }}>
                <ImageIcon size={48} style={{ opacity: 0.5 }} />
                <p>{error}</p>
            </div>
        );
    }

    const formatDate = (ts: number | string) => {
        return new Date(ts).toLocaleString('ja-JP');
    };

    return (
        <div style={{ minHeight: '100vh', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel" style={{ maxWidth: '1000px', width: '100%', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left: Image */}
                    <div style={{ flex: '1.5', minWidth: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '1rem' }}>
                        <img
                            src={entry.imageUrl}
                            alt="Shared"
                            loading="lazy"
                            style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '4px', objectFit: 'contain' }}
                        />
                    </div>

                    {/* Right: Details */}
                    <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '300px' }}>
                        <h2 className="text-xl font-bold font-heading text-glow" style={{ marginBottom: '-10px' }}>共有画像</h2>
                        
                        {/* Prompt Section */}
                        <div>
                            <div className="flex-between" style={{ marginBottom: '8px' }}>
                                <h3 className="section-title flex-center gap-2" style={{ fontSize: '0.95rem', color: 'var(--primary)', margin: 0 }}>
                                    <FileText size={16} /> プロンプト
                                </h3>
                                <Button variant="ghost" size="sm" onClick={() => copyText(entry.prompt)} icon={<Copy size={14} />}>
                                    コピー
                                </Button>
                            </div>
                            <div className="code-block" style={{
                                background: 'rgba(0,0,0,0.3)',
                                padding: '12px',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                lineHeight: '1.5',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                border: '1px solid var(--border-subtle)',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {entry.prompt}
                            </div>
                        </div>

                        {/* Negative Prompt Section */}
                        {entry.negativePrompt && (
                            <div>
                                <div className="flex-between" style={{ marginBottom: '8px' }}>
                                    <h3 className="section-title flex-center gap-2" style={{ fontSize: '0.95rem', color: 'var(--secondary)', margin: 0 }}>
                                        <FileText size={16} /> ネガティブプロンプト
                                    </h3>
                                    <Button variant="ghost" size="sm" onClick={() => copyText(entry.negativePrompt!)} icon={<Copy size={14} />}>
                                        コピー
                                    </Button>
                                </div>
                                <div className="code-block" style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5',
                                    maxHeight: '150px',
                                    overflowY: 'auto',
                                    border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-muted)',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {entry.negativePrompt}
                                </div>
                            </div>
                        )}

                        {/* Parameters Section */}
                        {entry.parameters && (
                            <div>
                                <h3 className="section-title flex-center gap-2" style={{ marginBottom: '8px', fontSize: '0.95rem', justifyContent: 'flex-start', margin: 0 }}>
                                    <Settings size={16} /> パラメータ
                                </h3>
                                <div style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-muted)',
                                    fontFamily: 'monospace',
                                    background: 'rgba(0,0,0,0.2)',
                                    padding: '8px',
                                    borderRadius: '4px'
                                }}>
                                    {entry.parameters}
                                </div>
                            </div>
                        )}

                        {/* Footer Info */}
                        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <div className="flex-center gap-2" style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                                <Calendar size={14} />
                                {formatDate(entry.createdAt)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
