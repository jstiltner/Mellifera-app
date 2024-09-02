import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection, useUpdateInspection, useDeleteInspection } from '../../hooks/useInspections';
import Button from '../Button';
import InspectionForm from './InspectionForm';
import Modal from '../Modal';

const InspectionReview = () => {
  const { hiveId, inspectionId } = useParams();
  const navigate = useNavigate();
  const { data: inspection, isLoading, isError } = useInspection(hiveId, inspectionId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const updateInspection = useUpdateInspection();
  const deleteInspection = useDeleteInspection();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading inspection</div>;
  if (!inspection) return <div>No inspection found</div>;

  const handleUpdate = (updatedInspection) => {
    updateInspection.mutate(
      { hiveId, inspectionId, inspectionData: updatedInspection },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
        },
      }
    );
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this inspection?')) {
      deleteInspection.mutate(
        { hiveId, inspectionId },
        {
          onSuccess: () => {
            navigate(`/hives/${hiveId}`);
          },
        }
      );
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Inspection Review</h1>
      <div className="flex space-x-2 mb-4">
        <Button onClick={() => navigate(`/hives/${hiveId}`)}>
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
          if (key === '_id' || key === '__v' || key === 'hive') return null;
          
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
          onClose={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default InspectionReview;