import Phaser from 'phaser';

export class HoanKiemLakeScene extends Phaser.Scene {
  constructor() {
    super('HoanKiemLakeScene');
  }

  create() {
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'mountains_bg');
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    bg.setScale(Math.max(scaleX, scaleY));
    bg.setOrigin(0.5, 0.5);

    this.add.text(this.cameras.main.width / 2, 100, 'Welcome to Hoàn Kiếm Lake!', {
      fontSize: '48px',
      fill: '#ADD8E6',
      fontFamily: 'Inter, sans-serif'
    }).setOrigin(0.5);

    this.add.text(this.cameras.main.width / 2, 200, 'Your adventure begins here...', {
      fontSize: '28px',
      fill: '#FFFFFF',
      fontFamily: 'Inter, sans-serif'
    }).setOrigin(0.5);

    // Back to Map Button
    this.createBackButton();
  }

  createBackButton() {
    const backButton = this.add.rectangle(100, this.cameras.main.height - 50, 120, 40, 0xFF5722)
      .setInteractive({ useHandCursor: true });

    const backLabel = this.add.text(100, this.cameras.main.height - 50, 'Back to Map', {
      fontSize: '20px',
      fill: '#FFFFFF',
      fontFamily: 'Inter, sans-serif'
    }).setOrigin(0.5);

    backButton.on('pointerover', () => {
      backButton.setFillStyle(0xCC4419);
    });
    backButton.on('pointerout', () => {
      backButton.setFillStyle(0xFF5722);
    });
    backButton.on('pointerdown', () => {
      this.scene.start('WorldMapScene');
    });
  }
}