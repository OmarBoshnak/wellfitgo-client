import { Client, Storage, ID } from 'react-native-appwrite';
import * as FileSystem from 'expo-file-system/legacy';

// Initialize Appwrite Client & Storage
// We can reuse the client from auth.ts if exported, but creating a new one is safe too as it's stateless config
const client = new Client()
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
    .setPlatform('com.wellfitgoapp');

const storage = new Storage(client);

// Bucket ID from env or fallback
const BUCKET_ID = process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID;

export interface UploadResult {
    success: boolean;
    fileId?: string;
    url?: string;
    error?: string;
}

export class AppwriteStorage {
    /**
     * Upload a file to Appwrite Storage
     * @param uri Local file URI
     * @param fileName Optional filename
     * @param mimeType Optional mime type
     * @param token JWT token for authentication (optional - will fetch automatically if not provided)
     */
    static async uploadFile(uri: string, fileName?: string, mimeType?: string, size?: number, token?: string): Promise<UploadResult> {
        console.log('AppwriteStorage.uploadFile called with:', { uri, fileName, mimeType, token: !!token });

        if (!BUCKET_ID) {
            console.error('Appwrite Bucket ID is missing');
            return { success: false, error: 'Storage configuration is missing' };
        }

        try {
            const name = fileName || uri.split('/').pop() || `file_${Date.now()}`;

            // Get file info if size is missing (though SDK might handle uri directly, explicitly providing details is safer)
            let fileSize = size;
            if (!fileSize) {
                const fileInfo = await FileSystem.getInfoAsync(uri);
                if (!fileInfo.exists) {
                    throw new Error('File does not exist at the specified URI');
                }
                fileSize = fileInfo.size;
            }

            // Session-based authentication is used - client already has session from auth flow

            const normalizedUri = uri.startsWith('file://') ? uri : `file://${uri}`;
            const file = {
                name,
                type: mimeType || 'application/octet-stream',
                size: fileSize!,
                uri: normalizedUri,
            };

            console.log('AppwriteStorage: Uploading file using SDK...', {
                bucket: BUCKET_ID,
                name,
                type: file.type,
                size: file.size,
                uri: file.uri,
            });

            const response = await storage.createFile(
                BUCKET_ID,
                ID.unique(),
                file as any
            );

            console.log('AppwriteStorage: Upload success', response);

            return {
                success: true,
                fileId: response.$id,
                url: AppwriteStorage.getFileView(response.$id),
            };

        } catch (error: any) {
            console.error('Appwrite Storage Upload Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to upload file',
            };
        }
    }

    /**
     * Get file view URL
     */
    static getFileView(fileId: string): string {
        if (!BUCKET_ID) return '';
        return `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;
    }

    /**
     * Get file preview URL (for images)
     */
    static getFilePreview(fileId: string, width?: number, height?: number): string {
        if (!BUCKET_ID) return '';
        let url = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/preview?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;
        if (width) url += `&width=${width}`;
        if (height) url += `&height=${height}`;
        return url;
    }
}

export default AppwriteStorage;
