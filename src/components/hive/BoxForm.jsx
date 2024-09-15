import { useState, useEffect } from 'react';
import { useCreateBox, useUpdateBox, useDeleteBox } from '../../hooks/useBoxes';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const BoxForm = ({ initialBox, onSuccess, closeModal }) => {
  const [box, setBox] = useState(initialBox || { boxNumber: '', type: '', frames: 10 });
  const isEditing = !!initialBox;

  const createBox = useCreateBox();
  const updateBox = useUpdateBox();
  const deleteBox = useDeleteBox();

  useEffect(() => {
    if (initialBox) {
      setBox(initialBox);
    }
  }, [initialBox]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBox((prevBox) => ({
      ...prevBox,
      [name]: name === 'frames' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      console.log('Attempting to update box:', box);
      if (!box._id) {
        console.error('Box ID is missing for update operation');
        return;
      }
      updateBox.mutate(
        { id: box._id, boxData: box },
        {
          onSuccess: (data) => {
            console.log('Box updated successfully:', data);
            if (onSuccess) onSuccess(data);
            if (closeModal) closeModal();
          },
          onError: (error) => {
            console.error('Error updating box:', error);
          },
        }
      );
    } else {
      console.log('Attempting to create box:', box);
      createBox.mutate(box, {
        onSuccess: (data) => {
          console.log('Box created successfully:', data);
          setBox({ boxNumber: '', type: '', frames: 10 });
          if (onSuccess) onSuccess(data);
          if (closeModal) closeModal();
        },
        onError: (error) => {
          console.error('Error creating box:', error);
        },
      });
    }
  };

  const handleDelete = () => {
    if (isEditing && window.confirm('Are you sure you want to delete this box?')) {
      console.log('Attempting to delete box:', box._id);
      deleteBox.mutate(box._id, {
        onSuccess: () => {
          console.log('Box deleted successfully');
          if (onSuccess) onSuccess();
          if (closeModal) closeModal();
        },
        onError: (error) => {
          console.error('Error deleting box:', error);
        },
      });
    }
  };

  if (createBox.isLoading || updateBox.isLoading || deleteBox.isLoading) {
    return <LoadingSpinner />;
  }

  if (createBox.isError || updateBox.isError || deleteBox.isError) {
    return <ErrorMessage message="An error occurred. Please try again." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="boxNumber" className="block text-sm font-medium text-gray-700">
          Box Number:
        </label>
        <input
          type="text"
          id="boxNumber"
          name="boxNumber"
          value={box.boxNumber}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Box Type:
        </label>
        <select
          id="type"
          name="type"
          value={box.type}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="">Select Box Type</option>
          <option value="brood">Brood</option>
          <option value="honey">Honey</option>
        </select>
      </div>
      <div>
        <label htmlFor="frames" className="block text-sm font-medium text-gray-700">
          Number of Frames:
        </label>
        <input
          type="number"
          id="frames"
          name="frames"
          value={box.frames}
          onChange={handleChange}
          required
          min="1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div className="flex justify-between">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          disabled={createBox.isLoading || updateBox.isLoading}
        >
          {isEditing ? 'Update Box' : 'Add Box'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            disabled={deleteBox.isLoading}
          >
            Delete Box
          </button>
        )}
      </div>
    </form>
  );
};

export default BoxForm;
