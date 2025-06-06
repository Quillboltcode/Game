// game/main.js
import Phaser from 'phaser';
import { Preload } from './Preload.js';
import { WorldMapScene } from './WorldMapScene.js';
import { HoanKiemLakeScene } from './HoanKiemLakeScene.js';
import { GameScene } from './GameScene.js';
import { MainMenu } from './MainMenu.js';
import { SlidingPuzzle } from './SlidingPuzzle.js';
// import { ParallaxScene } from './ParallaxScene.js'; // Import the ParallaxTileSpriteScene
// The main function that creates and returns the Phaser game instance
export default function StartGame(parent) {
    const config = {
        type: Phaser.AUTO,
        width: 1024,
        height: 600,
        parent: parent, // The DOM element where the game canvas will be attached
        
        scene: [
            Preload,
            WorldMapScene,  // Use the class directly - no more inline wrapper!
            HoanKiemLakeScene,
            GameScene,
            MainMenu,
            SlidingPuzzle,
            // ParallaxScene // Add the ParallaxTileSpriteScene to the scene array
            // Add other scenes as needed
        ],
        
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0, x: 0 },
                debug: false
            }
        },
        
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: parent,
            width: 800,
            height: 600
        },
        
        backgroundColor: '#2d2d2d'
    };

    return new Phaser.Game(config);
}