import React,{ useEffect} from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { PhaserHanoiGame } from './components/PhaserHanoiGame'
import { Quiz } from './components/Quiz'
import { Home, Play, Info } from 'lucide-react'
// import { useRef } from 'react'
// import { GameScene } from './phaser/GameScene.js';
// import { PreloadScene } from './phaser/PreloadScene.js';
// import { WorldMapScene } from './phaser/WorldMapScene.js';
// import { HoanKiemLakeScene } from './phaser/LakeScence.js';
// import { TempleOfLiteratureScene } from './phaser/TempleOfLiteratureScene.js';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Welcome to Hanoi Explorer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Embark on an interactive journey through Vietnam's historic capital. 
            Discover ancient temples, legendary lakes, and architectural marvels.
          </p>
        </header>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Play className="h-8 w-8 text-red-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-800">Play Game</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Start your adventure through Hanoi's most famous landmarks. 
              Learn about their history while having fun!
            </p>
            <Link 
              to="/game" 
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Start Adventure
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Info className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-800">About</h2>
            </div>
            <p className="text-gray-600 mb-6">
              This educational game features 5 historic landmarks including the 
              Temple of Literature, Hoan Kiem Lake, and more.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Features:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Interactive 2D platformer gameplay</li>
                <li>Historical information about each landmark</li>
                <li>Beautiful graphics and smooth controls</li>
                <li>Educational content about Vietnamese culture</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Game Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <strong>Movement:</strong><br />
                ← → or A/D keys
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <strong>Jump:</strong><br />
                ↑ or W or Space
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <strong>Interact:</strong><br />
                Space near landmarks
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const App = () => {
  return (
    <Router>
      <div className="App">
        <nav className="bg-red-600 text-white p-4 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
              <Home className="h-6 w-6" />
              <span>Hanoi Explorer</span>
            </Link>
            <div className="space-x-4">
              <Link 
                to="/" 
                className="hover:text-red-200 transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/game" 
                className="hover:text-red-200 transition-colors"
              >
                Play Game
              </Link>

              <Link
              to="/quiz"
              className="hover:text-red-200 transition-colors"
              >
                Quiz
              </Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game" element={<PhaserHanoiGame />} />
          <Route path="/quiz" element={<Quiz />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  )
}


// const App = () => {
//     // Ref to hold the game container div
//     const gameContainerRef = useRef(null);
//     // Ref to hold the Phaser game instance
//     const phaserGameRef = useRef(null);

//     useEffect(() => {
//         // Only initialize Phaser if the container ref is available and game is not already created
//         if (gameContainerRef.current && !phaserGameRef.current) {
//             const config = {
//                 type: Phaser.AUTO,
//                 width: 800,
//                 height: 600,
//                 parent: gameContainerRef.current, // Use the ref for the parent
//                 scene: [
//                     PreloadScene,
//                     WorldMapScene,
//                     HoanKiemLakeScene,
//                     // TempleOfLiteratureScene,
//                     // LongBienBridgeScene,
//                     // OnePillarPagodaScene,
//                     // OldQuarterScene
//                 ],
//                 physics: {
//                     default: 'arcade',
//                     arcade: {
//                         gravity: { y: 0 },
//                         debug: false
//                     }
//                 },
//                 scale: {
//                     mode: Phaser.Scale.FIT, // This is key for scaling!
//                     autoCenter: Phaser.Scale.CENTER_BOTH, // This is key for centering!
//                     parent: gameContainerRef.current, // Ensure parent is correctly set for scaling
//                     width: 800, // Base game width
//                     height: 600 // Base game height
//                 },
//                 backgroundColor: '#2d2d2d'
//             };

//             phaserGameRef.current = new Phaser.Game(config);
//         }

//         // Cleanup function for when the component unmounts
//         return () => {
//             if (phaserGameRef.current) {
//                 phaserGameRef.current.destroy(true); // Destroy the Phaser game instance
//                 phaserGameRef.current = null;
//             }
//         };
//     }, []); // Empty dependency array ensures this runs once on mount and once on unmount

//     return (
//         <div className="bg-gray-900 text-white flex justify-center items-center min-h-screen overflow-hidden">
//             <div
//                 id="game-container"
//                 ref={gameContainerRef}
//                 className="w-full h-full flex justify-center items-center"
//                 style={{
//                     borderRadius: '1rem', // Rounded corners for the game canvas
//                     boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
//                 }}
//             ></div>
//         </div>
//     );
// };

export default App;

// export default App
