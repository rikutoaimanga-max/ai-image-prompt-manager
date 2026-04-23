import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AddEntryModal } from './components/AddEntryModal';
import { ImageDetailModal } from './components/ImageDetailModal';
import { Gallery } from './components/Gallery';
import { Sidebar } from './components/Sidebar';
import { Auth } from './components/Auth';
import { SharedView } from './components/SharedView';
import { PublicGalleryView } from './components/PublicGalleryView';
import { db } from './lib/db';
import { supabase } from './lib/supabase';
import type { AIImageEntry } from './lib/types';
import type { Session } from '@supabase/supabase-js';

function App() {
  const [entries, setEntries] = useState<AIImageEntry[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AIImageEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
  // Auth & Routing state
  const [session, setSession] = useState<Session | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [isGalleryView, setIsGalleryView] = useState(false);

  useEffect(() => {
    // Check for gallery route
    if (window.location.pathname === '/gallery') {
      setIsGalleryView(true);
      return; // Skip auth check for public gallery
    }

    // Check URL parameters for share route
    const urlParams = new URLSearchParams(window.location.search);
    const shareParam = urlParams.get('share');
    if (shareParam) {
      setShareId(shareParam);
      return; // Skip auth check if shared view
    }

    // Initialize Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadEntries = async () => {
    if (!session && !shareId) return; // Only load for authenticated user (unless shared view)
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

  useEffect(() => {
    if (!shareId && session) {
      loadEntries();
    }
  }, [currentFolderId, session, shareId]);

  // Routing
  if (isGalleryView) {
    return <PublicGalleryView />;
  }

  if (shareId) {
    return <SharedView shareId={shareId} />;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <Layout
      onAddClick={() => setIsAddModalOpen(true)}
      sidebar={
        <Sidebar
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
          <p>画像がまだありません。</p>
          <p style={{ marginTop: '10px' }}>右上のボタンから追加してください。</p>
        </div>
      )}

      <AddEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdded={loadEntries}
        currentFolderId={currentFolderId}
      />

      <ImageDetailModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onDeleted={loadEntries}
      />
    </Layout>
  );
}

export default App;
