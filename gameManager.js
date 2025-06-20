const MovieDatabase = require('./movieDatabase');

class GameManager {
    constructor() {
        this.movieDatabase = new MovieDatabase();
        this.currentGame = null;
        this.gameHistory = [];
        this.difficultySettings = {
            easy: {
                maxIncorrectGuesses: 8,
                wordLengthRange: [5, 6],
                hintFrequency: 2 // Every 2 incorrect guesses
            },
            medium: {
                maxIncorrectGuesses: 6,
                wordLengthRange: [6, 7],
                hintFrequency: 3
            },
            hard: {
                maxIncorrectGuesses: 4,
                wordLengthRange: [7, 8],
                hintFrequency: 0 // No hints
            }
        };
    }

    /**
     * Start a new game
     * @param {string} difficulty - 'easy', 'medium', or 'hard'
     * @returns {Object} Initial game state
     */
    startNewGame(difficulty = 'medium') {
        const settings = this.difficultySettings[difficulty] || this.difficultySettings.medium;
        const word = this.movieDatabase.getRandomWordByLength(settings.wordLengthRange);
        
        this.currentGame = {
            id: this.generateGameId(),
            word: word,
            displayWord: this.createDisplayWord(word),
            guessedLetters: new Set(),
            incorrectGuesses: 0,
            maxIncorrectGuesses: settings.maxIncorrectGuesses,
            difficulty: difficulty,
            gameStatus: 'playing', // 'playing', 'won', 'lost'
            message: `Welcome to Hangman! Difficulty: ${difficulty.toUpperCase()}. Guess the movie name.`,
            startTime: new Date(),
            hintsUsed: 0,
            hintFrequency: settings.hintFrequency,
            lastHintTime: null
        };

        return this.getCurrentGameState();
    }

    /**
     * Generate unique game ID
     * @returns {string} Unique game identifier
     */
    generateGameId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Create the initial display word with underscores
     * @param {string} word - The actual word
     * @returns {string} Display word with underscores
     */
    createDisplayWord(word) {
        return '_'.repeat(word.length);
    }

    /**
     * Process a letter guess
     * @param {string} letter - The letter to guess
     * @returns {Object} Result of the guess
     */
    makeGuess(letter) {
        if (!this.currentGame) {
            throw new Error('No active game. Start a new game first.');
        }

        if (this.currentGame.gameStatus !== 'playing') {
            throw new Error('Game is already finished. Start a new game.');
        }

        // Validate input
        if (!/^[A-Z]$/.test(letter)) {
            return {
                success: false,
                message: 'Please enter a valid letter (A-Z).',
                gameState: this.getCurrentGameState(),
                soundEffect: 'error'
            };
        }

        // Check for duplicate guess
        if (this.currentGame.guessedLetters.has(letter)) {
            return {
                success: false,
                message: `You already guessed '${letter}'. Try a different letter.`,
                gameState: this.getCurrentGameState(),
                soundEffect: 'error'
            };
        }

        // Add letter to guessed set
        this.currentGame.guessedLetters.add(letter);

        // Check if letter is in the word
        const word = this.currentGame.word;
        const letterIndices = [];
        
        for (let i = 0; i < word.length; i++) {
            if (word[i] === letter) {
                letterIndices.push(i);
            }
        }

        if (letterIndices.length > 0) {
            // Correct guess
            this.updateDisplayWord(letter, letterIndices);
            this.currentGame.message = `Great! '${letter}' is in the word.`;

            // Check if word is complete
            if (this.isWordComplete()) {
                this.currentGame.gameStatus = 'won';
                this.currentGame.endTime = new Date();
                this.currentGame.message = `Congratulations! You won! The movie was "${word}".`;
                this.saveGameToHistory();
                return {
                    success: true,
                    message: this.currentGame.message,
                    gameState: this.getCurrentGameState(),
                    soundEffect: 'win'
                };
            }

            return {
                success: true,
                message: this.currentGame.message,
                gameState: this.getCurrentGameState(),
                soundEffect: 'correct'
            };
        } else {
            // Incorrect guess
            this.currentGame.incorrectGuesses++;
            this.currentGame.message = `Sorry, '${letter}' is not in the word.`;

            // Check if game is lost
            if (this.currentGame.incorrectGuesses >= this.currentGame.maxIncorrectGuesses) {
                this.currentGame.gameStatus = 'lost';
                this.currentGame.endTime = new Date();
                this.currentGame.message = `Game Over! You lost. The movie was "${word}".`;
                this.saveGameToHistory();
                return {
                    success: true,
                    message: this.currentGame.message,
                    gameState: this.getCurrentGameState(),
                    soundEffect: 'lose'
                };
            }

            return {
                success: true,
                message: this.currentGame.message,
                gameState: this.getCurrentGameState(),
                soundEffect: 'incorrect'
            };
        }
    }

