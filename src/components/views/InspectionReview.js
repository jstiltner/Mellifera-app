import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection, useUpdateInspection, useDeleteInspection } from '../../hooks/useInspections';
import Button from '../Button';
import InspectionForm from './InspectionForm';
import Modal from '../Modal';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

const InspectionReview = () => {
  const { inspectionId } = useParams();
  const navigate = useNavigate();
  const { data: inspection, isLoading, isError, error } = useInspection(inspectionId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const updateInspection = useUpdateInspection();
  const deleteInspection = useDeleteInspection();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error.message || 'Error loading inspection'} />;
  if (!inspection) return <ErrorMessage message="No inspection found" />;

  const handleUpdate = (updatedInspection) => {
    updateInspection.mutate(
      { inspectionId, inspectionData: updatedInspection },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setSuccessMessage('Inspection updated successfully');
          setTimeout(() => setSuccessMessage(''), 3000);
        },
        onError: (error) => {
          console.error('Failed to update inspection:', error);
          // Handle offline update
          if (!navigator.onLine) {
            // Update local storage
            const offlineInspection = { ...updatedInspection, isOffline: true, offlineAction: 'update' };
            localStorage.setItem(`inspection_${inspectionId}`, JSON.stringify(offlineInspection));
            setSuccessMessage('Inspection updated offline. It will be synced when you are back online.');
            setTimeout(() => setSuccessMessage(''), 3000);
          }
        },
      }
    );
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this inspection?')) {
      deleteInspection.mutate(
        { inspectionId },
        {
          onSuccess: () => {
            // navigate(`/hives/${hiveId}`);
          },
          onError: (error) => {
            console.error('Failed to delete inspection:', error);
            // Handle offline delete
            if (!navigator.onLine) {
              // Mark for deletion in local storage
              const offlineInspection = { ...inspection, isOffline: true, offlineAction: 'delete' };
              localorage.setItem(`inspection_${inspectionId}`, JSON.stringify(offlineInspection));
              setSuccessMessage('Inspection marked for deletion offline. It will be removed when you are back online.');
              setTimeout(() => setSuccessMessage(''), 3000);
            }
          },
        }
      );
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Inspection Review</h1>
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      <div className="flex space-x-2 mb-4">
        <Button onClick={() => navigate(`/hives/`)}>
          Back to Hive Details
        </Button>
        <Button onClick={() => setIsEditModalOpen(true)}>
          Edit Inspection
        </Button>
        <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
          Delete Inspection
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(inspection).map(([key, value]) => {
          if (key === '_id' || key === '__v' || key === 'hive' || key === 'isOffline' || key === 'offlineAction') return null;
          
          return (
            <div key={key} className="border p-4 rounded">
              <h2 className="font-semibold mb-2">{key}</h2>
              <p>{String(value)}</p>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <InspectionForm
          initialInspection={inspection}
          onSubmit={handleUpdate}
          onClose={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default InspectionReview;