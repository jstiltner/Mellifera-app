import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addFeeding } from '../../api/hiveApi';
import Button from '../common/Button';
import { errorToast, successToast } from '../../utils/errorHandling';

const FeedingForm = ({ hiveId, onClose, onFeedingAdded }) => {
  const [feedingData, setFeedingData] = useState({
    type: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const queryClient = useQueryClient();

  const addFeedingMutation = useMutation({
    mutationFn: (newFeeding) => addFeeding(hiveId, newFeeding),
    onSuccess: () => {
      queryClient.invalidateQueries(['hive', hiveId]);
      successToast('Feeding added successfully');
      onFeedingAdded();
      onClose();
    },
    onError: (error) => errorToast(error, 'Error adding feeding'),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addFeedingMutation.mutate(feedingData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Feeding Type
        </label>
        <select
          id="type"
          name="type"
          value={feedingData.type}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="">Select a type</option>
          <option value="sugar_water">Sugar Water</option>
          <option value="pollen_patty">Pollen Patty</option>
          <option value="honey">Honey</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <input
          type="text"
          id="amount"
          name="amount"
          value={feedingData.amount}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="e.g., 1 liter, 500g"
        />
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={feedingData.date}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={feedingData.notes}
          onChange={handleInputChange}
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        ></textarea>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400">
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
          Add Feeding
        </Button>
      </div>
    </form>
  );
};

export default FeedingForm;