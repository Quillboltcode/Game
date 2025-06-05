// src/components/LandmarkInfoModal.jsx
import React from 'react';
import { Landmark } from 'lucide-react';

export const LandmarkInfoModal = ({ landmark, onClose }) => {
  if (!landmark) return null;

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 pointer-events-auto">
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xl text-red-800 font-bold">
              <Landmark className="h-6 w-6" />
              {landmark.name}
            </div>
            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm">
              {landmark.year}
            </span>
          </div>
          <p className="text-lg text-gray-600 mt-2">
            {landmark.description}
          </p>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Historical Significance</h3>
            <p className="text-gray-700 leading-relaxed">
              {landmark.history}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};