import { EventBus } from './EventBus';

export class DialogueSystem {
    constructor(scene) {
        this.scene = scene;
        this.dialogues = [];
        this.currentIndex = 0;
        this.dialogueContainer = null;
        this.textObject = null;
        this.continueBtn = null;
        this.backBtn = null;
        this.isActive = false;
        this.onComplete = null;
    }

    createDialogue(dialogues, onComplete = null) {
        this.dialogues = dialogues;
        this.currentIndex = 0;
        this.onComplete = onComplete;
        this.isActive = true;

        // Create dialogue container
        this.dialogueContainer = this.scene.add.container(400, 300);
        this.dialogueContainer.setDepth(1000);
        this.dialogueContainer.setScrollFactor(0);

        // Background panel
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.8);
        bg.fillRoundedRect(-300, -100, 600, 200, 15);
        bg.lineStyle(3, 0xffffff, 0.8);
        bg.strokeRoundedRect(-300, -100, 600, 200, 15);

        // Text
        this.textObject = this.scene.add.text(0, -50, '', {
            fontSize: '18px',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5);

        // Continue button
        this.continueBtn = this.scene.add.text(100, 50, 'Continue', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#27ae60',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => this.nextDialogue())
          .on('pointerover', () => this.continueBtn.setStyle({ backgroundColor: '#229954' }))
          .on('pointerout', () => this.continueBtn.setStyle({ backgroundColor: '#27ae60' }));

        // Back button
        this.backBtn = this.scene.add.text(-100, 50, 'Back', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#95a5a6',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => this.prevDialogue())
          .on('pointerover', () => this.backBtn.setStyle({ backgroundColor: '#7f8c8d' }))
          .on('pointerout', () => this.backBtn.setStyle({ backgroundColor: '#95a5a6' }));

        // Add all elements to container
        this.dialogueContainer.add([bg, this.textObject, this.continueBtn, this.backBtn]);

        // Show first dialogue
        this.updateDialogue();

        // Pause the scene
        this.scene.scene.pause();
        EventBus.emit('dialogue-started');
    }

    updateDialogue() {
        if (this.currentIndex >= 0 && this.currentIndex < this.dialogues.length) {
            const currentDialogue = this.dialogues[this.currentIndex];
            
            // Update text
            this.textObject.setText(currentDialogue.text);
            
            // Update button visibility and text
            this.backBtn.setVisible(this.currentIndex > 0);
            
            if (this.currentIndex === this.dialogues.length - 1) {
                // Last dialogue - show action button
                if (currentDialogue.action) {
                    this.continueBtn.setText(currentDialogue.action.text || 'Finish');
                } else {
                    this.continueBtn.setText('Finish');
                }
            } else {
                this.continueBtn.setText('Continue');
            }
        }
    }

    nextDialogue() {
        if (this.currentIndex < this.dialogues.length - 1) {
            this.currentIndex++;
            this.updateDialogue();
        } else {
            // End of dialogue
            this.endDialogue();
        }
    }

    prevDialogue() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateDialogue();
        }
    }

    endDialogue() {
        const lastDialogue = this.dialogues[this.dialogues.length - 1];
        
        // Execute action if present
        if (lastDialogue.action) {
            this.executeAction(lastDialogue.action);
        }
        
        // Clean up
        this.closeDialogue();
        
        // Call completion callback
        if (this.onComplete) {
            this.onComplete();
        }
    }

    executeAction(action) {
        switch (action.type) {
            case 'changeScene':
                console.log(`Changing to scene: ${action.scene}`);
                this.scene.scene.start(action.scene, action.data || {});
                break;
                
            case 'launchScene':
                console.log(`Launching scene: ${action.scene}`);
                this.scene.scene.launch(action.scene, action.data || {});
                break;
                
            case 'movePlayer':
                if (action.position && this.scene.player) {
                    this.scene.player.setPosition(action.position.x, action.position.y);
                }
                break;
                
            case 'custom':
                if (action.callback && typeof action.callback === 'function') {
                    action.callback(this.scene);
                }
                break;
                
            default:
                console.log('Unknown action type:', action.type);
        }
    }

    closeDialogue() {
        if (this.dialogueContainer) {
            this.dialogueContainer.destroy();
            this.dialogueContainer = null;
        }
        
        this.isActive = false;
        this.scene.scene.resume();
        EventBus.emit('dialogue-ended');
    }

    // Force close dialogue (for external use)
    forceClose() {
        this.closeDialogue();
    }
}
