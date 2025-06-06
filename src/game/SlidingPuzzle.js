// SlidingPuzzleScene.js - Refactored with proper image tile handling
import Phaser from 'phaser';
import { EventBus } from './EventBus';

export class SlidingPuzzle extends Phaser.Scene {
    constructor() {
        super({ key: 'SlidingPuzzleScene' });
        this.gridSize = 3;
        this.tileSize = 80;
        this.gap = 2;
        this.tiles = [];
        this.emptyIndex = 8; // Bottom right corner
        this.moves = 0;
        this.isComplete = false;
        this.startTime = 0;
        this.imageLoaded = false;
        this.landmarkData = null;
        this.puzzleImagePath = null;
        this.puzzleTextureKey = null; // Add unique texture key
    }

    init(data) {
        // Receive data from GameScene
        this.landmarkData = data.landmarkData;

        // Get puzzle image path from landmark data
        if (this.landmarkData && this.landmarkData.puzzle) {
            this.puzzleImagePath = this.landmarkData.puzzle;
            // Create unique texture key based on landmark ID and timestamp
            this.puzzleTextureKey = `puzzle_${this.landmarkData.id}_${Date.now()}`;
        } else {
            // Fallback to default image if no puzzle specified
            this.puzzleImagePath = './assets/background/mountain1.png';
            this.puzzleTextureKey = `puzzle_default_${Date.now()}`;
        }

        console.log('Loading puzzle image:', this.puzzleImagePath);
        console.log('Using texture key:', this.puzzleTextureKey);
    }

    preload() {
        // Remove existing texture if it exists
        if (this.textures.exists('puzzle_image')) {
            this.textures.remove('puzzle_image');
        }
        
        // Load the specific puzzle image with unique key
        if (this.puzzleImagePath && this.puzzleTextureKey) {
            this.load.image(this.puzzleTextureKey, this.puzzleImagePath);
        } else {
            // Fallback to a default image
            this.puzzleTextureKey = `puzzle_default_${Date.now()}`;
            this.load.image(this.puzzleTextureKey, './assets/background/mountain1.png');
        }

        // Listen for load complete
        this.load.on('complete', () => {
            this.imageLoaded = true;
        });
    }

