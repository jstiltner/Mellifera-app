import { useState } from 'react';
import { useTreatments } from '../../hooks/useTreatments';
import { Button, ErrorMessage, LoadingSpinner } from '../common';

const TreatmentView = ({ treatment, onClose }) => {
  const { updateTreatment, deleteTreatment } = useTreatments();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTreatment, setEditedTreatment] = useState(treatment);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTreatment((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await updateTreatment.mutateAsync({
        id: treatment._id,
        ...editedTreatment,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating treatment:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this treatment?')) {
      try {
        await deleteTreatment.mutateAsync(treatment._id);
        onClose();
      } catch (error) {
        console.error('Error deleting treatment:', error);
      }
    }
  };

  if (updateTreatment.isLoading || deleteTreatment.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Treatment Details</h2>
      {isEditing ? (
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <input
              type="text"
              name="type"
              value={editedTreatment.type}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Dose</label>
            <input
              type="text"
              name="dose"
              value={editedTreatment.dose}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={editedTreatment.date.split('T')[0]}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Weather Conditions</label>
            <input
              type="text"
              name="weatherConditions"
              value={editedTreatment.weatherConditions}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </form>
      ) : (
        <div>
          <p><strong>Type:</strong> {treatment.type}</p>
          <p><strong>Dose:</strong> {treatment.dose}</p>
          <p><strong>Date:</strong> {new Date(treatment.date).toLocaleDateString()}</p>
          <p><strong>Weather Conditions:</strong> {treatment.weatherConditions}</p>
        </div>
      )}
      {updateTreatment.isError && (
        <ErrorMessage message={updateTreatment.error.message} />
      )}
      {deleteTreatment.isError && (
        <ErrorMessage message={deleteTreatment.error.message} />
      )}
      <div className="mt-4 space-x-2">
        {isEditing ? (
          <>
            <Button onClick={handleUpdate}>Save</Button>
            <Button onClick={() => setIsEditing(false)} variant="secondary">Cancel</Button>
          </>
        ) : (
          <>
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
            <Button onClick={handleDelete} variant="danger">Delete</Button>
          </>
        )}
        <Button onClick={onClose} variant="secondary">Close</Button>
      </div>
    </div>
  );
};

export default TreatmentView;