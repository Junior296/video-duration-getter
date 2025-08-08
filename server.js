const express = require('express');
const path = require('path');
// 🚨 FIX: Use the new ffprobe packages
const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');

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
        // 🚨 FIX: Use the ffprobe function wrapped in a Promise
        const info = await new Promise((resolve, reject) => {
            ffprobe(videoUrl, { path: ffprobeStatic.path }, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });

        const duration = info.streams[0].duration;

        if (duration) {
            res.json({
                success: true,
                duration: Math.floor(duration)
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

// Endpoint to serve the web page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
