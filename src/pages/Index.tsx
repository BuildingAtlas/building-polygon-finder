import React, { useState, useEffect } from 'react';
import Map from '@/components/Map';
import TokenInput from '@/components/TokenInput';
import BuildingFiltersPanel from '@/components/BuildingFiltersPanel';

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
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0 max-h-[60vh] overflow-y-auto">
        <BuildingFiltersPanel />
      </div>
      <div className="flex-1 min-h-0">
        <Map mapboxToken={mapboxToken} />
      </div>
    </div>
  );
};

export default Index;
