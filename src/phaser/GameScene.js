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
  }

  setLandmarkCallback(callback) {
    this.onLandmarkInteraction = callback;
  }

  preload() {
    // Load assets from src/asset folder
    this.load.image('player', 'src/assets/player2.png');
    this.load.audio('backgroundMusic', 'src/assets/music.mp3');

    // Create landmark textures
    landmarks.forEach(landmark => {
      this.add.graphics()
        .fillStyle(landmark.color)
        .fillRect(0, 0, landmark.width, landmark.height)
        .generateTexture(landmark.id, landmark.width, landmark.height);
    });

    // Create background elements
    this.add.graphics()
      .fillStyle(0x8FBC8F)
      .fillRect(0, 0, 32, 32)
      .generateTexture('ground', 32, 32);
  }

  create() {
    // Create world bounds
    this.physics.world.setBounds(0, 0, 4000, 600);

    // Create sky gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98);
    graphics.fillRect(0, 0, 4000, 600);

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
    this.backgroundMusic = this.sound.add('backgroundMusic', {
      loop: true,
      volume: 0.5
    });
    this.backgroundMusic.play();

    // Create landmarks
    this.landmarksGroup = this.add.group(); // Use the renamed variable
    landmarks.forEach(landmark => {
      const landmarkSprite = this.add.rectangle(
        landmark.x + landmark.width / 2,
        500 - landmark.height / 2, // Adjusted y to place on ground
        landmark.width,
        landmark.height,
        landmark.color
      );
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
      }
    });

    // Update UI
    if (this.nearbyLandmarkData) {
      this.interactionText.setText('Press SPACE to learn more');
      this.interactionText.setVisible(true);
    } else {
      this.interactionText.setVisible(false);
    }

    // Update game stats
    const distance = Math.floor(this.player.x / 10);
    const landmarksVisited = landmarks.filter(l => this.player.x > l.x).length;
    this.gameUI.setText(`Distance: ${distance}m | Landmarks: ${landmarksVisited}/${landmarks.length}`);
  }

  // Clean up when scene is destroyed
  destroy() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }
  }
}
