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
    <div className="h-full flex flex-col gap-4 max-h-screen overflow-hidden">
      {/* Voice Response Component */}
      <VoiceResponse 
        text={currentSpeakingMessage}
        apiKey={elevenLabsApiKey}
        isEnabled={isVoiceEnabled}
      />
      
      {/* ElevenLabs Setup */}
      <ElevenLabsSetup onApiKeySet={setElevenLabsApiKey} />
      
      <Card className="flex-1 bg-card/50 backdrop-blur-sm border-primary/30 flex flex-col shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-3 border-b border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardTitle className="text-primary flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="w-6 h-6 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
              </div>
              <span className="text-lg font-bold tracking-wide">JARVIS Command Interface</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200 hover:scale-105"
            >
              {isVoiceEnabled ? (
                <Volume2 className="w-5 h-5 text-green-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-red-400" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 animate-fade-in ${
                    message.type === 'user' ? 'flex-row-reverse' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110
                    ${message.type === 'user' 
                      ? 'bg-gradient-to-br from-accent to-accent/80 text-accent-foreground ring-2 ring-accent/20' 
                      : 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-2 ring-primary/20 animate-pulse-glow'
                    }
                  `}>
                    {message.type === 'user' ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>
                  <div className={`
                    max-w-[75%] rounded-xl p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
                    ${message.type === 'user'
                      ? 'bg-gradient-to-br from-accent/90 to-accent text-accent-foreground border border-accent/30'
                      : 'bg-gradient-to-br from-primary/10 to-primary/5 text-foreground border border-primary/30 backdrop-blur-sm'
                    }
                  `}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-70 mt-2 flex items-center gap-1">
                      <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex items-start gap-3 animate-fade-in">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center shadow-lg ring-2 ring-primary/20 animate-pulse-glow">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 text-foreground border border-primary/30 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <span className="text-sm font-medium">Processing neural networks...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-primary/20 bg-gradient-to-r from-background/50 to-background/80 backdrop-blur-sm">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your command or use voice..."
                  disabled={isProcessing}
                  className="pr-12 bg-background/50 border-primary/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:border-primary/40"
                />
                {input && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  </div>
                )}
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                size="sm"
                className="px-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Status Bar */}
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
                <span>{isProcessing ? 'AI Processing...' : 'Ready for commands'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Neural Network: Online</span>
                <div className="w-1 h-1 bg-green-400 rounded-full animate-ping" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JarvisChat;