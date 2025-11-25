// Voice Transcribe - Audio Recorder with Cloud Storage
// ====================================================

class VoiceTranscribe {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioBlob = null;
        this.audioStream = null;
        this.audioContext = null;
        this.analyser = null;
        this.animationId = null;
        this.startTime = null;
        this.timerInterval = null;
        this.config = this.loadConfig();

        this.initializeElements();
        this.attachEventListeners();
        this.updateStorageTypeVisibility();
        this.loadRecordings();
    }

    initializeElements() {
        // Buttons
        this.recordBtn = document.getElementById('record-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.playBtn = document.getElementById('play-btn');
        this.uploadBtn = document.getElementById('upload-btn');
        this.saveConfigBtn = document.getElementById('save-config');

        // Status elements
        this.statusDot = document.getElementById('status-dot');
        this.statusText = document.getElementById('status-text');
        this.timer = document.getElementById('timer');
        this.fileInfo = document.getElementById('file-info');

        // Audio elements
        this.audioPlayer = document.getElementById('audio-player');
        this.audioPlayerContainer = document.getElementById('audio-player-container');

        // Visualizer
        this.visualizerCanvas = document.getElementById('visualizer-canvas');
        this.canvasContext = this.visualizerCanvas.getContext('2d');

        // Config inputs
        this.storageTypeSelect = document.getElementById('storage-type');

        // Recordings list
        this.recordingsContainer = document.getElementById('recordings-container');

        // Notification
        this.notification = document.getElementById('notification');
    }

    attachEventListeners() {
        this.recordBtn.addEventListener('click', () => this.startRecording());
        this.stopBtn.addEventListener('click', () => this.stopRecording());
        this.playBtn.addEventListener('click', () => this.playRecording());
        this.uploadBtn.addEventListener('click', () => this.uploadToCloud());
        this.saveConfigBtn.addEventListener('click', () => this.saveConfiguration());
        this.storageTypeSelect.addEventListener('change', () => this.updateStorageTypeVisibility());
    }

    async startRecording() {
        try {
            // Request microphone access
            this.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });

            // Set up audio context for visualization
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioContext.createMediaStreamSource(this.audioStream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            source.connect(this.analyser);

            // Start visualization
            this.visualize();

            // Set up media recorder
            const mimeType = this.getSupportedMimeType();
            this.mediaRecorder = new MediaRecorder(this.audioStream, {
                mimeType: mimeType,
                audioBitsPerSecond: 128000
            });

            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.audioBlob = new Blob(this.audioChunks, { type: mimeType });
                const audioUrl = URL.createObjectURL(this.audioBlob);
                this.audioPlayer.src = audioUrl;
                this.audioPlayerContainer.style.display = 'block';

                // Update file info
                const sizeMB = (this.audioBlob.size / (1024 * 1024)).toFixed(2);
                this.fileInfo.textContent = `Recording size: ${sizeMB} MB`;

                // Enable buttons
                this.playBtn.disabled = false;
                this.uploadBtn.disabled = false;
            };

            this.mediaRecorder.start(1000); // Collect data every second

            // Update UI
            this.updateStatus('recording', 'Recording...');
            this.recordBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.playBtn.disabled = true;
            this.uploadBtn.disabled = true;

            // Start timer
            this.startTimer();

            this.showNotification('Recording started', 'success');
        } catch (error) {
            console.error('Error accessing microphone:', error);
            this.showNotification('Failed to access microphone. Please grant permission.', 'error');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();

            // Stop all audio tracks
            if (this.audioStream) {
                this.audioStream.getTracks().forEach(track => track.stop());
            }

            // Stop visualization
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }

            // Close audio context
            if (this.audioContext) {
                this.audioContext.close();
            }

            // Stop timer
            this.stopTimer();

            // Update UI
            this.updateStatus('ready', 'Recording complete');
            this.recordBtn.disabled = false;
            this.stopBtn.disabled = true;

            this.showNotification('Recording stopped', 'info');
        }
    }

    playRecording() {
        if (this.audioPlayer.paused) {
            this.audioPlayer.play();
            this.playBtn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
        } else {
            this.audioPlayer.pause();
            this.playBtn.innerHTML = '<span class="btn-icon">▶️</span> Play';
        }
    }

    async uploadToCloud() {
        if (!this.audioBlob) {
            this.showNotification('No recording to upload', 'error');
            return;
        }

        if (!this.validateConfig()) {
            this.showNotification('Please configure cloud storage settings first', 'error');
            return;
        }

        const storageType = this.config.storageType;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `recording-${timestamp}.webm`;

        try {
            this.uploadBtn.disabled = true;
            this.uploadBtn.innerHTML = '<span class="btn-icon">⏳</span> Uploading...';

            let uploadResult;

            if (storageType === 's3') {
                uploadResult = await this.uploadToS3(filename);
            } else if (storageType === 'gcs') {
                uploadResult = await this.uploadToGCS(filename);
            } else if (storageType === 'azure') {
                uploadResult = await this.uploadToAzure(filename);
            }

            // Save recording metadata
            this.saveRecording({
                filename: filename,
                timestamp: new Date().toISOString(),
                size: this.audioBlob.size,
                url: uploadResult.url,
                storageType: storageType
            });

            this.showNotification('Recording uploaded successfully!', 'success');
            this.loadRecordings();

            // Reset state
            this.audioBlob = null;
            this.audioPlayer.src = '';
            this.audioPlayerContainer.style.display = 'none';
            this.fileInfo.textContent = '';
            this.uploadBtn.disabled = true;
            this.playBtn.disabled = true;
            this.uploadBtn.innerHTML = '<span class="btn-icon">☁️</span> Upload to Cloud';

        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification(`Upload failed: ${error.message}`, 'error');
            this.uploadBtn.disabled = false;
            this.uploadBtn.innerHTML = '<span class="btn-icon">☁️</span> Upload to Cloud';
        }
    }

    async uploadToS3(filename) {
        const { bucket, region, accessKeyId, secretAccessKey } = this.config.s3;

        // Create AWS Signature V4
        const url = `https://${bucket}.s3.${region}.amazonaws.com/${filename}`;

        // For production, you should use AWS SDK or a backend service
        // This is a simplified example using presigned URLs
        const formData = new FormData();
        formData.append('file', this.audioBlob, filename);

        // Note: In production, you should generate presigned URLs from your backend
        // This direct upload requires CORS configuration on your S3 bucket
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': this.audioBlob.type,
                'x-amz-acl': 'private'
            },
            body: this.audioBlob
        });

        if (!response.ok) {
            throw new Error(`S3 upload failed: ${response.statusText}`);
        }

        return { url: url };
    }

    async uploadToGCS(filename) {
        const { bucket, apiKey } = this.config.gcs;

        const url = `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${filename}&key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': this.audioBlob.type
            },
            body: this.audioBlob
        });

        if (!response.ok) {
            throw new Error(`GCS upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        return { url: `https://storage.googleapis.com/${bucket}/${filename}` };
    }

    async uploadToAzure(filename) {
        const { account, container, sasToken } = this.config.azure;

        const url = `https://${account}.blob.core.windows.net/${container}/${filename}?${sasToken}`;

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'x-ms-blob-type': 'BlockBlob',
                'Content-Type': this.audioBlob.type
            },
            body: this.audioBlob
        });

        if (!response.ok) {
            throw new Error(`Azure upload failed: ${response.statusText}`);
        }

        return { url: url.split('?')[0] };
    }

    visualize() {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const width = this.visualizerCanvas.width = this.visualizerCanvas.offsetWidth;
        const height = this.visualizerCanvas.height = this.visualizerCanvas.offsetHeight;

        const draw = () => {
            this.animationId = requestAnimationFrame(draw);

            this.analyser.getByteTimeDomainData(dataArray);

            this.canvasContext.fillStyle = '#334155';
            this.canvasContext.fillRect(0, 0, width, height);

            this.canvasContext.lineWidth = 2;
            this.canvasContext.strokeStyle = '#6366f1';
            this.canvasContext.beginPath();

            const sliceWidth = width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * height) / 2;

                if (i === 0) {
                    this.canvasContext.moveTo(x, y);
                } else {
                    this.canvasContext.lineTo(x, y);
                }

                x += sliceWidth;
            }

            this.canvasContext.lineTo(width, height / 2);
            this.canvasContext.stroke();
        };

        draw();
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            this.timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateStatus(status, text) {
        this.statusDot.className = `status-dot ${status}`;
        this.statusText.textContent = text;
    }

    saveConfiguration() {
        const storageType = this.storageTypeSelect.value;

        const config = {
            storageType: storageType,
            s3: {
                bucket: document.getElementById('s3-bucket').value,
                region: document.getElementById('s3-region').value,
                accessKeyId: document.getElementById('s3-access-key').value,
                secretAccessKey: document.getElementById('s3-secret-key').value
            },
            gcs: {
                bucket: document.getElementById('gcs-bucket').value,
                apiKey: document.getElementById('gcs-api-key').value
            },
            azure: {
                account: document.getElementById('azure-account').value,
                container: document.getElementById('azure-container').value,
                sasToken: document.getElementById('azure-sas').value
            }
        };

        localStorage.setItem('voiceTranscribeConfig', JSON.stringify(config));
        this.config = config;
        this.showNotification('Configuration saved successfully', 'success');
    }

    loadConfig() {
        const saved = localStorage.getItem('voiceTranscribeConfig');
        if (saved) {
            const config = JSON.parse(saved);

            // Populate form fields
            if (config.storageType) {
                document.getElementById('storage-type').value = config.storageType;
            }

            if (config.s3) {
                document.getElementById('s3-bucket').value = config.s3.bucket || '';
                document.getElementById('s3-region').value = config.s3.region || '';
                document.getElementById('s3-access-key').value = config.s3.accessKeyId || '';
                document.getElementById('s3-secret-key').value = config.s3.secretAccessKey || '';
            }

            if (config.gcs) {
                document.getElementById('gcs-bucket').value = config.gcs.bucket || '';
                document.getElementById('gcs-api-key').value = config.gcs.apiKey || '';
            }

            if (config.azure) {
                document.getElementById('azure-account').value = config.azure.account || '';
                document.getElementById('azure-container').value = config.azure.container || '';
                document.getElementById('azure-sas').value = config.azure.sasToken || '';
            }

            return config;
        }

        return {
            storageType: 's3',
            s3: {},
            gcs: {},
            azure: {}
        };
    }

    validateConfig() {
        const { storageType } = this.config;

        if (storageType === 's3') {
            return this.config.s3.bucket && this.config.s3.region &&
                   this.config.s3.accessKeyId && this.config.s3.secretAccessKey;
        } else if (storageType === 'gcs') {
            return this.config.gcs.bucket && this.config.gcs.apiKey;
        } else if (storageType === 'azure') {
            return this.config.azure.account && this.config.azure.container &&
                   this.config.azure.sasToken;
        }

        return false;
    }

    updateStorageTypeVisibility() {
        const storageType = this.storageTypeSelect.value;

        document.querySelectorAll('.s3-config').forEach(el => {
            el.style.display = storageType === 's3' ? 'flex' : 'none';
        });

        document.querySelectorAll('.gcs-config').forEach(el => {
            el.style.display = storageType === 'gcs' ? 'flex' : 'none';
        });

        document.querySelectorAll('.azure-config').forEach(el => {
            el.style.display = storageType === 'azure' ? 'flex' : 'none';
        });
    }

    saveRecording(metadata) {
        const recordings = JSON.parse(localStorage.getItem('recordings') || '[]');
        recordings.unshift(metadata);
        localStorage.setItem('recordings', JSON.stringify(recordings));
    }

    loadRecordings() {
        const recordings = JSON.parse(localStorage.getItem('recordings') || '[]');

        if (recordings.length === 0) {
            this.recordingsContainer.innerHTML = '<p class="empty-state">No recordings uploaded yet</p>';
            return;
        }

        this.recordingsContainer.innerHTML = recordings.map((rec, index) => `
            <div class="recording-item">
                <div class="recording-item-info">
                    <h3>${rec.filename}</h3>
                    <div class="recording-item-meta">
                        ${new Date(rec.timestamp).toLocaleString()} •
                        ${(rec.size / (1024 * 1024)).toFixed(2)} MB •
                        ${rec.storageType.toUpperCase()}
                    </div>
                </div>
                <div class="recording-item-actions">
                    <button class="btn btn-secondary" onclick="app.copyUrl('${rec.url}')">
                        📋 Copy URL
                    </button>
                    <button class="btn btn-danger" onclick="app.deleteRecording(${index})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    copyUrl(url) {
        navigator.clipboard.writeText(url).then(() => {
            this.showNotification('URL copied to clipboard', 'success');
        }).catch(err => {
            this.showNotification('Failed to copy URL', 'error');
        });
    }

    deleteRecording(index) {
        if (confirm('Are you sure you want to delete this recording from the list?')) {
            const recordings = JSON.parse(localStorage.getItem('recordings') || '[]');
            recordings.splice(index, 1);
            localStorage.setItem('recordings', JSON.stringify(recordings));
            this.loadRecordings();
            this.showNotification('Recording deleted from list', 'info');
        }
    }

    getSupportedMimeType() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/mp4'
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }

        return 'audio/webm';
    }

    showNotification(message, type = 'info') {
        this.notification.textContent = message;
        this.notification.className = `notification ${type} show`;

        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new VoiceTranscribe();
});
