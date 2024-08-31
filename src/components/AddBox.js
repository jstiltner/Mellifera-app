import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../context/AuthContext';
import BoxCreationForm from './BoxCreationForm';

const AddBox = ({ hiveId, onClose }) => {
  const queryClient = useQueryClient();
  const { token } = useAuthContext();

  const addBoxMutation = useMutation({
    mutationFn: async (newBoxes) => {
      const response = await fetch(`/api/boxes/${hiveId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBoxes),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hive', hiveId] });
      onClose();
    },
    onError: (error) => {
      console.error('Error in the mutation:', error);
    },
  });

  const handleAddBox = (newBox) => {
    addBoxMutation.mutate([
      {
        ...newBox,
        frameCount: newBox.frames, // Ensure the property name matches the server expectation
      },
    ]);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Add Box</h2>
      <BoxCreationForm onAddBox={handleAddBox} />
    </div>
  );
};

export default AddBox;
