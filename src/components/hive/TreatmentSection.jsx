import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import Modal from '../common/Modal';
import TreatmentView from '../treatments/TreatmentView';
import { useTreatments } from '../../hooks/useTreatments';
import { errorToast, successToast } from '../../utils/errorHandling';
import LoadingSpinner from '../common/LoadingSpinner';

const TreatmentSection = ({ hiveId }) => {
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const { getTreatmentsByHive, updateTreatment, deleteTreatment } = useTreatments();

  const {
    data: treatments,
    isLoading: isTreatmentsLoading,
    isError: isTreatmentsError,
    error: treatmentsError,
  } = getTreatmentsByHive(hiveId);

  const handleUpdateTreatment = useCallback(
    async (updatedTreatment) => {
      try {
        await updateTreatment.mutateAsync(updatedTreatment);
        setSelectedTreatment(null);
        successToast('Treatment updated successfully');
      } catch (error) {
        errorToast(error, 'Error updating treatment');
      }
    },
    [updateTreatment]
  );

  const handleDeleteTreatment = useCallback(
    async (treatmentId) => {
      try {
        await deleteTreatment.mutateAsync(treatmentId);
        setSelectedTreatment(null);
        successToast('Treatment deleted successfully');
      } catch (error) {
        errorToast(error, 'Error deleting treatment');
      }
    },
    [deleteTreatment]
  );

  if (isTreatmentsLoading) {
    return <LoadingSpinner />;
  }

  if (isTreatmentsError) {
    return (
      <div className="text-red-500 text-center py-4">
        Error loading treatments: {treatmentsError.message}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-md shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-indigo-600">Treatment History</h2>
        <Link to={`/hives/${hiveId}/add-treatment`}>
          <Button
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            aria-label="Add new treatment"
          >
            Add Treatment
          </Button>
        </Link>
      </div>
      {Array.isArray(treatments) && treatments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {treatments.map((treatment) => (
            <div
              key={treatment._id}
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <h3 className="text-lg font-semibold mb-2 text-indigo-600">
                Treatment on {new Date(treatment.date).toLocaleDateString()}
              </h3>
              <p className="text-gray-600">
                <span className="font-medium">Type:</span> {treatment.type}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Dose:</span> {treatment.dose}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Weather:</span> {treatment.weatherConditions}
              </p>
              <Button
                className="mt-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold py-1 px-3 rounded text-sm transition duration-300 ease-in-out"
                onClick={() => setSelectedTreatment(treatment)}
              >
                View/Edit
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-4 text-gray-600">No treatments recorded.</p>
      )}
      <Modal isOpen={!!selectedTreatment} onClose={() => setSelectedTreatment(null)}>
        <TreatmentView
          treatment={selectedTreatment}
          onClose={() => setSelectedTreatment(null)}
          onUpdate={handleUpdateTreatment}
          onDelete={handleDeleteTreatment}
        />
      </Modal>
    </div>
  );
};

TreatmentSection.propTypes = {
  hiveId: PropTypes.string.isRequired,
};

export default TreatmentSection;
