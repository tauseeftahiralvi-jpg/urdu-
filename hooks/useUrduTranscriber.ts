import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, encode } from '../utils/audio';

const SYSTEM_INSTRUCTION = `You are a specialized AI transcriber with one single function: to transcribe spoken Urdu into the written Urdu script (Nastaliq). You must be extremely precise.
- **ONLY output text in the Urdu script.** For example, the sentence "My name is Ahmed" should be transcribed as "میرا نام احمد ہے".
- **NEVER use the Devanagari script.** If you hear Hindi, or any language that is not Urdu, you MUST output the specific text: '[Non-Urdu language detected]'.
- Your entire output must be in the correct Urdu writing system. Do not translate. Do not explain. Just transcribe spoken Urdu into written Urdu.`;

export const useUrduTranscriber = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('checking');

  const sessionRef = useRef<LiveSession | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!navigator.permissions) {
        console.warn("Permissions API not supported, proceeding with direct prompt.");
        setPermissionStatus('prompt');
        return;
      }
      try {
        const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setPermissionStatus(status.state);
        status.onchange = () => {
          setPermissionStatus(status.state);
        };
      } catch (e) {
        console.error("Could not query microphone permissions:", e);
        setPermissionStatus('prompt');
      }
    };
    checkPermissions();
  }, []);

  const stopListening = useCallback(async () => {
    if (!isListening) return;

    console.log('Stopping transcription...');
    setIsListening(false);
    
    if (sessionRef.current) {
      try {
        await sessionRef.current.close();
      } catch (e) {
        console.error("Error closing session:", e);
      }
      sessionRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        await audioContextRef.current.close();
      } catch(e) {
        console.error("Error closing audio context:", e);
      }
      audioContextRef.current = null;
    }
  }, [isListening]);

  const startListening = useCallback(async () => {
    if (isListening) return;
    
    if (permissionStatus === 'denied') {
      setError('Microphone access is blocked. Please enable it in your browser settings for this site and try again.');
      return;
    }

    console.log('Starting transcription...');
    setTranscription('');
    setError(null);
    setIsListening(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      if (permissionStatus !== 'granted') {
          setPermissionStatus('granted');
      }

      const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = context;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => console.log('Session opened.'),
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscription(prev => `${prev}${text}`);
            }
            if (message.serverContent?.turnComplete) {
                setTranscription(prev => `${prev}\n`);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setError('An error occurred with the transcription service.');
            stopListening();
          },
          onclose: (e: CloseEvent) => {
            console.log('Session closed.');
            if (isListening) {
              stopListening();
            }
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      sessionRef.current = await sessionPromise;

      const source = context.createMediaStreamSource(stream);
      const scriptProcessor = context.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        const pcmBlob = createBlob(inputData);
        sessionPromise.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      };
      
      source.connect(scriptProcessor);
      scriptProcessor.connect(context.destination);

    } catch (err: any) {
      console.error('Failed to start listening:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please allow access and try again.');
        setPermissionStatus('denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      }
      else {
        setError('Could not access microphone. Please check permissions and hardware.');
      }
      setIsListening(false);
    }
  }, [isListening, stopListening, permissionStatus]);

  useEffect(() => {
    return () => {
      stopListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isListening, transcription, error, startListening, stopListening };
};