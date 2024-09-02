import React, { useState, useEffect } from 'react';

const BoxForm = ({ onAddBox, onUpdateBox, onDeleteBox, initialBox }) => {
  const [box, setBox] = useState(initialBox || { boxNumber: '', type: '', frames: 10 });
  const isEditing = !!initialBox;

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
      onUpdateBox(box);
    } else {
      onAddBox(box);
      // Reset the form after submission only when adding a new box
      setBox({ boxNumber: '', type: '', frames: 10 });
    }
  };

  const handleDelete = () => {
    if (isEditing && window.confirm('Are you sure you want to delete this box?')) {
      onDeleteBox(box._id);
    }
  };

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
        >
          {isEditing ? 'Update Box' : 'Add Box'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Delete Box
          </button>
        )}
      </div>
    </form>
  );
};

export default BoxForm;