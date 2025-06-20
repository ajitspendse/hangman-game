class MovieDatabase {
    constructor() {
        // Curated list of English movie names with 5-8 letters, no spaces
        this.movies = [
            // 5 letters
            'JAWS', 'ALIEN', 'ROCKY', 'JOKER', 'FROST', 'BRAVE', 'SHREK', 'TOY', 'CARS', 'RATAT',
            'MADAG', 'KUNGFU', 'MONST', 'FINDN', 'INSID', 'UP', 'WALL', 'BOLT', 'TANGL', 'FROZEN',
            
            // 6 letters
            'AVATAR', 'FROZEN', 'JUNGLE', 'BATMAN', 'SPIDER', 'TITANIC', 'ALIENS', 'ROCKY', 'JOKER',
            'BRAVE', 'SHREK', 'TOY', 'CARS', 'RATAT', 'MADAG', 'KUNGFU', 'MONST', 'FINDN', 'INSID',
            'UP', 'WALL', 'BOLT', 'TANGL', 'FROZEN', 'BIG', 'HERO', 'ZERO', 'MULAN', 'LION',
            
            // 7 letters
            'BATMAN', 'SPIDER', 'TITANIC', 'ALIENS', 'ROCKY', 'JOKER', 'BRAVE', 'SHREK', 'TOY',
            'CARS', 'RATAT', 'MADAG', 'KUNGFU', 'MONST', 'FINDN', 'INSID', 'UP', 'WALL', 'BOLT',
            'TANGL', 'FROZEN', 'BIG', 'HERO', 'ZERO', 'MULAN', 'LION', 'KING', 'QUEEN', 'PRINCE',
            
            // 8 letters
            'AVENGERS', 'INCEPTION', 'FIGHTCLUB', 'GOODFELLAS', 'PULPFICTION', 'FORREST', 'GODFATHER',
            'CASABLANCA', 'GONE', 'WIND', 'WIZARD', 'OZ', 'KING', 'KONG', 'JURASSIC', 'PARK',
            'STAR', 'WARS', 'LORD', 'RINGS', 'MATRIX', 'GLADIATOR', 'TITANIC', 'ALIEN', 'ROCKY'
        ];

        // Filter movies to ensure they meet our criteria (5-8 letters, no spaces)
        this.validMovies = this.movies.filter(movie => {
            const cleanMovie = movie.replace(/\s+/g, ''); // Remove spaces
            return cleanMovie.length >= 5 && cleanMovie.length <= 8;
        });

        // Remove duplicates
        this.validMovies = [...new Set(this.validMovies)];

        // Organize movies by length for difficulty-based selection
        this.moviesByLength = {};
        for (let i = 5; i <= 8; i++) {
            this.moviesByLength[i] = this.validMovies.filter(movie => movie.length === i);
        }

        console.log(`Movie database initialized with ${this.validMovies.length} valid movies`);
    }

    /**
     * Get a random movie name from the database
     * @returns {string} Random movie name
     */
    getRandomWord() {
        if (this.validMovies.length === 0) {
            throw new Error('No movies available in database');
        }

        const randomIndex = Math.floor(Math.random() * this.validMovies.length);
        return this.validMovies[randomIndex];
    }

    /**
     * Get a random movie name within a specific length range
     * @param {Array} lengthRange - [minLength, maxLength]
     * @returns {string} Random movie name within the specified range
     */
    getRandomWordByLength(lengthRange) {
        const [minLength, maxLength] = lengthRange;
        const availableMovies = [];

        for (let length = minLength; length <= maxLength; length++) {
            if (this.moviesByLength[length] && this.moviesByLength[length].length > 0) {
                availableMovies.push(...this.moviesByLength[length]);
            }
        }

        if (availableMovies.length === 0) {
            // Fallback to any available movie if none found in range
            return this.getRandomWord();
        }

        const randomIndex = Math.floor(Math.random() * availableMovies.length);
        return availableMovies[randomIndex];
    }

    /**
     * Get all movies in the database
     * @returns {Array} Array of all movie names
     */
    getAllMovies() {
        return [...this.validMovies];
    }

    /**
     * Get movies by length
     * @param {number} length - Desired word length
     * @returns {Array} Array of movies with specified length
     */
    getMoviesByLength(length) {
        return this.validMovies.filter(movie => movie.length === length);
    }

    /**
     * Get database statistics
     * @returns {Object} Database statistics
     */
    getStats() {
        const lengthStats = {};
        for (let i = 5; i <= 8; i++) {
            lengthStats[i] = this.getMoviesByLength(i).length;
        }

        return {
            totalMovies: this.validMovies.length,
            lengthDistribution: lengthStats
        };
    }

    /**
     * Add a new movie to the database
     * @param {string} movie - Movie name to add
     * @returns {boolean} True if added successfully
     */
    addMovie(movie) {
        if (!movie || typeof movie !== 'string') {
            return false;
        }

        const cleanMovie = movie.toUpperCase().replace(/\s+/g, '');
        
        if (cleanMovie.length < 5 || cleanMovie.length > 8) {
            return false;
        }

        if (!/^[A-Z]+$/.test(cleanMovie)) {
            return false;
        }

        if (!this.validMovies.includes(cleanMovie)) {
            this.validMovies.push(cleanMovie);
            
            // Update moviesByLength
            const length = cleanMovie.length;
            if (!this.moviesByLength[length]) {
                this.moviesByLength[length] = [];
            }
            this.moviesByLength[length].push(cleanMovie);
            
            return true;
        }

        return false;
    }

    /**
     * Validate if a movie name meets our criteria
     * @param {string} movie - Movie name to validate
     * @returns {boolean} True if valid
     */
    isValidMovie(movie) {
        if (!movie || typeof movie !== 'string') {
            return false;
        }

        const cleanMovie = movie.toUpperCase().replace(/\s+/g, '');
        
        return cleanMovie.length >= 5 && 
               cleanMovie.length <= 8 && 
               /^[A-Z]+$/.test(cleanMovie);
    }
}

module.exports = MovieDatabase; 