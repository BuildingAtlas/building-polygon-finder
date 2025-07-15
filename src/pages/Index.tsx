import React, { useState, useEffect } from 'react';
import Map from '@/components/Map';
import TokenInput from '@/components/TokenInput';

const Index = () => {
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    // Check for saved API key in localStorage
    const savedKey = localStorage.getItem('google-maps-api-key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleTokenSubmit = (token: string) => {
    setApiKey(token);
  };

  if (!apiKey) {
    return <TokenInput onTokenSubmit={handleTokenSubmit} />;
  }

  return <Map mapboxToken={apiKey} />;
};

export default Index;
