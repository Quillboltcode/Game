// src/PhaserHanoiGame.jsx
import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import StartGame from '../game/main';
import { EventBus } from '../game/EventBus';
import { StartScreen } from './StartScreen.jsx';
import { LandmarkInfoModal } from './LandmarkInfoModal';

export const PhaserHanoiGame = () => {
    const game = useRef();
    const gameRef = useRef();
   
    // State for managing the landmark info modal
    const [currentLandmark, setCurrentLandmark] = useState(null);
    const [showInfo, setShowInfo] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [currentScene, setCurrentScene] = useState(null);
    const [gameStats, setGameStats] = useState({
        distance: 0,
        landmarksVisited: 0,
        totalLandmarks: 0
    });
    
    // Callback function to handle landmark interactions via EventBus
    const handleLandmarkInteraction = (landmarkData) => {
        console.log('Landmark interaction received:', landmarkData);
        setCurrentLandmark(landmarkData);
        setShowInfo(true);
        
        // Pause the game via EventBus
        EventBus.emit('pause-game');
    };
    
    // Callback for nearby landmark detection
    const handleLandmarkNearby = (landmarkData) => {
        console.log('Player near landmark:', landmarkData.name);
        // You could show a subtle UI indicator here
    };
    
    // Callback for when player leaves landmark area
    const handleLandmarkLeft = (landmarkData) => {
        console.log('Player left landmark:', landmarkData.name);
        // Hide any UI indicators
    };
    
    // Handle game stats updates
    const handleGameStatsUpdate = (stats) => {
        setGameStats(stats);
    };
    
    // Callback for closing the landmark info modal
    const handleCloseModal = () => {
        setShowInfo(false);
        setCurrentLandmark(null);
        
        // Resume the game via EventBus
        EventBus.emit('resume-game');
    };
    
    // Clear game progress from localStorage
    const clearGameProgress = () => {
        try {
            localStorage.removeItem('gameProgress');
            console.log('Game progress cleared from localStorage');
            EventBus.emit('game-progress-cleared');
        } catch (error) {
            console.error('Failed to clear game progress:', error);
        }
    };
    
    // Callback to start the game
    const handleStartGame = () => {
        // Clear any existing game progress when starting a new game
        clearGameProgress();
        
        setGameStarted(true);
        console.log('New game started - progress cleared');
    };
    
    // Handle music toggle (example of external control)
    const handleToggleMusic = () => {
        EventBus.emit('toggle-music');
    };
    
    // Handle player boost (example of game enhancement)
    const handlePlayerBoost = () => {
        EventBus.emit('player-boost', { speed: 2, duration: 5000 });
    };
    
    // Create the game inside a useLayoutEffect hook
    useLayoutEffect(() => {
        if (gameStarted && game.current === undefined) {
            game.current = StartGame("game-container");
           
            if (gameRef.current) {
                gameRef.current = { game: game.current, scene: null };
            }
        }
        
        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
            }
        }
    }, [gameStarted]);
    
    // Set up all EventBus listeners
    useEffect(() => {
        // Scene management events
        const handleSceneReady = (scene) => {
            console.log('Scene ready:', scene.scene.key);
            setCurrentScene(scene);
           
            if (gameRef.current) {
                gameRef.current.scene = scene;
            }
        };
        
        // Game events
        const handleGamePaused = () => {
            console.log('Game paused');
        };
        
        const handleGameResumed = () => {
            console.log('Game resumed');
        };
        
        const handleMusicStarted = () => {
            console.log('Background music started');
        };
        
        const handleMusicPaused = () => {
            console.log('Music paused');
        };
        
        const handleMusicResumed = () => {
            console.log('Music resumed');
        };
        
        const handlePlayerJumped = () => {
            console.log('Player jumped');
        };
        
        const handlePlayerBoostStarted = (boostData) => {
            console.log('Player boost started:', boostData);
        };
        
        const handlePlayerBoostEnded = () => {
            console.log('Player boost ended');
        };
        
        const handlePreloadComplete = (data) => {
            console.log('Preload complete:', data);
        };

        const handleEndGame = () => {
            // Go to quiz page
            console.log('Game ended, transitioning to quiz page');
            window.location.href = '/quiz';
        };
        
        // Register all event listeners
        EventBus.on('current-scene-ready', handleSceneReady);
        EventBus.on('landmark-interaction', handleLandmarkInteraction);
        EventBus.on('landmark-nearby', handleLandmarkNearby);
        EventBus.on('landmark-left', handleLandmarkLeft);
        EventBus.on('game-stats-update', handleGameStatsUpdate);
        EventBus.on('game-paused', handleGamePaused);
        EventBus.on('game-resumed', handleGameResumed);
        EventBus.on('music-started', handleMusicStarted);
        EventBus.on('music-paused', handleMusicPaused);
        EventBus.on('music-resumed', handleMusicResumed);
        EventBus.on('player-jumped', handlePlayerJumped);
        EventBus.on('player-boost-started', handlePlayerBoostStarted);
        EventBus.on('player-boost-ended', handlePlayerBoostEnded);
        EventBus.on('preload-complete', handlePreloadComplete);
        EventBus.on('game-scene-shutdown', handleEndGame);
        // Cleanup function to remove all listeners
        return () => {
            EventBus.off('current-scene-ready', handleSceneReady);
            EventBus.off('landmark-interaction', handleLandmarkInteraction);
            EventBus.off('landmark-nearby', handleLandmarkNearby);
            EventBus.off('landmark-left', handleLandmarkLeft);
            EventBus.off('game-stats-update', handleGameStatsUpdate);
            EventBus.off('game-paused', handleGamePaused);
            EventBus.off('game-resumed', handleGameResumed);
            EventBus.off('music-started', handleMusicStarted);
            EventBus.off('music-paused', handleMusicPaused);
            EventBus.off('music-resumed', handleMusicResumed);
            EventBus.off('player-jumped', handlePlayerJumped);
            EventBus.off('player-boost-started', handlePlayerBoostStarted);
            EventBus.off('player-boost-ended', handlePlayerBoostEnded);
            EventBus.off('preload-complete', handlePreloadComplete);
        }
    }, []);
    
    // Conditionally render the StartScreen or the Phaser game container
    if (!gameStarted) {
        return <StartScreen onStartGame={handleStartGame} />;
    }
    
    return (
        <div className="relative w-full h-screen bg-black flex flex-col justify-center items-center">
            {/* Game Stats UI */}
            <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-70 text-white p-3 rounded-lg">
                <div className="text-sm">
                    <div>Distance: {gameStats.distance}m</div>
                    <div>Landmarks: {gameStats.landmarksVisited}/{gameStats.totalLandmarks}</div>
                </div>
            </div>
            
            {/* Game Controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                    onClick={handleToggleMusic}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                    🎵 Music
                </button>
                <button
                    onClick={handlePlayerBoost}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                    ⚡ Boost
                </button>
            </div>
            
            {/* Game Container */}
            <div
                id="game-container"
                className="w-full h-full max-w-[800px] max-h-[600px] flex justify-center items-center"
                style={{
                    borderRadius: '1rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                }}
            ></div>
            
            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-70 text-white p-3 rounded-lg text-center">
                <div className="text-sm">
                    <div>Use ARROW KEYS or WASD to move • Double SPACE interact </div>
                    <div>Use S to save • P to Pause • SHIFT+ R to reset • use M to hide minimap</div>
                    <div></div>
                </div>
            </div>
            
            {/* Render the LandmarkInfoModal if showInfo state is true */}
            {showInfo && currentLandmark && (
                <LandmarkInfoModal 
                    landmark={currentLandmark} 
                    onClose={handleCloseModal} 
                />
            )}
        </div>
    );
};