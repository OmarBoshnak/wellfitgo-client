import { Client, Account, ID, OAuthProvider } from 'react-native-appwrite';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Initialize Appwrite Client
const client = new Client()
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

// Initialize Account service
const account = new Account(client);

export class AppwriteAuth {
    /**
     * Create phone session using Appwrite phone token
     */
    static async createPhoneSession(phone: string) {
        try {
            // Create phone token first
            const token = await account.createPhoneToken({
                userId: ID.unique(),
                phone: phone
            });

            return {
                success: true,
                data: {
                    userId: token.userId,
                    phone: phone
                }
            };
        } catch (error: any) {
            console.error('Phone session creation error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create phone session'
            };
        }
    }

    /**
     * Verify phone session with userId and secret (OTP)
     */
    static async verifyPhoneSession(userId: string, secret: string) {
        try {
            const session = await account.createSession({
                userId: userId,
                secret: secret
            });
            return { success: true, data: session };
        } catch (error: any) {
            console.error('Phone verification error:', error);
            return {
                success: false,
                error: error.message || 'Failed to verify phone number'
            };
        }
    }

    /**
     * Create email session
     */
    static async createEmailSession(email: string, password: string) {
        try {
            const session = await account.createSession(email, password);
            return { success: true, data: session };
        } catch (error: any) {
            console.error('Email session creation error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create email session'
            };
        }
    }

    /**
     * Create OAuth2 session (Google, Facebook, Apple, etc.)
     */
    static async createOAuth2Session(provider: OAuthProvider) {
        try {
            // Check if there's an existing session and delete it first
            // This prevents "Creation of a session is prohibited when a session is active" error
            try {
                const existingUser = await account.get();
                if (existingUser) {
                    console.log('Existing session found, deleting before OAuth...');
                    await account.deleteSession('current');
                }
            } catch {
                // No active session - this is expected, continue with OAuth
            }

            // Use the Appwrite callback scheme from app.json
            const callbackUrl = 'appwrite-callback-69676fd2001b570962bd://';

            console.log(`Starting OAuth flow for ${provider} with callback: ${callbackUrl}`);

            // Start OAuth flow
            const loginUrl = await account.createOAuth2Token({
                provider: provider,
                success: callbackUrl,
                failure: callbackUrl,
                scopes: [] // Add scopes if needed for specific provider
            });

            console.log('OAuth login URL:', loginUrl);

            // Open loginUrl and listen for the scheme redirect
            const result = await WebBrowser.openAuthSessionAsync(`${loginUrl}`, callbackUrl);

            console.log('OAuth Result:', result); // Debug log

            if (result.type === 'success' && result.url) {
                // Extract credentials from OAuth redirect URL
                const url = new URL(result.url);
                const secret = url.searchParams.get('secret');
                const userId = url.searchParams.get('userId');

                console.log('Extracted credentials:', { userId, secret }); // Debug log

                if (secret && userId) {
                    // Create session with OAuth credentials
                    const session = await account.createSession({
                        userId,
                        secret
                    });
                    return { success: true, data: session };
                } else {
                    return {
                        success: false,
                        error: 'Failed to extract OAuth credentials from redirect'
                    };
                }
            } else {
                console.log('OAuth cancelled or failed:', result); // Debug log
                return {
                    success: false,
                    error: result.type === 'cancel'
                        ? 'OAuth authentication was cancelled by user'
                        : 'OAuth authentication failed. Please check your Appwrite OAuth configuration.'
                };
            }
        } catch (error: any) {
            console.error('OAuth authentication error:', error);
            return {
                success: false,
                error: error.message || 'Failed to authenticate with OAuth provider'
            };
        }
    }

    /**
     * Get OAuth2 provider information from current session
     */
    static async getOAuthProviderInfo() {
        try {
            const session = await account.getSession({
                sessionId: 'current'
            });

            return {
                success: true,
                data: {
                    provider: session.provider,
                    providerUid: session.providerUid,
                    providerAccessToken: session.providerAccessToken,
                    providerAccessTokenExpiry: session.providerAccessTokenExpiry
                }
            };
        } catch (error: any) {
            console.error('Get OAuth provider info error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get OAuth provider information'
            };
        }
    }

    /**
     * Refresh OAuth2 session
     */
    static async refreshOAuthSession() {
        try {
            const session = await account.updateSession({
                sessionId: 'current'
            });
            return { success: true, data: session };
        } catch (error: any) {
            console.error('Refresh OAuth session error:', error);
            return {
                success: false,
                error: error.message || 'Failed to refresh OAuth session'
            };
        }
    }

    /**
     * Create account with email
     */
    static async createAccount(email: string, password: string, name?: string) {
        try {
            const user = await account.create(
                ID.unique(),
                email,
                password,
                name
            );
            return { success: true, data: user };
        } catch (error: any) {
            console.error('Account creation error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create account'
            };
        }
    }

    /**
     * Get current user
     */
    static async getCurrentUser() {
        try {
            const user = await account.get();
            return { success: true, data: user };
        } catch (error: any) {
            console.error('Get current user error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Logout user
     */
    static async logout() {
        try {
            await account.deleteSession('current');
            return { success: true };
        } catch (error: any) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete current user account
     * Calls backend API for full Appwrite account deletion, then clears local sessions
     */
    static async deleteAccount() {
        try {
            // Get current user info before deletion
            const user = await account.get();

            // Try to call backend API for full account deletion
            try {
                const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'https://your-backend.herokuapp.com';
                const response = await fetch(`${backendUrl}/api/auth/account`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ appwriteUserId: user.$id }),
                });

                const result = await response.json();
                if (!result.success) {
                    console.warn('Backend account deletion returned error:', result.message);
                }
            } catch (backendError) {
                console.warn('Backend account deletion failed, continuing with session cleanup:', backendError);
            }

            // Always clear local sessions
            await account.deleteSessions();

            return {
                success: true,
                data: {
                    deleted: true,
                    userId: user.$id
                }
            };
        } catch (error: any) {
            console.error('Delete account error:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete account'
            };
        }
    }

    /**
     * Check if user is logged in
     */
    static async isLoggedIn() {
        try {
            const user = await account.get();
            return !!user;
        } catch (error) {
            return false;
        }
    }
}

export default AppwriteAuth;
