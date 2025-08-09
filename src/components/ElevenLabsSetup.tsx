import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Save } from 'lucide-react';

interface ElevenLabsSetupProps {
  onApiKeySet: (apiKey: string) => void;
}

const ElevenLabsSetup: React.FC<ElevenLabsSetupProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('elevenlabs_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      onApiKeySet(savedApiKey);
    } else {
      setIsExpanded(true);
    }
  }, [onApiKeySet]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('elevenlabs_api_key', apiKey.trim());
      onApiKeySet(apiKey.trim());
      setIsExpanded(false);
    }
  };

  if (!isExpanded && apiKey) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>🔊 Voice enabled</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
        >
          <Settings className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="bg-card/50 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Voice Setup (ElevenLabs)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Enter your ElevenLabs API key to enable voice responses
        </p>
        <div className="flex gap-2">
          <Input
            type="password"
            placeholder="Enter ElevenLabs API key..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="text-sm"
          />
          <Button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            size="sm"
          >
            <Save className="w-3 h-3" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Get your API key from <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-primary underline">ElevenLabs</a>
        </p>
      </CardContent>
    </Card>
  );
};

export default ElevenLabsSetup;