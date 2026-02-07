export interface Folder {
    id: string;
    name: string;
    createdAt: number;
}

export interface AIImageEntry {
    id?: number;
    imageBlob: Blob; // The actual image data
    prompt: string;
    negativePrompt?: string;
    parameters?: string; // Additional settings (Seed, Steps, Scale etc.)
    tags?: string[];
    width?: number;
    height?: number;
    createdAt: number;
    folderId?: string; // Optional for backward compatibility (root folder)
}
