# 🎬 Hangman - Movie Word Game

A modern, interactive Hangman game featuring English movie names with multiple difficulty levels, sound effects, game history tracking, and comprehensive statistics.

## 🎮 Game Features

### 🎮 Core Gameplay
- **Word Guessing**: Guess movie names letter by letter
- **Visual Feedback**: Animated hangman drawing with SVG graphics
- **Real-time Updates**: Live display of guessed letters and game status
- **Input Validation**: Prevents invalid inputs and duplicate guesses

### 🎯 Difficulty Levels
- **Easy Mode**: 8 lives, 5-6 letter movies, hints every 2 incorrect guesses
- **Medium Mode**: 6 lives, 6-7 letter movies, hints every 3 incorrect guesses
- **Hard Mode**: 4 lives, 7-8 letter movies, no hints available

### 🔊 Sound Effects
- **Correct Guess**: Pleasant chime sound
- **Incorrect Guess**: Lower tone feedback
- **Win**: Victory fanfare sequence
- **Lose**: Sad tone
- **Hint**: Magical chime
- **Error**: Warning beep
- **UI Interactions**: Click and toggle sounds
- **Volume Control**: Adjustable volume levels
- **Mute Option**: Toggle sound on/off

### 📊 Game History & Statistics
- **Game History**: Track all completed games with detailed information
- **Performance Metrics**: Win rate, accuracy, duration, hints used
- **Difficulty Breakdown**: Separate statistics for each difficulty level
- **Persistent Storage**: Game data saved locally and on server

### 🎨 User Interface
- **Dark/Light Theme**: Toggle between themes with smooth transitions
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface with animations
- **Accessibility**: Keyboard shortcuts and screen reader support

### ⌨️ Keyboard Shortcuts
- `Ctrl/Cmd + N`: Start new game
- `Ctrl/Cmd + T`: Toggle theme
- `Ctrl/Cmd + M`: Toggle sound
- `Ctrl/Cmd + H`: Get hint (when available)
- `Enter`: Submit letter guess

## 🚀 Quick Start

### Local Development

#### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

#### Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd hangman
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### 🚀 Deployment to Vercel

#### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the application:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your deployment.

#### Option 2: Deploy via GitHub Integration

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect the Node.js configuration
6. Click "Deploy"

#### Option 3: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Choose "Upload" and select your project folder
4. Vercel will automatically configure the deployment
5. Click "Deploy"

### Configuration Files

The project includes the following configuration files for Vercel deployment:

- **`vercel.json`**: Vercel deployment configuration
- **`package.json`**: Node.js dependencies and scripts
- **`.gitignore`**: Excludes unnecessary files from deployment

## 🎯 How to Play

1. **Select Difficulty**: Choose from Easy, Medium, or Hard mode
2. **Start Game**: Click "New Game" to begin
3. **Guess Letters**: Type letters to guess the movie name
4. **Use Hints**: Click the hint button when available (varies by difficulty)
5. **Track Progress**: Monitor your lives, guessed letters, and game status
6. **View History**: Check your game history and statistics

### Game Rules
- You have a limited number of lives based on difficulty
- Guess one letter at a time
- Correct guesses reveal the letter in the word
- Incorrect guesses reduce your lives and add to the hangman
- Win by guessing all letters before running out of lives
- Lose when the hangman is complete

## 🌙 Dark Theme Features

### Theme Toggle
- **Manual Toggle**: Click the sun/moon icon in the header to switch themes
- **Keyboard Shortcut**: Use `Ctrl+T` (or `Cmd+T` on Mac) to toggle themes
- **Automatic Detection**: Automatically detects your system's dark/light mode preference
- **Persistent Preference**: Your theme choice is saved and remembered across sessions

### Theme Characteristics
- **Light Theme**: Bright, vibrant colors with high contrast
- **Dark Theme**: Soothing dark blues and grays with reduced eye strain
- **Smooth Transitions**: All theme changes include smooth animations
- **Consistent Design**: Both themes maintain the same beautiful design aesthetic

## 🏗️ Project Structure

```
hangman/
├── server.js              # Main Express server
├── gameManager.js         # Game logic and state management
├── movieDatabase.js       # Movie word database and selection
├── package.json           # Dependencies and scripts
├── README.md             # This file
├── REQUIREMENTS.md       # Detailed requirements document
└── public/               # Frontend files
    ├── index.html        # Main HTML page
    ├── styles.css        # CSS styles with theme support
    └── script.js         # Client-side JavaScript with theme management
```

## 🔧 API Endpoints

### Game Management
- `POST /api/new-game` - Start a new game
  - Body: `{ "difficulty": "easy|medium|hard" }`
  - Returns: Game state object

- `POST /api/guess` - Make a letter guess
  - Body: `{ "letter": "A" }`
  - Returns: Guess result with sound effect

- `POST /api/hint` - Get a hint
  - Returns: Hint information or error message

### Game State
- `GET /api/game-state` - Get current game state
- `GET /api/difficulty-settings` - Get difficulty configurations

### Statistics & History
- `GET /api/game-history?limit=10` - Get game history
- `GET /api/statistics` - Get overall game statistics

### Health Check
- `GET /api/health` - Server health status

## �� Customization

### Adding New Movies
Edit `movieDatabase.js` to add more movie names:

```javascript
this.movies = [
    // Add your movie names here (5-8 letters, no spaces)
    'JAWS', 'ALIEN', 'AVATAR', 'BATMAN', 'TITANIC'
];
```

### Styling Changes
Modify `public/styles.css` to customize the appearance:

```css
/* Change the main gradient for light theme */
:root {
    --bg-gradient: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}

/* Change the main gradient for dark theme */
[data-theme="dark"] {
    --bg-gradient: linear-gradient(135deg, #your-dark-color-1 0%, #your-dark-color-2 100%);
}
```

### Game Rules
Adjust game parameters in `gameManager.js`:

```javascript
// Change maximum incorrect guesses
maxIncorrectGuesses: 8, // Default is 6

// Modify word length constraints
// Edit movieDatabase.js for length filtering
```

## 🧪 Testing

The game includes comprehensive error handling and input validation:

- **Invalid Input**: Non-letter characters are rejected
- **Duplicate Guesses**: Already guessed letters are prevented
- **Network Errors**: Graceful handling of connection issues
- **Game State**: Consistent state management throughout
- **Theme Persistence**: Theme preferences are saved and restored

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
```bash
npm start
```

### Environment Variables
- `PORT`: Server port (default: 3000)

## 🎯 Future Enhancements

### Planned Features
- [ ] Difficulty levels (easy, medium, hard)
- [ ] Hint system
- [ ] Multiplayer support
- [ ] Leaderboards
- [ ] Sound effects
- [ ] More word categories
- [ ] Custom word lists
- [ ] Game statistics dashboard
- [ ] Additional theme options (high contrast, sepia, etc.)

### Technical Improvements
- [ ] Database integration for word storage
- [ ] User authentication
- [ ] Real-time multiplayer with WebSockets
- [ ] Progressive Web App (PWA) features
- [ ] Unit and integration tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Classic Hangman game mechanics
- Modern web development best practices
- Responsive design principles
- Accessibility guidelines
- Dark theme design patterns

## 📞 Support

If you encounter any issues or have questions:

1. Check the browser console for error messages
2. Ensure all dependencies are installed correctly
3. Verify the server is running on the correct port
4. Check that your browser supports modern JavaScript features
5. Try toggling the theme if you experience display issues

## 🌐 Live Demo

Play the game online: [Your Vercel URL will appear here after deployment]

---

**Enjoy playing Hangman! 🎬🎮🌙** 