    create() {
        this.startTime = Date.now();

        // Background
        this.add.rectangle(400, 300, 800, 600, 0x2c3e50);

        // Title
        this.add.text(400, 50, 'SLIDING PUZZLE', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);

        // Instructions
        this.add.text(400, 90, 'Arrange the pieces to complete the image', {
            fontSize: '16px',
            fill: '#bdc3c7',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Wait for image to be loaded, then create tiles
        if (this.imageLoaded) {
            this.initializePuzzle();
        } else {
            // If image isn't loaded yet, wait for it
            this.load.on('complete', () => {
                this.initializePuzzle();
            });
        }

        // Create UI first (independent of image)
        this.createUI();

        // Enable input
        this.input.on('gameobjectdown', this.onTileClick, this);
    }

    initializePuzzle() {
        // Create image tiles from the loaded image
        this.createImageTiles();

        // Create empty tile texture
        this.createEmptyTile();

        // Create puzzle board
        this.createPuzzleBoard();

        // Shuffle the puzzle
        this.shufflePuzzle();
    }

    createImageTiles() {
        try {
            // Use the unique texture key instead of 'puzzle_image'
            const puzzleTexture = this.textures.get(this.puzzleTextureKey);
            if (!puzzleTexture || !puzzleTexture.source[0]) {
                console.error('Puzzle image not loaded properly');
                return;
            }

            const sourceWidth = puzzleTexture.source[0].width;
            const sourceHeight = puzzleTexture.source[0].height;

            // Calculate tile dimensions from source image
            const tileWidth = sourceWidth / this.gridSize;
            const tileHeight = sourceHeight / this.gridSize;

            // Create tiles from the main image
            for (let i = 0; i < 8; i++) {
                const row = Math.floor(i / this.gridSize);
                const col = i % this.gridSize;

                // Calculate crop position
                const cropX = col * tileWidth;
                const cropY = row * tileHeight;

                // Create canvas for this tile with unique key
                const canvas = this.createTileCanvas(cropX, cropY, tileWidth, tileHeight, this.puzzleTextureKey);

                // Add texture to Phaser with unique key
                const tileTextureKey = `${this.puzzleTextureKey}_tile_${i + 1}`;
                this.textures.addCanvas(tileTextureKey, canvas);
            }
        } catch (error) {
            console.error('Error creating image tiles:', error);
            // Fallback to numbered tiles
            this.createNumberedTiles();
        }
    }

    createTileCanvas(x, y, width, height, sourceKey) {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');

        try {
            const sourceImage = this.textures.get(sourceKey).source[0].image;

            // Draw the cropped portion of the source image onto the canvas
            ctx.drawImage(
                sourceImage,
                x, y, width, height,  // Source rectangle
                0, 0, this.tileSize, this.tileSize  // Destination rectangle
            );

            // Add border to make tiles more distinct
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, this.tileSize, this.tileSize);

        } catch (error) {
            console.error('Error drawing tile canvas:', error);
            // Fill with solid color as fallback
            ctx.fillStyle = '#3498db';
            ctx.fillRect(0, 0, this.tileSize, this.tileSize);
        }

        return canvas;
    }

    createNumberedTiles() {
        // Fallback numbered tiles if image fails
        for (let i = 1; i <= 8; i++) {
            const graphics = this.add.graphics();

            // Tile background with gradient effect
            graphics.fillGradientStyle(0x3498db, 0x2980b9, 0x3498db, 0x2980b9);
            graphics.fillRoundedRect(0, 0, this.tileSize, this.tileSize, 8);

            // Border
            graphics.lineStyle(2, 0x2c3e50);
            graphics.strokeRoundedRect(0, 0, this.tileSize, this.tileSize, 8);

            // Number text
            const text = this.add.text(this.tileSize / 2, this.tileSize / 2, i.toString(), {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial Black'
            }).setOrigin(0.5);

            // Create texture from graphics
            graphics.generateTexture(`image_tile_${i}`, this.tileSize, this.tileSize);
            graphics.destroy();
            text.destroy();
        }
    }

    createEmptyTile() {
        const emptyGraphics = this.add.graphics();
        emptyGraphics.fillStyle(0x34495e, 0.3);
        emptyGraphics.fillRoundedRect(0, 0, this.tileSize, this.tileSize, 8);
        emptyGraphics.lineStyle(2, 0x2c3e50, 0.5);
        emptyGraphics.strokeRoundedRect(0, 0, this.tileSize, this.tileSize, 8);
        emptyGraphics.generateTexture('empty_tile', this.tileSize, this.tileSize);
        emptyGraphics.destroy();
    }

    createPuzzleBoard() {
        const startX = 400 - (this.gridSize * (this.tileSize + this.gap)) / 2 + this.tileSize / 2;
        const startY = 200;

        // Clear existing tiles if any
        if (this.tiles.length > 0) {
            this.tiles.forEach(tile => {
                if (tile) tile.destroy();
            });
            this.tiles = [];
        }

        // Initialize tiles array with correct positions (1-8, then empty)
        for (let i = 0; i < 9; i++) {
            const row = Math.floor(i / this.gridSize);
            const col = i % this.gridSize;
            const x = startX + col * (this.tileSize + this.gap);
            const y = startY + row * (this.tileSize + this.gap);

            if (i < 8) {
                // Use unique tile texture key
                const tileKey = `${this.puzzleTextureKey}_tile_${i + 1}`;

                // Check if texture exists, fallback to numbered if not
                const textureKey = this.textures.exists(tileKey) ? tileKey : `tile_${i + 1}`;

                const tile = this.add.image(x, y, textureKey)
                    .setInteractive()
                    .setData('number', i + 1)
                    .setData('index', i)
                    .setData('originalIndex', i);

                // Add hover effect
                tile.on('pointerover', () => {
                    if (this.canMoveTile(tile.getData('index'))) {
                        tile.setTint(0xf39c12);
                    }
                });

                tile.on('pointerout', () => {
                    tile.clearTint();
                });

                this.tiles[i] = tile;
            } else {
                // Empty space
                const emptyTile = this.add.image(x, y, 'empty_tile')
                    .setData('number', 0)
                    .setData('index', i);
                this.tiles[i] = emptyTile;
            }
        }
    }

    createUI() {
        // Moves counter
        this.movesText = this.add.text(200, 500, 'Moves: 0', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        console.log("created movesText:", this.movesText);
        // Timer
        this.timerText = this.add.text(400, 500, 'Time: 00:00', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Buttons
        this.shuffleButton = this.add.text(600, 500, 'SHUFFLE', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            backgroundColor: '#e74c3c',
            padding: { x: 15, y: 8 }
        })
            .setInteractive()
            .on('pointerdown', () => this.shufflePuzzle())
            .on('pointerover', () => this.shuffleButton.setStyle({ backgroundColor: '#c0392b' }))
            .on('pointerout', () => this.shuffleButton.setStyle({ backgroundColor: '#e74c3c' }));

        // Back to game button
        this.backButton = this.add.text(50, 50, '← BACK', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            backgroundColor: '#95a5a6',
            padding: { x: 15, y: 8 }
        })
            .setInteractive()
            .on('pointerdown', () => {
                EventBus.emit('puzzle-exit'); // Emit event for parent scene
                this.scene.start('GameScene');
            })
            .on('pointerover', () => this.backButton.setStyle({ backgroundColor: '#7f8c8d' }))
            .on('pointerout', () => this.backButton.setStyle({ backgroundColor: '#95a5a6' }));

        // Show reference image (small version)
        this.showReferenceImage();
    }

    showReferenceImage() {
        // Use the unique texture key for reference image
        if (this.textures.exists(this.puzzleTextureKey)) {
            const refImage = this.add.image(700, 150, this.puzzleTextureKey)
                .setScale(0.3)
                .setAlpha(0.8);

            // Add border
            const border = this.add.rectangle(700, 150, refImage.displayWidth + 4, refImage.displayHeight + 4)
                .setStrokeStyle(2, 0xffffff, 0.8);

            // Add label
            this.add.text(700, 100, 'Reference', {
                fontSize: '14px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
        }
    }

    update() {
        if (!this.isComplete) {
            // Update timer
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            this.timerText.setText(`Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
    }

    onTileClick(pointer, gameObject) {
        if (this.isComplete) return;

        const tileIndex = gameObject.getData('index');

        if (this.canMoveTile(tileIndex)) {
            this.moveTile(tileIndex);
            this.moves++;
            this.movesText.setText(`Moves: ${this.moves}`);

            // Check if puzzle is complete
            if (this.checkWin()) {
                this.onPuzzleComplete();
            }
        }
    }

    canMoveTile(index) {
        if (index === undefined || index === null) return false;

        const row = Math.floor(index / this.gridSize);
        const col = index % this.gridSize;
        const emptyRow = Math.floor(this.emptyIndex / this.gridSize);
        const emptyCol = this.emptyIndex % this.gridSize;

        // Check if tile is adjacent to empty space
        return (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
            (Math.abs(col - emptyCol) === 1 && row === emptyRow);
    }

    moveTile(tileIndex) {
        // Swap tile with empty space
        const tile = this.tiles[tileIndex];
        const emptyTile = this.tiles[this.emptyIndex];

        if (!tile || !emptyTile) return;

        // Get positions
        const tileX = tile.x;
        const tileY = tile.y;
        const emptyX = emptyTile.x;
        const emptyY = emptyTile.y;

        // Animate tile movement
        this.tweens.add({
            targets: tile,
            x: emptyX,
            y: emptyY,
            duration: 200,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: emptyTile,
            x: tileX,
            y: tileY,
            duration: 200,
            ease: 'Power2'
        });

        // Update data
        tile.setData('index', this.emptyIndex);
        emptyTile.setData('index', tileIndex);

        // Swap in array
        this.tiles[tileIndex] = emptyTile;
        this.tiles[this.emptyIndex] = tile;
        this.emptyIndex = tileIndex;
    }

    shufflePuzzle() {
        if (this.tiles.length === 0) return;

        this.isComplete = false;
        this.moves = 0;
        // Add null check
        if (this.movesText) {
            console.log('Moves text exists:', this.movesText);
            this.movesText.setText('Moves: 0');
        }

        // this.movesText.setText('Moves: 0');
        this.startTime = Date.now();

        // Perform random valid moves to shuffle
        for (let i = 0; i < 1000; i++) {
            const validMoves = this.getValidMoves();
            if (validMoves.length === 0) break;

            const randomMove = Phaser.Utils.Array.GetRandom(validMoves);

            // Instantly move without animation
            const tile = this.tiles[randomMove];
            const emptyTile = this.tiles[this.emptyIndex];

            if (!tile || !emptyTile) continue;

            // Swap positions instantly
            const tempX = tile.x;
            const tempY = tile.y;
            tile.setPosition(emptyTile.x, emptyTile.y);
            emptyTile.setPosition(tempX, tempY);

            // Update data
            tile.setData('index', this.emptyIndex);
            emptyTile.setData('index', randomMove);

            // Swap in array
            this.tiles[randomMove] = emptyTile;
            this.tiles[this.emptyIndex] = tile;
            this.emptyIndex = randomMove;
        }
    }

    getValidMoves() {
        const moves = [];
        const row = Math.floor(this.emptyIndex / this.gridSize);
        const col = this.emptyIndex % this.gridSize;

        // Check all four directions
        if (row > 0) moves.push((row - 1) * this.gridSize + col); // Up
        if (row < this.gridSize - 1) moves.push((row + 1) * this.gridSize + col); // Down
        if (col > 0) moves.push(row * this.gridSize + (col - 1)); // Left
        if (col < this.gridSize - 1) moves.push(row * this.gridSize + (col + 1)); // Right

        return moves;
    }

    checkWin() {
        for (let i = 0; i < 15; i++) {
            const tile = this.tiles[i];
            if (!tile) return false;

            const expectedNumber = i + 1;
            if (tile.getData('number') !== expectedNumber) {
                return false;
            }
        }
        return true;
    }

    onPuzzleComplete() {
        this.isComplete = true;

        // Show completion message
        const completionBg = this.add.rectangle(400, 300, 500, 250, 0x000000, 0.9)
            .setStrokeStyle(3, 0x2ecc71);

        const completionText = this.add.text(400, 220, 'PUZZLE COMPLETE!', {
            fontSize: '32px',
            fill: '#2ecc71',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);

        const statsText = this.add.text(400, 280, `Moves: ${this.moves}\nTime: ${this.timerText.text.replace('Time: ', '')}`, {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);

        // Continue button
        const continueButton = this.add.text(400, 350, 'CONTINUE', {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            backgroundColor: '#27ae60',
            padding: { x: 25, y: 12 }
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                EventBus.emit('puzzle-completed', { moves: this.moves, time: this.timerText.text });
                this.scene.start('GameScene');
            })
            .on('pointerover', () => continueButton.setStyle({ backgroundColor: '#229954' }))
            .on('pointerout', () => continueButton.setStyle({ backgroundColor: '#27ae60' }));

        // Celebration effect
        this.createCelebrationEffect();
    }

    createCelebrationEffect() {
        // Create particle effects
        for (let i = 0; i < 30; i++) {
            const star = this.add.text(
                Phaser.Math.Between(100, 700),
                Phaser.Math.Between(100, 500),
                '★',
                { fontSize: `${Phaser.Math.Between(16, 28)}px`, fill: '#f1c40f' }
            );

            this.tweens.add({
                targets: star,
                alpha: 0,
                scale: { from: 0.5, to: 2 },
                rotation: Math.PI * 2,
                y: star.y - Phaser.Math.Between(50, 150),
                duration: Phaser.Math.Between(1500, 2500),
                ease: 'Power2',
                onComplete: () => star.destroy()
            });
        }
    }

    // Clean up textures when scene shuts down
    shutdown() {
        // Remove the textures to free memory
        if (this.puzzleTextureKey && this.textures.exists(this.puzzleTextureKey)) {
            this.textures.remove(this.puzzleTextureKey);
        }
        
        // Remove tile textures
        for (let i = 1; i <= 8; i++) {
            const tileKey = `${this.puzzleTextureKey}_tile_${i}`;
            if (this.textures.exists(tileKey)) {
                this.textures.remove(tileKey);
            }
        }
        
        super.shutdown();
    }
}