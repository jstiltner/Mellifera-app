import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../Button';
import { useAuthContext } from '../../context/AuthContext';
import { sanitizeInput } from '../../utils/validation.ts';

const saveHive = async (hiveData, token) => {
  console.log('saveHive called with:', hiveData, token);
  const url = hiveData._id ? `/api/hives/${hiveData._id}` : '/api/hives';
  const method = hiveData._id ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(hiveData),
  });

  if (!response.ok) {
    throw new Error(`Failed to ${hiveData._id ? 'update' : 'create'} hive`);
  }

  return response.json();
};

const HiveForm = ({ initialData, apiaries, onSubmit, onClose }) => {
  console.log('HiveForm rendered with props:', { initialData, apiaries, onSubmit, onClose });
  const { token } = useAuthContext();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    parent: '',
    queenId: '',
    status: '',
    notes: '',
    boxes: [],
    ...(initialData || {}),
  });

  const [newBox, setNewBox] = useState({ boxNumber: '', frames: 10 });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log('formData updated:', formData);
  }, [formData]);

  const mutation = useMutation({
    mutationFn: (hiveData) => saveHive(hiveData, token),
    onSuccess: (data) => {
      console.log('Mutation success:', data);
      queryClient.invalidateQueries({ queryKey: ['apiaries'] });
      queryClient.invalidateQueries({ queryKey: ['hives'] });
      if (onSubmit) {
        console.log('Calling onSubmit with:', data);
        onSubmit(data);
      }
      if (typeof onClose === 'function') {
        onClose(); // Close the modal only if onClose is a function
      } else {
        console.warn('onClose is not a function');
      }
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      console.error('Error stack:', error.stack);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    },
    onMutate: async (newHive) => {
      console.log('onMutate called with:', newHive);
      await queryClient.cancelQueries({ queryKey: ['hives'] });
      await queryClient.cancelQueries({ queryKey: ['apiaries'] });

      const previousHives = queryClient.getQueryData(['hives']) || [];
      const previousApiaries = queryClient.getQueryData(['apiaries']) || [];

      queryClient.setQueryData(['hives'], (old) => {
        console.log('Current hives data:', old);
        return Array.isArray(old) ? [...old, newHive] : [newHive];
      });

      queryClient.setQueryData(['apiaries'], (old) => {
        console.log('Current apiaries data:', old);
        return Array.isArray(old) 
          ? old.map((apiary) =>
              apiary._id === newHive.parent
                ? { ...apiary, children: [...(apiary.children || []), newHive] }
                : apiary
            )
          : [{ _id: newHive.parent, children: [newHive] }];
      });

      return { previousHives, previousApiaries };
    },
    onError: (err, newHive, context) => {
      console.error('Mutation error:', err);
      queryClient.setQueryData(['hives'], context.previousHives);
      queryClient.setQueryData(['apiaries'], context.previousApiaries);
    },
    onSettled: () => {
      console.log('Mutation settled');
      queryClient.invalidateQueries({ queryKey: ['hives'] });
      queryClient.invalidateQueries({ queryKey: ['apiaries'] });
    },
  });

  const validateForm = () => {
    console.log('validateForm called');
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.parent) newErrors.parent = "Apiary is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    console.log('handleChange called:', e.target.name, e.target.value);
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: sanitizeInput(value) });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
  };

  const handleBoxChange = (e) => {
    console.log('handleBoxChange called:', e.target.name, e.target.value);
    setNewBox({ ...newBox, [e.target.name]: sanitizeInput(e.target.value) });
  };

  const addBox = () => {
    console.log('addBox called');
    if (newBox.boxNumber && newBox.frames) {
      setFormData((prevData) => ({
        ...prevData,
        boxes: [...(prevData.boxes || []), newBox],
      }));
      setNewBox({ boxNumber: '', frames: 10 });
    }
  };

  const removeBox = (index) => {
    console.log('removeBox called with index:', index);
    setFormData((prevData) => ({
      ...prevData,
      boxes: (prevData.boxes || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    console.log('handleSubmit called');
    e.preventDefault();
    if (validateForm()) {
      const hiveData = {
        ...formData,
        boxes: formData.boxes.map((box) => ({
          ...box,
          boxNumber: parseInt(box.boxNumber),
          frames: parseInt(box.frames),
        })),
      };
      console.log('Submitting hiveData:', hiveData);
      mutation.mutate(hiveData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
            errors.name ? 'border-red-500' : ''
          }`}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="parent" className="block text-sm font-medium text-gray-700">
          Apiary:
        </label>
        <select
          id="parent"
          name="parent"
          value={formData.parent}
          onChange={handleChange}
          required
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
            errors.parent ? 'border-red-500' : ''
          }`}
        >
          <option value="">Select an apiary</option>
          {apiaries.map((apiary) => (
            <option key={apiary._id} value={apiary._id}>
              {apiary.name}
            </option>
          ))}
        </select>
        {errors.parent && <p className="text-red-500 text-xs mt-1">{errors.parent}</p>}
      </div>
      <div>
        <label htmlFor="queenId" className="block text-sm font-medium text-gray-700">
          Queen ID:
        </label>
        <input
          type="text"
          id="queenId"
          name="queenId"
          value={formData.queenId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status:
        </label>
        <input
          type="text"
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes:
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-700">Boxes</h3>
        {formData.boxes.map((box, index) => (
          <div key={index} className="flex items-center space-x-2 mt-2">
            <span>
              Box {box.boxNumber} - {box.frames} frames
            </span>
            <button type="button" onClick={() => removeBox(index)} className="text-red-600">
              Remove
            </button>
          </div>
        ))}
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="number"
            name="boxNumber"
            value={newBox.boxNumber}
            onChange={handleBoxChange}
            placeholder="Box Number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <input
            type="number"
            name="frames"
            value={newBox.frames}
            onChange={handleBoxChange}
            placeholder="Number of frames"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <button
            type="button"
            onClick={addBox}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Box
          </button>
        </div>
      </div>
      <Button type="submit" disabled={mutation.isLoading}>
        {mutation.isLoading ? 'Saving...' : formData._id ? 'Update' : 'Create'} Hive
      </Button>
      {mutation.isError && (
        <div className="text-red-600">Error saving hive: {mutation.error.message}</div>
      )}
    </form>
  );
};

export default HiveForm;
