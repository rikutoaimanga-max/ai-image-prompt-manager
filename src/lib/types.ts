export interface Folder {
    id: string;
    name: string;
    createdAt: number | string; // Supabase returns ISO string, DB might use it
}

export interface AIImageEntry {
    id: string; // UUID
    imageUrl: string; // URL from Supabase Storage
    imageBlob?: Blob; // Optional for upload only
    prompt: string;
    negativePrompt?: string;
    parameters?: string;
    tags?: string[];
    width?: number;
    height?: number;
    createdAt: number | string;
    folderId?: string | null;
}
