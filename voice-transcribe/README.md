# Voice Transcribe

A web-based audio recording application that allows you to record audio from your microphone and automatically upload it to cloud storage (Amazon S3, Google Cloud Storage, or Azure Blob Storage).

## Features

- 🎤 **High-Quality Audio Recording** - Record audio directly from your browser with noise suppression and echo cancellation
- 📊 **Real-time Visualization** - See your audio waveform in real-time while recording
- ☁️ **Cloud Storage Integration** - Upload recordings to AWS S3, Google Cloud Storage, or Azure Blob Storage
- 💾 **Local Playback** - Preview recordings before uploading
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔒 **Secure** - Credentials stored locally in browser storage

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Microphone access
- Cloud storage account (AWS S3, Google Cloud Storage, or Azure)

### Installation

1. Open `index.html` in your web browser
2. Grant microphone permissions when prompted
3. Configure your cloud storage settings

## Cloud Storage Configuration

### Amazon S3

1. Create an S3 bucket in AWS
2. Configure CORS settings on your bucket:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "POST", "GET"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]
```

3. Create an IAM user with S3 upload permissions
4. In the application, select "Amazon S3" and enter:
   - Bucket Name
   - AWS Region (e.g., us-east-1)
   - Access Key ID
   - Secret Access Key

**Note:** For production use, consider using presigned URLs generated from a backend service instead of storing credentials in the browser.

### Google Cloud Storage

1. Create a GCS bucket
2. Enable CORS on your bucket:

```json
[
    {
        "origin": ["*"],
        "method": ["PUT", "POST", "GET"],
        "responseHeader": ["Content-Type"],
        "maxAgeSeconds": 3600
    }
]
```

3. Create an API key with Cloud Storage permissions
4. In the application, select "Google Cloud Storage" and enter:
   - Bucket Name
   - API Key

### Azure Blob Storage

1. Create an Azure Storage Account
2. Create a container for storing recordings
3. Generate a SAS token with write permissions
4. In the application, select "Azure Blob Storage" and enter:
   - Storage Account Name
   - Container Name
   - SAS Token

## Usage

### Recording Audio

1. Click the **Start Recording** button
2. Speak into your microphone
3. Watch the waveform visualizer to see your audio
4. Click **Stop Recording** when finished

### Playing Back

1. After stopping a recording, click **Play** to preview it
2. Use the built-in audio player controls to play/pause

### Uploading to Cloud

1. Ensure your cloud storage is configured (see Configuration section)
2. After recording, click **Upload to Cloud**
3. Your recording will be uploaded and saved to the configured storage
4. The recording will appear in the "Uploaded Recordings" list

### Managing Recordings

- **Copy URL** - Copy the cloud storage URL to your clipboard
- **Delete** - Remove the recording from the local list (does not delete from cloud storage)

## Architecture

### Frontend Components

- **index.html** - Main application structure
- **style.css** - Modern, responsive styling with gradient themes
- **app.js** - Core application logic

### Key Technologies

- **MediaRecorder API** - Browser API for capturing audio
- **Web Audio API** - Real-time audio visualization
- **Canvas API** - Waveform rendering
- **Local Storage** - Configuration and metadata persistence
- **Fetch API** - Cloud storage uploads

## Security Considerations

### Important Notes

1. **Credentials Storage** - This demo stores cloud credentials in browser localStorage. For production:
   - Use a backend service to handle uploads
   - Generate presigned URLs from your backend
   - Never expose credentials in client-side code

2. **CORS Configuration** - Ensure your cloud storage buckets are properly configured with CORS rules

3. **Access Control** - Configure appropriate bucket policies and IAM permissions to restrict access

### Recommended Production Architecture

```
Browser → Backend API → Cloud Storage
         ↓
    Generate Presigned URL
```

This approach:
- Keeps credentials secure on the backend
- Provides better access control
- Allows for additional processing (transcription, format conversion, etc.)

## Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari 14.1+
- ✅ Opera

## Troubleshooting

### Microphone Access Denied
- Check browser permissions
- Ensure you're accessing via HTTPS (or localhost)

### Upload Fails
- Verify cloud storage credentials
- Check CORS configuration on your bucket
- Ensure bucket/container exists
- Verify IAM/API permissions

### No Audio Waveform
- Check microphone connection
- Try refreshing the page
- Verify browser supports Web Audio API

## Future Enhancements

- [ ] Audio transcription using speech-to-text APIs
- [ ] Multiple audio format support
- [ ] Batch upload functionality
- [ ] Recording editing and trimming
- [ ] Backend integration for secure credential management
- [ ] Audio compression before upload
- [ ] Recording tags and metadata

## License

This project is provided as-is for demonstration purposes.

## Support

For issues or questions, please refer to the main project repository.
