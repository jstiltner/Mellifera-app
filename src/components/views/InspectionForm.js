import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ErrorMessage from '../ErrorMessage';

const InspectionForm = ({ initialInspection, onSubmit, onClose }) => {
  const { hiveId } = useParams();
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    overallHealth: '',
    queenSeen: false,
    queenCells: false,
    eggsSeen: false,
    larvaeSeen: false,
    capBrood: false,
    diseasesSeen: '',
    pestsSeen: '',
    hiveTemperament: '',
    weatherConditions: '',
    notes: '',
  });

  useEffect(() => {
    if (initialInspection) {
      setFormData(initialInspection);
    }
  }, [initialInspection]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!hiveId) {
      setError('Invalid hive ID. Please check the URL and try again.');
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to submit inspection:', error);
      setError(`Failed to submit inspection: ${error.message}`);
      
      // Handle offline submission
      if (!navigator.onLine) {
        const offlineInspection = { ...formData, isOffline: true, offlineAction: initialInspection ? 'update' : 'create' };
        localStorage.setItem(`inspection_${hiveId}_${initialInspection ? initialInspection._id : 'new'}`, JSON.stringify(offlineInspection));
        alert('Inspection saved offline. It will be synced when you are back online.');
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        {initialInspection ? 'Edit' : 'New'} Inspection for Hive {hiveId}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date input */}
        <div>
          <label className="block mb-1">Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Overall Health select */}
        <div>
          <label className="block mb-1">Overall Health:</label>
          <select
            name="overallHealth"
            value={formData.overallHealth}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select health status</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Checkbox group */}
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="queenSeen"
              checked={formData.queenSeen}
              onChange={handleChange}
              className="mr-2"
            />
            Queen Seen
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="queenCells"
              checked={formData.queenCells}
              onChange={handleChange}
              className="mr-2"
            />
            Queen Cells Present
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="eggsSeen"
              checked={formData.eggsSeen}
              onChange={handleChange}
              className="mr-2"
            />
            Eggs Seen
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="larvaeSeen"
              checked={formData.larvaeSeen}
              onChange={handleChange}
              className="mr-2"
            />
            Larvae Seen
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="capBrood"
              checked={formData.capBrood}
              onChange={handleChange}
              className="mr-2"
            />
            Capped Brood Present
          </label>
        </div>

        {/* Diseases Seen input */}
        <div>
          <label className="block mb-1">Diseases Seen:</label>
          <input
            type="text"
            name="diseasesSeen"
            value={formData.diseasesSeen}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="e.g., Varroa, Nosema, etc."
          />
        </div>

        {/* Pests Seen input */}
        <div>
          <label className="block mb-1">Pests Seen:</label>
          <input
            type="text"
            name="pestsSeen"
            value={formData.pestsSeen}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="e.g., Wax moths, Small hive beetles, etc."
          />
        </div>

        {/* Hive Temperament select */}
        <div>
          <label className="block mb-1">Hive Temperament:</label>
          <select
            name="hiveTemperament"
            value={formData.hiveTemperament}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select temperament</option>
            <option value="Calm">Calm</option>
            <option value="Nervous">Nervous</option>
            <option value="Aggressive">Aggressive</option>
          </select>
        </div>

        {/* Weather Conditions input */}
        <div>
          <label className="block mb-1">Weather Conditions:</label>
          <input
            type="text"
            name="weatherConditions"
            value={formData.weatherConditions}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="e.g., Sunny, 75°F, light breeze"
          />
        </div>

        {/* Notes textarea */}
        <div>
          <label className="block mb-1">Notes:</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="4"
            placeholder="Any additional observations or actions taken"
          ></textarea>
        </div>

        {/* Submit button */}
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : `${initialInspection ? 'Update' : 'Submit'} Inspection`}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-black p-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default InspectionForm;
