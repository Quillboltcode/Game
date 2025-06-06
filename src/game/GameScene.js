// src/phaser/GameScene.js
import Phaser from 'phaser';
import { EventBus } from './EventBus';
import { landmarks } from '../data/landmark'; // Adjust path if necessary
import { SlidingPuzzle } from './SlidingPuzzle'; // Adjust path if necessary
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.player = null;
    this.cursors = null;
    this.wasd = null;
    this.landmarksGroup = null;
    this.nearbyLandmarkData = null;
    this.interactionText = null;
    this.gameUI = null;
    this.backgroundMusic = null;

    // Parallax background layers
    this.skyLayer = null;
    this.mountainLayer = null;
    this.treeLayer = null;

    // Game progress tracking
    this.gameProgress = {
      playerPosition: { x: 512, y: 450 },
      landmarksCompleted: [],
      landmarksVisited: [],
      totalDistance: 0,
      gameTime: 0,
      lastSaveTime: Date.now()
    };
  }

  create() {
    // Load saved progress first
    this.loadGameProgress();

    // Create world bounds
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const worldWidth = 4000;

    // Set world bounds
    this.physics.world.setBounds(0, 0, worldWidth, gameHeight);

    // Create parallax background layers
    this.createParallaxLayers(gameWidth, gameHeight);

    if (!this.scene.get('SlidingPuzzleScene')) {
      this.scene.add('SlidingPuzzleScene', SlidingPuzzleScene);
    }

    // Create ground
    this.createGround();

    // Create player at saved position
    this.createPlayer();

    // Create landmarks
    this.createLandmarks();

    // Setup controls
    this.setupControls();

    // Create UI elements
    this.createUI();

    // Setup camera
    this.setupCamera(worldWidth, gameHeight);

    // Start background music
    this.startBackgroundMusic();

    // Setup EventBus listeners
    this.setupEventListeners();

    // Auto-save every 30 seconds
    this.setupAutoSave();

    // Emit scene ready event
    EventBus.emit('current-scene-ready', this);
    EventBus.emit('game-scene-loaded');
  }

  saveGameProgress() {
    const saveData = {
      playerPosition: {
        x: this.player ? this.player.x : 512,
        y: this.player ? this.player.y : 450
      },
      landmarksCompleted: [...this.gameProgress.landmarksCompleted],
      landmarksVisited: [...this.gameProgress.landmarksVisited],
      totalDistance: this.gameProgress.totalDistance,
      gameTime: this.gameProgress.gameTime + (Date.now() - this.gameProgress.lastSaveTime),
      lastSaveTime: Date.now(),
      cameraPosition: {
        x: this.cameras.main.scrollX,
        y: this.cameras.main.scrollY
      }
    };

    try {
      localStorage.setItem('gameProgress', JSON.stringify(saveData));
      console.log('Game progress saved:', saveData);
      EventBus.emit('game-saved', saveData);
      
      // Show save indicator
      this.showSaveIndicator();
    } catch (error) {
      console.error('Failed to save game progress:', error);
    }
  }

  loadGameProgress() {
    try {
      const savedData = localStorage.getItem('gameProgress');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        this.gameProgress = {
          ...this.gameProgress,
          ...parsedData,
          lastSaveTime: Date.now()
        };
        console.log('Game progress loaded:', this.gameProgress);
        EventBus.emit('game-loaded', this.gameProgress);
      } else {
        console.log('No saved game progress found, starting fresh');
      }
    } catch (error) {
      console.error('Failed to load game progress:', error);
      // Reset to default if corrupted
      this.resetGameProgress();
    }
  }

  resetGameProgress() {
    this.gameProgress = {
      playerPosition: { x: 512, y: 450 },
      landmarksCompleted: [],
      landmarksVisited: [],
      totalDistance: 0,
      gameTime: 0,
      lastSaveTime: Date.now()
    };
    localStorage.removeItem('gameProgress');
    console.log('Game progress reset');
    EventBus.emit('game-reset');
  }


  createParallaxLayers(gameWidth, gameHeight) {
    // Create ground texture if not exists
    if (!this.textures.exists('ground')) {
      this.add.graphics()
        .fillStyle(0x8FBC8F)
        .fillRect(0, 0, 32, 32)
        .generateTexture('ground', 32, 32);
    }

    // Create landmark textures for those without sprites
    landmarks.forEach(landmark => {
      if (!landmark.sprite && !this.textures.exists(landmark.id)) {
        this.add.graphics()
          .fillStyle(landmark.color)
          .fillRect(0, 0, landmark.width, landmark.height)
          .generateTexture(landmark.id, landmark.width, landmark.height);
      }
    });

    // Sky layer (furthest back)
    this.skyLayer = this.add.tileSprite(0, 0, gameWidth, gameHeight, 'sky_bg')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setScale(0.5)
      .setDepth(-5);

    // Mountains layer
    this.mountainLayer = this.add.tileSprite(0, 0, gameWidth, gameHeight, 'mountains_bg')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-4);

    // Trees layer
    this.treeLayer = this.add.tileSprite(0, 0, gameWidth, gameHeight, 'trees_fg')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-3);
  }

  createGround() {
    const ground = this.physics.add.staticGroup();
    for (let x = 0; x < 4000; x += 32) {
      ground.create(x, 568, 'ground').setOrigin(0, 0);
    }

    // Store ground reference for player collision
    this.ground = ground;
  }

  createPlayer() {
    // Use saved position or default
    const startX = this.gameProgress.playerPosition.x;
    const startY = this.gameProgress.playerPosition.y;
    
    this.player = this.physics.add.sprite(startX, startY, 'player').setScale(2.5);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Player physics
    this.physics.add.collider(this.player, this.ground);

    console.log(`Player created at position: (${startX}, ${startY})`);
    
    // Emit player created event
    EventBus.emit('player-created', this.player);
  }

  createLandmarks() {
    this.landmarksGroup = this.add.group();

    landmarks.forEach(landmark => {
      let landmarkSprite;

      if (landmark.sprite) {
        landmarkSprite = this.physics.add.staticImage(
          landmark.x,
          550 - landmark.height,
          landmark.id
        ).setOrigin(0, 1);
        landmarkSprite.setDisplaySize(landmark.width, landmark.height);
      } else {
        landmarkSprite = this.add.rectangle(
          landmark.x + landmark.width / 2,
          500 - landmark.height / 2,
          landmark.width,
          landmark.height,
          landmark.color
        );
      }

      landmarkSprite.setData('landmarkData', landmark);

      // Check if landmark is completed
      const isCompleted = this.gameProgress.landmarksCompleted.includes(landmark.id);
      const isVisited = this.gameProgress.landmarksVisited.includes(landmark.id);

      // Visual indicators for landmark status
      let nameColor = '#000000';
      let nameText = landmark.name;
      
      if (isCompleted) {
        nameColor = '#27ae60'; // Green for completed
        nameText = `✓ ${landmark.name}`;
        landmarkSprite.setTint(0x90EE90); // Light green tint
      } else if (isVisited) {
        nameColor = '#f39c12'; // Orange for visited but not completed
        nameText = `◐ ${landmark.name}`;
        landmarkSprite.setTint(0xFFE4B5); // Light orange tint
      }

      // Add landmark name text with status
      this.add.text(
        landmark.x + landmark.width / 2,
        500 - landmark.height - 20,
        nameText,
        {
          fontSize: '14px',
          color: nameColor,
          fontWeight: isCompleted ? 'bold' : 'normal'
        }
      ).setOrigin(0.5);

      this.landmarksGroup.add(landmarkSprite);
    });

    console.log(`Landmarks created. Completed: ${this.gameProgress.landmarksCompleted.length}, Visited: ${this.gameProgress.landmarksVisited.length}`);
    
    // Emit landmarks created event
    EventBus.emit('landmarks-created', this.landmarksGroup);
  }

  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,S,A,D');

    // Space key for interaction
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.nearbyLandmarkData) {
        // Mark landmark as visited if not already
        if (!this.gameProgress.landmarksVisited.includes(this.nearbyLandmarkData.id)) {
          this.gameProgress.landmarksVisited.push(this.nearbyLandmarkData.id);
          console.log(`Landmark visited: ${this.nearbyLandmarkData.name}`);
        }

        EventBus.emit('landmark-interaction', this.nearbyLandmarkData);
        this.launchSlidingPuzzle(this.nearbyLandmarkData);
      }
    });

    // Manual save key (S key)
    this.input.keyboard.on('keydown-S', () => {
      this.saveGameProgress();
    });

    // Reset progress key (R key) - for testing
    this.input.keyboard.on('keydown-R', () => {
      if (this.input.keyboard.checkDown(this.input.keyboard.addKey('SHIFT'))) {
        this.resetGameProgress();
        this.scene.restart();
      }
    });
  }

  launchSlidingPuzzle(landmarkData) {
    // Save progress before launching puzzle
    this.saveGameProgress();
    
    // Pause the current scene
    this.scene.pause();
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      this.backgroundMusic.pause();
    }

    // Launch the puzzle scene on top
    this.scene.launch('SlidingPuzzleScene', { landmarkData });
    EventBus.emit('puzzle-launched', landmarkData);
  }

  setupEventListeners() {
    // Listen for the puzzle to close so you can resume music
    EventBus.on('puzzle-closed', this.resumeAfterPuzzle, this);
    
    // Listen for puzzle completion
    EventBus.on('puzzle-completed', this.onPuzzleCompleted, this);
    
    // Listen for external events
    EventBus.on('pause-game', this.pauseGame, this);
    EventBus.on('resume-game', this.resumeGame, this);
    EventBus.on('toggle-music', this.toggleMusic, this);
    EventBus.on('player-boost', this.boostPlayer, this);
  }

  onPuzzleCompleted(puzzleData) {
    console.log('Puzzle completed:', puzzleData);
    
    // Mark landmark as completed if not already
    if (this.nearbyLandmarkData && !this.gameProgress.landmarksCompleted.includes(this.nearbyLandmarkData.id)) {
      this.gameProgress.landmarksCompleted.push(this.nearbyLandmarkData.id);
      console.log(`Landmark completed: ${this.nearbyLandmarkData.name}`);
      
      // Save progress immediately after completion
      this.saveGameProgress();
      
      // Show completion message
      this.showLandmarkCompletionMessage(this.nearbyLandmarkData);
    }
  }

  showLandmarkCompletionMessage(landmarkData) {
    const message = this.add.text(this.player.x, this.player.y - 150, 
      `${landmarkData.name} Completed!`, {
        fontSize: '20px',
        color: '#27ae60',
        backgroundColor: '#ffffff',
        padding: { x: 15, y: 8 }
      }).setOrigin(0.5);

    // Fade out after 3 seconds
    this.tweens.add({
      targets: message,
      alpha: 0,
      y: message.y - 50,
      duration: 3000,
      ease: 'Power2',
      onComplete: () => message.destroy()
    });
  }

  resumeAfterPuzzle() {
    if (this.backgroundMusic && this.backgroundMusic.isPaused) {
      this.backgroundMusic.resume();
    }
    
    // Refresh landmark visuals to show completion status
    this.refreshLandmarkVisuals();
  }

  refreshLandmarkVisuals() {
    // Destroy and recreate landmarks to update their visual status
    if (this.landmarksGroup) {
      this.landmarksGroup.destroy(true);
    }
    this.createLandmarks();
  }

  setupAutoSave() {
    // Auto-save every 30 seconds
    this.time.addEvent({
      delay: 30000, // 30 seconds
      callback: this.saveGameProgress,
      callbackScope: this,
      loop: true
    });
  }

  showSaveIndicator() {
    const saveText = this.add.text(this.scale.width - 20, 20, 'Game Saved', {
      fontSize: '14px',
      color: '#27ae60',
      backgroundColor: '#ffffff',
      padding: { x: 8, y: 4 }
    }).setOrigin(1, 0).setScrollFactor(0);

    // Fade out after 2 seconds
    this.tweens.add({
      targets: saveText,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => saveText.destroy()
    });
  }

  createUI() {
    this.interactionText = this.add.text(16, 16, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0);

    this.gameUI = this.add.text(16, 60, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0);
  }

  setupCamera(worldWidth, gameHeight) {
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, worldWidth, 600);
  }

  startBackgroundMusic() {
    if (this.sound.get('backgroundMusic') === null) {
      this.backgroundMusic = this.sound.add('backgroundMusic', {
        loop: true,
        volume: 0.5
      });

      if (this.sound.locked) {
        this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
          this.backgroundMusic.play();
          EventBus.emit('music-started');
        });
      } else {
        this.backgroundMusic.play();
        EventBus.emit('music-started');
      }
    }
  }

  // Event handler methods
  pauseGame() {
    this.scene.pause();
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      this.backgroundMusic.pause();
    }
    EventBus.emit('game-paused');
  }

  resumeGame() {
    this.scene.resume();
    if (this.backgroundMusic && this.backgroundMusic.isPaused) {
      this.backgroundMusic.resume();
    }
    EventBus.emit('game-resumed');
  }

  toggleMusic() {
    if (this.backgroundMusic) {
      if (this.backgroundMusic.isPlaying) {
        this.backgroundMusic.pause();
        EventBus.emit('music-paused');
      } else {
        this.backgroundMusic.resume();
        EventBus.emit('music-resumed');
      }
    }
  }

  boostPlayer(boostData = { speed: 1.5, duration: 3000 }) {
    // Temporary speed boost
    const originalSpeed = 200;
    const boostedSpeed = originalSpeed * boostData.speed;

    this.playerSpeed = boostedSpeed;

    this.time.delayedCall(boostData.duration, () => {
      this.playerSpeed = originalSpeed;
      EventBus.emit('player-boost-ended');
    });

    EventBus.emit('player-boost-started', boostData);
  }

  update() {
    // Player movement
    const speed = this.playerSpeed || 200;

    if (this.cursors.left?.isDown || this.wasd.A?.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right?.isDown || this.wasd.D?.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if ((this.cursors.up?.isDown || this.wasd.W?.isDown || this.cursors.space?.isDown) && this.player.body?.touching.down) {
      this.player.setVelocityY(-500);
      EventBus.emit('player-jumped');
    }

    // Check for nearby landmarks
    this.checkNearbyLandmarks();

    // Update UI
    this.updateUI();

    // Update parallax effect
    this.updateParallax();

    // Emit player position for external components
    EventBus.emit('player-position-update', {
      x: this.player.x,
      y: this.player.y,
      velocity: {
        x: this.player.body.velocity.x,
        y: this.player.body.velocity.y
      }
    });
  }

  checkNearbyLandmarks() {
    this.nearbyLandmarkData = null;

    this.landmarksGroup.children.entries.forEach((landmarkSprite) => {
      const landmarkData = landmarkSprite.getData('landmarkData');
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        landmarkSprite.x,
        landmarkSprite.y
      );

      const interactionRadius = (landmarkData.width / 2) + 50;
      if (distance < interactionRadius) {
        this.nearbyLandmarkData = landmarkData;

        // Emit nearby landmark event
        if (!this.lastNearbyLandmark || this.lastNearbyLandmark.id !== landmarkData.id) {
          EventBus.emit('landmark-nearby', landmarkData);
          this.lastNearbyLandmark = landmarkData;
        }
      }
    });

    // Emit when no landmark is nearby
    if (!this.nearbyLandmarkData && this.lastNearbyLandmark) {
      EventBus.emit('landmark-left', this.lastNearbyLandmark);
      this.lastNearbyLandmark = null;
    }
  }

  updateUI() {
    if (this.nearbyLandmarkData) {
      const isCompleted = this.gameProgress.landmarksCompleted.includes(this.nearbyLandmarkData.id);
      const interactionText = isCompleted ? 
        'Already completed!' : 
        'Press SPACE to learn more';
      
      this.interactionText.setText(interactionText);
      this.interactionText.setPosition(this.player.x - 50, this.player.y - 100);
      this.interactionText.setVisible(true);
    } else {
      this.interactionText.setVisible(false);
    }

    // Update game stats with progress
    const distance = Math.floor(this.player.x / 10);
    this.gameProgress.totalDistance = Math.max(this.gameProgress.totalDistance, distance);
    
    const landmarksVisited = this.gameProgress.landmarksVisited.length;
    const landmarksCompleted = this.gameProgress.landmarksCompleted.length;
    const statsText = `Distance: ${distance}m | Visited: ${landmarksVisited}/${landmarks.length} | Completed: ${landmarksCompleted}/${landmarks.length}`;

    this.gameUI.setText(statsText);

    // Emit stats update
    EventBus.emit('game-stats-update', {
      distance,
      landmarksVisited,
      landmarksCompleted,
      totalLandmarks: landmarks.length,
      gameProgress: this.gameProgress
    });
  }

  updateParallax() {
    // Update parallax layers based on camera position
    const cameraX = this.cameras.main.scrollX;

    // Sky moves very slowly
    if (this.skyLayer) {
      this.skyLayer.tilePositionX = cameraX * 0.1;
    }

    // Mountains move a bit faster
    if (this.mountainLayer) {
      this.mountainLayer.tilePositionX = cameraX * 0.3;
    }

    // Trees move faster (closer to camera)
    if (this.treeLayer) {
      this.treeLayer.tilePositionX = cameraX * 0.6;
    }
  }

  shutdown() {
    // Clean up EventBus listeners
    EventBus.off('pause-game', this.pauseGame, this);
    EventBus.off('resume-game', this.resumeGame, this);
    EventBus.off('toggle-music', this.toggleMusic, this);
    EventBus.off('player-boost', this.boostPlayer, this);

    // Clean up music
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      this.backgroundMusic.stop();
    }

    // Remove keyboard listeners
    this.input.keyboard.off('keydown-SPACE');

    // Destroy game objects
    if (this.skyLayer) this.skyLayer.destroy();
    if (this.mountainLayer) this.mountainLayer.destroy();
    if (this.treeLayer) this.treeLayer.destroy();
    if (this.landmarksGroup) this.landmarksGroup.destroy(true);
    if (this.player) this.player.destroy();
    if (this.interactionText) this.interactionText.destroy();
    if (this.gameUI) this.gameUI.destroy();

    // Emit cleanup complete
    EventBus.emit('game-scene-shutdown');

    super.shutdown();
  }

  destroy() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }

    EventBus.emit('game-scene-destroyed');
    super.destroy();
  }
}