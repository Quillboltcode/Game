// src/PhaserHanoiGame.jsx
import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GameScene } from '../phaser/GameScene.js'; // Adjust path
import { StartScreen } from './StartScreen.jsx'; // Adjust path
import { LandmarkInfoModal } from './LandmarkInfoModal'; // Adjust path

export const PhaserHanoiGame = () => {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null);
  const [currentLandmark, setCurrentLandmark] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (gameStarted && gameRef.current && !phaserGameRef.current) {
      // 1. Create the scene instance
      // The key 'GameScene' is typically defined in your GameScene's constructor: super({ key: 'GameScene' });
      const gameSceneInstance = new GameScene();

      // 2. Set the callback on the instance BEFORE creating the game
      // This callback has access to setCurrentLandmark and setShowInfo due to closure
      gameSceneInstance.setLandmarkCallback((landmarkData) => {
        // console.log('React: Landmark interaction triggered for:', landmarkData.name);
        setCurrentLandmark(landmarkData);
        setShowInfo(true);
      });

      // 3. Create game config, using the scene instance
      const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: gameRef.current,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 800, x: 0 }, // Kept your original gravity, adjust if needed
            debug: false
          }
        },
        scene: gameSceneInstance, // Pass the pre-configured instance
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      // 4. Create the game
      phaserGameRef.current = new Phaser.Game(config);

      // 5. The previous method of getting the scene post-creation to set the callback is no longer needed:
      // const sceneInstance = phaserGameRef.current.scene.getScene('GameScene');
      // if (sceneInstance) { /* ... */ }
    }

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [gameStarted]); // Only re-run if gameStarted changes

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleCloseModal = () => {
    setShowInfo(false);
    // Optionally, re-focus the game canvas if needed
    // gameRef.current?.querySelector('canvas')?.focus();
  };

  if (!gameStarted) {
    return <StartScreen onStartGame={handleStartGame} />;
  }

  return (
    <div className="relative w-full h-screen bg-black">
      <div ref={gameRef} className="w-full h-full" />
      {showInfo && <LandmarkInfoModal landmark={currentLandmark} onClose={handleCloseModal} />}
    </div>
  );
};