// Environment configuration with validation
const requiredEnvVars = [
    'VITE_SOCKET_URL'
];



// Validate required environment variables
const validateEnv = () => {
    const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};

// Initialize environment validation in development
if (import.meta.env.DEV) {
    validateEnv();
}

export const config = {
    // API URLs
    socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',

    // External APIs
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
    youtubeApiKey: import.meta.env.VITE_YOUTUBE_API_KEY,
    cityBikesApiUrl: import.meta.env.VITE_CITYBIKES_API_URL || 'https://api.citybik.es/v2/networks',
    remotiveApiUrl: import.meta.env.VITE_REMOTIVE_API_URL || 'https://remotive.com/api/remote-jobs',

    // File upload settings
    fileUpload: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    },

    // App settings
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,

    // Rate limiting
    rateLimiting: {
        gemini: {
            maxRequests: 3,
            windowMs: 60000 // 1 minute
        },
        api: {
            maxRequests: 100,
            windowMs: 900000 // 15 minutes
        }
    }
};

export default config;