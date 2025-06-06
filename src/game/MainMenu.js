import { EventBus } from './EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.add.image(512, 384, 'background_menu').setScale(0.8, 0.8).setDepth(0);

        this.logo = this.add.image(512, 300, 'logo').setScale(0.8, 0.8).setDepth(100);

        const playButton_menu = this.add.image(300, 420, 'playButton_menu').setScale(0.35,0.35).setInteractive();
        playButton_menu.on('pointerdown', () => {
            console.log('Play clicked!');
            this.changeScene();
        });


        // Add "Settings" button
        const settingsButton = this.add.image(300, 500, 'settingsButton').setScale(0.87,0.87).setInteractive();
        settingsButton.on('pointerdown', () => {
        console.log('Settings clicked!');
        // Navigate to settings scene if you have one
        // this.scene.start('SettingsScene');
        });
        
        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('WorldMapScene');
        // this.scene.start('SlidingPuzzleScene');
        EventBus.emit('change-scene', 'WorldMapScene');
    }

    moveLogo (reactCallback)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPlaying())
            {
                this.logoTween.pause();
            }
            else
            {
                this.logoTween.play();
            }
        }
        else
        {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (reactCallback)
                    {
                        reactCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y)
                        });
                    }
                }
            });
        }
    }
}