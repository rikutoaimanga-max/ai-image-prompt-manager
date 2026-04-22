import { useState, useEffect } from 'react';
import { Folder as FolderIcon, Plus, Trash2, FolderOpen, ChevronLeft, ChevronRight, Check, X, MoreVertical, Edit2, LogOut } from 'lucide-react';
import { db } from '../lib/db';
import type { Folder } from '../lib/types';
import { Input } from './Input';
import { supabase } from '../lib/supabase';

interface SidebarProps {
    currentFolderId: string | null;
    onFolderSelect: (folderId: string | null) => void;
    className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentFolderId, onFolderSelect, className }) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openMenuFolderId, setOpenMenuFolderId] = useState<string | null>(null);
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const loadFolders = async () => {
        try {
            const data = await db.getAllFolders();
            setFolders(data);
        } catch (error) {
            console.error("Failed to load folders:", error);
        }
    };

    useEffect(() => {
        loadFolders();
    }, []);

    const startEditing = (folder: Folder) => {
        setEditingFolderId(folder.id);
        setEditName(folder.name);
        setOpenMenuFolderId(null);
    };

    const handleUpdateFolder = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        console.log("Updating folder:", editingFolderId, editName);
        if (!editingFolderId || !editName.trim()) return;

        try {
            await db.updateFolder(editingFolderId, editName);
            setEditingFolderId(null);
            loadFolders();
        } catch (error) {
            console.error('Failed to update folder:', error);
            alert('フォルダ名の変更に失敗しました');
        }
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        try {
            await db.createFolder(newFolderName);
            setNewFolderName('');
            setIsCreating(false);
            loadFolders();
        } catch (error) {
            console.error('Failed to create folder:', error);
            alert('フォルダの作成に失敗しました: ' + error);
        }
    };

    const handleDeleteFolder = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('このフォルダを削除しますか？\n（中の画像は削除されませんが、フォルダ分類は解除されます）')) return;

        try {
            await db.deleteFolder(id);
            if (currentFolderId === id) {
                onFolderSelect(null);
            }
            loadFolders();
        } catch (error) {
            console.error('Failed to delete folder:', error);
        }
    };

    const handleLogout = async () => {
        if (confirm('ログアウトしますか？')) {
            await supabase.auth.signOut();
        }
    };

    const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);

    const toggleMenu = (e: React.MouseEvent, folderId: string) => {
        e.stopPropagation();
        if (openMenuFolderId === folderId) {
            setOpenMenuFolderId(null);
            setMenuPosition(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPosition({
                top: rect.top,
                left: rect.right + 4 // Slightly offset
            });
            setOpenMenuFolderId(folderId);
        }
    };

    // Close menu on scroll to avoid floating menu
    useEffect(() => {
        const handleScroll = () => {
            if (openMenuFolderId) {
                setOpenMenuFolderId(null);
                setMenuPosition(null);
            }
        };
        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, [openMenuFolderId]);

    const renderMenu = () => {
        if (!openMenuFolderId || !menuPosition || !folders.find(f => f.id === openMenuFolderId)) return null;

        const folder = folders.find(f => f.id === openMenuFolderId)!;

        return (
            <div className="glass-panel fixed z-[9999] flex flex-col shadow-lg"
                style={{
                    minWidth: '140px',
                    padding: '4px',
                    top: menuPosition.top,
                    left: menuPosition.left,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    zIndex: 9999
                }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        startEditing(folder);
                    }}
                    className="btn-ghost flex items-center gap-2 w-full text-left"
                    style={{ padding: '8px', fontSize: '0.9rem', justifyContent: 'flex-start' }}
                >
                    <Edit2 size={14} /> 名前を変更
                </button>
                <button
                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                    className="btn-ghost flex items-center gap-2 w-full text-left text-red-500 hover:text-red-600"
                    style={{ padding: '8px', fontSize: '0.9rem', justifyContent: 'flex-start' }}
                >
                    <Trash2 size={14} /> 削除
                </button>
            </div>
        );
    };

    return (
        <>
            <aside
                className={`glass-panel ${className || ''}`}
                style={{
                    background: 'var(--bg-panel)',
                    borderRight: '1px solid var(--border-subtle)',
                    width: isCollapsed ? '72px' : '240px',
                    minWidth: isCollapsed ? '72px' : '240px',
                    flexShrink: 0,
                    height: 'calc(100vh - 70px)', // Adjust for navbar height
                    position: 'sticky',
                    top: '70px',
                    left: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 'var(--spacing-md)',
                    borderTopRightRadius: 'var(--radius-lg)',
                    borderBottomRightRadius: 'var(--radius-lg)',
                    marginLeft: 0,
                    transition: 'width 0.3s ease, min-width 0.3s ease'
                }}
            >
                <div className="flex-between" style={{ marginBottom: 'var(--spacing-md)', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
                    {!isCollapsed && <h2 className="text-lg font-bold" style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>フォルダ</h2>}
                    <button
                        onClick={() => {
                            setIsCreating(true);
                            setIsCollapsed(false);
                        }}
                        className="btn-ghost"
                        style={{ padding: '4px', display: isCollapsed ? 'none' : 'block' }}
                        title="新規フォルダ"
                    >
                        <Plus size={20} />
                    </button>
                    <button
                        onClick={() => {
                            setIsCreating(true);
                            setIsCollapsed(false);
                        }}
                        className="btn-ghost"
                        style={{ padding: '4px', display: isCollapsed ? 'block' : 'none' }}
                        title="新規フォルダ"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                    <ul className="flex flex-col gap-2">
                        <li>
                            <button
                                onClick={() => onFolderSelect(null)}
                                className={`btn btn-full ${currentFolderId === null ? 'btn-secondary' : 'btn-ghost'}`}
                                style={{
                                    padding: '10px 12px',
                                    justifyContent: isCollapsed ? 'center' : 'flex-start'
                                }}
                                title={isCollapsed ? "すべての画像" : ""}
                            >
                                <FolderOpen size={18} style={{ marginRight: isCollapsed ? 0 : '8px' }} />
                                {!isCollapsed && <span>すべての画像</span>}
                            </button>
                        </li>

                        {folders.map(folder => (
                            <li key={folder.id} className="group relative flex items-center gap-1" style={{ minHeight: '40px' }}>
                                {editingFolderId === folder.id ? (
                                    <div className="flex gap-1 items-center w-full" style={{ padding: '0 8px' }}>
                                        <input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleUpdateFolder(e);
                                            }}
                                            autoFocus
                                            className="glass-input"
                                            style={{
                                                margin: 0,
                                                padding: '4px 8px',
                                                fontSize: '0.9rem',
                                                height: '32px',
                                                flex: 1,
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid var(--border-subtle)',
                                                borderRadius: '4px',
                                                color: 'var(--text-main)',
                                                outline: 'none'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUpdateFolder(e);
                                            }}
                                            className="btn-ghost"
                                            style={{
                                                padding: '4px',
                                                color: 'var(--primary)',
                                                flexShrink: 0,
                                                border: '1px solid var(--border-subtle)',
                                                borderRadius: '4px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                marginRight: '2px'
                                            }}
                                            title="保存"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingFolderId(null);
                                            }}
                                            className="btn-ghost"
                                            style={{ padding: '4px', color: 'var(--text-muted)', flexShrink: 0 }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => onFolderSelect(folder.id)}
                                            className={`btn ${currentFolderId === folder.id ? 'btn-secondary' : 'btn-ghost'}`}
                                            style={{
                                                padding: '8px 12px',
                                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                                flex: 1,
                                                width: 'auto',
                                                minWidth: 0,
                                                textAlign: 'left'
                                            }}
                                            title={isCollapsed ? folder.name : ""}
                                        >
                                            <FolderIcon size={18} style={{ marginRight: isCollapsed ? 0 : '8px', flexShrink: 0 }} />
                                            {!isCollapsed && (
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {folder.name}
                                                </span>
                                            )}
                                        </button>

                                        {!isCollapsed && (
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => toggleMenu(e, folder.id)}
                                                    className="btn-ghost"
                                                    style={{
                                                        padding: '4px 8px',
                                                        color: 'var(--text-muted)',
                                                        opacity: 1
                                                    }}
                                                    title="メニュー"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>

                    {isCreating && !isCollapsed && (
                        <div style={{ marginTop: '12px' }}>
                            <form onSubmit={handleCreateFolder} className="flex gap-2 items-center">
                                <Input
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="フォルダ名"
                                    autoFocus
                                    style={{ margin: 0 }}
                                />
                                <button
                                    type="submit"
                                    className="btn-ghost"
                                    style={{ padding: '4px', color: 'var(--primary)' }}
                                    title="保存"
                                >
                                    <Check size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="btn-ghost"
                                    style={{ padding: '4px', color: 'var(--text-muted)' }}
                                    title="キャンセル"
                                >
                                    <X size={18} />
                                </button>
                            </form>
                        </div>
                    )}
                </nav>

                <div style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: 'var(--spacing-md)',
                    marginTop: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                }}>
                    <button
                        onClick={handleLogout}
                        className="btn-ghost"
                        style={{ padding: '8px', width: '100%', justifyContent: isCollapsed ? 'center' : 'flex-start', color: 'var(--text-muted)' }}
                        title="ログアウト"
                    >
                        <LogOut size={20} style={{ marginRight: isCollapsed ? 0 : '8px' }} />
                        {!isCollapsed && <span>ログアウト</span>}
                    </button>
                    <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="btn-ghost"
                        style={{ padding: '8px', display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        {!isCollapsed && <span style={{ marginLeft: '8px' }}>折りたたむ</span>}
                    </button>
                </div>
            </aside>
            {renderMenu()}
        </>
    );
};
