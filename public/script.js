/**
 * Hangman Game - Frontend JavaScript
 * Handles game logic, UI interactions, and API communication
 */

class HangmanGame {
    constructor() {
        this.currentGame = null;
        this.selectedDifficulty = 'medium';
        this.soundManager = new SoundManager();
        this.gameStats = {
            wins: 0,
            losses: 0,
            winRate: 0
        };
        
        this.initializeElements();
        this.bindEvents();
        this.loadGameState();
        this.updateStats();
        this.initializeSound();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        // Game elements
        this.wordContainer = document.getElementById('wordContainer');
        this.messageElement = document.getElementById('message');
        this.livesElement = document.getElementById('lives');
        this.winsElement = document.getElementById('wins');
        this.lossesElement = document.getElementById('losses');
        this.winRateElement = document.getElementById('winRate');
        this.guessedLettersElement = document.getElementById('guessedLetters');
        this.letterInput = document.getElementById('letterInput');
        this.guessBtn = document.getElementById('guessBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.hintBtn = document.getElementById('hintBtn');
        this.historyBtn = document.getElementById('historyBtn');
        this.statsBtn = document.getElementById('statsBtn');
        
        // Difficulty elements
        this.difficultySection = document.getElementById('difficultySection');
        this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
        
        // Sound and theme elements
        this.soundToggle = document.getElementById('soundToggle');
        this.themeToggle = document.getElementById('themeToggle');
        
        // Modal elements
        this.gameOverModal = document.getElementById('gameOverModal');
        this.historyModal = document.getElementById('historyModal');
        this.statsModal = document.getElementById('statsModal');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // Game over modal elements
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.finalWord = document.getElementById('finalWord');
        this.totalGuesses = document.getElementById('totalGuesses');
        this.accuracy = document.getElementById('accuracy');
        this.finalDifficulty = document.getElementById('finalDifficulty');
        this.hintsUsed = document.getElementById('hintsUsed');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        
        // History and stats elements
        this.historyContainer = document.getElementById('historyContainer');
        this.statsContainer = document.getElementById('statsContainer');
        this.closeHistoryBtn = document.getElementById('closeHistoryBtn');
        this.closeStatsBtn = document.getElementById('closeStatsBtn');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Game controls
        this.guessBtn.addEventListener('click', () => this.makeGuess());
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.hintBtn.addEventListener('click', () => this.getHint());
        this.historyBtn.addEventListener('click', () => this.showHistory());
        this.statsBtn.addEventListener('click', () => this.showStats());
        
        // Input handling
        this.letterInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.makeGuess();
            }
        });
        
        this.letterInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
        });
        
        // Difficulty selection
        this.difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectDifficulty(btn.dataset.difficulty);
            });
        });
        
        // Sound and theme controls
        this.soundToggle.addEventListener('click', () => this.toggleSound());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Modal controls
        this.playAgainBtn.addEventListener('click', () => {
            this.closeModal();
            this.startNewGame();
        });
        
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.closeHistoryBtn.addEventListener('click', () => this.closeHistoryModal());
        this.closeStatsBtn.addEventListener('click', () => this.closeStatsModal());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 't':
                        e.preventDefault();
                        this.toggleTheme();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.toggleSound();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.startNewGame();
                        break;
                    case 'h':
                        e.preventDefault();
                        this.getHint();
                        break;
                }
            }
        });
        
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target === this.gameOverModal) this.closeModal();
            if (e.target === this.historyModal) this.closeHistoryModal();
            if (e.target === this.statsModal) this.closeStatsModal();
        });
    }

    /**
     * Initialize sound system
     */
    initializeSound() {
        // Initialize audio context on first user interaction
        document.addEventListener('click', () => {
            this.soundManager.initialize();
        }, { once: true });
        
        // Update sound toggle button state
        this.updateSoundToggle();
    }

    /**
     * Load game state from localStorage
     */
    loadGameState() {
        const savedStats = localStorage.getItem('hangmanStats');
        if (savedStats) {
            this.gameStats = JSON.parse(savedStats);
        }
        
        const savedDifficulty = localStorage.getItem('hangmanDifficulty');
        if (savedDifficulty) {
            this.selectedDifficulty = savedDifficulty;
            this.updateDifficultyButtons();
        }
        
        // Load theme preference
        const savedTheme = localStorage.getItem('hangmanTheme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            // Auto-detect system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        }
    }

    /**
     * Save game state to localStorage
     */
    saveGameState() {
        localStorage.setItem('hangmanStats', JSON.stringify(this.gameStats));
        localStorage.setItem('hangmanDifficulty', this.selectedDifficulty);
    }

    /**
     * Start a new game
     */
    async startNewGame() {
        this.showLoading(true);
        this.soundManager.play('click');
        
        try {
            const response = await fetch('/api/new-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ difficulty: this.selectedDifficulty })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentGame = data.gameState;
                this.updateUI();
                this.enableInput();
                this.soundManager.play('toggle');
            } else {
                this.showMessage('Failed to start new game', 'error');
            }
        } catch (error) {
            console.error('Error starting new game:', error);
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Make a letter guess
     */
    async makeGuess() {
        const letter = this.letterInput.value.trim();
        
        if (!letter || !this.currentGame) {
            return;
        }
        
        this.soundManager.play('click');
        
        try {
            const response = await fetch('/api/guess', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ letter: letter })
            });
            
            const data = await response.json();
            
            if (data.success) {
                const result = data.result;
                this.currentGame = result.gameState;
                
                // Play sound effect
                if (result.soundEffect) {
                    this.soundManager.play(result.soundEffect);
                }
                
                this.updateUI();
                this.letterInput.value = '';
                
                // Check if game is over
                if (this.currentGame.gameStatus !== 'playing') {
                    this.handleGameOver();
                }
            } else {
                this.showMessage(data.error || 'Invalid guess', 'error');
                this.soundManager.play('error');
            }
        } catch (error) {
            console.error('Error making guess:', error);
            this.showMessage('Network error. Please try again.', 'error');
            this.soundManager.play('error');
        }
    }

    /**
     * Get a hint
     */
    async getHint() {
        if (!this.currentGame || this.currentGame.gameStatus !== 'playing') {
            return;
        }
        
        this.soundManager.play('click');
        
        try {
            const response = await fetch('/api/hint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                const result = data.result;
                
                if (result.success) {
                    this.showMessage(result.message, 'info');
                    this.soundManager.play('hint');
                    
                    // Update hint availability
                    this.currentGame.hintAvailable = this.currentGame.isHintAvailable();
                    this.updateHintButton();
                } else {
                    this.showMessage(result.message, 'error');
                    this.soundManager.play('error');
                }
            } else {
                this.showMessage('Failed to get hint', 'error');
                this.soundManager.play('error');
            }
        } catch (error) {
            console.error('Error getting hint:', error);
            this.showMessage('Network error. Please try again.', 'error');
            this.soundManager.play('error');
        }
    }

    /**
     * Handle game over
     */
    handleGameOver() {
        this.disableInput();
        this.updateStats();
        this.saveGameState();
        
        // Show game over modal
        this.showGameOverModal();
    }

    /**
     * Show game over modal
     */
    showGameOverModal() {
        if (!this.currentGame) return;
        
        const isWon = this.currentGame.gameStatus === 'won';
        
        this.modalTitle.textContent = isWon ? 'Congratulations!' : 'Game Over';
        this.modalMessage.textContent = this.currentGame.message;
        this.finalWord.textContent = this.currentGame.word;
        this.totalGuesses.textContent = this.currentGame.guessedLetters.length;
        this.accuracy.textContent = this.calculateAccuracy() + '%';
        this.finalDifficulty.textContent = this.currentGame.difficulty.charAt(0).toUpperCase() + this.currentGame.difficulty.slice(1);
        this.hintsUsed.textContent = this.currentGame.hintsUsed;
        
        this.gameOverModal.style.display = 'block';
    }

    /**
     * Close game over modal
     */
    closeModal() {
        this.gameOverModal.style.display = 'none';
    }

    /**
     * Show game history
     */
    async showHistory() {
        this.soundManager.play('click');
        this.showLoading(true);
        
        try {
            const response = await fetch('/api/game-history?limit=20');
            const data = await response.json();
            
            if (data.success) {
                this.displayHistory(data.history);
                this.historyModal.style.display = 'block';
            } else {
                this.showMessage('Failed to load history', 'error');
            }
        } catch (error) {
            console.error('Error loading history:', error);
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Display game history
     */
    displayHistory(history) {
        if (history.length === 0) {
            this.historyContainer.innerHTML = '<p class="text-center">No games played yet.</p>';
            return;
        }
        
        this.historyContainer.innerHTML = history.map(game => `
            <div class="history-item ${game.gameStatus}">
                <h4>${game.word}</h4>
                <div class="history-details">
                    <span><i class="fas fa-${game.gameStatus === 'won' ? 'trophy' : 'times-circle'}"></i> ${game.gameStatus.toUpperCase()}</span>
                    <span><i class="fas fa-layer-group"></i> ${game.difficulty}</span>
                    <span><i class="fas fa-crosshairs"></i> ${game.totalGuesses} guesses</span>
                    <span><i class="fas fa-heart-broken"></i> ${game.incorrectGuesses} wrong</span>
                    <span><i class="fas fa-lightbulb"></i> ${game.hintsUsed} hints</span>
                    <span><i class="fas fa-clock"></i> ${game.duration}s</span>
                    <span><i class="fas fa-percentage"></i> ${game.accuracy}%</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Close history modal
     */
    closeHistoryModal() {
        this.historyModal.style.display = 'none';
    }

    /**
     * Show game statistics
     */
    async showStats() {
        this.soundManager.play('click');
        this.showLoading(true);
        
        try {
            const response = await fetch('/api/statistics');
            const data = await response.json();
            
            if (data.success) {
                this.displayStats(data.statistics);
                this.statsModal.style.display = 'block';
            } else {
                this.showMessage('Failed to load statistics', 'error');
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Display game statistics
     */
    displayStats(stats) {
        if (stats.totalGames === 0) {
            this.statsContainer.innerHTML = '<p class="text-center">No games played yet.</p>';
            return;
        }
        
        this.statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stats-card">
                    <h3>Total Games</h3>
                    <div class="stat-value">${stats.totalGames}</div>
                    <div class="stat-label">Games Played</div>
                </div>
                <div class="stats-card">
                    <h3>Win Rate</h3>
                    <div class="stat-value">${stats.winRate}%</div>
                    <div class="stat-label">Success Rate</div>
                </div>
                <div class="stats-card">
                    <h3>Average Accuracy</h3>
                    <div class="stat-value">${stats.averageAccuracy}%</div>
                    <div class="stat-label">Guess Accuracy</div>
                </div>
                <div class="stats-card">
                    <h3>Average Time</h3>
                    <div class="stat-value">${stats.averageDuration}s</div>
                    <div class="stat-label">Per Game</div>
                </div>
            </div>
            
            <div class="difficulty-stats">
                <h3>Performance by Difficulty</h3>
                ${Object.entries(stats.difficultyBreakdown).map(([difficulty, data]) => `
                    <div class="difficulty-bar">
                        <div class="difficulty-bar-header">
                            <span class="difficulty-name ${difficulty}">
                                <i class="fas fa-${difficulty === 'easy' ? 'seedling' : difficulty === 'medium' ? 'leaf' : 'fire'}"></i>
                                ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                            </span>
                            <span>${data.winRate}% Win Rate</span>
                        </div>
                        <div class="difficulty-stats-details">
                            <span>${data.total} games played</span>
                            <span>${data.wins} wins, ${data.total - data.wins} losses</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Close stats modal
     */
    closeStatsModal() {
        this.statsModal.style.display = 'none';
    }

    /**
     * Select difficulty level
     */
    selectDifficulty(difficulty) {
        this.selectedDifficulty = difficulty;
        this.updateDifficultyButtons();
        this.saveGameState();
        this.soundManager.play('toggle');
    }

    /**
     * Update difficulty buttons
     */
    updateDifficultyButtons() {
        this.difficultyButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.difficulty === this.selectedDifficulty) {
                btn.classList.add('active');
            }
        });
    }

    /**
     * Toggle sound on/off
     */
    toggleSound() {
        this.soundManager.toggle();
        this.updateSoundToggle();
    }

    /**
     * Update sound toggle button
     */
    updateSoundToggle() {
        if (this.soundManager.isEnabled()) {
            this.soundToggle.classList.remove('muted');
        } else {
            this.soundToggle.classList.add('muted');
        }
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('hangmanTheme', newTheme);
        
        this.soundManager.play('toggle');
    }

    /**
     * Update the UI with current game state
     */
    updateUI() {
        if (!this.currentGame) return;
        
        // Update word display
        this.updateWordDisplay();
        
        // Update message
        this.messageElement.textContent = this.currentGame.message;
        
        // Update lives
        this.livesElement.textContent = this.currentGame.remainingGuesses;
        
        // Update guessed letters
        this.updateGuessedLetters();
        
        // Update hangman visual
        this.updateHangmanVisual();
        
        // Update hint button
        this.updateHintButton();
    }

    /**
     * Update word display
     */
    updateWordDisplay() {
        this.wordContainer.innerHTML = '';
        
        for (let i = 0; i < this.currentGame.displayWord.length; i++) {
            const letter = this.currentGame.displayWord[i];
            const letterBox = document.createElement('div');
            letterBox.className = 'letter-box';
            
            if (letter === '_') {
                letterBox.classList.add('empty');
            } else {
                letterBox.classList.add('revealed');
                letterBox.textContent = letter;
            }
            
            this.wordContainer.appendChild(letterBox);
        }
    }

    /**
     * Update guessed letters display
     */
    updateGuessedLetters() {
        this.guessedLettersElement.innerHTML = '';
        
        this.currentGame.guessedLetters.forEach(letter => {
            const letterElement = document.createElement('div');
            letterElement.className = 'guessed-letter';
            
            // Check if letter is in the word (only if word is available)
            let isCorrect = false;
            if (this.currentGame.word) {
                isCorrect = this.currentGame.word.includes(letter);
            } else {
                // During gameplay, check if letter appears in the display word
                isCorrect = this.currentGame.displayWord.includes(letter);
            }
            
            letterElement.classList.add(isCorrect ? 'correct' : 'incorrect');
            letterElement.textContent = letter;
            
            this.guessedLettersElement.appendChild(letterElement);
        });
    }

    /**
     * Update hangman visual
     */
    updateHangmanVisual() {
        const hangmanParts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
        const incorrectGuesses = this.currentGame.incorrectGuesses;
        
        hangmanParts.forEach((part, index) => {
            const element = document.getElementById(part);
            if (element) {
                element.style.display = index < incorrectGuesses ? 'block' : 'none';
            }
        });
    }

    /**
     * Update hint button state
     */
    updateHintButton() {
        if (this.currentGame && this.currentGame.gameStatus === 'playing') {
            this.hintBtn.disabled = !this.currentGame.hintAvailable;
        } else {
            this.hintBtn.disabled = true;
        }
    }

    /**
     * Enable input for guessing
     */
    enableInput() {
        this.letterInput.disabled = false;
        this.guessBtn.disabled = false;
        this.letterInput.focus();
    }

    /**
     * Disable input
     */
    disableInput() {
        this.letterInput.disabled = true;
        this.guessBtn.disabled = true;
    }

    /**
     * Update game statistics
     */
    updateStats() {
        // This would be updated from server data
        // For now, we'll keep the local stats
        this.winsElement.textContent = this.gameStats.wins;
        this.lossesElement.textContent = this.gameStats.losses;
        this.winRateElement.textContent = this.gameStats.winRate + '%';
    }

    /**
     * Calculate accuracy for current game
     */
    calculateAccuracy() {
        if (!this.currentGame || this.currentGame.guessedLetters.length === 0) {
            return 0;
        }
        
        // If word is not available (during gameplay), calculate based on display word
        if (!this.currentGame.word) {
            const correctGuesses = this.currentGame.displayWord.split('').filter(letter => 
                letter !== '_' && this.currentGame.guessedLetters.includes(letter)
            ).length;
            return Math.round((correctGuesses / this.currentGame.guessedLetters.length) * 100);
        }
        
        const correctGuesses = this.currentGame.word.split('').filter(letter => 
            this.currentGame.guessedLetters.includes(letter)
        ).length;
        
        return Math.round((correctGuesses / this.currentGame.guessedLetters.length) * 100);
    }

    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        this.messageElement.textContent = message;
        
        // Add visual feedback based on message type
        this.messageElement.className = `message ${type}`;
        
        // Reset after 3 seconds
        setTimeout(() => {
            this.messageElement.className = 'message';
        }, 3000);
    }

    /**
     * Show/hide loading overlay
     */
    showLoading(show) {
        this.loadingOverlay.style.display = show ? 'block' : 'none';
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HangmanGame();
}); 