import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface VoiceInterfaceProps {
  onCommand: (command: string) => void;
  onListeningChange: (listening: boolean) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onCommand, onListeningChange }) => {
  const [isListening, setIsListening] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setIsSupported(true);
      const SpeechRecognitionConstructor = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognitionConstructor();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setIsMonitoring(true);
        onListeningChange(true);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);

        if (finalTranscript && finalTranscript.trim().length > 0) {
          onCommand(finalTranscript);
          setTranscript('');
          
          // Restart listening after processing command
          setTimeout(() => {
            if (recognitionRef.current && isMonitoring) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.log('Recognition restart:', error);
              }
            }
          }, 1000);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Don't show error for common issues when auto-restarting
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
          toast({
            title: "Voice Recognition Error",
            description: `Error: ${event.error}`,
            variant: "destructive"
          });
        }
        
        setIsListening(false);
        
        // Auto-restart listening if monitoring is enabled
        if (isMonitoring && event.error !== 'not-allowed') {
          setTimeout(() => {
            if (recognitionRef.current && isMonitoring) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.log('Auto-restart failed:', error);
              }
            }
          }, 2000);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        
        // Auto-restart listening if monitoring is enabled
        if (isMonitoring) {
          setTimeout(() => {
            if (recognitionRef.current && isMonitoring) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.log('Auto-restart on end failed:', error);
              }
            }
          }, 500);
        } else {
          onListeningChange(false);
        }
      };

      // Start monitoring immediately
      startMonitoring();
    } else {
      toast({
        title: "Browser Not Supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome or Edge.",
        variant: "destructive"
      });
    }

    return () => {
      if (recognitionRef.current) {
        setIsMonitoring(false);
        recognitionRef.current.stop();
      }
    };
  }, [onCommand, onListeningChange, toast]);

  const startMonitoring = async () => {
    if (!recognitionRef.current) return;

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsMonitoring(true);
      recognitionRef.current.start();
      toast({
        title: "JARVIS Voice Monitoring Active",
        description: "Always listening for your commands...",
      });
    } catch (error) {
      console.error('Microphone permission denied:', error);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access for voice detection.",
        variant: "destructive"
      });
    }
  };

  const toggleMonitoring = async () => {
    if (!recognitionRef.current) return;

    if (isMonitoring) {
      setIsMonitoring(false);
      recognitionRef.current.stop();
      setIsListening(false);
      onListeningChange(false);
      toast({
        title: "Voice Monitoring Stopped",
        description: "Click to re-enable voice detection",
      });
    } else {
      await startMonitoring();
    }
  };

  const sendTranscript = () => {
    if (transcript.trim()) {
      onCommand(transcript.trim());
      setTranscript('');
    }
  };

  if (!isSupported) {
    return (
      <Card className="bg-card/50 border-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Voice recognition is not supported in this browser. 
            Please use Chrome or Edge for voice commands.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Voice Control Status */}
      <div className="flex justify-center">
        <div className="relative">
          <Button
            onClick={toggleMonitoring}
            variant={isMonitoring ? "default" : "outline"}
            size="lg"
            className={`
              w-20 h-20 rounded-full p-0 transition-all duration-300
              ${isMonitoring 
                ? 'bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30' 
                : 'border-primary/50 hover:border-primary'
              }
              ${isListening ? 'animate-pulse-glow scale-110' : ''}
            `}
          >
            <div className="relative">
              <Mic className={`w-8 h-8 ${isMonitoring ? 'text-primary-foreground' : 'text-primary'}`} />
              {isListening && (
                <div className="absolute -inset-2 rounded-full border-2 border-primary animate-ping" />
              )}
            </div>
          </Button>
          
          {/* Status Indicator */}
          <div className={`
            absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center
            ${isMonitoring 
              ? (isListening ? 'bg-green-400 animate-pulse' : 'bg-blue-400') 
              : 'bg-gray-400'
            }
          `}>
            <div className={`w-2 h-2 rounded-full bg-white ${isListening ? 'animate-ping' : ''}`} />
          </div>
        </div>
      </div>

      {/* Voice Activity Visualization */}
      {isMonitoring && (
        <div className="flex justify-center">
          <div className="flex items-center gap-1 p-3 rounded-full bg-primary/10 border border-primary/20">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-4 bg-primary rounded-full transition-all duration-200 ${
                  isListening ? 'animate-bounce' : 'opacity-50'
                }`}
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  height: isListening ? `${12 + Math.random() * 16}px` : '4px'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <Card className="bg-card/50 border-primary/20 animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Detected Command:</p>
                <p className="text-foreground font-medium">{transcript}</p>
              </div>
              <Button
                onClick={sendTranscript}
                size="sm"
                variant="outline"
                className="shrink-0 hover:scale-105 transition-transform"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {!isMonitoring ? (
            <span>Click to enable voice detection</span>
          ) : isListening ? (
            <span className="text-primary font-semibold flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Listening for commands...
            </span>
          ) : (
            <span className="text-blue-400 font-medium flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
              Monitoring for voice activity
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default VoiceInterface;