    /**
     * Get a hint for the current game
     * @returns {Object} Hint information
     */
    getHint() {
        if (!this.currentGame || this.currentGame.gameStatus !== 'playing') {
            return {
                success: false,
                message: 'No active game or game is finished.',
                soundEffect: 'error'
            };
        }

        // Check if hints are available for this difficulty
        if (this.currentGame.hintFrequency === 0) {
            return {
                success: false,
                message: 'Hints are not available in hard mode.',
                soundEffect: 'error'
            };
        }

        // Check if enough incorrect guesses have been made
        if (this.currentGame.incorrectGuesses < this.currentGame.hintFrequency) {
            return {
                success: false,
                message: `You need ${this.currentGame.hintFrequency - this.currentGame.incorrectGuesses} more incorrect guesses to get a hint.`,
                soundEffect: 'error'
            };
        }

        // Check if hint was recently used
        const now = new Date();
        if (this.currentGame.lastHintTime && 
            (now - this.currentGame.lastHintTime) < 30000) { // 30 seconds cooldown
            return {
                success: false,
                message: 'Please wait before requesting another hint.',
                soundEffect: 'error'
            };
        }

        // Generate hint
        const word = this.currentGame.word;
        const unguessedLetters = word.split('').filter(letter => 
            !this.currentGame.guessedLetters.has(letter)
        );

        if (unguessedLetters.length === 0) {
            return {
                success: false,
                message: 'No hints available - you\'ve guessed all letters!',
                soundEffect: 'error'
            };
        }

        const hintLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
        this.currentGame.hintsUsed++;
        this.currentGame.lastHintTime = now;

        return {
            success: true,
            message: `Hint: The letter '${hintLetter}' appears in the word.`,
            hintLetter: hintLetter,
            soundEffect: 'hint'
        };
    }

    /**
     * Update the display word with correctly guessed letters
     * @param {string} letter - The correctly guessed letter
     * @param {Array} indices - Array of indices where the letter appears
     */
    updateDisplayWord(letter, indices) {
        let displayWord = this.currentGame.displayWord.split('');
        indices.forEach(index => {
            displayWord[index] = letter;
        });
        this.currentGame.displayWord = displayWord.join('');
    }

    /**
     * Check if the word has been completely guessed
     * @returns {boolean} True if word is complete
     */
    isWordComplete() {
        return !this.currentGame.displayWord.includes('_');
    }

    /**
     * Save completed game to history
     */
    saveGameToHistory() {
        if (!this.currentGame) return;

        const gameRecord = {
            id: this.currentGame.id,
            word: this.currentGame.word,
            difficulty: this.currentGame.difficulty,
            gameStatus: this.currentGame.gameStatus,
            totalGuesses: this.currentGame.guessedLetters.size,
            incorrectGuesses: this.currentGame.incorrectGuesses,
            hintsUsed: this.currentGame.hintsUsed,
            startTime: this.currentGame.startTime,
            endTime: this.currentGame.endTime,
            duration: this.currentGame.endTime ? 
                Math.round((this.currentGame.endTime - this.currentGame.startTime) / 1000) : 0,
            accuracy: this.calculateAccuracy()
        };

        this.gameHistory.push(gameRecord);
        
        // Keep only last 50 games in memory
        if (this.gameHistory.length > 50) {
            this.gameHistory = this.gameHistory.slice(-50);
        }
    }

    /**
     * Calculate game accuracy
     * @returns {number} Accuracy percentage
     */
    calculateAccuracy() {
        if (!this.currentGame) return 0;
        
        const totalGuesses = this.currentGame.guessedLetters.size;
        if (totalGuesses === 0) return 0;
        
        const correctGuesses = this.currentGame.word.split('').filter(letter => 
            this.currentGame.guessedLetters.has(letter)
        ).length;
        
        return Math.round((correctGuesses / totalGuesses) * 100);
    }

