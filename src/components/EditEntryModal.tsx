import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { db } from '../lib/db';
import type { AIImageEntry, Folder } from '../lib/types';

interface EditEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEdited: () => void;
    entry: AIImageEntry | null;
}

export const EditEntryModal: React.FC<EditEntryModalProps> = ({ isOpen, onClose, onEdited, entry }) => {
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [parameters, setParameters] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Folder selection state
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string>('');

    useEffect(() => {
        if (isOpen && entry) {
            setPrompt(entry.prompt || '');
            setNegativePrompt(entry.negativePrompt || '');
            setParameters(entry.parameters || '');
            setSelectedFolderId(entry.folderId || '');
            loadFolders();
        }
    }, [isOpen, entry]);

    const loadFolders = async () => {
        const data = await db.getAllFolders();
        setFolders(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!entry || !entry.id || !prompt) return;

        setIsSubmitting(true);
        try {
            await db.updateEntry(entry.id, {
                prompt,
                negativePrompt: negativePrompt || undefined,
                parameters: parameters || undefined,
                folderId: selectedFolderId || null
            });
            onEdited();
            onClose();
        } catch (error) {
            console.error('Failed to update entry:', error);
            alert('保存に失敗しました。');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!entry) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="プロンプトの編集">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                    <img 
                        src={entry.imageUrl} 
                        alt="Preview" 
                        style={{ maxHeight: '150px', borderRadius: '4px', objectFit: 'contain' }} 
                    />
                </div>

                {/* Folder Selection */}
                <div className="flex flex-col gap-1">
                    <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>フォルダ</label>
                    <select
                        value={selectedFolderId}
                        onChange={(e) => setSelectedFolderId(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-main)',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">(なし / すべての画像)</option>
                        {folders.map(folder => (
                            <option key={folder.id} value={folder.id}>
                                {folder.name}
                            </option>
                        ))}
                    </select>
                </div>

                <Textarea
                    label="プロンプト"
                    placeholder="例: masterpiece, best quality, 1girl..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                />

                <Textarea
                    label="ネガティブプロンプト"
                    placeholder="例: worst quality, low quality..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                />

                <Textarea
                    label="パラメータ"
                    placeholder="例: Steps: 20, Sampler: Euler a..."
                    value={parameters}
                    onChange={(e) => setParameters(e.target.value)}
                />

                <div className="flex justify-end gap-2" style={{ marginTop: '16px' }}>
                    <Button type="button" variant="ghost" onClick={onClose}>キャンセル</Button>
                    <Button type="submit" disabled={!prompt || isSubmitting}>
                        {isSubmitting ? '保存中...' : '保存する'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
