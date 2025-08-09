import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { geminiService } from '@/services/geminiService';
import ElevenLabsSetup from '@/components/ElevenLabsSetup';
import VoiceResponse from '@/components/VoiceResponse';

interface Message {
  id: string;
  type: 'user' | 'jarvis';
  content: string;
  timestamp: Date;
  shouldSpeak?: boolean;
}

interface JarvisChatProps {
  onProcessingChange: (processing: boolean) => void;
  newCommand?: string;
}

const JarvisChat: React.FC<JarvisChatProps> = ({ onProcessingChange, newCommand }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'jarvis',
      content: 'Hello! I am JARVIS, your AI assistant powered by Gemini AI. How can I help you today?',
      timestamp: new Date(),
      shouldSpeak: true
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState<string | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [currentSpeakingMessage, setCurrentSpeakingMessage] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    onProcessingChange(isProcessing);
  }, [isProcessing, onProcessingChange]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle new voice commands
  useEffect(() => {
    if (newCommand && newCommand.trim()) {
      processCommand(newCommand.trim());
    }
  }, [newCommand]);

  const processCommand = async (command: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: command,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Use Gemini AI for intelligent responses
      const aiResponse = await geminiService.generateJarvisResponse(command);
      
      const jarvisMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'jarvis',
        content: aiResponse,
        timestamp: new Date(),
        shouldSpeak: true
      };

      setMessages(prev => [...prev, jarvisMessage]);
      
      // Trigger voice response
      if (isVoiceEnabled) {
        setCurrentSpeakingMessage(aiResponse);
      }

      toast({
        title: "JARVIS",
        description: "Response generated using Gemini AI",
      });

    } catch (error) {
      console.error('Error processing command:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'jarvis',
        content: "I apologize, but I'm experiencing some technical difficulties. Please try again.",
        timestamp: new Date(),
        shouldSpeak: true
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to process command. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = () => {
    if (input.trim() && !isProcessing) {
      processCommand(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Voice Response Component */}
      <VoiceResponse 
        text={currentSpeakingMessage}
        apiKey={elevenLabsApiKey}
        isEnabled={isVoiceEnabled}
      />
      
      {/* ElevenLabs Setup */}
      <ElevenLabsSetup onApiKeySet={setElevenLabsApiKey} />
      
      <Card className="flex-1 bg-card/50 border-primary/20 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-primary flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              JARVIS Command Interface
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isVoiceEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.type === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${message.type === 'user' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-primary text-primary-foreground'
                  }
                `}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div className={`
                  max-w-[80%] rounded-lg p-3
                  ${message.type === 'user'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-primary/10 text-foreground border border-primary/20'
                  }
                `}>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-primary/10 text-foreground border border-primary/20 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-sm">Processing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your command or use voice..."
              disabled={isProcessing}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JarvisChat;