# Power-API: Universal Media Converter & Extractor

A powerful Next.js API server designed for Vercel deployment, capable of extracting media and converting formats from platforms like LinkedIn, Instagram, YouTube, and more.

## 🚀 Features

- **Multi-Platform Support**: LinkedIn, Instagram, YouTube, TikTok, Snapchat.
- **100+ Formats**: Convert to MP3, OGG, MPA, FLAC, PDF, and more.
- **Secure**: API Key validation, Origin/Referer checks, and IP logging.
- **Structured**: Clean architecture with extensible service patterns.
- **Vercel Ready**: Optimized for serverless deployment.

## 🛠 Setup & Installation

### Local Development
1. Clone the repository.
2. Run `npm install`.
3. Set environment variables in `.env.local`:
   ```env
   API_KEY=your-secret-key-here
   ```
4. Run the server:
   ```bash
   npm run dev
   ```
   Or use the provided `run.bat` on Windows.

### Deployment to Vercel
1. Push your code to GitHub.
2. Connect your repository to Vercel.
3. Add the `API_KEY` environment variable in Vercel Dashboard.
4. Deploy!

## 📡 API Documentation

### Authentication
All requests must include the `x-api-key` header.

### 1. Convert Media
**Endpoint**: `POST /api/v1/convert`

**Request Body**:
```json
{
  "url": "https://www.linkedin.com/posts/...",
  "format": "mp3" 
}
```

**Supported Formats**:
- Audio: `mp3`, `ogg`, `flac`, `wav`, etc.
- Video: `mp4`, `webm`, `mkv`, etc.
- Document: `pdf`, `docx`, etc.

### 2. List All APIs
**Endpoint**: `GET /api/v1/list`
Returns a list of 100+ available API endpoints and format handlers.

## 🔒 Security
- **IP Logging**: Every request logs the source IP for monitoring.
- **Origin Validation**: Can be configured to allow only specific domains.
- **API Key**: Required for all endpoints.

## 📁 Structure
- `/src/app/api/`: API routes.
- `/src/lib/services/`: Platform-specific extraction logic.
- `/src/lib/registry.ts`: Format and platform mappings.
- `/src/middleware.ts`: Security and logging middleware.
