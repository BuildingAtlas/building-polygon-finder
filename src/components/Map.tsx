import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { MapPin, Trash2, Copy, Search, ToggleLeft, ToggleRight, Globe, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface MapProps {
  mapboxToken: string;
}

const Map: React.FC<MapProps> = ({ mapboxToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  
  const [coordinates, setCoordinates] = useState<number[][]>([]);
  const [polygonWKT, setPolygonWKT] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showRawCoords, setShowRawCoords] = useState(false);
  const [isSatelliteView, setIsSatelliteView] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-2.5, 53.4], // UK center
      zoom: 6,
    });

    // Initialize draw control
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: 'draw_polygon',
    });

    map.current.addControl(draw.current, 'top-left');

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Listen for draw events
    map.current.on('draw.create', handleDrawCreate);
    map.current.on('draw.update', handleDrawUpdate);
    map.current.on('draw.delete', handleDrawDelete);

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Convert coordinates to WKT POLYGON format
  const coordinatesToWKT = (coords: number[][]): string => {
    if (coords.length === 0) return '';
    
    // Ensure the polygon is closed (first and last points are the same)
    const closedCoords = [...coords];
    if (closedCoords.length > 0 && 
        (closedCoords[0][0] !== closedCoords[closedCoords.length - 1][0] || 
         closedCoords[0][1] !== closedCoords[closedCoords.length - 1][1])) {
      closedCoords.push(closedCoords[0]);
    }
    
    // Format as WKT: POLYGON ((lng lat, lng lat, ...))
    const coordString = closedCoords
      .map(coord => `${coord[0]} ${coord[1]}`)
      .join(', ');
    
    return `POLYGON ((${coordString}))`;
  };

  // Update WKT when coordinates change
  useEffect(() => {
    if (coordinates.length > 0) {
      setPolygonWKT(coordinatesToWKT(coordinates));
    } else {
      setPolygonWKT('');
    }
  }, [coordinates]);

  const handleDrawCreate = (e: any) => {
    const coords = e.features[0].geometry.coordinates[0];
    setCoordinates(coords);
    toast.success('Polygon created successfully!');
  };

  const handleDrawUpdate = (e: any) => {
    const coords = e.features[0].geometry.coordinates[0];
    setCoordinates(coords);
    toast.success('Polygon updated!');
  };

  const handleDrawDelete = () => {
    setCoordinates([]);
    setPolygonWKT('');
    toast.success('Polygon deleted!');
  };

  const clearPolygons = () => {
    if (draw.current) {
      draw.current.deleteAll();
      setCoordinates([]);
      setPolygonWKT('');
      toast.success('All polygons cleared!');
    }
  };

  const copyCoordinates = () => {
    if (polygonWKT) {
      navigator.clipboard.writeText(polygonWKT);
      toast.success('WKT coordinates copied to clipboard!');
    } else if (coordinates.length > 0) {
      const coordString = JSON.stringify(coordinates, null, 2);
      navigator.clipboard.writeText(coordString);
      toast.success('Raw coordinates copied to clipboard!');
    }
  };

  const fetchBuildingsFromOSM = async (lat: number, lng: number, radius: number = 100) => {
    try {
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
      
      const data = await response.json();
      return data.elements || [];
    } catch (error) {
      console.error('Error fetching OSM building data:', error);
      return [];
    }
  };

  const addBuildingPolygons = (buildings: any[]) => {
    if (!map.current) return;

    // Remove existing building polygons
    if (map.current.getLayer('buildings')) {
      map.current.removeLayer('buildings');
    }
    if (map.current.getSource('buildings')) {
      map.current.removeSource('buildings');
    }

    const features = buildings
      .filter(building => building.type === 'way' && building.geometry)
      .map(building => ({
        type: 'Feature' as const,
        properties: {
          id: building.id,
          building: building.tags?.building || 'yes',
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [building.geometry.map((node: any) => [node.lon, node.lat]).concat([
            [building.geometry[0].lon, building.geometry[0].lat] // Close the polygon
          ])],
        },
      }));

    if (features.length > 0) {
      map.current.addSource('buildings', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features,
        },
      });

      map.current.addLayer({
        id: 'buildings',
        type: 'fill',
        source: 'buildings',
        paint: {
          'fill-color': '#ff6b6b',
          'fill-opacity': 0.3,
        },
      });

      map.current.addLayer({
        id: 'buildings-outline',
        type: 'line',
        source: 'buildings',
        paint: {
          'line-color': '#ff6b6b',
          'line-width': 2,
        },
      });

      // Add click event to select building polygons
      map.current.on('click', 'buildings', (e) => {
        if (e.features && e.features[0] && draw.current) {
          const feature = e.features[0];
          if (feature.geometry.type === 'Polygon') {
            // Clear existing polygons
            draw.current.deleteAll();
            
            // Add the clicked building as a drawn polygon
            const coords = feature.geometry.coordinates[0] as number[][];
            setCoordinates(coords);
            setPolygonWKT(coordinatesToWKT(coords));
            
            // Add to drawing layer
            draw.current.add({
              type: 'Feature',
              properties: {},
              geometry: feature.geometry,
            });
            
            toast.success('Building polygon selected!');
          }
        }
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'buildings', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'buildings', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });

      toast.success(`Found ${features.length} building(s) nearby`);
    } else {
      toast.info('No buildings found in this area');
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${mapboxToken}&country=GB&limit=1`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        
        if (map.current) {
          map.current.flyTo({
            center: [lng, lat],
            zoom: 18,
            duration: 2000,
          });
          
          // Add a marker for the search result
          new mapboxgl.Marker()
            .setLngLat([lng, lat])
            .addTo(map.current);
          
          toast.success(`Found: ${data.features[0].place_name}`);
          
          // Fetch and display nearby buildings from OSM
          const buildings = await fetchBuildingsFromOSM(lat, lng, 100);
          addBuildingPolygons(buildings);
        }
      } else {
        toast.error('Location not found');
      }
    } catch (error) {
      toast.error('Error searching for location');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };

  const toggleSatelliteView = () => {
    if (!map.current) return;
    
    const newSatelliteState = !isSatelliteView;
    setIsSatelliteView(newSatelliteState);
    
    const style = newSatelliteState 
      ? 'mapbox://styles/mapbox/satellite-streets-v12'
      : 'mapbox://styles/mapbox/streets-v12';
    
    map.current.setStyle(style);
    
    // Re-add building polygons after style change
    map.current.on('style.load', () => {
      if (map.current && map.current.getSource('buildings')) {
        // Style has loaded, buildings will need to be re-added
        // This is handled automatically by Mapbox when the source exists
      }
    });
    
    toast.success(`Switched to ${newSatelliteState ? 'satellite' : 'street'} view`);
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 bg-card border-r border-map-border p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Search Section */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Location
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter address, postcode, or UPRN"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
              <Button
                onClick={searchLocation}
                disabled={isSearching || !searchQuery.trim()}
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
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Drawing Tools
            </h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Click the polygon tool in the map to start drawing</p>
              <p>• Click points to create your polygon shape</p>
              <p>• Double-click or press Enter to finish</p>
              <p>• Use the trash tool to delete polygons</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearPolygons}
              className="mt-3 w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Polygons
            </Button>
          </Card>

          {/* Coordinates Display */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Polygon Coordinates</h3>
              <div className="flex items-center gap-2">
                {coordinates.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRawCoords(!showRawCoords)}
                  >
                    {showRawCoords ? (
                      <ToggleRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 mr-1" />
                    )}
                    {showRawCoords ? 'WKT' : 'Raw'}
                  </Button>
                )}
                {coordinates.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyCoordinates}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                )}
              </div>
            </div>
            {coordinates.length > 0 ? (
              <div className="bg-muted p-3 rounded-md max-h-96 overflow-y-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                  {showRawCoords ? JSON.stringify(coordinates, null, 2) : polygonWKT}
                </pre>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Draw a polygon on the map to see coordinates
              </p>
            )}
          </Card>

          {/* Coordinate Info */}
          {coordinates.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Polygon Info</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Points:</span> {coordinates.length}</p>
                <p><span className="font-medium">Format:</span> {showRawCoords ? '[longitude, latitude]' : 'WKT POLYGON'}</p>
                <p className="text-muted-foreground">
                  Coordinates are in WGS84 decimal degrees
                </p>
                {!showRawCoords && (
                  <p className="text-muted-foreground text-xs mt-2">
                    WKT format: longitude latitude pairs, comma-separated
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Map overlay info */}
        <div className="absolute top-4 left-4 bg-map-controls/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-map-border">
          <h1 className="font-semibold text-sm">Building Polygon Tool</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Draw polygons to capture building outlines
          </p>
        </div>
      </div>
    </div>
  );
};

export default Map;