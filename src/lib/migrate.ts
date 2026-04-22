import { db as localDb } from './db';
import { supabase } from './supabase';

export interface MigrationStatus {
    total: number;
    current: number;
    status: 'idle' | 'running' | 'completed' | 'error';
    error?: string;
}

export const migrateDataToSupabase = async (
    onProgress: (status: MigrationStatus) => void
) => {
    try {
        const entries = await localDb.getAllEntries();
        const total = entries.length;

        onProgress({ total, current: 0, status: 'running' });

        for (let i = 0; i < total; i++) {
            const entry = entries[i];

            // 1. Upload Image to Storage
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('ai-images')
                .upload(fileName, entry.imageBlob, {
                    contentType: 'image/png'
                });

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('ai-images')
                .getPublicUrl(fileName);

            // 3. Insert into Database
            const { error: insertError } = await supabase
                .from('images')
                .insert({
                    prompt: entry.prompt,
                    negative_prompt: entry.negativePrompt,
                    parameters: entry.parameters,
                    image_url: publicUrl,
                    width: entry.width,
                    height: entry.height,
                    tags: entry.tags,
                    created_at: new Date(entry.createdAt).toISOString(),
                    // folder_id: entry.folderId // We might need to migrate folders first or handle null
                });

            if (insertError) throw insertError;

            onProgress({ total, current: i + 1, status: 'running' });
        }

        onProgress({ total, current: total, status: 'completed' });

    } catch (error) {
        console.error("Migration failed:", error);
        onProgress({ total: 0, current: 0, status: 'error', error: String(error) });
    }
};
