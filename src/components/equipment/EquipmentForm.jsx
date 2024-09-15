import { useState, useEffect } from 'react';
import { useEquipment } from '../../hooks/useEquipment';
import { Button } from '../common';

const EquipmentForm = ({ equipment, onClose }) => {
  const { addEquipment, updateEquipment } = useEquipment();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    quantity: 1,
    condition: 'Good',
    lastUsed: '',
    notes: '',
  });

  useEffect(() => {
    if (equipment) {
      setFormData({
        ...equipment,
        lastUsed: equipment.lastUsed
          ? new Date(equipment.lastUsed).toISOString().split('T')[0]
          : '',
      });
    }
  }, [equipment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const equipmentData = {
      ...formData,
      quantity: parseInt(formData.quantity, 10),
      lastUsed: formData.lastUsed ? new Date(formData.lastUsed).toISOString() : null,
    };

    if (equipment) {
      updateEquipment(equipmentData);
    } else {
      addEquipment(equipmentData);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
          Type
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="type"
          type="text"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
          Quantity
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="quantity"
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="0"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="condition">
          Condition
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="condition"
          name="condition"
          value={formData.condition}
          onChange={handleChange}
          required
        >
          <option value="New">New</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
          <option value="Poor">Poor</option>
          <option value="Needs Replacement">Needs Replacement</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastUsed">
          Last Used
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="lastUsed"
          type="date"
          name="lastUsed"
          value={formData.lastUsed}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
          Notes
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
        ></textarea>
      </div>
      <div className="flex items-center justify-between">
        <Button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {equipment ? 'Update' : 'Add'} Equipment
        </Button>
        <Button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EquipmentForm;
