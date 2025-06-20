const express = require('express');
const cors = require('cors');
const path = require('path');
const GameManager = require('./gameManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Game manager instance
const gameManager = new GameManager();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.post('/api/new-game', (req, res) => {
    try {
        const { difficulty = 'medium' } = req.body;
        const gameState = gameManager.startNewGame(difficulty);
        res.json({
            success: true,
            gameState: gameState
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/guess', (req, res) => {
    try {
        const { letter } = req.body;
        if (!letter || typeof letter !== 'string' || letter.length !== 1) {
            return res.status(400).json({
                success: false,
                error: 'Invalid input: Please provide a single letter'
            });
        }

        const result = gameManager.makeGuess(letter.toUpperCase());
        res.json({
            success: true,
            result: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/hint', (req, res) => {
    try {
        const result = gameManager.getHint();
        res.json({
            success: true,
            result: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/game-state', (req, res) => {
    try {
        const gameState = gameManager.getCurrentGameState();
        res.json({
            success: true,
            gameState: gameState
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/game-history', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const history = gameManager.getGameHistory(limit);
        res.json({
            success: true,
            history: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/statistics', (req, res) => {
    try {
        const stats = gameManager.getOverallStats();
        res.json({
            success: true,
            statistics: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/difficulty-settings', (req, res) => {
    try {
        const settings = gameManager.getDifficultySettings();
        res.json({
            success: true,
            settings: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Hangman game server is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Only start the server if this file is run directly (not on Vercel)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Hangman game server running on http://localhost:${PORT}`);
        console.log(`Game is ready to play!`);
    });
}

module.exports = app; 