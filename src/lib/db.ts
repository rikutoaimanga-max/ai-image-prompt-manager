import { supabase } from './supabase';
import type { AIImageEntry, Folder } from './types';

export const db = {
    async getAllEntries(folderId?: string): Promise<AIImageEntry[]> {
        let query = supabase
            .from('images')
            .select('*')
            .order('created_at', { ascending: false });

        if (folderId) {
            query = query.eq('folder_id', folderId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map(row => ({
            id: row.id,
            imageUrl: row.image_url,
            prompt: row.prompt,
            negativePrompt: row.negative_prompt,
            parameters: row.parameters,
            tags: row.tags,
            width: row.width,
            height: row.height,
            createdAt: row.created_at,
            folderId: row.folder_id
        }));
    },

    async addEntry(entry: Omit<AIImageEntry, 'id' | 'imageUrl'> & { imageBlob: Blob }) {
        // 1. Upload image to Storage
        const ext = entry.imageBlob.type === 'image/jpeg' ? 'jpeg' : 'png';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('ai-images') // Shared bucket name. (You might want to create this bucket in Supabase)
            .upload(fileName, entry.imageBlob, {
                contentType: entry.imageBlob.type
            });

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('ai-images')
            .getPublicUrl(fileName);

        // 3. Insert into Database
        const { data, error } = await supabase
            .from('images')
            .insert({
                prompt: entry.prompt,
                negative_prompt: entry.negativePrompt,
                parameters: entry.parameters,
                image_url: publicUrl,
                width: entry.width,
                height: entry.height,
                tags: entry.tags,
                folder_id: entry.folderId || null
            })
            .select()
            .single();

        if (error) throw error;
        return data.id;
    },

    async deleteEntry(id: string) {
        // Find entry to delete image from storage
        const { data: entry } = await supabase.from('images').select('image_url').eq('id', id).single();
        
        if (entry && entry.image_url) {
            // Extracts filename from URL. Format: .../storage/v1/object/public/ai-images/filename.png
            const parts = entry.image_url.split('/');
            const fileName = parts[parts.length - 1];
            if (fileName) {
                await supabase.storage.from('ai-images').remove([fileName]);
            }
        }

        const { error } = await supabase
            .from('images')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
    },

    async getEntry(id: string): Promise<AIImageEntry | null> {
        const { data: row, error } = await supabase
            .from('images')
            .select('*')
            .eq('id', id)
            .single();
            
        if (error) return null;
        if (!row) return null;

        return {
            id: row.id,
            imageUrl: row.image_url,
            prompt: row.prompt,
            negativePrompt: row.negative_prompt,
            parameters: row.parameters,
            tags: row.tags,
            width: row.width,
            height: row.height,
            createdAt: row.created_at,
            folderId: row.folder_id
        };
    },

    // Folder Operations
    async getAllFolders(): Promise<Folder[]> {
        const { data, error } = await supabase
            .from('folders')
            .select('*')
            .order('created_at', { ascending: true });
            
        if (error) throw error;
        
        return (data || []).map(row => ({
            id: row.id,
            name: row.name,
            createdAt: row.created_at
        }));
    },

    async createFolder(name: string): Promise<string> {
        const { data, error } = await supabase
            .from('folders')
            .insert({ name })
            .select()
            .single();
            
        if (error) throw error;
        return data.id;
    },

    async updateFolder(id: string, name: string) {
        const { error } = await supabase
            .from('folders')
            .update({ name })
            .eq('id', id);
            
        if (error) throw error;
    },

    async deleteFolder(id: string) {
        const { error } = await supabase
            .from('folders')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
    }
};
