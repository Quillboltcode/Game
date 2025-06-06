import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

// --- SCENE DEFINITIONS (Moved into this file for self-containment) ---

/**
 * PreloadScene
 * This scene is responsible for loading all game assets before the game starts.
 */
class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Display loading text and progress bar
        let progressBar = this.add.graphics();
        let progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(this.cameras.main.width / 2 - 160, this.cameras.main.height / 2 - 25, 320, 50);

        let width = this.cameras.main.width;
        let height = this.cameras.main.height;
        let loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading Game Assets...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        let percentText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            // Transition to the WorldMapScene after all assets are loaded
            this.scene.start('WorldMapScene');
        }, this);

        // --- Load Game Assets ---
        // For Vite/React, assets often go into the 'public' folder
        // and are referenced from the root ('/') or a specific path.
        // Assuming assets are in 'public/assets/' and 'ingame map.jpg' is in 'public/'.
        this.load.image('sky_bg', '/assets/bglake3.png');
        this.load.image('mountains_bg', '/assets/grasslake.png');
        this.load.image('trees_fg', '/assets/midlake.png');

        // Your Hanoi game map image (assuming it's in the public folder)
        this.load.image('world_map', '/ingame map.jpg');

        // Placeholder assets (you can replace these with actual icons for landmarks)
        this.load.image('landmark_icon', 'https://placehold.co/60x60/4CAF50/FFFFFF?text=L'); // Green placeholder
        this.load.image('back_button', 'https://placehold.co/100x40/FF5722/FFFFFF?text=Back'); // Red placeholder
    }

    create() {
        // This method will be called once all assets are loaded.
        // The scene transition is handled in the 'complete' event listener of the loader.
    }
}

/**
 * WorldMapScene
 * This scene displays the interactive world map of Hanoi.
 * Players click on landmarks to navigate to specific game stages.
 */
class WorldMapScene extends Phaser.Scene {
    constructor() {
        super('WorldMapScene');
    }

    create() {
        // Add the world map image as the background
        const map = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'world_map');
        
        // Scale the map to fit the game dimensions while maintaining aspect ratio
        const scaleX = this.cameras.main.width / map.width;
        const scaleY = this.cameras.main.height / map.height;
        const scale = Math.max(scaleX, scaleY); // Use Math.max to ensure it covers the screen
        map.setScale(scale);
        // Center the map, if it's larger than the screen, it will be cropped
        map.setOrigin(0.5, 0.5);

        this.add.text(this.cameras.main.width / 2, 50, 'Hanoi Adventure Map', {
            fontSize: '48px',
            fill: '#f0f0f0',
            fontFamily: 'Inter, sans-serif'
        }).setOrigin(0.5);

        // --- Interactive Landmark Markers ---
        // You'll need to adjust these positions (x, y) based on your 'ingame map.jpg'
        // and the actual locations of the landmarks on it.
        // For better accuracy, you might want to use actual image sprites instead of text.

        this.createLandmarkButton(200, 250, 'Temple of Literature', 'TempleOfLiteratureScene', 0xCCFFCC);
        this.createLandmarkButton(400, 200, 'One Pillar Pagoda', 'OnePillarPagodaScene', 0xFFCCCC);
        this.createLandmarkButton(650, 150, 'Long Biên Bridge', 'LongBienBridgeScene', 0xCCDDFF);
        this.createLandmarkButton(200, 500, 'Hoàn Kiếm Lake', 'HoanKiemLakeScene', 0xFFFFCC);
        this.createLandmarkButton(600, 450, 'Old Quarter', 'OldQuarterScene', 0xCCCCFF);

