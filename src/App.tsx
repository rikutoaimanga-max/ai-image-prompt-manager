import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AddEntryModal } from './components/AddEntryModal';
import { ImageDetailModal } from './components/ImageDetailModal';
import { Gallery } from './components/Gallery';
import { Sidebar } from './components/Sidebar';
import { db } from './lib/db';
import type { AIImageEntry } from './lib/types';

function App() {
  const [entries, setEntries] = useState<AIImageEntry[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AIImageEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const data = await db.getAllEntries(currentFolderId || undefined);
      setEntries(data.reverse());
    } catch (error) {
      console.error("Failed to load entries", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [currentFolderId]);

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
