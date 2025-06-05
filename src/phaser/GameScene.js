// src/phaser/GameScene.js
import Phaser from 'phaser';
import { landmarks } from '../data/landmark'; // Adjust path if necessary

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.player = null;
    this.cursors = null;
    this.wasd = null;
    this.landmarksGroup = null; // Renamed for clarity from this.landmarks
    this.nearbyLandmarkData = null; // Renamed for clarity
    this.interactionText = null;
    this.gameUI = null;
    this.onLandmarkInteraction = null;
    this.backgroundMusic = null;

    // Parallax background layers
    this.skyLayer = null;
    this.mountainLayer = null;
    this.treeLayer = null;
  }

  setLandmarkCallback(callback) {
    this.onLandmarkInteraction = callback;
  }

  preload() {
    // Load assets from src/asset folder
    this.load.image('player', 'assets/player2.png');
    this.load.audio('backgroundMusic', 'assets/music.mp3');

        // Load images for parallax effect
    // Replace with your actual asset paths and names
    this.load.image('sky_bg', 'assets/bglake2.png');
    this.load.image('mountains_bg', 'assets/grasslake.png');
    this.load.image('trees_fg', 'assets/midlake.png');

    // Create landmark textures
    landmarks.forEach(landmark => {
      if (landmark.sprite) {
        console.log(`Loading landmark sprite: ${landmark.sprite}`);
        this.load.image(landmark.id, `src/assets/${landmark.sprite}`);
      } else {
      console.log(`Creating landmark rectangle: ${landmark.id} with color ${landmark.color}`);
      // load template textures for landmarks
      this.add.graphics()
        .fillStyle(landmark.color)
        .fillRect(0, 0, landmark.width, landmark.height)
        .generateTexture(landmark.id, landmark.width, landmark.height);}
    });

    // Create background elements
    // Temp bg
    // Create ground texture (if not already loaded elsewhere or if you prefer dynamic)
    if (!this.textures.exists('ground')) {
      this.add.graphics()
        .fillStyle(0x8FBC8F) // A green color for the ground
        .fillRect(0, 0, 32, 32)
        .generateTexture('ground', 32, 32);
    }
  }

  create() {
    // Create world bounds
    // game dimensions for convenience
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const worldWidth = 4000; // Your defined world width

    // Create world bounds
    this.physics.world.setBounds(0, 0, worldWidth, gameHeight)
    // --- Parallax Background Layers ---
    // Sky (furthest back, moves slowest or not at all with camera)
    // We use a TileSprite so the image can repeat if it's smaller than the world.
    // Its width should be the game's viewport width, and it's fixed by scrollFactor(0).
    // We then manually scroll its tilePositionX.
    this.skyLayer = this.add.tileSprite(0, 0, gameWidth, gameHeight, 'sky_bg')
      .setOrigin(0, 0)
      .setScrollFactor(0) // Stays fixed with the camera viewport
      .setScale(0.5)
      .setDepth(-5);    // Furthest back
    
    // Mountains (middle layer)
    this.mountainLayer = this.add.tileSprite(0, 0, gameWidth, gameHeight, 'mountains_bg')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-4);  // In front of sky

    // Trees (closer layer)
    this.treeLayer = this.add.tileSprite(0, 0, gameWidth, gameHeight, 'trees_fg')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-3);    

    // Create sky gradient background
    // The old gradient background is no longer needed
    // const graphics = this.add.graphics();
    // graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98);
    // graphics.fillRect(0, 0, 4000, 600);

    // Create ground
    const ground = this.physics.add.staticGroup();
    for (let x = 0; x < 4000; x += 32) {
      ground.create(x, 568, 'ground').setOrigin(0, 0);
    }

    // Create player with loaded sprite
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Player physics
    this.physics.add.collider(this.player, ground);

    // Start background music
    if (this.sound.get('backgroundMusic') === null) { // Play only if not already playing (e.g. scene restart)
        this.backgroundMusic = this.sound.add('backgroundMusic', {
            loop: true,
            volume: 0.5
        });
        // Ensure audio context is resumed on user interaction if needed
        if (this.sound.locked) {
            this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
                this.backgroundMusic.play();
            });
        } else {
            this.backgroundMusic.play();
        }
    }

    // Create landmarks
    this.landmarksGroup = this.add.group(); // Use the renamed variable
    landmarks.forEach(landmark => {
      let landmarkSprite;
      if (landmark.sprite) {
        landmarkSprite = this.physics.add.staticImage(landmark.x, 550 - landmark.height, landmark.id).setOrigin(0, 1);
        // Scale the sprite to match landmark dimensions img too big
      landmarkSprite.setDisplaySize(landmark.width, landmark.height);
      } else {
        landmarkSprite = this.add.rectangle(
          landmark.x + landmark.width / 2,
          500 - landmark.height / 2, // Adjusted y to place on ground
          landmark.width,
          landmark.height,
          landmark.color
        )
      };
      // Instead of using texture, we directly use the rectangle.
      // If you were using images:
      // const landmarkSprite = this.physics.add.staticImage(landmark.x, 550 - landmark.height, landmark.id).setOrigin(0,1);
      landmarkSprite.setData('landmarkData', landmark);

      // Add landmark name text
      this.add.text(landmark.x + landmark.width / 2, 500 - landmark.height - 20, landmark.name, {
        fontSize: '14px',
        color: '#000000'
      }).setOrigin(0.5);

      this.landmarksGroup.add(landmarkSprite); // Add to the group
    });

    // Create controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,S,A,D');

    // Add space key for interaction
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.nearbyLandmarkData && this.onLandmarkInteraction) {
        this.onLandmarkInteraction(this.nearbyLandmarkData);
      }
    });

    // Create UI text (fixed to camera)
    this.interactionText = this.add.text(16, 16, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0); // Make UI text fixed to camera

    this.gameUI = this.add.text(16, 60, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0); // Make UI text fixed to camera

    // Camera follows player
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, 4000, 600);
  }

  update() {
    // Player movement
    const speed = 200;

    if (this.cursors.left?.isDown || this.wasd.A?.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right?.isDown || this.wasd.D?.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if ((this.cursors.up?.isDown || this.wasd.W?.isDown || this.cursors.space?.isDown) && this.player.body?.touching.down) {
      this.player.setVelocityY(-500); // Adjusted jump velocity
    }

    // Check for nearby landmarks
    this.nearbyLandmarkData = null;
    this.landmarksGroup.children.entries.forEach((landmarkSprite) => { // Iterate over the group
      const landmarkData = landmarkSprite.getData('landmarkData');
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        landmarkSprite.x, // Use landmarkSprite's x,y for distance calculation
        landmarkSprite.y
      );

      // Adjust interaction distance based on landmark size, e.g., half its width + a buffer
      const interactionRadius = (landmarkData.width / 2) + 50;
      if (distance < interactionRadius) {
        this.nearbyLandmarkData = landmarkData;
        console.log(`Nearby landmark: ${landmarkData.name}`);
      }
    });

    // Update UI
    if (this.nearbyLandmarkData) {
      this.interactionText.setText('Press SPACE to learn more');
      //     this.input.keyboard.on('keydown-SPACE', () => {
      // console.log('Space pressed, nearbyLandmark:', this.nearbyLandmarkData); // Debug log
      // console.log('Callback exists:', !!this.onLandmarkInteraction); });
      this.interactionText.setPosition(this.player.x - 50, this.player.y - 100); // Position above player
      this.interactionText.setVisible(true);

    } else {
      this.interactionText.setVisible(false);
    }

    // Update game stats
    const distance = Math.floor(this.player.x / 10);
    const landmarksVisited = landmarks.filter(l => this.player.x > l.x).length;
    this.gameUI.setText(`Distance: ${distance}m | Landmarks: ${landmarksVisited}/${landmarks.length}`);
  }

    // Clean up when scene is destroyed or shut down
  shutdown() {
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      this.backgroundMusic.stop();
    }
    // Remove keyboard listeners to prevent memory leaks if scene is restarted
    this.input.keyboard.off('keydown-SPACE');

    // It's good practice to destroy game objects if the scene might be restarted,
    // though Phaser often handles this. TileSprites, groups, etc.
    if (this.skyLayer) this.skyLayer.destroy();
    if (this.mountainLayer) this.mountainLayer.destroy();
    if (this.treeLayer) this.treeLayer.destroy();
    if (this.landmarksGroup) this.landmarksGroup.destroy(true); // true to destroy children
    if (this.player) this.player.destroy();
    //Texts
    if(this.interactionText) this.interactionText.destroy();
    if(this.gameUI) this.gameUI.destroy();

  }
    // Phaser calls destroy on scene shutdown, which in turn calls shutdown.
  // Explicitly defining destroy might be for overriding specific Phaser behavior or for plugin needs.
  // Generally, shutdown() is the place for your cleanup logic.
  // Clean up when scene is destroyed
  destroy() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }
  }
}
