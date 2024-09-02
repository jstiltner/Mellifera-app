import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const fetchApiaries = async () => {
  const response = await axios.get('/api/apiaries');
  console.log('Fetched apiaries:', response.data); // Debug log
  return response.data;
};

const ApiaryMap = () => {
  const [draggedHive, setDraggedHive] = useState(null);
  const [draggedBox, setDraggedBox] = useState(null);

  const {
    data: apiaries,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['apiaries'],
    queryFn: fetchApiaries,
  });

  useEffect(() => {
    console.log('Apiaries data:', apiaries); // Debug log
  }, [apiaries]);

  const handleHiveDragStart = (hive) => {
    setDraggedHive(hive);
  };

  const handleHiveDragEnd = (event) => {
    const { lat, lng } = event.target.getLatLng();
    const updatedHive = { ...draggedHive, latitude: lat, longitude: lng };

    axios
      .put(`/api/hives/${draggedHive._id}`, updatedHive)
      .then((response) => {
        console.log('Hive position updated:', response.data);
        setDraggedHive(null);
      })
      .catch((error) => {
        console.error('Error updating hive position:', error);
      });
  };

  const handleBoxDragStart = (hive, box) => {
    setDraggedBox({ hive, box });
  };

  const handleBoxDragEnd = (event) => {
    const { lat, lng } = event.target.getLatLng();
    const updatedBox = { ...draggedBox.box, latitude: lat, longitude: lng };

    axios
      .put(`/api/boxes/${draggedBox.box._id}`, updatedBox)
      .then((response) => {
        console.log('Box position updated:', response.data);
        setDraggedBox(null);
      })
      .catch((error) => {
        console.error('Error updating box position:', error);
      });
  };

  const mapStyle = {
    height: '100%',
    width: '100%',
    zIndex: 1,
  };

  if (isLoading) return <div>Loading map...</div>;
  if (error) return <div>Error loading map: {error.message}</div>;

  const centerCoords = apiaries?.[0]
    ? [apiaries[0].latitude ?? 0, apiaries[0].longitude ?? 0]
    : [0, 0];

  return (
    <div style={{ height: '300px', width: '100%', position: 'relative' }}>
      <MapContainer center={centerCoords} zoom={13} scrollWheelZoom={false} style={mapStyle}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {Array.isArray(apiaries) &&
          apiaries.map((apiary) => {
            if (apiary.latitude == null || apiary.longitude == null) return null;
            return (
              <Marker key={apiary._id} position={[apiary.latitude, apiary.longitude]}>
                <Popup>
                  <h3>{apiary.name}</h3>
                </Popup>
                {Array.isArray(apiary.hives) &&
                  apiary.hives.map((hive) => {
                    if (hive.latitude == null || hive.longitude == null) return null;
                    return (
                      <Marker
                        key={hive._id}
                        position={[hive.latitude, hive.longitude]}
                        draggable
                        onDragStart={() => handleHiveDragStart(hive)}
                        onDragEnd={handleHiveDragEnd}
                      >
                        <Popup>
                          <h4>{hive.name}</h4>
                          {Array.isArray(hive.boxes) &&
                            hive.boxes.map((box) => {
                              if (box.latitude == null || box.longitude == null) return null;
                              return (
                                <Marker
                                  key={box._id}
                                  position={[box.latitude, box.longitude]}
                                  draggable
                                  onDragStart={() => handleBoxDragStart(hive, box)}
                                  onDragEnd={handleBoxDragEnd}
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
      </MapContainer>
    </div>
  );
};

export default ApiaryMap;
