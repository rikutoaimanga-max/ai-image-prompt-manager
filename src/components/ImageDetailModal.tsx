import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Copy, Trash2, Calendar, Settings, FileText, Share2, Check, Edit2 } from 'lucide-react';
import type { AIImageEntry } from '../lib/types';
import { db } from '../lib/db';

interface ImageDetailModalProps {
    entry: AIImageEntry | null;
    onClose: () => void;
    onDeleted: () => void;
    onEdit: () => void;
    isReadOnly?: boolean;
}

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ entry, onClose, onDeleted, onEdit, isReadOnly = false }) => {
    const [copiedShare, setCopiedShare] = useState(false);

    if (!entry) return null;
    const imageUrl = entry.imageUrl;

    const copyText = (text: string) => {
        navigator.clipboard.writeText(text);
        // TODO: Toast
    };

    const handleShare = () => {
        if (!entry.id) return;
        const shareUrl = `${window.location.origin}/?share=${entry.id}`;
        navigator.clipboard.writeText(shareUrl);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
    };

    const handleDelete = async () => {
        if (window.confirm('この画像を削除してもよろしいですか？')) {
            if (entry.id) {
                await db.deleteEntry(entry.id);
                onDeleted();
                onClose();
            }
        }
    };

    const formatDate = (ts: number | string) => {
        return new Date(ts).toLocaleString('ja-JP');
    };

    return (
        <Modal isOpen={!!entry} onClose={onClose}>
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Image */}
                <div style={{ flex: '1.5', minWidth: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                    <img
                        src={imageUrl}
                        alt={entry.prompt}
                        style={{ maxWidth: '100%', maxHeight: '600px', borderRadius: '4px', objectFit: 'contain' }}
                    />
                </div>

                {/* Right: Details */}
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '300px' }}>

                    {/* Prompt Section */}
                    <div>
                        <div className="flex-between" style={{ marginBottom: '8px' }}>
                            <h3 className="section-title flex-center gap-2" style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>
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
                            maxHeight: '150px',
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
                                <h3 className="section-title flex-center gap-2" style={{ fontSize: '0.95rem', color: 'var(--secondary)' }}>
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
                                maxHeight: '100px',
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
                            <h3 className="section-title flex-center gap-2" style={{ marginBottom: '8px', fontSize: '0.95rem', justifyContent: 'flex-start' }}>
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
                    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="flex-center gap-2" style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                            <Calendar size={14} />
                            {formatDate(entry.createdAt)}
                        </div>

                        {!isReadOnly && (
                            <div className="flex gap-2">
                                <Button variant="ghost" icon={<Edit2 size={16} />} onClick={onEdit}>
                                    編集
                                </Button>
                                <Button variant="ghost" icon={copiedShare ? <Check size={16} /> : <Share2 size={16} />} onClick={handleShare}>
                                    {copiedShare ? 'コピーしました' : '共有リンク'}
                                </Button>
                                <Button variant="danger" icon={<Trash2 size={16} />} onClick={handleDelete}>
                                    削除
                                </Button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </Modal>
    );
};
