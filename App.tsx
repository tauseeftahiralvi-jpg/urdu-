
import React from 'react';
import { useUrduTranscriber } from './hooks/useUrduTranscriber';
import { Header } from './components/Header';
import { TranscriptionDisplay } from './components/TranscriptionDisplay';
import { Controls } from './components/Controls';
import { StatusIndicator } from './components/StatusIndicator';

const App: React.FC = () => {
  const {
    isListening,
    transcription,
    error,
    startListening,
    stopListening,
  } = useUrduTranscriber();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 selection:bg-teal-400 selection:text-gray-900">
      <div className="w-full max-w-4xl h-full flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col bg-gray-800/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm border border-gray-700/50">
          <TranscriptionDisplay transcription={transcription} />
          <div className="p-4 border-t border-gray-700/50">
            <StatusIndicator isListening={isListening} error={error} />
          </div>
        </main>
        <footer className="py-6">
          <Controls
            isListening={isListening}
            onStart={startListening}
            onStop={stopListening}
          />
        </footer>
      </div>
    </div>
  );
};

export default App;
