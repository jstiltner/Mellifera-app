import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Button from '../components/common/Button';

const createApiary = async (newApiaryData) => {
  console.log('Creating apiary with data:', newApiaryData);
  const response = await axios.post('/api/apiaries', newApiaryData);
  console.log('Apiary created successfully:', response.data);
  return response.data;
};

const ApiaryForm = ({ onApiaryCreate }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const queryClient = useQueryClient();

  console.log('Rendering ApiaryForm component');

  const createApiaryMutation = useMutation({
    mutationFn: createApiary,
    onSuccess: (data) => {
      console.log('Mutation succeeded, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['apiaries'] });

      onApiaryCreate(data);
      setShowForm(false); // Hide the form after successful creation
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      console.error('Error stack:', error.stack);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    },
  });

  useEffect(() => {
    if (showForm) {
      getCurrentLocation();
    }
  }, [showForm]);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');

    // Check if all fields are filled
    if (!name || !location || !latitude || !longitude) {
      console.error('Please fill out all fields.');
      return;
    }

    const newApiaryData = {
      name,
      location,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    console.log('Attempting to create new apiary:', newApiaryData);

    try {
      // Call the mutation to create a new apiary
      createApiaryMutation.mutate(newApiaryData);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }

    // Clear the form after submission
    setName('');
    setLocation('');
    setLatitude('');
    setLongitude('');
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <div className="mb-4">
      <Button onClick={toggleForm}>{showForm ? 'Hide Apiary Form' : 'Create New Apiary'}</Button>
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Create a new apiary</h3>
          <div className="mb-2">
            <label className="block font-bold mb-1">Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-400 p-2 w-full"
              required
            />
          </div>
          <div className="mb-2">
            <label className="block font-bold mb-1">Location:</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border border-gray-400 p-2 w-full"
              required
            />
          </div>
          <div className="mb-2">
            <label className="block font-bold mb-1">Latitude:</label>
            <input
              type="number"
              value={latitude}
              className="border border-gray-400 p-2 w-full bg-gray-100"
              disabled
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-bold mb-1">Longitude:</label>
            <input
              type="number"
              value={longitude}
              className="border border-gray-400 p-2 w-full bg-gray-100"
              disabled
              required
            />
          </div>
          <div className="mb-4">
            <Button type="button" onClick={getCurrentLocation} disabled={isGettingLocation}>
              {isGettingLocation ? 'Getting Location...' : 'Get Current Location'}
            </Button>
          </div>
          <Button type="submit" disabled={createApiaryMutation.isPending || isGettingLocation}>
            {createApiaryMutation.isPending ? 'Creating...' : 'Create Apiary'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ApiaryForm;
