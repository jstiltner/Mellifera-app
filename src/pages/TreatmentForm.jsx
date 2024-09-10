import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addTreatment } from '../../api/hiveApi';
import { errorToast, successToast } from '../../utils/errorHandling';
import Button from '../Button';
import ErrorBoundary from '../ErrorBoundary';

const TreatmentForm = () => {
  const { id: hiveId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [treatmentData, setTreatmentData] = useState({
    type: '',
    dose: '',
    date: '',
    weatherConditions: '',
  });

  const addTreatmentMutation = useMutation({
    mutationFn: (data) => addTreatment(hiveId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['hive', hiveId]);
      successToast('Treatment added successfully');
      navigate(`/hives/${hiveId}`);
    },
    onError: (error) => errorToast(error, 'Error adding treatment'),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTreatmentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      addTreatmentMutation.mutate(treatmentData);
    }
  };

  const validateForm = () => {
    for (const key in treatmentData) {
      if (!treatmentData[key]) {
        errorToast(new Error(`${key} is required`));
        return false;
      }
    }
    return true;
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Add Treatment</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">
              Treatment Type
            </label>
            <input
              type="text"
              id="type"
              name="type"
              value={treatmentData.type}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="dose" className="block text-gray-700 text-sm font-bold mb-2">
              Dose
            </label>
            <input
              type="text"
              id="dose"
              name="dose"
              value={treatmentData.dose}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={treatmentData.date}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="weatherConditions" className="block text-gray-700 text-sm font-bold mb-2">
              Weather Conditions
            </label>
            <input
              type="text"
              id="weatherConditions"
              name="weatherConditions"
              value={treatmentData.weatherConditions}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={addTreatmentMutation.isLoading}
            >
              {addTreatmentMutation.isLoading ? 'Adding...' : 'Add Treatment'}
            </Button>
            <Button
              type="button"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => navigate(`/hives/${hiveId}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  );
};

export default TreatmentForm;