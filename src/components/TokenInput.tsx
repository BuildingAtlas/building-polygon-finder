import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Key, ExternalLink } from 'lucide-react';

interface TokenInputProps {
  onTokenSubmit: (token: string) => void;
}

const TokenInput: React.FC<TokenInputProps> = ({ onTokenSubmit }) => {
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      localStorage.setItem('google-maps-api-key', token.trim());
      onTokenSubmit(token.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Building Polygon Tool</h1>
          <p className="text-muted-foreground">
            Enter your Google Maps API key to get started with mapping and polygon drawing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-medium mb-2">
              Google Maps API Key
            </label>
            <Input
              id="token"
              type="text"
              placeholder="AIzaSyBdVl-cTICSwYKpe0bfcBPAE..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={!token.trim()}>
            Start Mapping
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Need a Google Maps API key?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Get your free API key from Google Cloud Console to enable the mapping functionality.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Get Google Maps API Key
          </Button>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>Your API key is stored locally in your browser and never shared.</p>
        </div>
      </Card>
    </div>
  );
};

export default TokenInput;