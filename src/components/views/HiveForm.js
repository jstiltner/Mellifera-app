import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../Button';
import { useAuthContext } from '../../context/AuthContext';
import { sanitizeInput } from '../../utils/validation.ts';
import { useCreateHive, useUpdateHive } from '../../hooks/useHives';
import { useCreateBox } from '../../hooks/useBoxes';

const HiveForm = ({ initialData, apiaryId, onClose }) => {
  const { token } = useAuthContext();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    queenId: '',
    status: '',
    notes: '',
    children: [],
    ...(initialData || {}),
  });

  const [newBox, setNewBox] = useState({ boxNumber: '', type: '', frames: 10 });
  const [errors, setErrors] = useState({});

  const createHiveMutation = useCreateHive();
  const updateHiveMutation = useUpdateHive();
  const createBoxMutation = useCreateBox();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.children.length === 0) newErrors.children = "At least one box is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
  };

  const handleBoxChange = (e) => {
    const { name, value } = e.target;
    setNewBox((prev) => ({
      ...prev,
      [name]: name === 'frames' ? parseInt(value, 10) : sanitizeInput(value),
    }));
  };

  const addBox = () => {
    if (newBox.boxNumber && newBox.type) {
      setFormData((prevData) => ({
        ...prevData,
        children: [...prevData.children, newBox],
      }));
      setNewBox({ boxNumber: '', type: '', frames: 10 });
      setErrors((prevErrors) => ({ ...prevErrors, children: null }));
    }
  };

  const removeBox = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      children: prevData.children.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Create Box documents first
        const boxPromises = formData.children.map(box => 
          createBoxMutation.mutateAsync({
            boxNumber: parseInt(box.boxNumber),
            type: box.type,
            frames: parseInt(box.frames),
          })
        );
        const createdBoxes = await Promise.all(boxPromises);

        // Prepare hive data with box ObjectIds
        const hiveData = {
          ...formData,
          children: createdBoxes.map(box => box._id),
        };

        const mutationFn = formData._id ? updateHiveMutation : createHiveMutation;
        
        await mutationFn.mutateAsync(
          formData._id ? { hiveId: formData._id, hiveData } : { apiaryId, hiveData },
          {
            onSuccess: () => {
              onClose();
            },
          }
        );
      } catch (error) {
        console.error('Error saving hive:', error);
        setErrors((prevErrors) => ({ ...prevErrors, submit: error.message }));
      }
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
        {formData.children.map((box, index) => (
          <div key={index} className="flex items-center space-x-2 mt-2">
            <span>
              Box {box.boxNumber} - Type: {box.type} - {box.frames} frames
            </span>
            <button type="button" onClick={() => removeBox(index)} className="text-red-600">
              Remove
            </button>
          </div>
        ))}
        <div className="space-y-2 mt-2">
          <input
            type="text"
            name="boxNumber"
            value={newBox.boxNumber}
            onChange={handleBoxChange}
            placeholder="Box Number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <select
            name="type"
            value={newBox.type}
            onChange={handleBoxChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">Select Box Type</option>
            <option value="brood">Brood</option>
            <option value="honey">Honey</option>
          </select>
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
        {errors.children && <p className="text-red-500 text-xs mt-1">{errors.children}</p>}
      </div>
      <div className="flex justify-between">
        <Button type="submit" disabled={createHiveMutation.isLoading || updateHiveMutation.isLoading}>
          {(createHiveMutation.isLoading || updateHiveMutation.isLoading) ? 'Saving...' : formData._id ? 'Update' : 'Create'} Hive
        </Button>
        <Button type="button" onClick={onClose} className="bg-gray-300 text-gray-700">
          Cancel
        </Button>
      </div>
      {errors.submit && (
        <div className="text-red-600">Error saving hive: {errors.submit}</div>
      )}
    </form>
  );
};

export default HiveForm;
