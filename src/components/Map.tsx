import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { MapPin, Trash2, Copy, Search, ToggleLeft, ToggleRight, Globe, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface MapProps {
  mapboxToken: string; // We'll rename this to apiKey
}

interface Building {
  coordinates: number[][];
  properties: { [key: string]: any };
}

const Map: React.FC<MapProps> = ({ mapboxToken: apiKey }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const drawingManager = useRef<google.maps.drawing.DrawingManager | null>(null);
  const [coordinates, setCoordinates] = useState<Array<{ lat: number; lng: number }>>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingPolygons, setBuildingPolygons] = useState<google.maps.Polygon[]>([]);
  const [drawnPolygons, setDrawnPolygons] = useState<google.maps.Polygon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showRawCoords, setShowRawCoords] = useState(false);
  const [isSatelliteView, setIsSatelliteView] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['drawing', 'places'],
    });

    loader.load().then(() => {
      if (!mapContainer.current) return;

      // Initialize map
      map.current = new google.maps.Map(mapContainer.current, {
        center: { lat: 51.5074, lng: -0.1278 }, // London
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      // Initialize drawing manager
      drawingManager.current = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            google.maps.drawing.OverlayType.POLYGON,
            google.maps.drawing.OverlayType.RECTANGLE,
            google.maps.drawing.OverlayType.CIRCLE,
          ],
        },
        polygonOptions: {
          fillColor: '#3b82f6',
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: '#1d4ed8',
          clickable: true,
          editable: true,
        },
      });

      drawingManager.current.setMap(map.current);

      // Listen for drawn polygons
      google.maps.event.addListener(drawingManager.current, 'polygoncomplete', (polygon: google.maps.Polygon) => {
        setDrawnPolygons(prev => [...prev, polygon]);
        
        // Get coordinates
        const path = polygon.getPath();
        const coords: { lat: number; lng: number }[] = [];
        
        for (let i = 0; i < path.getLength(); i++) {
          const point = path.getAt(i);
          coords.push({ lat: point.lat(), lng: point.lng() });
        }
        
        setCoordinates(prev => [...prev, ...coords]);
        toast.success('Polygon drawn successfully!');
      });
    }).catch(error => {
      console.error('Error loading Google Maps:', error);
      toast.error('Failed to load Google Maps');
    });

    return () => {
      if (map.current) {
        // Clean up map
        map.current = null;
      }
    };
  }, [apiKey]);

  const searchLocation = async () => {
    if (!searchQuery.trim() || !map.current) return;
    
    setIsSearching(true);
    
    try {
      // Use Google Geocoding API
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ address: searchQuery }, async (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          
          // Center map on location
          map.current?.setCenter({ lat, lng });
          map.current?.setZoom(16);
          
          // Add marker
          new google.maps.Marker({
            position: { lat, lng },
            map: map.current,
            title: searchQuery,
          });
          
          // Fetch buildings from OS API
          await fetchNearbyBuildings(lat, lng);
          
          toast.success(`Found: ${results[0].formatted_address}`);
        } else {
          toast.error('Location not found');
        }
        setIsSearching(false);
      });
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
      setIsSearching(false);
    }
  };

  const fetchNearbyBuildings = async (lat: number, lng: number) => {
    try {
      // Use OS Features API for building data
      const radius = 200; // meters
      const bbox = calculateBoundingBox(lat, lng, radius);
      
      // Note: This would require an OS API key. For now, using OpenStreetMap as fallback
      const overpassQuery = `
        [out:json][timeout:25];
        (
          way["building"](around:${radius},${lat},${lng});
          relation["building"](around:${radius},${lat},${lng});
        );
        out geom;
      `;
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
      });
      
      if (!response.ok) throw new Error('Failed to fetch building data');
      
      const data = await response.json();
      const buildingData: Building[] = data.elements
        .filter((element: any) => element.geometry)
        .map((element: any) => ({
          coordinates: element.geometry.map((coord: any) => [coord.lat, coord.lon]),
          properties: element.tags || {},
        }));
      
      setBuildings(buildingData);
      displayBuildings(buildingData);
      
      toast.success(`Found ${buildingData.length} buildings nearby`);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      toast.error('Failed to fetch building data');
    }
  };

  const calculateBoundingBox = (lat: number, lng: number, radiusMeters: number) => {
    const earthRadius = 6371000; // Earth's radius in meters
    const latDelta = (radiusMeters / earthRadius) * (180 / Math.PI);
    const lngDelta = (radiusMeters / earthRadius) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
    
    return {
      north: lat + latDelta,
      south: lat - latDelta,
      east: lng + lngDelta,
      west: lng - lngDelta,
    };
  };

  const displayBuildings = (buildingData: Building[]) => {
    if (!map.current) return;
    
    // Clear existing building polygons
    buildingPolygons.forEach(polygon => polygon.setMap(null));
    setBuildingPolygons([]);
    
    const newPolygons: google.maps.Polygon[] = [];
    
    buildingData.forEach((building) => {
      if (building.coordinates && building.coordinates.length > 2) {
        const path = building.coordinates.map(coord => ({
          lat: coord[0],
          lng: coord[1],
        }));
        
        const polygon = new google.maps.Polygon({
          paths: path,
          strokeColor: '#ef4444',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#ef4444',
          fillOpacity: 0.2,
          clickable: true,
        });
        
        polygon.setMap(map.current);
        
        // Add click listener to make building editable
        google.maps.event.addListener(polygon, 'click', () => {
          // Create editable copy
          const editablePolygon = new google.maps.Polygon({
            paths: path,
            strokeColor: '#1d4ed8',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#3b82f6',
            fillOpacity: 0.3,
            clickable: true,
            editable: true,
          });
          
          editablePolygon.setMap(map.current);
          setDrawnPolygons(prev => [...prev, editablePolygon]);
          
          // Add coordinates to state
          const coords = path.map(point => ({ lat: point.lat, lng: point.lng }));
          setCoordinates(prev => [...prev, ...coords]);
          
          toast.success('Building selected and made editable');
        });
        
        newPolygons.push(polygon);
      }
    });
    
    setBuildingPolygons(newPolygons);
  };

  const clearAll = () => {
    // Clear drawn polygons
    drawnPolygons.forEach(polygon => polygon.setMap(null));
    setDrawnPolygons([]);
    
    // Clear building polygons
    buildingPolygons.forEach(polygon => polygon.setMap(null));
    setBuildingPolygons([]);
    
    setCoordinates([]);
    setBuildings([]);
    toast.success('Map cleared');
  };

  const copyCoordinates = () => {
    if (coordinates.length === 0) {
      toast.error('No coordinates to copy');
      return;
    }
    
    const coordsText = coordinates
      .map(coord => `${coord.lat.toFixed(6)}, ${coord.lng.toFixed(6)}`)
      .join('\n');
    
    navigator.clipboard.writeText(coordsText);
    toast.success('Coordinates copied to clipboard');
  };

  const formatCoordinates = (coords: { lat: number; lng: number }[]) => {
    if (showRawCoords) {
      return coords.map(coord => `${coord.lat.toFixed(6)}, ${coord.lng.toFixed(6)}`).join('\n');
    }
    return `${coords.length} coordinate pairs`;
  };

  const toggleSatelliteView = () => {
    if (!map.current) return;
    
    const newSatelliteState = !isSatelliteView;
    setIsSatelliteView(newSatelliteState);
    
    const mapType = newSatelliteState 
      ? google.maps.MapTypeId.SATELLITE
      : google.maps.MapTypeId.ROADMAP;
    
    map.current.setMapTypeId(mapType);
    
    toast.success(`Switched to ${newSatelliteState ? 'satellite' : 'street'} view`);
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 bg-background border-r p-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Search */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Search Location
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter address or postcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                className="flex-1"
              />
              <Button 
                onClick={searchLocation} 
                disabled={isSearching}
                size="sm"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Map Controls */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Map View
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSatelliteView}
              className="w-full"
            >
              {isSatelliteView ? (
                <Globe className="h-4 w-4 mr-2" />
              ) : (
                <Layers className="h-4 w-4 mr-2" />
              )}
              {isSatelliteView ? 'Street View' : 'Satellite View'}
            </Button>
          </Card>

          {/* Drawing Instructions */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Drawing Tools</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Use the drawing tools above the map to create polygons, rectangles, or circles. Click on red building outlines to select and edit them.
            </p>
            <div className="space-y-2">
              <Button onClick={clearAll} variant="outline" size="sm" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </Card>

          {/* Coordinates Display */}
          {coordinates.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Coordinates</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRawCoords(!showRawCoords)}
                  >
                    {showRawCoords ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  </Button>
                  <Button onClick={copyCoordinates} variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm font-mono bg-muted p-3 rounded-md max-h-48 overflow-y-auto">
                {formatCoordinates(coordinates)}
              </div>
            </Card>
          )}

          {/* Buildings Info */}
          {buildings.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Buildings Found</h3>
              <p className="text-sm text-muted-foreground">
                {buildings.length} buildings in the area. Click on red outlines to select and edit them.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
};

export default Map;