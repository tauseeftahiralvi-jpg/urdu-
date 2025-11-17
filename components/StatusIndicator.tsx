
import React from 'react';
import { MicrophoneIcon, AlertTriangleIcon } from './Icons';

interface StatusIndicatorProps {
  isListening: boolean;
  error: string | null;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isListening, error }) => {
  if (error) {
    return (
      <div className="flex items-center justify-center text-red-400 text-center px-2">
        <AlertTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
        <span className="font-medium">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center text-gray-400">
      {isListening ? (
        <>
          <MicrophoneIcon className="w-5 h-5 mr-2 text-teal-400 animate-pulse" />
          <span className="font-medium text-teal-400">Listening...</span>
        </>
      ) : (
        <span className="font-medium">Not Listening</span>
      )}
    </div>
  );
};
