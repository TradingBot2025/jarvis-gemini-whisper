import React, { useState } from 'react';
import JarvisCore from '@/components/JarvisCore';
import VoiceInterface from '@/components/VoiceInterface';
import JarvisChat from '@/components/JarvisChat';
import { useVoiceCommand } from '@/hooks/useVoiceCommand';

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCommand, setCurrentCommand] = useState<string>('');
  const { processVoiceCommand } = useVoiceCommand();

  const handleVoiceCommand = async (command: string) => {
    const result = await processVoiceCommand(command);
    if (!result.handledBySystem) {
      setCurrentCommand(command);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-jarvis-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,191,255,0.1),transparent_50%)]" />
      
      <div className="relative z-10 container mx-auto px-4 py-8 h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
          {/* Left Panel - Voice Interface */}
          <div className="lg:col-span-1 space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-primary mb-2">JARVIS</h1>
              <p className="text-sm text-muted-foreground">
                Just A Rather Very Intelligent System
              </p>
            </div>
            
            <VoiceInterface
              onCommand={handleVoiceCommand}
              onListeningChange={setIsListening}
            />
            
            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p>💡 JARVIS voice assistant with AI</p>
              <p>🎤 Use voice commands or type messages</p>
              {typeof window !== 'undefined' && window.electronAPI ? (
                <>
                  <p className="text-primary font-medium">⚡ PC control active — open apps, search, minimize</p>
                  <p className="text-muted-foreground">Try: &quot;open calculator&quot;, &quot;search weather&quot;, &quot;minimize&quot;</p>
                </>
              ) : (
                <p>⚡ Run <code className="bg-muted px-1 rounded">npm run electron:dev</code> for PC control</p>
              )}
            </div>
          </div>

          {/* Center Panel - JARVIS Core */}
          <div className="lg:col-span-1 flex items-center justify-center">
            <div className="text-center space-y-8">
              <JarvisCore 
                isListening={isListening} 
                isProcessing={isProcessing} 
              />
              
              <div className="space-y-2">
                <div className={`text-lg font-semibold transition-colors duration-300 ${
                  isListening ? 'text-primary' : 
                  isProcessing ? 'text-accent' : 'text-muted-foreground'
                }`}>
                  {isListening ? 'Listening...' : 
                   isProcessing ? 'Processing...' : 'Standby'}
                </div>
                
                <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                  <span className={`transition-colors ${isListening ? 'text-primary' : ''}`}>
                    🎤 Voice
                  </span>
                  <span className={`transition-colors ${isProcessing ? 'text-accent' : ''}`}>
                    🧠 AI
                  </span>
                  <span className="text-muted-foreground">
                    💻 System
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="lg:col-span-1 h-full">
            <JarvisChat 
              onProcessingChange={setIsProcessing} 
              newCommand={currentCommand}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
