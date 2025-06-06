# Hanoi Heritage Explorer 🏛️

A 2D side-scrolling adventure game built with Phaser.js and React, where players explore the historic landmarks of Hanoi, Vietnam. Journey through beautifully crafted parallax environments, solve puzzles, and learn about the rich cultural heritage of Vietnam's capital city.

## 🎮 Game Features

### Core Gameplay
- **Side-scrolling Adventure**: Explore a vast 2D world with smooth character movement
- **Interactive Landmarks**: Visit famous Hanoi locations and learn their history
- **Puzzle Challenges**: Solve sliding puzzles at each landmark to unlock stories
- **Progress Tracking**: Auto-save system tracks your exploration progress

### Visual Features
- **Multi-layer Parallax Backgrounds**: Dynamic sky, mountain, and foreground layers
- **Landmark-based Mountain Positioning**: Mountains dynamically positioned around landmarks
- **Minimap System**: Real-time navigation aid with world overview
- **Atmospheric Effects**: Distance-based tinting and transparency for depth

### Technical Features
- **Modular Scene System**: Easy to extend with new areas and landmarks
- **Event-driven Architecture**: Clean communication between game components
- **Responsive Design**: Adapts to different screen sizes
- **Performance Optimized**: Efficient rendering and memory management

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Quillboltcode/Game.git
   cd Game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to play the game

### Building for Production
```bash
npm run build
```

## 🎯 How to Play

### Controls
- **Arrow Keys / WASD**: Move character left/right, jump
- **Spacebar**: Interact with landmarks / Jump
- **M Key**: Toggle minimap visibility
- **S Key**: Manual save progress
- **Shift + R**: Reset game progress

### Gameplay Loop
1. **Explore**: Move through the world to discover landmarks
2. **Interact**: Approach landmarks and press Spacebar to learn more
3. **Solve**: Complete sliding puzzles to unlock landmark stories
4. **Progress**: Visit multiple landmarks to advance through the game
5. **Complete**: Finish your journey through Hanoi's heritage sites

## 🏗️ Project Structure

```
src/
├── game/
│   ├── GameScene.js          # Main game scene with parallax backgrounds
│   ├── ParallaxScene.js      # Advanced parallax effects system
│   ├── SlidingPuzzle.js      # Interactive puzzle mini-game
│   ├── DialogueSystem.js     # Story and dialogue management
│   └── EventBus.js           # Event communication system
├── data/
│   └── landmark.js           # Landmark data and configurations
├── assets/
│   ├── background/           # Parallax background images
│   │   ├── h1.png - h5.png  # Sky layer images
│   │   └── mountain1.png - mountain5.png # Mountain layer images
│   ├── characters/           # Player sprites and animations
│   ├── landmarks/            # Landmark images and icons
│   └── puzzle/               # Puzzle images for mini-games
└── components/               # React UI components
```

## 🎨 Asset Requirements

### Background Assets
- **Sky Layers**: `assets/background/h1.png` to `h5.png` (1920x1080 recommended)
- **Mountain Layers**: `assets/background/mountain1.png` to `mountain5.png` (variable sizes)
- **Ground Textures**: Seamlessly tileable ground textures

### Character Assets
- **Player Idle**: `player.png` - Character standing sprite
- **Player Running**: `player_run.png` - Character movement animation

### Landmark Assets
- Individual landmark images referenced in `src/data/landmark.js`
- Puzzle images for sliding puzzle mini-games

## ⚙️ Configuration

### Scene Configuration
The game uses a flexible configuration system in `GameScene.js`:

```javascript
sceneConfig = {
  backgroundMusic: 'backgroundMusic',
  backgroundLayers: {
    sky: 'sky_bg',
    clouds: 'clouds_bg',
    trees: 'trees_bg'
  },
  worldWidth: 4000,
  worldHeight: 600,
  playerStartPosition: { x: 512, y: 470 },
  enableMinimap: true,
  enableParallax: true,
  requiredVisits: 4,
  musicVolume: 0.5
}
```

### Adding New Landmarks
Edit `src/data/landmark.js` to add new locations:

```javascript
{
  id: 'new_landmark',
  name: 'New Landmark Name',
  x: 1000,
  y: 500,
  width: 100,
  height: 150,
  color: 0xFF6B6B,
  description: 'Historical description...',
  puzzle: 'assets/puzzle/new_landmark.jpg'
}
```

## 🔧 Development

### Key Components

#### GameScene.js
- Main game logic and rendering
- Parallax background system
- Player movement and physics
- Landmark interaction system

#### ParallaxScene.js
- Advanced parallax effects
- Multi-layer background rendering
- Sequential animation system

#### SlidingPuzzle.js
- Interactive puzzle mini-game
- Dynamic image loading
- Completion tracking

### Event System
The game uses a centralized event bus for communication:

```javascript
// Emit events
EventBus.emit('landmark-interaction', landmarkData);

// Listen for events
EventBus.on('puzzle-completed', this.onPuzzleCompleted, this);
```

## 🎵 Audio

### Background Music
- Looping background music for immersive experience
- Volume controls and mute functionality
- Context-aware audio management

### Sound Effects
- Interaction feedback sounds
- Movement and jump sound effects
- Puzzle completion audio cues

## 📱 Responsive Design

The game adapts to different screen sizes:
- **Desktop**: Full-featured experience with all controls
- **Tablet**: Touch-friendly interface adaptations
- **Mobile**: Optimized controls and UI scaling

## 🐛 Troubleshooting

### Common Issues

**Game won't start**
- Check console for asset loading errors
- Ensure all required images are in the correct directories

**Performance issues**
- Reduce parallax layer count in configuration
- Check browser hardware acceleration settings

**Save/Load problems**
- Clear browser localStorage if save data becomes corrupted
- Use Shift+R to reset progress if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and structure
- Test new features thoroughly
- Update documentation for new features
- Optimize for performance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Phaser.js** - Powerful 2D game framework
- **React** - UI component library
- **Vite** - Fast build tool and development server
- **Hanoi Tourism Board** - Historical landmark information and inspiration

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Quillboltcode/Game/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Quillboltcode/Game/discussions)


---

**Explore Hanoi's heritage, one landmark at a time! 🏛️✨**