    /**
     * Get the current game state
     * @returns {Object} Current game state
     */
    getCurrentGameState() {
        if (!this.currentGame) {
            return null;
        }

        return {
            id: this.currentGame.id,
            displayWord: this.currentGame.displayWord,
            guessedLetters: Array.from(this.currentGame.guessedLetters).sort(),
            incorrectGuesses: this.currentGame.incorrectGuesses,
            maxIncorrectGuesses: this.currentGame.maxIncorrectGuesses,
            remainingGuesses: this.currentGame.maxIncorrectGuesses - this.currentGame.incorrectGuesses,
            gameStatus: this.currentGame.gameStatus,
            message: this.currentGame.message,
            word: this.currentGame.gameStatus !== 'playing' ? this.currentGame.word : null,
            difficulty: this.currentGame.difficulty,
            hintsUsed: this.currentGame.hintsUsed,
            hintAvailable: this.isHintAvailable()
        };
    }

    /**
     * Check if hint is available
     * @returns {boolean} True if hint can be used
     */
    isHintAvailable() {
        if (!this.currentGame || this.currentGame.gameStatus !== 'playing') {
            return false;
        }

        if (this.currentGame.hintFrequency === 0) {
            return false;
        }

        if (this.currentGame.incorrectGuesses < this.currentGame.hintFrequency) {
            return false;
        }

        if (this.currentGame.lastHintTime) {
            const now = new Date();
            return (now - this.currentGame.lastHintTime) >= 30000; // 30 seconds cooldown
        }

        return true;
    }

    /**
     * Get game statistics
     * @returns {Object} Game statistics
     */
    getGameStats() {
        if (!this.currentGame) {
            return {
                totalGuesses: 0,
                correctGuesses: 0,
                incorrectGuesses: 0,
                accuracy: 0
            };
        }

        const totalGuesses = this.currentGame.guessedLetters.size;
        const correctGuesses = this.currentGame.word.split('').filter(letter => 
            this.currentGame.guessedLetters.has(letter)
        ).length;
        const accuracy = totalGuesses > 0 ? (correctGuesses / totalGuesses * 100).toFixed(1) : 0;

        return {
            totalGuesses,
            correctGuesses,
            incorrectGuesses: this.currentGame.incorrectGuesses,
            accuracy
        };
    }

    /**
     * Get game history
     * @param {number} limit - Number of games to return (default: 10)
     * @returns {Array} Array of game records
     */
    getGameHistory(limit = 10) {
        return this.gameHistory.slice(-limit).reverse();
    }

    /**
     * Get difficulty settings
     * @returns {Object} Difficulty configuration
     */
    getDifficultySettings() {
        return this.difficultySettings;
    }

    /**
     * Get overall statistics
     * @returns {Object} Overall game statistics
     */
    getOverallStats() {
        if (this.gameHistory.length === 0) {
            return {
                totalGames: 0,
                wins: 0,
                losses: 0,
                winRate: 0,
                averageAccuracy: 0,
                averageDuration: 0,
                difficultyBreakdown: {}
            };
        }

        const totalGames = this.gameHistory.length;
        const wins = this.gameHistory.filter(game => game.gameStatus === 'won').length;
        const losses = this.gameHistory.filter(game => game.gameStatus === 'lost').length;
        const winRate = Math.round((wins / totalGames) * 100);
        
        const totalAccuracy = this.gameHistory.reduce((sum, game) => sum + game.accuracy, 0);
        const averageAccuracy = Math.round(totalAccuracy / totalGames);
        
        const totalDuration = this.gameHistory.reduce((sum, game) => sum + game.duration, 0);
        const averageDuration = Math.round(totalDuration / totalGames);

        const difficultyBreakdown = {};
        Object.keys(this.difficultySettings).forEach(difficulty => {
            const difficultyGames = this.gameHistory.filter(game => game.difficulty === difficulty);
            difficultyBreakdown[difficulty] = {
                total: difficultyGames.length,
                wins: difficultyGames.filter(game => game.gameStatus === 'won').length,
                winRate: difficultyGames.length > 0 ? 
                    Math.round((difficultyGames.filter(game => game.gameStatus === 'won').length / difficultyGames.length) * 100) : 0
            };
        });

        return {
            totalGames,
            wins,
            losses,
            winRate,
            averageAccuracy,
            averageDuration,
            difficultyBreakdown
        };
    }
}

module.exports = GameManager; 