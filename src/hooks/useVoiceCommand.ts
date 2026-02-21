import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { trySystemCommand } from '@/services/systemCommands';

export const useVoiceCommand = () => {
  const { toast } = useToast();

  const processVoiceCommand = useCallback(async (command: string): Promise<{ handledBySystem: boolean }> => {
    const lowerCommand = command.toLowerCase().trim();

    // Try system control first (when running in Electron on local PC)
    const systemResult = await trySystemCommand(command);
    if (systemResult.handled) {
      toast({
        title: "JARVIS",
        description: systemResult.message,
      });
      return { handledBySystem: true };
    }
    
    // Basic command processing
    if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
      toast({
        title: "JARVIS",
        description: "Hello! How can I assist you today?",
      });
      return { handledBySystem: false };
    }
    
    if (lowerCommand.includes('time')) {
      const currentTime = new Date().toLocaleTimeString();
      toast({
        title: "Current Time",
        description: currentTime,
      });
      return { handledBySystem: false };
    }
    
    if (lowerCommand.includes('weather')) {
      toast({
        title: "Weather Information",
        description: "Weather feature would be implemented with external API integration.",
      });
      return { handledBySystem: false };
    }
    
    if ((lowerCommand.includes('open') || lowerCommand.includes('launch')) && !(typeof window !== 'undefined' && window.electronAPI)) {
      const app = lowerCommand.replace(/open|launch/g, '').trim();
      toast({
        title: "Application Launch",
        description: `Run as desktop app (Electron) to open apps. Would launch: ${app || 'application'}`,
      });
      return { handledBySystem: false };
    }
    
    if (lowerCommand.includes('search') && !(typeof window !== 'undefined' && window.electronAPI)) {
      const query = lowerCommand.replace(/search|for/g, '').trim();
      toast({
        title: "Search",
        description: `Run as desktop app to search. Would search: ${query || 'web'}`,
      });
      return { handledBySystem: false };
    }
    
    // Default
    toast({
      title: "Command Received",
      description: "Processing your request with AI assistance.",
    });
    return { handledBySystem: false };
  }, [toast]);

  return { processVoiceCommand };
};