import React, { useState, useEffect } from 'react';
import Map from '@/components/Map';
import TokenInput from '@/components/TokenInput';


const Index = () => {
  const [mapboxToken, setMapboxToken] = useState<string>('');

  useEffect(() => {
    // Check for saved token in localStorage
    const savedToken = localStorage.getItem('mapbox-token');
    if (savedToken) {
      setMapboxToken(savedToken);
    }
  }, []);

  const handleTokenSubmit = (token: string) => {
    setMapboxToken(token);
  };

  if (!mapboxToken) {
    return <TokenInput onTokenSubmit={handleTokenSubmit} />;
  }

  return (
    <div className="h-screen">
      <Map mapboxToken={mapboxToken} />
    </div>
  );
};

export default Index;
