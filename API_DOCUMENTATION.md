# API User Documentation & Request Guide

Welcome to the Power-API! Follow this guide to start making requests.

## 🔑 Your API Keys
You have been assigned specific API keys. Every request MUST include one of these keys in the headers.

**Header Name**: `x-api-key`  
**Example Key**: `user-key-100`

---

## 📡 Base URL
Once deployed on Vercel, your base URL will be:  
`https://your-project-name.vercel.app`

---

## 🛠 Making a Request

### 1. Media Conversion (POST)
To extract or convert media from social platforms.

- **Endpoint**: `/api/v1/convert`
- **Method**: `POST`
- **Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
  }
  ```
- **Body**:
  ```json
  {
    "url": "https://www.linkedin.com/posts/activity-...",
    "format": "mp3"
  }
  ```

### 2. Get API List (GET)
To see all available formats and sub-APIs.

- **Endpoint**: `/api/v1/list`
- **Method**: `GET`
- **Headers**:
  ```json
  {
    "x-api-key": "YOUR_API_KEY"
  }
  ```

---

## 📁 Supported Platforms & Formats

| Platform | Supported Formats |
| :--- | :--- |
| **LinkedIn** | Image, Video, PDF, MP3, OGG |
| **Instagram** | Video (MP4), Image (JPG) |
| **YouTube** | MP4, MP3, FLAC, WEBM |
| **TikTok** | MP4 (No Watermark), MP3 |
| **Snapchat** | Video, Image |

---

## 💻 Sample Code (JavaScript/Node.js)

```javascript
const axios = require('axios');

async function convertMedia() {
  try {
    const response = await axios.post('https://your-api.vercel.app/api/v1/convert', {
      url: 'https://linkedin.com/post-link',
      format: 'pdf'
    }, {
      headers: {
        'x-api-key': 'user-key-100'
      }
    });

    console.log('Results:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

convertMedia();
```

---

## ⚠️ Important Notes
- **Rate Limit**: Maximum 60 requests per minute per key.
- **IP Logging**: Your IP address is logged for security purposes.
- **Errors**: If you receive a `401 Unauthorized`, check your API key.