        // Add a placeholder for "back to menu" or "options" if needed
        this.add.text(this.cameras.main.width - 150, this.cameras.main.height - 50, 'Options', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            console.log('Options clicked!');
            // You would typically open an options menu scene here
        });
    }

    /**
     * Helper function to create interactive landmark buttons.
     * @param {number} x - X coordinate of the button.
     * @param {number} y - Y coordinate of the button.
     * @param {string} text - Text to display on the button.
     * @param {string} targetScene - The scene to transition to when clicked.
     * @param {number} color - Hex color for the background rectangle.
     */
    createLandmarkButton(x, y, text, targetScene, color) {
        // Create a clickable rectangular background for the text
        const rect = this.add.rectangle(x, y, 220, 60, color, 0.8)
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5);
        rect.setStrokeStyle(4, 0x000000, 1); // Add a black border

        // Add the landmark name text
        const label = this.add.text(x, y, text, {
            fontSize: '24px',
            fill: '#333333',
            fontFamily: 'Inter, sans-serif',
            align: 'center'
        }).setOrigin(0.5);

        // Add pointer events for interaction
        rect.on('pointerover', () => {
            rect.setScale(1.05); // Slightly enlarge on hover
            label.setScale(1.05);
        });
        rect.on('pointerout', () => {
            rect.setScale(1); // Reset scale
            label.setScale(1);
        });
        rect.on('pointerdown', () => {
            console.log(`Navigating to ${targetScene}`);
            this.scene.start(targetScene);
        });
    }
}

/**
 * HoanKiemLakeScene
 * An example gameplay scene for the Hoàn Kiếm Lake area.
 */
class HoanKiemLakeScene extends Phaser.Scene {
    constructor() {
        super('HoanKiemLakeScene');
    }

    create() {
        // Example: Using a loaded background image
        const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'mountains_bg');
        // Scale the background to cover the screen
        const scaleX = this.cameras.main.width / bg.width;
        const scaleY = this.cameras.main.height / bg.height;
        bg.setScale(Math.max(scaleX, scaleY));
        bg.setOrigin(0.5, 0.5);

        this.add.text(this.cameras.main.width / 2, 100, 'Welcome to Hoàn Kiếm Lake!', {
            fontSize: '48px',
            fill: '#ADD8E6', // Light blue
            fontFamily: 'Inter, sans-serif'
        }).setOrigin(0.5);

        this.add.text(this.cameras.main.width / 2, 200, 'Your adventure begins here...', {
            fontSize: '28px',
            fill: '#FFFFFF',
            fontFamily: 'Inter, sans-serif'
        }).setOrigin(0.5);

        // --- Back to Map Button ---
        const backButton = this.add.image(100, this.cameras.main.height - 50, 'back_button')
            .setInteractive({ useHandCursor: true })
            .setScale(1.2); // Make it a bit bigger for easier clicking

        const backLabel = this.add.text(100, this.cameras.main.height - 50, 'Back to Map', {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Inter, sans-serif'
        }).setOrigin(0.5);

        backButton.on('pointerover', () => {
            backButton.setTint(0xaaaaaa); // Darken on hover
        });
        backButton.on('pointerout', () => {
            backButton.clearTint(); // Clear tint
        });
        backButton.on('pointerdown', () => {
            this.scene.start('WorldMapScene'); // Transition back to the world map
        });
    }
}

/**
 * TempleOfLiteratureScene
 * An example gameplay scene for the Temple of Literature area.
 */
class TempleOfLiteratureScene extends Phaser.Scene {
    constructor() {
        super('TempleOfLiteratureScene');
    }

    create() {
        const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'trees_fg');
        const scaleX = this.cameras.main.width / bg.width;
        const scaleY = this.cameras.main.height / bg.height;
        bg.setScale(Math.max(scaleX, scaleY));
        bg.setOrigin(0.5, 0.5);

        this.add.text(this.cameras.main.width / 2, 100, 'Exploring Temple of Literature!', {
            fontSize: '48px',
            fill: '#FFE4B5', // Moccasin
            fontFamily: 'Inter, sans-serif'
        }).setOrigin(0.5);

        this.add.text(this.cameras.main.width / 2, 200, 'Discover ancient wisdom...', {
            fontSize: '28px',
            fill: '#FFFFFF',
            fontFamily: 'Inter, sans-serif'
        }).setOrigin(0.5);

        // --- Back to Map Button ---
        const backButton = this.add.image(100, this.cameras.main.height - 50, 'back_button')
            .setInteractive({ useHandCursor: true })
            .setScale(1.2);

        const backLabel = this.add.text(100, this.cameras.main.height - 50, 'Back to Map', {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Inter, sans-serif'
        }).setOrigin(0.5);

        backButton.on('pointerover', () => {
            backButton.setTint(0xaaaaaa);
        });
        backButton.on('pointerout', () => {
            backButton.clearTint();
        });
        backButton.on('pointerdown', () => {
            this.scene.start('WorldMapScene');
        });
    }
}

