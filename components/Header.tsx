
import React from 'react';

export const Header: React.FC = () => (
  <header className="text-center py-6 md:py-8">
    <h1 className="text-4xl md:text-5xl font-bold text-teal-300" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
      اردو ٹرانسکرائبر
    </h1>
    <p className="text-gray-400 mt-2 text-lg">
      Real-time Urdu Language Transcription
    </p>
  </header>
);
