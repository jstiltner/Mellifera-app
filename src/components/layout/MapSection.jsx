// src/components/layout/MapSection.jsx
import { useState } from 'react';
import ApiaryMap from '../apiary/ApiaryMap';
import ErrorMessage from '../common/ErrorMessage';

const MapSection = ({ apiaries }) => {
  const [mapError, setMapError] = useState(null);

  const renderMap = () => {
    try {
      return <ApiaryMap apiaries={apiaries || []} />;
    } catch (error) {
      console.error('Error rendering ApiaryMap:', error);
      setMapError('Failed to load the map. Please try refreshing the page.');
      return null;
    }
  };

  return (
    <div className="lg:col-span-3 flex flex-col min-h-[400px]">
      <div className="bg-white rounded-lg shadow-md p-4 flex-grow">
        <div className="h-full w-full">
          {mapError ? <ErrorMessage message={mapError} /> : renderMap()}
        </div>
      </div>
    </div>
  );
};

export default MapSection;