import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Textarea } from './Textarea';

import { Upload, X } from 'lucide-react';
import { db } from '../lib/db';
import type { Folder } from '../lib/types';

interface AddEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdded: () => void;
    currentFolderId: string | null;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({ isOpen, onClose, onAdded, currentFolderId }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Folder selection state
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize selected folder when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedFolderId(currentFolderId || '');
            loadFolders();
        }
    }, [isOpen, currentFolderId]);

    const loadFolders = async () => {
        const data = await db.getAllFolders();
        setFolders(data);
    };

    const handleFileChange = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            const url = URL.createObjectURL(file);
            setImagePreview(url);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!imageFile || !prompt) return;

        setIsSubmitting(true);
        try {
            await db.addEntry({
                imageBlob: imageFile,
                prompt,

                createdAt: Date.now(),
                folderId: selectedFolderId || undefined // Save folderId
            });
            console.log('Entry added');
            // Reset form
            setImageFile(null);
            setImagePreview(null);
            setPrompt('');


            onAdded();
            onClose();
        } catch (error) {
            console.error('Failed to add entry:', error);
            alert('保存に失敗しました。');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="新規画像登録">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Image Uploader */}
                <div
                    className="upload-area"
                    style={{
                        border: '2px dashed var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: imagePreview ? 'transparent' : 'rgba(255,255,255,0.02)',
                        position: 'relative',
                        minHeight: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.background = imagePreview ? 'transparent' : 'rgba(255,255,255,0.02)';
                    }}
                    onDrop={handleDrop}
                    onClick={() => !imagePreview && fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                    />

                    {imagePreview ? (
                        <div className="relative w-full h-full">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                style={{ maxHeight: '300px', maxWidth: '100%', borderRadius: '4px', objectFit: 'contain' }}
                            />
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setImageFile(null);
                                    setImagePreview(null);
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '-10px',
                                    background: 'rgba(0,0,0,0.8)',
                                    borderRadius: '50%',
                                    padding: '4px',
                                    color: 'white',
                                    border: '1px solid var(--border-subtle)'
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ color: 'var(--text-muted)' }}>
                            <div className="flex-center" style={{ marginBottom: '12px' }}>
                                <Upload size={40} style={{ opacity: 0.5 }} />
                            </div>
                            <p style={{ marginBottom: '4px' }}>画像をドラッグ＆ドロップ</p>
                            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>またはクリックして選択</p>
                        </div>
                    )}
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



                <div className="flex justify-end gap-2" style={{ marginTop: '16px' }}>
                    <Button type="button" variant="ghost" onClick={onClose}>キャンセル</Button>
                    <Button type="submit" disabled={!imageFile || !prompt || isSubmitting}>
                        {isSubmitting ? '保存中...' : '保存する'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
