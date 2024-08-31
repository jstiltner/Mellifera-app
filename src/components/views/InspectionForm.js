import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreateInspection } from '../../hooks/useInspections';

const InspectionForm = () => {
  const { id: hiveId } = useParams();
  const navigate = useNavigate();

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

  const createInspection = useCreateInspection();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createInspection.mutate(
      { hiveId, inspectionData: formData },
      {
        onSuccess: () => {
          navigate(`/hives/${hiveId}`);
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">New Inspection for Hive {hiveId}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={createInspection.isLoading}
        >
          {createInspection.isLoading ? 'Submitting...' : 'Submit Inspection'}
        </button>
      </form>
    </div>
  );
};

export default InspectionForm;
