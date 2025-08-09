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

        if (finalTranscript) {
          onCommand(finalTranscript);
          setTranscript('');
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}`,
          variant: "destructive"
        });
        setIsListening(false);
        onListeningChange(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        onListeningChange(false);
      };
    } else {
      toast({
        title: "Browser Not Supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome or Edge.",
        variant: "destructive"
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onCommand, onListeningChange, toast]);

  const toggleListening = async () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognitionRef.current.start();
        toast({
          title: "Voice Recognition Active",
          description: "Listening for your commands...",
        });
      } catch (error) {
        console.error('Microphone permission denied:', error);
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access to use voice commands.",
          variant: "destructive"
        });
      }
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
      {/* Voice Control Button */}
      <div className="flex justify-center">
        <Button
          onClick={toggleListening}
          variant={isListening ? "destructive" : "default"}
          size="lg"
          className={`
            w-16 h-16 rounded-full p-0
            ${isListening ? 'animate-pulse bg-destructive' : 'bg-primary hover:bg-primary/90'}
            transition-all duration-300
          `}
        >
          {isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <Card className="bg-card/50 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Detected Command:</p>
                <p className="text-foreground">{transcript}</p>
              </div>
              <Button
                onClick={sendTranscript}
                size="sm"
                variant="outline"
                className="shrink-0"
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
          {isListening ? (
            <span className="text-primary font-semibold">🎤 Listening...</span>
          ) : (
            "Click the microphone to start voice commands"
          )}
        </p>
      </div>
    </div>
  );
};

export default VoiceInterface;