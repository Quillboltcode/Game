// src/components/StartScreen.jsx
import React from 'react';
import { Landmark } from 'lucide-react';

export const StartScreen = ({ onStartGame }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-green-200 flex items-center justify-center">
      <div className="w-96 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
        <div className="text-center p-6 border-b">
          <div className="flex items-center justify-center gap-2 text-2xl text-red-800 font-bold mb-2">
            <Landmark className="h-8 w-8" />
            Discover Hanoi
          </div>
          <p className="text-lg text-gray-600">
            A journey through Vietnam's historic capital
          </p>
        </div>
        <div className="text-center space-y-4 p-6">
          <p className="text-gray-700">
            Explore famous landmarks and learn about their rich history as you travel through ancient Hanoi.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Controls:</strong></p>
            <p>← → or A/D: Move</p>
            <p>↑ or W or Space: Jump</p>
            <p>Space near landmarks: Learn more</p>
          </div>
          <button
            onClick={onStartGame}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Begin Journey
          </button>
        </div>
      </div>
    </div>
  );
};