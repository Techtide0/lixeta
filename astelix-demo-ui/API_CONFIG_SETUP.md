# API Configuration Setup

This project now uses dynamic API configuration that automatically switches between localhost and production URLs.

## How It Works

The API configuration is managed through [src/config/apiConfig.ts](src/config/apiConfig.ts), which:

1. **Development Mode**: Automatically uses `http://localhost:3000`
2. **Production Mode**: Uses `https://lixeta.onrender.com` (or custom URL from environment variables)

## Configuration Options

### Option 1: Environment Variables (Recommended)

Create or edit `.env.local` in the project root:

```env
# For development (leave blank to use localhost:3000)
VITE_REACT_APP_API_URL=

# For production
# VITE_REACT_APP_API_URL=https://lixeta.onrender.com
```

### Option 2: Build-time Configuration

The configuration automatically detects the build environment:
- `npm run dev` → Uses localhost
- `npm run build` → Uses production URL from environment or defaults to `https://lixeta.onrender.com`

## Files Updated

1. **[src/config/apiConfig.ts](src/config/apiConfig.ts)** - New configuration file with API hooks
2. **[src/services/demoApi.js](src/services/demoApi.js)** - Updated to use API config
3. **[src/App.tsx](src/App.tsx)** - Updated to use API config
4. **[src/components/MissingFeatures.tsx](src/components/MissingFeatures.tsx)** - Updated to use API config

## Usage in Components

```tsx
import { API_CONFIG, useApiUrl, buildApiUrl } from './config/apiConfig';

// Get the base URL
const baseUrl = API_CONFIG.baseUrl;

// Or use the hook in React components
const MyComponent = () => {
  const apiUrl = useApiUrl();
  return <div>Connected to: {apiUrl}</div>;
};

// Build full API URLs
const fullUrl = buildApiUrl('/api/demo/fintech-login');
```

## Deployment

For production deployment to your render.com or other hosting:

1. Set environment variable:
   ```
   VITE_REACT_APP_API_URL=https://lixeta.onrender.com
   ```

2. Or let it auto-detect in production mode (will use the default `https://lixeta.onrender.com`)

3. Build and deploy:
   ```bash
   npm run build
   ```

## Testing

- **Local Development**: `npm run dev` → Connects to `http://localhost:3000`
- **Production Build**: `npm run build` → Connects to `https://lixeta.onrender.com` (or custom URL)
