import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AIImageEntry, Folder } from './types';

interface AIImageDB extends DBSchema {
    images: {
        key: number;
        value: AIImageEntry;
        indexes: {
            'createdAt': number;
            'folderId': string;
        };
    };
    folders: {
        key: string;
        value: Folder;
        indexes: { 'createdAt': number };
    };
}

const DB_NAME = 'ai-image-manager-db';
const DB_VERSION = 3; // Incremented version to ensure index exists

export const db = {
    async getDB(): Promise<IDBPDatabase<AIImageDB>> {
        return openDB<AIImageDB>(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion, transaction) {
                console.log(`Upgrading DB from ${oldVersion} to ${newVersion}`);

                // Initialize images store if not exists
                if (!db.objectStoreNames.contains('images')) {
                    const store = db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('createdAt', 'createdAt');
                    store.createIndex('folderId', 'folderId'); // Create immediately
                } else {
                    // Ensure index exists for existing store
                    const imageStore = transaction.objectStore('images');
                    if (!imageStore.indexNames.contains('folderId')) {
                        imageStore.createIndex('folderId', 'folderId');
                        console.log("Created missing folderId index");
                    }
                }

                if (!db.objectStoreNames.contains('folders')) {
                    const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
                    folderStore.createIndex('createdAt', 'createdAt');
                }
            },
        });
    },

    async getAllEntries(folderId?: string): Promise<AIImageEntry[]> {
        const db = await this.getDB();
        if (folderId) {
            return db.getAllFromIndex('images', 'folderId', folderId);
        } else {
            // Use getAll() which fetches by Primary Key (ID).
            // Since ID is auto-increment, this is effectively chronological.
            // This avoids potential issues with the 'createdAt' index.
            return db.getAll('images');
        }
    },

    async addEntry(entry: Omit<AIImageEntry, 'id'>) {
        const db = await this.getDB();
        return db.add('images', entry);
    },

    async deleteEntry(id: number) {
        const db = await this.getDB();
        return db.delete('images', id);
    },

    async getEntry(id: number) {
        const db = await this.getDB();
        return db.get('images', id);
    },

    // Folder Operations
    async getAllFolders(): Promise<Folder[]> {
        const db = await this.getDB();
        return db.getAllFromIndex('folders', 'createdAt');
    },

    async createFolder(name: string): Promise<string> {
        const db = await this.getDB();
        const folder: Folder = {
            id: crypto.randomUUID(),
            name,
            createdAt: Date.now()
        };
        await db.add('folders', folder);
        return folder.id;
    },

    async updateFolder(id: string, name: string) {
        const db = await this.getDB();
        const tx = db.transaction('folders', 'readwrite');
        const store = tx.objectStore('folders');
        const folder = await store.get(id);
        if (folder) {
            folder.name = name;
            await store.put(folder);
        }
        await tx.done;
    },

    async deleteFolder(id: string) {
        const db = await this.getDB();
        // Option: Delete all images in folder or move to root?
        // For safety, let's keep images but unset folderId (move to uncategorized) or delete them.
        // User didn't specify, but safer to just delete folder for now.
        // Ideally we should handle child images. Let's start with simple deletion.
        return db.delete('folders', id);
    }
};
