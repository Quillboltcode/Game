// src/PhaserHanoiGame.jsx
import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';g
import { GameScene } from '../phaser/GameScene.js'; // Adjust path
import { StartScreen } from './StartScreen.jsx'; // Adjust path
import { LandmarkInfoModal } from './LandmarkInfoModal'; // Adjust path
// Note: We don't need to import 'Landmark' from lucide-react here anymore if not used directly.
// It's now used within StartScreen and LandmarkInfoModal.

export const PhaserHanoiGame = () => {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null);
  const [currentLandmark, setCurrentLandmark] = useState(null); // Renamed for clarity
  const [showInfo, setShowInfo] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (gameStarted && gameRef.current && !phaserGameRef.current) {
      const config = {
        type: Phaser.AUTO,
        width: 800, // Or window.innerWidth for full screen
        height: 600, // Or window.innerHeight
        parent: gameRef.current,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 800, x: 0 }, // Adjusted gravity, was a bit high
            debug: false
          }
        },
        scene: GameScene, // Use the imported GameScene class
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      phaserGameRef.current = new Phaser.Game(config);

      const sceneInstance = phaserGameRef.current.scene.getScene('GameScene');
      if (sceneInstance) {
        sceneInstance.setLandmarkCallback((landmarkData) => {
          setCurrentLandmark(landmarkData);
          setShowInfo(true);
        });
      }
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