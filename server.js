const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');


const app = express();
const port = 3000;

app.use(express.json());


app.get("/duration/web", (req, res) => {
    res.sendFile(path.join(__dirname, 'app.html'));
});

app.post('/duration', async (req, res) => {
    const videoUrl = req.body.url;

    if (!videoUrl) {
        return res.status(400).json({
            success: false,
            error: 'Missing video URL in request body. Please provide a JSON object with a "url" key.'
        });
    }

    try {
        const info = await new Promise((resolve, reject) => {
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

app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
});