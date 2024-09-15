import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const HiveMap = () => {
  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [draggedHive, setDraggedHive] = useState(null);

  useEffect(() => {
    // Fetch apiaries and hives from server
    const fetchData = async () => {
      try {
        const apiaryResponse = await axios.get('/api/apiaries');
        const hiveResponse = await axios.get('/api/hives');
        setApiaries(apiaryResponse.data);
        setHives(hiveResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleDragStart = (hive) => {
    setDraggedHive(hive);
  };

  const handleDragEnd = (event) => {
    const { lat, lng } = event.latlng;
    const updatedHive = { ...draggedHive, lat, lng };

    // Update hive position on the server
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

  return (
    <MapContainer center={[45.4215, -75.6972]} zoom={13} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {Array.isArray(apiaries) &&
        apiaries.map((apiary) => (
          <Marker key={apiary._id} position={[apiary.latitude, apiary.longitude]}>
            <Popup>
              <h3>{apiary.name}</h3>
              <p>
                Latitude: {apiary.latitude}, Longitude: {apiary.longitude}
              </p>
            </Popup>
          </Marker>
        ))}
      {Array.isArray(hives) &&
        hives.map((hive) => (
          <Marker
            key={hive._id}
            position={[hive.lat, hive.lng]}
            draggable
            onDragStart={() => handleDragStart(hive)}
            onDragEnd={handleDragEnd}
          >
            <Popup>
              <h3>{hive.name}</h3>
              <p>
                Latitude: {hive.lat}, Longitude: {hive.lng}
              </p>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default HiveMap;
