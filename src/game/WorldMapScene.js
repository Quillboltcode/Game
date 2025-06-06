// WorldMapScene.js
import Phaser from 'phaser';
import { EventBus } from './EventBus';

export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super('WorldMapScene');
    this.onLandmarkClick = null; // Callback for landmark clicks
  }

  init(data) {
    // Retrieve the onLandmarkClick callback passed from React
    if (data && data.onLandmarkClick) {
      this.onLandmarkClick = data.onLandmarkClick;
    }
  }

  preload() {
    // Load the world map image
    this.load.image('world_map', 'assets/map/map.jpg');
  }

  createLandmarkButton(x, y, text, targetScene, color) {
    const rect = this.add.rectangle(x, y, 220, 60, color, 0.8)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);
    rect.setStrokeStyle(4, 0x000000, 1);
    
    const label = this.add.text(x, y, text, {
      fontSize: '24px',
      fill: '#333333',
      fontFamily: 'Inter, sans-serif',
      align: 'center'
    }).setOrigin(0.5);

    rect.on('pointerover', () => {
      rect.setScale(1.05);
      label.setScale(1.05);
    });

    rect.on('pointerout', () => {
      rect.setScale(1);
      label.setScale(1);
    });

    rect.on('pointerdown', () => {
      console.log(`Navigating to ${targetScene}`);
      
      // Call the React callback when a landmark is clicked
      if (this.onLandmarkClick) {
        // Create the info object with relevant data
        const landmarkInfo = {
          name: text,
          scene: targetScene,
          position: { x, y },
          color: color
        };
        this.onLandmarkClick(landmarkInfo); // Pass the landmark data to React
      }
      
      this.scene.start(targetScene);
    });
  }

  create() {
    // Add the world map image as the background
    const map = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'world_map');
    // Scale the map to fit the game dimensions
    const scaleX = this.cameras.main.width / map.width;
    const scaleY = this.cameras.main.height / map.height;
    const scale = Math.max(scaleX, scaleY);
    map.setScale(scale);
    map.setOrigin(0.5, 0.5);

    this.add.text(this.cameras.main.width / 2, 50, 'Hanoi Adventure Map', {
      fontSize: '48px',
      fill: '#f0f0f0',
      fontFamily: 'Inter, sans-serif'
    }).setOrigin(0.5);

    // Interactive Landmark Markers
    this.createLandmarkButton(200, 250, 'Temple of Literature', 'TempleOfLiteratureScene', 0xCCFFCC);
    this.createLandmarkButton(200, 500, 'One Pillar Pagoda', 'OnePillarPagodaScene', 0xFFCCCC);
    this.createLandmarkButton(650, 150, 'Long Biên Bridge', 'LongBienBridgeScene', 0xCCDDFF);
    this.createLandmarkButton(400, 200, 'Hoàn Kiếm Lake', 'HoanKiemLakeScene', 0xFFFFCC);
    this.createLandmarkButton(600, 450, 'Old Quarter', 'OldQuarterScene', 0xCCCCFF);
    
    // Add button to go to your existing GameScene
    this.createLandmarkButton(400, 350, 'Adventure Mode', 'GameScene', 0xFFCC99);

    // Options button
    this.add.text(this.cameras.main.width - 150, this.cameras.main.height - 50, 'Options', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
      console.log('Options clicked!');
    });

    // Emit event that the scene is ready
    EventBus.emit('current-scene-ready', this);
  }
}