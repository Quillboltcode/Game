import { EventBus } from './EventBus';
import { Scene } from 'phaser';
import { landmarks } from '../data/landmark'; // Import landmarks data

export class Preload extends Scene
{
    constructor ()
    {
        super('Preload');
    }

    preload ()
    {
        // Create loading UI
        this.createLoadingUI();

        // Load game assets
        this.loadGameAssets();

        // Load landmark assets
        this.loadLandmarkAssets();

        // Handle loading completion
        this.handleLoadingComplete();
    }

    createLoadingUI() {
        // Loading bar background
        const loadingBarBg = this.add.rectangle(512, 384, 400, 20, 0x333333);
        loadingBarBg.setStrokeStyle(2, 0xffffff);
        
        // Loading bar fill
        this.loadingBar = this.add.rectangle(312, 384, 0, 16, 0x00ff00).setOrigin(0, 0.5);
        
        // Loading text
        this.loadingText = this.add.text(512, 350, 'Loading Game Assets...', {
            fontFamily: 'Arial Black', 
            fontSize: 24, 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 4
        }).setOrigin(0.5);

        // Percentage text
        this.percentText = this.add.text(512, 420, '0%', {
            fontFamily: 'Arial', 
            fontSize: 18, 
            color: '#ffffff'
        }).setOrigin(0.5);

        // Asset loading status
        this.statusText = this.add.text(512, 450, '', {
            fontFamily: 'Arial', 
            fontSize: 14, 
            color: '#cccccc'
        }).setOrigin(0.5);

        // Update loading bar as files load
        this.load.on('progress', (progress) => {
            this.loadingBar.width = 400 * progress;
            this.percentText.setText(Math.round(progress * 100) + '%');
        });

        // Show current file being loaded
        this.load.on('fileprogress', (file) => {
            this.statusText.setText(`Loading: ${file.key}`);
        });
    }

    loadGameAssets() {
        // Player assets
        this.load.image('player', 'assets/player/char-ani/6.png');
        // this.load.image('player_idle', 'assets/char-ani/6.png');
        this.load.image('player_run', 'assets/player/char-ani/10.png');
        // Audio assets
        this.load.audio('backgroundMusic', 'assets/music.mp3');
        
        // Parallax background layers
        this.load.image('sky_bg', './assets/layer/sky.jpg');
        this.load.image('mountains_bg', 'assets/layer/mount.png');
        this.load.image('trees_fg', 'assets/tree.png');

        // Menu assets (if not already loaded)
        // Load any assets you need for the main menu
        this.load.image('background_menu', './assets/bgall.png');
        this.load.image('playButton_menu', './assets/play.png');
        this.load.image('settingsButton', './assets/setbtn2.png');
        this.load.image('logo', './assets/logo.png');
        

    }   

    loadLandmarkAssets() {
        // Load landmark sprites
        landmarks.forEach(landmark => {
            if (landmark.sprite) {
                console.log(`Loading landmark sprite: ${landmark.sprite}`);
                this.load.image(landmark.id, `assets/${landmark.sprite}`);
            }
        });
    }

    handleLoadingComplete() {
        this.load.on('complete', () => {
            this.statusText.setText('Creating textures...');
            
            // Create procedural textures after loading is complete
            this.createProceduralTextures();
            
            // Emit loading complete event
            EventBus.emit('preload-complete', {
                landmarksCount: landmarks.length,
                assetsLoaded: this.load.totalComplete
            });

            // Transition to MainMenu after a brief delay
            this.time.delayedCall(500, () => {
                this.scene.start('MainMenu');
            });
        });
    }

    createProceduralTextures() {
        // Create ground texture
        if (!this.textures.exists('ground')) {
            this.add.graphics()
                .fillStyle(0x8FBC8F)
                .fillRect(0, 0, 32, 32)
                .generateTexture('ground', 32, 32);
        }

        // Create landmark textures for those without sprites
        landmarks.forEach(landmark => {
            if (!landmark.sprite && !this.textures.exists(landmark.id)) {
                console.log(`Creating landmark texture: ${landmark.id} with color ${landmark.color}`);
                this.add.graphics()
                    .fillStyle(landmark.color)
                    .fillRect(0, 0, landmark.width, landmark.height)
                    .generateTexture(landmark.id, landmark.width, landmark.height);
            }
        });
    }

    create ()
    {
        // Set background color
        this.cameras.main.setBackgroundColor('#1a1a2e');
        
        // Add game title
        this.add.text(512, 200, 'Adventure Game', {
            fontFamily: 'Arial Black', 
            fontSize: 48, 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Add subtitle
        this.add.text(512, 260, 'Explore Ancient Landmarks', {
            fontFamily: 'Arial', 
            fontSize: 20, 
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5);

        // Emit scene ready event
        EventBus.emit('current-scene-ready', this);
    }
}