const express = require('express');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

// 🚨 FIX: Import the ffmpeg-installer package
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

// 🚨 FIX: Set the path to the ffmpeg executable
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// API endpoint to get video duration from a POST request
app.post('/duration', async (req, res) => {
    const videoUrl = req.body.url;

    if (!videoUrl) {
        return res.status(400).json({
            success: false,
            error: 'Missing video URL in request body.'
        });
    }

    try {
        const info = await new Promise((resolve, reject) => {
            // Note: `ffprobe` is a method of the ffmpeg command object
            ffmpeg.ffprobe(videoUrl, (err, metadata) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(metadata);
                }
            });
        });

        const duration = info.format.duration;

        if (duration) {
            res.json({
                success: true,
                duration: duration
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Could not find duration for the provided video.'
            });
        }
    } catch (error) {
        console.error('Error fetching video duration:', error);
        res.status(500).json({
            success: false,
            error: 'An internal server error occurred.'
        });
    }
});

app.get('/duration/web', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