/**
 * LongBienBridgeScene
 * An example gameplay scene for the Long Biên Bridge area.
 */
class LongBienBridgeScene extends Phaser.Scene {
    constructor() {
        super('LongBienBridgeScene');
    }

    create() {
        const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'sky_bg');
        const scaleX = this.cameras.main.width / bg.width;
        const scaleY = this.cameras.main.height / bg.height;
        bg.setScale(Math.max(scaleX, scaleY));
        bg.setOrigin(0.5, 0.5);

        this.add.text(this.cameras.main.width / 2, 100, 'Crossing Long Biên Bridge!', {
            fontSize: '48px',
            fill: '#ADD8E6', // Light blue
            fontFamily: 'Inter, sans-serif'
        }).setOrigin(0.5);

        this.add.text(this.cameras.main.width / 2, 200, 'A historic journey awaits...', {
            fontSize: '28px',
            fill: '#FFFFFF',
            fontFamily: 'Inter, sans-serif'
        }).setOrigin(0.5);

        // --- Back to Map Button ---
        const backButton = this.add.image(100, this.cameras.main.height - 50, 'back_button')
            .setInteractive({ useHandCursor: true })
            .setScale(1.2);

        const backLabel = this.add.text(100, this.cameras.main.height - 50, 'Back to Map', {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Inter, sans-serif'
        }).setOrigin(0.5);

        backButton.on('pointerover', () => {
            backButton.setTint(0xaaaaaa);
        });
        backButton.on('pointerout', () => {
            backButton.clearTint();
        });
        backButton.on('pointerdown', () => {
            this.scene.start('WorldMapScene');
        });
    }
}

/**
 * OnePillarPagodaScene
 * Placeholder for the One Pillar Pagoda scene.
 */
class OnePillarPagodaScene extends Phaser.Scene {
    constructor() {
        super('OnePillarPagodaScene');
    }

    create() {
        this.add.text(this.cameras.main.width / 2, 100, 'One Pillar Pagoda is Under Construction!', {
            fontSize: '40px',
            fill: '#FFA07A', // Light Salmon
            fontFamily: 'Inter, sans-serif',
            align: 'center'
        }).setOrigin(0.5);
        this.add.text(this.cameras.main.width / 2, 200, 'Check back later for this stage.', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Inter, sans-serif'
        }).setOrigin(0.5);

        // --- Back to Map Button ---
        const backButton = this.add.image(100, this.cameras.main.height - 50, 'back_button')
            .setInteractive({ useHandCursor: true })
            .setScale(1.2);

        const backLabel = this.add.text(100, this.cameras.main.height - 50, 'Back to Map', {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Inter, sans-serif'
        }).setOrigin(0.5);

        backButton.on('pointerover', () => {
            backButton.setTint(0xaaaaaa);
        });
        backButton.on('pointerout', () => {
            backButton.clearTint();
        });
        backButton.on('pointerdown', () => {
            this.scene.start('WorldMapScene');
        });
    }
}

/**
 * OldQuarterScene
 * Placeholder for the Old Quarter scene.
 */
class OldQuarterScene extends Phaser.Scene {
    constructor() {
        super('OldQuarterScene');
    }

    create() {
        this.add.text(this.cameras.main.width / 2, 100, 'Exploring the Old Quarter!', {
            fontSize: '48px',
            fill: '#DDA0DD', // Plum
            fontFamily: 'Inter, sans-serif'
        }).setOrigin(0.5);
        this.add.text(this.cameras.main.width / 2, 200, 'So many streets to discover...', {
            fontSize: '28px',
            fill: '#FFFFFF',
            fontFamily: 'Inter, sans-serif'
        }).setOrigin(0.5);

        // --- Back to Map Button ---
        const backButton = this.add.image(100, this.cameras.main.height - 50, 'back_button')
            .setInteractive({ useHandCursor: true })
            .setScale(1.2);

        const backLabel = this.add.text(100, this.cameras.main.height - 50, 'Back to Map', {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Inter, sans-serif'
        }).setOrigin(0.5);

        backButton.on('pointerover', () => {
            backButton.setTint(0xaaaaaa);
        });
        backButton.on('pointerout', () => {
            backButton.clearTint();
        });
        backButton.on('pointerdown', () => {
            this.scene.start('WorldMapScene');
        });
    }
}




