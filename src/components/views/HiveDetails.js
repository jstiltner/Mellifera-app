import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../Button';
import AddBox from '../AddBox';
import Modal from '../Modal';
import { useHive, useAddBox } from '../../hooks/useHives';

const HiveDetail = ({ label, value }) => (
  <div className="mb-2">
    <span className="font-semibold">{label}:</span> {value?.toString()}
  </div>
);

const InspectionDetail = ({ inspection }) => (
  <div className="mb-4 p-4 bg-gray-100 rounded-lg">
    <h3 className="text-lg font-semibold mb-2">
      Inspection on {new Date(inspection.date).toLocaleDateString()}
    </h3>
    <p><strong>Overall Health:</strong> {inspection.overallHealth}</p>
    <p><strong>Queen Seen:</strong> {inspection.queenSeen ? 'Yes' : 'No'}</p>
    <p><strong>Diseases Seen:</strong> {inspection.diseasesSeen || 'None'}</p>
    <p><strong>Pests Seen:</strong> {inspection.pestsSeen || 'None'}</p>
    <p><strong>Hive Temperament:</strong> {inspection.hiveTemperament}</p>
    {inspection.notes && <p><strong>Notes:</strong> {inspection.notes}</p>}
  </div>
);

const HiveDetails = () => {
  const { id } = useParams();
  const [isAddBoxModalOpen, setIsAddBoxModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: hive,
    isLoading,
    isError,
    error,
  } = useHive(id);

  const addBoxMutation = useAddBox();

  if (isLoading) {
    return (
      <div className="text-center py-4" aria-live="polite">
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center py-4" aria-live="assertive">
        Error: {error.message || 'An error occurred while fetching data. Please try again later.'}
      </div>
    );
  }

  if (!hive) {
    return (
      <div className="text-center py-4" aria-live="assertive">
        No hive found
      </div>
    );
  }

  const handleAddBox = (boxData) => {
    addBoxMutation.mutate(
      { hiveId: id, boxData },
      {
        onSuccess: (newBox) => {
          queryClient.setQueryData(['hive', id], (oldData) => {
            return {
              ...oldData,
              children: [...(oldData.children || []), newBox],
            };
          });
          setIsAddBoxModalOpen(false);
        },
      }
    );
  };

  const boxCount = Array.isArray(hive.children) ? hive.children.length : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{hive.name}</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Hive Details</h2>
        <HiveDetail label="Type" value={hive.type} />
        <HiveDetail label="Status" value={hive.status} />
        <HiveDetail label="Queen Present" value={hive.queenPresent ? 'Yes' : 'No'} />
        <HiveDetail label="Box Count" value={boxCount} />
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">
          {boxCount === 0 ? 'No boxes' : boxCount === 1 ? '1 box' : `${boxCount} boxes`}
        </h2>
        {boxCount > 0 ? (
          <ul className="list-disc pl-5 mb-4">
            {hive.children.map((box, index) => (
              <li key={box._id || index} className="mb-1">
                Box {index + 1}: {box.type} ({box.frames} frames)
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4">No boxes added to this hive yet.</p>
        )}
        <Button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setIsAddBoxModalOpen(true)}
        >
          Add Box
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Inspections</h2>
        {Array.isArray(hive.inspections) && hive.inspections.length > 0 ? (
          <div>
            {hive.inspections.map((inspection, index) => (
              <InspectionDetail key={inspection._id || index} inspection={inspection} />
            ))}
          </div>
        ) : (
          <p className="mb-4">No recent inspections.</p>
        )}
        <Link to={`/hives/${id}/add-inspection`}>
          <Button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Add Inspection
          </Button>
        </Link>
      </div>

      <Modal isOpen={isAddBoxModalOpen} onClose={() => setIsAddBoxModalOpen(false)}>
        <AddBox hiveId={id} onSubmit={handleAddBox} onClose={() => setIsAddBoxModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default HiveDetails;
