
import React from 'react';
import { MicrophoneIcon, StopIcon } from './Icons';

interface ControlsProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ isListening, onStart, onStop }) => {
  const ButtonIcon = isListening ? StopIcon : MicrophoneIcon;
  const buttonAction = isListening ? onStop : onStart;
  const buttonLabel = isListening ? 'Stop Listening' : 'Start Listening';
  const buttonClass = isListening
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-teal-500 hover:bg-teal-600';

  return (
    <div className="flex justify-center items-center">
      <button
        onClick={buttonAction}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
          isListening ? 'focus:ring-red-400' : 'focus:ring-teal-300'
        } ${buttonClass}`}
        aria-label={buttonLabel}
      >
        <ButtonIcon className="w-9 h-9 text-white" />
      </button>
    </div>
  );
};
