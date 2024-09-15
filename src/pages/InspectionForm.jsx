import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage';
import { useCreateInspection, useUpdateInspection } from '../hooks/useInspections';
import InspectionAIFlow from '../components/hive/InspectionAIFlow';
import Button from '../components/common/Button';

const InspectionForm = ({ initialInspection }) => {
  const { hiveId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [useAIFlow, setUseAIFlow] = useState(false);

  const createInspectionMutation = useCreateInspection();
  const updateInspectionMutation = useUpdateInspection();

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
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!hiveId) {
      setError('Invalid hive ID. Please check the URL and try again.');
      return;
    }

    try {
      if (initialInspection) {
        await updateInspectionMutation.mutateAsync({
          hiveId,
          inspectionId: initialInspection._id,
          inspectionData: formData,
        });
      } else {
        await createInspectionMutation.mutateAsync({ hiveId, inspectionData: formData });
      }
      navigate(`/hives/${hiveId}`);
    } catch (error) {
      console.error('Failed to submit inspection:', error);
      setError(`Failed to submit inspection: ${error.message}`);
    }
  };

  const handleCancel = () => {
    navigate(`/hives/${hiveId}`);
  };

  const handleAIFlowComplete = (aiAnswers) => {
    setFormData((prevState) => ({
      ...prevState,
      overallHealth: aiAnswers.hiveCondition,
      queenSeen: aiAnswers.queenPresence === 'Yes',
      diseasesSeen: aiAnswers.pestSigns === 'Yes' ? 'Potential signs observed' : '',
      pestsSeen: aiAnswers.pestSigns === 'Yes' ? 'Potential signs observed' : '',
      hiveTemperament: aiAnswers.temperament,
      notes: `Brood Pattern: ${aiAnswers.broodPattern}, Honey Stores: ${aiAnswers.honeyStores}, Spacing Issues: ${aiAnswers.spacingIssues}, Forage Activity: ${aiAnswers.forageActivity}`,
    }));
    setUseAIFlow(false);
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const isSubmitting = createInspectionMutation.isPending || updateInspectionMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        {initialInspection ? 'Edit' : 'New'} Inspection for Hive {hiveId}
      </h2>
      <Button
        onClick={() => setUseAIFlow(!useAIFlow)}
        className="mb-4 bg-purple-500 hover:bg-purple-600 text-white"
      >
        {useAIFlow ? 'Switch to Manual Form' : 'Switch to AI-Assisted Flow'}
      </Button>
      {useAIFlow ? (
        <InspectionAIFlow onComplete={handleAIFlowComplete} />
      ) : (
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
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Submitting...'
                : `${initialInspection ? 'Update' : 'Submit'} Inspection`}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-black p-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default InspectionForm;
