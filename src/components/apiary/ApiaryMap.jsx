import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateHive } from '../../hooks/useHives';
import { useUpdateBox } from '../../hooks/useBoxes';
import ErrorMessage from '../common/ErrorMessage';

const ApiaryMap = ({ apiaries }) => {
  const queryClient = useQueryClient();
  const updateHiveMutation = useUpdateHive();
  const updateBoxMutation = useUpdateBox();
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(null);

  const handleHiveDragEnd = (event, hive) => {
    const { lat, lng } = event.target.getLatLng();
    const updatedHive = { ...hive, latitude: lat, longitude: lng };

    updateHiveMutation.mutate(updatedHive, {
      onSuccess: () => {
        queryClient.invalidateQueries(['apiaries']);
        queryClient.invalidateQueries(['hives']);
      },
      onMutate: async (newHive) => {
        await queryClient.cancelQueries(['apiaries']);
        const previousApiaries = queryClient.getQueryData(['apiaries']);
        queryClient.setQueryData(['apiaries'], (old) =>
          old.map((apiary) => ({
            ...apiary,
            hives: apiary.hives.map((h) => (h._id === newHive._id ? newHive : h)),
          }))
        );
        return { previousApiaries };
      },
      onError: (err, newHive, context) => {
        console.error('Error updating hive position:', err);
        queryClient.setQueryData(['apiaries'], context.previousApiaries);
      },
    });
  };

  const handleBoxDragEnd = (event, hive, box) => {
    const { lat, lng } = event.target.getLatLng();
    const updatedBox = { ...box, latitude: lat, longitude: lng };

    updateBoxMutation.mutate(updatedBox, {
      onSuccess: () => {
        queryClient.invalidateQueries(['apiaries']);
        queryClient.invalidateQueries(['hives']);
        queryClient.invalidateQueries(['boxes']);
      },
      onMutate: async (newBox) => {
        await queryClient.cancelQueries(['apiaries']);
        const previousApiaries = queryClient.getQueryData(['apiaries']);
        queryClient.setQueryData(['apiaries'], (old) =>
          old.map((apiary) => ({
            ...apiary,
            hives: apiary.hives.map((h) => 
              h._id === hive._id 
                ? { ...h, boxes: h.boxes.map((b) => b._id === newBox._id ? newBox : b) }
                : h
            ),
          }))
        );
        return { previousApiaries };
      },
      onError: (err, newBox, context) => {
        console.error('Error updating box position:', err);
        queryClient.setQueryData(['apiaries'], context.previousApiaries);
      },
    });
  };

  const mapStyle = {
    height: '100%',
    width: '100%',
    zIndex: 1,
  };

  const centerCoords = apiaries?.[0]
    ? [apiaries[0].latitude ?? 0, apiaries[0].longitude ?? 0]
    : [0, 0];

  const MapContent = () => {
    const map = useMap();
    
    useEffect(() => {
      if (map) {
        mapRef.current = map;
        try {
          map.invalidateSize();
        } catch (error) {
          console.error('Error invalidating map size:', error);
          setMapError('Error initializing map. Please try refreshing the page.');
        }
      }

      return () => {
        if (mapRef.current) {
          // Remove all event listeners
          mapRef.current.off();
          // Clear the map container
          mapRef.current.getContainer().innerHTML = '';
          // Clear the map reference
          mapRef.current = null;
        }
      };
    }, [map]);

    if (!Array.isArray(apiaries)) {
      console.error('Invalid apiaries data:', apiaries);
      return null;
    }

    return (
      <>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {apiaries.map((apiary) => {
          if (apiary.latitude == null || apiary.longitude == null) {
            console.warn('Invalid apiary coordinates:', apiary);
            return null;
          }
          return (
            <Marker key={apiary._id} position={[apiary.latitude, apiary.longitude]}>
              <Popup>
                <h3>{apiary.name}</h3>
              </Popup>
              {Array.isArray(apiary.hives) &&
                apiary.hives.map((hive) => {
                  if (hive.latitude == null || hive.longitude == null) {
                    console.warn('Invalid hive coordinates:', hive);
                    return null;
                  }
                  return (
                    <Marker
                      key={hive._id}
                      position={[hive.latitude, hive.longitude]}
                      draggable
                      eventHandlers={{
                        dragend: (e) => handleHiveDragEnd(e, hive),
                      }}
                    >
                      <Popup>
                        <h4>{hive.name}</h4>
                        {Array.isArray(hive.boxes) &&
                          hive.boxes.map((box) => {
                            if (box.latitude == null || box.longitude == null) {
                              console.warn('Invalid box coordinates:', box);
                              return null;
                            }
                            return (
                              <Marker
                                key={box._id}
                                position={[box.latitude, box.longitude]}
                                draggable
                                eventHandlers={{
                                  dragend: (e) => handleBoxDragEnd(e, hive, box),
                                }}
                              >
                                <Popup>
                                  <h5>Box {box.number}</h5>
                                </Popup>
                              </Marker>
                            );
                          })}
                      </Popup>
                    </Marker>
                  );
                })}
            </Marker>
          );
        })}
      </>
    );
  };

  if (mapError) {
    return <ErrorMessage message={mapError} />;
  }

  return (
    <div style={{ height: '300px', width: '100%', position: 'relative' }}>
      <MapContainer 
        key={apiaries?.length ? apiaries[0]._id : 'default'} 
        center={centerCoords} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={mapStyle}
      >
        <MapContent />
      </MapContainer>
    </div>
  );
};

export default ApiaryMap;
