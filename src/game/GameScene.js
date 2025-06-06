// Enhanced GameScene.js with Parallax Background and Minimap
import Phaser from 'phaser';
import { EventBus } from './EventBus';
import { landmarks } from '../data/landmark';
import { SlidingPuzzle } from './SlidingPuzzle';
import { DialogueSystem } from './DialogqueSystem';

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
    this.dialogueSystem = null;
    // Multiple parallax background layers
    this.backgroundLayers = [];

    // Minimap
    this.minimap = null;
    this.minimapBorder = null;

    // Default configuration - can be overridden by init()
    this.sceneConfig = {
      backgroundMusic: 'backgroundMusic',
      backgroundLayers: {
        sky: 'sky_bg',
        clouds: 'clouds_bg',
        trees: 'trees_bg'
      },
      continueScene: 'WorldMapScene',
      landmarkData: null, // Will use default landmarks if null
      worldWidth: 4000,
      worldHeight: 600,
      playerStartPosition: { x: 512, y: 470 },
      enableMinimap: true,
      enableParallax: true,
      musicVolume: 0.5,
      requiredVisits: 4,

    };

    // Game progress tracking
    this.gameProgress = {
      playerPosition: { x: 512, y: 470 },
      landmarksCompleted: [],
      landmarksVisited: [],
      totalDistance: 0,
      gameTime: 0,
      lastSaveTime: Date.now()
    };

    this.gameCompleted = false;
    this.continueScene = null
  }

  init(data = {}) {
    // Merge passed configuration with defaults
    this.sceneConfig = {
      ...this.sceneConfig,
      ...data
    };

    // Set required visits from config
    this.REQUIRED_VISITS = this.sceneConfig.requiredVisits;

    // Override landmark data if provided
    if (this.sceneConfig.landmarkData) {
      this.customLandmarks = this.sceneConfig.landmarkData;
    }

    // Set player start position from config
    if (this.sceneConfig.playerStartPosition) {
      this.gameProgress.playerPosition = { ...this.sceneConfig.playerStartPosition };
    }

    console.log('GameScene initialized with config:', this.sceneConfig);
  }

  create() {
    this.loadGameProgress();

    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const worldWidth = this.sceneConfig.worldWidth;
    const worldHeight = this.sceneConfig.worldHeight;

    this.physics.world.setBounds(0, 0, worldWidth, gameHeight);

    // Create parallax background if enabled
    if (this.sceneConfig.enableParallax) {
      this.createParallaxBackground(gameWidth, gameHeight, worldWidth);
    } else {
      this.createSimpleBackground(gameWidth, gameHeight, worldWidth);
    }
    this.dialogueSystem = new DialogueSystem(this)

    if (!this.scene.get('SlidingPuzzleScene')) {
      this.scene.add('SlidingPuzzleScene', SlidingPuzzleScene);
    }

    this.createGround();
    this.createPlayer();
    this.createLandmarks();
    this.setupControls();
    this.createBackButton();
    this.createUI();
    // this.createEndZone();
    // Setup camera and minimap
    this.setupCamera(worldWidth, gameHeight);

    if (this.sceneConfig.enableMinimap) {
      this.createMinimap(worldWidth, gameHeight);
    }

    this.startBackgroundMusic();
    this.setupEventListeners();
    this.setupAutoSave();

    EventBus.emit('current-scene-ready', this);
    EventBus.emit('game-scene-loaded');
  }

  createParallaxBackground(gameWidth, gameHeight, worldWidth) {
    // Create ground texture if not exists
    if (!this.textures.exists('ground')) {
      this.add.graphics()
        .fillStyle(0x8FBC8F)
        .fillRect(0, 0, 32, 32)
        .generateTexture('ground', 32, 32);
    }

    // Create landmark textures for those without sprites
    const landmarksToUse = this.customLandmarks || landmarks;
    landmarksToUse.forEach(landmark => {
      if (!landmark.sprite && !this.textures.exists(landmark.id)) {
        this.add.graphics()
          .fillStyle(landmark.color)
          .fillRect(0, 0, landmark.width, landmark.height)
          .generateTexture(landmark.id, landmark.width, landmark.height);
      }
    });

    // Create multiple background layers for parallax effect
    this.backgroundLayers = [];

    // Layer 1: Far background (slowest) - Sky/Mountains
    if (this.sceneConfig.backgroundLayers.sky) {
      for (let i = 1; i <= 5; i++) {
        const skyImageKey = `sky_h${i}`;
        
        // Check if the image exists before creating the layer
        if (this.textures.exists(skyImageKey)) {
          const skyHeight = gameHeight * 0.4; // 60% of screen height
          const scrollFactor = 0.1 + (i - 1) * 0.05; // Different scroll speeds: 0.1, 0.15, 0.2, 0.25, 0.3
          
          const skyLayer = this.add.tileSprite(0, 0, worldWidth * 2, skyHeight, skyImageKey)
            .setOrigin(0, 0)
            .setScale(1.5)
            .setScrollFactor(scrollFactor)
            .setDepth(-10 - i); // Each layer gets deeper depth
          
          // Optional: Add slight tint variation for depth effect
          const tintValues = [0xFFFFFF, 0xF0F8FF, 0xE6F3FF, 0xDCEEFF, 0xD2E9FF];
          if (tintValues[i - 1]) {
            skyLayer.setTint(tintValues[i - 1]);
          }
          
          this.backgroundLayers.push({ 
            sprite: skyLayer, 
            speed: scrollFactor,
            name: `sky_layer_${i}`
          });
          
          console.log(`Sky layer ${i} created with scroll factor ${scrollFactor}`);
        } else {
          console.warn(`Sky image ${skyImageKey} not found, skipping layer ${i}`);
        }
      }
    }

    // Layer 2: Mid background - Mountains positioned at landmark centers
    if (this.sceneConfig.backgroundLayers.clouds) {
      this.createMultipleMountainsPerLandmark(gameWidth, gameHeight, worldWidth);
    }

    // Layer 3: Near background - Trees/Rocks
    if (this.sceneConfig.backgroundLayers.trees && this.textures.exists(this.sceneConfig.backgroundLayers.trees)) {
      const nearBg = this.add.tileSprite(0, 0, worldWidth * 1.2, gameHeight, this.sceneConfig.backgroundLayers.trees)
        .setOrigin(0, 0)
        .setScrollFactor(0.6)
        .setDepth(-6);
      this.backgroundLayers.push({ sprite: nearBg, speed: 0.6 });
    }

    // Create procedural background elements (like stars in the example)
    this.createBackgroundElements(worldWidth, gameHeight);

    console.log('Parallax background layers created:', this.backgroundLayers.length);
  }

  createSimpleBackground(gameWidth, gameHeight, worldWidth) {
    // Simple solid color background
    this.add.rectangle(worldWidth / 2, gameHeight / 2, worldWidth, gameHeight, 0x87CEEB);
    console.log('Simple background created');
  }

  startEndGameDialogue() {
    const dialogues = [
      {
        text: "Congratulations! You've visited all the landmarks and learned about Hanoi's rich history."
      },
      {
        text: "Your journey through the ancient streets has come to an end, but the memories will last forever."
      },
      {
        text: "Would you like to continue exploring or return to the main menu?",
        action: {
          type: 'changeScene',
          scene: 'WorldMapScene', // or 'MainMenu'
          text: 'Continue Journey'
        }
      }
    ];

    this.dialogueSystem.createDialogue(dialogues, () => {
      console.log('Dialogue completed!');
    });
  }

  createBackgroundElements(worldWidth, gameHeight) {
    // Create floating elements similar to the starfield example
    // These could be clouds, birds, floating leaves, etc.

    // Create a group for background elements
    const bgElementsGroup = this.add.group();

    // Generate floating elements
    for (let i = 0; i < 50; i++) {
      // Create simple cloud-like elements
      const element = this.add.graphics();
      element.fillStyle(0xffffff, 0.3);
      element.fillCircle(0, 0, Phaser.Math.Between(10, 30));

      // Random position across the world
      element.x = Phaser.Math.Between(0, worldWidth);
      element.y = Phaser.Math.Between(50, gameHeight - 200);

      // Different scroll factors for depth
      const scrollFactor = Phaser.Math.FloatBetween(0.2, 0.8);
      element.setScrollFactor(scrollFactor);
      element.setDepth(-5);

      bgElementsGroup.add(element);

      // Ignore these elements in the minimap
      if (this.minimap) {
        this.minimap.ignore(element);
      }
    }

    // Store reference for minimap setup
    this.backgroundElements = bgElementsGroup;
  }
  createBackButton() {
    // Position button at the same location as gameUI (16, 60) but offset it below
    const backButton = this.add.rectangle(20, 50, 60, 40, 0xFF5722)
      .setOrigin(0, 0) // Same origin as gameUI
      .setScrollFactor(0) // Same scroll factor as gameUI
      .setDepth(1000) // Above gameUI
      .setInteractive({ useHandCursor: true });

    console.log('Back button created');

    const backLabel = this.add.text(20, 40, '←', {
      fontSize: '50px', // Smaller font to match UI style
      fill: '#ffffff', // White text like other UI elements
      fontFamily: 'Inter, sans-serif'
    }).setOrigin(0, 0) // Same origin as gameUI
      .setScrollFactor(0) // Same scroll factor as gameUI
      .setDepth(1001); // Above button

    backButton.on('pointerover', () => {
      backButton.setFillStyle(0xCC4419);
    });
    backButton.on('pointerout', () => {
      backButton.setFillStyle(0xFF5722);
    });
    backButton.on('pointerdown', () => {
      this.scene.start('WorldMapScene');
    });

    // Store references if you need them later
    this.backButton = backButton;
    this.backLabel = backLabel;
  }

  createMinimap(worldWidth, gameHeight) {
    // Create minimap similar to the example
    const minimapWidth = 300;
    const minimapHeight = 80;
    const minimapX = this.scale.width - minimapWidth - 10;
    const minimapY = 10;

    // Calculate zoom to fit entire world in minimap
    const zoomX = minimapWidth / worldWidth;
    const zoomY = minimapHeight / gameHeight;
    const minimapZoom = Math.min(zoomX, zoomY);

    // Create minimap camera
    this.minimap = this.cameras.add(minimapX, minimapY, minimapWidth, minimapHeight)
      .setZoom(minimapZoom)
      .setName('minimap');

    this.minimap.setBackgroundColor(0x222222);
    this.minimap.setBounds(0, 0, worldWidth, gameHeight);

    // Ignore UI elements in minimap
    this.minimap.ignore([this.interactionText, this.gameUI]);

    // Ignore background elements in minimap
    if (this.backgroundElements) {
      this.backgroundElements.children.entries.forEach(element => {
        this.minimap.ignore(element);
      });
    }

    // Ignore parallax backgrounds in minimap (they would look weird)
    this.backgroundLayers.forEach(layer => {
      this.minimap.ignore(layer.sprite);
    });

    // Create minimap border
    this.minimapBorder = this.add.graphics()
      .lineStyle(2, 0xffffff, 1)
      .strokeRect(minimapX - 2, minimapY - 2, minimapWidth + 4, minimapHeight + 4)
      .setScrollFactor(0)
      .setDepth(1000);

    // Add minimap label
    this.add.text(minimapX, minimapY - 20, 'Map', {
      fontSize: '14px',
      color: '#ffffff',
      fontWeight: 'bold'
    }).setOrigin(0, 1).setScrollFactor(0).setDepth(1000);

    console.log('Minimap created at:', minimapX, minimapY);
  }

  update() {
    // Player movement
    const speed = this.playerSpeed || 200;

    if (this.cursors.left?.isDown || this.wasd.A?.isDown) {
      this.player.setVelocityX(-speed);
      // Change to running sprite and flip for left movement
      this.player.setTexture('player_run');
      this.player.setFlipX(true);
    } else if (this.cursors.right?.isDown || this.wasd.D?.isDown) {
      this.player.setVelocityX(speed);
      // Change to running sprite, no flip for right movement
      this.player.setTexture('player_run');
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
      // Change back to idle sprite when not moving
      this.player.setTexture('player');
      this.player.setFlipX(false);
    }

    if ((this.cursors.up?.isDown || this.wasd.W?.isDown || this.cursors.space?.isDown) && this.player.body?.touching.down) {
      this.player.setVelocityY(-500);
      EventBus.emit('player-jumped');
    }

    // // Update back button position to follow player
    // if (this.backButton && this.backLabel && this.player) {
    //   // Position button above and to the right of player
    //   const buttonX = this.player.x + 100; // 100 pixels to the right of player
    //   const buttonY = this.player.y - 100; // 100 pixels above player

    //   this.backButton.setPosition(buttonX, buttonY);
    //   this.backLabel.setPosition(buttonX, buttonY);
    // }

    // Update minimap to follow player
    if (this.minimap && this.player) {
      // Center minimap on player with some boundaries
      const minimapCenterX = this.player.x - (this.minimap.width / this.minimap.zoom) / 2;
      const minimapCenterY = this.player.y - (this.minimap.height / this.minimap.zoom) / 2;

      // Clamp to world bounds
      this.minimap.scrollX = Phaser.Math.Clamp(minimapCenterX, 0, 4000 - (this.minimap.width / this.minimap.zoom));
      this.minimap.scrollY = Phaser.Math.Clamp(minimapCenterY, 0, 600 - (this.minimap.height / this.minimap.zoom));
    }

    // Update parallax background layers based on camera movement
    this.updateParallaxLayers();

    this.checkNearbyLandmarks();
    this.updateUI();

    EventBus.emit('player-position-update', {
      x: this.player.x,
      y: this.player.y,
      velocity: {
        x: this.player.body.velocity.x,
        y: this.player.body.velocity.y
      }
    });
  }

  updateParallaxLayers() {
    // Update tileSprite positions based on camera scroll for enhanced parallax effect
    const cameraX = this.cameras.main.scrollX;

    this.backgroundLayers.forEach(layer => {
      // Move the tile sprite based on camera movement and layer speed
      layer.sprite.tilePositionX = cameraX * layer.speed;
    });
  }

  // Add method to toggle minimap visibility
  toggleMinimap() {
    if (this.minimap) {
      this.minimap.setVisible(!this.minimap.visible);
      this.minimapBorder.setVisible(!this.minimapBorder.visible);
    }
  }

  // Enhanced setup controls with minimap toggle
  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,S,A,D');

    // Space key for interaction
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.nearbyLandmarkData) {
        if (!this.gameProgress.landmarksVisited.includes(this.nearbyLandmarkData.id)) {
          this.gameProgress.landmarksVisited.push(this.nearbyLandmarkData.id);
          console.log(`Landmark visited: ${this.nearbyLandmarkData.name}`);
          this.checkGameCompletion();
        }

        EventBus.emit('landmark-interaction', this.nearbyLandmarkData);
        this.launchSlidingPuzzle(this.nearbyLandmarkData);
      }
    });

    // Manual save key (S key)
    this.input.keyboard.on('keydown-S', () => {
      this.saveGameProgress();
    });

    // Reset progress key (Shift+R)
    this.input.keyboard.on('keydown-R', () => {
      if (this.input.keyboard.checkDown(this.input.keyboard.addKey('SHIFT'))) {
        this.resetGameProgress();
        this.scene.restart();
      }
    });

    // Toggle minimap (M key)
    this.input.keyboard.on('keydown-M', () => {
      this.toggleMinimap();
    });
  }

  shutdown() {
    // Clean up EventBus listeners
    EventBus.off('pause-game', this.pauseGame, this);
    EventBus.off('resume-game', this.resumeGame, this);
    EventBus.off('toggle-music', this.toggleMusic, this);
    EventBus.off('player-boost', this.boostPlayer, this);

    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      this.backgroundMusic.stop();
    }

    this.input.keyboard.off('keydown-SPACE');
    this.input.keyboard.off('keydown-M');

    // Destroy parallax backgrounds
    this.backgroundLayers.forEach(layer => {
      if (layer.sprite) layer.sprite.destroy();
    });
    this.backgroundLayers = [];

    // Destroy minimap
    if (this.minimap) {
      this.cameras.remove(this.minimap);
      this.minimap = null;
    }
    if (this.minimapBorder) {
      this.minimapBorder.destroy();
      this.minimapBorder = null;
    }

    // Destroy other elements
    if (this.backgroundElements) this.backgroundElements.destroy(true);
    if (this.landmarksGroup) this.landmarksGroup.destroy(true);
    if (this.player) this.player.destroy();
    if (this.interactionText) this.interactionText.destroy();
    if (this.gameUI) this.gameUI.destroy();
    // Clean up dialogue system
    if (this.dialogueSystem) {
      this.dialogueSystem.forceClose();
    }
    EventBus.emit('game-scene-shutdown');
    super.shutdown();
  }

  // Keep all your existing methods (saveGameProgress, loadGameProgress, etc.)
  // ... [Include all your other existing methods here]

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
      this.resetGameProgress();
    }
  }

  resetGameProgress() {
    this.gameProgress = {
      playerPosition: { x: 512, y: 460 },
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

  createGround() {
    const ground = this.physics.add.staticGroup();
    for (let x = 0; x < 4000; x += 32) {
      ground.create(x, 568, 'ground').setOrigin(0, 0);
    }
    this.ground = ground;
  }

  createPlayer() {
    const startX = this.gameProgress.playerPosition.x;
    const startY = this.gameProgress.playerPosition.y;

    this.player = this.physics.add.sprite(startX, startY, 'player').setScale(1);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.ground);

    console.log(`Player created at position: (${startX}, ${startY})`);
    EventBus.emit('player-created', this.player);
  }

  createLandmarks() {
    this.landmarksGroup = this.add.group();

    // Use custom landmarks if provided, otherwise use default
    const landmarksToUse = this.customLandmarks || landmarks;

    landmarksToUse.forEach(landmark => {
      let landmarkSprite;

      if (landmark.sprite) {
        landmarkSprite = this.physics.add.staticImage(
          landmark.x,
          670 - landmark.height,
          landmark.id
        ).setOrigin(0, 1);
        landmarkSprite.setDisplaySize(landmark.width, landmark.height);
      } else {
        landmarkSprite = this.add.rectangle(
          landmark.x + landmark.width / 2,
          600 - landmark.height / 2,
          landmark.width,
          landmark.height,
          landmark.color
        );
      }
      console.log(`Creating landmark: ${landmark.name} at (${landmark.x}, ${580 - landmark.height})`);
      landmarkSprite.setData('landmarkData', landmark);

      const isCompleted = this.gameProgress.landmarksCompleted.includes(landmark.id);
      const isVisited = this.gameProgress.landmarksVisited.includes(landmark.id);

      let nameColor = '#000000';
      let nameText = landmark.name;

      if (isCompleted) {
        nameColor = '#27ae60';
        nameText = `✓ ${landmark.name}`;
        landmarkSprite.setTint(0x90EE90);
      } else if (isVisited) {
        nameColor = '#f39c12';
        nameText = `◐ ${landmark.name}`;
        landmarkSprite.setTint(0xFFE4B5);
      }

      // this.add.text(
      //   landmark.x + landmark.width / 2,
      //   620 - landmark.height - 20,
      //   nameText,
      //   {
      //     fontSize: '14px',
      //     color: nameColor,
      //     fontWeight: isCompleted ? 'bold' : 'normal'
      //   }
      // ).setOrigin(0.5);

      this.landmarksGroup.add(landmarkSprite);
    });

    console.log(`Landmarks created. Completed: ${this.gameProgress.landmarksCompleted.length}, Visited: ${this.gameProgress.landmarksVisited.length}`);
    EventBus.emit('landmarks-created', this.landmarksGroup);
  }

  launchSlidingPuzzle(landmarkData) {
    this.saveGameProgress();
    this.scene.pause();
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      this.backgroundMusic.pause();
    }
    this.scene.launch('SlidingPuzzleScene', { landmarkData });
    EventBus.emit('puzzle-launched', landmarkData);
  }

  setupEventListeners() {
    EventBus.on('puzzle-closed', this.resumeAfterPuzzle, this);
    EventBus.on('puzzle-completed', this.onPuzzleCompleted, this);
    EventBus.on('pause-game', this.pauseGame, this);
    EventBus.on('resume-game', this.resumeGame, this);
    EventBus.on('toggle-music', this.toggleMusic, this);
    EventBus.on('player-boost', this.boostPlayer, this);
  }

  onPuzzleCompleted(puzzleData) {
    console.log('Puzzle completed:', puzzleData);

    if (this.nearbyLandmarkData && !this.gameProgress.landmarksCompleted.includes(this.nearbyLandmarkData.id)) {
      this.gameProgress.landmarksCompleted.push(this.nearbyLandmarkData.id);
      console.log(`Landmark completed: ${this.nearbyLandmarkData.name}`);

      this.saveGameProgress();
      this.showLandmarkCompletionMessage(this.nearbyLandmarkData);
      this.checkGameCompletion();
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
    this.refreshLandmarkVisuals();
  }

  refreshLandmarkVisuals() {
    if (this.landmarksGroup) {
      this.landmarksGroup.destroy(true);
    }
    this.createLandmarks();
  }

  setupAutoSave() {
    this.time.addEvent({
      delay: 30000,
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

    // Add minimap toggle instruction
    this.add.text(16, this.scale.height - 30, 'Press M to toggle minimap', {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    }).setScrollFactor(0).setDepth(1000);
  }

  setupCamera(worldWidth, gameHeight) {
    this.cameras.main.startFollow(this.player, false, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, worldWidth, 600);
  }

  startBackgroundMusic() {
    const musicKey = this.sceneConfig.backgroundMusic;

    if (this.sound.get(musicKey) === null && this.sound.get(musicKey)) {
      this.backgroundMusic = this.sound.add(musicKey, {
        loop: true,
        volume: this.sceneConfig.musicVolume
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
    const originalSpeed = 200;
    const boostedSpeed = originalSpeed * boostData.speed;

    this.playerSpeed = boostedSpeed;

    this.time.delayedCall(boostData.duration, () => {
      this.playerSpeed = originalSpeed;
      EventBus.emit('player-boost-ended');
    });

    EventBus.emit('player-boost-started', boostData);
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

      const interactionRadius = (landmarkData.width / 2) + 100;
      if (distance < interactionRadius) {
        this.nearbyLandmarkData = landmarkData;

        if (!this.lastNearbyLandmark || this.lastNearbyLandmark.id !== landmarkData.id) {
          EventBus.emit('landmark-nearby', landmarkData);
          this.lastNearbyLandmark = landmarkData;
        }
      }
    });

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

    const distance = Math.floor(this.player.x / 10);
    this.gameProgress.totalDistance = Math.max(this.gameProgress.totalDistance, distance);

    const landmarksVisited = this.gameProgress.landmarksVisited.length;
    const landmarksCompleted = this.gameProgress.landmarksCompleted.length;

    const progressText = landmarksVisited >= this.REQUIRED_VISITS ?
      '🎉 READY FOR QUIZ!' :
      `Progress: ${landmarksVisited}/${this.REQUIRED_VISITS} visits`;

    const statsText = `Distance: ${distance}m | Visited: ${landmarksVisited}/${landmarks.length} | Completed: ${landmarksCompleted}/${landmarks.length}\n${progressText}`;

    this.gameUI.setText(statsText);

    EventBus.emit('game-stats-update', {
      distance,
      landmarksVisited,
      landmarksCompleted,
      totalLandmarks: landmarks.length,
      gameProgress: this.gameProgress,
      readyForQuiz: landmarksVisited >= this.REQUIRED_VISITS
    });
  }

  createEndZone() {
    // Create invisible end zone at the end of the map
    this.endZone = this.add.zone(3800, 500, 200, 200); // x, y, width, height
    this.physics.world.enable(this.endZone);
    this.endZone.body.setImmovable(true);

    // Optional: Add visual indicator (remove setVisible(false) to see it)
    const endZoneVisual = this.add.rectangle(3800, 500, 200, 200, 0x00ff00, 0.3)
      .setVisible(false); // Set to true for debugging

    // Set up collision detection
    this.physics.add.overlap(this.player, this.endZone, () => {
      this.checkGameCompletion();
    });
  }

  checkGameCompletion() {
    // Simply check if game is already completed to avoid multiple triggers
    if (!this.gameCompleted) {
      this.gameCompleted = true;

      // Start end game dialogue
      this.startEndGameDialogue();

      EventBus.emit('game-completed', this.gameProgress);
    }
  }

  createMultipleMountainsPerLandmark(gameWidth, gameHeight, worldWidth) {
    const landmarksToUse = this.customLandmarks || landmarks;
    
    if (!landmarksToUse || landmarksToUse.length === 0) return;

    landmarksToUse.forEach((landmark, landmarkIndex) => {
      // Create 2-3 mountains around each landmark
      const mountainCount = 2 + (landmarkIndex % 2); // 2 or 3 mountains per landmark
      
      for (let i = 0; i < mountainCount; i++) {
        const mountainIndex = ((landmarkIndex * mountainCount + i) % 5) + 1;
        const mountainKey = `mountain_${mountainIndex}`;
        
        if (this.textures.exists(mountainKey)) {
          // Calculate position relative to landmark
          const offsetFromCenter = (i - Math.floor(mountainCount / 2)) * 150; // Spread mountains around landmark
          const mountainX = landmark.x + (landmark.width / 2) + offsetFromCenter;
          
          // Vary mountain properties
          const scrollFactor = 0.2 + (i * 0.15) + (landmarkIndex * 0.05);
          const heightPercent = 0.5 + (i * 0.1);
          const mountainHeight = gameHeight * heightPercent;
          const mountainWidth = 200 + (i * 30);
          
          // DYNAMIC Y POSITIONING - Further mountains are higher, closer ones lower
          const baseYOffset = 50; // Base offset from bottom
          const layerYOffset = (mountainCount - i) * 0; // Further layers go higher
          const randomYOffset = (Math.random() - 0.5) * 40; // Add some randomness
          
          const mountainY = gameHeight - mountainHeight - baseYOffset - layerYOffset + randomYOffset;
          
          // Ensure mountain doesn't go above screen
          const finalMountainY = Math.max(0, Math.min(mountainY, gameHeight - mountainHeight));
          
          // Depth and visual effects
          const depth = -8 + i;
          const alpha = 0.8 + (i * 0.15);
          const tintColors = [0xB0C4DE, 0x8FBC8F, 0x708090, 0x2F4F2F, 0x556B2F];
          const tint = tintColors[i % tintColors.length];
          
          const mountainLayer = this.add.tileSprite(
            mountainX,
            finalMountainY,
            mountainWidth,
            mountainHeight,
            mountainKey
          )
            .setOrigin(0, 0)
            .setScrollFactor(scrollFactor)
            .setScale(1.5, 1.5)
            .setDisplaySize(mountainWidth, mountainHeight)
            .setDepth(depth)
            .setTint(tint)
            .setAlpha(alpha);
          
          this.backgroundLayers.push({ 
            sprite: mountainLayer, 
            speed: scrollFactor,
            name: `mountain_${i + 1}_at_${landmark.name.replace(/\s+/g, '_')}`,
            landmarkId: landmark.id,
            type: 'mountain'
          });
        }
      }
    });
  }
}