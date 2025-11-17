
import React, { useRef, useEffect } from 'react';

interface TranscriptionDisplayProps {
  transcription: string;
}

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ transcription }) => {
  const endOfTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfTextRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcription]);
  
  return (
    <div className="flex-grow p-6 overflow-y-auto text-right">
      <p 
        className="whitespace-pre-wrap text-2xl md:text-3xl leading-relaxed text-gray-200"
        style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
        dir="rtl"
      >
        {transcription || <span className="text-gray-500">Press start and begin speaking Urdu...</span>}
      </p>
      <div ref={endOfTextRef} />
    </div>
  );
};
